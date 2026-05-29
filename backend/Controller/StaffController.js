import User from '../model/Usermodel.js';

const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const STRONG_PASSWORD_MESSAGE =
  'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.';
import { sendWelcomeEmail } from '../utils/emailService.js';

export const getAllStaff = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;

    const query = { role: 'staff' };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status !== 'all') {
      query.isVerified = status === 'active';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const staff = await User.find(query)
      .select('-password -verificationCode -resetPasswordCode')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: staff,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff members',
    });
  }
};

export const getStaffById = async (req, res) => {
  try {
    const staff = await User.findOne({
      _id: req.params.id,
      role: 'staff',
    }).select('-password -verificationCode -resetPasswordCode');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found',
      });
    }

    res.status(200).json({
      success: true,
      data: staff,
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff member',
    });
  }
};

export const createStaff = async (req, res) => {
  try {
    const { fullName, email, password, phone, address, city, country } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use',
      });
    }

    const staff = await User.create({
      fullName,
      email,
      password,
      phone: phone || '',
      address: address || '',
      city: city || '',
      country: country || '',
      role: 'staff',
      isVerified: true,
    });

    try {
      await sendWelcomeEmail(email, fullName);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: {
        _id: staff._id,
        fullName: staff.fullName,
        email: staff.email,
        role: staff.role,
        isVerified: staff.isVerified,
        createdAt: staff.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating staff member',
    });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const { fullName, email, phone, address, city, country, isVerified } = req.body;

    const staff = await User.findOne({
      _id: req.params.id,
      role: 'staff',
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found',
      });
    }

    if (email && email !== staff.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use',
        });
      }
    }

    if (fullName) staff.fullName = fullName;
    if (email) staff.email = email;
    if (phone !== undefined) staff.phone = phone;
    if (address !== undefined) staff.address = address;
    if (city !== undefined) staff.city = city;
    if (country !== undefined) staff.country = country;
    if (isVerified !== undefined) staff.isVerified = isVerified;

    staff.role = 'staff';

    await staff.save();

    res.status(200).json({
      success: true,
      message: 'Staff member updated successfully',
      data: {
        _id: staff._id,
        fullName: staff.fullName,
        email: staff.email,
        phone: staff.phone,
        address: staff.address,
        city: staff.city,
        country: staff.country,
        role: staff.role,
        isVerified: staff.isVerified,
        updatedAt: staff.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating staff member',
    });
  }
};

export const toggleStaffStatus = async (req, res) => {
  try {
    const staff = await User.findOne({
      _id: req.params.id,
      role: 'staff',
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found',
      });
    }

    staff.isVerified = !staff.isVerified;
    await staff.save();

    res.status(200).json({
      success: true,
      message: `Staff member ${staff.isVerified ? 'activated' : 'deactivated'} successfully`,
      data: {
        _id: staff._id,
        fullName: staff.fullName,
        email: staff.email,
        isVerified: staff.isVerified,
      },
    });
  } catch (error) {
    console.error('Error toggling staff status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating staff status',
    });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const staff = await User.findOne({
      _id: req.params.id,
      role: 'staff',
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found',
      });
    }

    staff.isVerified = false;
    await staff.save();

    res.status(200).json({
      success: true,
      message: 'Staff member deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting staff member',
    });
  }
};

export const resetStaffPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || !STRONG_PASSWORD_REGEX.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: STRONG_PASSWORD_MESSAGE,
      });
    }

    const staff = await User.findOne({
      _id: req.params.id,
      role: 'staff',
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found',
      });
    }

    staff.password = newPassword;
    await staff.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
    });
  }
};
