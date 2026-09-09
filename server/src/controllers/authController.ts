import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { FarmerProfile } from '../models/FarmerProfile';
import { BuyerProfile } from '../models/BuyerProfile';
import { AuthRequest } from '../middleware/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'farmsetu_super_secret_jwt_key_sih2026_prototype';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, phone, email, password, role, location, profileDetails } = req.body;

    if (!name || !phone || !password || !role || !location) {
      return res.status(400).json({ error: 'Missing required fields (name, phone, password, role, location).' });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this phone number already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      phone,
      email,
      passwordHash,
      role,
      location
    });

    if (role === 'FARMER') {
      await FarmerProfile.create({
        userId: newUser._id,
        farmSizeAcres: profileDetails?.farmSizeAcres || 5,
        preferredLanguage: profileDetails?.preferredLanguage || 'en',
        bankAccountVerified: true
      });
    } else if (role === 'BUYER') {
      await BuyerProfile.create({
        userId: newUser._id,
        businessName: profileDetails?.businessName || `${name}'s Trading Co`,
        businessType: profileDetails?.businessType || 'WHOLESALER',
        verificationStatus: 'VERIFIED',
        reliabilityScore: 90,
        preferredCrops: profileDetails?.preferredCrops || ['Tomato', 'Onion'],
        location
      });
    }

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, name: newUser.name, phone: newUser.phone, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        role: newUser.role,
        location: newUser.location
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required.' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ error: 'Invalid phone or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid phone or password.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, phone: user.phone, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        location: user.location
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error during login' });
  }
};

// DEMO MODE LOGIN: Instant Zero-Credential Login
export const demoLogin = async (req: Request, res: Response) => {
  try {
    const role = (req.body.role || 'FARMER').toUpperCase();
    let user;

    if (role === 'BUYER') {
      user = await User.findOne({ email: 'buyer@farmsetu.com' });
    } else if (role === 'ADMIN') {
      user = await User.findOne({ email: 'admin@farmsetu.com' });
    } else {
      user = await User.findOne({ email: 'farmer@farmsetu.com' });
    }

    if (!user) {
      return res.status(404).json({ error: 'Demo user not found. Please run seed script.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, phone: user.phone, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: `Demo mode login successful as ${user.role}`,
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        location: user.location
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error during demo login' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let profile = null;
    if (user.role === 'FARMER') {
      profile = await FarmerProfile.findOne({ userId: user._id });
    } else if (user.role === 'BUYER') {
      profile = await BuyerProfile.findOne({ userId: user._id });
    }

    return res.json({ user, profile });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error fetching user profile' });
  }
};
