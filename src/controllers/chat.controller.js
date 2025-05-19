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

  const nomes = [...new Set(cursosFiltrados.map((c) => c.curso.trim()))];

  if (!cursosFiltrados.length) {
    return "Não encontramos cursos com essas características.";
  }

  if (nomes.length === 1) {
    const curso = cursosFiltrados[0];
    return `Sim! Temos o curso de ${curso.curso} em ${cidade}, no turno ${curso.turno}. Aulas às ${curso.horario_aulas}, no formato ${curso.modalidade}. Início em ${curso.data_inicio}. Investimento: R$${curso.valor_curso}.`;
  }

  if (nomes.length <= 3) {
    return `Encontrei alguns cursos em ${cidade}: ${nomes.join(
      ", "
    )}. Quer detalhes sobre algum deles?`;
  }

  return `Temos vários cursos em ${cidade}. Me diga qual te interessa para te dar mais detalhes.`;
}

async function obterLeadInfoPorEmail(email) {
  const [[leadInfo]] = await pool.query("SELECT * FROM leads WHERE email = ?", [
    email,
  ]);
  return {
    nome: leadInfo?.nome || "não informado",
    telefone: leadInfo?.telefone || "",
  };
}

export async function chatController(req, res) {
  const { message } = req.body;
  let cursos = [];
  let filtros = {};
  const email = req.email;

  if (!email) {
    return res.status(400).json({ error: "Email do usuário não informado." });
  }

  const { nome, telefone } = await obterLeadInfoPorEmail(email);

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
      "INSERT INTO messages (user_id, user_message, bot_response, nome, email, telefone, curso) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [null, message, resposta, nome, email, telefone, nomeCurso]
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

      filtros.curso = filtros.curso || validarCursoInformado(message);
      filtros.modalidade = normalizarValorPadrao(
        filtros.modalidade,
        modalidadeValidas
      );
      filtros.turno = normalizarValorPadrao(filtros.turno, turnosValidos);

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

      const perguntas = [];
      if (!filtros.modalidade)
        perguntas.push("Qual modalidade você prefere? (Presencial ou EAD)");
      if (!filtros.cidade)
        perguntas.push("Qual cidade você gostaria de estudar?");
      if (!filtros.curso) perguntas.push("Qual curso você está procurando?");

      if (perguntas.length > 0) {
        const respostaPerguntas = perguntas.join(" ");
        await pool.query(
          "INSERT INTO messages (user_id, user_message, bot_response, nome, email, telefone, modalidade, cidade, curso) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            null,
            message,
            respostaPerguntas,
            nome,
            email,
            telefone,
            filtros.modalidade,
            filtros.cidade,
            filtros.curso,
          ]
        );
        return res.status(200).json({ reply: respostaPerguntas });
      }

      cursos = await buscarCursos(filtros);

      const curso = filtros.curso || cursos[0]?.curso || "não informado";
      const cidade = filtros.cidade || cursos[0]?.cidade || "não informado";
      const modalidade =
        filtros.modalidade || cursos[0]?.modalidade || "não informado";

      if (desejaSeInscrever) {
        const mensagemWhats = `Olá! Meu nome é ${nome}, tenho interesse no curso de ${curso} em ${cidade}. Poderia me ajudar?`;
        const urlEncodedMessage = encodeURIComponent(mensagemWhats);
        const linkWhatsapp = `https://wa.me/5541987249685?text=${urlEncodedMessage}`;

        const linkInscrevase = `<a href='https://www.senaipr.org.br/cursos-tecnicos/pre-matricula/?nome=${nome}&email=${email}&telefone=${telefone}&modalidade=${modalidade}&cidade=${cidade}&curso=${curso}'>Inscreva-se aqui</a>`;

        const resposta = `\nÓtimo! Você pode realizar sua inscrição por um dos caminhos abaixo:\n\n📋 Formulário de pré-matrícula: ${linkInscrevase}\n💬 WhatsApp: ${linkWhatsapp}`;

        await pool.query(
          `INSERT INTO messages (user_id, user_message, bot_response, nome, email, telefone, modalidade, cidade, curso)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            null,
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
        "INSERT INTO messages (user_id, user_message, bot_response, nome, email, telefone, modalidade, cidade, curso) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          null,
          message,
          resposta,
          nome,
          email,
          telefone,
          filtros.modalidade,
          filtros.cidade,
          filtros.curso,
        ]
      );

      fs.appendFileSync(
        "chat.log",
        `\n[${new Date().toISOString()}] Pergunta: ${message}\nResposta: ${resposta}\n`
      );

      return res.status(200).json({ reply: resposta });
    }

    const botResponse = await getChatResponse(message);

    await pool.query(
      `INSERT INTO messages (user_id, user_message, bot_response, nome, email, telefone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [null, message, botResponse, nome, email, telefone]
    );

    return res.status(200).json({ reply: botResponse });
  } catch (err) {
    console.error("Erro no Chat Controller:", err);
    return res.status(500).json({ error: "Erro ao processar a mensagem" });
  }
}

export default chatController;
