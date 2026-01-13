import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";
import {QRCodeSVG} from "qrcode.react";

const TicketQR: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<any>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      const res = await apiClient.get(API_ENDPOINTS.USER.TICKET(id!));
      setTicket(res.data.data);
    };
    fetchTicket();
  }, [id]);

  if (!ticket) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <h1 className="text-xl font-bold mb-4">Your Ticket</h1>

        <div className="flex justify-center items-center mb-4">
          <QRCodeSVG
            value={ticket._id}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        <p className="mt-4 text-sm text-gray-600">
          Show this QR code at the event entrance
        </p>
      </div>
    </div>
  );
};

export default TicketQR;
