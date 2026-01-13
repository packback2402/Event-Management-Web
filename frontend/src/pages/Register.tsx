import React from 'react';
import { Mail, Lock, User} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';
import { useToast } from '@/hooks/useToast';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [formData, setFormData] = React.useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    

    const validateForm = () => {
        // Reset error
        setError(null);

        // Check required fields
        if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('Please fill in all required fields');
            return false;
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }

        // Check password length
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }

        // Check if passwords match
        if (formData.password !== formData.confirmPassword) {
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
            // API call to register user
            const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
                username: formData.fullName,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword
            });

            if (response.data.message === "User registered successfully") {
                toast.success('Registration successful! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            }
        } catch (err: any) {
            console.error('Error registering user:', err);
            const errorMessage = err.response?.data?.message || 
                                'An error occurred during registration';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <toast.ToastComponent />
            <main className="flex flex-col items-center justify-center p-4 grow">
                
                <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-xl shadow-lg p-8 sm:p-10">
                    
                    <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-2">
                        Create an Account
                    </h1>
                    <p className="text-gray-500 text-center mb-8">
                        Register to access Event Management Portal
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Error Alert */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2">
                                <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {/* Full Name Field */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        

                        {/* Email Field */}
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
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="your.email@example.com"
                                />
                            </div>
                        </div>

                        

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
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
                                Confirm Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
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
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                <>
                                    <User className="w-5 h-5" />
                                    <span>Create Account</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                            Already have an account? {' '}
                            <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-800 transition">
                                Sign in here
                            </Link>
                        </p>
                    </div>

                    {/* Terms and Privacy */}
                    <p className="text-center text-xs text-gray-500 mt-6">
                        By registering, you agree to our{' '}
                        <a href="/terms" className="underline hover:text-gray-700">Terms of Service</a>
                        {' '}and{' '}
                        <a href="/privacy" className="underline hover:text-gray-700">Privacy Policy</a>
                    </p>

                </div>

            </main>
        </div>
    );
}

export default Register;

