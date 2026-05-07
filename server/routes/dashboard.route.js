import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/stats", isAuth, getDashboardStats);

export default dashboardRouter;
