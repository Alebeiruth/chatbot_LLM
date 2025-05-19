import pool from "../config/db.js";

/**
 * GET /api/messages
 * Retorna as mensagens do usuário autenticado com base no email do token JWT
 */
async function listaMensagens(req, res) {
  try {
    const email = req.email; // <-- injetado pelo middleware JWT

    if (!email) {
      return res
        .status(400)
        .json({ error: "Email do usuário não encontrado no token." });
    }

    const [rows] = await pool.query("SELECT * FROM messages WHERE email = ?", [
      email,
    ]);

    res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao listar mensagens:", error);
    res.status(500).json({ error: "Erro ao buscar mensagens" });
  }
}

export default listaMensagens;
