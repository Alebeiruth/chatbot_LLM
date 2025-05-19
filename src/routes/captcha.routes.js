import express from "express";
import verifyCaptcha from "../middleware/verifyCaptcha.js";
import { processarCaptcha } from "../controllers/captcha.controller.js";

const router = express.Router();

router.post("/", verifyCaptcha, processarCaptcha);

export default router;
