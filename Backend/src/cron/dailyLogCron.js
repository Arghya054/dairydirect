import cron from "node-cron";
import User from "../models/user.model.js";
import DailyLog from "../models/dailyLog.model.js";

console.log("🚀 Cron file loaded");


cron.schedule("0 6 * * *", async () => {
  console.log("⏰ Running daily log cron...");

  try {
    const customers = await User.find({ role: "customer" });
    const today = new Date().toISOString().split("T")[0];

    for (const user of customers) {
      const existingLog = await DailyLog.findOne({
        customerId: user._id,
        date: today,
      });

      if (existingLog) {
        console.log(`⚠️ Log already exists for ${user.name}`);
        continue;
      }

      // AUTO SKIP DETECTION
      if (user.skippedDates && user.skippedDates.includes(today)) {
        console.log(`⏭️ Skipped for ${user.name} on ${today}`);
        continue;
      }

      const liters = user.dailyLiters || 0;
      const price = user.pricePerLiter || 0;

      if (liters <= 0) {
        console.log(`⚠️ No liters set for ${user.name}`);
        continue;
      }

      await DailyLog.create({
        customerId: user._id,
        date: today,
        litersDelivered: liters,
        pricePerLiter: price,
        totalAmount: liters * price,
        deliveryStatus: "Delivered",
        paymentStatus: "Pending",
      });

      console.log(`✅ Log created for ${user.name}`);
    }

    console.log("🎉 Cron finished");
  } catch (error) {
    console.error("❌ Cron error:", error.message);
  }
});