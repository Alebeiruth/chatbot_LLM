// import express from "express";
// import { chatController } from "../controllers/chat.controller.js";
// import verificationToken from "../middleware/jwt.guard.js";

// const router = express.Router();

// router.post("/", verificationToken, chatController);

// export default router;

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> NOVA VERSÃO TESTE 03/06/2025 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

import express from "express";
import { chatController } from "../controllers/chat.controller.js";
import verificationToken from "../middleware/jwt.guard.js";

const router = express.Router();

// ============================================
// 🛡️ MIDDLEWARE DE VALIDAÇÃO PARA CHAT
// ============================================

const validarRequisicaoChat = (req, res, next) => {
  console.log("📝 Validando requisição de chat...");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);

  const { message } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    console.error("❌ Mensagem inválida:", {
      message: typeof message,
      value: message,
    });
    return res.status(400).json({
      success: false,
      error: "Mensagem é obrigatória e deve ser uma string não vazia",
      received: { message: typeof message, value: message },
    });
  }

  console.log("✅ Validação de chat passou");
  next();
};

// ============================================
// 🛣️ ROTAS DO CHAT
// ============================================

// POST /api/chat - Enviar mensagem (com autenticação)
router.post("/", verificationToken, validarRequisicaoChat, async (req, res) => {
  try {
    console.log("🤖 Processando mensagem de chat com auth...");
    await chatController(req, res);
  } catch (error) {
    console.error("💥 Erro na rota de chat:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor no chat",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// POST /api/chat/public - Enviar mensagem (sem autenticação)
router.post("/public", validarRequisicaoChat, async (req, res) => {
  try {
    console.log("🤖 Processando mensagem de chat pública...");
    await chatController(req, res);
  } catch (error) {
    console.error("💥 Erro na rota de chat público:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor no chat público",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// GET /api/chat/health - Health check específico do chat
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Chat API",
    timestamp: new Date().toISOString(),
    authenticated: false,
  });
});

// GET /api/chat/test - Endpoint de teste
router.get("/test", (req, res) => {
  res.json({
    message: "✅ Rota de chat funcionando!",
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
  });
});

export default router;

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> NOVA VERSÃO TESTE 27/06/2025 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// import express from "express";
// import { chatController } from "../controllers/chat.controller.js";
// import verificationToken from "../middleware/jwt.guard.js";

// const router = express.Router();

// // ============================================
// // 🛡️ MIDDLEWARE DE VALIDAÇÃO PARA CHAT
// // ============================================

// const validarRequisicaoChat = (req, res, next) => {
//   console.log("📝 Validando requisição de chat...");
//   console.log("Headers:", req.headers);
//   console.log("Body:", req.body);

//   const { message } = req.body;

//   if (!message || typeof message !== "string" || message.trim().length === 0) {
//     console.error("❌ Mensagem inválida:", {
//       message: typeof message,
//       value: message,
//     });
//     return res.status(400).json({
//       success: false,
//       error: "Mensagem é obrigatória e deve ser uma string não vazia",
//       received: { message: typeof message, value: message },
//     });
//   }

//   console.log("✅ Validação de chat passou");
//   next();
// };

// // ============================================
// // 🛣️ ROTAS DO CHAT
// // ============================================

// // POST /api/chat - Enviar mensagem (com autenticação)
// router.post("/", verificationToken, validarRequisicaoChat, chatController);

// // POST /api/chat/public - Enviar mensagem (sem autenticação)
// router.post("/public", validarRequisicaoChat, chatController);

// // GET /api/chat/health - Health check específico do chat
// router.get("/health", (req, res) => {
//   res.json({
//     status: "OK",
//     service: "Chat API",
//     timestamp: new Date().toISOString(),
//     authenticated: false,
//   });
// });

// // GET /api/chat/test - Endpoint de teste
// router.get("/test", (req, res) => {
//   res.json({
//     message: "✅ Rota de chat funcionando!",
//     timestamp: new Date().toISOString(),
//     method: req.method,
//     url: req.originalUrl,
//   });
// });

// export default router;
