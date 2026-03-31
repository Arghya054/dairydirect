import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import DailyLog from "../models/dailyLog.model.js";
import User from "../models/user.model.js";
const router = express.Router();

router.post("/create", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const litersDelivered = user.dailyLiters;
    const pricePerLiter = user.pricePerLiter;
    const totalAmount = litersDelivered * pricePerLiter;

    const today = new Date().toISOString().split("T")[0];

    const existingLog = await DailyLog.findOne({
      customerId: user._id,
      date: today,
    });

    if (existingLog) {
      return res.status(400).json({ message: "Daily log already exists for today" });
    }

    const dailyLog = await DailyLog.create({
      customerId: user._id,
      date: today,
      litersDelivered,
      pricePerLiter,
      totalAmount,
      deliveryStatus: "Delivered",
      paymentStatus: "Pending",
    });

    res.status(201).json({
      message: "Daily log created successfully",
      dailyLog,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/my-history", authMiddleware, async (req, res) => {
  try {
    const logs = await DailyLog.find({ customerId: req.user.id }).sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET MONTHLY DUES
router.get("/monthly-dues", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const logs = await DailyLog.find({
      customerId: userId,
      paymentStatus: "Pending",
      createdAt: { $gte: startOfMonth },
    });

    const totalDues = logs.reduce((sum, log) => sum + log.totalAmount, 0);

    res.json({
      totalDues,
      days: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/monthly-bill", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;

    const logs = await DailyLog.find({
      customerId: userId,
      date: { $regex: `^${monthPrefix}` },
    }).sort({ date: 1 });

    const totalAmount = logs.reduce((sum, log) => sum + log.totalAmount, 0);

    const paidAmount = logs
      .filter((log) => log.paymentStatus === "Paid")
      .reduce((sum, log) => sum + log.totalAmount, 0);

    const pendingAmount = logs
      .filter((log) => log.paymentStatus === "Pending")
      .reduce((sum, log) => sum + log.totalAmount, 0);

    const totalLiters = logs.reduce((sum, log) => sum + log.litersDelivered, 0);

    res.json({
      month: monthPrefix,
      totalDays: logs.length,
      totalLiters,
      totalAmount,
      paidAmount,
      pendingAmount,
      logs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;