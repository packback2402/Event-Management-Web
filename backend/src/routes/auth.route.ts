import { Router } from "express";
import { body } from "express-validator";
import { changePassword, forgotPassword, getUserProfile, login, register, resetPassword, updateAvatar, updateProfile } from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";
import { uploadAvatar } from "../middleware/upload.middleware";


export const authRouter = Router();

// Register route
authRouter.post("/register",
    body("username").isString().isLength({ min: 3 }),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    register
);

//Login route
authRouter.post("/login",
    body("email").isEmail(),
    body("password").exists(),
    login
);

//Forgot password route
authRouter.post("/forgot-password", forgotPassword);

//Reset password route
authRouter.post("/reset-password/:token", resetPassword);

//Change password route
authRouter.put("/change-password", protect, changePassword);

// Get user info route
authRouter.get("/me", protect, getUserProfile);

// Upload avatar route
authRouter.post("/upload-avatar", protect, uploadAvatar.single('avatar'), updateAvatar);

//save User profile route
authRouter.put("/profile", protect, updateProfile);
