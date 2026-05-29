import express from 'express';
import {
  getAllRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  checkRoomAvailability,
} from '../Controller/HostelRoomController.js';
import {
  getHostelRoomReviews,
  createHostelRoomReview,
  updateHostelRoomReview,
  deleteHostelRoomReview,
} from '../Controller/HostelRoomReviewController.js';
import { protect, adminOnly } from '../Middleware/Auth.js';

const router = express.Router();

router.get('/', getAllRooms);

router.get('/:roomId/reviews', getHostelRoomReviews);
router.post('/:roomId/reviews', protect, createHostelRoomReview);
router.put('/:roomId/reviews/:reviewId', protect, updateHostelRoomReview);
router.delete('/:roomId/reviews/:reviewId', protect, deleteHostelRoomReview);

router.get('/:id', getRoom);
router.post('/:id/check-availability', checkRoomAvailability);

router.post('/', protect, adminOnly, createRoom);
router.put('/:id', protect, adminOnly, updateRoom);
router.delete('/:id', protect, adminOnly, deleteRoom);

export default router;
