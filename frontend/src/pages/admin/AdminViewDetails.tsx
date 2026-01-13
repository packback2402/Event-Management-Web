import React, { useEffect, useState } from 'react';
import {
    Calendar,
    Clock,
    MapPin,
    User,
    Tag,
    ChevronLeft,
    CheckCircle,
    XCircle,
    Loader2
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';
import type { AdminEventData } from '@/components/Interfaces/AdminEventData';
import { useToast } from '@/hooks/useToast';

const AdminViewDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();

    const [event, setEvent] = useState<AdminEventData | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // =====================
    // Auth + Fetch event
    // =====================
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const userRaw = localStorage.getItem('user');
                if (!userRaw || JSON.parse(userRaw).role !== 'admin') {
                    navigate('/events', { replace: true });
                    return;
                }

                const res = await apiClient.get(
                    API_ENDPOINTS.USER.PUBLIC_EVENT(id!)
                );

                setEvent(res.data.data);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load event');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchEvent();
    }, [id, navigate, toast]);

    // =====================
    // Approve / Reject
    // =====================
    const approve = async () => {
        if (!event) return;
        setActionLoading(true);
        try {
            await apiClient.put(
                API_ENDPOINTS.ADMIN.APPROVE_EVENT(event._id)
            );
            setEvent({ ...event, status: 'approved' });
            toast.success('Event approved');
        } catch {
            toast.error('Approve failed');
        } finally {
            setActionLoading(false);
        }
    };

    const reject = async () => {
        if (!event) return;
        setActionLoading(true);
        try {
            await apiClient.put(
                API_ENDPOINTS.ADMIN.REJECT_EVENT(event._id)
            );
            setEvent({ ...event, status: 'rejected' });
            toast.success('Event rejected');
        } catch {
            toast.error('Reject failed');
        } finally {
            setActionLoading(false);
        }
    };

    // =====================
    // UI
    // =====================
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!event) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="container mx-auto p-6">

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="text-orange-600 flex items-center mb-6"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Dashboard
                </button>

                <div className="bg-white rounded-xl shadow border p-8">

                    <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold rounded-full
                        bg-gray-800 text-white capitalize">
                        {event.status}
                    </span>

                    <h1 className="text-3xl font-bold mb-6">
                        {event.title}
                    </h1>

                    {/* Info */}
                    <div className="space-y-3 mb-6">
                        <p className="flex items-center text-gray-700">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(event.date).toLocaleDateString()}
                        </p>
                        <p className="flex items-center text-gray-700">
                            <Clock className="w-4 h-4 mr-2" />
                            {event.time}
                        </p>
                        <p className="flex items-center text-gray-700">
                            <MapPin className="w-4 h-4 mr-2" />
                            {event.location}
                        </p>
                        <p className="flex items-center text-gray-700">
                            <User className="w-4 h-4 mr-2" />
                            Organizer: {(event as any).organizerId?.username}
                        </p>
                        <p className="flex items-center text-gray-700">
                            <Tag className="w-4 h-4 mr-2" />
                            Category: {event.category}
                        </p>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 whitespace-pre-line mb-8">
                        {event.description}
                    </p>

                    {/* Actions */}
                    {event.status === 'pending' && (
                        <div className="flex gap-4">
                            <button
                                disabled={actionLoading}
                                onClick={approve}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg flex items-center gap-2"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Approve
                            </button>
                            <button
                                disabled={actionLoading}
                                onClick={reject}
                                className="px-6 py-3 bg-red-600 text-white rounded-lg flex items-center gap-2"
                            >
                                <XCircle className="w-5 h-5" />
                                Reject
                            </button>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default AdminViewDetails;
