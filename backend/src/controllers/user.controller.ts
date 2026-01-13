import { Request, Response } from "express";
import Event from "../models/event.model";
import Ticket from "../models/ticket.model";
import { uploadToCloudinary } from '../middleware/upload.middleware';

// --- EVENT CRUD ---


// --- CREATE EVENT ---
export const createEvent = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const {
      title,
      date,
      time,
      location,
      expectedAttendees,
      price,
      description,
      category,
    } = req.body;

    // ===== BASIC VALIDATION =====
    if (!title || !date || !time || !location || !description) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    if (Number(expectedAttendees) < 1) {
      return res.status(400).json({
        message: "Expected attendees must be at least 1",
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({
        message: "Price cannot be negative",
      });
    }

    // ===== DATE VALIDATION (>= today + 3 days) =====
    const eventDate = new Date(date);
    const now = new Date();
    const minDate = new Date();
    minDate.setDate(now.getDate() + 3);

    // Reset time để so sánh đúng ngày
    eventDate.setHours(0, 0, 0, 0);
    minDate.setHours(0, 0, 0, 0);

    if (eventDate < minDate) {
      return res.status(400).json({
        message: "Event date must be at least 3 days from today",
      });
    }

    // ===== IMAGE UPLOAD =====
    let imageUrl: string | undefined = undefined;

    if (req.file) {
      imageUrl = await uploadToCloudinary(
        req.file.buffer,
        "event-management/events",
        [{ width: 1200, height: 630, crop: "fill" }]
      );
    }

    // ===== CREATE EVENT =====
    const newEvent = await Event.create({
      title: title.trim(),
      date: eventDate,
      time,
      location: location.trim(),
      expectedAttendees: Number(expectedAttendees),
      price: Number(price),
      description: description.trim(),
      category,
      image: imageUrl,
      organizerId: userId,
      attendees: 0,
      status: "pending",
    });

    res.status(201).json({
      message: "Event created successfully and pending approval",
      data: newEvent,
    });
  } catch (error) {
    console.error("Error in createEvent:", error);
    res.status(500).json({
      message: "Event creation failed",
      error,
    });
  }
};


// --- UPDATE EVENT ---
export const updateEvent = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;

    const {
      title,
      date,
      time,
      location,
      expectedAttendees,
      price,
      description,
      category,
    } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // ❌ Không cho sửa event không phải của mình
    if (event.organizerId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized to edit this event" });
    }

    // ❌ Không cho sửa event đã được duyệt
    if (event.status === "approved") {
      return res.status(400).json({ message: "Approved event cannot be edited" });
    }

    let imageUrl = event.image;

    // 👉 Nếu có ảnh mới → upload
    if (req.file) {
      imageUrl = await uploadToCloudinary(
        req.file.buffer,
        "event-management/events",
        [{ width: 1200, height: 630, crop: "fill" }]
      );
    }

    // 👉 Update fields
    event.title = title ?? event.title;
    event.date = date ?? event.date;
    event.time = time ?? event.time;
    event.location = location ?? event.location;
    event.expectedAttendees = expectedAttendees ?? event.expectedAttendees;
    event.price = price ?? event.price;
    event.description = description ?? event.description;
    event.category = category ?? event.category;
    event.image = imageUrl;

    await event.save();

    res.status(200).json({
      message: "Event updated successfully",
      data: event,
    });
  } catch (error) {
    console.error("Error in updateEvent:", error);
    res.status(500).json({ message: "Event update failed", error });
  }
};



