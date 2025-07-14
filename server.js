// // import express from "express";
// // import cors from "cors";
// // import dotenv from "dotenv";

// // import chatRoutes from "./src/routes/chat.routes.js";
// // import messagesRoutes from "./src/routes/messages.routes.js";
// // import authRoutes from "./src/routes/auth.routes.js";
// // // import coursesRoutes from "./src/routes/courses.routes.js";
// // import leadRoutes from "./src/routes/lead.routes.js";
// // // import captchaRoutes from "./src/routes/captcha.routes.js";
// // import pool from "./src/config/db.js"; // ou ajuste caminho

// // dotenv.config();
// // const app = express();
// // const PORT = process.env.PORT || 3000;

// // // Middleware para permitir CORS
// // app.use(cors());
// // app.use(express.json());

// // //Rotas
// // app.use("/api/chat", chatRoutes);
// // app.use("/api/messages", messagesRoutes);
// // app.use("/api/auth", authRoutes);
// // // app.use("/api/courses", coursesRoutes);
// // app.use("/api/lead", leadRoutes);
// // // app.use("/api/captcha", captchaRoutes);

// // // Teste de saude da API
// // app.get("/", (req, res) => {
// //   res.send({ message: "API está funcionando!" });
// // });

// // app.listen(PORT, async () => {
// //   try {
// //     const [rows] = await pool.query("SELECT 1");
// //     console.log(`Conexão com o banco de dados OK.`);
// //   } catch (err) {
// //     console.error("Erro ao conectar no banco:", err.message);
// //   }

// //   console.log(`Servidor rodando na porta ${PORT}`);
// // });

// // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> NOVA VERSÃO TESTE 03/06/2025 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import chatRoutes from "./src/routes/chat.routes.js";
import messagesRoutes from "./src/routes/messages.routes.js";
// import authRoutes from "./src/routes/auth.routes.js";
// import coursesRoutes from "./src/routes/courses.routes.js";
import leadRoutes from "./src/routes/lead.routes.js";
// import captchaRoutes from "./src/routes/captcha.routes.js";
import pool from "./src/config/db.js";
import { sanitizeInput } from "./src/utils/carregarCursoCsv.js";

