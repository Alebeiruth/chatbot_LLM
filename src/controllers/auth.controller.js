import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../config/db.js";

/**
 * POS /api/auth/login
 * Realiza o login consultando o banco de dados e validandos senha
 */

export async function login(req, res) {
  const { email, senha } = req.body;

  try {
    // Busca usuário no banco de dados
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const usuario = rows[0];

    if (!usuario) {
      return res.status(401).json({ message: "Usuario não encontrado" });
    }

    // Verifica se a senha está correta
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: "Senha invalida" });
    }

    // Gera o token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        role: usuario.role,
      },
      process.env.JWT_SECRET_TOKEN,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro interno no login" });
  }
}
export default login;
