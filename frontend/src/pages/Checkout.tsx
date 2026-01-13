import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";
import type { EventDataProp } from "@/components/Interfaces/EventDataProp";

const Checkout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDataProp | null>(null);
  const quantity = 1; // Fixed to 1 ticket per user per event

  useEffect(() => {
    const fetchEvent = async () => {
      const res = await apiClient.get(API_ENDPOINTS.USER.EVENT(id!));
      setEvent(res.data.data);
    };
    fetchEvent();
  }, [id]);

  if (!event) return null;

  const total = quantity * event.price;
  const eventDate = new Date(event.date);
  const now = new Date();
  const isPastEvent = eventDate < now;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">

        <h1 className="text-2xl font-bold mb-4">Checkout</h1>

        {isPastEvent && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-semibold text-sm">
              This event has already ended.
            </p>
            <p className="text-red-500 text-xs mt-1">
              You cannot purchase tickets for past events.
            </p>
          </div>
        )}

        <p className="font-medium text-gray-800 mb-2">{event.title}</p>
        <p className="text-sm text-gray-500 mb-4">
          Price: ${event.price} / ticket
        </p>

        {/* Quantity - Fixed to 1 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700">
            1
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between font-semibold mb-6 text-lg">
          <span>Total</span>
          <span>${total}</span>
        </div>

        <button
          onClick={() =>
            navigate(`/payment/${event._id}`, {
              state: { quantity: 1 },
            })
          }
          disabled={isPastEvent}
          className={`w-full py-3 text-white rounded-lg transition ${
            isPastEvent
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-orange-600 hover:bg-orange-700'
          }`}
        >
          {isPastEvent ? 'Event Ended' : 'Proceed to Payment'}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