// ============================================
// 🎯 FUNÇÃO PRINCIPAL - sendMessage
// ============================================
export const sendMessage = async (req, res) => {
  // 🛡️ HEADERS CORS EXPLÍCITOS - ADICIONAR NO INÍCIO
  res.header("Access-Control-Allow-Origin", "https://www.senaipr.org.br");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  // 🔍 LOGS PARA DEBUG - ADICIONAR LOGO APÓS OS HEADERS
  console.log("📨 === INÍCIO DA REQUISIÇÃO ===");
  console.log("📨 Método:", req.method);
  console.log("📨 URL:", req.url);
  console.log("📨 Origin:", req.headers.origin);
  console.log("📨 Headers recebidos:", req.headers);
  console.log("📨 Body recebido:", req.body);
  console.log("📨 ===============================");

  try {
    // 📝 VALIDAÇÃO BÁSICA DOS DADOS
    const { message, email } = req.body;

    if (!message || message.trim() === "") {
      console.log("❌ Mensagem vazia ou inválida");
      return res.status(400).json({
        success: false,
        message: "Mensagem é obrigatória",
      });
    }

    console.log(`🔍 Processando mensagem: "${message}"`);
    console.log(`📧 Email do usuário: ${email || "não fornecido"}`);

    // 🔍 VERIFICAR SE É PERGUNTA SOBRE DESCRIÇÃO
    if (detectarPerguntaDescricao(message)) {
      console.log("📚 Detectada pergunta sobre descrição de curso");

      const nomeCurso = extrairNomeCursoDaPergunta(message);
      console.log(`🎯 Nome do curso extraído: "${nomeCurso}"`);

      if (nomeCurso) {
        const descricao = buscarDescricaoCurso(nomeCurso);
        if (descricao) {
          console.log("✅ Descrição encontrada, retornando...");

          // Salvar no banco se tiver email
          if (email) {
            try {
              await pool.query(
                "INSERT INTO messages (email, user_message, bot_response) VALUES (?, ?, ?)",
                [email, message, descricao]
              );
              console.log("💾 Conversa salva no banco de dados");
            } catch (dbError) {
              console.warn("⚠️ Erro ao salvar no banco:", dbError);
            }
          }

          return res.json({
            success: true,
            message: descricao,
            type: "description",
          });
        }
      }

      console.log("❌ Descrição não encontrada, seguindo para chat normal...");
    }

    // 🤖 PROCESSAR COM OPENAI
    console.log("🤖 Enviando para OpenAI...");
    const botResponse = await getChatResponse(message, email);
    console.log("✅ Resposta recebida da OpenAI");

    // 💾 SALVAR NO BANCO DE DADOS
    if (email) {
      try {
        await pool.query(
          "INSERT INTO messages (email, user_message, bot_response) VALUES (?, ?, ?)",
          [email, message, botResponse]
        );
        console.log("💾 Conversa salva no banco de dados");
      } catch (dbError) {
        console.error("❌ Erro ao salvar no banco:", dbError);
        // Não retornar erro aqui, apenas logar
      }
    }

    // 🎯 EXTRAIR FILTROS PARA BUSCA
    console.log("🔍 Extraindo filtros da mensagem...");
    const filtros = await extrairFiltrosDeTexto(message);
    console.log("📊 Filtros extraídos:", filtros);

    // 📋 BUSCAR CURSOS SE HOUVER FILTROS
    let cursosEncontrados = null;
    if (filtros.curso || filtros.cidade || filtros.modalidade) {
      console.log("🔍 Buscando cursos com os filtros...");
      try {
        const { cursosDisponiveis } = carregarCursosDoCSV();
        const dicionario = criarDicionarioCursos(cursosDisponiveis);
        cursosEncontrados = filtrarCursosOtimizado(dicionario, filtros);
        console.log(`📚 ${cursosEncontrados?.length || 0} cursos encontrados`);
      } catch (filterError) {
        console.error("❌ Erro ao filtrar cursos:", filterError);
      }
    }

    // 🏙️ VERIFICAR CIDADES ESPECIAIS
    let cidadeEspecial = null;
    if (mencionaCuritibaGenerica(message)) {
      cidadeEspecial = "curitiba";
      console.log("🏢 Detectado menção genérica a Curitiba");
    } else if (mencionaLondrinaGenerica(message)) {
      cidadeEspecial = "londrina";
      console.log("🏭 Detectado menção genérica a Londrina");
    }

    // 📤 RESPOSTA FINAL
    const response = {
      success: true,
      message: botResponse,
      filtros: filtros,
      ...(cursosEncontrados && { cursos: cursosEncontrados }),
      ...(cidadeEspecial && { cidadeEspecial: cidadeEspecial }),
    };

    console.log("✅ Resposta preparada, enviando...");
    console.log("📨 === FIM DA REQUISIÇÃO ===\n");

    return res.json(response);
  } catch (error) {
    // 🚨 TRATAMENTO DE ERRO COMPLETO
    console.error("❌ === ERRO CAPTURADO ===");
    console.error("❌ Mensagem:", error.message);
    console.error("❌ Stack:", error.stack);
    console.error("❌ Body da requisição:", req.body);
    console.error("❌ Headers da requisição:", req.headers);
    console.error("❌ =======================");

    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error:
        process.env.NODE_ENV === "development" ? error.message : "Erro interno",
    });
  }
};

// ============================================
// 🔧 CONFIGURAÇÃO INICIAL
// ============================================

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// 🌐 CONFIGURAÇÃO CORS ROBUSTA
// ============================================

