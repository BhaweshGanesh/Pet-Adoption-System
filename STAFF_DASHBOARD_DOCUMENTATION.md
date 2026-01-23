# Staff Dashboard - Role-Based Access Control System

## 📋 Overview

A complete Staff Dashboard system with role-based access control (RBAC) for hostel management, where staff users have limited permissions to manage only hostel-related features while being restricted from admin-level operations.

## 🎯 Features Implemented

### ✅ User Roles & Permissions

**Three User Roles:**
1. **Admin** - Full system access (all features)
2. **Staff** - Limited to hostel management only
3. **User** - Standard customer access

**Staff Permissions:**
- ✅ View hostel bookings
- ✅ Update booking statuses (Pending, Confirmed, Checked-In, Checked-Out, Cancelled)
- ✅ View room availability and details
- ✅ Generate hostel reports and analytics
- ❌ Cannot create/delete bookings (admin only)
- ❌ Cannot modify room details (admin only)
- ❌ Cannot access pets, inventory, orders, or user management
- ❌ Cannot access admin dashboard or settings

### ✅ Backend Security (Role-Based Access Control)

**Middleware Functions** (`backend/Middleware/Auth.js`):
- `protect` - Verifies JWT token and authenticates user
- `restrictTo(...roles)` - Restricts access to specific roles
- `adminOnly` - Allows only admin access
- `staffOrAdmin` - Allows staff and admin access
- `logStaffAction` - Logs all staff actions for accountability

**Protected Routes** (`backend/Routes/HostelBookings.js`):
```javascript
// Staff and Admin can view and manage bookings
router.get('/', protect, staffOrAdmin, logStaffAction, getAllBookings);
router.patch('/:id/status', protect, staffOrAdmin, logStaffAction, updateBookingStatus);

// Admin only - create/delete bookings
router.post('/admin', protect, adminOnly, createAdminBooking);
router.delete('/:id', protect, adminOnly, deleteBooking);
```

### ✅ Frontend Components

**Staff Dashboard Pages:**
1. **StaffDashboard.jsx** - Main dashboard with statistics
2. **StaffHostelBookings.jsx** - Booking management
3. **StaffHostelRooms.jsx** - Room viewing
4. **StaffReports.jsx** - Analytics and reports
5. **StaffSidebar.jsx** - Navigation menu
6. **StaffNavbar.jsx** - Header with user menu

**Key Features:**
- Real-time booking status updates
- Search and filter functionality
- Detailed booking information modals
- Room availability tracking
- Date-range based reports
- Automatic role-based routing

### ✅ Security Features

**Backend:**
- JWT token verification on all routes
- Role-based middleware enforcement
- Action logging for staff activities
- Input validation and sanitization
- Error handling with proper status codes

**Frontend:**
- Token-based authentication
- Role verification before page access
- Automatic redirect if unauthorized
- Secure API calls with Authorization headers
- LocalStorage for session management

## 📁 File Structure

### Backend Files
```
backend/
├── Middleware/
│   └── Auth.js                    # Enhanced with RBAC middleware
├── Routes/
│   ├── HostelBookings.js          # Protected with staffOrAdmin
│   └── HostelRooms.js             # Protected with staffOrAdmin
└── Controller/
    ├── HostelBookingController.js # Booking management logic
    └── HostelRoomController.js    # Room management logic
```

### Frontend Files
```
frontend/src/pages/
├── StaffDashboard.jsx             # Main staff dashboard
├── StaffHostelBookings.jsx        # Booking management
├── StaffHostelRooms.jsx           # Room viewing
├── StaffReports.jsx               # Analytics
├── StaffSidebar.jsx               # Navigation
└── StaffNavbar.jsx                # Header
```

## 🚀 Setup & Installation

### 1. Backend Setup

No additional packages needed - uses existing dependencies.

**Start backend:**
```bash
cd backend
npm start
```

### 2. Frontend Setup

No additional packages needed - uses existing React setup.

**Start frontend:**
```bash
cd frontend
npm run dev
```

## 🔐 Authentication Flow

### 1. User Login
```javascript
// User logs in via /login
const response = await fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

// Store token and role
localStorage.setItem('token', data.token);
localStorage.setItem('userRole', data.user.role);
```

