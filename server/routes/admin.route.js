import express from "express";
import { isAdmin } from "../middlewares/isAdmin.js";
import { getAdminStats } from "../controllers/admin.controller.js";

const adminRouter = express.Router();

adminRouter.get("/stats", isAdmin, getAdminStats);

export default adminRouter;
