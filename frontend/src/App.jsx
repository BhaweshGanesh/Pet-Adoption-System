import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import SessionChecker from './components/SessionChecker';
import LandingPage from './pages/landingpage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import AdminProfile from './pages/AdminProfile';
import Forgotpassword from './pages/forgotpassword';
import BrowsePets from './pages/BrowsePets';
import PetDetails from './pages/PetDetails';
import AdoptionForm from './pages/AdoptionForm';
import VaccinationDetails from './pages/VaccinationDetails';
import AdminPetsManagement from "./pages/AdminPetsManagement";
import AdminInventoryManagement from './pages/AdminInventoryManagement';
import HostelManagement from "./pages/HostelManagement";
import HostelBookingsManagement from "./pages/HostelBookingsManagement";
import StaffManagement from './pages/StaffManagement';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import AdoptionService from './pages/AdoptionService';
import PetHostelService from './pages/PetHostelService';
import PetStoreService from './pages/PetStoreService';
import UserHostelPage from './pages/UserHostelPage';

// Staff Pages
import StaffDashboard from './pages/StaffDashboard';
import StaffRooms from './pages/StaffRooms';
import StaffBookings from './pages/StaffBookings';
import AccessDenied from './pages/AccessDenied';

function App() {
  return (
    <Router>
      {/* Session Checker - Runs in background to validate session */}
      <SessionChecker />
      
      <Routes>
        {/* Public Routes - No Authentication Required */}
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
        
        {/* Semi-Protected Routes - Can view but need login for interactions */}
        <Route 
          path="/pet-details/:id" 
          element={
            <ProtectedRoute requireAuth={true}>
              <PetDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/product/:id" 
          element={
            <ProtectedRoute requireAuth={true}>
              <ProductDetails />
            </ProtectedRoute>
          } 
        />
        
        {/* User Routes - Require Authentication (Any Logged-in User) */}
        <Route 
          path="/user-profile" 
          element={
            <ProtectedRoute requireAuth={true}>
              <UserProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/adopt/:id" 
          element={
            <ProtectedRoute requireAuth={true}>
              <AdoptionForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cart" 
          element={
            <ProtectedRoute requireAuth={true}>
              <Cart />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute requireAuth={true}>
              <Checkout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/order-success" 
          element={
            <ProtectedRoute requireAuth={true}>
              <OrderSuccess />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/hostel" 
          element={
            <ProtectedRoute requireAuth={true}>
              <UserHostelPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Only Routes */}
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-profile" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-pets-management" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPetsManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-inventory-management" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminInventoryManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-hostel-management" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <HostelManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/hostel-bookings" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <HostelBookingsManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/vaccinations/:id" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <VaccinationDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-staff-management" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StaffManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* Staff and Admin Routes */}
        <Route 
          path="/staff-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <StaffDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff-rooms" 
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <StaffRooms />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff-bookings" 
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <StaffBookings />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
