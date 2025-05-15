import express from "express";
import { salvarLead } from "../controllers/lead.controller.js";

const router = express.Router();
router.post("/", salvarLead);

export default router;
