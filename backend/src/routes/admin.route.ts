import { Router } from "express";

import { approveEvent, getAllEvents, rejectEvent } from "../controllers/admin.controller";
import { authorize, protect } from "../middleware/auth.middleware";


export const adminRouter = Router();

adminRouter.use(protect, authorize("admin"));

//lay toan bo event 
adminRouter.get("/events", getAllEvents);//xong

//duyet hoac tu choi event
adminRouter.put("/events/:id/approve", approveEvent);//xong

adminRouter.put("/events/:id/reject", rejectEvent);//xong