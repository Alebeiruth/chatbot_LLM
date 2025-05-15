import { buscarCursos } from "../services/courses.service.js";
import {
  getChatResponse,
  extrairFiltrosDeTexto,
} from "../services/openai.service.js";
import pool from "../config/db.js";
import fs from "fs";

const modalidadeValidas = ["Presencial", "EAD"];
const turnosValidos = ["Integral", "Noturno"];

function normalizarValorPadrao(valor, validos) {
  if (!valor) return "";
  const padrao = valor.toLowerCase();
  return validos.find((v) => v.toLowerCase() === padrao) || "";
}

function formatarRespostaCursos(cursos, filtros) {
  if (!cursos.length) {
    return "Não encontramos cursos com essas características.";
  }

  const cidade =
    filtros.cidade ||
    filtros.cidadeOriginal ||
    cursos[0].cidade ||
    "não informada";

  const cursosFiltrados = cursos.filter((c) =>
    c.cidade.toLowerCase().includes(filtros.cidade.toLowerCase())
  );

  if (!cursosFiltrados.length) {
    return "Não encontramos cursos com essas características.";
  }

  if (cursosFiltrados.length === 1) {
    const curso = cursosFiltrados[0];
    return `Sim! Temos o curso de ${curso.curso} em ${cidade}, no turno ${curso.turno}. Aulas às ${curso.horario_aulas}, no formato ${curso.modalidade}. Início em ${curso.data_inicio}. Investimento: R$${curso.valor_curso}.`;
  }

  if (cursosFiltrados.length <= 3) {
    const nomes = cursosFiltrados.map((c) => c.curso.trim()).join(", ");
    return `Encontrei alguns cursos em ${cidade}: ${nomes}. Quer detalhes sobre algum deles?`;
  }

  return `Temos vários cursos em ${cidade}. Me diga qual te interessa para te dar mais detalhes.`;
}

export async function chatController(req, res) {
  const { message } = req.body;
  let cursos = [];
  let filtros = {};

  try {
    const mensagemLower = message.toLowerCase();

    const palavrasCurso = [
      "curso",
      "cursos",
      "matricula",
      "inscrição",
      "vagas",
      "informações",
      "valor",
      "disponibilidade",
      "detalhes",
      "data de início",
      "horário das aulas",
      "modalidade",
      "presencial",
      "online",
      "ead",
      "preço",
      "custo",
      "cursos técnicos",
      "valor do curso",
    ];

    const palavrasInscricao = [
      "quero me inscrever",
      "fazer matrícula",
      "fazer inscrição",
      "quero me matricular",
      "como me inscrevo",
      "onde me inscrevo",
      "onde me matriculo",
      "como me matriculo",
      "me inscrever",
      "me interesso",
    ];

    const eConsultaCurso = palavrasCurso.some((p) => mensagemLower.includes(p));
    const desejaSeInscrever = palavrasInscricao.some((p) =>
      mensagemLower.includes(p)
    );

    if (eConsultaCurso) {
      filtros = await extrairFiltrosDeTexto(message);

      // Força cidade se IA não identificar
      if (!filtros.cidade) {
        const cidadesConhecidas = [
          "Curitiba",
          "Londrina",
          "Maringá",
          "Toledo",
          "Cascavel",
          "Ponta Grossa",
          "Guarapuava",
          "Foz do Iguaçu",
          "Colombo",
          "Afonso Pena",
          "Rio Negro",
          "Arapongas",
          "Campo Mourão",
          "Santo Antonio da Platina",
          "Telêmaco Borba",
          "Umuarama",
          "Paranavaí",
          "Medianeira",
          "Apucarana",
          "Irati",
          "Jaguariaíva",
          "São Mateus do Sul",
        ];

        for (const cidade of cidadesConhecidas) {
          if (mensagemLower.includes(cidade.toLowerCase())) {
            filtros.cidade = cidade;
            break;
          }
        }
      }

      filtros.modalidade = normalizarValorPadrao(
        filtros.modalidade,
        modalidadeValidas
      );
      filtros.turno = normalizarValorPadrao(filtros.turno, turnosValidos);

      cursos = await buscarCursos(filtros);

      // 🔄 Buscar info do lead
      const [[leadInfo]] = await pool.query(
        "SELECT * FROM leads WHERE id = ?",
        [req.leadId]
      );
      const nome = leadInfo?.nome || "não informado";
      const email = leadInfo?.email || "";
      const telefone = leadInfo?.telefone || "";
      const curso = filtros.curso || cursos[0]?.curso || "não informado";
      const cidade = filtros.cidade || cursos[0]?.cidade || "não informado";
      const modalidade =
        filtros.modalidade || cursos[0]?.modalidade || "não informado";
      const idUser = req.leadId;

      // ⚡ Se intenção de inscrição
      if (desejaSeInscrever) {
        const mensagemWhats = `Olá! Meu nome é ${nome}, tenho interesse no curso de ${curso} em ${cidade}. Poderia me ajudar?`;
        const numberWhatsapp = "559999999999"; // <-- Substitua com número real
        const urlEncodedMessage = encodeURIComponent(mensagemWhats);

        const linkWhatsapp = `https://api.whatsapp.com/send?phone=${numberWhatsapp}&text=${urlEncodedMessage}`;
        const linkInscrevase = `<a href='https://www.senaipr.org.br/cursos-tecnicos/pre-matricula/?id=${idUser}&nome=${nome}&email=${email}&telefone=${telefone}&modalidade=${modalidade}&cidade=${cidade}&curso=${curso}'>Inscreva-se aqui</a>`;

        const links = `
Ótimo! Você pode realizar sua inscrição por um dos caminhos abaixo:

📋 Formulário de pré-matrícula: ${linkInscrevase}
💬 WhatsApp: ${linkWhatsapp}
        `;

        await pool.query(
          `INSERT INTO messages
    (lead_id, user_message, bot_response, nome, email, telefone, modalidade, cidade, curso)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            req.leadId || null,
            message,
            resposta,
            nome,
            email,
            telefone,
            modalidade,
            cidade,
            curso
          ]
        );

        return res.status(200).json({ reply: links });
      }

      const resposta = formatarRespostaCursos(cursos, filtros);

      await pool.query(
        "INSERT INTO messages (lead_id, user_message, bot_response) VALUES (?, ?, ?)",
        [req.leadId || null, message, resposta]
      );

      fs.appendFileSync(
        "chat.log",
        `\n[${new Date().toISOString()}] Pergunta: ${message}\nResposta: ${resposta}\n`
      );

      return res.status(200).json({ reply: resposta });
    }

    // Pergunta geral
    const botResponse = await getChatResponse(message);

    await pool.query(
      `INSERT INTO messages
    (lead_id, user_message, bot_response, nome, email, telefone, modalidade, cidade, curso)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.leadId || null,
        message,
        resposta,
        nome,
        email,
        telefone,
        modalidade,
        cidade,
        curso,
      ]
    );

    return res.status(200).json({ reply: botResponse });
  } catch (err) {
    console.error("Erro no Chat Controller:", err);
    return res.status(500).json({ error: "Erro ao processar a mensagem" });
  }
}

export default chatController;
