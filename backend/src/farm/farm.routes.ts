import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware.js";
import {
  createFarm,
  getFarms,
  getFarm,
  updateFarm,
  deleteFarm,
} from "./farm.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createFarm);
router.get("/", getFarms);
router.get("/:id", getFarm);
router.patch("/:id", updateFarm);
router.delete("/:id", deleteFarm);

export default router;