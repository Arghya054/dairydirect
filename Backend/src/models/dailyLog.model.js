import mongoose from "mongoose";

const dailyLogSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    litersDelivered: {
      type: Number,
      required: true,
    },
    pricePerLiter: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryStatus: {
      type: String,
      enum: ["Ordered", "Out for Delivery", "Delivered", "Skipped"],
      default: "Delivered",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("DailyLog", dailyLogSchema);