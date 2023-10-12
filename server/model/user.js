const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    status: { type: String, default: "active", enum: ["active", "blocked"] },
    token: { type: String },
    lastOnline: { type: Date, default: new Date() },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
