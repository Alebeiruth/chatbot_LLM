import dotenv from "dotenv";
dotenv.config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // ⚠️ Apenas em ambiente local

import pkg from "openai";
const { OpenAI } = pkg;
import pool from "../config/db.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Envia a mensagem do usuário para o modelo GPT com histórico do lead.
 */
async function getChatResponse(userMessage, leadId) {
  try {
    const mensagens = [
      {
        role: "system",
        content: `
        Você é o assistente virtual dos Cursos Técnicos do Senai Paraná. 
        Seu objetivo é atender usuários interessados, esclarecer dúvidas sobre cursos, valores, unidades, modalidades, formas de matrícula, documentação necessária e diferenciais. 
        Use um tom simples, próximo, acolhedor e objetivo.

        Regras:
        - Responda exatamente o que foi perguntado.
        - Se não tiver dados suficientes (ex: sem cidade ou curso), peça mais informações.
        - Sempre que possível, convide o usuário a conhecer mais (WhatsApp ou formulário).
        - Seja educado e claro, evite termos técnicos.
        - Se não souber responder, diga que irá direcionar para um atendente.
        - Fora do horário comercial (seg-sex, 9h às 17h), diga que será respondido depois.

        Exemplos:
        Usuário: "Quais cursos têm em Curitiba?"
        Resposta: "Temos várias opções de cursos técnicos em Curitiba. Você procura alguma unidade específica?"

        Usuário: "Qual o preço do curso técnico de Mecânica?"
        Resposta: "O valor pode variar conforme a unidade e modalidade. Em qual cidade você quer estudar?"

        Usuário: "Quero me matricular"
        Resposta: "Ótimo! Posso te encaminhar para nosso formulário de pré-inscrição ou um atendente via WhatsApp. O que prefere?"
        `,
      },
    ];

    if (leadId) {
      const [historico] = await pool.query(
        "SELECT user_message, bot_response FROM messages WHERE lead_id = ? ORDER BY timestamp DESC LIMIT 6",
        [leadId]
      );

      historico.reverse().forEach((m) => {
        mensagens.push({ role: "user", content: m.user_message });
        mensagens.push({ role: "assistant", content: m.bot_response });
      });
    }

    mensagens.push({ role: "user", content: userMessage });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: mensagens,
      temperature: 0.7,
      max_tokens: 500,
    });

    console.log(
      `Tokens usados: ${completion.usage?.total_tokens || "desconhecido"}`
    );

    return completion.choices[0].message.content;
  } catch (err) {
    console.error("Erro ao chamar a OpenAI:", err);
    throw new Error("Erro ao chamar a OpenAI");
  }
}

/**
 * Envia mensagem para IA pedindo que retorne apenas filtros de busca de cursos.
 */
async function extrairFiltrosDeTexto(userMessage) {
  const prompt = `
Você é um analisador de intenção para perguntas sobre cursos técnicos do SENAI.

Extraia filtros da frase abaixo em formato JSON com os campos:

{
  "curso": "",
  "regional": "",
  "unidade": "",
  "estrategia": "",
  "vagas": "",
  "turno": "",
  "momentos_presenciais": "",
  "horario_aulas": "",
  "duracao_meses": "",
  "data_inicio": "",
  "data_inicio_matriculas": "",
  "valor_curso": ""
}

Atenção:
- A cidade onde o curso acontece deve ir em "unidade", como: "Maringá", "Ponta Grossa", "Toledo".
- "regional" é uma macro região administrativa como: "Norte", "Oeste", "Campos Gerais".
- Se a pergunta mencionar um curso específico (ex: Química), preencha o campo "curso" exatamente como foi citado.
- Preencha apenas os campos mencionados diretamente na frase. Não invente ou assuma dados.

Frase:
"${userMessage}"
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.2,
    });

    const texto = completion.choices[0].message.content.trim();
    try {
      return JSON.parse(texto);
    } catch (err) {
      console.warn("JSON mal formatado da OpenAI:", texto);
      return {};
    }
  } catch (err) {
    console.error("Erro ao interpretar o JSON da IA:", err);
    return {};
  }
}

export { getChatResponse, extrairFiltrosDeTexto };
