// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> NOVA VERSÃO TESTE 05/06/2025 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// import dotenv from "dotenv";
// dotenv.config();

// import pkg from "openai";
// const { OpenAI } = pkg;
// import pool from "../config/db.js";
// import Papa from "papaparse";
// import fs from "fs";
// import path from "path";

// if (!process.env.OPENAI_API_KEY) {
//   throw new Error("❌ OPENAI_API_KEY não definida no .env");
// }

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// // ============================================
// // 📚 VARIÁVEIS GLOBAIS
// // ============================================
// let cursosDisponiveis = [];
// let cidadesDisponiveis = [];
// let dicionarioDescricoes = {};
// let descricaoCarregada = false;

// // ============================================
// // 🧹 FUNÇÕES DE FORMATAÇÃO (DEVEM VIR PRIMEIRO)
// // ============================================

// // Função para limpar formatação markdown
// function cleanMarkdownFormatting(text) {
//   if (!text || typeof text !== "string") return text;

//   return (
//     text
//       // Remover asteriscos duplos (negrito markdown)
//       .replace(/\*\*(.*?)\*\*/g, "$1")
//       // Remover asteriscos simples (itálico markdown)
//       .replace(/\*(.*?)\*/g, "$1")
//       // Remover underscores duplos
//       .replace(/__(.*?)__/g, "$1")
//       // Remover underscores simples
//       .replace(/_(.*?)_/g, "$1")
//       // Remover hashtags (títulos markdown)
//       .replace(/#{1,6}\s*(.*)/g, "$1")
//       // Limpar múltiplos espaços
//       .replace(/\s+/g, " ")
//       // Remover espaços no início e fim
//       .trim()
//   );
// }

// // Função para formatar resposta do chatbot
// function formatChatbotResponse(rawResponse) {
//   if (!rawResponse) return rawResponse;

//   // Limpar markdown
//   let cleanText = cleanMarkdownFormatting(rawResponse);

//   // Adicionar quebras de linha apropriadas
//   cleanText = cleanText
//     // Adicionar quebra antes de listas
//     .replace(/(\d+\.)/g, "\n$1")
//     // Adicionar quebra antes de emojis de destaque
//     .replace(/(📍|🎯|💰|📞|🌐)/g, "\n$1")
//     // Melhorar formatação de valores
//     .replace(/R\$\s*(\d+[\d.,]*)/g, "R$ $1")
//     // Converter links markdown para texto simples
//     .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
//     // Limpar múltiplas quebras de linha
//     .replace(/\n\n+/g, "\n\n")
//     // Trim final
//     .trim();

//   return cleanText;
// }

// // ============================================
// // 🗂️ FUNÇÃO PARA CARREGAR CURSOS
// // ============================================
// function carregarCursosDoCSV() {
//   try {
//     const csvPath = path.join(
//       process.cwd(),
//       "src",
//       "data",
//       "nova_base_atualizada_sem.csv"
//     );
//     console.log(`📁 Tentando carregar: ${csvPath}`);

//     if (!fs.existsSync(csvPath)) {
//       console.error(`❌ Arquivo não encontrado: ${csvPath}`);
//       return { cursosDisponiveis: [], cidadesDisponiveis: [] };
//     }

//     const csvData = fs.readFileSync(csvPath, "utf8");
//     console.log(`📊 Tamanho do arquivo: ${csvData.length} caracteres`);

//     const result = Papa.parse(csvData, {
//       header: true,
//       skipEmptyLines: true,
//       dynamicTyping: false,
//       delimiter: ";", // Força vírgula como separador
//       quoteChar: '"',
//     });

//     console.log(`📊 Linhas processadas: ${result.data.length}`);
//     console.log(`📋 Colunas detectadas:`, result.meta.fields);

//     if (result.errors && result.errors.length > 0) {
//       console.warn("⚠️ Erros na parseação:", result.errors);
//     }

//     const cursos = result.data;

//     // Debug do primeiro item
//     if (cursos.length > 0) {
//       console.log("\n🔍 PRIMEIRO ITEM COMPLETO:");
//       Object.entries(cursos[0]).forEach(([key, value]) => {
//         console.log(`   "${key}": "${value}"`);
//       });
//     }

//     // Estratégias múltiplas para extrair cursos
//     let cursosExtraidos = [];

//     // Estratégia 1: nome_curso
//     const estrategia1 = [
//       ...new Set(cursos.map((c) => c.nome_curso).filter(Boolean)),
//     ];
//     if (estrategia1.length > 0) {
//       cursosExtraidos = estrategia1;
//       console.log(
//         `✅ Usando estratégia 1 (nome_curso): ${estrategia1.length} cursos`
//       );
//     }

//     // Estratégia 2: curso
//     if (cursosExtraidos.length === 0) {
//       const estrategia2 = [
//         ...new Set(cursos.map((c) => c.curso).filter(Boolean)),
//       ];
//       if (estrategia2.length > 0) {
//         cursosExtraidos = estrategia2;
//         console.log(
//           `✅ Usando estratégia 2 (curso): ${estrategia2.length} cursos`
//         );
//       }
//     }

//     // Estratégia 3: Curso (maiúscula)
//     if (cursosExtraidos.length === 0) {
//       const estrategia3 = [
//         ...new Set(cursos.map((c) => c.Curso).filter(Boolean)),
//       ];
//       if (estrategia3.length > 0) {
//         cursosExtraidos = estrategia3;
//         console.log(
//           `✅ Usando estratégia 3 (Curso): ${estrategia3.length} cursos`
//         );
//       }
//     }

//     // Extrair cidades
//     const cidadesExtraidas = [
//       ...new Set(cursos.map((c) => c.cidade).filter(Boolean)),
//     ];

//     console.log(`\n✅ RESULTADO FINAL:`);
//     console.log(`   Cursos únicos: ${cursosExtraidos.length}`);
//     console.log(`   Cidades únicas: ${cidadesExtraidas.length}`);

//     if (cidadesExtraidas.length > 0) {
//       console.log(
//         `   Exemplos de cidades: ${cidadesExtraidas.slice(0, 3).join(", ")}`
//       );

//       // ✅ VERIFICAR SE IRATI EXISTE
//       const iratiExists = cidadesExtraidas.includes("Irati");
//       console.log(
//         `🎯 Irati está na lista? ${iratiExists ? "✅ SIM" : "❌ NÃO"}`
//       );

//       if (!iratiExists) {
//         const variations = cidadesExtraidas.filter((cidade) =>
//           cidade.toLowerCase().includes("irati")
//         );
//         console.log(`🔍 Variações de Irati encontradas:`, variations);
//       }
//     }

//     // Atualizar variáveis globais
//     cursosDisponiveis = cursosExtraidos;
//     cidadesDisponiveis = cidadesExtraidas;

//     return {
//       cursosDisponiveis: cursosExtraidos,
//       cidadesDisponiveis: cidadesExtraidas,
//     };
//   } catch (error) {
//     console.error("❌ Erro ao carregar cursos do CSV:", error);
//     return { cursosDisponiveis: [], cidadesDisponiveis: [] };
//   }
// }

// // ============================================
// // 📖 FUNÇÃO PARA CARREGAR DESCRIÇÕES
// // ============================================
// function carregarDescricoesDoCSV() {
//   if (descricaoCarregada) {
//     return dicionarioDescricoes;
//   }

//   try {
//     const csvPath = path.join(
//       process.cwd(),
//       "src",
//       "data",
//       "curso_tecnicos.csv"
//     );

