import React, { useState, useEffect, useRef } from 'react';
import { User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface NavItemProps {
    children: React.ReactNode;
    to: string;
}

const NavItem: React.FC<NavItemProps> = ({ children, to }) => (
    <Link
        to={to}
        className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-500 transition duration-150"
    >
        {children}
    </Link>
);

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    // Kiểm tra trạng thái đăng nhập khi component mount
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            const userData = localStorage.getItem("user");

            if (token && userData && userData !== "undefined") {
                try {
                    const parsedUser = JSON.parse(userData);
                    setIsLoggedIn(true);
                    setUser(parsedUser);
                } catch (error) {
                    console.error("Invalid user data in localStorage:", error);
                    localStorage.removeItem("user");
                    localStorage.removeItem("token");
                    setIsLoggedIn(false);
                    setUser(null);
                }
            } else {
                setIsLoggedIn(false);
                setUser(null);
            }
            setIsCheckingAuth(false);
        };

        checkAuth();

        // Listen cho sự thay đổi localStorage (khi login/logout)
        window.addEventListener('storage', checkAuth);

        return () => {
            window.removeEventListener('storage', checkAuth);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUser(null);
        setShowUserMenu(false);
        setShowMobileMenu(false);
        navigate('/login');
    };

    // Đóng mobile menu khi click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setShowMobileMenu(false);
            }
        };

        if (showMobileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            // Ngăn scroll khi menu mở
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [showMobileMenu]);

    // Đóng mobile menu khi navigate
    const handleMobileNavClick = () => {
        setShowMobileMenu(false);
    };

    // check auth sau khi ấn exit admin thì nó sẽ không bị signout session rồi mới load signin session
    if (isCheckingAuth) {
        return (
            <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Logo Section */}
                    <div className="flex items-center space-x-2">
                        <Link to="/" className="flex items-center">
                            <div className="text-2xl font-bold text-orange-600">TU Events</div>
                        </Link>
                    </div>
                    {/* Placeholder để tránh layout shift */}
                    <div className="w-24"></div>
                </div>
            </header>
        );
    }

    return (
        <>
            <header className={`bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 transition-opacity duration-300 ${showMobileMenu ? 'md:opacity-100 opacity-30' : 'opacity-100'}`}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

                    {/* Logo Section */}
                    <div className="flex items-center space-x-2">
                        <Link to="/" className="flex items-center" onClick={handleMobileNavClick}>
                            <div className="text-2xl font-bold text-orange-600">TU Events</div>
                        </Link>
                    </div>

                    {/* Navigation Links (Desktop) */}
                    <nav className="hidden md:flex space-x-1">
                        <NavItem to="/events">Events</NavItem>
                        
                        {isLoggedIn && (
                            <>
                                <NavItem to="/calendar">Calendar</NavItem>
                                <NavItem to="/myevent">My Events</NavItem>
                                <NavItem to="/addevent">Add Event</NavItem>
                                <NavItem to="/analytics">Analytics</NavItem>
                            </>
                        )}
                    </nav>

                    {/* Right Section */}
                    <div className="flex items-center space-x-3">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                            aria-label="Toggle menu"
                        >
                            {showMobileMenu ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>

                        {/* User Menu hoặc Sign In Button (Desktop) */}
                        {isLoggedIn ? (
                            <div className="hidden md:block relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                                >
                                    <User className="w-5 h-5 text-gray-700" />
                                    <span className="text-sm font-medium text-gray-700">
                                        {user?.full_name || user?.email}
                                    </span>
                                </button>

                                {/* Dropdown Menu */}
                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                                        {/* Admin Dashboard Link - Only for admin users */}
                                        {user?.role === 'admin' && (
                                            <Link
                                                to="/admin"
                                                onClick={() => setShowUserMenu(false)}
                                                className="flex items-center px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 font-medium"
                                            >
                                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                                Admin Dashboard
                                            </Link>
                                        )}
                                        <Link
                                            to="/profile"
                                            onClick={() => setShowUserMenu(false)}
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <User className="w-4 h-4 mr-2" />
                                            Profile
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="hidden md:block px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 transition"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {showMobileMenu && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] md:hidden transition-opacity duration-300" 
                    onClick={() => setShowMobileMenu(false)}
                />
            )}

            {/* Mobile Menu Sidebar */}
            <div
                ref={mobileMenuRef}
                className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-[60] transform transition-transform duration-300 ease-in-out md:hidden ${
                    showMobileMenu ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Mobile Menu Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div className="text-xl font-bold text-orange-600">Menu</div>
                        <button
                            onClick={() => setShowMobileMenu(false)}
                            className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                            aria-label="Close menu"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Mobile Menu Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <nav className="flex flex-col space-y-2">
                            <Link
                                to="/events"
                                onClick={handleMobileNavClick}
                                className="px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-orange-500 rounded-lg transition"
                            >
                                Events
                            </Link>
                            
                            {isLoggedIn ? (
                                <>
                                    <Link
                                        to="/calendar"
                                        onClick={handleMobileNavClick}
                                        className="px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-orange-500 rounded-lg transition"
                                    >
                                        Calendar
                                    </Link>
                                    <Link
                                        to="/myevent"
                                        onClick={handleMobileNavClick}
                                        className="px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-orange-500 rounded-lg transition"
                                    >
                                        My Events
                                    </Link>
                                    <Link
                                        to="/addevent"
                                        onClick={handleMobileNavClick}
                                        className="px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-orange-500 rounded-lg transition"
                                    >
                                        Add Event
                                    </Link>
                                    <Link
                                        to="/analytics"
                                        onClick={handleMobileNavClick}
                                        className="px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-orange-500 rounded-lg transition"
                                    >
                                        Analytics
                                    </Link>
                                </>
                            ) : null}
                        </nav>

                        {/* User Section (Mobile) */}
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            {isLoggedIn ? (
                                <div className="space-y-2">
                                    <div className="px-4 py-2 mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <User className="w-6 h-6 text-gray-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {user?.full_name || user?.email}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {user?.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {user?.role === 'admin' && (
                                        <Link
                                            to="/admin"
                                            onClick={handleMobileNavClick}
                                            className="flex items-center px-4 py-3 text-base font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition"
                                        >
                                            <LayoutDashboard className="w-5 h-5 mr-3" />
                                            Admin Dashboard
                                        </Link>
                                    )}

                                    <Link
                                        to="/profile"
                                        onClick={handleMobileNavClick}
                                        className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                    >
                                        <User className="w-5 h-5 mr-3" />
                                        Profile
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                                    >
                                        <LogOut className="w-5 h-5 mr-3" />
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    onClick={handleMobileNavClick}
                                    className="block w-full px-4 py-3 text-center text-base font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 transition"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Navbar;