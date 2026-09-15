import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  register,
  login,
  getMe,
  updateUserRoleController,
} from "./auth.controller.js";

import { authMiddleware } from "./auth.middleware.js";
import { authorize } from "./authorize.middleware.js";
import { ADMIN_ROLE } from "./auth.types.js";

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

// Admin-only route to promote user accounts to OFFICER or ADMIN (H3, H4)
router.patch("/users/:id/role", authMiddleware, authorize(ADMIN_ROLE), updateUserRoleController);

export default router;