import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Eye,
    Calendar,
    MapPin,
    Users,
    Clock,
    Loader2,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    LayoutDashboard
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';
import type { AdminEventData } from '@/components/Interfaces/AdminEventData';
import { useToast } from '@/hooks/useToast';

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const styles = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        approved: 'bg-green-100 text-green-800 border-green-200',
        rejected: 'bg-red-100 text-red-800 border-red-200',
    };

    return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border capitalize ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};

// Category Badge Component
const CategoryBadge: React.FC<{ category?: string }> = ({ category }) => {
    if (!category) return <span className="text-gray-400">-</span>;

    return (
        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md">
            {category}
        </span>
    );
};

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToast();

    // Auth state - MUST check before rendering anything
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null); // null = checking, false = denied, true = allowed

    // State
    const [events, setEvents] = useState<AdminEventData[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<AdminEventData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Confirmation modal state
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: 'approve' | 'reject';
        eventId: string;
        eventTitle: string;
    }>({ isOpen: false, type: 'approve', eventId: '', eventTitle: '' });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const eventsPerPage = 8;

    // Check admin authentication - FIRST before anything else
    useEffect(() => {
        const checkAdminAuth = () => {
            const user = localStorage.getItem('user');
            const token = localStorage.getItem('token');

            if (!token || !user) {
                setIsAuthorized(false);
                navigate('/login', { replace: true });
                return;
            }

            try {
                const userData = JSON.parse(user);
                if (userData.role !== 'admin') {
                    setIsAuthorized(false);
                    navigate('/events', { replace: true });
                    return;
                }
                // User is admin
                setIsAuthorized(true);
            } catch {
                setIsAuthorized(false);
                navigate('/login', { replace: true });
            }
        };

        checkAdminAuth();
    }, [navigate]);

    // Fetch events - only when authorized
    useEffect(() => {
        if (isAuthorized === true) {
            fetchEvents();
        }
    }, [isAuthorized]);

    // Filter events when search or status changes
    useEffect(() => {
        let result = [...events];

        // Filter by status
        if (statusFilter !== 'all') {
            result = result.filter(event => event.status === statusFilter);
        }

        // Filter by search term
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(event =>
                event.title.toLowerCase().includes(term) ||
                event.location.toLowerCase().includes(term) ||
                event.description.toLowerCase().includes(term) ||
                (event.category && event.category.toLowerCase().includes(term))
            );
        }

        setFilteredEvents(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [events, searchTerm, statusFilter]);

    const fetchEvents = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await apiClient.get(API_ENDPOINTS.ADMIN.EVENTS);

            setEvents(response.data.data || []);
        } catch (err: any) {
            console.error('Error fetching events:', err);
            const errorMessage = err.response?.data?.message || 'Failed to load events. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Open confirmation modal
    const openConfirmModal = (type: 'approve' | 'reject', eventId: string, eventTitle: string) => {
        setConfirmModal({ isOpen: true, type, eventId, eventTitle });
    };

    // Close confirmation modal
    const closeConfirmModal = () => {
        setConfirmModal({ isOpen: false, type: 'approve', eventId: '', eventTitle: '' });
    };

    // Handle confirmed action
    const handleConfirmedAction = async () => {
        const { type, eventId } = confirmModal;
        closeConfirmModal();

        if (type === 'approve') {
            await executeApprove(eventId);
        } else {
            await executeReject(eventId);
        }
    };

    const executeApprove = async (eventId: string) => {
        setActionLoading(eventId);
        try {
            await apiClient.put(API_ENDPOINTS.ADMIN.APPROVE_EVENT(eventId));

            // Update local state
            setEvents(prev =>
                prev.map(event =>
                    event._id === eventId
                        ? { ...event, status: 'approved' as const }
                        : event
                )
            );

            toast.success('Event approved successfully!');
        } catch (err: any) {
            console.error('Error approving event:', err);
            toast.error(err.response?.data?.message || 'Failed to approve event.');
        } finally {
            setActionLoading(null);
        }
    };

    const executeReject = async (eventId: string) => {
        setActionLoading(eventId);
        try {
            await apiClient.put(API_ENDPOINTS.ADMIN.REJECT_EVENT(eventId));

            // Update local state
            setEvents(prev =>
                prev.map(event =>
                    event._id === eventId
                        ? { ...event, status: 'rejected' as const }
                        : event
                )
            );

            toast.success('Event rejected successfully!');
        } catch (err: any) {
            console.error('Error rejecting event:', err);
            toast.error(err.response?.data?.message || 'Failed to reject event.');
        } finally {
            setActionLoading(null);
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Pagination calculations
    const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
    const startIndex = (currentPage - 1) * eventsPerPage;
    const endIndex = startIndex + eventsPerPage;
    const currentEvents = filteredEvents.slice(startIndex, endIndex);

    // Stats
    const stats = {
        total: events.length,
        pending: events.filter(e => e.status === 'pending').length,
        approved: events.filter(e => e.status === 'approved').length,
        rejected: events.filter(e => e.status === 'rejected').length,
    };

    // Don't render ANYTHING until auth is verified
    // This prevents any UI leak or information disclosure
    if (isAuthorized === null) {
        // Still checking - show minimal loading
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
        );
    }

    if (isAuthorized === false) {
        // Not authorized - show nothing, redirect is happening
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <toast.ToastComponent />

            {/* Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {confirmModal.type === 'approve' ? 'Approve Event?' : 'Reject Event?'}
                        </h3>
                        <p className="text-gray-600 mb-2">
                            {confirmModal.type === 'approve'
                                ? 'This event will be visible to all users.'
                                : 'This event will not be published.'}
                        </p>
                        <p className="text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg">
                            <strong>Event:</strong> {confirmModal.eventTitle}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={closeConfirmModal}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmedAction}
                                className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition ${confirmModal.type === 'approve'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                {confirmModal.type === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <LayoutDashboard className="w-8 h-8 text-orange-500" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                                <p className="text-sm text-gray-500">Manage event approvals</p>
                            </div>
                        </div>
                        <Link
                            to="/"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                            Exit Admin
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Events</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <Calendar className="w-10 h-10 text-gray-300" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-yellow-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-yellow-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
                            </div>
                            <Clock className="w-10 h-10 text-yellow-200" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-green-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">Approved</p>
                                <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
                            </div>
                            <CheckCircle className="w-10 h-10 text-green-200" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-red-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-600">Rejected</p>
                                <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
                            </div>
                            <XCircle className="w-10 h-10 text-red-200" />
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Event Management</h2>
                        <p className="text-sm text-gray-500">Review and manage event requests</p>
                    </div>

                    <div className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search events by title, location, description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gray-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            {/* Refresh Button */}
                            <button
                                onClick={fetchEvents}
                                disabled={isLoading}
                                className="px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <span>Refresh</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                            <p className="font-medium text-red-800">Error loading events</p>
                            <p className="text-sm text-red-600">{error}</p>
                            <button
                                onClick={fetchEvents}
                                className="mt-2 text-sm font-medium text-red-700 hover:text-red-800 underline"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )}

                {/* Events Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
                            <p className="text-gray-500">Loading events...</p>
                        </div>
                    ) : currentEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Calendar className="w-16 h-16 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No events found</h3>
                            <p className="text-gray-500">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria.'
                                    : 'No events have been submitted yet.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Event
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Date & Time
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Location
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Capacity
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentEvents.map((event) => (
                                            <tr key={event._id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="max-w-xs">
                                                        <p className="font-medium text-gray-900 truncate">{event.title}</p>
                                                        <p className="text-sm text-gray-500 truncate">{event.description}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>{formatDate(event.date)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{event.time}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-600 max-w-37.5">
                                                        <MapPin className="w-4 h-4 shrink-0" />
                                                        <span className="truncate">{event.location}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <CategoryBadge category={event.category} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                        <Users className="w-4 h-4" />
                                                        <span>{event.attendees}/{event.expectedAttendees}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={event.status} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* View Button */}
                                                        <Link to={`/admin/events/${event._id}`}>
                                                            <Eye className="w-4 h-4" />
                                                        </Link>


                                                        {/* Approve Button - Only show for pending */}
                                                        {event.status === 'pending' && (
                                                            <button
                                                                onClick={() => openConfirmModal('approve', event._id, event.title)}
                                                                disabled={actionLoading === event._id}
                                                                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                                                                title="Approve"
                                                            >
                                                                {actionLoading === event._id ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <CheckCircle className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                        )}

                                                        {/* Reject Button - Only show for pending */}
                                                        {event.status === 'pending' && (
                                                            <button
                                                                onClick={() => openConfirmModal('reject', event._id, event.title)}
                                                                disabled={actionLoading === event._id}
                                                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                                                title="Reject"
                                                            >
                                                                {actionLoading === event._id ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <XCircle className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                        )}

                                                        {/* Status indicator for non-pending */}
                                                        {event.status !== 'pending' && (
                                                            <span className="px-3 py-1.5 text-xs text-gray-400">
                                                                {event.status === 'approved' ? 'Approved' : 'Rejected'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                    <p className="text-sm text-gray-500">
                                        Showing {startIndex + 1} to {Math.min(endIndex, filteredEvents.length)} of {filteredEvents.length} events
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${currentPage === page
                                                        ? 'bg-orange-500 text-white'
                                                        : 'hover:bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
