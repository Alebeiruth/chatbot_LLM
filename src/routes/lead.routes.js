// import express from "express";
// import {
//   salvarLead,
//   getHistoricoDoUsuarioLogado,
// } from "../controllers/lead.controller.js";

// const router = express.Router();

// router.post("/", salvarLead);
// router.get("/historico", getHistoricoDoUsuarioLogado); // agora sem ":id"

// export default router;

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> NOVA VERSÃO TESTE 03/06/2025 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

import express from "express";
import {
  salvarLead,
  getHistoricoDoUsuarioLogado,
} from "../controllers/lead.controller.js";
import verificationToken from "../middleware/jwt.guard.js";

const router = express.Router();

// ============================================
// 🛡️ MIDDLEWARE DE VALIDAÇÃO PARA LEAD
// ============================================

const validarRequisicaoLead = (req, res, next) => {
  console.log("👤 Validando requisição de lead...");
  console.log("Body:", req.body);

  const { nome, email, telefone } = req.body;

  if (!nome || typeof nome !== "string" || nome.trim().length < 2) {
    return res.status(400).json({
      success: false,
      error: "Nome é obrigatório e deve ter pelo menos 2 caracteres",
      received: { nome: typeof nome, value: nome },
    });
  }

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({
      success: false,
      error: "Email é obrigatório e deve ter formato válido",
      received: { email: typeof email, value: email },
    });
  }

  if (!telefone || typeof telefone !== "string" || telefone.length < 10) {
    return res.status(400).json({
      success: false,
      error: "Telefone é obrigatório e deve ter pelo menos 10 dígitos",
      received: { telefone: typeof telefone, value: telefone },
    });
  }

  console.log("✅ Validação de lead passou");
  next();
};

// ============================================
// 🛣️ ROTAS DO LEAD
// ============================================

// POST /api/lead - Criar lead
router.post("/", validarRequisicaoLead, async (req, res) => {
  try {
    console.log("👤 Salvando novo lead...");
    await salvarLead(req, res);
  } catch (error) {
    console.error("💥 Erro ao salvar lead:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor ao salvar lead",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// GET /api/lead/historico - Histórico do usuário (com autenticação)
router.get("/historico", verificationToken, async (req, res) => {
  try {
    console.log("📋 Buscando histórico do usuário...");
    await getHistoricoDoUsuarioLogado(req, res);
  } catch (error) {
    console.error("💥 Erro ao buscar histórico:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor ao buscar histórico",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// GET /api/lead/health - Health check
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Lead API",
    timestamp: new Date().toISOString(),
  });
});

// GET /api/lead/test - Endpoint de teste
router.get("/test", (req, res) => {
  res.json({
    message: "✅ Rota de lead funcionando!",
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
  });
});

export default router;
