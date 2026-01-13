import React, { useState, useCallback } from "react";
import { CalendarIcon, Clock, MapPin, QrCode } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
import type { EventDataProp } from "../Interfaces/EventDataProp";
import { dateToString } from "@/lib/utils";
import { formatTicketCode } from "@/lib/ticketUtils";
import { QRCodeModal } from "../QRCodeModal";


// --- 1. Registered Event Card ---
export const RegisteredEventCard: React.FC<{ event: EventDataProp; showTicketCode?: boolean }> = React.memo(({ event, showTicketCode = true }) => {
    const navigate = useNavigate();
    const [showQRModal, setShowQRModal] = useState(false);
    
    const viewDetailsHandle = useCallback(() => {
        navigate(`/view-details/${event._id}`, { state: { ...event } })
    }, [navigate, event]);

    const handleViewTicket = useCallback(() => {
        if (event.ticketId) {
            setShowQRModal(true);
        } else {
            navigate(`/view-details/${event._id}`);
        }
    }, [event.ticketId, event._id, navigate]);

    return (
        <>
            <div className="bg-white border border-gray-200 rounded-lg shadow-md mb-6 overflow-hidden">
                <div className="flex">
                    <div className="w-1/4 bg-gray-100 flex items-center justify-center overflow-hidden">
                        {event.image ? (
                            <img 
                                src={event.image} 
                                alt={event.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <div className="text-gray-400 text-sm">No Image</div>
                        )}
                    </div>
                    {/* Event Details */}
                    <div className="w-3/4 p-6">
                        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white bg-gray-800 rounded-full mb-3">
                            {event.category}
                        </span>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h3>
                        <p className="text-gray-600 mb-4">{event.description}</p>
                        {/* Date, Time, Location */}
                        <div className="space-y-2 text-sm mb-4 text-gray-700">
                            <div className="flex items-center"><CalendarIcon className="w-4 h-4 mr-2 text-gray-500" /><span>{dateToString(event.date)}</span></div>
                            <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-500" /><span>{event.time}</span></div>
                            <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-500" /><span>{event.location}</span></div>
                        </div>
                        {/* Ticket Code */}
                        {showTicketCode && (
                            <div className="border-t border-b border-gray-200 py-3 mb-5">
                                <p className="text-sm font-medium text-gray-800">Ticket Code</p>
                                {event.ticketId ? (
                                    <p className="text-lg font-semibold text-gray-900 font-mono">
                                        {formatTicketCode(event.ticketId)}
                                    </p>
                                ) : (
                                    <p className="text-lg font-semibold text-gray-400">No ticket code</p>
                                )}
                            </div>
                        )}
                        {/* Actions */}
                        <div className="flex space-x-3">
                            <Button onClick={() => viewDetailsHandle()} className="px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 transition cursor-pointer">View Details</Button>
                            {event.ticketId && (
                                <Button 
                                    onClick={handleViewTicket} 
                                    className="px-5 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition cursor-pointer flex items-center gap-2"
                                >
                                    <QrCode className="w-4 h-4" />
                                    View Ticket
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Code Modal */}
            {event.ticketId && (
                <QRCodeModal
                    isOpen={showQRModal}
                    onClose={() => setShowQRModal(false)}
                    ticketId={event.ticketId}
                    eventTitle={event.title}
                />
            )}
        </>
    )
});

RegisteredEventCard.displayName = 'RegisteredEventCard';
