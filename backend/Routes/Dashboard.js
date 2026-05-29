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

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/activities', getRecentActivities);
router.get('/revenue', getMonthlyRevenue);

router.get('/users', getAllUsersOverview);
router.get('/rooms-overview', getRoomsOverview);
router.get('/bookings-overview', getBookingsOverview);

export default router;
