import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import compression from 'compression';
import { execSync } from 'child_process';
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
import paymentRoutes from './Routes/Payments.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Allow any localhost port (Vite can use 5173, 5174, etc.)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
app.use('/api/payments', paymentRoutes);

// Kill stale process on port then start after MongoDB connects
try { execSync(`lsof -ti:${PORT} | xargs kill -9`, { stdio: 'ignore' }); } catch { /* port was free */ }

console.log('🔄 Connecting to MongoDB...');
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/petadopt')
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        try { execSync(`lsof -ti:${PORT} | xargs kill -9`, { stdio: 'ignore' }); } catch { /* ignore */ }
        setTimeout(() => server.listen(PORT), 1000);
      }
    });
    process.on('SIGINT', () => server.close(() => mongoose.connection.close(false, () => process.exit(0))));
    process.on('SIGTERM', () => server.close(() => mongoose.connection.close(false, () => process.exit(0))));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
