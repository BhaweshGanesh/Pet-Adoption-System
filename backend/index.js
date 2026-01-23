import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import compression from 'compression';
import authRoutes from './Routes/Auth.js';
import petRoutes from './Routes/Pets.js';
import adoptionRoutes from './Routes/AdoptionApplications.js';
import uploadRoutes from './Routes/Upload.js';
import productRoutes from './Routes/Products.js';
import orderRoutes from './Routes/Orders.js';
import hostelRoomRoutes from './Routes/HostelRooms.js';
import hostelBookingRoutes from './Routes/HostelBookings.js';
import staffRoutes from './Routes/Staff.js';
import dashboardRoutes from './Routes/Dashboard.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
// Configure CORS properly for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Enable compression for faster response times
app.use(compression());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/petadopt';

console.log('🔄 Connecting to MongoDB...');
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('💡 Tip: Check your internet connection and MongoDB Atlas credentials');
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
app.use('/api/staff', staffRoutes);
app.use('/api/dashboard', dashboardRoutes);


// Start server
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