//     if (!fs.existsSync(csvPath)) {
//       console.warn("⚠️ Arquivo de descrições não encontrado:", csvPath);
//       return {};
//     }

//     const csvData = fs.readFileSync(csvPath, "utf8");

//     const result = Papa.parse(csvData, {
//       header: true,
//       skipEmptyLines: true,
//       dynamicTyping: false,
//       delimiter: ",",
//       quoteChar: '"',
//     });

//     const descricoes = result.data;
//     dicionarioDescricoes = {};

//     // Processar cada linha do CSV
//     descricoes.forEach((row) => {
//       const nomeBruto = row["Nome do Curso"];
//       if (!nomeBruto) return;

//       // Normalizar o nome para busca
//       const nomeNormalizado = nomeBruto
//         .toLowerCase()
//         .normalize("NFD")
//         .replace(/[\u0300-\u036f]/g, "");

//       // Armazenar no dicionário
//       dicionarioDescricoes[nomeNormalizado] = {
//         nome: nomeBruto,
//         objetivo: row["Objetivos do Curso"] || "Informação não disponível",
//         publicoAlvo: row["Público-Alvo"] || "Informação não disponível",
//         ondeTrabalhar:
//           row["Onde Pode Trabalhar"] || "Informação não disponível",
//       };
//     });

//     descricaoCarregada = true;
//     console.log(
//       `✅ Carregadas descrições de ${
//         Object.keys(dicionarioDescricoes).length
//       } cursos`
//     );

//     return dicionarioDescricoes;
//   } catch (error) {
//     console.error("❌ Erro ao carregar descrições do CSV:", error);
//     return {};
//   }
// }

// // ============================================
// // 🔍 FUNÇÕES DE DETECÇÃO DE PERGUNTAS SOBRE DESCRIÇÃO
// // ============================================

// /**
//  * Detecta se o usuário está perguntando sobre descrição/conteúdo de um curso específico
//  */
// function detectarPerguntaDescricao(userMessage) {
//   const msgLower = userMessage.toLowerCase();

//   // Exclusões - NÃO são perguntas sobre descrição
//   const exclusoes = [
//     /tem\?$/,
//     /vocês têm/,
//     /existe/,
//     /disponível/,
//     /oferece/,
//     /em\s+\w+.*modalidade/,
//     /modalidade.*em\s+\w+/,
//     /na\s+modalidade.*em/,
//     /em\s+\w+.*ead|presencial/,
//     /quais\s+cursos/,
//     /que\s+cursos/,
//     /lista.*cursos/,
//   ];

//   if (exclusoes.some((regex) => regex.test(msgLower))) {
//     return false;
//   }

//   // Inclusões - SÃO perguntas sobre descrição
//   const palavrasChaveDescricao = [
//     /o que é\s+(?:o\s+)?curso\s+de\s+\w+/,
//     /sobre\s+o\s+curso\s+de\s+\w+/,
//     /do que se trata\s+(?:o\s+)?curso/,
//     /conteúdo\s+do\s+curso\s+de/,
//     /o que\s+vou\s+aprender.*curso\s+de/,
//     /matérias\s+do\s+curso/,
//     /disciplinas.*curso\s+de/,
//     /grade\s+curricular.*curso/,
//     /objetivo.*curso\s+de/,
//     /onde\s+posso\s+trabalhar.*curso\s+de/,
//     /área\s+de\s+atuação.*curso/,
//     /mercado\s+de\s+trabalho.*curso/,
//     /público\s+alvo.*curso/,
//     /para\s+quem\s+é.*curso\s+de/,
//     /quem\s+pode\s+fazer.*curso\s+de/,
//     /me fale sobre\s+(?:o\s+)?curso\s+(?:de\s+|técnico\s+(?:de\s+)?)\w+/,
//     /fale\s+sobre\s+(?:o\s+)?curso\s+(?:de\s+|técnico\s+(?:de\s+)?)\w+/,
//     /me conte sobre\s+(?:o\s+)?curso\s+(?:de\s+|técnico\s+(?:de\s+)?)\w+/,
//     /conte\s+sobre\s+(?:o\s+)?curso\s+(?:de\s+|técnico\s+(?:de\s+)?)\w+/,
//   ];

//   return palavrasChaveDescricao.some((regex) => regex.test(msgLower));
// }

// /**
//  * Extrai o nome do curso de uma pergunta sobre descrição
//  */
// function extrairNomeCursoDaPergunta(userMessage) {
//   const padroes = [
//     /o que é\s+(?:o\s+)?curso\s+(?:de\s+|técnico\s+(?:de\s+)?)?(.+?)(?:\?|$)/i,
//     /sobre\s+(?:o\s+)?curso\s+(?:de\s+|técnico\s+(?:de\s+)?)?(.+?)(?:\?|$)/i,
//     /conteúdo\s+do\s+curso\s+(?:de\s+)?(.+?)(?:\?|$)/i,
//     /o que\s+vou\s+aprender.*curso\s+(?:de\s+)?(.+?)(?:\?|$)/i,
//     /matérias\s+do\s+curso\s+(?:de\s+)?(.+?)(?:\?|$)/i,
//     /(?:qual\s+(?:a\s+|é\s+a\s+)?)?ementa\s+do\s+curso\s+(?:de\s+)?(.+?)(?:\?|$)/i,
//   ];

//   for (const padrao of padroes) {
//     const match = userMessage.match(padrao);
//     if (match && match[1]) {
//       let nomeCurso = match[1].trim();

//       // Limpar o nome extraído
//       nomeCurso = nomeCurso
//         .replace(/^(do|da|de|curso|técnico|em|na|no)\s+/i, "")
//         .replace(/\s+(do|da|de|curso|técnico|tem|existe)$/i, "")
//         .replace(/\s+e\s+.*/i, "")
//         .replace(/\s*[,;].*/i, "")
//         .trim();

//       // Verificar se o nome é válido
//       const palavrasGenericas = [
//         "curso",
//         "cursos",
//         "técnico",
//         "modalidade",
//         "online",
//         "ead",
//         "presencial",
//       ];
//       if (
//         nomeCurso.length > 2 &&
//         !palavrasGenericas.includes(nomeCurso.toLowerCase())
//       ) {
//         return nomeCurso;
//       }
//     }
//   }

//   // Fallback: procurar diretamente pelos nomes dos cursos disponíveis
//   for (const curso of cursosDisponiveis) {
//     if (userMessage.toLowerCase().includes(curso.toLowerCase())) {
//       return curso;
//     }
//   }

//   return null;
// }

// /**
//  * Busca descrição de um curso no dicionário carregado
//  */
// function buscarDescricaoCurso(nomeCurso) {
//   if (!nomeCurso) return null;

//   // Garantir que as descrições estão carregadas
//   carregarDescricoesDoCSV();

//   // Normalizar o nome para busca
//   const nomeNormalizado = nomeCurso
//     .toLowerCase()
//     .normalize("NFD")
//     .replace(/[\u0300-\u036f]/g, "");

//   const curso = dicionarioDescricoes[nomeNormalizado];

//   if (curso) {
//     const rawDescription = `📚 **${curso.nome}**

// 🎯 **Objetivo do Curso:**
// ${curso.objetivo}

// 👥 **Público-Alvo:**
// ${curso.publicoAlvo}

// 💼 **Onde Pode Trabalhar:**
// ${curso.ondeTrabalhar}`;

