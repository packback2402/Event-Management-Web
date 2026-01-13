import React, { useEffect, useState } from 'react';
import { Clock, MapPin, Calendar as CalendarIcon, User, Tag, Share2, Heart, ChevronLeft } from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';
import type { EventDataProp } from '@/components/Interfaces/EventDataProp';
import { toast } from "react-toastify";
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { QRCodeModal } from '@/components/QRCodeModal';



const ViewDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [event, setEvent] = useState<EventDataProp | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasTicket, setHasTicket] = useState(false);
    const [ticketId, setTicketId] = useState<string | null>(null);
    const [confirmRegister, setConfirmRegister] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [qrTicketId, setQRTicketId] = useState<string | null>(null);
    const [isOrganizer, setIsOrganizer] = useState(false);
    const isLoggedIn = Boolean(localStorage.getItem('user')||sessionStorage.getItem('user'));





    // Check for QR modal state from navigation
    useEffect(() => {
        const locationState = location.state as any;
        if (locationState?.showQR && locationState?.ticketId) {
            setShowQRModal(true);
            setQRTicketId(locationState.ticketId);
            // Clear state to prevent showing again on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // Fetch event details and ticket status
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // =====================
                // 1. Fetch event (login / public)
                // =====================
                const eventRes = await apiClient.get(
                    isLoggedIn
                        ? API_ENDPOINTS.USER.EVENT(id!)
                        : API_ENDPOINTS.USER.PUBLIC_EVENT(id!)
                );

                const eventData = eventRes.data.data;
                setEvent(eventData);

                // =====================
                // 2. Organizer check (CHỈ khi login)
                // =====================
                if (isLoggedIn) {
                    let userIsOrganizer = false;
                    const userData = localStorage.getItem('user');

                    if (userData) {
                        try {
                            const user = JSON.parse(userData);
                            const eventOrganizerId =
                                (eventData as any).organizerId?._id ||
                                (eventData as any).organizerId;

                            const currentUserId = user._id || user.id;

                            userIsOrganizer =
                                eventOrganizerId &&
                                currentUserId &&
                                eventOrganizerId.toString() === currentUserId.toString();
                        } catch {
                            userIsOrganizer = false;
                        }
                    }

                    setIsOrganizer(userIsOrganizer);
                } else {
                    setIsOrganizer(false);
                }

                // =====================
                // 3. Ticket check (CHỈ khi login)
                // =====================
                if (isLoggedIn) {
                    const ticketRes = await apiClient.get(
                        API_ENDPOINTS.USER.MY_TICKETS,
                        { params: { eventId: id } }
                    );

                    const tickets = ticketRes.data.data;

                    if (Array.isArray(tickets) && tickets.length > 0) {
                        setHasTicket(true);
                        setTicketId(tickets[0]._id);
                    } else {
                        setHasTicket(false);
                        setTicketId(null);
                    }
                } else {
                    setHasTicket(false);
                    setTicketId(null);
                }

            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Loading event details...</p>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Event not found</p>
            </div>
        );
    }


    //dki ve tham gia su kien
    const handleRegister = async () => {
        if (!event) return;
        try {
            const res = await apiClient.post(
                API_ENDPOINTS.USER.TICKETS,
                { eventId: event._id, quantity: 1 }
            );

            setHasTicket(true);
            setTicketId(res.data.data._id);

            toast.success("Registration successful!");
            // Show QR modal instead of navigating away
            setShowQRModal(true);
            setQRTicketId(res.data.data._id);
        } catch (error: any) {
            console.error("Register error:", error);
            toast.error(
                error.response?.data?.message || "Registration failed"
            );
        }
    };

    //neu su kien mien phi thi dang ki luon, con khong thi chuyen den trang checkout
    const handleBuyTicket = () => {
        if (!event) return;

        if (!isLoggedIn) {
            toast.info("Please login to register for this event");
            navigate('/login', {
                state: { redirectTo: `/events/${event._id}` }
            });
            return;
        }

        if (event.price === 0) {
            setConfirmRegister(true);
        } else {
            navigate(`/checkout/${event._id}`);
        }
    };





    //huy dang ki su kien
    const handleCancelTicket = async () => {
        if (!ticketId) return;
        try {
            await apiClient.put(API_ENDPOINTS.USER.CANCEL_TICKET(ticketId));

            setHasTicket(false);
            setTicketId(null);

            toast.success("❌ Registration cancelled");
        } catch (err: any) {
            console.error("Cancel ticket error:", err);
            toast.error(
                err.response?.data?.message || "Cancellation failed"
            );
        }
    };





    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="container mx-auto p-4 sm:p-6 lg:p-8 grow">

                {/* --- HEADER: Back Button & Actions --- */}
                <div className="flex justify-between items-center mb-6">
                    <a onClick={() => navigate(-1)} className="text-orange-600 hover:text-orange-800 flex items-center text-sm font-medium cursor-pointer">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Events
                    </a>
                    <div className="flex space-x-3">
                        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-200"><Share2 className="w-5 h-5" /></button>
                        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-200"><Heart className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* --- EVENT MAIN CONTENT --- */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">

                    {/* Event Banner/Image */}
                    <div className="w-full h-80 bg-gray-200 flex items-center justify-center overflow-hidden">
                        {event.image ? (
                            <img
                                src={event.image}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-gray-400 text-lg">No Image Available</div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">

                        {/* Cột 1 & 2: Mô tả và Chi tiết (Chiếm 2/3) */}
                        <div className="lg:col-span-2">
                            <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white bg-gray-800 rounded-full mb-3">
                                {event.category}
                            </span>

                            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{event.title}</h1>

                            {/* Thông tin cơ bản (Thời gian, Địa điểm) */}
                            <div className="space-y-3 text-lg mb-6 border-b pb-4">
                                <p className="flex items-center text-gray-700">
                                    <CalendarIcon className="w-5 h-5 mr-3 text-orange-500" />
                                    <span className="font-semibold">{new Date(event.date).toLocaleDateString()}</span>
                                </p>
                                <p className="flex items-center text-gray-700">
                                    <Clock className="w-5 h-5 mr-3 text-orange-500" />
                                    <span>{event.time}</span>
                                </p>
                                <p className="flex items-center text-gray-700">
                                    <MapPin className="w-5 h-5 mr-3 text-orange-500" />
                                    <span>{event.location}</span>
                                </p>
                            </div>

                            {/* Mô tả chi tiết */}
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">About the Event</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {event.description}
                            </p>

                            {/* Thông tin thêm */}
                            <div className="mt-8 pt-4 border-t border-gray-100 space-y-3">
                                <p className="flex items-center text-sm text-gray-600">
                                    <User className="w-4 h-4 mr-3" />
                                    Organizer: <span className="font-medium ml-1 text-gray-800">{(event as any).organizerId?.username || 'Unknown'}</span>
                                </p>
                                <p className="flex items-center text-sm text-gray-600">
                                    <Tag className="w-4 h-4 mr-3" />
                                    Fee: <span className="font-medium ml-1 text-gray-800">{event.price === 0 ? 'Free' : `$${event.price}`}</span>
                                </p>
                                <p className="flex items-center text-sm text-gray-600">
                                    <User className="w-4 h-4 mr-3" />
                                    Attendees: <span className="font-medium ml-1 text-gray-800">{event.attendees} / {event.expectedAttendees}</span>
                                </p>
                            </div>

                        </div>

                        {/* Cột 3: Hành động (Chiếm 1/3) */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-20 bg-gray-50 border border-gray-300 rounded-lg p-6 shadow-md">
                                <h3 className="text-xl font-bold mb-4 text-gray-900">Get Your Ticket</h3>

                                {isOrganizer ? (
                                    <>
                                        <p className="text-blue-600 font-semibold mb-3">
                                            You are the organizer of this event.
                                        </p>
                                        <p className="text-sm text-gray-600 mb-4">
                                            You don't need to register. You can manage this event from "Created By Me" section.
                                        </p>
                                        <button
                                            onClick={() => navigate(`/manage-event/${event._id}`)}
                                            className="w-full py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                                        >
                                            Manage Event
                                        </button>
                                    </>
                                ) : hasTicket ? (
                                    <>
                                        <p className="text-green-600 font-semibold mb-3">
                                            You are already registered!
                                        </p>
                                        <button
                                            onClick={() => navigate(`/ticket/${ticketId}`)}
                                            className="w-full py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
                                        >
                                            View Ticket
                                        </button>

                                        <button
                                            onClick={() => setConfirmCancel(true)}
                                            className="w-full mt-3 py-3 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition"
                                        >
                                            Cancel Registration
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {(() => {
                                            const eventDate = new Date(event.date);
                                            const now = new Date();
                                            const isPastEvent = eventDate < now;

                                            if (isPastEvent) {
                                                return (
                                                    <>
                                                        <p className="text-red-600 font-semibold mb-3">
                                                            This event has already ended.
                                                        </p>
                                                        <p className="text-sm text-gray-600 mb-4">
                                                            Registration is no longer available for past events.
                                                        </p>
                                                        <button
                                                            disabled
                                                            className="w-full py-3 text-lg font-bold text-gray-400 bg-gray-300 rounded-lg cursor-not-allowed"
                                                        >
                                                            Event Ended
                                                        </button>
                                                    </>
                                                );
                                            }

                                            return (
                                                <>
                                                    <p className="text-gray-700 mb-4">
                                                        Click below to register for this event.
                                                    </p>
                                                    <button
                                                        onClick={handleBuyTicket}
                                                        className="w-full py-3 text-lg font-bold text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition"
                                                    >
                                                        {event.price === 0 ? "Register Now" : "Buy Ticket"}
                                                    </button>
                                                </>
                                            );
                                        })()}
                                    </>
                                )}
                                <ConfirmDialog
                                    open={confirmRegister}
                                    title="Register for this event?"
                                    description="Are you sure you want to register for this event?"
                                    confirmText="Register"
                                    onCancel={() => setConfirmRegister(false)}
                                    onConfirm={async () => {
                                        setConfirmRegister(false);
                                        await handleRegister();
                                    }}
                                />

                                <ConfirmDialog
                                    open={confirmCancel}
                                    title="Cancel registration?"
                                    description="This action cannot be undone."
                                    confirmText="Cancel Registration"
                                    onCancel={() => setConfirmCancel(false)}
                                    onConfirm={async () => {
                                        setConfirmCancel(false);
                                        await handleCancelTicket();
                                    }}
                                />

                                {/* QR Code Modal */}
                                {qrTicketId && (
                                    <QRCodeModal
                                        isOpen={showQRModal}
                                        onClose={() => {
                                            setShowQRModal(false);
                                            setQRTicketId(null);
                                        }}
                                        ticketId={qrTicketId}
                                        eventTitle={event?.title}
                                    />
                                )}

                            </div>
                        </div>

                    </div>
                </div>

            </main>
        </div>
    );
}

export default ViewDetails;