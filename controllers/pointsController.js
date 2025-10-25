import prisma from "../config/db.js";
export const getCarrierPoints = async (req, res) => {
  try {
    const userId = req.user.id; 

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ points: user.points });
  } catch (err) {
    console.error("Error fetching carrier points:", err);
    res.status(500).json({ message: "Failed to fetch points" });
  }
};
