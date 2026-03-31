import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";

const router = express.Router();

router.get("/customer-dashboard", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const subscription = await Subscription.findOne({ customerId: req.user.id });

    res.json({
      user,
      subscription,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;