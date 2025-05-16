import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import chatRoutes from "./src/routes/chat.routes.js";
import messagesRoutes from "./src/routes/messages.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import coursesRoutes from "./src/routes/courses.routes.js";
import leadRoutes from "./src/routes/lead.routes.js";
import captchaRoutes from "./src/routes/captcha.routes.js";
import pool from "./src/config/db.js"; // ou ajuste caminho


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para permitir CORS
app.use(cors());
app.use(express.json());

//Rotas
app.use("/api/chat", chatRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/lead", leadRoutes);
app.use("/api/captcha", captchaRoutes);

// Teste de saude da API
app.get("/", (req, res) => {
  res.send({ message: "API está funcionando!" });
});


app.listen(PORT, async () => {
  try {
    const [rows] = await pool.query("SELECT 1");
    console.log(`Conexão com o banco de dados OK.`);
  } catch (err) {
    console.error("Erro ao conectar no banco:", err.message);
  }

  console.log(`Servidor rodando na porta ${PORT}`);
});
