import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { CalendarIcon, Clock, MapPin, CheckCircle } from "lucide-react";
import type { EventDataProp } from "../Interfaces/EventDataProp";
import { Button } from "../ui/button";
import { dateToString } from "@/lib/utils";
import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

interface Props {
    event: EventDataProp;
}

export const PastEventCard: React.FC<Props> = React.memo(({ event }) => {
    const navigate = useNavigate();

    const [hasTicket, setHasTicket] = useState(false);

    const viewDetailsHandle = useCallback(() => {
        navigate(`/view-details/${event._id}`);
    }, [navigate, event._id]);

    // ================= CHECK TICKET (ATTENDED) =================
    useEffect(() => {
        const checkTicket = async () => {
            try {
                const res = await apiClient.get(API_ENDPOINTS.USER.MY_TICKETS, {
                    params: { eventId: event._id },
                });

                const tickets = res.data.data;
                // Kiểm tra đúng: tickets phải là array và có ít nhất 1 phần tử
                const hasValidTicket = Array.isArray(tickets) && tickets.length > 0;

                // Debug log - dev only
                if (import.meta.env.DEV) {
                    console.log(`[PastEventCard] Event ${event._id}:`, {
                        ticketsCount: Array.isArray(tickets) ? tickets.length : 0,
                        hasTicket: hasValidTicket,
                        eventTitle: event.title
                    });
                }
                setHasTicket(hasValidTicket);
            } catch (err) {
                console.error("Check ticket error:", err);
                setHasTicket(false);
            }
        };

        checkTicket();
    }, [event._id]);

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-md mb-6 overflow-hidden relative">
            {/* Attended Badge - Top Right */}
            {hasTicket && (
                <div className="absolute top-4 right-4 px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 flex items-center z-10 shadow-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Attended
                </div>
            )}
            
            <div className="flex">
                {/* IMAGE */}
                <div className="w-1/4 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                    {event.image ? (
                        <img
                            src={event.image}
                            alt={event.title}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <div className="text-gray-400 text-sm">No Image</div>
                    )}
                </div>

                {/* DETAILS */}
                <div className="w-3/4 p-6">
                    <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white bg-gray-800 rounded-full mb-3">
                        {event.category}
                    </span>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {event.title}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                        {event.description}
                    </p>

                    {/* DATE / TIME / LOCATION */}
                    <div className="space-y-2 text-sm mb-4 text-gray-700">
                        <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                            {dateToString(event.date)}
                        </div>
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-gray-500" />
                            {event.time}
                        </div>
                        <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                            {event.location}
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex space-x-3 mt-4">
                        <Button
                            onClick={viewDetailsHandle}
                            className="px-5 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                        >
                            View Details
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
});

PastEventCard.displayName = 'PastEventCard';
