// import dotenv from "dotenv";
// dotenv.config();
// import axios from "axios";

// export default async function verifyCaptcha(req, res, next) {
//   const { captchaToken, lead_id } = req.body;

//   if (!captchaToken || !lead_id) {
//     return res.status(400).json({ error: "captchaToken e lead_id são obrigatórios" });
//   }

// <<<<<<< HEAD
//   const secretKey = process.env.RECAPTCHA_SECRET_KEY;
//   console.log("Chave secreta carregada:", secretKey);
//   if (!secretKey) {
//     return res.status(500).json({ error: "Erro de configuração do servidor" });
// =======
//   // ✅ Simulação Teste (passa direto pro próximo)
//   if (token === "TESTE") {
//     return next(); // Não finaliza a requisição, apenas continua
// >>>>>>> fa97dde (Atualização do RECAPTCHA)
//   }

//   try {
//     const response = await axios.post(
//       "https://www.google.com/recaptcha/api/siteverify",
//       `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(captchaToken)}`,
//       {
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       }
//     );

//     const result = response.data;

//     if (!result.success) {
//       return res.status(400).json({
//         error: "Falha na verificação do reCAPTCHA",
//         details: result["error-codes"],
//       });
//     }

// <<<<<<< HEAD
//     const mockJwtToken = `jwt_${lead_id}_${Date.now()}`;

//     return res.status(200).json({
//       success: true,
//       token: mockJwtToken,
//     });
// =======
//     next(); // Verificado com sucesso, continua
// >>>>>>> fa97dde (Atualização do RECAPTCHA)
//   } catch (err) {
//     return res.status(500).json({ error: "Erro na validação do reCAPTCHA", details: err.message });
//   }
// }

import dotenv from "dotenv";
dotenv.config();
import axios from "axios";

export default async function verifyCaptcha(req, res, next) {
  const { captchaToken, lead_id } = req.body;

  if (!captchaToken || !lead_id) {
    return res
      .status(400)
      .json({ error: "captchaToken e lead_id são obrigatórios" });
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  console.log("Chave secreta carregada:", secretKey);

  if (!secretKey) {
    return res.status(500).json({ error: "Erro de configuração do servidor" });
  }

  // ✅ Simulação para ambiente de teste
  if (captchaToken === "TESTE") {
    console.log("Bypass de CAPTCHA para token TESTE");
    const mockJwtToken = `jwt_${lead_id}_${Date.now()}`;
    return res.status(200).json({
      success: true,
      token: mockJwtToken,
    });
  }

  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(
        captchaToken
      )}`,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const result = response.data;

    if (!result.success) {
      return res.status(400).json({
        error: "Falha na verificação do reCAPTCHA",
        details: result["error-codes"],
      });
    }

    const mockJwtToken = `jwt_${lead_id}_${Date.now()}`;
    return res.status(200).json({
      success: true,
      token: mockJwtToken,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Erro na validação do reCAPTCHA", details: err.message });
  }
}
