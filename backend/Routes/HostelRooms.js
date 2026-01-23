import express from 'express';
import {
  getAllRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  checkRoomAvailability,
} from '../Controller/HostelRoomController.js';
import { protect, adminOnly, staffOrAdmin } from '../Middleware/Auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllRooms);
router.get('/:id', getRoom);
router.post('/:id/check-availability', checkRoomAvailability);

// Staff and Admin routes - viewing rooms
router.get('/', protect, staffOrAdmin, getAllRooms);

// Admin only routes - room management
router.post('/', protect, adminOnly, createRoom);
router.put('/:id', protect, adminOnly, updateRoom);
router.delete('/:id', protect, adminOnly, deleteRoom);

export default router;
