import { Router } from "express";

import {
   createEvent,
   getAllEvent,
   getAllPendingEvent,
   getAllApprovalEvent,
   bookTicket,
   cancelTicket,
   getTicketById,
   getEvents,
   getApprovedEventsLast5Months,
   getApprovedEventsNext3Months,
   getTotalAttendeesLastMonth,
   getTotalRevenueLastMonth,
   getMyTickets,
   getEventById,
   updateEvent,
   getEventAttendees,
   getAllEvents,
} from "../controllers/user.controller";
import { protect } from "../middleware/auth.middleware";
import { uploadEventImage } from "../middleware/upload.middleware";

export const userRouter = Router();

/* ===============================
      EVENT ROUTES (USER)
   =============================== */

// Tạo mới sự kiện (chờ admin duyệt)
userRouter.post("/event", protect, uploadEventImage.single('image'), createEvent);//xong

// Xem tất cả sự kiện do user hiện tại tổ chức
userRouter.get("/events", protect, getAllEvent);//xong


// Edit event (only organizer, not approved)  
userRouter.put("/event/:id", protect, uploadEventImage.single("image"), updateEvent);  ///xong


// Xem danh sách sự kiện chưa được duyệt cua minh (chỉ organizer thấy)
userRouter.get("/events/pending", protect, getAllPendingEvent);//xong

// Xem danh sách sự kiện đã được duyệt cua minh (tất cả user đều thấy)
userRouter.get("/events/approved", protect, getAllApprovalEvent);//xong

userRouter.get("/stats/approved-last-5-months", protect, getApprovedEventsLast5Months);
userRouter.get("/stats/approved-next-3-months", protect, getApprovedEventsNext3Months);
userRouter.get("/stats/attendees-last-month", protect, getTotalAttendeesLastMonth);
userRouter.get("/stats/revenue-last-month", protect, getTotalRevenueLastMonth);

//su kien cua ng khac da dc approved
userRouter.get("/allEvents/approved", getEvents);


//su kien cua tat ca ke ca minh da duoc approved
userRouter.get("/allEvents/everybodyApproved", getAllEvents);


// Lấy chi tiết 1 event khi dang nhap roi
userRouter.get("/event/:id", protect, getEventById);

// Lấy chi tiết 1 event khi chua dang nhap
userRouter.get("/public/event/:id", getEventById);


// Lấy danh sách attendees cho một event (chỉ organizer)
userRouter.get("/event/:eventId/attendees", protect, getEventAttendees);





/* ===============================
      TICKET ROUTES (USER)
   =============================== */

// Đặt vé cho 1 sự kiện
userRouter.post("/tickets", protect, bookTicket);//xong

// Hủy vé đã đặt
userRouter.put("/tickets/:id/cancel", protect, cancelTicket);//xong

// Xem chi tiết vé theo ID
userRouter.get("/tickets/:id", protect, getTicketById);//xong

// Lấy tickets của user
userRouter.get("/my-tickets", protect, getMyTickets);



export default userRouter;
