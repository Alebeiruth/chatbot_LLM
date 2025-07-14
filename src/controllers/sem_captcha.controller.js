import fetch from "node-fetch";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../config/db.js";

dotenv.config();

export async function processarCaptcha(req, res) {
  try {
    const captchaToken = req.body.captchaToken?.trim();
    const email = req.body.email?.trim();

    if (!captchaToken || !email) {
      return res.status(400).json({
        success: false,
        message: "captchaToken e email são obrigatórios",
      });
    }

    // 🔎 Log para debug
    console.log("🔐 Verificando captcha para email:", email);
    console.log("Email recebido:", `"${email}"`);
    console.log("📩 Token recebido:", captchaToken);

    // ✅ Verifica se o email existe no banco
    const [rows] = await pool.query("SELECT * FROM leads WHERE email = ?", [
      email,
    ]);

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Lead não encontrado para este e-mail",
      });
    }

    // ✅ Modo de teste (desative em produção)
    if (captchaToken === "TESTE") {
      const token = jwt.sign({ email }, process.env.JWT_SECRET_TOKEN, {
        expiresIn: "10m",
      });

      return res.status(200).json({
        success: true,
        message: "Captcha verificado com sucesso (modo teste)",
        token,
      });
    }

    // 🔐 Validação real no Google reCAPTCHA
    const googleRes = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: captchaToken,
        }),
      }
    );

    const data = await googleRes.json();

    console.log("📬 Resposta do Google reCAPTCHA:", data);

    if (!data.success) {
      console.warn("Erro Google reCAPTCHA:", data["error-codes"]);
      return res.status(400).json({
        success: false,
        message: "Falha na verificação do reCAPTCHA",
        errorCodes: data["error-codes"],
      });
    }

    // ✅ Se passou, gerar token
    const token = jwt.sign({ email }, process.env.JWT_SECRET_TOKEN, {
      expiresIn: "10m",
    });

    return res.status(200).json({
      success: true,
      message: "Captcha verificado com sucesso",
      token,
    });
  } catch (err) {
    console.error("❌ Erro geral no CAPTCHA:", err);
    return res.status(500).json({
      success: false,
      message: "Erro na validação do reCAPTCHA",
    });
  }
}
