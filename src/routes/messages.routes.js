// import express from "express";
// import listaMensagens from "../controllers/messages.controller.js";
// import verificationToken from "../middleware/jwt.guard.js";

// const router = express.Router();

// //Rota para obter o historico de mensagens
// router.get("/", verificationToken, listaMensagens);

// export default router;


// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> NOVA VERSÃO TESTE 03/06/2025 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

import express from "express";
import listaMensagens from "../controllers/messages.controller.js";
import verificationToken from "../middleware/jwt.guard.js";

const router = express.Router();

// ============================================
// 🛣️ ROTAS DAS MENSAGENS
// ============================================

// GET /api/messages - Obter histórico de mensagens (com autenticação)
router.get("/", verificationToken, async (req, res) => {
  try {
    console.log('💬 Buscando lista de mensagens...');
    await listaMensagens(req, res);
  } catch (error) {
    console.error('💥 Erro ao buscar mensagens:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao buscar mensagens',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/messages/health - Health check
router.get("/health", (req, res) => {
  res.json({
    status: 'OK',
    service: 'Messages API',
    timestamp: new Date().toISOString(),
    authenticated: false
  });
});

// GET /api/messages/test - Endpoint de teste (sem autenticação)
router.get("/test", (req, res) => {
  res.json({
    message: '✅ Rota de mensagens funcionando!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl
  });
});

export default router;
