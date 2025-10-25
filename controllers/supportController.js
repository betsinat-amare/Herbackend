import prisma from "../config/db.js";
export const getUserMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await prisma.supportMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json(messages);
  } catch (err) {
    console.error("Error fetching user messages:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};
export const getAllMessagesForAgents = async (req, res) => {
  try {
    const messages = await prisma.supportMessage.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: { fullName: true, phone: true }
        }
      }
    });

    res.status(200).json(messages);
  } catch (err) {
    console.error("Error fetching agent messages:", err);
    res.status(500).json({ message: "Failed to fetch messages for agents" });
  }
};
export const createMessage = async (req, res) => {
  try {
    const { userId, agentId, message, sentBy } = req.body;

    if (!userId || !message || !sentBy) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newMessage = await prisma.supportMessage.create({
      data: {
        userId,
        agentId: agentId || null,
        message,
        sentBy,
      },
    });

    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Error creating support message:", err);
    res.status(500).json({ message: "Failed to create message" });
  }
};
