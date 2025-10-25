import prisma from "../config/db.js";
export const addFlight = async (req, res) => {
  try {
    const { from, to, departureDate, availableKg } = req.body;
    const carrierId = req.user.id; 
    if (!from || !to || !departureDate || !availableKg) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const flight = await prisma.flight.create({
      data: {
        from,
        to,
        departureDate: new Date(departureDate),
        availableKg: parseFloat(availableKg),
        carrierId,
      },
    });
    res.status(201).json({ message: "Flight added successfully", flight });
  } catch (error) {
    console.error("Error adding flight:", error);
    res.status(500).json({ message: "Failed to add flight" });
  }
};
export const getAllFlights = async (req, res) => {
  try {
    const flights = await prisma.flight.findMany({
  include: {
    carrier: {
      select: { fullName: true, phone: true, points: true },
    },
  },
});
    res.json(flights);
  } catch (error) {
    console.error("Error fetching flights:", error);
    res.status(500).json({ message: "Failed to fetch flights" });
  }
};
export const updateFlightStatus = async (req, res) => {
  try {
    const { flightId } = req.params;
    const { status } = req.body;

    const validStatuses = ["on-time", "delayed", "canceled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const updated = await prisma.flight.update({
      where: { id: flightId },
      data: { status },
    });

    res.json({ message: "Flight status updated", updated });
  } catch (error) {
    console.error("Error updating flight status:", error);
    res.status(500).json({ message: "Failed to update status" });
  }
};

export const getCarrierShipments = async (req, res) => {
  try {
    const carrierId = req.user.id;

    const shipments = await prisma.shipment.findMany({
      where: { carrierId },
      include: {
        sender: {
          select: { fullName: true, phone: true, email: true },
        },
        flight: {
          select: { from: true, to: true, departureDate: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(shipments);
  } catch (error) {
    console.error("Error fetching carrier shipments:", error);
    res.status(500).json({ message: "Failed to fetch carrier shipments" });
  }
};