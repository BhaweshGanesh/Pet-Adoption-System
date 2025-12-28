import express from 'express';
import {
  getAllOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
  getOrderStats,
} from '../Controller/OrderController.js';

const router = express.Router();

// Order routes
router.get('/', getAllOrders);
router.get('/stats/summary', getOrderStats);
router.get('/:id', getOrder);
router.post('/', createOrder);
router.patch('/:id/status', updateOrderStatus);
router.patch('/:id/cancel', cancelOrder);
router.delete('/:id', deleteOrder);

export default router;

