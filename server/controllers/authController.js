const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required'
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        businessName: user.businessName,
        currency: user.currency
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      {
        userId: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        businessName: user.businessName,
        currency: user.currency
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        businessName: user.businessName || '',
        currency: user.currency || 'PKR'
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to load profile'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      businessName,
      currency
    } = req.body;

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({
        message: 'Name and email are required'
      });
    }

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
      _id: { $ne: req.user.userId }
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'This email is already in use'
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    user.name = name.trim();
    user.email = email.trim().toLowerCase();
    user.phone = phone?.trim() || '';
    user.businessName = businessName?.trim() || '';
    user.currency = currency || 'PKR';

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        businessName: user.businessName,
        currency: user.currency
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update profile'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};