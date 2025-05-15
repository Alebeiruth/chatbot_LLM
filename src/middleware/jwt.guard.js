import jwt from "jsonwebtoken";

function verificationToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  //Esperando: Bearer <token>
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  try {
    // Verifica o Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    req.leadID = decoded.leadID; // Adiciona o usuário decodificado ao objeto de requisição
    next(); // Chama o próximo middleware ou rota
  } catch (err) {
    return res
      .status(403)
      .json({ success: false, message: "Token inválido ou expirado" });
  }
}

export default verificationToken;
