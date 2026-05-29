import jwt from 'jsonwebtoken';
import User from '../model/Usermodel.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id)
        .select('_id fullName email role isVerified')
        .lean()
        .exec();

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      req.user = { ...user, id: user._id.toString() };
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired',
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in authentication',
    });
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'You must be logged in to access this route',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }

    next();
  };
};

export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required',
    });
  }

  next();
};

export const staffOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Staff or admin privileges required',
    });
  }

  next();
};

export const logStaffAction = async (req, res, next) => {
  if (req.user && req.user.role === 'staff') {
    const action = {
      userId: req.user.id,
      userEmail: req.user.email,
      role: req.user.role,
      method: req.method,
      path: req.originalUrl,
      timestamp: new Date(),
      ip: req.ip || req.connection.remoteAddress,
    };

    console.log('📝 [STAFF ACTION]', JSON.stringify(action, null, 2));

  }

  next();
};
