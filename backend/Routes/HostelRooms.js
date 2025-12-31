import express from 'express';
import {
  getAllRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  checkRoomAvailability,
} from '../Controller/HostelRoomController.js';

const router = express.Router();

// Public routes
router.get('/', getAllRooms);
router.get('/:id', getRoom);
router.post('/:id/check-availability', checkRoomAvailability);

// Admin routes (add protect middleware when implementing admin routes)
router.post('/', createRoom);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);

export default router;

