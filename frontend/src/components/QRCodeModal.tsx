import React from 'react';
import { X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatTicketCode } from '@/lib/ticketUtils';
import { useNavigate } from 'react-router-dom';

interface QRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticketId: string;
    eventTitle?: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
    isOpen,
    onClose,
    ticketId,
    eventTitle
}) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleViewDetails = () => {
        onClose();
        navigate(`/ticket/${ticketId}`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 z-50">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Registered Successfully
                    </h2>
                    {eventTitle && (
                        <p className="text-sm text-gray-600">{eventTitle}</p>
                    )}
                </div>

                {/* QR Code */}
                <div className="flex justify-center items-center mb-6">
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                        <QRCodeSVG
                            value={ticketId}
                            size={200}
                            level="H"
                            includeMargin={true}
                        />
                    </div>
                </div>

                {/* Ticket Code */}
                <div className="text-center mb-6">
                    <p className="text-sm font-medium text-gray-600 mb-2">
                        Your Ticket Code
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-lg font-semibold text-gray-900 font-mono">
                            {formatTicketCode(ticketId)}
                        </p>
                    </div>
                </div>

                {/* Instructions */}
                <p className="text-sm text-gray-600 text-center mb-6">
                    Scan the QR code at the event entrance
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleViewDetails}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition"
                    >
                        View Ticket Details
                    </button>
                </div>
            </div>
        </div>
    );
};

