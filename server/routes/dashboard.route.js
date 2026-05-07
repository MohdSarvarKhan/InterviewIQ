import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { getDashboardStats, getLeaderboard } from "../controllers/dashboard.controller.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/stats", isAuth, getDashboardStats);
dashboardRouter.get("/leaderboard", getLeaderboard); // Public route

export default dashboardRouter;
