import User from '../model/Usermodel.js';
import jwt from 'jsonwebtoken';
import { generateVerificationCode, sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from '../utils/emailService.js';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create new user with verification code
    const user = await User.create({
      fullName,
      email,
      password,
      isVerified: false, // Require verification
      verificationCode,
      verificationCodeExpiry,
    });

    // Send verification email — non-blocking so signup always succeeds
    try {
      await sendVerificationEmail(email, fullName, verificationCode);
      console.log(`✅ Verification email sent to: ${email}`);
    } catch (emailErr) {
      console.error('❌ Email failed:', emailErr.message);
      console.log(`📋 Verification code for ${email}: ${verificationCode}`);
      console.log('   → To fix 535: set EMAIL_PASS in backend/.env to a Gmail App Password (https://myaccount.google.com/apppasswords)');
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for verification code.',
      data: {
        userId: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating user',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if password matches
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
        needsVerification: true,
        userId: user._id,
        email: user.email,
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error logging in',
    });
  }
};

// @desc    Verify email with code
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { userId, verificationCode } = req.body;

    if (!userId || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'User ID and verification code are required',
      });
    }

    // Find user with verification code
    const user = await User.findById(userId).select('+verificationCode +verificationCodeExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified',
      });
    }

    // Check if code expired
    if (user.verificationCodeExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.',
      });
    }

    // Check if code matches
    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code',
      });
    }

    // Verify user
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiry = undefined;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.fullName);

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          address: user.address,
          city: user.city,
          country: user.country,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error verifying email',
    });
  }
};

// @desc    Resend verification code
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ email }).select('+verificationCode +verificationCodeExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified',
      });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.verificationCode = verificationCode;
    user.verificationCodeExpiry = verificationCodeExpiry;
    await user.save();

    // Send new verification email
    await sendVerificationEmail(user.email, user.fullName, verificationCode);

    res.status(200).json({
      success: true,
      message: 'New verification code sent to your email',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error resending verification code',
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          address: user.address,
          city: user.city,
          country: user.country,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user data',
    });
  }
};

export const hi = async (req, res) => {
  try {
    res.send("hello");
  } catch (err) {
    res.status(500).send("Server error");
  }
};

// @desc    Send password reset code
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset code',
      });
    }

    // Generate reset code
    const resetCode = generateVerificationCode();
    const resetCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save reset code to user
    user.resetPasswordCode = resetCode;
    user.resetPasswordCodeExpiry = resetCodeExpiry;
    await user.save();

    // Send password reset email
    await sendPasswordResetEmail(email, user.fullName, resetCode);

    res.status(200).json({
      success: true,
      message: 'Password reset code sent to your email',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing password reset request',
    });
  }
};

// @desc    Verify password reset code
// @route   POST /api/auth/verify-reset-code
// @access  Public
export const verifyResetCode = async (req, res) => {
  try {
    const { email, resetCode } = req.body;

    if (!email || !resetCode) {
      return res.status(400).json({
        success: false,
        message: 'Email and reset code are required',
      });
    }

    // Find user with reset code
    const user = await User.findOne({ email }).select('+resetPasswordCode +resetPasswordCodeExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if reset code exists
    if (!user.resetPasswordCode) {
      return res.status(400).json({
        success: false,
        message: 'No password reset request found. Please request a new code.',
      });
    }

    // Check if code expired
    if (user.resetPasswordCodeExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Reset code has expired. Please request a new one.',
      });
    }

    // Check if code matches
    if (user.resetPasswordCode !== resetCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset code',
      });
    }

    // Code is valid, return success with userId for next step
    res.status(200).json({
      success: true,
      message: 'Reset code verified successfully',
      data: {
        userId: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error verifying reset code',
    });
  }
};

// @desc    Reset password with verified code
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email,resetToken, newPassword } = req.body;

    if (!email || !resetToken|| !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, resetToken, and new password are required',
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Find user with reset code
    const user = await User.findOne({ email }).select('+resetPasswordCode +resetPasswordCodeExpiry +password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if reset code exists
    if (!user.resetPasswordCode) {
      return res.status(400).json({
        success: false,
        message: 'No password reset request found',
      });
    }

    // Check if code expired
    if (user.resetPasswordCodeExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Reset code has expired',
      });
    }

    // Check if code matches
    if (user.resetPasswordCode !== resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset code',
      });
    }

    // Update password and clear reset code
    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordCodeExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error resetting password',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, address, city, country } = req.body;

    // Find user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fields if provided
    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (country !== undefined) user.country = country;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          address: user.address,
          city: user.city,
          country: user.country,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile',
    });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password',
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    // Find user with password
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if current password matches
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error changing password',
    });
  }
};