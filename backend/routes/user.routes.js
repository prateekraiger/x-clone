import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  followUnfolloUser,
  getSuggestedUsers,
  getUserProfile,
  updateUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/follow/:id", protectRoute, followUnfolloUser);
router.post("/suggested", protectRoute, updateUser);

export default router;
