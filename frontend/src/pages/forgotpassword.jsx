import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = email input, 2 = code verification, 3 = reset password
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const navigate = useNavigate();

  // Step 1: Send Reset Code
  const handleSendCode = async () => {
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset code');
      }

      setStep(2); // Move to code verification step
    } catch (err) {
      setError(err.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Code
  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    setSuccess(false);

    const code = verificationCode.join('');
    
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/auth/verify-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          resetCode: code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      // Store reset token for password reset
      setResetToken(data.data?.resetToken || code);
      setStep(3); // Move to reset password step
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setError('');

    try {
      const response = await fetch('http://localhost:4000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend code');
      }

      alert('✅ New reset code sent to your email!');
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    setError('');
    setSuccess(false);

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          resetToken,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }

      setSuccess(true);

      // Redirect to login page after success
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendCode();
    }
  };

  const handlePasswordKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleResetPassword();
    }
  };

  // Step 1: Email Input Page
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-600">
              No worries! Enter your email and we'll send you a reset code.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-500 rounded-xl p-4 flex items-center space-x-3">
              <div className="text-2xl">❌</div>
              <div>
                <p className="text-red-800 font-semibold">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Email Form */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleEmailKeyPress}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                  autoFocus
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSendCode}
                disabled={loading}
                className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Code...
                  </span>
                ) : (
                  'Send Reset Code'
                )}
              </button>
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-orange-50 rounded-xl">
              <p className="text-sm text-gray-600 text-center">
                📧 We'll send a 6-digit code to your email
              </p>
            </div>
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-600 hover:text-orange-500 text-sm"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Code Verification Page
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📧</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Check Your Email
            </h1>
            <p className="text-gray-600">
              We've sent a 6-digit code to
              <br />
              <span className="font-semibold text-orange-600">{email}</span>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-500 rounded-xl p-4 flex items-center space-x-3">
              <div className="text-2xl">❌</div>
              <div>
                <p className="text-red-800 font-semibold">Verification Failed</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Verification Form */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="space-y-6">
              {/* Code Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-4 text-center">
                  Enter Reset Code
                </label>
                <div className="flex justify-center space-x-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      maxLength="1"
                      value={verificationCode[index]}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleVerifyCode}
                disabled={loading}
                className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Verify Code'
                )}
              </button>
            </div>

            {/* Resend Code */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm mb-2">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResendCode}
                disabled={resending}
                className="text-orange-500 hover:text-orange-600 font-semibold text-sm disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend Code'}
              </button>
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-orange-50 rounded-xl">
              <p className="text-sm text-gray-600 text-center">
                ⏰ Code expires in 10 minutes
              </p>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setStep(1)}
              className="text-gray-600 hover:text-orange-500 text-sm"
            >
              ← Change Email Address
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Reset Password Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔑</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600">
            Create a new password for your account
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-center space-x-3 animate-bounce">
            <div className="text-2xl">✅</div>
            <div>
              <p className="text-green-800 font-semibold">Password Reset Successfully!</p>
              <p className="text-green-600 text-sm">Redirecting to login...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-500 rounded-xl p-4 flex items-center space-x-3">
            <div className="text-2xl">❌</div>
            <div>
              <p className="text-red-800 font-semibold">Reset Failed</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Reset Password Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="space-y-6">
            {/* New Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handlePasswordKeyPress}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors pr-12"
                  autoFocus
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  type="button"
                >
                  {showPassword ? (
                    <span className="text-xl">👁️</span>
                  ) : (
                    <span className="text-xl">👁️‍🗨️</span>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters
              </p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handlePasswordKeyPress}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors pr-12"
                />
                <button
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  type="button"
                >
                  {showConfirmPassword ? (
                    <span className="text-xl">👁️</span>
                  ) : (
                    <span className="text-xl">👁️‍🗨️</span>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting Password...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-orange-50 rounded-xl">
            <p className="text-sm text-gray-600 text-center">
              🔒 Your password will be securely encrypted
            </p>
          </div>
        </div>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link to="/login" className="text-gray-600 hover:text-orange-500 text-sm">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

