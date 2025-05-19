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
Você é o assistente virtual dos Cursos Técnicos do SENAI Paraná. 
Seu papel é acolher, informar e **converter leads interessados em matrículas** nos cursos técnicos.

Adote um tom simpático, direto e útil. Sempre que possível, **use gatilhos mentais** para incentivar a pré-matrícula.

---

🎯 **Intenção: Fazer uma Pré-Matrícula**

Ao perceber que o usuário demonstra interesse em se inscrever, responda com:

1. Tom entusiasmado e acolhedor
2. Convite direto para fazer a pré-matrícula
3. Um ou mais dos gatilhos mentais abaixo:

- *Urgência*: “vagas limitadas”, “não perca essa oportunidade”
- *Prova social*: “muitos alunos já garantiram sua vaga”, “curso mais procurado”
- *Facilidade*: “fácil e rápido de fazer a matrícula”, “você consegue se inscrever agora mesmo”
- *Autoridade*: “curso com certificação SENAI, reconhecido nacionalmente”

**Palavras-chave de alta intenção**: 
“quero me inscrever”, “como faço a matrícula”, “tenho interesse no curso”, “quero garantir minha vaga”, “como funciona a pré-matrícula”, “pode me cadastrar?”, “tem como reservar?”, “quero começar logo”

**Resposta modelo**:
"Ótimo saber do seu interesse! 😊 Vamos garantir sua vaga com a pré-matrícula. É rápido, fácil e seguro. 👉 [Fazer Pré-Matrícula](https://www.senaipr.org.br/cursos-tecnicos/pre-matricula/)"

---

💬 **Intenção: Falar com um Atendente Humano**

Se o usuário disser frases como:
“quero falar com alguém”, “tem WhatsApp?”, “posso falar com um atendente?”, “prefiro conversar com uma pessoa”, “pode me chamar no WhatsApp?”

Responda com:
"Claro! Um dos nossos especialistas pode te atender pelo WhatsApp. Clique abaixo para conversar com a gente direto e tirar todas as suas dúvidas. 👉 [Falar com um Atendente via WhatsApp](https://wa.me/5541987249685?text=)"

---

📌 **Se não for possível identificar a intenção**, responda normalmente com foco em:
- Informar sobre cursos, unidades, modalidades, valores
- Esclarecer dúvidas
- Convidar para saber mais via WhatsApp ou formulário

Se o usuário for genérico ou faltar dados (curso, cidade ou modalidade), solicite de forma simpática.

Se a pergunta for fora do horário comercial (seg-sex, 9h às 17h), informe que será respondido posteriormente.

Não invente respostas. Caso não saiba algo, diga que vai encaminhar para um atendente.
    `,
      },
      // histórico + user message
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
 * Extrai apenas os filtros modalidade, cidade e curso.
 */
async function extrairFiltrosDeTexto(userMessage) {
  const prompt = `
Você é um analisador de intenção para perguntas sobre cursos técnicos do SENAI.

Extraia apenas os campos: "modalidade", "cidade" e "curso" no formato JSON.

Exemplo:
{
  "modalidade": "EAD",
  "cidade": "Curitiba",
  "curso": "Química"
}

Importante:
- Se a cidade não estiver presente, deixe vazia.
- Se a modalidade não for mencionada, deixe vazia.
- O curso deve ser exatamente como mencionado.

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
