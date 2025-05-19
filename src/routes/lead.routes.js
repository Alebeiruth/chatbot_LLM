import express from "express";
import {
  salvarLead,
  getHistoricoDoUsuarioLogado,
} from "../controllers/lead.controller.js";

const router = express.Router();

router.post("/", salvarLead);
router.get("/historico", getHistoricoDoUsuarioLogado); // agora sem ":id"

export default router;
