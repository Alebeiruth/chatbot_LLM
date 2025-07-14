// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// dotenv.config();

// export default function verificationToken(req, res, next) {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];

//   if (!token) {
//     return res.status(401).json({ message: "Token não fornecido" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
//     req.email = decoded.email;

//     if (!req.email) {
//       return res.status(400).json({ error: "Email não presente no token" });
//     }

//     next();
//   } catch (err) {
//     return res
//       .status(403)
//       .json({ success: false, message: "Token inválido ou expirado" });
//   }
// }


// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> NOVA VERSÃO TESTE 27/06/2025 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export default function verificationToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    req.email = decoded.email;

    if (!req.email) {
      return res.status(400).json({ error: "Email não presente no token" });
    }

    next();
  } catch (err) {
    return res
      .status(403)
      .json({ success: false, message: "Token inválido ou expirado" });
  }
}
