import express from 'express';
import { body } from 'express-validator';
import { signup, login, getMe, verifyEmail, resendVerificationCode, forgotPassword, verifyResetCode, resetPassword, updateProfile, changePassword } from '../Controller/AuthController.js';
import { protect } from '../Middleware/Auth.js';
import { validate } from '../Middleware/Validate.js';

const router = express.Router();

// Validation rules
const signupValidation = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const verifyEmailValidation = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('verificationCode')
    .notEmpty()
    .withMessage('Verification code is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification code must be 6 digits'),
];

const resendVerificationValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
];

// Authentication routes
router.post('/signup', signupValidation, validate, signup);
router.post('/login', loginValidation, validate, login);
router.get('/me', protect, getMe);

// Email verification routes
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationValidation, validate, resendVerificationCode);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

// Profile routes
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;