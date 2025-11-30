import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        navigate('/login');
        return;
      }

      const parsedUser = JSON.parse(userData);
      
      if (parsedUser.role !== 'user') {
        navigate('/admin-dashboard');
        return;
      }

      // Fetch fresh user data from server
      try {
        const response = await fetch('http://localhost:4000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const freshUser = data.data.user;
          
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(freshUser));
          
          setUser(freshUser);
          setProfileForm({
            fullName: freshUser.fullName || '',
            email: freshUser.email || '',
            phone: freshUser.phone || '',
            address: freshUser.address || '',
            city: freshUser.city || '',
            country: freshUser.country || ''
          });
        } else {
          // If fetch fails, use cached data
          setUser(parsedUser);
          setProfileForm({
            fullName: parsedUser.fullName || '',
            email: parsedUser.email || '',
            phone: parsedUser.phone || '',
            address: parsedUser.address || '',
            city: parsedUser.city || '',
            country: parsedUser.country || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Use cached data on error
        setUser(parsedUser);
        setProfileForm({
          fullName: parsedUser.fullName || '',
          email: parsedUser.email || '',
          phone: parsedUser.phone || '',
          address: parsedUser.address || '',
          city: parsedUser.city || '',
          country: parsedUser.country || ''
        });
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      const updatedUser = { ...user, ...profileForm };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSuccess('✅ Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      setSuccess('✅ Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🐾</span>
            </div>
            <span className="text-2xl font-bold">
              Pet<span className="text-orange-500">Adopt+</span>
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">
              Dashboard
            </Link>
            <Link to="/user-profile" className="text-orange-500 font-medium">
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-2">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-4xl text-white font-bold shadow-lg">
              {user.fullName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user.fullName}
              </h1>
              <p className="text-gray-600 flex items-center space-x-2">
                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold">
                  🐾 Pet Lover
                </span>
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-500 rounded-xl p-4 flex items-center space-x-3">
            <div className="text-2xl">❌</div>
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-center space-x-3">
            <div className="text-2xl">✅</div>
            <p className="text-green-800">{success}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                👤 Profile Information
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'security'
                    ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                🔒 Security
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'account'
                    ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                ⚙️ Account Details
              </button>
            </div>
          </div>

          <div className="p-8">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Address</label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">City</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Country</label>
                    <input
                      type="text"
                      value={profileForm.country}
                      onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="United States"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handlePasswordChange} className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors pr-12"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors pr-12"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors pr-12"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-orange-50 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                      <span>📧</span>
                      <span>Email</span>
                    </h3>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                  <div className="p-6 bg-orange-50 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                      <span>🐾</span>
                      <span>Role</span>
                    </h3>
                    <p className="text-gray-600 capitalize">{user.role}</p>
                  </div>
                  <div className="p-6 bg-orange-50 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                      <span>✅</span>
                      <span>Email Verified</span>
                    </h3>
                    <p className="text-gray-600">{user.isVerified ? 'true' : 'false'}</p>
                  </div>
                  <div className="p-6 bg-orange-50 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                      <span>📅</span>
                      <span>Account Created</span>
                    </h3>
                    <p className="text-gray-600">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;