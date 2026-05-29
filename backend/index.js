import 'dotenv/config';
import express from 'express';
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
import paymentRoutes from './Routes/Payments.js';

const app = express();
const PORT = process.env.PORT || 4000;

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

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} already in use. Kill the old process and restart.`);
    process.exit(1);
  }
});

console.log('🔄 Connecting to MongoDB...');
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/petadopt', {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000,
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('   Check MONGODB_URI in backend/.env');
    process.exit(1);
  });

process.on('SIGINT', () => {
  server.close(() => {
    mongoose.connection.close().then(() => process.exit(0));
  });
});

process.on('SIGTERM', () => {
  server.close(() => {
    mongoose.connection.close().then(() => process.exit(0));
  });
});
