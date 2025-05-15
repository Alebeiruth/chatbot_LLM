import pool from "../config/db.js";

export async function salvarLead(req, res) {
  const { nome, email, telefone } = req.body;

  if (!nome || !email || !telefone) {
    return res
      .status(400)
      .json({ success: false, error: "Todos os campos são obrigatórios." });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO leads (nome, email, telefone) VALUES (?, ?, ?)",
      [nome, email, telefone]
    );

    return res.status(201).json({
      success: true,
      lead_id: result.insertId,
    });
  } catch (err) {
    console.error("Erro ao inserir lead:", err);
    return res
      .status(500)
      .json({ success: false, error: "Erro ao criar lead" });
  }
}
