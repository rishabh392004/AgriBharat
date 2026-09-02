import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  register,
  login,
  getMe,
} from "./auth.controller.js";

import { authMiddleware } from "./auth.middleware.js";

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Please try again later.",
  },
});

const router = Router();

router.post("/register", authRateLimit, register);
router.post("/login", authRateLimit, login);

router.get("/me", authMiddleware, getMe);

export default router;