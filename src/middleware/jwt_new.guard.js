import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import pool from "../config/db.js";

dotenv.config();

// Rate limiting para tentativas de autenticação
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 tentativas por IP por janela
  message: {
    error: "Muitas tentativas de autenticação. Tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Lista de tokens invalidados (blacklist simples)
// Para produção, considere usar Redis ou banco de dados
const tokenBlacklist = new Set();

/**
 * Adiciona token à blacklist
 * @param {string} token - Token a ser invalidado
 */
export function blacklistToken(token) {
  tokenBlacklist.add(token);
}

/**
 * Verifica se o token está na blacklist
 * @param {string} token - Token a ser verificado
 * @returns {boolean}
 */
function isTokenBlacklisted(token) {
  return tokenBlacklist.has(token);
}

/**
 * Valida se o email existe no banco de dados
 * @param {string} email - Email a ser validado
 * @returns {Promise<boolean>}
 */
async function validateEmailInDatabase(email) {
  try {
    const [rows] = await pool.query(
      "SELECT email FROM leads WHERE email = ? LIMIT 1",
      [email]
    );
    return rows.length > 0;
  } catch (error) {
    console.error("Erro ao validar email no banco:", error);
    return false;
  }
}

/**
 * Middleware de verificação de token JWT com segurança aprimorada
 */
export default async function verificationToken(req, res, next) {
  try {
    // 1. Verificar se JWT_SECRET_TOKEN está configurado
    if (!process.env.JWT_SECRET_TOKEN) {
      console.error("❌ JWT_SECRET_TOKEN não configurado no ambiente");
      return res.status(500).json({
        success: false,
        error: "Configuração de segurança inválida",
      });
    }

    // 2. Extrair token do header Authorization
    const authHeader = req.headers["authorization"];
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Header de autorização não fornecido",
        code: "MISSING_AUTH_HEADER",
      });
    }

    // Verificar formato "Bearer <token>"
    const tokenParts = authHeader.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      return res.status(401).json({
        success: false,
        error: "Formato de token inválido. Use: Bearer <token>",
        code: "INVALID_TOKEN_FORMAT",
      });
    }

    const token = tokenParts[1];

    // 3. Verificar se token não está vazio
    if (!token || token.trim() === "") {
      return res.status(401).json({
        success: false,
        error: "Token não fornecido",
        code: "MISSING_TOKEN",
      });
    }

    // 4. Verificar se token não está na blacklist
    if (isTokenBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        error: "Token foi invalidado",
        code: "TOKEN_BLACKLISTED",
      });
    }

    // 5. Verificar e decodificar o token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    } catch (jwtError) {
      // Tratar diferentes tipos de erro JWT
      let errorMessage = "Token inválido";
      let errorCode = "INVALID_TOKEN";

      if (jwtError.name === "TokenExpiredError") {
        errorMessage = "Token expirado";
        errorCode = "TOKEN_EXPIRED";
      } else if (jwtError.name === "JsonWebTokenError") {
        errorMessage = "Token malformado";
        errorCode = "MALFORMED_TOKEN";
      } else if (jwtError.name === "NotBeforeError") {
        errorMessage = "Token ainda não é válido";
        errorCode = "TOKEN_NOT_ACTIVE";
      }

      return res.status(403).json({
        success: false,
        error: errorMessage,
        code: errorCode,
      });
    }

    // 6. Validar estrutura do payload
    if (!decoded || typeof decoded !== "object") {
      return res.status(403).json({
        success: false,
        error: "Payload do token inválido",
        code: "INVALID_PAYLOAD",
      });
    }

    // 7. Verificar se email está presente no payload
    if (!decoded.email || typeof decoded.email !== "string") {
      return res.status(403).json({
        success: false,
        error: "Email não presente no token ou inválido",
        code: "MISSING_EMAIL",
      });
    }

    // 8. Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(decoded.email)) {
      return res.status(403).json({
        success: false,
        error: "Formato de email inválido no token",
        code: "INVALID_EMAIL_FORMAT",
      });
    }

    // 9. Verificar se o email existe no banco de dados
    const emailExists = await validateEmailInDatabase(decoded.email);
    if (!emailExists) {
      return res.status(403).json({
        success: false,
        error: "Usuário não encontrado",
        code: "USER_NOT_FOUND",
      });
    }

    // 10. Verificar se o token não está muito antigo (opcional)
    const tokenAge = Date.now() / 1000 - decoded.iat;
    const maxTokenAge = 24 * 60 * 60; // 24 horas em segundos
    
    if (tokenAge > maxTokenAge) {
      return res.status(403).json({
        success: false,
        error: "Token muito antigo, faça login novamente",
        code: "TOKEN_TOO_OLD",
      });
    }

    // 11. Adicionar informações ao request para próximos middlewares
    req.email = decoded.email;
    req.user = {
      email: decoded.email,
      userId: decoded.userId || null,
      tokenIssued: decoded.iat,
      tokenExpires: decoded.exp,
    };

    // 12. Log para auditoria (remover em produção ou usar logger adequado)
    console.log(`✅ Usuário autenticado: ${decoded.email} - ${new Date().toISOString()}`);

    next();
  } catch (error) {
    // Log de erro para debugging
    console.error("Erro inesperado no middleware de autenticação:", error);
    
    return res.status(500).json({
      success: false,
      error: "Erro interno de autenticação",
      code: "INTERNAL_AUTH_ERROR",
    });
  }
}

/**
 * Middleware opcional para verificar permissões específicas
 * @param {string[]} requiredRoles - Roles necessárias
 */
export function requireRoles(requiredRoles) {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];
    
    const hasRequiredRole = requiredRoles.some(role => 
      userRoles.includes(role)
    );

    if (!hasRequiredRole) {
      return res.status(403).json({
        success: false,
        error: "Permissões insuficientes",
        code: "INSUFFICIENT_PERMISSIONS",
      });
    }

    next();
  };
}

/**
 * Middleware para logout que adiciona token à blacklist
 */
export function logout(req, res) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  
  if (token) {
    blacklistToken(token);
  }

  res.json({
    success: true,
    message: "Logout realizado com sucesso",
  });
}