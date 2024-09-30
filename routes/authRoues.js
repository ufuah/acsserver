import express from "express";
import {
  login,
  signUp,
  logout,
  toggleLock,
  checkLockStatus,
  refreshToken
} from "../controllers/authContoller.js";
import { authMiddleware, lockMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Login route
router.post("/login", login);

// Sign-up route
router.post("/signup", signUp);

// Logout route (protected, only for authenticated users)
router.post("/logout", authMiddleware, logout);

// Route to toggle lock status (only admins should have access)
router.post("/togglelock", authMiddleware,lockMiddleware, toggleLock);

// Check the current lock status (for authenticated users, protected by both auth and lock checks)
router.get("/checklock",authMiddleware, lockMiddleware,  checkLockStatus);

// Refresh Token route
router.post("/refresh ", refreshToken);
export default router;
