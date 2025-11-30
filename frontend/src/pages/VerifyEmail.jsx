import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);

  const userId = location.state?.userId;
  const email = location.state?.email;

  useEffect(() => {
    if (!userId || !email) {
      navigate('/signup');
    }
  }, [userId, email, navigate]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const code = verificationCode.join('');
    
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          verificationCode: code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      setSuccess(true);

      // Redirect to login page after success
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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
      const response = await fetch('http://localhost:4000/api/auth/resend-verification', {
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

      alert('✅ New verification code sent to your email!');
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📧</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-600">
            We've sent a 6-digit code to
            <br />
            <span className="font-semibold text-orange-600">{email}</span>
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-center space-x-3 animate-bounce">
            <div className="text-2xl">✅</div>
            <div>
              <p className="text-green-800 font-semibold">Email Verified!</p>
              <p className="text-green-600 text-sm">Redirecting to login...</p>
            </div>
          </div>
        )}

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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Code Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-4 text-center">
                Enter Verification Code
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
                  Verifying...
                </span>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

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

        {/* Back to Signup */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/signup')}
            className="text-gray-600 hover:text-orange-500 text-sm"
          >
            ← Back to Signup
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;