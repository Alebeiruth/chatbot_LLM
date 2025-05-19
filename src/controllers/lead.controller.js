import pool from "../config/db.js";

/**
 * Salva um novo lead no banco de dados.
 * @route POST /api/lead
 * @body { nome, email, telefone }
 *
 */

export async function getHistoricoDoUsuarioLogado(req, res) {
  const email = req.email;

  try {
    const [rows] = await pool.query(
      `
      SELECT
        l.id AS lead_id,
        l.nome,
        l.email,
        l.telefone,
        l.criado_em,
        lc.curso,
        lc.cidade,
        lc.modalidade,
        m.user_message,
        m.bot_response,
        m.timestamp
      FROM leads l
      LEFT JOIN lead_context lc ON l.id = lc.lead_id
      LEFT JOIN messages m ON l.email = m.email
      WHERE l.email = ?
      ORDER BY m.timestamp ASC
    `,
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Nenhum histórico encontrado para este e-mail.",
      });
    }

    const { nome, telefone, criado_em, curso, cidade, modalidade } = rows[0];
    const mensagens = rows
      .map((row) => ({
        user_message: row.user_message,
        bot_response: row.bot_response,
        timestamp: row.timestamp,
      }))
      .filter((msg) => msg.user_message || msg.bot_response);

    return res.status(200).json({
      success: true,
      email,
      nome,
      telefone,
      criado_em,
      curso,
      cidade,
      modalidade,
      mensagens,
    });
  } catch (error) {
    console.error("Erro ao buscar histórico do usuário:", error.message);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao buscar histórico do usuário",
    });
  }
}

export async function salvarLead(req, res) {
  try {
    const { nome, email, telefone } = req.body;

    // ⚠️ Validação simples dos campos obrigatórios
    if (!nome?.trim() || !email?.trim() || !telefone?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Nome, e-mail e telefone são obrigatórios.",
      });
    }
    const [exists] = await pool.query("SELECT id FROM leads WHERE email = ?", [
      email,
    ]);

    // Verifica se o lead já existe
    if (exists.length) {
      return res.status(200).json({
        success: true,
        email,
        message: "Lead já cadastrado.",
      });
    }

    // Inserção no banco
    const [result] = await pool.query(
      `
      INSERT INTO leads (nome, email, telefone)
      VALUES (?, ?, ?)
      `,
      [nome.trim(), email.trim(), telefone.trim()]
    );

    // 🔐 Retorno do ID e sucesso
    return res.status(201).json({
      success: true,
      lead_id: result.insertId,
      message: "Lead criado com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao salvar lead:", error.message);
    return res.status(500).json({
      success: false,
      error: "Erro interno ao salvar o lead.",
    });
  }
}
