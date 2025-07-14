
// import express from "express";
// import login from "../controllers/auth.controller.js";

// // Cria um roteador Express
// const router = express.Router();

// // Define a rota POST para /api/auth/login
// router.post("/login", login);

// export default router;

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> NOVA VERSÃO TESTE 03/06/2025 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

import express from "express";
import login from "../controllers/auth.controller.js";
import verificationToken from "../middleware/jwt.guard.js";

// ============================================
// 🔧 CRIAÇÃO DO ROTEADOR
// ============================================

const router = express.Router();

// ============================================
// 🛡️ MIDDLEWARE DE VALIDAÇÃO PARA LOGIN
// ============================================

const validarRequisicaoLogin = (req, res, next) => {
  console.log('🔐 Validando requisição de login...');
  console.log('Body recebido:', req.body);
  
  const { email, password } = req.body;
  
  // Validar email
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    console.error('❌ Email inválido:', { email: typeof email, value: email });
    return res.status(400).json({
      success: false,
      error: 'Email é obrigatório e deve ter formato válido',
      received: { email: typeof email, value: email }
    });
  }

  // Validar password
  if (!password || typeof password !== 'string' || password.length < 6) {
    console.error('❌ Password inválido:', { password: typeof password, length: password?.length });
    return res.status(400).json({
      success: false,
      error: 'Password é obrigatório e deve ter pelo menos 6 caracteres',
      received: { password: typeof password, length: password?.length || 0 }
    });
  }

  console.log('✅ Validação de login passou');
  next();
};

// ============================================
// 🛣️ ROTAS DE AUTENTICAÇÃO
// ============================================

// POST /api/auth/login - Fazer login
router.post("/login", validarRequisicaoLogin, async (req, res) => {
  try {
    console.log('🔐 Processando login...');
    await login(req, res);
  } catch (error) {
    console.error('💥 Erro na rota de login:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor no login',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/auth/logout - Fazer logout (opcional)
router.post("/logout", verificationToken, async (req, res) => {
  try {
    console.log('🔓 Processando logout...');
    
    // Aqui você pode invalidar o token no banco, blacklist, etc.
    // Por enquanto, apenas confirmamos o logout
    
    res.status(200).json({
      success: true,
      message: 'Logout realizado com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('💥 Erro na rota de logout:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor no logout',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/auth/verify - Verificar se token é válido
router.get("/verify", verificationToken, async (req, res) => {
  try {
    console.log('🔍 Verificando token...');
    
    // Se chegou até aqui, o token é válido (passou pelo middleware)
    res.status(200).json({
      success: true,
      message: 'Token válido',
      user: {
        email: req.email, // Vem do middleware JWT
        // Adicione outras informações do usuário se necessário
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('💥 Erro na verificação de token:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor na verificação',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/auth/me - Obter dados do usuário logado
router.get("/me", verificationToken, async (req, res) => {
  try {
    console.log('👤 Buscando dados do usuário logado...');
    
    // Aqui você buscaria dados completos do usuário no banco
    // Por enquanto, retornamos as informações básicas do token
    
    res.status(200).json({
      success: true,
      user: {
        email: req.email,
        // Adicione consulta ao banco para buscar mais dados:
        // nome, telefone, data_criacao, etc.
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('💥 Erro ao buscar dados do usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao buscar usuário',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// 🏥 ENDPOINTS DE SAÚDE E TESTE
// ============================================

// GET /api/auth/health - Health check do serviço de auth
router.get("/health", (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Auth API',
    timestamp: new Date().toISOString(),
    endpoints: {
      login: 'POST /api/auth/login',
      logout: 'POST /api/auth/logout',
      verify: 'GET /api/auth/verify',
      me: 'GET /api/auth/me'
    }
  });
});

// GET /api/auth/test - Endpoint de teste (sem autenticação)
router.get("/test", (req, res) => {
  res.status(200).json({
    message: '✅ Rota de autenticação funcionando!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    note: 'Este endpoint não requer autenticação'
  });
});

// GET /api/auth/test-protected - Endpoint de teste (com autenticação)
router.get("/test-protected", verificationToken, (req, res) => {
  res.status(200).json({
    message: '✅ Rota protegida funcionando!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    user: {
      email: req.email
    },
    note: 'Este endpoint requer autenticação válida'
  });
});

// ============================================
// 🔧 MIDDLEWARE DE TRATAMENTO DE ERROS ESPECÍFICO
// ============================================

// Middleware para capturar erros específicos de auth
router.use((error, req, res, next) => {
  console.error('💥 Erro específico de autenticação:', error);
  
  // Erros de JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Token inválido',
      details: 'O token fornecido não é válido'
    });
  }
  
  // Token expirado
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expirado',
      details: 'O token fornecido está expirado'
    });
  }
  
  // Erro genérico
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor de autenticação',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

export default router;
