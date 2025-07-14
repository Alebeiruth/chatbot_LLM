// import express from "express";
// import { responderCursosPorTexto } from "../controllers/courses.controller.js";

// const router = express.Router();

// router.get("/consultar-por-texto", responderCursosPorTexto);

// export default router ;

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> NOVA VERSÃO TESTE 03/06/2025 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

import express from "express";
import { responderCursosPorTexto } from "../controllers/courses.controller.js";

const router = express.Router();

// ============================================
// 🛡️ MIDDLEWARE DE VALIDAÇÃO PARA CURSOS
// ============================================

const validarConsultaCursos = (req, res, next) => {
  console.log("📚 Validando consulta de cursos...");
  console.log("Query params:", req.query);

  const { texto, cidade, modalidade } = req.query;

  // Pelo menos um parâmetro deve ser fornecido
  if (!texto && !cidade && !modalidade) {
    return res.status(400).json({
      success: false,
      error:
        "Pelo menos um parâmetro deve ser fornecido: texto, cidade ou modalidade",
      received: req.query,
    });
  }

  console.log("✅ Validação de consulta de cursos passou");
  next();
};

// ============================================
// 🛣️ ROTAS DOS CURSOS
// ============================================

// GET /api/courses/consultar-por-texto
router.get("/consultar-por-texto", validarConsultaCursos, async (req, res) => {
  try {
    console.log("📚 Consultando cursos por texto...");
    await responderCursosPorTexto(req, res);
  } catch (error) {
    console.error("💥 Erro na consulta de cursos:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor na consulta de cursos",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// GET /api/courses/health - Health check
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Courses API",
    timestamp: new Date().toISOString(),
  });
});

// GET /api/courses/test - Endpoint de teste
router.get("/test", (req, res) => {
  res.json({
    message: "✅ Rota de cursos funcionando!",
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
  });
});

export default router;