const corsOptions = {
  origin: function (origin, callback) {
    // Lista de origens permitidas
    const allowedOrigins = [
      "http://localhost:3000",
      "https://www.senaipr.org.br",
      "https://senaipr.org.br",
      "http://localhost:3001",
      "http://localhost:5173",
      "http://localhost:3001",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
      "https://web-api-chatbot-profissionalizante.vercel.app",
      "https://chatbot-senai.vercel.app",
      "*", // config cors robusta / libera tudo >  TODO  > depois do desenvolvimento, remova o "*"
      // Adicione outros domínios conforme necessário
    ];

    // Permitir requisições sem origin (Postman, apps mobile, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`🚫 Origin bloqueada pelo CORS: ${origin}`);
      // Em desenvolvimento, permitir todas (mude para false em produção)
      callback(null, true);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "Pragma",
  ],
  exposedHeaders: ["Content-Length"],
  maxAge: 86400, // 24 horas
};

// Aplicar CORS com configurações
app.use(cors(corsOptions));

// ============================================
// 🛡️ MIDDLEWARE ADICIONAL DE CORS (Fallback)
// ============================================

app.use((req, res, next) => {
  // Headers CORS manuais como fallback
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  // Log da requisição
  console.log(
    `📡 ${req.method} ${req.path} - Origin: ${req.headers.origin || "N/A"}`
  );

  // Responder OPTIONS imediatamente (Preflight)
  if (req.method === "OPTIONS") {
    console.log("✅ Preflight CORS aceito");
    return res.status(200).end();
  }

  next();
});

// ============================================
// 🔄 MIDDLEWARE DE PARSING
// ============================================

// Parse JSON
app.use(
  express.json({
    limit: "10mb",
    strict: true,
  })
);

// Parse URL-encoded
app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// ============================================
// 📝 MIDDLEWARE DE LOGGING
// ============================================

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`🕐 [${timestamp}] ${req.method} ${req.url}`);

  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📦 Body:`, JSON.stringify(req.body, null, 2));
  }

  next();
});

// ============================================
// 🏥 HEALTH CHECK ROBUSTO
// ============================================

app.get("/health", async (req, res) => {
  try {
    // Testar conexão com banco
    const [result] = await pool.query("SELECT 1 as test");

    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: "Connected",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    console.error("❌ Health check failed:", error);
    res.status(500).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      database: "Disconnected",
      error: error.message,
    });
  }
});

// ============================================
// 🌍 ROTA RAIZ MELHORADA
// ============================================

app.get("/", (req, res) => {
  res.json({
    message: "🤖 API do Chatbot SENAI Paraná está funcionando!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/health",
      chat: "/api/chat",
      messages: "/api/messages",
      lead: "/api/lead",
    },
  });
});

// ============================================
// 🧪 ENDPOINT DE TESTE CORS
// ============================================

app.get("/test-cors", (req, res) => {
  res.json({
    message: "✅ CORS está funcionando!",
    origin: req.headers.origin,
    method: req.method,
    timestamp: new Date().toISOString(),
    headers: {
      "access-control-allow-origin": res.getHeader(
        "access-control-allow-origin"
      ),
      "access-control-allow-credentials": res.getHeader(
        "access-control-allow-credentials"
      ),
    },
  });
});

// ============================================
// 🛣️ ROTAS DA API
// ============================================

try {
  app.use("/api/chat", chatRoutes);
  app.use("/api/messages", messagesRoutes);
  // app.use("/api/auth", authRoutes);
  // app.use("/api/courses", coursesRoutes);
  app.use("/api/lead", leadRoutes);
  // app.use("/api/captcha", captchaRoutes);

  console.log("✅ Todas as rotas carregadas com sucesso");
} catch (error) {
  console.error("❌ Erro ao carregar rotas:", error);
}

// ============================================
// 🔧 MIDDLEWARE DE TRATAMENTO DE ERROS
// ============================================

// 404 - Rota não encontrada
app.use((req, res, next) => {
  // 404 handler - sem especificar path
  res.status(404).json({
    error: "Rota não encontrada",
    method: req.method,
    url: req.originalUrl,
  });
});

// Tratamento de erros global
app.use((error, req, res, next) => {
  console.error("💥 Erro não tratado:", error);

  // Log detalhado do erro
  console.error("Stack trace:", error.stack);
  console.error("Request details:", {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
  });

  res.status(500).json({
    error: "Erro interno do servidor",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Algo deu errado",
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// 🚀 INICIALIZAÇÃO DO SERVIDOR
// ============================================

app.listen(PORT, async () => {
  try {
    // Testar conexão com banco
    console.log("🔌 Testando conexão com banco de dados...");
    const [rows] = await pool.query("SELECT 1");
    console.log(`✅ Conexão com o banco de dados OK.`);
  } catch (err) {
    console.error("❌ Erro ao conectar no banco:", err.message);
  }

  console.log("\n🚀 ======================================");
  console.log(`🤖 Servidor rodando na porta ${PORT}`);
  console.log(`🌍 Local: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`🧪 Test CORS: http://localhost:${PORT}/test-cors`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log("🚀 ======================================\n");
});

