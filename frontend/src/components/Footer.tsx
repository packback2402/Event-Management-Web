import React from 'react';

const Footer: React.FC = () => {
    // Năm bản quyền được đặt là 2025 theo ảnh
    const currentYear = 2025; 

    return (
        <footer className="bg-white border-t border-gray-200 mt-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                
                {/* Copyright Text */}
                <p className="mb-2 md:mb-0">
                    &copy; {currentYear} TU Events. All rights reserved.
                </p>

                {/* Footer Links */}
                <div className="space-x-4">
                    <a href="#" className="hover:text-gray-700 transition">About</a>
                    <a href="#" className="hover:text-gray-700 transition">Contact</a>
                    <a href="#" className="hover:text-gray-700 transition">Privacy</a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;