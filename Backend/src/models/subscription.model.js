import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dailyLiters: {
      type: Number,
      required: true,
      default: 1,
    },
    pricePerLiter: {
      type: Number,
      required: true,
      default: 52,
    },
    active: {
      type: Boolean,
      default: true,
    },
    pausedDates: [
      {
        type: String,
      },
    ],
    customDateChanges: [
      {
        date: String,
        liters: Number,
      },
    ],
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;