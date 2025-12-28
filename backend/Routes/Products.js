import express from 'express';
import {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  updateStock,
} from '../Controller/ProductController.js';

const router = express.Router();

// Product routes
router.get('/', getAllProducts);
router.get('/alerts/low-stock', getLowStockProducts);
router.get('/:id', getProduct);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.patch('/:id/stock', updateStock);

export default router;

