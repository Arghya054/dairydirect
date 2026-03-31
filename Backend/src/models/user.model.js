import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    dailyLiters: {
      type: Number,
      default: 1
    },
    pricePerLiter: {
      type: Number,
      default: 52
    },
    skippedDates: {
      type: [String],
      default: [],
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;