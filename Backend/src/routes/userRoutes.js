import express from "express";
import User from "../models/user.model.js";
import DailyLog from "../models/dailyLog.model.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/update", authMiddleware, async (req, res) => {
  try {
    const { address, dailyLiters, pricePerLiter, skippedDates } = req.body || {};

    const updates = {};

    if (address !== undefined) updates.address = address;
    if (dailyLiters !== undefined) updates.dailyLiters = dailyLiters;
    if (pricePerLiter !== undefined) updates.pricePerLiter = pricePerLiter;
    if (skippedDates !== undefined) updates.skippedDates = skippedDates;

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password");

    const today = new Date().toISOString().split("T")[0];

    // if customer skips today, remove today's log
    if (skippedDates && skippedDates.includes(today)) {
      await DailyLog.findOneAndDelete({
        customerId: req.user.id,
        date: today,
      });
    }

    res.json({
      message: "Profile updated",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;