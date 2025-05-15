import { buscarCursos } from "../services/courses.service.js";
import {
  getChatResponse,
  extrairFiltrosDeTexto,
} from "../services/openai.service.js";
import pool from "../config/db.js";
import fs from "fs";
import { buscarDescricaoCurso } from "../utils/carregarCursoCsv.js";

const modalidadeValidas = ["Presencial", "EAD"];
const turnosValidos = ["Integral", "Noturno"];

const cursosDisponiveis = [
  "Administração",
  "Alimentos",
  "Automação Industrial",
  "Biotecnologia",
  "Celulose e Papel",
  "Desenvolvimento de Sistemas",
  "Edificações",
  "Eletromecânica",
  "Eletrotécnica",
  "Fabricação Mecânica",
  "Logística",
  "Manutenção Automotiva",
  "Mecatrônica",
  "Mecânica",
  "Modelagem do Vestuário",
  "Qualidade",
  "Química",
  "Segurança do Trabalho",
  "Vestuário",
];

function normalizarValorPadrao(valor, validos) {
  if (!valor) return "";
  const padrao = valor.toLowerCase();
  return validos.find((v) => v.toLowerCase() === padrao) || "";
}

function validarCursoInformado(textoUsuario) {
  const texto = textoUsuario.toLowerCase();
  return cursosDisponiveis.find((curso) => texto.includes(curso.toLowerCase()));
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

  const regexDescricao =
    /(?:o que é|do que se trata|sobre)\s+(?:o\s+)?curso\s+de\s+(.+)/i;
  const matchDescricao = message.match(regexDescricao);

  if (matchDescricao) {
    const nomeCurso = matchDescricao[1].trim();
    const descricao = await buscarDescricaoCurso(nomeCurso);

    const resposta = descricao
      ? descricao
      : `Não encontrei informações sobre o curso "${nomeCurso}". Pode verificar o nome e tentar novamente?`;

    await pool.query(
      "INSERT INTO messages (lead_id, user_message, bot_response, curso) VALUES (?, ?, ?, ?)",
      [req.leadId || null, message, resposta, nomeCurso]
    );

    return res.status(200).json({ reply: resposta });
  }

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

      const [[context]] = await pool.query(
        "SELECT * FROM lead_context WHERE lead_id = ?",
        [req.leadId]
      );

      filtros.curso = filtros.curso || context?.curso || null;
      filtros.cidade = filtros.cidade || context?.cidade || null;
      filtros.modalidade = filtros.modalidade || context?.modalidade || null;

      filtros.modalidade = normalizarValorPadrao(
        filtros.modalidade,
        modalidadeValidas
      );
      filtros.turno = normalizarValorPadrao(filtros.turno, turnosValidos);

      if (!filtros.curso) {
        const cursoDetectado = validarCursoInformado(message);
        if (cursoDetectado) filtros.curso = cursoDetectado;
      }

      if (!filtros.cidade) {
        const cidadesConhecidas = [
          "Curitiba",
          "Londrina",
          "Maringá",
          "Toledo",
          "Cascavel",
        ];
        for (const cidade of cidadesConhecidas) {
          if (mensagemLower.includes(cidade.toLowerCase())) {
            filtros.cidade = cidade;
            break;
          }
        }
      }

      await pool.query(
        `INSERT INTO lead_context (lead_id, curso, cidade, modalidade)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           curso = VALUES(curso),
           cidade = VALUES(cidade),
           modalidade = VALUES(modalidade)`,
        [req.leadId, filtros.curso, filtros.cidade, filtros.modalidade]
      );

      const perguntas = [];
      if (!filtros.modalidade)
        perguntas.push("Qual modalidade você prefere? (Presencial ou EAD)");
      if (!filtros.cidade)
        perguntas.push("Qual cidade você gostaria de estudar?");
      if (!filtros.curso) perguntas.push("Qual curso você está procurando?");

      if (perguntas.length > 0) {
        const respostaPerguntas = perguntas.join(" ");
        await pool.query(
          "INSERT INTO messages (lead_id, user_message, bot_response, modalidade, cidade, curso) VALUES (?, ?, ?, ?, ?, ?)",
          [
            req.leadId || null,
            message,
            respostaPerguntas,
            filtros.modalidade || null,
            filtros.cidade || null,
            filtros.curso || null,
          ]
        );
        return res.status(200).json({ reply: respostaPerguntas });
      }

      cursos = await buscarCursos(filtros);

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

      if (desejaSeInscrever) {
        const mensagemWhats = `Olá! Meu nome é ${nome}, tenho interesse no curso de ${curso} em ${cidade}. Poderia me ajudar?`;
        const numberWhatsapp = "559999999999";
        const urlEncodedMessage = encodeURIComponent(mensagemWhats);

        const linkWhatsapp = `https://api.whatsapp.com/send?phone=${numberWhatsapp}&text=${urlEncodedMessage}`;
        const linkInscrevase = `<a href='https://www.senaipr.org.br/cursos-tecnicos/pre-matricula/?id=${idUser}&nome=${nome}&email=${email}&telefone=${telefone}&modalidade=${modalidade}&cidade=${cidade}&curso=${curso}'>Inscreva-se aqui</a>`;

        const resposta = `\nÓtimo! Você pode realizar sua inscrição por um dos caminhos abaixo:\n\n📋 Formulário de pré-matrícula: ${linkInscrevase}\n💬 WhatsApp: ${linkWhatsapp}`;

        await pool.query(
          `INSERT INTO messages (lead_id, user_message, bot_response, nome, email, telefone, modalidade, cidade, curso)
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

        return res.status(200).json({ reply: resposta });
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

    const botResponse = await getChatResponse(message, req.leadId);

    const [[leadInfo]] = await pool.query("SELECT * FROM leads WHERE id = ?", [
      req.leadId,
    ]);
    const nome = leadInfo?.nome || "não informado";
    const email = leadInfo?.email || "";
    const telefone = leadInfo?.telefone || "";

    await pool.query(
      `INSERT INTO messages (lead_id, user_message, bot_response, nome, email, telefone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.leadId || null, message, botResponse, nome, email, telefone]
    );

    return res.status(200).json({ reply: botResponse });
  } catch (err) {
    console.error("Erro no Chat Controller:", err);
    return res.status(500).json({ error: "Erro ao processar a mensagem" });
  }
}

export default chatController;
