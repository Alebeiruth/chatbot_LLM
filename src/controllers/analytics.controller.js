// /**
//  * GET /api/analytics/desistencias
//  * Retorna usuarios que demostratam possivel desistencia com base nas mensagens 
//  */

// async function listarDesistencias(req, res) {
//     try {
//         const palavrasChaves = [ "caro", "não gostei", "não quero", "vou pensar", "não posso", "sem dinheiro", "não estou satisfeito", "não quero mais", "não quero continuar", "não quero mais receber", "não quero mais saber", "não quero mais fazer parte", "não quero mais participar", "não quero mais usar", "não quero mais comprar", "não quero mais pagar", "não quero mais gastar", "não quero mais investir", "não quero mais ter", "não quero mais ser" ];

//         // Busca mensagens com essas palavras-chave
//         const [rows] = await pool.query(`SELECT m.*, u.nome, u.email FROM messages m JOIN  users u ON m.user_id = u.id WHERE ${palavrasChaves.map(() => 'm.message LIKE ?').join(' OR ')} ORDER BY m.timestamp DESC`, palavrasChaves.map(palavra => `%${palavra}%`));

//         res.status(200).json({ resultados: rows });
//     } catch (err) {
//         console.error("Erro ao listar mensagens de desistência:", err);
//         res.status(500).json({ message: "Erro interno ao listar mensagens de desistência" });
//     }
// }

// module.exports = {