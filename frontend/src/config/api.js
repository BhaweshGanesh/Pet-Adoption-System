
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/api/auth`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  VERIFY_EMAIL: `${API_BASE_URL}/api/auth/verify-email`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,

  PETS: `${API_BASE_URL}/api/pets`,

  ADOPTIONS: `${API_BASE_URL}/api/adoptions`,

  PRODUCTS: `${API_BASE_URL}/api/products`,

  ORDERS: `${API_BASE_URL}/api/orders`,

  HOSTEL_ROOMS: `${API_BASE_URL}/api/hostel-rooms`,

  HOSTEL_BOOKINGS: `${API_BASE_URL}/api/hostel-bookings`,

  UPLOAD: `${API_BASE_URL}/api/upload`,

  DASHBOARD_STATS: `${API_BASE_URL}/api/dashboard/stats`,
  DASHBOARD_REVENUE: `${API_BASE_URL}/api/dashboard/revenue`,
  DASHBOARD_ACTIVITIES: `${API_BASE_URL}/api/dashboard/activities`,
  DASHBOARD_USERS: `${API_BASE_URL}/api/dashboard/users`,
  DASHBOARD_ROOMS_OVERVIEW: `${API_BASE_URL}/api/dashboard/rooms-overview`,
  DASHBOARD_BOOKINGS_OVERVIEW: `${API_BASE_URL}/api/dashboard/bookings-overview`,

  STAFF: `${API_BASE_URL}/api/staff`,
};

export default API_BASE_URL;

