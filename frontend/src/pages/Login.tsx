import React from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';
import { useToast } from '@/hooks/useToast';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
                email,
                password
            });

            if (response.data.message === "Login successful") {
                // Lưu token vào localStorage
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));

                // Thêm dòng này để trigger storage event
                window.dispatchEvent(new Event('storage'));

                toast.success('Login successful! Redirecting...');
                
                // Redirect based on role (slight delay to show toast)
                setTimeout(() => {
                    if (response.data.data.user.role === 'admin') {
                        navigate('/admin');
                    } else {
                        navigate('/events');
                    }
                }, 1000);
            }
        } catch (err: any) {
            console.error('Error logging in:', err);
            const errorMessage = err.response?.data?.message || 
                                'An error occurred during login';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <toast.ToastComponent />
            <main className="flex flex-col items-center justify-center p-4 grow">
                
                <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-lg p-8 sm:p-10">
                    
                    <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-2">
                        Sign In
                    </h1>
                    <p className="text-gray-500 text-center mb-8">
                        Access your Event Management Portal
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

                        {/* Email Field */}
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
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Forgot Password Link */}
                        <div className="flex justify-end">
                            <Link to="/forgot-password" className="text-sm font-medium text-orange-600 hover:text-orange-800 transition">
                                Forgot Password?
                            </Link>
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
                                    <span>Signing In...</span>
                                </>
                            ) : (
                                <>
                                    <User className="w-5 h-5" />
                                    <span>Sign In</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                            Don't have an account? {' '}
                            <Link to="/register" className="font-semibold text-orange-600 hover:text-orange-800 transition">
                                Register here
                            </Link>
                        </p>
                    </div>

                </div>

            </main>
        </div>
    );
}

export default Login;