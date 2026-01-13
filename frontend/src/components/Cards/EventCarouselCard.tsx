import React from "react";
import { Calendar, MapPin, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { EventDataProp } from "@/components/Interfaces/EventDataProp";
import { Button } from "../ui/button";

interface Props {
    event: EventDataProp;
}

const EventCarouselCard: React.FC<Props> = ({ event }) => {
    const navigate = useNavigate();
    const viewDetailsHandle = () => {
        navigate(`/view-details/${event._id}`, { state: { ...event } });
    };
    return (
        <div className="grid md:grid-cols-2 gap-6 p-6 items-center">
            {/* Image */}
            <div className="w-full h-64 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                {event.image ? (
                    <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 text-sm gap-1 text-center">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full border-2 border-dashed border-gray-300">
                            <span className="text-[11px] font-medium">No Image</span>
                        </div>
                        <span className="text-[11px] uppercase tracking-[0.18em]">
                            No Image Available
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div>
                <span className="inline-block mb-2 px-3 py-1 text-xs font-semibold bg-gray-800 text-white rounded-full">
                    {event.category}
                </span>

                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {event.title}
                </h3>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(event.date).toLocaleDateString()} · {event.time}
                    </span>
                    <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {event.attendees}/{event.expectedAttendees}
                    </span>
                </div>

                <p className="text-gray-600 line-clamp-3 mb-4">
                    {event.description}
                </p>

                <div className="flex items-center justify-between">
                    <span className="font-semibold text-orange-600">
                        {event.price === 0 ? "Free" : `$${event.price}`}
                    </span>

                    {/* 👉 Đi sang ViewDetails */}
                    <Button
                        onClick={viewDetailsHandle}
                        className="px-5 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition cursor-pointer"
                    >
                        View Details
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EventCarouselCard;
