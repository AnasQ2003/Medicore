const User = require('../models/User');
const { comparePassword } = require('../utils/passwordHelper');
const { generateToken } = require('../utils/jwtHelper');
const { sendPasswordResetEmail } = require('../utils/emailService');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    const user = await User.findByEmail(email);

    if (user && (await comparePassword(password, user.password))) {
      await User.updateLastLogin(user.id);
      
      const token = generateToken({ id: user.id, email: user.email, role: user.role });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          patientCode: user.patientCode || null,
          token
        }
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, role, gender, age, bloodGroup } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400);
      throw new Error('Please provide name, email, password and role');
    }

    const userExists = await User.findByEmail(email);

    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email');
    }

    const newUser = await User.create({
      name,
      email,
      password,
      phone,
      address,
      role,
      gender,
      age: age ? parseInt(age) : null,
      bloodGroup
    });

    const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role });

    res.status(210).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        patientCode: newUser.patientCode || null,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        patientCode: user.patientCode,
        age: user.age,
        bloodGroup: user.bloodGroup,
        condition: user.condition,
        allergies: user.allergies ? JSON.parse(user.allergies) : [],
        chronic: user.chronic ? JSON.parse(user.chronic) : [],
        currentMeds: user.currentMeds ? JSON.parse(user.currentMeds) : [],
        emailNotifications: user.emailNotifications,
        smsNotifications: user.smsNotifications,
        pushNotifications: user.pushNotifications
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const updatedUser = await User.update(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

const checkEmail = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email required' });
    }
    const user = await User.findByEmail(email);
    const exists = !!user || ['anasahmedcp@gmail.com', 'abdulahadsip@gmail.com', 'admin@medicore.com', 'doctor@medicore.com', 'nurse@medicore.com', 'reception@medicore.com', 'patient@medicore.com'].includes(email.toLowerCase());

    // Send real Gmail via Nodemailer SMTP!
    if (exists) {
      const targetRole = user ? user.role : (role || 'User');
      const userName = user ? user.name : (email.split('@')[0]);
      sendPasswordResetEmail(email, targetRole, userName).catch(err => {
        console.error('Background email dispatch failed:', err);
      });
    }

    return res.status(200).json({
      success: true,
      exists: exists,
      email: email,
      name: user ? user.name : null,
      role: user ? user.role : null,
      emailSent: exists
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  getMe,
  updateProfile,
  checkEmail
};
