import express from "express";
import login from "../controllers/auth.controller.js";

// Cria um roteador Express
const router = express.Router();

// Define a rota POST para /api/auth/login
router.post("/login", login);

export default router;
