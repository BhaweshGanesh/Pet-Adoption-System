import express from 'express';
import { body } from 'express-validator';
import { signup, login, getMe, verifyEmail, resendVerificationCode, hi, forgotPassword, verifyResetCode, resetPassword, updateProfile, changePassword } from '../Controller/AuthController.js';
import { protect } from '../Middleware/Auth.js';
import { validate } from '../Middleware/Validate.js';

const router = express.Router();

console.log('🔧 Auth Routes file loaded successfully');

// TEST: Simple routes without validation
router.get('/test1', (req, res) => {
  console.log('✅ Test1 route hit');
  res.json({ message: 'Test 1 works' });
});

router.post('/test2', (req, res) => {
  console.log('✅ Test2 route hit');
  res.json({ message: 'Test 2 works' });
});

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

// Routes
router.post('/signup', signupValidation, validate, signup);
router.post('/login', loginValidation, validate, login);
router.get('/test3', (req, res) => res.json({ message: 'Test 3 works' }));
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationValidation, validate, resendVerificationCode);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);
router.get('/hi', hi);

router.get('/me', protect, getMe);

// Profile routes
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;