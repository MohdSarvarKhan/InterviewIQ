import mongoose from "mongoose";

const questionsSchema = new mongoose.Schema({
  question: String,
  difficulty: String,
  timeLimit: Number,
  answer: String,
  feedback: String,
  score: { type: Number, default: 0 },
  confidence: { type: Number, default: 0 },
  communication: { type: Number, default: 0 },
  correctness: { type: Number, default: 0 },
  followUpQuestion: String,
  followUpAnswer: String,
  emotionData: {
    avgConfidence: { type: Number, default: 0 },
    dominantEmotion: { type: String, default: "" },
  }
})

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  role: { type: String, required: true },
  experience: { type: String, required: true },
  mode: {
    type: String,
    enum: ["HR", "Technical", "Behavioral", "System Design", "DSA"],
    required: true
  },
  targetCompany: { type: String, default: "" },
  difficulty: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
    default: "Intermediate"
  },
  isPractice: { type: Boolean, default: false },
  resumeText: { type: String },
  questions: [questionsSchema],
  finalScore: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["in-progress", "completed"],
    default: "in-progress",
  },
  isPublic: { type: Boolean, default: false },
  shareToken: { type: String, default: "" }
}, { timestamps: true })

const Interview = mongoose.model("Interview", interviewSchema)

export default Interview