//     // ✨ APLICAR FORMATAÇÃO LIMPA
//     return formatChatbotResponse(rawDescription);
//   }

//   return null;
// }

// // ============================================
// // 🤖 FUNÇÃO PRINCIPAL DO CHAT
// // ============================================

// /**
//  * Envia a mensagem do usuário para o modelo GPT com histórico
//  */
// async function getChatResponse(userMessage, email) {
//   try {
//     const mensagens = [
//       {
//         role: "system",
//         content: `
// Você é o assistente virtual especializado em Cursos Técnicos do Senai Paraná.

// Sua missão é acolher, informar e converter leads interessados em matrículas nos cursos técnicos oferecidos pelo Senai Paraná.

// Adote um tom simpático, acolhedor, direto e útil. Sempre utilize gatilhos mentais para incentivar a realização da pré-matrícula.

// ---

// 📚 **CURSOS DISPONÍVEIS (APENAS ESTES EXISTEM):**
// ${cursosDisponiveis.map((curso) => `• ${curso}`).join("\n")}

// 🏙️ **CIDADES DISPONÍVEIS (APENAS ESTAS EXISTEM):**
// ${cidadesDisponiveis.map((cidade) => `• ${cidade}`).join("\n")}

// ⚠️ **IMPORTANTE:** Você só pode mencionar cursos e cidades que estão nas listas acima. Se o usuário perguntar sobre um curso ou cidade que não existe na lista, informe educadamente que não temos essa opção disponível e sugira alternativas similares da lista ou peça para falar com um atendente.

// ---

// 🏢 **TRATAMENTO ESPECIAL PARA CURITIBA:**

// Quando o usuário mencionar **"Curitiba"** como cidade desejada, você deve responder:

// "Ótimo! Em Curitiba temos 4 unidades do SENAI para você escolher:

// 📍 Boqueirão
// 📍 Campus da Indústria
// 📍 CIC - Cidade Industrial de Curitiba
// 📍 Centro - Curitiba

// Qual dessas unidades fica mais próxima de você ou seria mais conveniente para estudar?

// Cada unidade pode ter cursos e horários diferentes, então me diga qual você prefere para eu te dar informações mais específicas! 😊"

// **NUNCA** trate "Curitiba" como uma cidade específica para busca de cursos. **SEMPRE** ofereça as 4 opções de unidades quando o usuário mencionar Curitiba.

// ---

// 🎯 **Intenção: Fazer uma Pré-Matrícula**

// Ao identificar alta intenção através das palavras-chave como:
// * "quero me inscrever"
// * "como faço a matrícula"
// * "tenho interesse no curso"
// * "quero garantir minha vaga"
// * "como funciona a pré-matrícula"
// * "pode me cadastrar?"
// * "tem como reservar?"
// * "quero começar logo"

// Responda com:
// * Entusiasmo e acolhimento;
// * Convite claro e direto para pré-matrícula;
// * Uso de gatilhos mentais (urgência, prova social, facilidade, autoridade);

// **Resposta modelo:**
// "Ótimo saber do seu interesse! 😊 Vamos garantir sua vaga com a pré-matrícula. É rápido, fácil e seguro. 👉 (https://www.senaipr.org.br/cursos-tecnicos/pre-matricula/)"

// ---

// 💬 **Intenção: Falar com Atendente Humano**

// Se o usuário expressar frases como:
// * "quero falar com alguém"
// * "tem WhatsApp?"
// * "posso falar com um atendente?"
// * "prefiro conversar com uma pessoa"
// * "pode me chamar no WhatsApp?"

// Responda com:
// "Claro! Um dos nossos especialistas pode te atender pelo WhatsApp. Clique abaixo para conversar com a gente direto e tirar todas as suas dúvidas. 👉 (https://wa.me/5541987249685?text=)"

// ---

// 📌 **Quando não identificar claramente a intenção**, responda com foco em:
// * Informar sobre cursos disponíveis, unidades, modalidades e valores;
// * Esclarecer dúvidas gerais;
// * Prioritariamente, convide o usuário a saber mais via WhatsApp ou formulário.

// Caso não tenha a informação específica, indique que encaminhará a dúvida para um atendente humano. NUNCA invente dados ou cursos que não existem na lista.
//         `.trim(),
//       },
//     ];

//     // Carregar histórico de mensagens do usuário
//     if (email) {
//       try {
//         const [historico] = await pool.query(
//           "SELECT user_message, bot_response FROM messages WHERE email = ? ORDER BY id DESC LIMIT 10",
//           [email]
//         );

//         historico.reverse().forEach((m) => {
//           if (m.user_message && m.bot_response) {
//             mensagens.push({ role: "user", content: m.user_message });
//             mensagens.push({ role: "assistant", content: m.bot_response });
//           }
//         });
//       } catch (dbError) {
//         console.warn("⚠️ Erro ao carregar histórico do banco:", dbError);
//       }
//     }

//     mensagens.push({ role: "user", content: userMessage });

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: mensagens,
//       temperature: 0.7,
//       max_tokens: 600,
//     });

//     const rawResponse = completion.choices[0].message.content;

//     // ✨ APLICAR FORMATAÇÃO LIMPA
//     let cleanResponse = formatChatbotResponse(rawResponse);

//     // 🔗 CONVERTER LINKS PARA CLICÁVEIS

//     console.log(
//       "🧹 RESPOSTA ANTES DA FORMATAÇÃO:",
//       rawResponse.substring(0, 100)
//     );
//     console.log(
//       "✨ RESPOSTA APÓS FORMATAÇÃO:",
//       cleanResponse.substring(0, 100)
//     );

//     return cleanResponse;
//   } catch (err) {
//     console.error("Erro ao chamar a OpenAI:", err);
//     throw new Error("Erro ao chamar a OpenAI");
//   }
// }

// // ============================================
// // 🎯 FUNÇÃO DE EXTRAÇÃO DE FILTROS - SIMPLIFICADA
// // ============================================

// /**
//  * Extrai filtros de texto para busca de cursos - VERSÃO SIMPLIFICADA
//  */
// async function extrairFiltrosDeTexto(userMessage) {
//   // Se for pergunta sobre descrição, não extrair filtros para busca
//   if (detectarPerguntaDescricao(userMessage)) {
//     console.log(
//       "🔍 Pergunta sobre descrição detectada - não extraindo filtros de busca"
//     );
//     return { curso: "", cidade: "", modalidade: "" };
//   }

//   if (cursosDisponiveis.length === 0 || cidadesDisponiveis.length === 0) {
//     console.log("📚 Recarregando dados do CSV...");
//     carregarCursosDoCSV();
//   }

//   const prompt = `
// Você é um analisador especializado em extrair informações sobre cursos técnicos.

// CURSOS VÁLIDOS DISPONÍVEIS:
// ${cursosDisponiveis.map((curso) => `• ${curso}`).join("\n")}

// CIDADES VÁLIDAS DISPONÍVEIS:
// ${cidadesDisponiveis.map((cidade) => `• ${cidade}`).join("\n")}

// **REGRAS ESPECIAIS DE MAPEAMENTO:**

// 🏢 **CURITIBA:**
// - Se o usuário mencionar "Curitiba" (e não uma unidade específica), deixe o campo cidade VAZIO ("")
// - Se o usuário mencionar especificamente: "Boqueirão", "Campus da Indústria", "CIC", "Centro" use exatamente esses nomes

// 🏙️ **SÃO JOSÉ DOS PINHAIS:**
// - Se o usuário mencionar: "São José dos Pinhais", "São José", "SJP" → use "São José dos Pinhais"
// - Agora está correto no CSV como "São José dos Pinhais"

