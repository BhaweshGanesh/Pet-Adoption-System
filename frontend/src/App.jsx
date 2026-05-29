import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import SessionChecker from './components/SessionChecker';

const LandingPage = lazy(() => import('./pages/landingpage'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Forgotpassword = lazy(() => import('./pages/forgotpassword'));
const BrowsePets = lazy(() => import('./pages/BrowsePets'));
const AdoptionService = lazy(() => import('./pages/AdoptionService'));
const PetHostelService = lazy(() => import('./pages/PetHostelService'));
const PetStoreService = lazy(() => import('./pages/PetStoreService'));
const Shop = lazy(() => import('./pages/Shop'));
const AccessDenied = lazy(() => import('./pages/AccessDenied'));
const PaymentCallback = lazy(() => import('./pages/PaymentCallback'));
const PetDetails = lazy(() => import('./pages/PetDetails'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const AdoptionForm = lazy(() => import('./pages/AdoptionForm'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const UserHostelPage = lazy(() => import('./pages/UserHostelPage'));
const HostelRoomDetails = lazy(() => import('./pages/HostelRoomDetails'));
const MyAdoptions = lazy(() => import('./pages/MyAdoptions'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminProfile = lazy(() => import('./pages/AdminProfile'));
const AdminPetsManagement = lazy(() => import('./pages/AdminPetsManagement'));
const AdminInventoryManagement = lazy(() => import('./pages/AdminInventoryManagement'));
const HostelManagement = lazy(() => import('./pages/HostelManagement'));
const HostelBookingsManagement = lazy(() => import('./pages/HostelBookingsManagement'));
const VaccinationDetails = lazy(() => import('./pages/VaccinationDetails'));
const StaffManagement = lazy(() => import('./pages/StaffManagement'));
const StaffDashboard = lazy(() => import('./pages/StaffDashboard'));
const StaffRooms = lazy(() => import('./pages/StaffRooms'));
const StaffBookings = lazy(() => import('./pages/StaffBookings'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <SessionChecker />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<Forgotpassword />} />
          <Route path="/browse-pets" element={<BrowsePets />} />
          <Route path="/adoption-service" element={<AdoptionService />} />
          <Route path="/hostel-service" element={<PetHostelService />} />
          <Route path="/store-service" element={<PetStoreService />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route path="/payment-callback" element={<PaymentCallback />} />

          <Route path="/pet-details/:id" element={<ProtectedRoute requireAuth={true}><PetDetails /></ProtectedRoute>} />
          <Route path="/product/:id" element={<ProtectedRoute requireAuth={true}><ProductDetails /></ProtectedRoute>} />

          <Route path="/user-profile" element={<ProtectedRoute requireAuth={true}><UserProfile /></ProtectedRoute>} />
          <Route path="/adopt/:id" element={<ProtectedRoute requireAuth={true}><AdoptionForm /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute requireAuth={true}><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute requireAuth={true}><Checkout /></ProtectedRoute>} />
          <Route path="/order-success" element={<ProtectedRoute requireAuth={true}><OrderSuccess /></ProtectedRoute>} />
          <Route path="/hostel" element={<ProtectedRoute requireAuth={true}><UserHostelPage /></ProtectedRoute>} />
          <Route path="/hostel/room/:id" element={<ProtectedRoute requireAuth={true}><HostelRoomDetails /></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute requireAuth={true}><MyOrders /></ProtectedRoute>} />
          <Route path="/my-adoptions" element={<ProtectedRoute requireAuth={true}><MyAdoptions /></ProtectedRoute>} />

          <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin-profile" element={<ProtectedRoute allowedRoles={['admin']}><AdminProfile /></ProtectedRoute>} />
          <Route path="/admin-pets-management" element={<ProtectedRoute allowedRoles={['admin']}><AdminPetsManagement /></ProtectedRoute>} />
          <Route path="/admin-inventory-management" element={<ProtectedRoute allowedRoles={['admin']}><AdminInventoryManagement /></ProtectedRoute>} />
          <Route path="/admin-hostel-management" element={<ProtectedRoute allowedRoles={['admin']}><HostelManagement /></ProtectedRoute>} />
          <Route path="/hostel-bookings" element={<ProtectedRoute allowedRoles={['admin']}><HostelBookingsManagement /></ProtectedRoute>} />
          <Route path="/vaccinations/:id" element={<ProtectedRoute allowedRoles={['admin', 'staff', 'user']}><VaccinationDetails /></ProtectedRoute>} />
          <Route path="/admin-staff-management" element={<ProtectedRoute allowedRoles={['admin']}><StaffManagement /></ProtectedRoute>} />

          <Route path="/staff-dashboard" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffDashboard /></ProtectedRoute>} />
          <Route path="/staff-rooms" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffRooms /></ProtectedRoute>} />
          <Route path="/staff-bookings" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffBookings /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
