import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Internal Toast Component
const ToastNotification: React.FC<{
    message: string;
    type: ToastType;
    isVisible: boolean;
    onClose: () => void;
}> = ({ message, type, isVisible, onClose }) => {
    const [isLeaving, setIsLeaving] = React.useState(false);

    React.useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                setIsLeaving(true);
                setTimeout(() => {
                    setIsLeaving(false);
                    onClose();
                }, 300);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const styles = {
        success: {
            bg: 'bg-green-50 border-green-200',
            text: 'text-green-800',
            icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        },
        error: {
            bg: 'bg-red-50 border-red-200',
            text: 'text-red-800',
            icon: <XCircle className="w-5 h-5 text-red-500" />,
        },
        warning: {
            bg: 'bg-yellow-50 border-yellow-200',
            text: 'text-yellow-800',
            icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
        },
        info: {
            bg: 'bg-blue-50 border-blue-200',
            text: 'text-blue-800',
            icon: <Info className="w-5 h-5 text-blue-500" />,
        },
    };

    const currentStyle = styles[type];

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(() => {
            setIsLeaving(false);
            onClose();
        }, 300);
    };

    return (
        <div 
            className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-out ${
                isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
            }`}
        >
            <div className={`${currentStyle.bg} border rounded-lg shadow-lg p-4 flex items-start gap-3`}>
                <div className="flex-shrink-0">
                    {currentStyle.icon}
                </div>
                <div className="flex-1">
                    <p className={`text-sm font-medium ${currentStyle.text}`}>
                        {message}
                    </p>
                </div>
                <button
                    onClick={handleClose}
                    className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition"
                >
                    <X className="w-4 h-4 text-gray-500" />
                </button>
            </div>
        </div>
    );
};

// Hook for easy toast management
export function useToast() {
    const [toast, setToast] = useState<{
        message: string;
        type: ToastType;
        isVisible: boolean;
    }>({
        message: '',
        type: 'info',
        isVisible: false,
    });

    const showToast = (message: string, type: ToastType = 'info') => {
        setToast({ message, type, isVisible: true });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    const ToastComponent = () => (
        <ToastNotification
            message={toast.message}
            type={toast.type}
            isVisible={toast.isVisible}
            onClose={hideToast}
        />
    );

    return {
        showToast,
        hideToast,
        ToastComponent,
        success: (message: string) => showToast(message, 'success'),
        error: (message: string) => showToast(message, 'error'),
        warning: (message: string) => showToast(message, 'warning'),
        info: (message: string) => showToast(message, 'info'),
    };
}
