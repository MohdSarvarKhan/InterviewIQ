import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  credits: { type: Number, default: 100 },
  streak: { type: Number, default: 0 },
  lastInterviewDate: { type: Date, default: null },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true })

const User = mongoose.model("User", userSchema)

export default User