import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInterviews = await Interview.countDocuments();
    
    // In a real scenario with Razorpay, you'd aggregate the Payment model
    // Here we'll just mock a revenue stat or aggregate credits if stored
    // For simplicity, let's just return basic counts
    
    const completedInterviews = await Interview.countDocuments({ status: "completed" });
    
    // Daily active users (users who did an interview today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeUsersToday = await User.countDocuments({ 
        lastInterviewDate: { $gte: today } 
    });

    const topUsers = await User.find({})
        .sort({ streak: -1, credits: -1 })
        .limit(5)
        .select("name email streak credits");

    return res.status(200).json({
        totalUsers,
        totalInterviews,
        completedInterviews,
        activeUsersToday,
        topUsers
    });

  } catch (error) {
    console.error("Admin stats error:", error);
    return res.status(500).json({ message: "Failed to fetch admin stats" });
  }
};