// 🏭 **LONDRINA:**
// - Se o usuário mencionar "Londrina" (e não uma unidade específica), deixe o campo cidade VAZIO ("")
// - Se o usuário mencionar especificamente: "Dr. Celso Charuri", use exatamente esse nome

// Analise a mensagem e extraia APENAS se mencionado explicitamente:
// - "curso": nome do curso técnico mencionado (DEVE estar na lista acima)
// - "cidade": cidade mencionada aplicando as regras de mapeamento acima
// - "modalidade": EAD, Presencial

// EXEMPLOS DE MAPEAMENTO SIMPLIFICADOS:
// - "tem curso em São José dos Pinhais?" → cidade: "São José dos Pinhais"
// - "curso em SJP" → cidade: "São José dos Pinhais"
// - "curso em Curitiba" → cidade: "" (vazio para oferecer opções)
// - "curso em Boqueirão" → cidade: "Boqueirão"
// - "curso em Londrina" → cidade: "" (vazio para oferecer opções)
// - "curso no Centro - Curitiba" → cidade: "Centro - Curitiba"

// IMPORTANTE:
// - Se o curso mencionado não estiver na lista válida, deixe campo vazio ("")
// - Para modalidade, normalize (ex: "online" = "EAD", "presencial" = "Presencial")

// Responda APENAS com JSON válido:

// {
//   "curso": "",
//   "cidade": "",
//   "modalidade": ""
// }

// Mensagem para analisar:
// "${userMessage}"
// `.trim();

//   try {
//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [{ role: "user", content: prompt }],
//       max_tokens: 200,
//       temperature: 0.1,
//     });

//     const texto = completion.choices[0].message.content.trim();
//     const match = texto.match(/\{[\s\S]*\}/);

//     if (match) {
//       const filtros = JSON.parse(match[0]);

//       // ✅ VALIDAÇÃO ADICIONAL
//       if (filtros.cidade && !cidadesDisponiveis.includes(filtros.cidade)) {
//         console.log(
//           `⚠️ Cidade "${filtros.cidade}" não encontrada na lista válida, removendo...`
//         );
//         filtros.cidade = "";
//       }

//       if (filtros.curso && !cursosDisponiveis.includes(filtros.curso)) {
//         console.log(
//           `⚠️ Curso "${filtros.curso}" não encontrado na lista válida, removendo...`
//         );
//         filtros.curso = "";
//       }

//       console.log(`🔍 Filtros extraídos para "${userMessage}":`, filtros);
//       return filtros;
//     }

//     return { curso: "", cidade: "", modalidade: "" };
//   } catch (err) {
//     console.error("Erro ao interpretar filtros da IA:", err);
//     return { curso: "", cidade: "", modalidade: "" };
//   }
// }

// // ============================================
// // 🏙️ FUNÇÕES AUXILIARES SIMPLIFICADAS
// // ============================================

// /**
//  * Verifica se a mensagem menciona Curitiba de forma genérica
//  */
// function mencionaCuritibaGenerica(userMessage) {
//   const msgLower = userMessage.toLowerCase();
//   const variacesCuritiba = ["curitiba", "cwb", "ctba"];
//   const unidadesCuritiba = [
//     "boqueirão",
//     "boqueirao",
//     "campus da industria",
//     "campus da indústria",
//     "cic",
//     "centro",
//     "centro - curitiba",
//   ];

//   const mencionaCuritiba = variacesCuritiba.some((variacao) =>
//     msgLower.includes(variacao)
//   );
//   const mencionaUnidadeEspecifica = unidadesCuritiba.some((unidade) =>
//     msgLower.includes(unidade)
//   );

//   return mencionaCuritiba && !mencionaUnidadeEspecifica;
// }

// /**
//  * Verifica se a mensagem menciona Londrina de forma genérica
//  */
// function mencionaLondrinaGenerica(userMessage) {
//   const msgLower = userMessage.toLowerCase();
//   const variacoesLondrina = ["londrina", "londrina pr"];
//   const unidadeLondrina = [
//     "Dr. Celso Charuri",
//     "dr celso charuri",
//     "celso charuri",
//   ];

//   const mencionaLondrina = variacoesLondrina.some((variacao) =>
//     msgLower.includes(variacao)
//   );

//   const mencionaUnidadeEspecifica = unidadeLondrina.some((unidade) =>
//     msgLower.includes(unidade)
//   );

//   return mencionaLondrina && !mencionaUnidadeEspecifica;
// }

// /**
//  * Formatar cidade para formulário - SIMPLIFICADO
//  */
// function formatarCidadeParaFormulario(cidadeOriginal) {
//   if (!cidadeOriginal) return "";

//   const cidadeLower = cidadeOriginal.toLowerCase();

//   // Casos especiais de Curitiba - unidades que precisam do formato "Curitiba - Unidade"
//   const unidadesCuritiba = {
//     boqueirão: "Curitiba - Boqueirão",
//     boqueirao: "Curitiba - Boqueirão",
//     "campus da indústria": "Curitiba - Campus da Indústria",
//     "campus da industria": "Curitiba - Campus da Indústria",
//     cic: "Curitiba - CIC",
//   };

//   for (const [unidade, formato] of Object.entries(unidadesCuritiba)) {
//     if (cidadeLower.includes(unidade)) {
//       return formato;
//     }
//   }

//   // Para todas as outras cidades, usar como está (incluindo "São José dos Pinhais")
//   return cidadeOriginal;
// }

// /**
//  * Gerar mensagem WhatsApp contextualizada - SIMPLIFICADA
//  */
// function gerarMensagemWhatsAppContextualizada(nome, curso, cidade) {
//   const cursoTexto = curso || "informações sobre cursos técnicos";

//   // Caso especial: Dr. Celso Charuri (unidade específica de Londrina)
//   if (
//     cidade &&
//     (cidade.toLowerCase().includes("dr. celso charuri") ||
//       cidade.toLowerCase().includes("dr celso charuri") ||
//       cidade.toLowerCase().includes("celso charuri"))
//   ) {
//     return `Olá! Meu nome é ${nome}, tenho interesse no curso de ${cursoTexto} na unidade Dr. Celso Charuri em Londrina. Poderia me ajudar?`;
//   }

//   // Casos de Curitiba (unidades específicas)
//   const unidadesCuritiba = [
//     "boqueirão",
//     "campus da indústria",
//     "cic",
//     "centro",
//   ];
//   const ehUnidadeCuritiba = unidadesCuritiba.some(
//     (unidade) => cidade && cidade.toLowerCase().includes(unidade.toLowerCase())
//   );

//   if (ehUnidadeCuritiba) {
//     return `Olá! Meu nome é ${nome}, tenho interesse no curso de ${cursoTexto} na unidade ${cidade} em Curitiba. Poderia me ajudar?`;
//   }

//   // Caso padrão para todas as outras cidades (incluindo São José dos Pinhais)
//   if (cidade) {
//     return `Olá! Meu nome é ${nome}, tenho interesse no curso de ${cursoTexto} em ${cidade}. Poderia me ajudar?`;
//   } else {
//     return `Olá! Meu nome é ${nome}, tenho interesse em ${cursoTexto} do SENAI Paraná. Poderia me ajudar?`;
//   }
// }

// // ============================================
// // 🔗 FUNÇÃO PARA TORNAR LINKS CLICÁVEIS
// // ============================================

