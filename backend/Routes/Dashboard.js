import express from 'express';
import {
  getDashboardStats,
  getRecentActivities,
  getMonthlyRevenue,
  getAllUsersOverview,
  getRoomsOverview,
  getBookingsOverview,
} from '../Controller/DashboardController.js';
import { protect, adminOnly } from '../Middleware/Auth.js';

const router = express.Router();

// All dashboard routes require admin authentication
router.use(protect, adminOnly);

// Dashboard statistics and analytics
router.get('/stats', getDashboardStats);
router.get('/activities', getRecentActivities);
router.get('/revenue', getMonthlyRevenue);

// Overview routes
router.get('/users', getAllUsersOverview);
router.get('/rooms-overview', getRoomsOverview);
router.get('/bookings-overview', getBookingsOverview);

export default router;
