// API Configuration
// Use environment variable for API base URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    PROFILE: `${API_BASE_URL}/api/auth/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/change-password`,
    UPLOAD_AVATAR: `${API_BASE_URL}/api/auth/upload-avatar`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: (token: string) => `${API_BASE_URL}/api/auth/reset-password/${token}`,
  },
  // User endpoints
  USER: {
    EVENTS: `${API_BASE_URL}/api/user/events`,
    EVENT: (id: string) => `${API_BASE_URL}/api/user/event/${id}`,
    PUBLIC_EVENT: (id: string) => `${API_BASE_URL}/api/user/public/event/${id}`,
    EVENT_ATTENDEES: (eventId: string) => `${API_BASE_URL}/api/user/event/${eventId}/attendees`,
    ALL_EVENTS_APPROVED: `${API_BASE_URL}/api/user/allEvents/approved`,
    EVENTS_PENDING: `${API_BASE_URL}/api/user/events/pending`,
    EVENTS_APPROVED: `${API_BASE_URL}/api/user/events/approved`,
    EVENTS_EVERYBODY_APPROVED: `${API_BASE_URL}/api/user/allEvents/everybodyApproved`,
    CREATE_EVENT: `${API_BASE_URL}/api/user/event`,
    UPDATE_EVENT: (id: string) => `${API_BASE_URL}/api/user/event/${id}`,
    TICKETS: `${API_BASE_URL}/api/user/tickets`,
    TICKET: (id: string) => `${API_BASE_URL}/api/user/tickets/${id}`,
    CANCEL_TICKET: (id: string) => `${API_BASE_URL}/api/user/tickets/${id}/cancel`,
    MY_TICKETS: `${API_BASE_URL}/api/user/my-tickets`,
    STATS: {
      APPROVED_LAST_5_MONTHS: `${API_BASE_URL}/api/user/stats/approved-last-5-months`,
      APPROVED_NEXT_3_MONTHS: `${API_BASE_URL}/api/user/stats/approved-next-3-months`,
      ATTENDEES_LAST_MONTH: `${API_BASE_URL}/api/user/stats/attendees-last-month`,
      REVENUE_LAST_MONTH: `${API_BASE_URL}/api/user/stats/revenue-last-month`,
    },
  },
  // Admin endpoints
  ADMIN: {
    EVENTS: `${API_BASE_URL}/api/admin/events`,
    APPROVE_EVENT: (id: string) => `${API_BASE_URL}/api/admin/events/${id}/approve`,
    REJECT_EVENT: (id: string) => `${API_BASE_URL}/api/admin/events/${id}/reject`,
  },
};

export default API_BASE_URL;