// /**
//  * Converte URLs em texto para links HTML clicáveis
//  */
// function converterLinksParaClicaveis(texto) {
//   if (!texto || typeof texto !== "string") return texto;

//   // Regex para detectar URLs
//   const urlRegex = /(https?:\/\/[^\s\)]+)/g;

//   // Substituir URLs por links clicáveis
//   return texto.replace(urlRegex, (url) => {
//     // Remover caracteres de pontuação no final
//     const urlLimpa = url.replace(/[.,:;!?)\]]*$/, "");

//     // Texto do link baseado na URL
//     let textoLink;

//     if (urlLimpa.includes("wa.me") || urlLimpa.includes("whatsapp")) {
//       textoLink = " Abrir WhatsApp";
//     } else if (
//       urlLimpa.includes("senaipr.org.br") &&
//       urlLimpa.includes("pre-matricula")
//     ) {
//       textoLink = " Fazer Pré-matrícula";
//     } else if (urlLimpa.includes("senaipr.org.br")) {
//       textoLink = " Site do SENAI-PR";
//     } else {
//       // Para outras URLs, usar domínio como texto
//       const domain = urlLimpa.match(/https?:\/\/([^\/]+)/);
//       textoLink = domain ? domain[1] : "Clique aqui";
//     }

//     return `<a href="${urlLimpa}">${textoLink}</a>`;
//   });
// }

// // ============================================
// // 📤 EXPORTS
// // ============================================

// export {
//   getChatResponse,
//   extrairFiltrosDeTexto,
//   mencionaCuritibaGenerica,
//   mencionaLondrinaGenerica,
//   formatarCidadeParaFormulario,
//   gerarMensagemWhatsAppContextualizada,
//   detectarPerguntaDescricao,
//   extrairNomeCursoDaPergunta,
//   buscarDescricaoCurso,
//   carregarCursosDoCSV,
//   carregarDescricoesDoCSV,
// };

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> NOVA VERSÃO TESTE 01/07/2025 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import dotenv from "dotenv";
dotenv.config();

import pkg from "openai";
const { OpenAI } = pkg;
import pool from "../config/db.js";
import Papa from "papaparse";
import fs from "fs";
import path from "path";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("❌ OPENAI_API_KEY não definida no .env");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ============================================
// 📚 VARIÁVEIS GLOBAIS
// ============================================
let cursosDisponiveis = [];
let cidadesDisponiveis = [];
let dicionarioDescricoes = {};
let descricaoCarregada = false;

// ============================================
// 🧹 FUNÇÕES DE FORMATAÇÃO (DEVEM VIR PRIMEIRO)
// ============================================

// Função para limpar formatação markdown
function cleanMarkdownFormatting(text) {
  if (!text || typeof text !== "string") return text;

  return (
    text
      // Remover asteriscos duplos (negrito markdown)
      .replace(/\*\*(.*?)\*\*/g, "$1")
      // Remover asteriscos simples (itálico markdown)
      .replace(/\*(.*?)\*/g, "$1")
      // Remover underscores duplos
      .replace(/__(.*?)__/g, "$1")
      // Remover underscores simples
      .replace(/_(.*?)_/g, "$1")
      // Remover hashtags (títulos markdown)
      .replace(/#{1,6}\s*(.*)/g, "$1")
      // Limpar múltiplos espaços
      .replace(/\s+/g, " ")
      // Remover espaços no início e fim
      .trim()
  );
}

// Função para formatar resposta do chatbot
function formatChatbotResponse(rawResponse) {
  if (!rawResponse) return rawResponse;

  // 🔒 PRESERVAR LINKS HTML antes da formatação
  const linksHTML = [];
  let responseComPlaceholders = rawResponse;

  // Extrair e substituir links HTML por placeholders
  const linkRegex = /<a\s+href="[^"]*"[^>]*>[^<]*<\/a>/g;
  let match;
  let index = 0;

  while ((match = linkRegex.exec(rawResponse)) !== null) {
    const placeholder = `__LINK_PLACEHOLDER_${index}__`;
    linksHTML.push(match[0]);
    responseComPlaceholders = responseComPlaceholders.replace(
      match[0],
      placeholder
    );
    index++;
  }

  // ✨ Aplicar formatação limpa (sem afetar links)
  let cleanText = responseComPlaceholders
    // Remover asteriscos duplos (negrito markdown)
    .replace(/\*\*(.*?)\*\*/g, "$1")
    // Remover asteriscos simples (itálico markdown)
    .replace(/\*(.*?)\*/g, "$1")
    // Remover underscores duplos
    .replace(/__(.*?)__/g, "$1")
    // Remover underscores simples
    .replace(/_(.*?)_/g, "$1")
    // Remover hashtags (títulos markdown)
    .replace(/#{1,6}\s*(.*)/g, "$1")
    // Limpar múltiplos espaços
    .replace(/\s+/g, " ")
    // Melhorar quebras de linha
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\n\s+/g, "\n")
    .replace(/\s+\n/g, "\n")
    .trim();

  // 🔗 RESTAURAR LINKS HTML
  linksHTML.forEach((link, index) => {
    const placeholder = `__LINK_PLACEHOLDER_${index}__`;
    cleanText = cleanText.replace(placeholder, link);
  });

  return cleanText;
}

// ============================================
// 🔗 FUNÇÃO PARA CONVERTER LINKS - MELHORADA
// ============================================

function converterLinksParaClicaveis(texto) {
  if (!texto || typeof texto !== "string") return texto;

  // ⚠️ Não processar se já contém links HTML
  if (texto.includes("<a href=")) {
    return texto;
  }

  // Regex para detectar URLs
  const urlRegex = /(https?:\/\/[^\s\)]+)/g;

  return texto.replace(urlRegex, (url) => {
    // Remover caracteres de pontuação no final
    const urlLimpa = url.replace(/[.,:;!?)\]]*$/, "");

    // Texto do link baseado na URL
    let textoLink;

    if (urlLimpa.includes("wa.me") || urlLimpa.includes("whatsapp")) {
      textoLink = "Abrir WhatsApp";
    } else if (
      urlLimpa.includes("senaipr.org.br") &&
      urlLimpa.includes("pre-matricula")
    ) {
      textoLink = "Fazer Pré-matrícula";
    } else if (urlLimpa.includes("senaipr.org.br")) {
      textoLink = "Site do SENAI-PR";
    } else {
      const domain = urlLimpa.match(/https?:\/\/([^\/]+)/);
      textoLink = domain ? domain[1] : "Clique aqui";
    }

    return `<a href="${urlLimpa}">${textoLink}</a>`;
  });
}

