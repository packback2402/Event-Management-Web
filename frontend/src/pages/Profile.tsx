import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, IdCard, Save, Loader2, ArrowLeft, LogOut, Key, Camera } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';
import { useToast } from '@/hooks/useToast';

interface UserData {
    id: string;
    full_name: string;
    email: string;
    roll_number?: string;
    role: string;
    avatar?: string;
}

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [user, setUser] = useState<UserData | null>(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    
    const [profileData, setProfileData] = useState({
        fullName: '',
        email: '',
        rollNumber: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Check authentication and load user data
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }

        try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            // Pre-fill profile data from localStorage immediately
            setProfileData({
                fullName: userData.full_name || '',
                email: userData.email || '',
                rollNumber: userData.roll_number || '',
            });
            setIsLoading(false);
        } catch (error) {
            console.error('Error parsing user data:', error);
            navigate('/login');
        }
    }, [navigate]);


    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData((prev) => ({ ...prev, [name]: value }));
        setError(null);
        setSuccessMessage(null);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
        setError(null);
        setSuccessMessage(null);
    };

    const validateProfileForm = () => {
        setError(null);

        // Name validation - allow letters and spaces (Unicode support)
        if (profileData.fullName && !/^[\p{L}\s]+$/u.test(profileData.fullName)) {
            setError('Full name should contain letters only');
            return false;
        }

        // Student/Employee ID validation - alphanumeric only (no special chars)
        if (profileData.rollNumber && !/^[a-zA-Z0-9]+$/.test(profileData.rollNumber)) {
            setError('Student/Employee ID should contain letters and numbers only');
            return false;
        }

        return true;
    };

    const validatePasswordForm = () => {
        setError(null);

        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setError('All password fields are required');
            return false;
        }

        if (passwordData.newPassword.length < 6) {
            setError('New password must be at least 6 characters long');
            return false;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            return false;
        }

        return true;
    };

    const saveProfile = async () => {
        if (!validateProfileForm()) {
            return;
        }

        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            if (!user) return;

            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to update profile');
                navigate('/login');
                return;
            }

            // API call to update profile
            const response = await apiClient.put(
                API_ENDPOINTS.AUTH.PROFILE,
                {
                    full_name: profileData.fullName,
                    roll_number: profileData.rollNumber || null,
                }
            );

            if (response.data.success) {
                // Update local storage with new data
                const updatedUser = {
                    ...user,
                    full_name: profileData.fullName,
                    roll_number: profileData.rollNumber,
                };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                // Trigger storage event for navbar to update
                window.dispatchEvent(new Event('storage'));

                setSuccessMessage('Profile updated successfully!');
                setTimeout(() => setSuccessMessage(null), 3000);
            }
        } catch (error: any) {
            console.error('Error updating profile:', error);
            const errorMessage = error.response?.data?.message || 
                                error.response?.data?.error || 
                                'An error occurred while updating your profile';
            setError(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const changePassword = async () => {
        if (!validatePasswordForm()) {
            return;
        }

        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            if (!user) return;

            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to change password');
                navigate('/login');
                return;
            }

            // API call to change password
            const response = await apiClient.put(
                API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
                {
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }
            );

            if (response.data.message === "Password changed successfully") {
                // Reset password form
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });

                setSuccessMessage('Password changed successfully!');
                setTimeout(() => setSuccessMessage(null), 3000);
            }
        } catch (error: any) {
            console.error('Error changing password:', error);
            const errorMessage = error.response?.data?.message || 
                                error.response?.data?.error || 
                                'An error occurred while changing your password';
            setError(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        setShowLogoutConfirm(false);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        toast.success('Logged out successfully!');
        setTimeout(() => {
            navigate('/login');
        }, 1000);
    };

    // Hàm upload avatar
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        setUploadingAvatar(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await apiClient.post(
                API_ENDPOINTS.AUTH.UPLOAD_AVATAR,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.message) {
                // Update state và localStorage
                const updatedUser = response.data.data.user;
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setSuccessMessage('Avatar updated successfully!');
                setTimeout(() => setSuccessMessage(null), 3000);
            }
        } catch (err: any) {
            console.error('Error uploading avatar:', err);
            setError(err.response?.data?.message || 'Failed to upload avatar');
        } finally {
            setUploadingAvatar(false);
        }
    };

    if (!user) {
        return null; // Will redirect to login in useEffect
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <toast.ToastComponent />
            
            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Log Out?</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to log out of your account?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition"
                            >
                                Yes, Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <main className="container mx-auto p-4 sm:p-6 lg:p-8 grow">
                
                {/* Page Header */}
                <div className="mb-6">
                    <Link to="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mt-2">
                        My Profile
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Avatar & Basic Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 flex flex-col items-center">
                            
                            {/* Avatar */}
                            <div className="relative mb-4">
                                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-16 h-16 text-gray-500" />
                                    )}
                                </div>
                                
                                {/* Upload button */}
                                <label 
                                    htmlFor="avatar-upload" 
                                    className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full cursor-pointer hover:bg-orange-600 transition shadow-lg"
                                >
                                    {uploadingAvatar ? (
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <Camera className="w-5 h-5" />
                                    )}
                                </label>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                />
                            </div>
                            
                            {/* Name and Role */}
                            <h2 className="text-2xl font-bold text-gray-900 text-center">{user.full_name}</h2>
                            <p className="text-sm text-gray-500 mb-2">
                                {user.role === 'admin' ? 'Administrator' : 'Student'}
                            </p>
                            {user.roll_number && (
                                <p className="text-sm text-gray-600 mb-6 font-mono">{user.roll_number}</p>
                            )}

                            {/* Logout Button */}
                            <button
                                onClick={() => setShowLogoutConfirm(true)}
                                className="w-full px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition flex items-center justify-center"
                            >
                                <LogOut className="w-4 h-4 mr-2" /> 
                                Log Out
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Tabs with Forms */}
                    <div className="lg:col-span-2">
                        
                        {/* Custom Tabs */}
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                            
                            {/* Tab Buttons */}
                            <div className="flex border-b border-gray-200">
                                <button
                                    onClick={() => {
                                        setActiveTab('profile');
                                        setError(null);
                                        setSuccessMessage(null);
                                    }}
                                    className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                                        activeTab === 'profile'
                                            ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    Profile Information
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab('password');
                                        setError(null);
                                        setSuccessMessage(null);
                                    }}
                                    className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                                        activeTab === 'password'
                                            ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    Change Password
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                
                                {/* Success Message */}
                                {successMessage && (
                                    <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start gap-2">
                                        <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm">{successMessage}</span>
                                    </div>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2">
                                        <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm">{error}</span>
                                    </div>
                                )}

                                {/* Profile Tab Content */}
                                {activeTab === 'profile' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                Profile Information
                                            </h3>
                                            <p className="text-sm text-gray-500 mb-6">
                                                Update your personal information
                                            </p>
                                        </div>

                                        {isLoading ? (
                                            <div className="flex justify-center py-8">
                                                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                                            </div>
                                        ) : (
                                            <>
                                                {/* Full Name Field */}
                                                <div>
                                                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Full Name
                                                    </label>
                                                    <div className="relative">
                                                        <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                                        <input
                                                            id="fullName"
                                                            name="fullName"
                                                            type="text"
                                                            value={profileData.fullName}
                                                            onChange={handleProfileChange}
                                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                                            placeholder="Enter your full name"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Email Field - Read only for internal org */}
                                                <div>
                                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Email Address <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                                        <input
                                                            id="email"
                                                            name="email"
                                                            type="email"
                                                            value={profileData.email}
                                                            disabled
                                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                                                            placeholder="your.email@example.com"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                                </div>

                                                {/* Student/Employee ID Field */}
                                                <div>
                                                    <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Student/Employee ID
                                                    </label>
                                                    <div className="relative">
                                                        <IdCard className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                                        <input
                                                            id="rollNumber"
                                                            name="rollNumber"
                                                            type="text"
                                                            value={profileData.rollNumber}
                                                            onChange={handleProfileChange}
                                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                                            placeholder="Your student or employee ID"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">Letters and numbers only</p>
                                                </div>

                                                {/* Save Button */}
                                                <div className="flex justify-end pt-4">
                                                    <button
                                                        onClick={saveProfile}
                                                        disabled={isSaving}
                                                        className="px-6 py-2 text-sm font-bold text-white bg-gray-900 rounded-lg hover:bg-gray-700 transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {isSaving ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                <span>Saving...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Save className="w-4 h-4" />
                                                                <span>Save Changes</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Password Tab Content */}
                                {activeTab === 'password' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                Change Password
                                            </h3>
                                            <p className="text-sm text-gray-500 mb-6">
                                                Update your account password
                                            </p>
                                        </div>

                                        {/* Current Password Field */}
                                        <div>
                                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                                Current Password <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Key className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                                <input
                                                    id="currentPassword"
                                                    name="currentPassword"
                                                    type="password"
                                                    value={passwordData.currentPassword}
                                                    onChange={handlePasswordChange}
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>

                                        {/* New Password Field */}
                                        <div>
                                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                                New Password <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                                <input
                                                    id="newPassword"
                                                    name="newPassword"
                                                    type="password"
                                                    value={passwordData.newPassword}
                                                    onChange={handlePasswordChange}
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Must be at least 6 characters
                                            </p>
                                        </div>

                                        {/* Confirm Password Field */}
                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                                Confirm New Password <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                                <input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type="password"
                                                    value={passwordData.confirmPassword}
                                                    onChange={handlePasswordChange}
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>

                                        {/* Change Password Button */}
                                        <div className="flex justify-end pt-4">
                                            <button
                                                onClick={changePassword}
                                                disabled={isSaving}
                                                className="px-6 py-2 text-sm font-bold text-white bg-gray-900 rounded-lg hover:bg-gray-700 transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span>Updating...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock className="w-4 h-4" />
                                                        <span>Change Password</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
}

export default Profile;
