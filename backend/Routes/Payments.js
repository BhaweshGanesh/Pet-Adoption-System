import express from 'express';
import {
  testKhaltiKey,
  initiateOrderPayment,
  initiateBookingPayment,
  verifyOrderPayment,
  verifyBookingPayment,
  refundOrderPayment,
  getOrderPaymentDetails,
} from '../Controller/PaymentController.js';
import { protect, adminOnly } from '../Middleware/Auth.js';

const router = express.Router();

// Test Khalti key (development only — disabled in production)
if (process.env.NODE_ENV !== 'production') {
  router.get('/test-key', testKhaltiKey);
}

// Initiate payments (protected routes - require authentication)
router.post('/initiate-order', protect, initiateOrderPayment);
router.post('/initiate-booking', protect, initiateBookingPayment);

// Verify payments (protected routes - require authentication)
router.post('/verify-order', protect, verifyOrderPayment);
router.post('/verify-booking', protect, verifyBookingPayment);

// Refund (admin only)
router.post('/refund-order/:orderId', protect, adminOnly, refundOrderPayment);

// Get payment details
router.get('/order/:orderId', protect, getOrderPaymentDetails);

export default router;