// ============================================
// 🗂️ FUNÇÃO PARA CARREGAR CURSOS
// ============================================
function carregarCursosDoCSV() {
  try {
    const csvPath = path.join(
      process.cwd(),
      "src",
      "data",
      "nova_base_atualizada_sem.csv"
    );
    console.log(`📁 Tentando carregar: ${csvPath}`);

    if (!fs.existsSync(csvPath)) {
      console.error(`❌ Arquivo não encontrado: ${csvPath}`);
      return { cursosDisponiveis: [], cidadesDisponiveis: [] };
    }

    const csvData = fs.readFileSync(csvPath, "utf8");
    console.log(`📊 Tamanho do arquivo: ${csvData.length} caracteres`);

    const result = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      delimiter: ";", // Força vírgula como separador
      quoteChar: '"',
    });

    console.log(`📊 Linhas processadas: ${result.data.length}`);
    console.log(`📋 Colunas detectadas:`, result.meta.fields);

    if (result.errors && result.errors.length > 0) {
      console.warn("⚠️ Erros na parseação:", result.errors);
    }

    const cursos = result.data;

    // Debug do primeiro item
    if (cursos.length > 0) {
      console.log("\n🔍 PRIMEIRO ITEM COMPLETO:");
      Object.entries(cursos[0]).forEach(([key, value]) => {
        console.log(`   "${key}": "${value}"`);
      });
    }

    // Estratégias múltiplas para extrair cursos
    let cursosExtraidos = [];

    // Estratégia 1: nome_curso
    const estrategia1 = [
      ...new Set(cursos.map((c) => c.nome_curso).filter(Boolean)),
    ];
    if (estrategia1.length > 0) {
      cursosExtraidos = estrategia1;
      console.log(
        `✅ Usando estratégia 1 (nome_curso): ${estrategia1.length} cursos`
      );
    }

    // Estratégia 2: curso
    if (cursosExtraidos.length === 0) {
      const estrategia2 = [
        ...new Set(cursos.map((c) => c.curso).filter(Boolean)),
      ];
      if (estrategia2.length > 0) {
        cursosExtraidos = estrategia2;
        console.log(
          `✅ Usando estratégia 2 (curso): ${estrategia2.length} cursos`
        );
      }
    }

    // Estratégia 3: Curso (maiúscula)
    if (cursosExtraidos.length === 0) {
      const estrategia3 = [
        ...new Set(cursos.map((c) => c.Curso).filter(Boolean)),
      ];
      if (estrategia3.length > 0) {
        cursosExtraidos = estrategia3;
        console.log(
          `✅ Usando estratégia 3 (Curso): ${estrategia3.length} cursos`
        );
      }
    }

    // Extrair cidades
    const cidadesExtraidas = [
      ...new Set(cursos.map((c) => c.cidade).filter(Boolean)),
    ];

    console.log(`\n✅ RESULTADO FINAL:`);
    console.log(`   Cursos únicos: ${cursosExtraidos.length}`);
    console.log(`   Cidades únicas: ${cidadesExtraidas.length}`);

    if (cidadesExtraidas.length > 0) {
      console.log(
        `   Exemplos de cidades: ${cidadesExtraidas.slice(0, 3).join(", ")}`
      );

      // ✅ VERIFICAR SE IRATI EXISTE
      const iratiExists = cidadesExtraidas.includes("Irati");
      console.log(
        `🎯 Irati está na lista? ${iratiExists ? "✅ SIM" : "❌ NÃO"}`
      );

      if (!iratiExists) {
        const variations = cidadesExtraidas.filter((cidade) =>
          cidade.toLowerCase().includes("irati")
        );
        console.log(`🔍 Variações de Irati encontradas:`, variations);
      }
    }

    // Atualizar variáveis globais
    cursosDisponiveis = cursosExtraidos;
    cidadesDisponiveis = cidadesExtraidas;

    return {
      cursosDisponiveis: cursosExtraidos,
      cidadesDisponiveis: cidadesExtraidas,
    };
  } catch (error) {
    console.error("❌ Erro ao carregar cursos do CSV:", error);
    return { cursosDisponiveis: [], cidadesDisponiveis: [] };
  }
}

// ============================================
// 📖 FUNÇÃO PARA CARREGAR DESCRIÇÕES
// ============================================
function carregarDescricoesDoCSV() {
  if (descricaoCarregada) {
    return dicionarioDescricoes;
  }

  try {
    const csvPath = path.join(
      process.cwd(),
      "src",
      "data",
      "curso_tecnicos.csv"
    );

    if (!fs.existsSync(csvPath)) {
      console.warn("⚠️ Arquivo de descrições não encontrado:", csvPath);
      return {};
    }

    const csvData = fs.readFileSync(csvPath, "utf8");

    const result = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      delimiter: ",",
      quoteChar: '"',
    });

    const descricoes = result.data;
    dicionarioDescricoes = {};

    // Processar cada linha do CSV
    descricoes.forEach((row) => {
      const nomeBruto = row["Nome do Curso"];
      if (!nomeBruto) return;

      // Normalizar o nome para busca
      const nomeNormalizado = nomeBruto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      // Armazenar no dicionário
      dicionarioDescricoes[nomeNormalizado] = {
        nome: nomeBruto,
        objetivo: row["Objetivos do Curso"] || "Informação não disponível",
        publicoAlvo: row["Público-Alvo"] || "Informação não disponível",
        ondeTrabalhar:
          row["Onde Pode Trabalhar"] || "Informação não disponível",
      };
    });

    descricaoCarregada = true;
    console.log(
      `✅ Carregadas descrições de ${
        Object.keys(dicionarioDescricoes).length
      } cursos`
    );

    return dicionarioDescricoes;
  } catch (error) {
    console.error("❌ Erro ao carregar descrições do CSV:", error);
    return {};
  }
}

// ============================================
// 🔍 FUNÇÕES DE DETECÇÃO DE PERGUNTAS SOBRE DESCRIÇÃO
// ============================================

/**
 * Detecta se o usuário está perguntando sobre descrição/conteúdo de um curso específico
 */
function detectarPerguntaDescricao(userMessage) {
  const msgLower = userMessage.toLowerCase();

  // Exclusões - NÃO são perguntas sobre descrição
  const exclusoes = [
    /tem\?$/,
    /vocês têm/,
    /existe/,
    /disponível/,
    /oferece/,
    /em\s+\w+.*modalidade/,
    /modalidade.*em\s+\w+/,
    /na\s+modalidade.*em/,
    /em\s+\w+.*ead|presencial/,
    /quais\s+cursos/,
    /que\s+cursos/,
    /lista.*cursos/,
  ];

  if (exclusoes.some((regex) => regex.test(msgLower))) {
    return false;
  }

  // Inclusões - SÃO perguntas sobre descrição
  const palavrasChaveDescricao = [
    /o que é\s+(?:o\s+)?curso\s+de\s+\w+/,
    /sobre\s+o\s+curso\s+de\s+\w+/,
    /do que se trata\s+(?:o\s+)?curso/,
    /conteúdo\s+do\s+curso\s+de/,
    /o que\s+vou\s+aprender.*curso\s+de/,
    /matérias\s+do\s+curso/,
    /disciplinas.*curso\s+de/,
    /grade\s+curricular.*curso/,
    /objetivo.*curso\s+de/,
    /onde\s+posso\s+trabalhar.*curso\s+de/,
    /área\s+de\s+atuação.*curso/,
    /mercado\s+de\s+trabalho.*curso/,
    /público\s+alvo.*curso/,
    /para\s+quem\s+é.*curso\s+de/,
    /quem\s+pode\s+fazer.*curso\s+de/,
    /me fale sobre\s+(?:o\s+)?curso\s+(?:de\s+|técnico\s+(?:de\s+)?)\w+/,
    /fale\s+sobre\s+(?:o\s+)?curso\s+(?:de\s+|técnico\s+(?:de\s+)?)\w+/,
    /me conte sobre\s+(?:o\s+)?curso\s+(?:de\s+|técnico\s+(?:de\s+)?)\w+/,
    /conte\s+sobre\s+(?:o\s+)?curso\s+(?:de\s+|técnico\s+(?:de\s+)?)\w+/,
  ];

  return palavrasChaveDescricao.some((regex) => regex.test(msgLower));
}

/**
 * Extrai o nome do curso de uma pergunta sobre descrição
 */
