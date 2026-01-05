// API Configuration
// Centralized API base URL for easy environment switching

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export const API_ENDPOINTS = {
  // Auth
  AUTH: `${API_BASE_URL}/api/auth`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  VERIFY_EMAIL: `${API_BASE_URL}/api/auth/verify-email`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  
  // Pets
  PETS: `${API_BASE_URL}/api/pets`,
  
  // Adoptions
  ADOPTIONS: `${API_BASE_URL}/api/adoptions`,
  
  // Products
  PRODUCTS: `${API_BASE_URL}/api/products`,
  
  // Orders
  ORDERS: `${API_BASE_URL}/api/orders`,
  
  // Hostel Rooms
  HOSTEL_ROOMS: `${API_BASE_URL}/api/hostel-rooms`,
  
  // Hostel Bookings
  HOSTEL_BOOKINGS: `${API_BASE_URL}/api/hostel-bookings`,
  
  // Upload
  UPLOAD: `${API_BASE_URL}/api/upload`,
};

export default API_BASE_URL;


