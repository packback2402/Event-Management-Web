import Event from '../models/event.model';
import { Request, Response } from "express";


// Lấy tất cả event (cả duyệt và chưa duyệt)
export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find();
    res.status(200).json({ data: events });
  } catch (error) {
    console.error("Error in getPendingEvents:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


export const approveEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Tìm event theo ID
    const event = await Event.findById(id);
    if (!event || event.status !== "pending") {
      return res.status(400).json({ message: "Invalid or already processed event" });
    }

    // Cập nhật trạng thái
    event.status = "approved";
    await event.save();

    res.status(200).json({
      message: "Event approved successfully",
      data: event,
    });
  } catch (error) {
    console.error("Error in approveEvent:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


export const rejectEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event || event.status !== "pending") {
      return res.status(400).json({ message: "Invalid or already processed event" });
    }

    event.status = "rejected";
    await event.save();

    res.status(200).json({
      message: "Event rejected successfully",
      data: event,
    });
  } catch (error) {
    console.error("Error in rejectEvent:", error);
    res.status(500).json({ message: "Server Error" });
  }
};