function extrairNomeCursoDaPergunta(userMessage) {
  const padroes = [
    /o que é\s+(?:o\s+)?curso\s+(?:de\s+|técnico\s+(?:de\s+)?)?(.+?)(?:\?|$)/i,
    /sobre\s+(?:o\s+)?curso\s+(?:de\s+|técnico\s+(?:de\s+)?)?(.+?)(?:\?|$)/i,
    /conteúdo\s+do\s+curso\s+(?:de\s+)?(.+?)(?:\?|$)/i,
    /o que\s+vou\s+aprender.*curso\s+(?:de\s+)?(.+?)(?:\?|$)/i,
    /matérias\s+do\s+curso\s+(?:de\s+)?(.+?)(?:\?|$)/i,
    /(?:qual\s+(?:a\s+|é\s+a\s+)?)?ementa\s+do\s+curso\s+(?:de\s+)?(.+?)(?:\?|$)/i,
  ];

  for (const padrao of padroes) {
    const match = userMessage.match(padrao);
    if (match && match[1]) {
      let nomeCurso = match[1].trim();

      // Limpar o nome extraído
      nomeCurso = nomeCurso
        .replace(/^(do|da|de|curso|técnico|em|na|no)\s+/i, "")
        .replace(/\s+(do|da|de|curso|técnico|tem|existe)$/i, "")
        .replace(/\s+e\s+.*/i, "")
        .replace(/\s*[,;].*/i, "")
        .trim();

      // Verificar se o nome é válido
      const palavrasGenericas = [
        "curso",
        "cursos",
        "técnico",
        "modalidade",
        "online",
        "ead",
        "presencial",
      ];
      if (
        nomeCurso.length > 2 &&
        !palavrasGenericas.includes(nomeCurso.toLowerCase())
      ) {
        return nomeCurso;
      }
    }
  }

  // Fallback: procurar diretamente pelos nomes dos cursos disponíveis
  for (const curso of cursosDisponiveis) {
    if (userMessage.toLowerCase().includes(curso.toLowerCase())) {
      return curso;
    }
  }

  return null;
}

/**
 * Busca descrição de um curso no dicionário carregado
 */
function buscarDescricaoCurso(nomeCurso) {
  if (!nomeCurso) return null;

  // Garantir que as descrições estão carregadas
  carregarDescricoesDoCSV();

  // Normalizar o nome para busca
  const nomeNormalizado = nomeCurso
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const curso = dicionarioDescricoes[nomeNormalizado];

  if (curso) {
    const rawDescription = `📚 **${curso.nome}**

🎯 **Objetivo do Curso:**
${curso.objetivo}

👥 **Público-Alvo:**
${curso.publicoAlvo}

💼 **Onde Pode Trabalhar:**
${curso.ondeTrabalhar}`;

    // ✨ APLICAR FORMATAÇÃO LIMPA
    return formatChatbotResponse(rawDescription);
  }

  return null;
}

// ============================================
// 🤖 FUNÇÃO PRINCIPAL DO CHAT
// ============================================

/**
 * Envia a mensagem do usuário para o modelo GPT com histórico
 */
async function getChatResponse(userMessage, email, cidadeLead = "") {
  console.log(`[OPENAI] Iniciando getChatResponse com: "${userMessage}"`);

  try {
    const mensagens = [
      {
        role: "system",
        content: `
Você é o assistente virtual especializado em Cursos Técnicos do Senai Paraná.

${
  cidadeLead
    ? `**CONTEXTO:** O usuário é de ${cidadeLead}. Priorize informações desta cidade.`
    : ""
}

Sua missão é acolher, informar e converter leads interessados em matrículas nos cursos técnicos oferecidos pelo Senai Paraná.

Adote um tom simpático, acolhedor, direto e útil. Sempre utilize gatilhos mentais para incentivar a realização da pré-matrícula.

---

📚 **CURSOS DISPONÍVEIS (APENAS ESTES EXISTEM):**
${cursosDisponiveis.map((curso) => `• ${curso}`).join("\n")}

🏙️ **CIDADES DISPONÍVEIS (APENAS ESTAS EXISTEM):**
${cidadesDisponiveis.map((cidade) => `• ${cidade}`).join("\n")}

⚠️ **IMPORTANTE:** Você só pode mencionar cursos e cidades que estão nas listas acima. Se o usuário perguntar sobre um curso ou cidade que não existe na lista, informe educadamente que não temos essa opção disponível e sugira alternativas similares da lista ou peça para falar com um atendente.

---

🏢 **TRATAMENTO ESPECIAL PARA CURITIBA:**

Quando o usuário mencionar **"Curitiba"** como cidade desejada, você deve responder:

"Ótimo! Em Curitiba temos 4 unidades do SENAI para você escolher:

📍 Boqueirão
📍 Campus da Indústria
📍 CIC - Cidade Industrial de Curitiba
📍 Centro - Curitiba

Qual dessas unidades fica mais próxima de você ou seria mais conveniente para estudar? 

Cada unidade pode ter cursos e horários diferentes, então me diga qual você prefere para eu te dar informações mais específicas! 😊"

**NUNCA** trate "Curitiba" como uma cidade específica para busca de cursos. **SEMPRE** ofereça as 4 opções de unidades quando o usuário mencionar Curitiba.

---

🎯 **Intenção: Fazer uma Pré-Matrícula**

Ao identificar alta intenção através das palavras-chave como:
* "quero me inscrever"
* "como faço a matrícula"
* "tenho interesse no curso"
* "quero garantir minha vaga"
* "como funciona a pré-matrícula"
* "pode me cadastrar?"
* "tem como reservar?"
* "quero começar logo"

Responda com:
* Entusiasmo e acolhimento;
* Convite claro e direto para pré-matrícula;
* Uso de gatilhos mentais (urgência, prova social, facilidade, autoridade);

**Resposta modelo:**
"Ótimo saber do seu interesse! 😊 Vamos garantir sua vaga com a pré-matrícula. É rápido, fácil e seguro. 👉 https://www.senaipr.org.br/cursos-tecnicos/pre-matricula/"

---

💬 **Intenção: Falar com Atendente Humano**

Se o usuário expressar frases como:
* "quero falar com alguém"
* "tem WhatsApp?"
* "posso falar com um atendente?"
* "prefiro conversar com uma pessoa"
* "pode me chamar no WhatsApp?"

Responda com:
"Claro! Um dos nossos especialistas pode te atender pelo WhatsApp. Clique abaixo para conversar com a gente direto e tirar todas as suas dúvidas. 👉 https://wa.me/5541987249685"

---

📌 **Quando não identificar claramente a intenção**, responda com foco em:
* Informar sobre cursos disponíveis, unidades, modalidades e valores;
* Esclarecer dúvidas gerais;
* Prioritariamente, convide o usuário a saber mais via WhatsApp ou formulário.

Caso não tenha a informação específica, indique que encaminhará a dúvida para um atendente humano. NUNCA invente dados ou cursos que não existem na lista.
        `.trim(),
      },
    ];

    // Carregar histórico de mensagens do usuário
    if (email) {
      try {
        const [historico] = await pool.query(
          "SELECT user_message, bot_response FROM messages WHERE email = ? ORDER BY id DESC LIMIT 10",
          [email]
        );

        historico.reverse().forEach((m) => {
          if (m.user_message && m.bot_response) {
            mensagens.push({ role: "user", content: m.user_message });
            mensagens.push({ role: "assistant", content: m.bot_response });
          }
        });
      } catch (dbError) {
        console.warn("⚠️ Erro ao carregar histórico do banco:", dbError);
      }
    }

    mensagens.push({ role: "user", content: userMessage });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: mensagens,
      temperature: 0.7,
      max_tokens: 600,
    });

    const rawResponse = completion.choices[0].message.content;

    // ✅ APLICAR FORMATAÇÃO LIMPA
    const cleanResponse = formatChatbotResponse(rawResponse);

    console.log(
      "🧹 RESPOSTA ANTES DA FORMATAÇÃO:",
      rawResponse.substring(0, 100)
    );
    console.log(
      "✨ RESPOSTA APÓS FORMATAÇÃO:",
      cleanResponse.substring(0, 100)
    );

    return cleanResponse;
  } catch (err) {
    console.error("Erro ao chamar a OpenAI:", err);
    throw new Error("Erro ao chamar a OpenAI");
  }
}

