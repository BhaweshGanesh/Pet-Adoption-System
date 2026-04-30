import express from 'express';
import {
  getAllOrders,
  getOrder,
  getMyOrders,
  getMonthlyRevenueBreakdown,
  getProductSales,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
  getOrderStats,
} from '../Controller/OrderController.js';
import { protect, adminOnly } from '../Middleware/Auth.js';

const router = express.Router();

// Middleware to optionally authenticate user (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      // If token exists, try to verify it
      const jwt = (await import('jsonwebtoken')).default;
      const User = (await import('../model/Usermodel.js')).default;
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid, but don't fail - just continue without user
        console.log('Optional auth: Invalid token, continuing without user');
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue even if there's an error
  }
};

// Order routes
router.get('/', getAllOrders);
router.get('/stats/summary', getOrderStats);
router.get('/my-orders', protect, getMyOrders);
router.get('/product-sales', protect, adminOnly, getProductSales);
router.get('/revenue/:month/:year', protect, adminOnly, getMonthlyRevenueBreakdown);
router.get('/:id', getOrder);
router.post('/', optionalAuth, createOrder); // Use optional auth for checkout
router.patch('/:id/status', updateOrderStatus);
router.patch('/:id/cancel', cancelOrder);
router.delete('/:id', deleteOrder);

export default router;

