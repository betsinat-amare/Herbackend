import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// 📴 Removed sendSms import (no longer needed)
// import { sendSms } from './smsController.js';

export const register = async (req, res) => {
  try {
    const { fullName, email, password, phone, nationalID, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    const existingAgent = await prisma.agent.findUnique({ where: { email } });

    if (existingUser || existingAgent) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let newUser;

    if (role === 'agent') {
      newUser = await prisma.agent.create({
        data: {
          fullName,
          email,
          password: hashedPassword,
          role: 'agent',
        },
      });
    } else {
      // ✅ All users are automatically approved now
      newUser = await prisma.user.create({
        data: {
          fullName,
          email,
          password: hashedPassword,
          phone,
          nationalID,
          role,
          phoneVerified: false,
          nationalIDVerified: false,
          isApproved: true,
        },
      });

      // 🚫 Removed OTP logic (no SMS verification)
      // const otp = crypto.randomInt(100000, 999999).toString();
      // const expiryTime = new Date(Date.now() + 5 * 60 * 1000);
      // await prisma.user.update({
      //   where: { id: newUser.id },
      //   data: { otpCode: otp, otpExpiry: expiryTime },
      // });

      // await sendSms(phone, `Your FlightBridge verification code is ${otp}`);
    }

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role || role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'User registered successfully.',
      token,
    });
  } catch (error) {
    console.error('Error during registration:', error.message);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) user = await prisma.agent.findUnique({ where: { id: userId } });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || null,
      nationalID: user.nationalID || null,
      role: user.role,
      phoneVerified: user.phoneVerified || false,
      nationalIDVerified: user.nationalIDVerified || false,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error('Error fetching user info:', err);
    res.status(500).json({ message: 'Failed to fetch user info' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    let user;
    if (role === 'agent') {
      user = await prisma.agent.findUnique({ where: { email } });
    } else {
      user = await prisma.user.findUnique({ where: { email } });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role || role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      token,
      id: user.id,
      role: user.role || role,
    });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
};

// ===== Optional: admin utilities =====
export const approveUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isApproved: true },
    });

    res.json({ message: 'User approved successfully.', user: updatedUser });
  } catch (error) {
    console.error('Error approving user:', error.message);
    res.status(500).json({ message: 'Failed to approve user.' });
  }
};

export const getPendingUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        isApproved: false,
        OR: [
          { role: { in: ['sender', 'carrier'] } },
          { role: { in: ['Sender', 'Carrier'] } },
        ],
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        phoneVerified: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching pending users:', error.message);
    res.status(500).json({ message: 'Failed to fetch pending users.' });
  }
};
