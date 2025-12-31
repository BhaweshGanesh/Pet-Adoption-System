import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './Routes/Auth.js';
import petRoutes from './Routes/Pets.js';
import adoptionRoutes from './Routes/AdoptionApplications.js';
import uploadRoutes from './Routes/Upload.js';
import productRoutes from './Routes/Products.js';
import orderRoutes from './Routes/Orders.js';
import hostelRoomRoutes from './Routes/HostelRooms.js';
import hostelBookingRoutes from './Routes/HostelBookings.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/petadopt';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/adoptions', adoptionRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/hostel-rooms', hostelRoomRoutes);
app.use('/api/hostel-bookings', hostelBookingRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'PetAdopt+ API is running' });
});

// Start server
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
