import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";
import { 
  ArrowLeft, 
  Users, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Clock,
  Download,
  Mail,
  User,
  Ticket,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { dateToString } from "@/lib/utils";
import { formatTicketCodeShort } from "@/lib/ticketUtils";
import { toast } from "react-toastify";

interface Attendee {
  _id: string;
  quantity: number;
  totalPrice: number;
  bookedAt: string;
  status: string;
  userId: {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
  };
}

interface EventData {
  _id: string;
  title: string;
  date: string;
  location: string;
  expectedAttendees: number;
  price: number;
  status?: 'pending' | 'approved' | 'rejected';
}

interface Statistics {
  totalAttendees: number;
  totalRevenue: number;
  bookedCount: number;
  cancelledCount: number;
}

const ManageEvent: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventData | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        if (import.meta.env.DEV) {
          console.log('[ManageEvent] Fetching data for eventId:', eventId);
        }
        const response = await apiClient.get(
          API_ENDPOINTS.USER.EVENT_ATTENDEES(eventId!)
        );

        if (import.meta.env.DEV) {
          console.log('[ManageEvent] Full API response:', response);
          console.log('[ManageEvent] Response data:', response.data);
          console.log('[ManageEvent] Response data.data:', response.data?.data);
        }

        // Defensive check: Kiểm tra response structure
        if (!response.data || !response.data.data) {
          if (import.meta.env.DEV) {
            console.error('[ManageEvent] Invalid response structure:', response.data);
          }
          toast.error("Invalid response from server");
          setLoading(false);
          return;
        }

        const { event, attendees, statistics } = response.data.data;

        // Kiểm tra event và statistics có tồn tại không
        if (!event) {
          if (import.meta.env.DEV) {
            console.error('[ManageEvent] Event data is missing');
          }
          toast.error("Event data not found");
          setLoading(false);
          return;
        }

        if (!statistics) {
          if (import.meta.env.DEV) {
            console.error('[ManageEvent] Statistics data is missing');
          }
          toast.error("Statistics data not found");
          setLoading(false);
          return;
        }

        if (import.meta.env.DEV) {
          console.log('[ManageEvent] Setting state with:', {
            event: event.title,
            attendeesCount: attendees?.length || 0,
            statistics: statistics
          });
        }

        setEvent(event);
        // Lọc bỏ các attendees có userId null hoặc undefined để tránh lỗi render
        const validAttendees = (attendees || []).filter(
          (attendee: Attendee) => attendee.userId && attendee.userId._id
        );
        setAttendees(validAttendees);
        setStatistics(statistics);
        
        // Log để debug
        console.log('[ManageEvent] State set successfully:', {
          totalAttendees: statistics?.totalAttendees,
          attendeesCount: attendees?.length,
          validAttendeesCount: validAttendees.length
        });
      } catch (error: any) {
        if (import.meta.env.DEV) {
          console.error("[ManageEvent] Error fetching event data:", error);
          console.error("[ManageEvent] Error details:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            statusText: error.response?.statusText
          });
        }
        const errorMessage = error.response?.data?.message || error.message || "Failed to load event data";
        toast.error(errorMessage);
        if (error.response?.status === 403 || error.response?.status === 404) {
          setTimeout(() => navigate("/myevent"), 2000);
        }
      } finally {
        setLoading(false);
        if (import.meta.env.DEV) {
          console.log('[ManageEvent] Loading set to false');
        }
      }
    };

    if (eventId) {
      fetchEventData();
    } else {
      if (import.meta.env.DEV) {
        console.error('[ManageEvent] No eventId provided');
      }
      setLoading(false);
    }
  }, [eventId, navigate]);

  const handleExportCSV = useCallback(() => {
    if (!attendees.length || !event) return;

    const headers = ["Username", "Email", "Total Price", "Booked At", "Ticket Code"];
    const rows = attendees
      .filter((attendee) => attendee.userId && attendee.userId._id)
      .map((attendee) => [
        attendee.userId?.username || 'Unknown User',
        attendee.userId?.email || 'N/A',
        `$${attendee.totalPrice || 0}`,
        attendee.bookedAt ? new Date(attendee.bookedAt).toLocaleString() : 'N/A',
        formatTicketCodeShort(attendee._id),
      ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${event.title.replace(/\s+/g, "_")}_attendees.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file downloaded successfully!");
  }, [attendees, event]);

  // ⚠️ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC các early returns
  // để tuân thủ Rules of Hooks của React
  // Memoize các tính toán để tránh tính lại mỗi lần render
  const fillPercentage = useMemo(() => {
    if (!event || !statistics) return 0;
    return event.expectedAttendees > 0 
      ? Math.round((statistics.totalAttendees / event.expectedAttendees) * 100)
      : 0;
  }, [event, statistics]);

  // Memoize event status calculation
  const eventStatusInfo = useMemo(() => {
    if (!event) return { className: '', text: '' };
    
    if (event.status === 'rejected') {
      return { className: 'text-red-600', text: 'Rejected' };
    }
    
    const now = new Date();
    const eventDate = new Date(event.date);
    if (eventDate < now) {
      return { className: 'text-gray-600', text: 'Đã diễn ra' };
    }
    return { className: 'text-blue-600', text: 'Chưa diễn ra' };
  }, [event]);

  // Early returns sau khi đã gọi tất cả hooks
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!event || !statistics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Event not found or you don't have permission to view it.</p>
          <Button onClick={() => navigate("/myevent")}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/myevent")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Events
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
          <p className="text-gray-600 mt-2">Manage your event attendees and statistics</p>
        </div>

        {/* Event Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-semibold">{dateToString(event.date)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-semibold">{event.location}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="font-semibold">{event.price === 0 ? "Free" : `$${event.price}`}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Event Status</p>
                <p className={`font-semibold ${eventStatusInfo.className}`}>
                  {eventStatusInfo.text}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Attendees</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalAttendees}</p>
                <p className="text-xs text-gray-500 mt-1">
                  of {event.expectedAttendees} expected
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{fillPercentage}% filled</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${statistics.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {event.price === 0 ? "Free event" : `${statistics.bookedCount} bookings`}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.bookedCount}</p>
                <p className="text-xs text-gray-500 mt-1">Active tickets</p>
              </div>
              <Ticket className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.cancelledCount}</p>
                <p className="text-xs text-gray-500 mt-1">Cancelled tickets</p>
              </div>
              <Users className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Attendees List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Attendees ({attendees.length})
            </h2>
            <div className="flex space-x-2">
              <Button
                onClick={handleExportCSV}
                variant="outline"
                disabled={attendees.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {attendees.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No attendees registered yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booked At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendees.map((attendee) => {
                    // Kiểm tra defensive cho userId
                    if (!attendee.userId || !attendee.userId._id) {
                      return null;
                    }
                    
                    // Memoize các giá trị tính toán cho mỗi row
                    const ticketCode = formatTicketCodeShort(attendee._id);
                    const bookedAtFormatted = attendee.bookedAt 
                      ? new Date(attendee.bookedAt).toLocaleString() 
                      : 'N/A';
                    
                    return (
                      <tr key={attendee._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {attendee.userId?.avatar ? (
                              <img
                                src={attendee.userId.avatar}
                                alt={attendee.userId.username || 'User'}
                                className="w-10 h-10 rounded-full mr-3"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                                <User className="w-5 h-5 text-gray-600" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {attendee.userId?.username || 'Unknown User'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 text-gray-400 mr-2" />
                            <p className="text-sm text-gray-600">{attendee.userId?.email || 'N/A'}</p>
                          </div>
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900">
                          ${attendee.totalPrice}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-mono text-gray-600">
                          {ticketCode}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          <p className="text-sm text-gray-600">
                            {bookedAtFormatted}
                          </p>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageEvent;

