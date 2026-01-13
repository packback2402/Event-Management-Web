import React from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";
import { toast } from "react-toastify";

const Payment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();
  const navigate = useNavigate();
  const quantity = state?.quantity || 1;

  const handlePayment = async () => {
    try {
      const res = await apiClient.post(
        API_ENDPOINTS.USER.TICKETS,
        { eventId: id, quantity }
      );

      toast.success("Payment successful");
      // Navigate back to event details with QR modal state
      navigate(`/view-details/${id}`, {
        state: {
          showQR: true,
          ticketId: res.data.data._id
        }
      });
    } catch (err) {
      toast.error("Payment failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-2">Payment</h2>

        <p className="text-gray-600 mb-2">
          This is a demo payment screen.
        </p>

        <button
          onClick={handlePayment}
          className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Pay Now
        </button>
      </div>
    </div>
  );
};

export default Payment;
