import express from "express";
import chatController from "../controllers/chat.controller.js";
import verificationToken from "../middleware/jwt.guard.js";

const router = express.Router();

// Protege a rota com o reCAPTCHA
router.post("/", verificationToken, chatController);

export default router;