// ============================================
// 🎯 TRATAMENTO DE ERROS NÃO CAPTURADOS
// ============================================

process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

export default app;

// // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> NOVA VERSÃO TESTE 27/06/2025 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import chatRoutes from "./src/routes/chat.routes.js";
// import messagesRoutes from "./src/routes/messages.routes.js";
// import leadRoutes from "./src/routes/lead.routes.js";
// import pool from "./src/config/db.js";

// // ============================================
// // 🔧 CONFIGURAÇÃO INICIAL
// // ============================================

// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 3000;

// // ============================================
// // 🌐 CONFIGURAÇÃO CORS ROBUSTA
// // ============================================

// const corsOptions = {
//   origin: "*", // ← LIBERA TODOS OS DOMÍNIOS
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
//   allowedHeaders: [
//     "Origin",
//     "X-Requested-With",
//     "Content-Type",
//     "Accept",
//     "Authorization",
//     "Cache-Control",
//     "Pragma",
//   ],
//   exposedHeaders: ["Content-Length"],
//   maxAge: 86400, // 24 horas
// };

// // Aplicar CORS com configurações
// app.use(cors(corsOptions));

// // ============================================
// // 🛡️ MIDDLEWARE ADICIONAL DE CORS (Simplificado)
// // ============================================

// app.use((req, res, next) => {
//   // Headers CORS manuais como fallback - LIBERAR TUDO
//   res.header("Access-Control-Allow-Origin", "*"); // ← LIBERA TUDO
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, DELETE, OPTIONS, PATCH"
//   );
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );

//   // Log da requisição
//   console.log(
//     `📡 ${req.method} ${req.path} - Origin: ${req.headers.origin || "N/A"}`
//   );

//   // Responder OPTIONS imediatamente (Preflight)
//   if (req.method === "OPTIONS") {
//     console.log("✅ Preflight CORS aceito");
//     return res.status(200).end();
//   }

//   next();
// });

// // ============================================
// // 🔄 MIDDLEWARE DE PARSING
// // ============================================

// // Parse JSON
// app.use(
//   express.json({
//     limit: "10mb",
//     strict: true,
//   })
// );

// // Parse URL-encoded
// app.use(
//   express.urlencoded({
//     extended: true,
//     limit: "10mb",
//   })
// );

// // ============================================
// // 📝 MIDDLEWARE DE LOGGING
// // ============================================

// app.use((req, res, next) => {
//   const timestamp = new Date().toISOString();
//   console.log(`🕐 [${timestamp}] ${req.method} ${req.url}`);

//   if (req.body && Object.keys(req.body).length > 0) {
//     console.log(`📦 Body:`, JSON.stringify(req.body, null, 2));
//   }

//   next();
// });

// // ============================================
// // 🏥 HEALTH CHECK
// // ============================================

// app.get("/health", async (req, res) => {
//   try {
//     // Testar conexão com banco
//     const [result] = await pool.query("SELECT 1 as test");

