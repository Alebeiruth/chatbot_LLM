import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

export default async function verifyCaptcha(req, res, next) {
  const token = req.body.captchaToken;

  if (!token) {
    return res.status(400).json({ error: "Captcha não fornecido" });
  }

  // Simulação Teste
  if (token === "TESTE") {
    return res
      .status(200)
      .json({ success: true, message: "Captcha verificado com sucesso" });
  }

  try {
    const resposta = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
      }
    );

    const resultado = await resposta.json();

    if (!resultado.success) {
      return res
        .status(400)
        .json({ error: "Falha na verificação do reCAPTCHA" });
    }

    next();
  } catch (err) {
    console.error("Erro ao verificar reCAPTCHA:", err.message);
    return res.status(500).json({ error: "Erro na validação do reCAPTCHA" });
  }
}
