import express from "express";
import DailyLog from "../models/dailyLog.model.js";
import User from "../models/user.model.js";
import { authMiddleware, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/customers", authMiddleware, adminOnly, async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" }).select("-password");
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/today-delivery", authMiddleware, adminOnly, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const logs = await DailyLog.find({ date: today }).populate(
      "customerId",
      "name phone address skippedDates dailyLiters pricePerLiter"
    );

    const allCustomers = await User.find({ role: "customer" }).select(
      "name phone address skippedDates dailyLiters pricePerLiter"
    );

    const skippedCustomers = allCustomers.filter(
      (customer) =>
        customer.skippedDates && customer.skippedDates.includes(today)
    );

    const totalLiters = logs.reduce((sum, log) => sum + log.litersDelivered, 0);
    const totalAmount = logs.reduce((sum, log) => sum + log.totalAmount, 0);

    res.json({
      date: today,
      totalCustomers: logs.length,
      totalLiters,
      totalAmount,
      deliveries: logs,
      skippedCustomers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/mark-paid/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const log = await DailyLog.findById(req.params.id);

    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    log.paymentStatus = "Paid";
    await log.save();

    res.json({
      message: "Payment marked as paid",
      log,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/mark-pending/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const log = await DailyLog.findById(req.params.id);

    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    log.paymentStatus = "Pending";
    await log.save();

    res.json({
      message: "Payment marked as pending",
      log,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/update-delivery-status/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { deliveryStatus } = req.body;

    const allowedStatuses = [
      "Ordered",
      "Out for Delivery",
      "Delivered",
      "Skipped",
    ];

    if (!allowedStatuses.includes(deliveryStatus)) {
      return res.status(400).json({ message: "Invalid delivery status" });
    }

    const log = await DailyLog.findById(req.params.id);

    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    log.deliveryStatus = deliveryStatus;
    await log.save();

    res.json({
      message: "Delivery status updated",
      log,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/customer-summary", authMiddleware, adminOnly, async (req, res) => {
  try {
    const summary = await DailyLog.aggregate([
      {
        $group: {
          _id: "$customerId",
          totalLiters: { $sum: "$litersDelivered" },
          totalAmount: { $sum: "$totalAmount" },
          totalDays: { $sum: 1 },
          totalPaid: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$totalAmount", 0],
            },
          },
          totalPending: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "Pending"] }, "$totalAmount", 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },
      {
        $project: {
          customerId: "$customer._id",
          name: "$customer.name",
          phone: "$customer.phone",
          address: "$customer.address",
          totalLiters: 1,
          totalAmount: 1,
          totalDays: 1,
          totalPaid: 1,
          totalPending: 1,
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;