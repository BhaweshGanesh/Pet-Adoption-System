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
import {
  getProductReviews,
  createProductReview,
  updateProductReview,
  deleteProductReview,
} from '../Controller/ProductReviewController.js';
import { protect } from '../Middleware/Auth.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/alerts/low-stock', getLowStockProducts);

router.get('/:productId/reviews', getProductReviews);
router.post('/:productId/reviews', protect, createProductReview);
router.put('/:productId/reviews/:reviewId', protect, updateProductReview);
router.delete('/:productId/reviews/:reviewId', protect, deleteProductReview);

router.get('/:id', getProduct);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.patch('/:id/stock', updateStock);

export default router;

