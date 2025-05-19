import fetch from "node-fetch";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../config/db.js";
dotenv.config();

export async function processarCaptcha(req, res) {
  const { captchaToken, email } = req.body;
  if (!captchaToken || !email) {
    return res.status(400).json({
      success: false,
      message: "captchaToken e email são obrigatórios",
    });
  }
  // Verifica se o email existe no banco
  const [rows] = await pool.query("SELECT * FROM leads WHERE email = ?", [
    email,
  ]);
  if (!rows.length) {
    return res.status(404).json({
      success: false,
      message: "Lead não encontrado para este e-mail",
    });
  }

  // ✅ Modo de teste
  if (captchaToken === "TESTE") {
    const token = jwt.sign({ email }, process.env.JWT_SECRET_TOKEN, {
      expiresIn: "10m",
    });

    return res.status(200).json({
      success: true,
      message: "Captcha verificado com sucesso",
      token,
    });
  }

  // ✅ Modo produção
  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: captchaToken,
        }),
      }
    );

    const data = await response.json();

    if (!data.success) {
      return res.status(400).json({
        success: false,
        message: "Falha na verificação do reCAPTCHA",
      });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET_TOKEN, {
      expiresIn: "10m",
    });

    return res.status(200).json({
      success: true,
      message: "Captcha verificado com sucesso",
      token,
    });
  } catch (err) {
    console.error("Erro ao verificar reCAPTCHA:", err.message);
    return res.status(500).json({
      success: false,
      message: "Erro na validação do reCAPTCHA",
    });
  }
}
