import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userRole, setUserRole] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if email needs verification
        if (data.needsVerification) {
          // Redirect to verification page
          navigate('/verify-email', {
            state: {
              userId: data.userId,
              email: data.email,
            },
          });
          return;
        }
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data in localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Show success message with role
      setUserRole(data.data.user.role);
      setSuccess(true);
      
      // Redirect based on user role after 1.5 seconds
      setTimeout(() => {
        if (data.data.user.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (data.data.user.role === 'staff') {
          navigate('/staff-dashboard');
        } else {
          navigate('/browse-pets');
        }
      }, 1500);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🐾</span>
            </div>
            <span className="text-2xl font-bold">
              Pet<span className="text-orange-500">Adopt+</span>
            </span>
          </Link>

          {/* Back to Home */}
          <Link
            to="/"
            className="text-gray-900 font-medium hover:text-orange-500 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* Login Form Section */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome Back! 👋
            </h1>
            <p className="text-gray-600">
              Log in to continue caring for your pets
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-center space-x-3 animate-bounce">
              <div className="text-2xl">✅</div>
              <div>
                <p className="text-green-800 font-semibold">Login Successful!</p>
                <p className="text-green-600 text-sm">
                  {userRole === 'admin' && 'Redirecting to Admin Dashboard...'}
                  {userRole === 'staff' && 'Redirecting to Staff Dashboard...'}
                  {userRole !== 'admin' && userRole !== 'staff' && 'Redirecting you now...'}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-500 rounded-xl p-4 flex items-center space-x-3">
              <div className="text-2xl">❌</div>
              <div>
                <p className="text-red-800 font-semibold">Login Failed</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                  placeholder="Enter your password"
                />
              </div>

              {/* Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <a href="/forgot-password" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                  Forgot Password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  'Log In'
                )}
              </button>

              
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-orange-500 hover:text-orange-600 font-semibold">
                  Sign up now
                </Link>
              </p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="mt-8 flex justify-center space-x-4">
            <div className="text-4xl animate-bounce">🐕</div>
            <div className="text-4xl animate-bounce" style={{ animationDelay: '0.1s' }}>🐱</div>
            <div className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>🐾</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;