import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token missing or malformed.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      user = await prisma.agent.findUnique({ where: { id: decoded.id } });
      if (!user) {
        return res.status(401).json({ message: 'User not found. Invalid token.' });
      }
    }
    req.user = user; 
    next();

  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ message: 'Unauthorized. Invalid or expired token.' });
  }
};
