import express from "express";
import listaMensagens from "../controllers/messages.controller.js";
import verificationToken from "../middleware/jwt.guard.js";

const router = express.Router();

//Rota para obter o historico de mensagens
router.get("/", verificationToken, listaMensagens);

export default router;
