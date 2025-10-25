import prisma from "../config/db.js";
export const getCarrierProfile = async (req, res) => {
  try {
    const carrierId = req.user.id;
    const carrier = await prisma.user.findUnique({
      where: { id: carrierId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        points: true,
        flights: {
          select: { id: true, from: true, to: true, departureDate: true, availableKg: true, status: true },
        },
      },
    });

    if (!carrier) return res.status(404).json({ message: "Carrier not found" });

    res.status(200).json({ carrier });
  } catch (error) {
    console.error("Error fetching carrier profile:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};
export const updateCarrierProfile = async (req, res) => {
  try {
    const carrierId = req.user.id;
    const { fullName, phone } = req.body;

    const updatedCarrier = await prisma.user.update({
      where: { id: carrierId },
      data: { fullName, phone },
      select: { id: true, fullName: true, email: true, phone: true, points: true },
    });

    res.status(200).json({ message: "Profile updated successfully", carrier: updatedCarrier });
  } catch (error) {
    console.error("Error updating carrier profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};
export const updateCarrierFlight = async (req, res) => {
  try {
    const { flightId } = req.params;
    const carrierId = req.user.id;
    const { from, to, departureDate, availableKg } = req.body;

    const flight = await prisma.flight.findUnique({ where: { id: flightId } });

    if (!flight || flight.carrierId !== carrierId) {
      return res.status(404).json({ message: "Flight not found or unauthorized" });
    }

    const updatedFlight = await prisma.flight.update({
      where: { id: flightId },
      data: {
        from: from || flight.from,
        to: to || flight.to,
        departureDate: departureDate ? new Date(departureDate) : flight.departureDate,
        availableKg: availableKg !== undefined ? parseFloat(availableKg) : flight.availableKg,
      },
    });

    res.status(200).json({ message: "Flight updated successfully", flight: updatedFlight });
  } catch (error) {
    console.error("Error updating flight:", error);
    res.status(500).json({ message: "Failed to update flight" });
  }
};
export const deleteCarrierFlight = async (req, res) => {
  try {
    const { flightId } = req.params;
    const carrierId = req.user.id;

    const flight = await prisma.flight.findUnique({ where: { id: flightId } });

    if (!flight || flight.carrierId !== carrierId) {
      return res.status(404).json({ message: "Flight not found or unauthorized" });
    }

    await prisma.flight.delete({ where: { id: flightId } });

    res.status(200).json({ message: "Flight deleted successfully" });
  } catch (error) {
    console.error("Error deleting flight:", error);
    res.status(500).json({ message: "Failed to delete flight" });
  }
};
