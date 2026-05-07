import dotenv from "dotenv"
dotenv.config()

import express from "express"
import connectDb from "./config/connectDb.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/user.route.js"
import interviewRouter from "./routes/interview.route.js"
import paymentRouter from "./routes/payment.route.js"
import dashboardRouter from "./routes/dashboard.route.js"
import adminRouter from "./routes/admin.route.js"

const app = express()
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        // or any localhost origin for development flexibility
        if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
            callback(null, true);
        } else {
            // Also allow the explicit default 5173 just in case
            if (origin === "http://localhost:5173") {
                 callback(null, true);
            } else {
                 callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials:true
}))

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth" , authRouter)
app.use("/api/user", userRouter)
app.use("/api/interview" , interviewRouter)
app.use("/api/payment" , paymentRouter)
app.use("/api/dashboard", dashboardRouter)
app.use("/api/admin", adminRouter)

const PORT = process.env.PORT || 6000
app.listen(PORT , ()=>{
    console.log(`Server running on port ${PORT}`)
    connectDb()
})
