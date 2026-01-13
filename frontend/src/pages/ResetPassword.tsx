import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';

const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const { token } = useParams<{ token: string }>();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(5);

    // Check for token on mount
    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token. Please request a new password reset link.');
        }
    }, [token]);

    // Countdown for auto-redirect after success
    useEffect(() => {
        if (success && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (success && countdown === 0) {
            navigate('/login');
        }
    }, [success, countdown, navigate]);

    const getPasswordStrength = (password: string): { strength: string; color: string; width: string } => {
        if (password.length === 0) return { strength: '', color: '', width: '0%' };
        if (password.length < 6) return { strength: 'Weak', color: 'bg-red-500', width: '33%' };
        if (password.length < 10) return { strength: 'Medium', color: 'bg-yellow-500', width: '66%' };
        return { strength: 'Strong', color: 'bg-green-500', width: '100%' };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    const validateForm = () => {
        setError(null);

        if (!token) {
            setError('Invalid or missing reset token');
            return false;
        }

        if (!newPassword || !confirmPassword) {
            setError('Please fill in all fields');
            return false;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD(token!), {
                newPassword: newPassword,
            });

            if (response.data.message) {
                setSuccess(true);
            }
        } catch (err: any) {
            console.error('Error resetting password:', err);
            const errorMessage = err.response?.data?.message || 
                                'An error occurred. The reset link may be invalid or expired.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="flex flex-col items-center justify-center p-4 grow">
                
                <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-lg p-8 sm:p-10">
                    
                    {!success ? (
                        <>
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                                    Reset Password
                                </h1>
                                <p className="text-gray-500 text-sm">
                                    Enter your new password below
                                </p>
                            </div>

                            {!token ? (
                                <div className="text-center">
                                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                                        <p className="text-sm font-medium">
                                            {error || 'Invalid or missing reset token'}
                                        </p>
                                    </div>
                                    <Link 
                                        to="/forgot-password"
                                        className="inline-flex items-center justify-center w-full py-3 text-lg font-bold text-white bg-gray-900 rounded-lg hover:bg-gray-700 transition"
                                    >
                                        Request New Reset Link
                                    </Link>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    
                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2">
                                            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm">{error}</span>
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                            New Password <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                            <input
                                                id="newPassword"
                                                name="newPassword"
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                value={newPassword}
                                                onChange={(e) => {
                                                    setNewPassword(e.target.value);
                                                    setError(null);
                                                }}
                                                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        
                                        {newPassword && (
                                            <div className="mt-2">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-gray-600">Password strength:</span>
                                                    <span className={`text-xs font-medium ${
                                                        passwordStrength.strength === 'Weak' ? 'text-red-600' :
                                                        passwordStrength.strength === 'Medium' ? 'text-yellow-600' :
                                                        'text-green-600'
                                                    }`}>
                                                        {passwordStrength.strength}
                                                    </span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                                        style={{ width: passwordStrength.width }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirm Password <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                            <input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => {
                                                    setConfirmPassword(e.target.value);
                                                    setError(null);
                                                }}
                                                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {confirmPassword && newPassword === confirmPassword && (
                                            <p className="text-xs text-green-600 mt-1 flex items-center">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Passwords match
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3 text-lg font-bold text-white bg-gray-900 rounded-lg hover:bg-gray-700 transition flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Resetting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="w-5 h-5" />
                                                <span>Reset Password</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                            <div className="text-center mt-6">
                                <Link 
                                    to="/login" 
                                    className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-800 transition"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Back to Login
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                                    <CheckCircle className="w-10 h-10 text-green-600" />
                                </div>
                            </div>
                            
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Password Reset Successful!
                            </h2>
                            
                            <p className="text-gray-600 mb-6">
                                Your password has been reset successfully. You can now log in with your new password.
                            </p>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-blue-800">
                                    Redirecting to login page in <span className="font-bold text-blue-900">{countdown}</span> seconds...
                                </p>
                            </div>

                            <Link 
                                to="/login"
                                className="inline-flex items-center justify-center w-full py-3 text-lg font-bold text-white bg-gray-900 rounded-lg hover:bg-gray-700 transition"
                            >
                                Go to Login Now
                            </Link>
                        </div>
                    )}

                </div>

            </main>
        </div>
    );
}

export default ResetPassword;
