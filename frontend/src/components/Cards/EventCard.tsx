import React from "react";
import { Clock, MapPin } from "lucide-react";
import { dateToString, formatDate } from "@/lib/utils";
import { useNavigate } from "react-router";
import type { EventDataProp } from "../Interfaces/EventDataProp";
import { Button } from "../ui/button";

export const EventCard: React.FC<{ event: EventDataProp }> = React.memo(({ event }) => {
  const navigate = useNavigate();

  const viewDetailsHandle = () => {
    navigate(`/view-details/${event._id}`, { state: { ...event } });
  };

  const date = formatDate(dateToString(event.date));
  const eventDate = new Date(event.date);
  const now = new Date();
  const isPastEvent = eventDate < now;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition">

      {/* Image */}
      <div className="relative w-full h-40 bg-gray-100 overflow-hidden">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No Image
          </div>
        )}



        {/* Overlay info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/80 backdrop-blur-sm">

          <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2">
            {event.title}
          </h3>
        </div>
        {/* Date Badge */}
        {/* Date Badge */}
        <div className="absolute top-2 right-2">
          <div className="rounded-md px-2 py-1 text-center bg-gray-900/90 text-white shadow-md backdrop-blur-sm min-w-[52px]">
            <div className="text-[10px] uppercase tracking-wide opacity-80 leading-none">
              {date.month}
            </div>
            <div className="text-lg font-bold leading-tight">
              {date.day}
            </div>
            <div className="text-[9px] opacity-70 leading-none">
              {date.year}
            </div>
          </div>
        </div>

      </div>

      {/* Content */}
      <div className="p-4 flex flex-col grow">
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {event.description}
          {/* <span className="inline-block px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-white bg-gray-800 rounded-full mb-1 ml-76">
            {event.category}
          </span> */}
        </p>

        {/* Time & Location */}
        <div className="space-y-1 text-xs text-gray-700 mt-auto pt-2 border-t border-gray-100">
          <p className="flex items-center">
            <Clock className="w-3 h-3 mr-2 text-gray-500" />
            {event.time}
          </p>
          <p className="flex items-center">
            <MapPin className="w-3 h-3 mr-2 text-gray-500" />
            {event.location}
          </p>
        </div>

        {/* Action */}
        <div className="pt-4">
          {isPastEvent && (
            <div className="mb-2 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg text-center">
              Event Ended
            </div>
          )}
          <Button
            onClick={viewDetailsHandle}
            className={`w-full py-2 text-sm font-medium transition ${
              isPastEvent 
                ? 'bg-gray-400 hover:bg-gray-400 cursor-pointer' 
                : 'bg-gray-900 hover:bg-gray-700'
            }`}
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
});

EventCard.displayName = 'EventCard';
export default EventCard;