// ============================================
// 🎯 FUNÇÃO DE EXTRAÇÃO DE FILTROS - SIMPLIFICADA
// ============================================

/**
 * Extrai filtros de texto para busca de cursos - VERSÃO SIMPLIFICADA
 */
async function extrairFiltrosDeTexto(userMessage) {
  // Se for pergunta sobre descrição, não extrair filtros para busca
  if (detectarPerguntaDescricao(userMessage)) {
    console.log(
      "🔍 Pergunta sobre descrição detectada - não extraindo filtros de busca"
    );
    return { curso: "", cidade: "", modalidade: "" };
  }

  if (cursosDisponiveis.length === 0 || cidadesDisponiveis.length === 0) {
    console.log("📚 Recarregando dados do CSV...");
    carregarCursosDoCSV();
  }

  const prompt = `
Você é um analisador especializado em extrair informações sobre cursos técnicos.

CURSOS VÁLIDOS DISPONÍVEIS:
${cursosDisponiveis.map((curso) => `• ${curso}`).join("\n")}

CIDADES VÁLIDAS DISPONÍVEIS:
${cidadesDisponiveis.map((cidade) => `• ${cidade}`).join("\n")}

**REGRAS ESPECIAIS DE MAPEAMENTO:**

🏢 **CURITIBA:**
- Se o usuário mencionar "Curitiba" (e não uma unidade específica), deixe o campo cidade VAZIO ("")
- Se o usuário mencionar especificamente: "Boqueirão", "Campus da Indústria", "CIC", "Centro" use exatamente esses nomes

🏙️ **SÃO JOSÉ DOS PINHAIS:**
- Se o usuário mencionar: "São José dos Pinhais", "São José", "SJP" → use "São José dos Pinhais"

🏭 **LONDRINA:**
- Se o usuário mencionar "Londrina" (e não uma unidade específica), deixe o campo cidade VAZIO ("")
- Se o usuário mencionar especificamente: "Dr. Celso Charuri", use exatamente esse nome

Analise a mensagem e extraia APENAS se mencionado explicitamente:
- "curso": nome do curso técnico mencionado (DEVE estar na lista acima)
- "cidade": cidade mencionada aplicando as regras de mapeamento acima
- "modalidade": EAD, Presencial

IMPORTANTE:
- Se o curso mencionado não estiver na lista válida, deixe campo vazio ("")
- Para modalidade, normalize (ex: "online" = "EAD", "presencial" = "Presencial")

Responda APENAS com JSON válido:

{
  "curso": "",
  "cidade": "",
  "modalidade": ""
}

Mensagem para analisar:
"${userMessage}"
`.trim();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.1,
    });

    const texto = completion.choices[0].message.content.trim();
    const match = texto.match(/\{[\s\S]*\}/);

    if (match) {
      const filtros = JSON.parse(match[0]);

      // ✅ VALIDAÇÃO ADICIONAL
      if (filtros.cidade && !cidadesDisponiveis.includes(filtros.cidade)) {
        console.log(
          `⚠️ Cidade "${filtros.cidade}" não encontrada na lista válida, removendo...`
        );
        filtros.cidade = "";
      }

      if (filtros.curso && !cursosDisponiveis.includes(filtros.curso)) {
        console.log(
          `⚠️ Curso "${filtros.curso}" não encontrado na lista válida, removendo...`
        );
        filtros.curso = "";
      }

      console.log(`🔍 Filtros extraídos para "${userMessage}":`, filtros);
      return filtros;
    }

    return { curso: "", cidade: "", modalidade: "" };
  } catch (err) {
    console.error("Erro ao interpretar filtros da IA:", err);
    return { curso: "", cidade: "", modalidade: "" };
  }
}

// ============================================
// 🏙️ FUNÇÕES AUXILIARES SIMPLIFICADAS
// ============================================

/**
 * Verifica se a mensagem menciona Curitiba de forma genérica
 */
function mencionaCuritibaGenerica(userMessage) {
  const msgLower = userMessage.toLowerCase();
  const variacesCuritiba = ["curitiba", "cwb", "ctba"];
  const unidadesCuritiba = [
    "boqueirão",
    "boqueirao",
    "campus da industria",
    "campus da indústria",
    "cic",
    "centro",
    "centro - curitiba",
  ];

  const mencionaCuritiba = variacesCuritiba.some((variacao) =>
    msgLower.includes(variacao)
  );
  const mencionaUnidadeEspecifica = unidadesCuritiba.some((unidade) =>
    msgLower.includes(unidade)
  );

  return mencionaCuritiba && !mencionaUnidadeEspecifica;
}

/**
 * Verifica se a mensagem menciona Londrina de forma genérica
 */
function mencionaLondrinaGenerica(userMessage) {
  const msgLower = userMessage.toLowerCase();
  const variacoesLondrina = ["londrina", "londrina pr"];
  const unidadeLondrina = [
    "Dr. Celso Charuri",
    "dr celso charuri",
    "celso charuri",
  ];

  const mencionaLondrina = variacoesLondrina.some((variacao) =>
    msgLower.includes(variacao)
  );

  const mencionaUnidadeEspecifica = unidadeLondrina.some((unidade) =>
    msgLower.includes(unidade)
  );

  return mencionaLondrina && !mencionaUnidadeEspecifica;
}

/**
 * Formatar cidade para formulário - SIMPLIFICADO
 */
function formatarCidadeParaFormulario(cidadeOriginal) {
  if (!cidadeOriginal) return "";

  const cidadeLower = cidadeOriginal.toLowerCase();

  // Casos especiais de Curitiba - unidades que precisam do formato "Curitiba - Unidade"
  const unidadesCuritiba = {
    boqueirão: "Curitiba - Boqueirão",
    boqueirao: "Curitiba - Boqueirão",
    "campus da indústria": "Curitiba - Campus da Indústria",
    "campus da industria": "Curitiba - Campus da Indústria",
    cic: "Curitiba - CIC",
  };

  for (const [unidade, formato] of Object.entries(unidadesCuritiba)) {
    if (cidadeLower.includes(unidade)) {
      return formato;
    }
  }

  // Para todas as outras cidades, usar como está (incluindo "São José dos Pinhais")
  return cidadeOriginal;
}

// ============================================
// 📤 EXPORTS
// ============================================

export {
  getChatResponse,
  extrairFiltrosDeTexto,
  detectarPerguntaDescricao,
  extrairNomeCursoDaPergunta,
  buscarDescricaoCurso,
  carregarCursosDoCSV,
  carregarDescricoesDoCSV,
};