### 2. Role-Based Redirect
```javascript
// After login, redirect based on role
if (role === 'admin') navigate('/admin-dashboard');
if (role === 'staff') navigate('/staff-dashboard');
if (role === 'user') navigate('/dashboard');
```

### 3. Protected Page Access
```javascript
// Each staff page checks role
useEffect(() => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (!token) navigate('/login');
  if (userRole !== 'staff' && userRole !== 'admin') {
    navigate('/dashboard'); // Redirect unauthorized users
  }
}, []);
```

### 4. API Calls with Authorization
```javascript
const response = await fetch(`${API_BASE_URL}/api/hostel-bookings`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

## 📊 Staff Dashboard Features

### 1. Dashboard Overview
- Total bookings count
- Confirmed, Checked-In, and Available room stats
- Pending check-ins alert
- Recent bookings table
- Quick action buttons

### 2. Booking Management
- View all hostel bookings
- Search by booking #, pet name, room
- Filter by status (Pending, Confirmed, etc.)
- Update booking status with confirmation
- View detailed booking information
- Real-time status updates

### 3. Room Viewing
- View all hostel rooms
- Filter by status and pet type
- See room availability
- View current occupants
- Room details with facilities
- Cannot modify rooms (view-only for staff)

### 4. Reports & Analytics
- Date range filtering
- Total bookings and revenue
- Average stay duration
- Occupancy rate calculation
- Status breakdown (confirmed, cancelled, etc.)
- Exportable summary

## 🛡️ Security Implementation

### Backend Middleware Stack

**Request Flow:**
```
Client Request
    ↓
1. protect → Verify JWT token
    ↓
2. staffOrAdmin → Check role (staff or admin)
    ↓
3. logStaffAction → Log action for accountability
    ↓
4. Controller → Execute business logic
```

### Example Protected Route

```javascript
// backend/Routes/HostelBookings.js
router.patch(
  '/:id/status',
  protect,              // 1. Authenticate user
  staffOrAdmin,         // 2. Check if staff or admin
  logStaffAction,       // 3. Log the action
  updateBookingStatus   // 4. Execute controller
);
```

### Staff Action Logging

All staff actions are logged with:
- User ID and email
- User role
- HTTP method and path
- Timestamp
- IP address

```javascript
// Example log output
📝 [STAFF ACTION] {
  "userId": "677fb23c9d8e1a2b3c4d5e6f",
  "userEmail": "staff@petadopt.com",
  "role": "staff",
  "method": "PATCH",
  "path": "/api/hostel-bookings/123/status",
  "timestamp": "2026-01-18T16:30:00.000Z",
  "ip": "::1"
}
```

## 🔒 Access Control Matrix

| Feature | Admin | Staff | User |
|---------|-------|-------|------|
| View Hostel Bookings | ✅ | ✅ | ❌ |
| Update Booking Status | ✅ | ✅ | ❌ |
| Create Admin Booking | ✅ | ❌ | ❌ |
| Delete Booking | ✅ | ❌ | ❌ |
| View Hostel Rooms | ✅ | ✅ (view-only) | ✅ (public) |
| Create/Edit/Delete Rooms | ✅ | ❌ | ❌ |
| View Reports | ✅ | ✅ | ❌ |
| Manage Pets | ✅ | ❌ | ❌ |
| Manage Inventory | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ |

## 🎨 UI/UX Features

### Navigation
- **Staff Sidebar** - Only shows hostel-related menus
- **Staff Navbar** - User profile and logout
- **Role Badge** - Displays "Staff" indicator
- **Breadcrumbs** - Clear navigation path

### Design Elements
- Modern, clean interface
- Consistent orange/white color scheme
- Responsive design (mobile-friendly)
- Loading states and spinners
- Modal dialogs for details
- Status badges with color coding
- Icons for visual clarity

### Status Colors
- 🟢 **Green** - Available, Confirmed, Checked-In
- 🔴 **Red** - Occupied, Cancelled
- 🟡 **Yellow** - Pending, Under Maintenance
- ⚪ **Gray** - Checked-Out

## 🧪 Testing the System

### 1. Create a Staff User

**Option A: Direct Database**
```javascript
// Update existing user to staff role in MongoDB
db.users.updateOne(
  { email: "staff@petadopt.com" },
  { $set: { role: "staff" } }
)
```

**Option B: Signup and Modify**
1. Sign up new user via `/signup`
2. Manually update role in database to 'staff'

### 2. Test Staff Access

**Login as Staff:**
```
Email: staff@petadopt.com
Password: your_password
```

**Try accessing:**
- ✅ `/staff-dashboard` - Should work
- ✅ `/staff-hostel-bookings` - Should work
- ✅ `/staff-hostel-rooms` - Should work (view-only)
- ❌ `/admin-dashboard` - Should redirect
- ❌ `/admin-pets-management` - Should redirect

### 3. Test API Security

```bash
# Test with staff token
curl -H "Authorization: Bearer STAFF_TOKEN" \
  http://localhost:4000/api/hostel-bookings

