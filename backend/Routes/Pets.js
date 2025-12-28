import express from 'express';
import {
  getAllPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
} from '../Controller/PetController.js';
// import { protect, adminOnly } from '../Middleware/Auth.js'; // Uncomment when ready

const router = express.Router();

// Public routes
router.get('/', getAllPets);
router.get('/:id', getPetById);

// Admin routes (add auth middleware when ready)
router.post('/', createPet); // Add: protect, adminOnly
router.put('/:id', updatePet); // Add: protect, adminOnly
router.delete('/:id', deletePet); // Add: protect, adminOnly

export default router;