import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import prisma from './config/db.js';
import authRoute from './routes/authRoute.js';
// import otpRoute from './routes/otpRoute.js';
// import smsRoute from './routes/smsRoute.js';
import flightRoute from './routes/flightRoute.js';
import testRoute from './routes/testRoute.js';
import senderRoute from './routes/senderRoute.js';
import receiverRoute from './routes/receiverRoute.js';
import paymentRoute from './routes/paymentRoute.js';
import supportRoute from './routes/supportRoutes.js';
import pointsRoute from './routes/pointsRoute.js';
import carrierProfileRoute from "./routes/carrierProfileRoute.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoute);
// app.use('/api/otp', otpRoute);
// app.use('/api/sms', smsRoute);
app.use('/api/flights', flightRoute);
app.use('/api/sender', senderRoute);
app.use('/api/receiver', receiverRoute);
app.use('/api/payment', paymentRoute);
app.use('/api', testRoute);
app.use('/api/support', supportRoute);
app.use('/api/points', pointsRoute);
app.use("/api/carrier/profile", carrierProfileRoute);

const server = http.createServer(app);
const io = new Server(server, { 
  cors: { origin: '*', methods: ['GET', 'POST'] }
});
io.on('connection', (socket) => {
  console.log('🟢 New client connected:', socket.id);
  socket.on('joinRoom', async (roomId) => {
    try {
      if (!roomId) return;
      socket.join(roomId);
      console.log(`📩 Socket ${socket.id} joined room ${roomId}`);

      const messages = await prisma.supportMessage.findMany({
        where: { userId: roomId },
        orderBy: { createdAt: 'asc' },
      });

      socket.emit('loadMessages', messages);
    } catch (error) {
      console.error('❌ Error loading messages:', error);
    }
  });
  socket.on('leaveRoom', (roomId) => {
    try {
      socket.leave(roomId);
      console.log(`🚪 Socket ${socket.id} left room ${roomId}`);
    } catch (error) {
      console.error('❌ Error leaving room:', error);
    }
  });
  socket.on('sendMessage', async ({ userId, agentId, sentBy, message }) => {
    try {
      if (!userId || !message?.trim()) return;

      const newMessage = await prisma.supportMessage.create({
        data: {
          userId,
          agentId: agentId || null,
          sentBy,
          message: message.trim(),
        },
      });

      console.log(`💾 Message saved for user ${userId} (${sentBy})`);
      io.to(userId).emit('receiveMessage', newMessage);
      io.emit('newUserMessage', newMessage);
    } catch (error) {
      console.error('❌ Error saving message:', error);
    }
  });
  socket.on('getUsersWithMessages', async (agentId) => {
    try {
      const whereFilter = agentId
        ? { OR: [{ agentId: null }, { agentId }] }
        : {};

      const usersWithMessages = await prisma.supportMessage.groupBy({
        by: ['userId'],
        _max: { createdAt: true },
        _count: { id: true },
        where: whereFilter,
      });

      const list = await Promise.all(
        usersWithMessages.map(async (u) => {
          const user = await prisma.user.findUnique({ where: { id: u.userId } });
          const lastMessage = await prisma.supportMessage.findFirst({
            where: { userId: u.userId },
            orderBy: { createdAt: 'desc' },
          });

          return {
            userId: u.userId,
            userName: user?.fullName || `User-${u.userId.substring(0, 4)}`,
            lastMessage: lastMessage?.message || '',
            lastCreatedAt: u._max.createdAt,
            unreadCount: u._count.id,
          };
        })
      );

      socket.emit('usersList', list);
    } catch (err) {
      console.error('❌ Error fetching users with messages:', err);
      socket.emit('usersList', []);
    }
  });
  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