# Expected: Success (200)

# Try admin-only endpoint
curl -H "Authorization: Bearer STAFF_TOKEN" \
  -X POST http://localhost:4000/api/hostel-bookings/admin

# Expected: 403 Forbidden
```

## 📱 Routes Summary

### Staff Routes
```
/staff-dashboard          → Main dashboard
/staff-hostel-bookings    → Booking management
/staff-hostel-rooms       → Room viewing
/staff-reports            → Analytics
```

### API Endpoints (Staff Access)
```
GET    /api/hostel-bookings          ✅ Staff + Admin
GET    /api/hostel-bookings/:id      ✅ Staff + Admin
PATCH  /api/hostel-bookings/:id/status  ✅ Staff + Admin
POST   /api/hostel-bookings/admin    ❌ Admin only
DELETE /api/hostel-bookings/:id      ❌ Admin only

GET    /api/hostel-rooms              ✅ Public
GET    /api/hostel-rooms/:id          ✅ Public
POST   /api/hostel-rooms              ❌ Admin only
PUT    /api/hostel-rooms/:id          ❌ Admin only
DELETE /api/hostel-rooms/:id          ❌ Admin only
```

## 🔧 Customization

### Add New Staff Permission

**1. Update Middleware:**
```javascript
// backend/Middleware/Auth.js
export const staffWithPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    next();
  };
};
```

**2. Apply to Route:**
```javascript
router.post('/new-feature', protect, staffWithPermission('feature_name'), controller);
```

### Add New Staff Page

**1. Create Component:**
```javascript
// frontend/src/pages/StaffNewFeature.jsx
import StaffNavbar from "./StaffNavbar";
import StaffSidebar from "./StaffSidebar";

const StaffNewFeature = () => {
  // Component logic
};
```

**2. Add Route:**
```javascript
// frontend/src/App.jsx
<Route path="/staff-new-feature" element={<StaffNewFeature />} />
```

**3. Add to Sidebar:**
```javascript
// frontend/src/pages/StaffSidebar.jsx
const items = [
  // ... existing items
  { label: "New Feature", to: "/staff-new-feature", icon: "🆕" },
];
```

## 🐛 Troubleshooting

### Issue: "Access Denied" when staff tries to access dashboard

**Solution:**
1. Check user role in database: `db.users.findOne({ email: "staff@petadopt.com" })`
2. Verify role is exactly 'staff' (lowercase)
3. Check token is valid and not expired
4. Clear browser cache and re-login

### Issue: Staff can access admin features

**Solution:**
1. Ensure middleware is applied to routes
2. Check route order (specific routes before generic ones)
3. Verify frontend route protection

### Issue: API returns 401 Unauthorized

**Solution:**
1. Check token is being sent in Authorization header
2. Verify token format: `Bearer TOKEN_HERE`
3. Check token hasn't expired
4. Ensure JWT_SECRET matches in .env

## 📈 Future Enhancements

- [ ] Permission-based RBAC (granular permissions)
- [ ] Staff user management by admin
- [ ] Audit log viewer for staff actions
- [ ] Email notifications for status changes
- [ ] Export reports to PDF/Excel
- [ ] Real-time dashboard with WebSockets
- [ ] Mobile app for staff
- [ ] QR code check-in system
- [ ] Staff performance metrics

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review error logs in browser console
3. Check backend logs for API errors
4. Verify authentication and authorization flow

---

**System Status:** ✅ Fully Operational

**Last Updated:** January 18, 2026

**Developed for:** PetAdopt+ Platform

