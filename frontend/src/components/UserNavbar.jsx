import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const UserNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Edit profile form
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    country: '',
  });

  // Change password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch user profile
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch('http://localhost:4000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        const user = data.data.user;
        
        // Check if user role matches - if staff/admin, redirect to appropriate dashboard
        console.log('[UserNavbar] Fetched profile:', { role: user.role, name: user.fullName });
        
        if (user.role === 'staff') {
          console.log('[UserNavbar] Staff user detected, redirecting to staff dashboard');
          navigate('/staff-dashboard');
          return;
        } else if (user.role === 'admin') {
          console.log('[UserNavbar] Admin user detected, redirecting to admin dashboard');
          navigate('/admin-dashboard');
          return;
        }
        
        // Only set profile for regular users
        setUserProfile(user);
        
        // Update localStorage with correct user data
        localStorage.setItem('user', JSON.stringify(user));
        
        setProfileForm({
          fullName: user.fullName || '',
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
          country: user.country || '',
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      // Clear all user-related data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      navigate('/login');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });

      const data = await response.json();
      if (data.success) {
        alert('Profile updated successfully!');
        setUserProfile(data.data.user);
        localStorage.setItem('userName', data.data.user.fullName);
        setIsEditModalOpen(false);
        fetchUserProfile();
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Password changed successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setIsChangePasswordOpen(false);
      } else {
        alert(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadgeColor = (isVerified) => {
    return isVerified 
      ? 'bg-emerald-100 text-emerald-700' 
      : 'bg-orange-100 text-orange-700';
  };

  const isActive = (path) => location.pathname === path;
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <>
      <nav className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-40">
        <div className="max-w-full mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🐾</span>
            </div>
            <span className="text-2xl font-bold">
              Pet<span className="text-orange-500">Adopt+</span>
            </span>
          </Link>

          {/* Navigation Links + Right Side */}
          <div className="flex items-center gap-16 pr-8">
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/browse-pets" 
                className={`font-medium ${isActive('/browse-pets') ? 'text-orange-500' : 'text-gray-700 hover:text-orange-500'} transition-colors`}
              >
                Browse Pets
              </Link>
              <Link 
                to="/shop" 
                className={`font-medium ${isActive('/shop') ? 'text-orange-500' : 'text-gray-700 hover:text-orange-500'} transition-colors`}
              >
                Shop
              </Link>
              <Link 
                to="/hostel" 
                className={`font-medium ${isActive('/hostel') ? 'text-orange-500' : 'text-gray-700 hover:text-orange-500'} transition-colors`}
              >
                Hostel
              </Link>
              {isLoggedIn && (
                <Link 
                  to="/my-adoptions" 
                  className={`font-medium ${isActive('/my-adoptions') ? 'text-orange-500' : 'text-gray-700 hover:text-orange-500'} transition-colors`}
                >
                  My Adoptions
                </Link>
              )}
            </div>

            {/* Right Side - Auth/Profile */}
            <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Link 
                  to="/cart" 
                  className="relative p-2 text-gray-700 hover:text-orange-500 hover:bg-slate-50 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center hover:opacity-90 transition-opacity"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-semibold text-sm shadow-sm">
                      {getInitials(userProfile?.fullName || 'User')}
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                      {/* Profile Info */}
                      <div className="px-4 py-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-semibold">
                            {getInitials(userProfile?.fullName || 'User')}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 text-sm">
                              {userProfile?.fullName || 'User'}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {userProfile?.email || 'user@example.com'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            {userProfile?.role || 'User'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(userProfile?.isVerified)}`}>
                            {userProfile?.isVerified ? 'Active' : 'Pending'}
                          </span>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate('/my-adoptions');
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          My Adoptions
                        </button>
                        <button
                          onClick={() => {
                            setIsEditModalOpen(true);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit Profile
                        </button>
                        <button
                          onClick={() => {
                            setIsChangePasswordOpen(true);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          Change Password
                        </button>
                        <hr className="my-1 border-slate-100" />
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="font-medium text-gray-700 hover:text-orange-500 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
            </div>
          </div>
        </div>
      </nav>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Edit Profile</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={profileForm.country}
                    onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 font-medium text-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Change Password</h3>
              <button
                onClick={() => setIsChangePasswordOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                  minLength={6}
                />
                <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangePasswordOpen(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 font-medium text-sm"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserNavbar;
