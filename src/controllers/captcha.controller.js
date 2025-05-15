import fetch from "node-fetch";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export async function processarCaptcha(req, res) {
  const { captchaToken, lead_id } = req.body;

  if (!captchaToken || !lead_id) {
    return res.status(400).json({
      success: false,
      message: "captchaToken e lead_id são obrigatórios",
    });
  }

  // ✅ Modo de teste - retorna token falso
  if (captchaToken === "TESTE") {
    const token = jwt.sign({ leadId: lead_id }, process.env.JWT_SECRET_TOKEN, {
      expiresIn: "10m"
    });

    return res.status(200).json({
      success: true,
      message: "Captcha verificado com sucesso",
      token: token
    });
  }

  // ✅ Modo produção - verifica no Google
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

    const token = jwt.sign({ leadId: lead_id }, process.env.JWT_SECRET_TOKEN, {
      expiresIn: "10m"
    });

    return res.status(200).json({
      success: true,
      message: "Captcha verificado com sucesso",
      token: token
    });
  } catch (err) {
    console.error("Erro ao verificar reCAPTCHA:", err.message);
    return res.status(500).json({
      success: false,
      message: "Erro na validação do reCAPTCHA",
    });
  }
}