//     res.status(200).json({
//       status: "OK",
//       timestamp: new Date().toISOString(),
//       uptime: process.uptime(),
//       database: "Connected",
//       version: "1.0.0",
//       environment: process.env.NODE_ENV || "development",
//     });
//   } catch (error) {
//     console.error("❌ Health check failed:", error);
//     res.status(500).json({
//       status: "ERROR",
//       timestamp: new Date().toISOString(),
//       database: "Disconnected",
//       error: error.message,
//     });
//   }
// });

// // ============================================
// // 🌍 ROTA RAIZ
// // ============================================

// app.get("/", (req, res) => {
//   res.json({
//     message: "🤖 API do Chatbot SENAI Paraná está funcionando!",
//     version: "1.0.0",
//     timestamp: new Date().toISOString(),
//     endpoints: {
//       health: "/health",
//       chat: "/api/chat",
//       messages: "/api/messages",
//       lead: "/api/lead",
//     },
//   });
// });

// // ============================================
// // 🧪 ENDPOINT DE TESTE CORS
// // ============================================

// app.get("/test-cors", (req, res) => {
//   res.json({
//     message: "✅ CORS está funcionando!",
//     origin: req.headers.origin,
//     method: req.method,
//     timestamp: new Date().toISOString(),
//     headers: {
//       "access-control-allow-origin": res.getHeader(
//         "access-control-allow-origin"
//       ),
//       "access-control-allow-credentials": res.getHeader(
//         "access-control-allow-credentials"
//       ),
//     },
//   });
// });

// // ============================================
// // 🛣️ ROTAS DA API
// // ============================================

// try {
//   app.use("/api/chat", chatRoutes);
//   app.use("/api/messages", messagesRoutes);
//   app.use("/api/lead", leadRoutes);
//   console.log("✅ Todas as rotas carregadas com sucesso");
// } catch (error) {
//   console.error("❌ Erro ao carregar rotas:", error);
// }

// // ============================================
// // 🔧 MIDDLEWARE DE TRATAMENTO DE ERROS
// // ============================================

// // 404 - Rota não encontrada
// app.use((req, res, next) => {
//   // 404 handler - sem especificar path
//   res.status(404).json({
//     error: "Rota não encontrada",
//     method: req.method,
//     url: req.originalUrl,
//   });
// });

// // Tratamento de erros global
// app.use((error, req, res, next) => {
//   console.error("💥 Erro não tratado:", error);

//   // Log detalhado do erro
//   console.error("Stack trace:", error.stack);
//   console.error("Request details:", {
//     method: req.method,
//     url: req.url,
//     headers: req.headers,
//     body: req.body,
//   });

//   res.status(500).json({
//     error: "Erro interno do servidor",
//     message:
//       process.env.NODE_ENV === "development"
//         ? error.message
//         : "Algo deu errado",
//     timestamp: new Date().toISOString(),
//   });
// });

// // ============================================
// // 🚀 INICIALIZAÇÃO DO SERVIDOR
// // ============================================

// app.listen(PORT, async () => {
//   try {
//     // Testar conexão com banco
//     console.log("🔌 Testando conexão com banco de dados...");
//     const [rows] = await pool.query("SELECT 1");
//     console.log(`✅ Conexão com o banco de dados OK.`);
//   } catch (err) {
//     console.error("❌ Erro ao conectar no banco:", err.message);
//   }

//   console.log("\n🚀 ======================================");
//   console.log(`🤖 Servidor rodando na porta ${PORT}`);
//   console.log(`🌍 Local: http://localhost:${PORT}`);
//   console.log(`🏥 Health: http://localhost:${PORT}/health`);
//   console.log(`🧪 Test CORS: http://localhost:${PORT}/test-cors`);
//   console.log(`📡 API: http://localhost:${PORT}/api`);
//   console.log("🚀 ======================================\n");
// });

// // ============================================
// // 🎯 TRATAMENTO DE ERROS NÃO CAPTURADOS
// // ============================================

// process.on("uncaughtException", (error) => {
//   console.error("💥 Uncaught Exception:", error);
//   process.exit(1);
// });

// process.on("unhandledRejection", (reason, promise) => {
//   console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
//   process.exit(1);
// });

// export default app;
