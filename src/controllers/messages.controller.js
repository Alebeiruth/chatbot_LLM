import pool from "../config/db.js";

/**
 * GET /api/messages
 * Retorna todas as mensagens do historico do chatbot
 */

async function listaMensagens(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM messages ORDER BY timestamp DESC"
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao listar mensagens:", error);
    res.status(500).json({ error: "Erro ao buscar mensagens" });
  }
}

export default listaMensagens;
