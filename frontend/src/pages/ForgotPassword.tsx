import React, { useState } from 'react';
import { Mail, CheckCircle, ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const validateForm = () => {
        setError(null);

        if (!email.trim()) {
            setError('Please enter your email address');
            return false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address');
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
            const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
                email: email,
            });

            if (response.data.message) {
                setSuccess(true);
            }
        } catch (err: any) {
            console.error('Error requesting password reset:', err);
            const errorMessage = err.response?.data?.message || 
                                'An error occurred. Please try again later.';
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
                            {/* Header */}
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                                    Forgot Password?
                                </h1>
                                <p className="text-gray-500 text-sm">
                                    Enter your email and we'll send you reset instructions.
                                </p>
                            </div>

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

                                {/* Email Input Field */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="your.email@example.com"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        We will send reset instructions to this email
                                    </p>
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
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            <span>Send Reset Link</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Back to Login Link */}
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
                        /* Success State */
                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-10 h-10 text-green-600" />
                                </div>
                            </div>
                            
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Check Your Email
                            </h2>
                            
                            <p className="text-gray-600 mb-6">
                                We've sent password reset instructions to <br />
                                <span className="font-semibold text-gray-900">{email}</span>
                            </p>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> The reset link will expire in 15 minutes. 
                                    If you don't see the email, check your spam folder.
                                </p>
                            </div>

                            <Link 
                                to="/login"
                                className="inline-flex items-center justify-center w-full py-3 text-lg font-bold text-white bg-gray-900 rounded-lg hover:bg-gray-700 transition"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Back to Login
                            </Link>

                            <button
                                onClick={() => {
                                    setSuccess(false);
                                    setEmail('');
                                }}
                                className="mt-4 text-sm text-gray-600 hover:text-gray-900 underline"
                            >
                                Didn't receive the email? Try again
                            </button>
                        </div>
                    )}

                </div>

            </main>
        </div>
    );
}

export default ForgotPassword;

