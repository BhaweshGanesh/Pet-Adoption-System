import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landingpage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import UserDashboard from './pages/UserDashboard';
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
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import AdoptionService from './pages/AdoptionService';
import PetHostelService from './pages/PetHostelService';
import PetStoreService from './pages/PetStoreService';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/admin-profile" element={<AdminProfile />} />
        <Route path="/forgot-password" element={<Forgotpassword />} />
        <Route path="/browse-pets" element={<BrowsePets />} />
        <Route path="/pet-details/:id" element={<PetDetails />} />
        <Route path="/adopt/:id" element={<AdoptionForm />} />
        <Route path="/vaccinations/:id" element={<VaccinationDetails />} />
        <Route path="/admin-pets-management" element={<AdminPetsManagement />} />
        <Route path="/admin-inventory-management" element={<AdminInventoryManagement />} />
        <Route path="/admin-hostel-management" element={<HostelManagement />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/adoption-service" element={<AdoptionService />} />
        <Route path="/hostel-service" element={<PetHostelService />} />
        <Route path="/store-service" element={<PetStoreService />} />
      </Routes>
    </Router>
  );
}

export default App;