//lay tat ca event cua minh
export const getAllEvent = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const events = await Event.find({ organizerId: userId });
    res.status(200).json({ data: events });
  } catch (error) {
    console.error("Error in getAllEvent:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


//lay event pending cua minh
export const getAllPendingEvent = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const events = await Event.find({ organizerId: userId, status: "pending" });
    res.status(200).json({ message: "Pending events fetched", data: events });
  } catch (error) {
    console.error("Error in getAllApprovalEvent:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

//lay event da approve cua minh
export const getAllApprovalEvent = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const events = await Event.find({ organizerId: userId, status: "approved" });
    res.status(200).json({ message: "Approved events fetched", data: events });
  } catch (error) {
    console.error("Error in getAllApprovalEvent:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// --- THỐNG KÊ ---
// 1️⃣ Tổng số sự kiện đã được approved trong 5 tháng trước
export const getApprovedEventsLast5Months = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(now.getMonth() - 5);

    const count = await Event.countDocuments({
      organizerId: userId,
      status: "approved",
      date: { $gte: fiveMonthsAgo, $lte: now },
    });

    res.status(200).json({ message: "Approved events in last 5 months", total: count });
  } catch (error) {
    console.error("Error in getApprovedEventsLast5Months:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


// 2️⃣ Tổng số sự kiện đã được approved trong 3 tháng tới
export const getApprovedEventsNext3Months = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(now.getMonth() + 3);

    const count = await Event.countDocuments({
      organizerId: userId,
      status: "approved",
      date: { $gte: now, $lte: threeMonthsLater },
    });

    res.status(200).json({ message: "Approved events in next 3 months", total: count });
  } catch (error) {
    console.error("Error in getApprovedEventsNext3Months:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


// 3️⃣ Tổng attendees của các sự kiện trong 3 tháng trước
export const getTotalAttendeesLastMonth = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 3);

    const events = await Event.find({
      organizerId: userId,
      status: "approved",
      date: { $gte: oneMonthAgo, $lte: now },
    });

    const totalAttendees = events.reduce((sum, e) => sum + (e.attendees || 0), 0);

    res.status(200).json({ message: "Total attendees in last month", totalAttendees });
  } catch (error) {
    console.error("Error in getTotalAttendeesLastMonth:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


// 4️⃣ Tổng thu nhập của các sự kiện trong 3 tháng trước
export const getTotalRevenueLastMonth = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 3);

    const events = await Event.find({
      organizerId: userId,
      status: "approved",
      date: { $gte: oneMonthAgo, $lte: now },
    });

    const totalRevenue = events.reduce((sum, e) => sum + (e.attendees || 0) * (e.price || 0), 0);

    res.status(200).json({ message: "Total revenue in last month", totalRevenue });
  } catch (error) {
    console.error("Error in getTotalRevenueLastMonth:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


//lay event cua tat ca moi nguoi tru cua minh (approved)
export const getEvents = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const events = await Event.find({ status: "approved", organizerId: { $ne: userId } });
    res.status(200).json({ data: events });
  } catch (error) {
    console.error("Error in getAllEvent:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


//lay event cua tat ca moi nguoi ke ca minh(approved)
export const getAllEvents = async (req: any, res: Response) => {
  try {
    const events = await Event.find({ status: "approved" });
    res.status(200).json({ data: events });
  } catch (error) {
    console.error("Error in getAllEvents:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


//lay chi tiet event theo id
export const getEventById = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizerId', 'username email'); // Lấy thông tin organizer
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json({ data: event });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};


// --- TICKET CRUD ---
export const bookTicket = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { eventId, quantity } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Enforce quantity = 1 (mỗi user chỉ được đặt 1 vé cho mỗi sự kiện)
    const ticketQuantity = 1;

    // Kiểm tra event đã qua chưa
    const eventDate = new Date(event.date);
    const now = new Date();
    if (eventDate < now) {
      return res.status(400).json({
        message: "This event has already ended. You cannot register for past events."
      });
    }

    // Option 4: Ngăn organizer đăng ký event của chính mình
    if (event.organizerId.toString() === userId) {
      return res.status(400).json({
        message: "You are the organizer of this event. You don't need to register. You can manage the event from 'Created By Me' section."
      });
    }

    // check xem user đã có ticker booked chưa
    const existingTicket = await Ticket.findOne({
      userId,
      eventId,
      status: "booked"
    });

    if (existingTicket) {
      return res.status(400).json({
        message: "Bạn đã đặt vé cho sự kiện này rồi. Mỗi người chỉ được đăng ký 1 lần cho mỗi sự kiện."
      });
    }

    const remaining = (event.expectedAttendees || 0) - (event.attendees || 0);
    if (ticketQuantity > remaining) return res.status(400).json({ message: "Not enough tickets" });

    const ticket = await Ticket.create({
      userId,
      eventId,
      quantity: ticketQuantity,
      totalPrice: ticketQuantity * event.price,
      status: "booked",
    });

    event.attendees += ticketQuantity;
    await event.save();

    res.status(200).json({ message: "Booked successfully", data: ticket });
  } catch (error) {
    console.error("Error in bookTicket:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const cancelTicket = async (req: any, res: Response) => {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id, userId: req.user.id });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (ticket.status !== "booked") return res.status(400).json({ message: "Cannot cancel" });

    const event = await Event.findById(ticket.eventId);
    if (event) {
      event.attendees -= ticket.quantity;
      await event.save();
    }

    ticket.status = "cancelled";
    await ticket.save();

    res.status(200).json({ message: "Ticket cancelled", data: ticket });
  } catch (error) {
    console.error("Error in cancelTicket:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getTicketById = async (req: any, res: Response) => {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id, userId: req.user.id })
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.status(200).json({ data: ticket });
  } catch (error) {
    console.error("Error in getTicketById:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getMyTickets = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.query; // Hỗ trợ filter theo eventId (optional)

    // Build query
    const query: any = { userId, status: "booked" };
    if (eventId) {
      query.eventId = eventId;
    }

    const tickets = await Ticket.find(query)
      .populate('eventId'); // Populate để lấy thông tin event
    res.status(200).json({ data: tickets });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Lấy danh sách attendees cho một event (chỉ organizer mới có quyền)
export const getEventAttendees = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.eventId;

    // Kiểm tra event có tồn tại không
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Kiểm tra user có phải là organizer không
    if (event.organizerId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized. Only event organizer can view attendees." });
    }

    // Lấy tất cả tickets booked cho event này
    const tickets = await Ticket.find({
      eventId: eventId,
      status: "booked"
    })
      .populate({
        path: 'userId',
        select: 'username email avatar',
        // Giữ lại ObjectId nếu user không tồn tại thay vì null
        options: { lean: false }
      })
      .sort({ bookedAt: -1 }); // Sắp xếp theo thời gian đăng ký mới nhất

    // Lọc bỏ các tickets có userId null hoặc không phải là object (user đã bị xóa)
    // Kiểm tra nếu userId là object đã được populate (có username hoặc email)
    const validTickets = tickets.filter(ticket => {
      const userId = ticket.userId as any;
      // Kiểm tra nếu userId là object đã được populate thành công (có username hoặc email)
      // Nếu userId là ObjectId string hoặc null thì bỏ qua
      return userId &&
        typeof userId === 'object' &&
        (userId.username !== undefined || userId.email !== undefined);
    });

    // Detailed debug logs - dev only
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n[getEventAttendees] Event ${eventId}:`);
      console.log(`  - Event title: ${event.title}`);
      console.log(`  - Event.attendees (field): ${event.attendees || 0}`);
      console.log(`  - Query: Ticket.find({ eventId: "${eventId}", status: "booked" })`);
      console.log(`  - Found ${tickets.length} tickets with status="booked"`);
      console.log(`  - After populate & filter: ${validTickets.length} valid tickets`);

      if (tickets.length > 0) {
        console.log(`  - Ticket details:`);
        tickets.forEach((ticket, index) => {
          const userId = ticket.userId as any;
          const isValid = userId &&
            typeof userId === 'object' &&
            (userId.username !== undefined || userId.email !== undefined);
          console.log(`    ${index + 1}. Ticket ${ticket._id}:`);
          console.log(`       Quantity: ${ticket.quantity}, Price: $${ticket.totalPrice}`);
          console.log(`       UserId populated: ${isValid ? 'valid' : 'invalid'}`);
          if (isValid && userId.username) {
            console.log(`       User: ${userId.username} (${userId.email})`);
          }
        });
      }
    }

    // Tính toán thống kê từ tất cả tickets (bao gồm cả những ticket có userId null)
    const totalAttendees = tickets.reduce((sum, ticket) => sum + (ticket.quantity || 0), 0);
    const totalRevenue = tickets.reduce((sum, ticket) => sum + (ticket.totalPrice || 0), 0);
    const bookedCount = tickets.length;

    console.log(`  - Statistics: totalAttendees=${totalAttendees}, totalRevenue=$${totalRevenue}, bookedCount=${bookedCount}`);
    console.log(`  - Difference with Event.attendees field: ${(event.attendees || 0) - totalAttendees}\n`);

    res.status(200).json({
      data: {
        event: {
          _id: event._id,
          title: event.title,
          date: event.date,
          location: event.location,
          expectedAttendees: event.expectedAttendees,
          price: event.price,
          status: event.status,
        },
        attendees: validTickets,
        statistics: {
          totalAttendees,
          totalRevenue,
          bookedCount,
          cancelledCount: 0, // Có thể thêm sau
        }
      }
    });
  } catch (error) {
    console.error("Error in getEventAttendees:", error);
    res.status(500).json({ message: "Server Error" });
  }
};




