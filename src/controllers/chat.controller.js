// // // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// // // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> NOVA VERSÃO TESTE 09/06/2025 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// // // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// import {
//   getChatResponse,
//   extrairFiltrosDeTexto,
//   detectarPerguntaDescricao,
//   extrairNomeCursoDaPergunta,
//   buscarDescricaoCurso,
// } from "../services/openai.service.js";

// import {
//   normalizarCidade,
//   normalizarModalidade,
// } from "../utils/normalizacao.js";
// import pool from "../config/db.js";
// import fs from "fs";
// import { construirDicionarioPorCidade } from "../utils/carregarCursoCsv.js";

// // ============================================
// // 🔧 FORMATAÇÃO E LIMPEZA
// // ============================================

// function formatChatbotResponse(rawResponse) {
//   if (!rawResponse) return rawResponse;

//   return rawResponse
//     .replace(/\n{3,}/g, "\n\n")
//     .replace(/\s+/g, " ")
//     .replace(/\n\s+/g, "\n")
//     .replace(/\s+\n/g, "\n")
//     .trim();
// }

// // ============================================
// // 🏢 MAPEAMENTO CURITIBA - UNIDADES
// // ============================================

// const UNIDADES_CURITIBA = {
//   Boqueirão: true,
//   "Campus da Indústria": true,
//   CIC: true,
//   "Dr. Celso Charuri": true,
// };

// function ehUnidadeCuritiba(cidade) {
//   return UNIDADES_CURITIBA[cidade] === true;
// }

// function formatarCidadeParaFormulario(cidadeOriginal) {
//   return ehUnidadeCuritiba(cidadeOriginal)
//     ? `Curitiba - ${cidadeOriginal}`
//     : cidadeOriginal;
// }

// function gerarMensagemWhatsAppContextualizada(nome, curso, cidade) {
//   const cursoTexto = curso || "informações sobre cursos técnicos";

//   if (ehUnidadeCuritiba(cidade)) {
//     return `Olá! Meu nome é ${nome}, tenho interesse no curso de ${cursoTexto} na unidade ${cidade} em Curitiba. Poderia me ajudar?`;
//   } else if (cidade) {
//     return `Olá! Meu nome é ${nome}, tenho interesse no curso de ${cursoTexto} em ${cidade}. Poderia me ajudar?`;
//   } else {
//     return `Olá! Meu nome é ${nome}, tenho interesse em ${cursoTexto} do SENAI Paraná. Poderia me ajudar?`;
//   }
// }

// // ============================================
// // 🔍 SISTEMA DE FILTROS
// // ============================================

// function verificarCuritibaGenerica(userMessage, cidade) {
//   const msgLower = userMessage.toLowerCase();

//   const mencionaCuritiba = ["curitiba", "cwb", "ctba"].some((variacao) =>
//     msgLower.includes(variacao)
//   );

//   const unidadesCuritiba = [
//     "boqueirão",
//     "boqueirao",
//     "campus da indústria",
//     "campus da industria",
//     "cic",
//     "dr. celso charuri",
//     "dr celso charuri",
//     "celso charuri",
//   ];

//   const mencionaUnidadeEspecifica = unidadesCuritiba.some((unidade) =>
//     msgLower.includes(unidade)
//   );

//   return mencionaCuritiba && !mencionaUnidadeEspecifica;
// }

// function buscarCursosEmCuritiba(dicionario) {
//   const unidadesCuritiba = [
//     "Boqueirão",
//     "Campus da Indústria",
//     "CIC",
//     "Dr. Celso Charuri",
//   ];
//   let cursosEncontrados = [];

//   console.log(`[CURITIBA] Buscando em unidades:`, unidadesCuritiba);

//   for (const unidade of unidadesCuritiba) {
//     if (dicionario[unidade]) {
//       cursosEncontrados.push(...dicionario[unidade]);
//       console.log(
//         `[CURITIBA] Encontrados ${dicionario[unidade].length} cursos em ${unidade}`
//       );
//     } else {
//       console.log(
//         `[CURITIBA] ⚠️ Unidade ${unidade} não encontrada no dicionário`
//       );
//     }
//   }

//   console.log(
//     `[CURITIBA] Total de cursos encontrados: ${cursosEncontrados.length}`
//   );
//   return cursosEncontrados;
// }

// function filtrarCursosOtimizado(dicionario, filtros, userMessage = "") {
//   const { cidade, curso, modalidade } = filtros;
//   console.log(`[FILTRO] Iniciando com:`, { cidade, curso, modalidade });

//   let cursosEncontrados = [];

//   // Verificar busca genérica por Curitiba
//   const ehBuscaCuritibaGenerica = verificarCuritibaGenerica(
//     userMessage,
//     cidade
//   );

//   if (ehBuscaCuritibaGenerica) {
//     console.log(`[FILTRO] 🏢 Detectada busca genérica por Curitiba`);

//     if (!curso) {
//       return {
//         cursos: [],
//         info: {
//           mostrarOpcoesCuritiba: true,
//           respostaEspecialCuritiba: `Ótimo! Em Curitiba temos 4 unidades do SENAI para você escolher:\n

// 📍 Boqueirão\n
// 📍 Campus da Indústria\n
// 📍 CIC - Cidade Industrial de Curitiba\n
// 📍 Centro - Curitiba.\n

// Qual dessas unidades fica mais próxima de você ou seria mais conveniente para estudar? \n

// Cada unidade pode ter cursos e horários diferentes, então me diga qual você prefere para eu te dar informações mais específicas! 😊`,
//         },
//       };
//     }

//     cursosEncontrados = buscarCursosEmCuritiba(dicionario);
//   }
//   // Busca normal por cidade específica
//   else if (cidade && dicionario[cidade]) {
//     cursosEncontrados = [...dicionario[cidade]];
//     console.log(`[FILTRO] ${cursosEncontrados.length} cursos em ${cidade}`);
//   }
//   // Busca por "Curitiba" diretamente
//   else if (cidade && cidade.toLowerCase() === "curitiba") {
//     console.log(`[FILTRO] 🏢 Busca direta por Curitiba`);
//     cursosEncontrados = buscarCursosEmCuritiba(dicionario);
//   }
//   // Busca flexível por cidades similares
//   else if (cidade) {
//     for (const [cidadeDict, cursosDict] of Object.entries(dicionario)) {
//       const cityLower = cidadeDict
//         .toLowerCase()
//         .normalize("NFD")
//         .replace(/[\u0300-\u036f]/g, "");
//       const searchLower = cidade
//         .toLowerCase()
//         .normalize("NFD")
//         .replace(/[\u0300-\u036f]/g, "");

//       if (cityLower.includes(searchLower) || searchLower.includes(cityLower)) {
//         cursosEncontrados.push(...cursosDict);
//         console.log(
//           `[FILTRO] Incluindo cursos de ${cidadeDict} (busca por ${cidade})`
//         );
//       }
//     }
//   }
//   // Busca em todas as cidades
//   else {
//     cursosEncontrados = Object.values(dicionario).flat();
//     console.log(
//       `[FILTRO] ${cursosEncontrados.length} cursos em todas as cidades`
//     );
//   }

//   // Filtro de curso
//   if (curso) {
//     const cursosAntes = cursosEncontrados.length;
//     cursosEncontrados = cursosEncontrados.filter((c) => {
//       const nomeCurso = (c.nome_curso || c.curso || "").toLowerCase();
//       const cursoLower = curso.toLowerCase();

//       return (
//         nomeCurso.includes(cursoLower) ||
//         cursoLower.includes(nomeCurso) ||
//         nomeCurso
//           .split(" ")
//           .some((palavra) => cursoLower.includes(palavra) && palavra.length > 2)
//       );
//     });
//     console.log(
//       `[FILTRO] ${cursosEncontrados.length} após filtro de curso (era ${cursosAntes})`
//     );
//   }

//   // Filtro de modalidade
//   if (modalidade) {
//     const cursosAntes = cursosEncontrados.length;
//     cursosEncontrados = cursosEncontrados.filter((c) => {
//       const modalidadeCurso = (c.modalidade || "").toLowerCase();
//       const modalidadeLower = modalidade.toLowerCase();

//       return (
//         modalidadeCurso.includes(modalidadeLower) ||
//         modalidadeLower.includes(modalidadeCurso)
//       );
//     });
//     console.log(
//       `[FILTRO] ${cursosEncontrados.length} após filtro de modalidade (era ${cursosAntes})`
//     );
//   }

//   // Remover duplicatas
//   const cursosUnicos = cursosEncontrados.filter((curso, index, array) => {
//     // Criar chave única baseada em múltiplos campos
//     const chaveUnica = [
//       (curso.nome_curso || curso.curso || "").trim().toLowerCase(),
//       (curso.cidade || "").trim(),
//       (curso.modalidade || "").trim().toLowerCase(),
//       (curso.turno || "").trim().toLowerCase(),
//     ].join("|");

//     // Verificar se é a primeira ocorrência desta chave
//     const primeiraOcorrencia = array.findIndex((c) => {
//       const chaveComparacao = [
//         (c.nome_curso || c.curso || "").trim().toLowerCase(),
//         (c.cidade || "").trim(),
//         (c.modalidade || "").trim().toLowerCase(),
//         (c.turno || "").trim().toLowerCase(),
//       ].join("|");
//       return chaveComparacao === chaveUnica;
//     });

//     return index === primeiraOcorrencia;
//   });

//   // ✅ LOG DETALHADO DE DUPLICATAS
//   const duplicatasRemovidas = cursosEncontrados.length - cursosUnicos.length;
//   if (duplicatasRemovidas > 0) {
//     console.log(`[FILTRO] ⚠️ Removidas ${duplicatasRemovidas} duplicatas`);

//     // Debug: mostrar algumas duplicatas removidas
//     const duplicatas = cursosEncontrados.filter((curso, index, array) => {
//       const chaveUnica = [
//         (curso.nome_curso || curso.curso || "").trim().toLowerCase(),
//         curso.cidade || "",
//         (curso.modalidade || "").trim().toLowerCase(),
//         (curso.turno || "").trim().toLowerCase(),
//       ].join("|");

//       const primeiraOcorrencia = array.findIndex((c) => {
//         const chaveComparacao = [
//           (c.nome_curso || c.curso || "").trim().toLowerCase(),
//           c.cidade || "",
//           (c.modalidade || "").trim().toLowerCase(),
//           (c.turno || "").trim().toLowerCase(),
//         ].join("|");
//         return chaveComparacao === chaveUnica;
//       });

//       return index !== primeiraOcorrencia;
//     });

//     console.log(
//       `[FILTRO] 📊 Exemplos de duplicatas removidas:`,
//       duplicatas.slice(0, 3).map((d) => ({
//         nome: d.nome_curso || d.curso,
//         cidade: d.cidade,
//         modalidade: d.modalidade,
//         turno: d.turno,
//       }))
//     );
//   }

//   console.log(`[FILTRO] ${cursosUnicos.length} cursos únicos finais`);

//   return {
//     cursos: cursosUnicos,
//     info: {
//       cidadeEncontrada: cidade,
//       totalCursos: cursosUnicos.length,
//       duplicatasRemovidas,
//       modalidadesDisponiveis: [
//         ...new Set(cursosUnicos.map((c) => c.modalidade)),
//       ],
//       cidadesDisponiveis: [...new Set(cursosUnicos.map((c) => c.cidade))],
//     },
//   };
// }

// // ============================================
// // 🎨 GERAÇÃO DE RESPOSTAS
// // ============================================
// function gerarRespostaCuritiba(cursos, filtros, nome) {
//   if (cursos.length === 0) {
//     return `Oi ${nome}! Não encontrei cursos disponíveis em Curitiba com esses filtros.

// 💡 Que tal tentar outras modalidades ou falar conosco?

// 📲 <a href="https://wa.me/5541987249685" target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>`;
//   }

//   const cursosPorUnidade = {};
//   cursos.forEach((curso) => {
//     const unidade = curso.cidade;
//     if (!cursosPorUnidade[unidade]) {
//       cursosPorUnidade[unidade] = [];
//     }
//     cursosPorUnidade[unidade].push(curso);
//   });

//   let resposta = `Oi ${nome}! \n😊 Encontrei alguns cursos`;
//   if (filtros.modalidade) resposta += ` ${filtros.modalidade}`;
//   resposta += ` disponíveis pra você em Curitiba:

// `;

//   let cursosMostrados = 0;
//   const maxCursos = 8;

//   for (const [unidade, cursosUnidade] of Object.entries(cursosPorUnidade)) {
//     if (cursosMostrados >= maxCursos) break;

//     resposta += `📍 ${unidade}:
// `;

//     const cursosParaMostrar = cursosUnidade.slice(
//       0,
//       Math.min(3, maxCursos - cursosMostrados)
//     );
//     cursosParaMostrar.forEach((curso) => {
//       const nomeCurso =
//         curso.nome_curso || curso.curso || "Curso não identificado";
//       const turnoCurso = curso.turno || "Turno não informado";
//       const valor = curso.valor_curso
//         ? `R$ ${parseFloat(curso.valor_curso).toLocaleString("pt-BR", {
//             minimumFractionDigits: 2,
//           })}`
//         : "Valor a consultar";

//       resposta += `🔹 ${nomeCurso} – ${turnoCurso} – ${valor}
// `;
//       cursosMostrados++;
//     });

//     if (cursosUnidade.length > cursosParaMostrar.length) {
//       resposta += `🔹 E mais ${
//         cursosUnidade.length - cursosParaMostrar.length
//       } curso(s)...
// `;
//     }
//     resposta += `
// `;
//   }

//   if (Object.keys(cursosPorUnidade).length > 1) {
//     resposta += `💡 Temos unidades no Boqueirão, Campus da Indústria, CIC e Dr. Celso Charuri.

// `;
//   }

//   resposta += `\n\nSe quiser, posso te ajudar com a pré-matrícula 👇
// \n👉 LINK_PRE_MATRICULA_COMPLETO

// \n\nOu, se preferir, fale direto com a gente no WhatsApp:
// \n💬 LINK_WHATSAPP_COMPLETO

// \n\nQual desses você gostaria de saber mais? 😊`;

//   return resposta;
// }

// function gerarResposta(resultado, filtros, nome) {
//   const { cursos } = resultado;

//   if (
//     filtros.cidade &&
//     filtros.cidade.toLowerCase() === "curitiba" &&
//     cursos.length > 0
//   ) {
//     return gerarRespostaCuritiba(cursos, filtros, nome);
//   }

//   if (cursos.length === 0) {
//     let resposta = `Oi ${nome}! 😊 Infelizmente não encontrei cursos disponíveis`;

//     if (filtros.curso) resposta += ` de ${filtros.curso}`;
//     if (filtros.cidade) resposta += ` em ${filtros.cidade}`;
//     if (filtros.modalidade) resposta += ` na modalidade ${filtros.modalidade}`;

//     resposta += `.

// 💡 Algumas sugestões:
// • Digite outros cursos de seu interesse
// • Consulte outras cidades próximas
// • Ou fale conosco para mais opções

// 📲 <a href="https://wa.me/5541987249685" target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>

// Qual desses você gostaria de saber mais? 😊`;

//     return resposta;
//   }

//   let resposta = `Oi ${nome}! 😊 Encontrei alguns cursos`;

//   if (filtros.modalidade) resposta += ` ${filtros.modalidade}`;
//   resposta += ` disponíveis pra você`;
//   if (filtros.cidade) resposta += ` em ${filtros.cidade}`;
//   resposta += `:

// `;

//   const cursosParaMostrar = cursos.slice(0, 6);
//   cursosParaMostrar.forEach((curso) => {
//     const nomeCurso =
//       curso.nome_curso || curso.curso || "Curso não identificado";
//     const turnoCurso = curso.turno || "Turno não informado";
//     const valor = curso.valor_curso
//       ? `R$ ${parseFloat(curso.valor_curso).toLocaleString("pt-BR", {
//           minimumFractionDigits: 2,
//         })}`
//       : "Valor a consultar";

//     resposta += `🔹 ${nomeCurso} – ${turnoCurso} – ${valor}
// `;
//   });

//   if (cursos.length > 6) {
//     resposta += `
// E mais ${cursos.length - 6} curso(s)...
// `;
//   }

//   resposta += `
// \n\nSe quiser, posso te ajudar com a pré-matrícula 👇
// \n👉 LINK_PRE_MATRICULA_COMPLETO

// \n\nOu, se preferir, fale direto com a gente no WhatsApp:
// \n💬 LINK_WHATSAPP_COMPLETO

// \n\nQual desses você gostaria de saber mais? 😊`;

//   return resposta;
// }

// // ============================================
// // 🔧 APLICAR LINKS
// // ============================================

// function aplicarLinks(
//   resposta,
//   nome,
//   email,
//   telefone,
//   curso,
//   cidade,
//   modalidade
// ) {
//   const linkInscricao = `https://www.senaipr.org.br/cursos-tecnicos/pre-matricula/`;

//   // ✅ CRIAR MENSAGEM WHATSAPP PERSONALIZADA
//   const mensagemWhatsApp = gerarMensagemWhatsAppContextualizada(
//     nome,
//     curso,
//     cidade
//   );
//   const linkWhatsapp = `https://wa.me/5541987249685?text=${encodeURIComponent(
//     mensagemWhatsApp
//   )}`;

//   console.log(`[LINKS] 🔗 Aplicando links...`);
//   console.log(`[LINKS] 📋 Link inscrição: ${linkInscricao}`);
//   console.log(`[LINKS] 📱 Link WhatsApp: ${linkWhatsapp.substring(0, 100)}...`);

//   // ✅ DEBUG - Verificar se os placeholders existem
//   const temPlaceholderPreMatricula = resposta.includes(
//     "LINK_PRE_MATRICULA_COMPLETO"
//   );
//   const temPlaceholderWhatsApp = resposta.includes("LINK_WHATSAPP_COMPLETO");

//   console.log(
//     `[LINKS] 📊 Placeholder pré-matrícula encontrado: ${temPlaceholderPreMatricula}`
//   );
//   console.log(
//     `[LINKS] 📊 Placeholder WhatsApp encontrado: ${temPlaceholderWhatsApp}`
//   );

//   // ✅ SUBSTITUIÇÕES COMPLETAS
//   let respostaProcessada = resposta
//     .replace(
//       /LINK_PRE_MATRICULA_COMPLETO/g,
//       `<a href="${linkInscricao}">Fazer pré-matrícula</a>`
//     )
//     .replace(
//       /LINK_WHATSAPP_COMPLETO/g,
//       `<a href="${linkWhatsapp}">Abrir WhatsApp</a>`
//     );

//   // ✅ FALLBACK - Se ainda existirem placeholders antigos, substituir também
//   respostaProcessada = respostaProcessada
//     .replace(/LINK_PRE_MATRICULA/g, linkInscricao)
//     .replace(/LINK_WHATSAPP/g, linkWhatsapp);

//   console.log(`[LINKS] ✅ Links aplicados com sucesso`);
//   console.log(`[LINKS] 📏 Resposta original: ${resposta.length} chars`);
//   console.log(
//     `[LINKS] 📏 Resposta processada: ${respostaProcessada.length} chars`
//   );

//   // ✅ DEBUG - Mostrar parte da resposta processada
//   console.log(
//     `[LINKS] 🔍 Parte da resposta: ${respostaProcessada.substring(
//       respostaProcessada.length - 200
//     )}`
//   );

//   return respostaProcessada;
// }

// // ============================================
// // LINK CLICAVEIS
// // ============================================

// function tornarLinksClicaveis(texto) {
//   if (!texto) return texto;

//   return (
//     texto
//       // WhatsApp links - CORREÇÃO: adicionar target e rel corretos
//       .replace(
//         /(https:\/\/wa\.me\/[^\s]+)/g,
//         '<a href="$1" target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a>'
//       )
//       // Pré-matrícula links - CORREÇÃO: adicionar target e rel corretos
//       .replace(
//         /(https:\/\/[^\/]*senaipr[^\/]*\/[^\s]*pre-matricula[^\s]*)/g,
//         '<a href="$1" target="_blank" rel="noopener noreferrer">Fazer Pré-matrícula</a>'
//       )
//       // Site SENAI-PR geral - CORREÇÃO: adicionar target e rel corretos
//       .replace(
//         /(https:\/\/[^\/]*senaipr[^\/]*\/[^\s]+)/g,
//         '<a href="$1" target="_blank" rel="noopener noreferrer">Site SENAI-PR</a>'
//       )
//       // URLs genéricas restantes - CORREÇÃO: adicionar target e rel corretos
//       .replace(
//         /(https?:\/\/[^\s]+)/g,
//         '<a href="$1" target="_blank" rel="noopener noreferrer">Clique aqui</a>'
//       )
//   );
// }

// // ============================================
// // 🔍 EXTRAÇÃO DE FILTROS HEURÍSTICA
// // ============================================

// function extrairFiltrosHeuristico(message) {
//   const CIDADES_MELHORADO = {
//     // Curitiba e variações
//     curitiba: "Curitiba",
//     cwb: "Curitiba",
//     ctba: "Curitiba",

//     // Unidades específicas de Curitiba
//     boqueirão: "Boqueirão",
//     boqueirao: "Boqueirão",
//     "campus da indústria": "Campus da Indústria",
//     "campus da industria": "Campus da Indústria",
//     cic: "CIC",
//     centro: "Centro - Curitiba",

//     // Outras cidades
//     "ponta grossa": "Ponta Grossa",
//     pg: "Ponta Grossa",
//     londrina: "Londrina",
//     maringá: "Maringá",
//     maringa: "Maringá",
//     cascavel: "Cascavel",
//     palmas: "Palmas",
//     "foz do iguaçu": "Foz do Iguaçu",
//     foz: "Foz do Iguaçu",
//     guarapuava: "Guarapuava",
//     paranavaí: "Paranavaí",
//     paranavai: "Paranavaí",
//     colombo: "Colombo",
//     "são josé dos pinhais": "São José dos Pinhais",
//     "sao jose dos pinhais": "São José dos Pinhais",

//     // ✅ ADICIONAR IRATI E OUTRAS CIDADES FALTANTES
//     irati: "Irati",
//     "união da vitória": "União da Vitória",
//     "uniao da vitoria": "União da Vitória",
//     apucarana: "Apucarana",
//     toledo: "Toledo",
//     umuarama: "Umuarama",
//     "campo mourão": "Campo Mourão",
//     "campo mourao": "Campo Mourão",
//     paranaguá: "Paranaguá",
//     paranagua: "Paranaguá",
//     "são mateus do sul": "São Mateus do Sul",
//     "sao mateus do sul": "São Mateus do Sul",
//     telêmaco: "Telêmaco Borba",
//     "telemaco borba": "Telêmaco Borba",
//     jacarezinho: "Jacarezinho",
//     cornélio: "Cornélio Procópio",
//     "cornelio procopio": "Cornélio Procópio",
//   };

//   const CURSOS_PATTERNS = {
//     "desenvolvimento de sistemas":
//       /desenvolvimento\s*(de\s*)?sistemas?|programação|programacao|informatica|informática|\bti\b|\bds\b|software|sistemas/i,
//     eletrônica: /eletrônica|eletronica|eletrica|elétrica/i,
//     mecânica: /mecânica|mecanica|manutenção|manutencao|usinagem|soldagem/i,
//     "automação industrial": /automação|automacao|controle|instrumentacao/i,
//     enfermagem: /enfermagem|saude|saúde/i,
//     administração: /administração|administracao|gestao|gestão/i,
//     logística: /logística|logistica|transporte/i,
//     "segurança do trabalho":
//       /segurança|seguranca|seguranca\s*do\s*trabalho|\bsst\b/i,
//     química: /química|quimica|laboratorio|laboratório/i,
//     "redes de computadores": /redes|rede|computadores|networking/i,
//   };

//   const lower = message
//     .toLowerCase()
//     .normalize("NFD")
//     .replace(/[\u0300-\u036f]/g, "");
//   console.log(`[HEURISTICA] Processando: "${lower}"`);

//   // Extrair modalidade
//   let modalidade = "";
//   if (/\b(ead|online|remoto|distancia|a\s*distancia|virtual)\b/.test(lower)) {
//     modalidade = "EAD";
//   } else if (/\b(presencial|presenciais|sala\s*de\s*aula)\b/.test(lower)) {
//     modalidade = "Presencial";
//   }

//   // Buscar cidade
//   let cidade = "";
//   let melhorMatch = "";

//   for (const [chave, valor] of Object.entries(CIDADES_MELHORADO)) {
//     if (lower.includes(chave) && chave.length > melhorMatch.length) {
//       cidade = valor;
//       melhorMatch = chave;
//     }
//   }

//   // Segundo: busca por inclusão (fallback)
//   if (!cidade) {
//     for (const [chave, valor] of Object.entries(CIDADES_MELHORADO)) {
//       if (lower.includes(chave) && chave.length > melhorMatch.length) {
//         cidade = valor;
//         melhorMatch = chave;
//       }
//     }
//   }

//   // Buscar curso
//   let curso = "";
//   for (const [nomeCurso, pattern] of Object.entries(CURSOS_PATTERNS)) {
//     if (pattern.test(message)) {
//       curso = nomeCurso;
//       break;
//     }
//   }

//   const resultado = { curso, cidade, modalidade };
//   console.log(`[HEURISTICA] Extraído:`, resultado);
//   return resultado;
// }

// // ============================================
// // 📝 SISTEMA DE LOG
// // ============================================

// async function logInteracao(email, mensagem, resposta, metadata = {}) {
//   try {
//     const logEntry = {
//       timestamp: new Date().toISOString(),
//       email,
//       mensagem: mensagem.substring(0, 500),
//       resposta: resposta.substring(0, 1000),
//       metadata,
//     };

//     const logString =
//       `\n[${logEntry.timestamp}] ${email}\n` +
//       `MSG: ${logEntry.mensagem}\n` +
//       `RSP: ${logEntry.resposta}\n` +
//       `META: ${JSON.stringify(logEntry.metadata)}\n` +
//       `${"=".repeat(80)}\n`;

//     fs.appendFile("chat.log", logString, (err) => {
//       if (err) console.warn("[LOG] Erro ao escrever log:", err);
//     });
//   } catch (error) {
//     console.warn("[LOG] Erro no sistema de log:", error);
//   }
// }

// // ============================================
// // 🎯 CONTROLADOR PRINCIPAL
// // ============================================

// export async function chatController(req, res) {
//   try {
//     const message = req.body.message?.trim();
//     const email = req.email;

//     console.log(`[CHAT] Nova mensagem de ${email}: "${message}"`);

//     if (!message) {
//       return res.status(400).json({
//         error: "Mensagem não pode estar vazia.",
//         code: "MISSING_MESSAGE",
//       });
//     }

//     // ✅ REMOVER/COMENTAR ESTA VALIDAÇÃO:
//     // if (!email) {
//     //   return res.status(400).json({
//     //     error: "Email do usuário não informado.",
//     //     code: "MISSING_EMAIL",
//     //   });
//     // }

//     const [[lead]] = await pool.query(
//       "SELECT nome, telefone FROM leads WHERE email = ?",
//       [email]
//     );

//     const nome = lead?.nome || "amigo(a)";
//     const telefone = lead?.telefone || "";

//     console.log(`[CHAT] Lead encontrado: ${nome} (${telefone})`);

//     // Verificar pergunta sobre descrição
//     if (detectarPerguntaDescricao && detectarPerguntaDescricao(message)) {
//       console.log(`[CHAT] 📖 Pergunta sobre descrição detectada`);

//       const nomeCurso = extrairNomeCursoDaPergunta(message);

//       if (nomeCurso) {
//         console.log(`[CHAT] 🎯 Curso extraído: "${nomeCurso}"`);

//         const descricao = buscarDescricaoCurso(nomeCurso);

//         if (descricao) {
//           const respostaCompletaRaw = `${descricao}

// ✨ **Ficou interessado(a)?**

// O SENAI Paraná é referência nacional em educação profissional! 🏆

// 📍 **Próximos passos:**
// • 📋 **Pré-matrícula:** https://www.senaipr.org.br/cursos-tecnicos/pre-matricula/
// • 📲 **WhatsApp:** https://wa.me/5541987249685?text=${encodeURIComponent(
//             `Olá! Tenho interesse no curso de ${nomeCurso}. Poderia me ajudar?`
//           )}

// 💡 **Dica:** As vagas são limitadas! Não perca essa oportunidade! 🚀`;

//           const respostaCompleta = formatChatbotResponse(respostaCompletaRaw);

//           await pool.query(
//             `INSERT INTO messages (user_id, user_message, bot_response, nome, email, telefone, curso, cidade, modalidade)
//              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//             [
//               null,
//               message,
//               respostaCompleta,
//               nome,
//               email,
//               telefone,
//               nomeCurso,
//               "descrição solicitada",
//               "N/A",
//             ]
//           );

//           await logInteracao(email, message, respostaCompleta, {
//             curso: nomeCurso,
//             tipo: "descrição",
//           });

//           console.log(`[CHAT] ✅ Descrição retornada para: ${nomeCurso}`);
//           return res.status(200).json({ reply: respostaCompleta });
//         }
//       }

//       console.log(`[CHAT] ⚠️ Descrição não encontrada, usando fluxo normal`);
//     }

//     // Extração de filtros
//     let filtros = {};
//     try {
//       filtros = (await extrairFiltrosDeTexto(message)) || {};
//       console.log(`[CHAT] 🤖 Filtros OpenAI:`, filtros);
//     } catch (error) {
//       console.warn(`[CHAT] ⚠️ Erro OpenAI, usando heurística:`, error.message);
//       filtros = {};
//     }

//     const filtrosHeuristicos = extrairFiltrosHeuristico(message);

//     const filtrosFinal = {
//       curso: filtros.curso || filtrosHeuristicos.curso || "",
//       cidade: filtros.cidade || filtrosHeuristicos.cidade || "",
//       modalidade: filtros.modalidade || filtrosHeuristicos.modalidade || "",
//     };

//     console.log(`[CHAT] 🎯 Filtros finais:`, filtrosFinal);

//     const curso = filtrosFinal.curso;
//     const cidade = filtrosFinal.cidade
//       ? normalizarCidade(filtrosFinal.cidade)
//       : "";
//     const modalidade = filtrosFinal.modalidade
//       ? normalizarModalidade(filtrosFinal.modalidade)
//       : "";

//     let respostaFinal = "";

//     // Processamento principal
//     if (curso || cidade || modalidade) {
//       console.log(`[CHAT] 🔍 Usando sistema de filtros`);

//       try {
//         const dicionario = await construirDicionarioPorCidade();

//         // Debug para Curitiba
//         if (cidade && cidade.toLowerCase() === "curitiba") {
//           console.log(`[DEBUG] Verificando estrutura para Curitiba...`);
//           const unidadesCuritiba = [
//             "Boqueirão",
//             "Campus da Indústria",
//             "CIC",
//             "Dr. Celso Charuri",
//           ];
//           unidadesCuritiba.forEach((unidade) => {
//             if (dicionario[unidade]) {
//               console.log(
//                 `[DEBUG] ✅ ${unidade}: ${dicionario[unidade].length} cursos`
//               );
//             } else {
//               console.log(`[DEBUG] ❌ ${unidade}: NÃO ENCONTRADA`);
//             }
//           });
//         }

//         const resultado = filtrarCursosOtimizado(
//           dicionario,
//           { curso, cidade, modalidade },
//           message
//         );

//         // Verificar resposta especial de Curitiba
//         if (resultado.info?.mostrarOpcoesCuritiba) {
//           const respostaEspecial = resultado.info.respostaEspecialCuritiba;

//           await pool.query(
//             "INSERT INTO messages (user_id, user_message, bot_response, nome, email, telefone, curso, cidade, modalidade) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
//             [
//               null,
//               message,
//               respostaEspecial,
//               nome,
//               email,
//               telefone,
//               "consulta curitiba",
//               "opções especiais",
//               "N/A",
//             ]
//           );

//           await logInteracao(email, message, respostaEspecial, {
//             tipo: "curitiba_opcoes",
//           });
//           return res.status(200).json({ reply: respostaEspecial });
//         }

//         const respostaRaw = gerarResposta(
//           resultado,
//           { curso, cidade, modalidade },
//           nome
//         );

//         // SEMPRE aplicar os links, mesmo se não tiver cursos
//         const respostaCompleta = aplicarLinks(
//           respostaRaw,
//           nome,
//           email,
//           telefone,
//           curso,
//           cidade,
//           modalidade
//         );

//         respostaFinal = formatChatbotResponse(respostaCompleta);
//       } catch (error) {
//         console.error(`[CHAT] ❌ Erro no filtro, usando ChatGPT:`, error);
//         const respostaRaw = await getChatResponse(message, email);
//         respostaFinal = formatChatbotResponse(respostaRaw);
//       }
//     } else {
//       console.log(`[CHAT] 🤖 Usando ChatGPT`);
//       const respostaRaw = await getChatResponse(message, email);
//       respostaFinal = formatChatbotResponse(respostaRaw);
//     }

//     // Salvar no banco e log
//     await pool.query(
//       `INSERT INTO messages (user_id, user_message, bot_response, nome, email, telefone, curso, cidade, modalidade)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         null,
//         message,
//         respostaFinal,
//         nome,
//         email,
//         telefone,
//         curso || "não informado",
//         cidade || "não informado",
//         modalidade || "não informado",
//       ]
//     );

//     await logInteracao(email, message, respostaFinal, {
//       curso,
//       cidade,
//       modalidade,
//     });

//     console.log(`[CHAT] ✅ Resposta gerada (${respostaFinal.length} chars)`);

//     return res.status(200).json({ reply: respostaFinal });
//   } catch (error) {
//     console.error(`[CHAT] ❌ Erro geral:`, error);

//     await logInteracao(
//       req.email || "unknown",
//       req.body.message || "",
//       `ERRO: ${error.message}`,
//       { erro: true }
//     );

//     return res.status(500).json({
//       error: "Erro ao processar a mensagem. Por favor, tente novamente.",
//       code: "INTERNAL_SERVER_ERROR",
//     });
//   }
// }

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> NOVA VERSÃO TESTE 26/06/2025 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>ADICIONAR NOVO FILTRO CIDADE<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// import {
//   getChatResponse,
//   extrairFiltrosDeTexto,
//   detectarPerguntaDescricao,
//   extrairNomeCursoDaPergunta,
//   buscarDescricaoCurso,
// } from "../services/openai.service.js";
// import {
//   normalizarCidade,
//   normalizarModalidade,
// } from "../utils/normalizacao.js";
// import pool from "../config/db.js";
// import fs from "fs";
// import { construirDicionarioPorCidade } from "../utils/carregarCursoCsv.js";

// // ============================================
// // 🔧 FORMATAÇÃO E LIMPEZA
// // ============================================

// function formatChatbotResponse(rawResponse) {
//   if (!rawResponse) return rawResponse;

//   return rawResponse
//     .replace(/\n{3,}/g, "\n\n")
//     .replace(/\s+/g, " ")
//     .replace(/\n\s+/g, "\n")
//     .replace(/\s+\n/g, "\n")
//     .trim();
// }

// // ============================================
// // 🏢 MAPEAMENTO CURITIBA - UNIDADES
// // ============================================

// const UNIDADES_CURITIBA = {
//   Boqueirão: true,
//   "Campus da Indústria": true,
//   CIC: true,
//   "Dr. Celso Charuri": true,
// };

// function ehUnidadeCuritiba(cidade) {
//   return UNIDADES_CURITIBA[cidade] === true;
// }

// function formatarCidadeParaFormulario(cidadeOriginal) {
//   return ehUnidadeCuritiba(cidadeOriginal)
//     ? `Curitiba - ${cidadeOriginal}`
//     : cidadeOriginal;
// }

// function gerarMensagemWhatsAppContextualizada(nome, curso, cidade) {
//   const cursoTexto = curso || "informações sobre cursos técnicos";

//   if (ehUnidadeCuritiba(cidade)) {
//     return `Olá! Meu nome é ${nome}, tenho interesse no curso de ${cursoTexto} na unidade ${cidade} em Curitiba. Poderia me ajudar?`;
//   } else if (cidade) {
//     return `Olá! Meu nome é ${nome}, tenho interesse no curso de ${cursoTexto} em ${cidade}. Poderia me ajudar?`;
//   } else {
//     return `Olá! Meu nome é ${nome}, tenho interesse em ${cursoTexto} do SENAI Paraná. Poderia me ajudar?`;
//   }
// }

// // ============================================
// // 🔍 SISTEMA DE FILTROS
// // ============================================

// function verificarCuritibaGenerica(userMessage, cidade) {
//   const msgLower = userMessage.toLowerCase();

//   const mencionaCuritiba = ["curitiba", "cwb", "ctba"].some((variacao) =>
//     msgLower.includes(variacao)
//   );

//   const unidadesCuritiba = [
//     "boqueirão",
//     "boqueirao",
//     "campus da indústria",
//     "campus da industria",
//     "cic",
//     "dr. celso charuri",
//     "dr celso charuri",
//     "celso charuri",
//   ];

//   const mencionaUnidadeEspecifica = unidadesCuritiba.some((unidade) =>
//     msgLower.includes(unidade)
//   );

//   return mencionaCuritiba && !mencionaUnidadeEspecifica;
// }

// function buscarCursosEmCuritiba(dicionario) {
//   const unidadesCuritiba = [
//     "Boqueirão",
//     "Campus da Indústria",
//     "CIC",
//     "Dr. Celso Charuri",
//   ];
//   let cursosEncontrados = [];

//   console.log(`[CURITIBA] Buscando em unidades:`, unidadesCuritiba);

//   for (const unidade of unidadesCuritiba) {
//     if (dicionario[unidade]) {
//       cursosEncontrados.push(...dicionario[unidade]);
//       console.log(
//         `[CURITIBA] Encontrados ${dicionario[unidade].length} cursos em ${unidade}`
//       );
//     } else {
//       console.log(
//         `[CURITIBA] ⚠️ Unidade ${unidade} não encontrada no dicionário`
//       );
//     }
//   }

//   console.log(
//     `[CURITIBA] Total de cursos encontrados: ${cursosEncontrados.length}`
//   );
//   return cursosEncontrados;
// }

// function filtrarCursosOtimizado(dicionario, filtros, userMessage = "") {
//   const { cidade, curso, modalidade } = filtros;
//   console.log(`[FILTRO] Iniciando com:`, { cidade, curso, modalidade });

//   let cursosEncontrados = [];

//   // Verificar busca genérica por Curitiba
//   const ehBuscaCuritibaGenerica = verificarCuritibaGenerica(
//     userMessage,
//     cidade
//   );

//   if (ehBuscaCuritibaGenerica) {
//     console.log(`[FILTRO] 🏢 Detectada busca genérica por Curitiba`);

//     if (!curso) {
//       return {
//         cursos: [],
//         info: {
//           mostrarOpcoesCuritiba: true,
//           respostaEspecialCuritiba: `Ótimo! Em Curitiba temos 4 unidades do SENAI para você escolher:\n

// 📍 Boqueirão\n
// 📍 Campus da Indústria\n
// 📍 CIC - Cidade Industrial de Curitiba\n
// 📍 Centro - Curitiba.\n

// Qual dessas unidades fica mais próxima de você ou seria mais conveniente para estudar? \n

// Cada unidade pode ter cursos e horários diferentes, então me diga qual você prefere para eu te dar informações mais específicas! 😊`,
//         },
//       };
//     }

//     cursosEncontrados = buscarCursosEmCuritiba(dicionario);
//   }
//   // Busca normal por cidade específica
//   else if (cidade && dicionario[cidade]) {
//     cursosEncontrados = [...dicionario[cidade]];
//     console.log(`[FILTRO] ${cursosEncontrados.length} cursos em ${cidade}`);
//   }
//   // Busca por "Curitiba" diretamente
//   else if (cidade && cidade.toLowerCase() === "curitiba") {
//     console.log(`[FILTRO] 🏢 Busca direta por Curitiba`);
//     cursosEncontrados = buscarCursosEmCuritiba(dicionario);
//   }
//   // Busca flexível por cidades similares
//   else if (cidade) {
//     for (const [cidadeDict, cursosDict] of Object.entries(dicionario)) {
//       const cityLower = cidadeDict
//         .toLowerCase()
//         .normalize("NFD")
//         .replace(/[\u0300-\u036f]/g, "");
//       const searchLower = cidade
//         .toLowerCase()
//         .normalize("NFD")
//         .replace(/[\u0300-\u036f]/g, "");

//       if (cityLower.includes(searchLower) || searchLower.includes(cityLower)) {
//         cursosEncontrados.push(...cursosDict);
//         console.log(
//           `[FILTRO] Incluindo cursos de ${cidadeDict} (busca por ${cidade})`
//         );
//       }
//     }
//   }
//   // Busca em todas as cidades
//   else {
//     cursosEncontrados = Object.values(dicionario).flat();
//     console.log(
//       `[FILTRO] ${cursosEncontrados.length} cursos em todas as cidades`
//     );
//   }

//   // Filtro de curso
//   if (curso) {
//     const cursosAntes = cursosEncontrados.length;
//     cursosEncontrados = cursosEncontrados.filter((c) => {
//       const nomeCurso = (c.nome_curso || c.curso || "").toLowerCase();
//       const cursoLower = curso.toLowerCase();

//       return (
//         nomeCurso.includes(cursoLower) ||
//         cursoLower.includes(nomeCurso) ||
//         nomeCurso
//           .split(" ")
//           .some((palavra) => cursoLower.includes(palavra) && palavra.length > 2)
//       );
//     });
//     console.log(
//       `[FILTRO] ${cursosEncontrados.length} após filtro de curso (era ${cursosAntes})`
//     );
//   }

//   // Filtro de modalidade
//   if (modalidade) {
//     const cursosAntes = cursosEncontrados.length;
//     cursosEncontrados = cursosEncontrados.filter((c) => {
//       const modalidadeCurso = (c.modalidade || "").toLowerCase();
//       const modalidadeLower = modalidade.toLowerCase();

//       return (
//         modalidadeCurso.includes(modalidadeLower) ||
//         modalidadeLower.includes(modalidadeCurso)
//       );
//     });
//     console.log(
//       `[FILTRO] ${cursosEncontrados.length} após filtro de modalidade (era ${cursosAntes})`
//     );
//   }

//   // Remover duplicatas
//   const cursosUnicos = cursosEncontrados.filter((curso, index, array) => {
//     // Criar chave única baseada em múltiplos campos
//     const chaveUnica = [
//       (curso.nome_curso || curso.curso || "").trim().toLowerCase(),
//       (curso.cidade || "").trim(),
//       (curso.modalidade || "").trim().toLowerCase(),
//       (curso.turno || "").trim().toLowerCase(),
//     ].join("|");

//     // Verificar se é a primeira ocorrência desta chave
//     const primeiraOcorrencia = array.findIndex((c) => {
//       const chaveComparacao = [
//         (c.nome_curso || c.curso || "").trim().toLowerCase(),
//         (c.cidade || "").trim(),
//         (c.modalidade || "").trim().toLowerCase(),
//         (c.turno || "").trim().toLowerCase(),
//       ].join("|");
//       return chaveComparacao === chaveUnica;
//     });

//     return index === primeiraOcorrencia;
//   });

//   // ✅ LOG DETALHADO DE DUPLICATAS
//   const duplicatasRemovidas = cursosEncontrados.length - cursosUnicos.length;
//   if (duplicatasRemovidas > 0) {
//     console.log(`[FILTRO] ⚠️ Removidas ${duplicatasRemovidas} duplicatas`);

//     // Debug: mostrar algumas duplicatas removidas
//     const duplicatas = cursosEncontrados.filter((curso, index, array) => {
//       const chaveUnica = [
//         (curso.nome_curso || curso.curso || "").trim().toLowerCase(),
//         curso.cidade || "",
//         (curso.modalidade || "").trim().toLowerCase(),
//         (curso.turno || "").trim().toLowerCase(),
//       ].join("|");

//       const primeiraOcorrencia = array.findIndex((c) => {
//         const chaveComparacao = [
//           (c.nome_curso || c.curso || "").trim().toLowerCase(),
//           c.cidade || "",
//           (c.modalidade || "").trim().toLowerCase(),
//           (c.turno || "").trim().toLowerCase(),
//         ].join("|");
//         return chaveComparacao === chaveUnica;
//       });

//       return index !== primeiraOcorrencia;
//     });

//     console.log(
//       `[FILTRO] 📊 Exemplos de duplicatas removidas:`,
//       duplicatas.slice(0, 3).map((d) => ({
//         nome: d.nome_curso || d.curso,
//         cidade: d.cidade,
//         modalidade: d.modalidade,
//         turno: d.turno,
//       }))
//     );
//   }

//   console.log(`[FILTRO] ${cursosUnicos.length} cursos únicos finais`);

//   return {
//     cursos: cursosUnicos,
//     info: {
//       cidadeEncontrada: cidade,
//       totalCursos: cursosUnicos.length,
//       duplicatasRemovidas,
//       modalidadesDisponiveis: [
//         ...new Set(cursosUnicos.map((c) => c.modalidade)),
//       ],
//       cidadesDisponiveis: [...new Set(cursosUnicos.map((c) => c.cidade))],
//     },
//   };
// }

// // ============================================
// // 🎨 GERAÇÃO DE RESPOSTAS
// // ============================================
// function gerarRespostaCuritiba(cursos, filtros, nome) {
//   if (cursos.length === 0) {
//     return `Oi ${nome}! Não encontrei cursos disponíveis em Curitiba com esses filtros.

// 💡 Que tal tentar outras modalidades ou falar conosco?

// 📲 <a href="https://wa.me/5541987249685">Falar no WhatsApp</a>`;
//   }

//   const cursosPorUnidade = {};
//   cursos.forEach((curso) => {
//     const unidade = curso.cidade;
//     if (!cursosPorUnidade[unidade]) {
//       cursosPorUnidade[unidade] = [];
//     }
//     cursosPorUnidade[unidade].push(curso);
//   });

//   let resposta = `Oi ${nome}! \n😊 Encontrei alguns cursos`;
//   if (filtros.modalidade) resposta += ` ${filtros.modalidade}`;
//   resposta += ` disponíveis pra você em Curitiba:

// `;

//   let cursosMostrados = 0;
//   const maxCursos = 8;

//   for (const [unidade, cursosUnidade] of Object.entries(cursosPorUnidade)) {
//     if (cursosMostrados >= maxCursos) break;

//     resposta += `📍 ${unidade}:
// `;

//     const cursosParaMostrar = cursosUnidade.slice(
//       0,
//       Math.min(3, maxCursos - cursosMostrados)
//     );
//     cursosParaMostrar.forEach((curso) => {
//       const nomeCurso =
//         curso.nome_curso || curso.curso || "Curso não identificado";
//       const turnoCurso = curso.turno || "Turno não informado";
//       const valor = curso.valor_curso
//         ? `R$ ${parseFloat(curso.valor_curso).toLocaleString("pt-BR", {
//             minimumFractionDigits: 2,
//           })}`
//         : "Valor a consultar";

//       resposta += `🔹 ${nomeCurso} – ${turnoCurso} – ${valor}
// `;
//       cursosMostrados++;
//     });

//     if (cursosUnidade.length > cursosParaMostrar.length) {
//       resposta += `🔹 E mais ${
//         cursosUnidade.length - cursosParaMostrar.length
//       } curso(s)...
// `;
//     }
//     resposta += `
// `;
//   }

//   if (Object.keys(cursosPorUnidade).length > 1) {
//     resposta += `💡 Temos unidades no Boqueirão, Campus da Indústria, CIC e Dr. Celso Charuri.

// `;
//   }

//   resposta += `\n\nSe quiser, posso te ajudar com a pré-matrícula 👇
// \n👉 LINK_PRE_MATRICULA_COMPLETO

// \n\nOu, se preferir, fale direto com a gente no WhatsApp:
// \n💬 LINK_WHATSAPP_COMPLETO

// \n\nQual desses você gostaria de saber mais? 😊`;

//   return resposta;
// }

// function gerarResposta(resultado, filtros, nome) {
//   const { cursos } = resultado;

//   if (
//     filtros.cidade &&
//     filtros.cidade.toLowerCase() === "curitiba" &&
//     cursos.length > 0
//   ) {
//     return gerarRespostaCuritiba(cursos, filtros, nome);
//   }

//   if (cursos.length === 0) {
//     let resposta = `Oi ${nome}! 😊 Infelizmente não encontrei cursos disponíveis`;

//     if (filtros.curso) resposta += ` de ${filtros.curso}`;
//     if (filtros.cidade) resposta += ` em ${filtros.cidade}`;
//     if (filtros.modalidade) resposta += ` na modalidade ${filtros.modalidade}`;

//     resposta += `.

// 💡 Algumas sugestões:
// • Digite outros cursos de seu interesse
// • Consulte outras cidades próximas
// • Ou fale conosco para mais opções

// 📲 <a href="https://wa.me/5541987249685" target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>

// Qual desses você gostaria de saber mais? 😊`;

//     return resposta;
//   }

//   let resposta = `Oi ${nome}! 😊 Encontrei alguns cursos`;

//   if (filtros.modalidade) resposta += ` ${filtros.modalidade}`;
//   resposta += ` disponíveis pra você`;
//   if (filtros.cidade) resposta += ` em ${filtros.cidade}`;
//   resposta += `:

// `;

//   const cursosParaMostrar = cursos.slice(0, 6);
//   cursosParaMostrar.forEach((curso) => {
//     const nomeCurso =
//       curso.nome_curso || curso.curso || "Curso não identificado";
//     const turnoCurso = curso.turno || "Turno não informado";
//     const valor = curso.valor_curso
//       ? `R$ ${parseFloat(curso.valor_curso).toLocaleString("pt-BR", {
//           minimumFractionDigits: 2,
//         })}`
//       : "Valor a consultar";

//     resposta += `🔹 ${nomeCurso} – ${turnoCurso} – ${valor}
// `;
//   });

//   if (cursos.length > 6) {
//     resposta += `
// E mais ${cursos.length - 6} curso(s)...
// `;
//   }

//   resposta += `
// \n\nSe quiser, posso te ajudar com a pré-matrícula 👇
// \n👉 LINK_PRE_MATRICULA_COMPLETO

// \n\nOu, se preferir, fale direto com a gente no WhatsApp:
// \n💬 LINK_WHATSAPP_COMPLETO

// \n\nQual desses você gostaria de saber mais? 😊`;

//   return resposta;
// }

// // ============================================
// // 🔧 APLICAR LINKS
// // ============================================

// function aplicarLinks(
//   resposta,
//   nome,
//   email,
//   telefone,
//   curso,
//   cidade,
//   modalidade
// ) {
//   const linkInscricao = `https://www.senaipr.org.br/cursos-tecnicos/pre-matricula/`;

//   // ✅ CRIAR MENSAGEM WHATSAPP PERSONALIZADA
//   const mensagemWhatsApp = gerarMensagemWhatsAppContextualizada(
//     nome,
//     curso,
//     cidade
//   );
//   const linkWhatsapp = `https://wa.me/5541987249685?text=${encodeURIComponent(
//     mensagemWhatsApp
//   )}`;

//   console.log(`[LINKS] 🔗 Aplicando links...`);
//   console.log(`[LINKS] 📋 Link inscrição: ${linkInscricao}`);
//   console.log(`[LINKS] 📱 Link WhatsApp: ${linkWhatsapp.substring(0, 100)}...`);

//   // ✅ DEBUG - Verificar se os placeholders existem
//   const temPlaceholderPreMatricula = resposta.includes(
//     "LINK_PRE_MATRICULA_COMPLETO"
//   );
//   const temPlaceholderWhatsApp = resposta.includes("LINK_WHATSAPP_COMPLETO");

//   console.log(
//     `[LINKS] 📊 Placeholder pré-matrícula encontrado: ${temPlaceholderPreMatricula}`
//   );
//   console.log(
//     `[LINKS] 📊 Placeholder WhatsApp encontrado: ${temPlaceholderWhatsApp}`
//   );

//   // ✅ SUBSTITUIÇÕES COMPLETAS
//   let respostaProcessada = resposta
//     .replace(
//       /LINK_PRE_MATRICULA_COMPLETO/g,
//       `<a href="${linkInscricao}">Fazer pré-matrícula</a>`
//     )
//     .replace(
//       /LINK_WHATSAPP_COMPLETO/g,
//       `<a href="${linkWhatsapp}">Abrir WhatsApp</a>`
//     );

//   // ✅ FALLBACK - Se ainda existirem placeholders antigos, substituir também
//   respostaProcessada = respostaProcessada
//     .replace(/LINK_PRE_MATRICULA/g, linkInscricao)
//     .replace(/LINK_WHATSAPP/g, linkWhatsapp);

//   console.log(`[LINKS] ✅ Links aplicados com sucesso`);
//   console.log(`[LINKS] 📏 Resposta original: ${resposta.length} chars`);
//   console.log(`[LINKS] 📏 Resposta processada: ${respostaProcessada.length} chars`);

//   // ✅ DEBUG - Mostrar parte da resposta processada
//   console.log(
//     `[LINKS] 🔍 Parte da resposta: ${respostaProcessada.substring(
//       respostaProcessada.length - 200
//     )}`
//   );

//   return respostaProcessada;
// }

// // ============================================
// // LINK CLICAVEIS
// // ============================================

// function tornarLinksClicaveis(texto) {
//   if (!texto) return texto;

//   return (
//     texto
//       // Apenas links básicos, sem atributos extras
//       .replace(/(https:\/\/wa\.me\/[^\s]+)/g, '<a href="$1">Abrir WhatsApp</a>')
//       .replace(
//         /(https:\/\/[^\/]*senaipr[^\/]*\/[^\s]*pre-matricula[^\s]*)/g,
//         '<a href="$1">Fazer Pré-matrícula</a>'
//       )
//       .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">Clique aqui</a>')
//   );
// }

// // respostaFinal = tornarLinksClicaveis(respostaFinal);

// // ============================================
// // 🔍 EXTRAÇÃO DE FILTROS HEURÍSTICA
// // ============================================

// function extrairFiltrosHeuristico(message) {
//   const CIDADES_MELHORADO = {
//     // Curitiba e variações
//     curitiba: "Curitiba",
//     cwb: "Curitiba",
//     ctba: "Curitiba",

//     // Unidades específicas de Curitiba
//     boqueirão: "Boqueirão",
//     boqueirao: "Boqueirão",
//     "campus da indústria": "Campus da Indústria",
//     "campus da industria": "Campus da Indústria",
//     cic: "CIC",
//     centro: "Centro - Curitiba",

//     // Outras cidades
//     "ponta grossa": "Ponta Grossa",
//     pg: "Ponta Grossa",
//     londrina: "Londrina",
//     maringá: "Maringá",
//     maringa: "Maringá",
//     cascavel: "Cascavel",
//     palmas: "Palmas",
//     "foz do iguaçu": "Foz do Iguaçu",
//     foz: "Foz do Iguaçu",
//     guarapuava: "Guarapuava",
//     paranavaí: "Paranavaí",
//     paranavai: "Paranavaí",
//     colombo: "Colombo",
//     "são josé dos pinhais": "São José dos Pinhais",
//     "sao jose dos pinhais": "São José dos Pinhais",

//     // ✅ ADICIONAR IRATI E OUTRAS CIDADES FALTANTES
//     irati: "Irati",
//     "união da vitória": "União da Vitória",
//     "uniao da vitoria": "União da Vitória",
//     apucarana: "Apucarana",
//     toledo: "Toledo",
//     umuarama: "Umuarama",
//     "campo mourão": "Campo Mourão",
//     "campo mourao": "Campo Mourão",
//     paranaguá: "Paranaguá",
//     paranagua: "Paranaguá",
//     "são mateus do sul": "São Mateus do Sul",
//     "sao mateus do sul": "São Mateus do Sul",
//     telêmaco: "Telêmaco Borba",
//     "telemaco borba": "Telêmaco Borba",
//     jacarezinho: "Jacarezinho",
//     cornélio: "Cornélio Procópio",
//     "cornelio procopio": "Cornélio Procópio",
//   };

//   const CURSOS_PATTERNS = {
//     "desenvolvimento de sistemas":
//       /desenvolvimento\s*(de\s*)?sistemas?|programação|programacao|informatica|informática|\bti\b|\bds\b|software|sistemas/i,
//     eletrônica: /eletrônica|eletronica|eletrica|elétrica/i,
//     mecânica: /mecânica|mecanica|manutenção|manutencao|usinagem|soldagem/i,
//     "automação industrial": /automação|automacao|controle|instrumentacao/i,
//     enfermagem: /enfermagem|saude|saúde/i,
//     administração: /administração|administracao|gestao|gestão/i,
//     logística: /logística|logistica|transporte/i,
//     "segurança do trabalho":
//       /segurança|seguranca|seguranca\s*do\s*trabalho|\bsst\b/i,
//     química: /química|quimica|laboratorio|laboratório/i,
//     "redes de computadores": /redes|rede|computadores|networking/i,
//   };

//   const lower = message
//     .toLowerCase()
//     .normalize("NFD")
//     .replace(/[\u0300-\u036f]/g, "");
//   console.log(`[HEURISTICA] Processando: "${lower}"`);

//   // Extrair modalidade
//   let modalidade = "";
//   if (/\b(ead|online|remoto|distancia|a\s*distancia|virtual)\b/.test(lower)) {
//     modalidade = "EAD";
//   } else if (/\b(presencial|presenciais|sala\s*de\s*aula)\b/.test(lower)) {
//     modalidade = "Presencial";
//   }

//   // Buscar cidade
//   let cidade = "";
//   let melhorMatch = "";

//   for (const [chave, valor] of Object.entries(CIDADES_MELHORADO)) {
//     if (lower.includes(chave) && chave.length > melhorMatch.length) {
//       cidade = valor;
//       melhorMatch = chave;
//     }
//   }

//   // Segundo: busca por inclusão (fallback)
//   if (!cidade) {
//     for (const [chave, valor] of Object.entries(CIDADES_MELHORADO)) {
//       if (lower.includes(chave) && chave.length > melhorMatch.length) {
//         cidade = valor;
//         melhorMatch = chave;
//       }
//     }
//   }

//   // Buscar curso
//   let curso = "";
//   for (const [nomeCurso, pattern] of Object.entries(CURSOS_PATTERNS)) {
//     if (pattern.test(message)) {
//       curso = nomeCurso;
//       break;
//     }
//   }

//   const resultado = { curso, cidade, modalidade };
//   console.log(`[HEURISTICA] Extraído:`, resultado);
//   return resultado;
// }

// // ============================================
// // 📝 SISTEMA DE LOG
// // ============================================

// async function logInteracao(email, mensagem, resposta, metadata = {}) {
//   try {
//     const logEntry = {
//       timestamp: new Date().toISOString(),
//       email,
//       mensagem: mensagem.substring(0, 500),
//       resposta: resposta.substring(0, 1000),
//       metadata,
//     };

//     const logString =
//       `\n[${logEntry.timestamp}] ${email}\n` +
//       `MSG: ${logEntry.mensagem}\n` +
//       `RSP: ${logEntry.resposta}\n` +
//       `META: ${JSON.stringify(logEntry.metadata)}\n` +
//       `${"=".repeat(80)}\n`;

//     fs.appendFile("chat.log", logString, (err) => {
//       if (err) console.warn("[LOG] Erro ao escrever log:", err);
//     });
//   } catch (error) {
//     console.warn("[LOG] Erro no sistema de log:", error);
//   }
// }

// // ============================================
// // 🎯 CONTROLADOR PRINCIPAL
// // ============================================

// export async function chatController(req, res) {
//   try {
//     const message = req.body.message?.trim();
//     const email = req.email;

//     console.log(`[CHAT] Nova mensagem de ${email}: "${message}"`);

//     if (!message) {
//       return res.status(400).json({
//         error: "Mensagem não pode estar vazia.",
//         code: "MISSING_MESSAGE",
//       });
//     }

//      // ✅ VALIDAÇÃO DE EMAIL (apenas para /api/chat)
//     if (!email) {
//       return res.status(400).json({
//         error: "Email do usuário não informado.",
//         code: "MISSING_EMAIL",
//       });
//     }

//     const [[lead]] = await pool.query(
//       "SELECT nome, telefone, cidade FROM leads WHERE email = ?",
//       [email]
//     );

//     const nome = lead?.nome || "amigo(a)";
//     const telefone = lead?.telefone || "";
//     const cidade_lead = lead?.cidade || ""; // Nova variavel aplicada no primeiro filtro

//     console.log(
//       `[CHAT] Lead encontrado: ${nome} (${telefone}) - Cidade: ${cidade_lead}`
//     ); // <- Adicionado log da cidade do lead

//     // Verificar pergunta sobre descrição
//     if (detectarPerguntaDescricao && detectarPerguntaDescricao(message)) {
//       console.log(`[CHAT] 📖 Pergunta sobre descrição detectada`);

//       const nomeCurso = extrairNomeCursoDaPergunta(message);

//       if (nomeCurso) {
//         console.log(`[CHAT] 🎯 Curso extraído: "${nomeCurso}"`);

//         const descricao = buscarDescricaoCurso(nomeCurso);

//         if (descricao) {
//           const respostaCompletaRaw = `${descricao}

// ✨ **Ficou interessado(a)?**

// O SENAI Paraná é referência nacional em educação profissional! 🏆

// 📍 **Próximos passos:**
// • 📋 **Pré-matrícula:** https://www.senaipr.org.br/cursos-tecnicos/pre-matricula/
// • 📲 **WhatsApp:** https://wa.me/5541987249685?text=${encodeURIComponent(
//             `Olá! Tenho interesse no curso de ${nomeCurso}. Poderia me ajudar?`
//           )}

// 💡 **Dica:** As vagas são limitadas! Não perca essa oportunidade! 🚀`;

//           const respostaCompleta = formatChatbotResponse(respostaCompletaRaw);

//           await pool.query(
//             `INSERT INTO messages (user_id, user_message, bot_response, nome, email, telefone, curso, cidade, modalidade)
//              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//             [
//               null,
//               message,
//               respostaCompleta,
//               nome,
//               email,
//               telefone,
//               nomeCurso,
//               "descrição solicitada",
//               "N/A",
//             ]
//           );

//           await logInteracao(email, message, respostaCompleta, {
//             curso: nomeCurso,
//             tipo: "descrição",
//           });

//           console.log(`[CHAT] ✅ Descrição retornada para: ${nomeCurso}`);
//           return res.status(200).json({ reply: respostaCompleta });
//         }
//       }

//       console.log(`[CHAT] ⚠️ Descrição não encontrada, usando fluxo normal`);
//     }

//     // Extração de filtros
//     let filtros = {};
//     try {
//       filtros = (await extrairFiltrosDeTexto(message)) || {};
//       console.log(`[CHAT] 🤖 Filtros OpenAI:`, filtros);
//     } catch (error) {
//       console.warn(`[CHAT] ⚠️ Erro OpenAI, usando heurística:`, error.message);
//       filtros = {};
//     }

//     const filtrosHeuristicos = extrairFiltrosHeuristico(message);

//     const filtrosFinal = {
//       curso: filtros.curso || filtrosHeuristicos.curso || "",
//       cidade: filtros.cidade || filtrosHeuristicos.cidade || "",
//       modalidade: filtros.modalidade || filtrosHeuristicos.modalidade || "",
//     };

//     console.log(`[CHAT] 🎯 Filtros finais:`, filtrosFinal);

//     const curso = filtrosFinal.curso;
//     const cidade = filtrosFinal.cidade
//       ? normalizarCidade(filtrosFinal.cidade)
//       : "";
//     const modalidade = filtrosFinal.modalidade
//       ? normalizarModalidade(filtrosFinal.modalidade)
//       : "";

//     let respostaFinal = "";

//     // Processamento principal
//     if (curso || cidade || modalidade) {
//       console.log(`[CHAT] 🔍 Usando sistema de filtros`);

//       try {
//         const dicionario = await construirDicionarioPorCidade();

//         // Debug para Curitiba
//         if (cidade && cidade.toLowerCase() === "curitiba") {
//           console.log(`[DEBUG] Verificando estrutura para Curitiba...`);
//           const unidadesCuritiba = [
//             "Boqueirão",
//             "Campus da Indústria",
//             "CIC",
//             "Dr. Celso Charuri",
//           ];
//           unidadesCuritiba.forEach((unidade) => {
//             if (dicionario[unidade]) {
//               console.log(
//                 `[DEBUG] ✅ ${unidade}: ${dicionario[unidade].length} cursos`
//               );
//             } else {
//               console.log(`[DEBUG] ❌ ${unidade}: NÃO ENCONTRADA`);
//             }
//           });
//         }

//         const resultado = filtrarCursosOtimizado(
//           dicionario,
//           { curso, cidade, modalidade },
//           message
//         );

//         // Verificar resposta especial de Curitiba
//         if (resultado.info?.mostrarOpcoesCuritiba) {
//           const respostaEspecial = resultado.info.respostaEspecialCuritiba;

//           await pool.query(
//             "INSERT INTO messages (user_id, user_message, bot_response, nome, email, telefone, curso, cidade, modalidade) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
//             [
//               null,
//               message,
//               respostaEspecial,
//               nome,
//               email,
//               telefone,
//               "consulta curitiba",
//               "opções especiais",
//               "N/A",
//             ]
//           );

//           await logInteracao(email, message, respostaEspecial, {
//             tipo: "curitiba_opcoes",
//           });
//           return res.status(200).json({ reply: respostaEspecial });
//         }

//         const respostaRaw = gerarResposta(
//           resultado,
//           { curso, cidade, modalidade },
//           nome
//         );

//         // SEMPRE aplicar os links, mesmo se não tiver cursos
//         const respostaCompleta = aplicarLinks(
//           respostaRaw,
//           nome,
//           email,
//           telefone,
//           curso,
//           cidade,
//           modalidade
//         );

//         respostaFinal = formatChatbotResponse(respostaCompleta);
//       } catch (error) {
//         console.error(`[CHAT] ❌ Erro no filtro, usando ChatGPT:`, error);
//         const respostaRaw = await getChatResponse(message, email);
//         respostaFinal = formatChatbotResponse(respostaRaw);
//       }
//     } else {
//       console.log(`[CHAT] 🤖 Usando ChatGPT`);
//       const respostaRaw = await getChatResponse(message, email);
//       respostaFinal = formatChatbotResponse(respostaRaw);
//     }

//     // Salvar no banco e log
//     await pool.query(
//       `INSERT INTO messages (user_id, user_message, bot_response, nome, email, telefone, curso, cidade, modalidade)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         null,
//         message,
//         respostaFinal,
//         nome,
//         email,
//         telefone,
//         curso || "não informado",
//         cidade || "não informado",
//         modalidade || "não informado",
//       ]
//     );

//     await logInteracao(email, message, respostaFinal, {
//       curso,
//       cidade,
//       modalidade,
//     });

//     console.log(`[CHAT] ✅ Resposta gerada (${respostaFinal.length} chars)`);

//     return res.status(200).json({ reply: respostaFinal });
//   } catch (error) {
//     console.error(`[CHAT] ❌ Erro geral:`, error);

//     await logInteracao(
//       req.email || "unknown",
//       req.body.message || "",
//       `ERRO: ${error.message}`,
//       {
//         erro: true,
//         cidade_lead: cidade_lead || "não informado", // ← ADICIONAR ao metadata
//       }
//     );

//     return res.status(500).json({
//       error: "Erro ao processar a mensagem. Por favor, tente novamente.",
//       code: "INTERNAL_SERVER_ERROR",
//     });
//   }
// }

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> NOVA VERSÃO TESTE 30/06/2025 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// import {
//   getChatResponse,
//   extrairFiltrosDeTexto,
//   detectarPerguntaDescricao,
//   extrairNomeCursoDaPergunta,
//   buscarDescricaoCurso,
// } from "../services/openai.service.js";
// import {
//   normalizarCidade,
//   normalizarModalidade,
// } from "../utils/normalizacao.js";
// import pool from "../config/db.js";
// import fs from "fs";
// import { construirDicionarioPorCidade } from "../utils/carregarCursoCsv.js";

// // ============================================
// // 🔧 FORMATAÇÃO E LIMPEZA
// // ============================================

// function formatChatbotResponse(rawResponse) {
//   if (!rawResponse) return rawResponse;

//   return (
//     rawResponse
//       // Estruturar quebras importantes
//       .replace(/(\n📍|\n👉|\n💬|\n🎯|\n✨)/g, "\n\n$1") // Dupla quebra antes de seções
//       .replace(/(\n• )/g, "\n$1") // Manter quebra simples para listas
//       .replace(/\n{3,}/g, "\n\n") // Max 2 quebras
//       .replace(/[ \t]+/g, " ") // Normalizar espaços
//       .replace(/\n\s+/g, "\n") // Limpar espaços após quebras
//       .trim()
//   );
// }

// // ============================================
// // 🏢 MAPEAMENTO CURITIBA - UNIDADES
// // ============================================

// const UNIDADES_CURITIBA = {
//   Boqueirão: true,
//   "Campus da Indústria": true,
//   CIC: true,
//   "Dr. Celso Charuri": true,
// };

// function ehUnidadeCuritiba(cidade) {
//   return UNIDADES_CURITIBA[cidade] === true;
// }

// function formatarCidadeParaFormulario(cidadeOriginal) {
//   return ehUnidadeCuritiba(cidadeOriginal)
//     ? `Curitiba - ${cidadeOriginal}`
//     : cidadeOriginal;
// }

// function gerarMensagemWhatsAppContextualizada(nome, curso, cidade) {
//   // ✅ SEMPRE RETORNAR LINK SIMPLES
//   return `https://wa.me/5541987249685`;
// }

// // ============================================
// // 🔍 SISTEMA DE FILTROS
// // ============================================

// function verificarCuritibaGenerica(userMessage, cidade) {
//   const msgLower = userMessage.toLowerCase();

//   const mencionaCuritiba = ["curitiba", "cwb", "ctba"].some((variacao) =>
//     msgLower.includes(variacao)
//   );

//   const unidadesCuritiba = [
//     "boqueirão",
//     "boqueirao",
//     "campus da indústria",
//     "campus da industria",
//     "cic",
//     "dr. celso charuri",
//     "dr celso charuri",
//     "celso charuri",
//   ];

//   const mencionaUnidadeEspecifica = unidadesCuritiba.some((unidade) =>
//     msgLower.includes(unidade)
//   );

//   return mencionaCuritiba && !mencionaUnidadeEspecifica;
// }

// function buscarCursosEmCuritiba(dicionario) {
//   const unidadesCuritiba = [
//     "Boqueirão",
//     "Campus da Indústria",
//     "CIC",
//     "Dr. Celso Charuri",
//   ];
//   let cursosEncontrados = [];

//   console.log(`[CURITIBA] Buscando em unidades:`, unidadesCuritiba);

//   for (const unidade of unidadesCuritiba) {
//     if (dicionario[unidade]) {
//       cursosEncontrados.push(...dicionario[unidade]);
//       console.log(
//         `[CURITIBA] Encontrados ${dicionario[unidade].length} cursos em ${unidade}`
//       );
//     } else {
//       console.log(
//         `[CURITIBA] ⚠️ Unidade ${unidade} não encontrada no dicionário`
//       );
//     }
//   }

//   console.log(
//     `[CURITIBA] Total de cursos encontrados: ${cursosEncontrados.length}`
//   );
//   return cursosEncontrados;
// }

// function filtrarCursosOtimizado(dicionario, filtros, userMessage = "") {
//   const { cidade, curso, modalidade } = filtros;
//   console.log(`[FILTRO] Iniciando com:`, { cidade, curso, modalidade });

//   let cursosEncontrados = [];

//   // Verificar busca genérica por Curitiba
//   const ehBuscaCuritibaGenerica = verificarCuritibaGenerica(
//     userMessage,
//     cidade
//   );

//   if (ehBuscaCuritibaGenerica) {
//     console.log(`[FILTRO] 🏢 Detectada busca genérica por Curitiba`);

//     if (!curso) {
//       return {
//         cursos: [],
//         info: {
//           mostrarOpcoesCuritiba: true,
//           respostaEspecialCuritiba: `Ótimo! 😊

// Em Curitiba temos 4 unidades do SENAI:

// 📍 Boqueirão
// 📍 Campus da Indústria
// 📍 CIC - Cidade Industrial
// 📍 Centro

// Qual fica mais próxima de você?

// Cada unidade tem cursos e horários diferentes! Me diga sua preferência para informações específicas.

// 📲 WhatsApp: https://wa.me/5541987249685
// 🌐 Site: https://www.senaipr.org.br/cursos-tecnicos/

// 🎯`,
//         },
//       };
//     }

//     cursosEncontrados = buscarCursosEmCuritiba(dicionario);
//   }
//   // Busca normal por cidade específica
//   else if (cidade && dicionario[cidade]) {
//     cursosEncontrados = [...dicionario[cidade]];
//     console.log(`[FILTRO] ${cursosEncontrados.length} cursos em ${cidade}`);
//   }
//   // Busca por "Curitiba" diretamente
//   else if (cidade && cidade.toLowerCase() === "curitiba") {
//     console.log(`[FILTRO] 🏢 Busca direta por Curitiba`);
//     cursosEncontrados = buscarCursosEmCuritiba(dicionario);
//   }
//   // Busca flexível por cidades similares
//   else if (cidade) {
//     for (const [cidadeDict, cursosDict] of Object.entries(dicionario)) {
//       const cityLower = cidadeDict
//         .toLowerCase()
//         .normalize("NFD")
//         .replace(/[\u0300-\u036f]/g, "");
//       const searchLower = cidade
//         .toLowerCase()
//         .normalize("NFD")
//         .replace(/[\u0300-\u036f]/g, "");

//       if (cityLower.includes(searchLower) || searchLower.includes(cityLower)) {
//         cursosEncontrados.push(...cursosDict);
//         console.log(
//           `[FILTRO] Incluindo cursos de ${cidadeDict} (busca por ${cidade})`
//         );
//       }
//     }
//   }
//   // Busca em todas as cidades
//   else {
//     cursosEncontrados = Object.values(dicionario).flat();
//     console.log(
//       `[FILTRO] ${cursosEncontrados.length} cursos em todas as cidades`
//     );
//   }

//   // Filtro de curso
//   if (curso) {
//     const cursosAntes = cursosEncontrados.length;
//     cursosEncontrados = cursosEncontrados.filter((c) => {
//       const nomeCurso = (c.nome_curso || c.curso || "").toLowerCase();
//       const cursoLower = curso.toLowerCase();

//       return (
//         nomeCurso.includes(cursoLower) ||
//         cursoLower.includes(nomeCurso) ||
//         nomeCurso
//           .split(" ")
//           .some((palavra) => cursoLower.includes(palavra) && palavra.length > 2)
//       );
//     });
//     console.log(
//       `[FILTRO] ${cursosEncontrados.length} após filtro de curso (era ${cursosAntes})`
//     );
//   }

//   // Filtro de modalidade
//   if (modalidade) {
//     const cursosAntes = cursosEncontrados.length;
//     cursosEncontrados = cursosEncontrados.filter((c) => {
//       const modalidadeCurso = (c.modalidade || "").toLowerCase();
//       const modalidadeLower = modalidade.toLowerCase();

//       return (
//         modalidadeCurso.includes(modalidadeLower) ||
//         modalidadeLower.includes(modalidadeCurso)
//       );
//     });
//     console.log(
//       `[FILTRO] ${cursosEncontrados.length} após filtro de modalidade (era ${cursosAntes})`
//     );
//   }

//   // Remover duplicatas
//   const cursosUnicos = cursosEncontrados.filter((curso, index, array) => {
//     // Criar chave única baseada em múltiplos campos
//     const chaveUnica = [
//       (curso.nome_curso || curso.curso || "").trim().toLowerCase(),
//       (curso.cidade || "").trim(),
//       (curso.modalidade || "").trim().toLowerCase(),
//       (curso.turno || "").trim().toLowerCase(),
//     ].join("|");

//     // Verificar se é a primeira ocorrência desta chave
//     const primeiraOcorrencia = array.findIndex((c) => {
//       const chaveComparacao = [
//         (c.nome_curso || c.curso || "").trim().toLowerCase(),
//         (c.cidade || "").trim(),
//         (c.modalidade || "").trim().toLowerCase(),
//         (c.turno || "").trim().toLowerCase(),
//       ].join("|");
//       return chaveComparacao === chaveUnica;
//     });

//     return index === primeiraOcorrencia;
//   });

//   // ✅ LOG DETALHADO DE DUPLICATAS
//   const duplicatasRemovidas = cursosEncontrados.length - cursosUnicos.length;
//   if (duplicatasRemovidas > 0) {
//     console.log(`[FILTRO] ⚠️ Removidas ${duplicatasRemovidas} duplicatas`);

//     // Debug: mostrar algumas duplicatas removidas
//     const duplicatas = cursosEncontrados.filter((curso, index, array) => {
//       const chaveUnica = [
//         (curso.nome_curso || curso.curso || "").trim().toLowerCase(),
//         curso.cidade || "",
//         (curso.modalidade || "").trim().toLowerCase(),
//         (curso.turno || "").trim().toLowerCase(),
//       ].join("|");

//       const primeiraOcorrencia = array.findIndex((c) => {
//         const chaveComparacao = [
//           (c.nome_curso || c.curso || "").trim().toLowerCase(),
//           c.cidade || "",
//           (c.modalidade || "").trim().toLowerCase(),
//           (c.turno || "").trim().toLowerCase(),
//         ].join("|");
//         return chaveComparacao === chaveUnica;
//       });

//       return index !== primeiraOcorrencia;
//     });

//     console.log(
//       `[FILTRO] 📊 Exemplos de duplicatas removidas:`,
//       duplicatas.slice(0, 3).map((d) => ({
//         nome: d.nome_curso || d.curso,
//         cidade: d.cidade,
//         modalidade: d.modalidade,
//         turno: d.turno,
//       }))
//     );
//   }

//   console.log(`[FILTRO] ${cursosUnicos.length} cursos únicos finais`);

//   return {
//     cursos: cursosUnicos,
//     info: {
//       cidadeEncontrada: cidade,
//       totalCursos: cursosUnicos.length,
//       duplicatasRemovidas,
//       modalidadesDisponiveis: [
//         ...new Set(cursosUnicos.map((c) => c.modalidade)),
//       ],
//       cidadesDisponiveis: [...new Set(cursosUnicos.map((c) => c.cidade))],
//     },
//   };
// }

// // ============================================
// // 🎨 GERAÇÃO DE RESPOSTAS
// // ============================================
// function gerarRespostaCuritiba(cursos, filtros, nome) {
//   if (cursos.length === 0) {
//     return `Oi ${nome}! 😊

// Não encontrei cursos disponíveis em Curitiba com esses filtros.

// 💡 Que tal tentar outras modalidades?

// 📲 WhatsApp: https://wa.me/5541987249685
// 🌐 Pré-matrícula: https://www.senaipr.org.br/cursos-tecnicos/pre-matricula/`;
//   }

//   const cursosPorUnidade = {};
//   cursos.forEach((curso) => {
//     const unidade = curso.cidade;
//     if (!cursosPorUnidade[unidade]) {
//       cursosPorUnidade[unidade] = [];
//     }
//     cursosPorUnidade[unidade].push(curso);
//   });

//   let resposta = `Oi ${nome}! 😊

// Encontrei cursos disponíveis em Curitiba:

// `;
//   if (filtros.modalidade) resposta += ` ${filtros.modalidade}`;
//   resposta += ` disponíveis pra você em Curitiba:\n\n`;

//   let cursosMostrados = 0;
//   const maxCursos = 6;

//   for (const [unidade, cursosUnidade] of Object.entries(cursosPorUnidade)) {
//     if (cursosMostrados >= maxCursos) break;

//     resposta += `📍 **${unidade}**\n`;

//     const cursosParaMostrar = cursosUnidade.slice(
//       0,
//       Math.min(3, maxCursos - cursosMostrados)
//     );
//     cursosParaMostrar.forEach((curso) => {
//       const nomeCurso =
//         curso.nome_curso || curso.curso || "Curso não identificado";
//       const turnoCurso = curso.turno || "Turno não informado";

//       //  Só mostrar valor se existir
//       const temValor = curso.valor_curso && parseFloat(curso.valor_curso) > 0;

//       if (temValor) {
//         const valor = `R$ ${parseFloat(curso.valor_curso).toLocaleString(
//           "pt-BR",
//           {
//             minimumFractionDigits: 2,
//           }
//         )}`;
//         resposta += `• ${nomeCurso} - ${turnoCurso} - ${valor}\n`;
//       } else {
//         // Sem valor: mostrar apenas nome e turno
//         resposta += `• ${nomeCurso} - ${turnoCurso}\n`;
//       }

//       cursosMostrados++;
//     });

//     if (cursosUnidade.length > cursosParaMostrar.length) {
//       resposta += `• E mais ${
//         cursosUnidade.length - cursosParaMostrar.length
//       } curso(s)...\n`;
//     }
//     resposta += `\n`;
//   }

//   if (Object.keys(cursosPorUnidade).length > 1) {
//     resposta += `💡 Temos unidades no Boqueirão, Campus da Indústria, CIC e Dr. Celso Charuri.\n\n`;
//   }

//   resposta += `Se quiser, posso te ajudar com a pré-matrícula 👇\n`;
//   resposta += `👉 <a href="LINK_PRE_MATRICULA">Fazer pré-matrícula</a>\n\n`;
//   resposta += `Ou, se preferir, fale direto com a gente no WhatsApp:\n`;
//   resposta += `💬 <a href="LINK_WHATSAPP">Abrir WhatsApp</a>\n\n`;
//   resposta += `Qual desses você gostaria de saber mais? 😊`;

//   return resposta;
// }

// function gerarResposta(resultado, filtros, nome) {
//   const { cursos } = resultado;

//   if (
//     filtros.cidade &&
//     filtros.cidade.toLowerCase() === "curitiba" &&
//     cursos.length > 0
//   ) {
//     return gerarRespostaCuritiba(cursos, filtros, nome);
//   }
//   if (cursos.length === 0) {
//     let resposta = `Oi ${nome}! 😊 Infelizmente não encontrei cursos disponíveis`;

//     if (filtros.curso) resposta += ` de ${filtros.curso}`;
//     if (filtros.cidade) resposta += ` em ${filtros.cidade}`;
//     if (filtros.modalidade) resposta += ` na modalidade ${filtros.modalidade}`;

//     resposta += `.\n\n`;
//     resposta += `💡 Algumas sugestões:\n`;
//     resposta += `• Digite outros cursos de seu interesse\n`;
//     resposta += `• Consulte outras cidades próximas\n`;
//     resposta += `• Ou fale conosco para mais opções\n\n`;
//     resposta += `📲 <a href="https://wa.me/5541987249685">Falar no WhatsApp</a>`;
//     resposta += `Qual desses você gostaria de saber mais? 😊`;

//     return resposta;
//   }

//   let resposta = `Oi ${nome}! 😊 Encontrei alguns cursos`;

//   if (filtros.modalidade) resposta += ` ${filtros.modalidade}`;
//   resposta += ` disponíveis pra você`;
//   if (filtros.cidade) resposta += ` em ${filtros.cidade}`;
//   resposta += `:\n\n`;

//   const cursosParaMostrar = cursos.slice(0, 6);
//   cursosParaMostrar.forEach((curso) => {
//     const nomeCurso =
//       curso.nome_curso || curso.curso || "Curso não identificado";
//     const turnoCurso = curso.turno || "Turno não informado";

//     // CORREÇÃO: Só mostrar valor se existir
//     const temValor = curso.valor_curso && parseFloat(curso.valor_curso) > 0;

//     if (temValor) {
//       const valor = `R$ ${parseFloat(curso.valor_curso).toLocaleString(
//         "pt-BR",
//         {
//           minimumFractionDigits: 2,
//         }
//       )}`;
//       resposta += `🔹 ${nomeCurso} – ${turnoCurso} – ${valor}\n`;
//     } else {
//       // Sem valor: mostrar apenas nome e turno
//       resposta += `🔹 ${nomeCurso} – ${turnoCurso}\n`;
//     }
//   });

//   if (cursos.length > 6) {
//     resposta += `\nE mais ${cursos.length - 6} curso(s)...\n`;
//   }

//   resposta += `\nSe quiser, posso te ajudar com a pré-matrícula 👇\n`;
//   resposta += `👉 <a href="LINK_PRE_MATRICULA">Fazer pré-matrícula</a>\n\n`;
//   resposta += `Ou, se preferir, fale direto com a gente no WhatsApp:\n`;
//   resposta += `💬 <a href="LINK_WHATSAPP">Abrir WhatsApp</a>\n\n`;
//   resposta += `Qual desses você gostaria de saber mais? 😊`;

//   console.log("📝 [GERAR] === RESPOSTA GERADA ===");
//   console.log("📝 [GERAR] Resposta completa:", resposta);
//   console.log("📝 [GERAR] Contém <a href=\"LINK_PRE_MATRICULA\">:", resposta.includes('<a href="LINK_PRE_MATRICULA">'));
//   console.log("📝 [GERAR] Contém <a href=\"LINK_WHATSAPP\">:", resposta.includes('<a href="LINK_WHATSAPP">'));
//   console.log("📝 [GERAR] === FIM RESPOSTA GERADA ===");

//   return resposta;
// }
// // ============================================
// // 🔧 APLICAR LINKS
// // ============================================

// function aplicarLinks(resposta, nome, email, telefone, curso, cidade, modalidade) {
//   console.log("🔗 [DEBUG] === INICIANDO aplicarLinks ===");
//   console.log("🔗 [DEBUG] Resposta ANTES:", resposta.substring(0, 200));
//   console.log("🔗 [DEBUG] Contém LINK_PRE_MATRICULA:", resposta.includes("LINK_PRE_MATRICULA"));
//   console.log("🔗 [DEBUG] Contém LINK_WHATSAPP:", resposta.includes("LINK_WHATSAPP"));

//   // Como agora usamos URLs diretas, esta função só garante que não há placeholders
//   return resposta
//     .replace(
//       /LINK_PRE_MATRICULA/g,
//       "https://www.senaipr.org.br/cursos-tecnicos/pre-matricula/"
//     )
//     .replace(/LINK_WHATSAPP/g, "https://wa.me/5541987249685");
// }

// function gerarLinksInteligentes(nome, email, telefone, cidadeLead, nomeCurso) {
//   // Se tem dados do lead autenticado, gerar links personalizados
//   if (email & nome & telefone) {
//     console.log(`[LINKS] Usuario autenticado - direcionando para formulário`);

//     const paramatros = new URLSearchParams({
//       nome: nome,
//       email: email,
//       telefone: telefone,
//       cidade: cidadeLead || "",
//       curso: nomeCurso || "",
//       origem: "chatbot_descricao",
//     });

//     const linkFormulario = `https://www.senaipr.org.br/cursos-tecnicos/pre-matricula/?${paramatros.toString()}`;

//     return {
//       linkPrincipal: linkFormulario,
//       textoPrincipal: "Fazer pré-matrícula",
//       tipoLink: "formulario",
//       textoSecundario:
//         "Seus dados já estão preenchidos! É só confirmar e enviar.",
//     };
//   }

//   // Se não tem dados (público) → WhatsApp SIMPLES
//   else {
//     console.log(`[LINKS] 📱 Usuário público - direcionando para WhatsApp`);

//     // ✅ LINK SIMPLES - SEM CONTEXTO
//     const linkWhatsApp = `https://wa.me/5541987249685`;

//     return {
//       linkPrincipal: linkWhatsApp,
//       textoPrincipal: "Falar no WhatsApp",
//       tipoLink: "whatsapp",
//       textoSecundario: "Converse com nossos especialistas 💬",
//     };
//   }
// }

// // ============================================
// // LINK CLICAVEIS
// // ============================================

// function tornarLinksClicaveis(texto) {
//   if (!texto) return texto;

//   return (
//     texto
//       // Apenas links básicos, sem atributos extras
//       .replace(/(https:\/\/wa\.me\/[^\s]+)/g, '<a href="$1">Abrir WhatsApp</a>')
//       .replace(
//         /(https:\/\/[^\/]*senaipr[^\/]*\/[^\s]*pre-matricula[^\s]*)/g,
//         '<a href="$1">Fazer Pré-matrícula</a>'
//       )
//       .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">Clique aqui</a>')
//   );
// }

// // respostaFinal = tornarLinksClicaveis(respostaFinal);

// // ============================================
// // 🔍 EXTRAÇÃO DE FILTROS HEURÍSTICA
// // ============================================

// function extrairFiltrosHeuristico(message) {
//   const CIDADES_MELHORADO = {
//     // Curitiba e variações
//     curitiba: "Curitiba",
//     cwb: "Curitiba",
//     ctba: "Curitiba",

//     // Unidades específicas de Curitiba
//     boqueirão: "Boqueirão",
//     boqueirao: "Boqueirão",
//     "campus da indústria": "Campus da Indústria",
//     "campus da industria": "Campus da Indústria",
//     cic: "CIC",
//     centro: "Centro - Curitiba",

//     // Outras cidades
//     "ponta grossa": "Ponta Grossa",
//     pg: "Ponta Grossa",
//     londrina: "Londrina",
//     maringá: "Maringá",
//     maringa: "Maringá",
//     cascavel: "Cascavel",
//     palmas: "Palmas",
//     "foz do iguaçu": "Foz do Iguaçu",
//     foz: "Foz do Iguaçu",
//     guarapuava: "Guarapuava",
//     paranavaí: "Paranavaí",
//     paranavai: "Paranavaí",
//     colombo: "Colombo",
//     "são josé dos pinhais": "São José dos Pinhais",
//     "sao jose dos pinhais": "São José dos Pinhais",

//     // ✅ ADICIONAR IRATI E OUTRAS CIDADES FALTANTES
//     irati: "Irati",
//     "união da vitória": "União da Vitória",
//     "uniao da vitoria": "União da Vitória",
//     apucarana: "Apucarana",
//     toledo: "Toledo",
//     umuarama: "Umuarama",
//     "campo mourão": "Campo Mourão",
//     "campo mourao": "Campo Mourão",
//     paranaguá: "Paranaguá",
//     paranagua: "Paranaguá",
//     "são mateus do sul": "São Mateus do Sul",
//     "sao mateus do sul": "São Mateus do Sul",
//     telêmaco: "Telêmaco Borba",
//     "telemaco borba": "Telêmaco Borba",
//     jacarezinho: "Jacarezinho",
//     cornélio: "Cornélio Procópio",
//     "cornelio procopio": "Cornélio Procópio",
//   };

//   const CURSOS_PATTERNS = {
//     "desenvolvimento de sistemas":
//       /desenvolvimento\s*(de\s*)?sistemas?|programação|programacao|informatica|informática|\bti\b|\bds\b|software|sistemas/i,
//     eletrônica: /eletrônica|eletronica|eletrica|elétrica/i,
//     mecânica: /mecânica|mecanica|manutenção|manutencao|usinagem|soldagem/i,
//     "automação industrial": /automação|automacao|controle|instrumentacao/i,
//     enfermagem: /enfermagem|saude|saúde/i,
//     administração: /administração|administracao|gestao|gestão/i,
//     logística: /logística|logistica|transporte/i,
//     "segurança do trabalho":
//       /segurança|seguranca|seguranca\s*do\s*trabalho|\bsst\b/i,
//     química: /química|quimica|laboratorio|laboratório/i,
//     "redes de computadores": /redes|rede|computadores|networking/i,
//   };

//   const lower = message
//     .toLowerCase()
//     .normalize("NFD")
//     .replace(/[\u0300-\u036f]/g, "");
//   console.log(`[HEURISTICA] Processando: "${lower}"`);

//   // Extrair modalidade
//   let modalidade = "";
//   if (/\b(ead|online|remoto|distancia|a\s*distancia|virtual)\b/.test(lower)) {
//     modalidade = "EAD";
//   } else if (/\b(presencial|presenciais|sala\s*de\s*aula)\b/.test(lower)) {
//     modalidade = "Presencial";
//   }

//   // Buscar cidade
//   let cidade = "";
//   let melhorMatch = "";

//   for (const [chave, valor] of Object.entries(CIDADES_MELHORADO)) {
//     if (lower.includes(chave) && chave.length > melhorMatch.length) {
//       cidade = valor;
//       melhorMatch = chave;
//     }
//   }

//   // Segundo: busca por inclusão (fallback)
//   if (!cidade) {
//     for (const [chave, valor] of Object.entries(CIDADES_MELHORADO)) {
//       if (lower.includes(chave) && chave.length > melhorMatch.length) {
//         cidade = valor;
//         melhorMatch = chave;
//       }
//     }
//   }

//   // Buscar curso
//   let curso = "";
//   for (const [nomeCurso, pattern] of Object.entries(CURSOS_PATTERNS)) {
//     if (pattern.test(message)) {
//       curso = nomeCurso;
//       break;
//     }
//   }

//   const resultado = { curso, cidade, modalidade };
//   console.log(`[HEURISTICA] Extraído:`, resultado);
//   return resultado;
// }

// // ============================================
// // 📝 SISTEMA DE LOG
// // ============================================

// async function logInteracao(email, mensagem, resposta, metadata = {}) {
//   try {
//     const logEntry = {
//       timestamp: new Date().toISOString(),
//       email,
//       mensagem: mensagem.substring(0, 500),
//       resposta: resposta.substring(0, 1000),
//       metadata,
//     };

//     const logString =
//       `\n[${logEntry.timestamp}] ${email}\n` +
//       `MSG: ${logEntry.mensagem}\n` +
//       `RSP: ${logEntry.resposta}\n` +
//       `META: ${JSON.stringify(logEntry.metadata)}\n` +
//       `${"=".repeat(80)}\n`;

//     fs.appendFile("chat.log", logString, (err) => {
//       if (err) console.warn("[LOG] Erro ao escrever log:", err);
//     });
//   } catch (error) {
//     console.warn("[LOG] Erro no sistema de log:", error);
//   }
// }

// // ============================================
// // 🎯 CONTROLADOR PRINCIPAL
// // ============================================

// export async function chatController(req, res) {
//   try {
//     const message = req.body.message?.trim();
//     const email = req.email;

//     console.log(`[CHAT] Nova mensagem de ${email || "PÚBLICO"}: "${message}"`);

//     if (!message) {
//       return res.status(400).json({
//         error: "Mensagem não pode estar vazia.",
//         code: "MISSING_MESSAGE",
//       });
//     }

//     // ✅ BUSCAR DADOS DO LEAD (se tiver email)
//     let nome = "amigo(a)";
//     let telefone = "";
//     let cidadeLead = "";

//     if (email) {
//       const [[lead]] = await pool.query(
//         "SELECT nome, telefone, cidade FROM leads WHERE email = ?",
//         [email]
//       );

//       nome = lead?.nome || "amigo(a)";
//       telefone = lead?.telefone || "";
//       cidadeLead = lead?.cidade || "";

//       console.log(
//         `[CHAT] Lead encontrado: ${nome} (${telefone}) - Cidade: ${cidadeLead}`
//       );
//     } else {
//       console.log(`[CHAT] Modo público - sem dados de lead`);
//     }

//     console.log(`[DECISÃO] 🎯 Analisando tipo de mensagem...`);

//     // Detectar perguntas conversacionais
//     const perguntasConversacionais = [
//       /quero mais informações sobre/i,
//       /me fale (mais |sobre )/i,
//       /fale(me)? (mais |sobre )/i,
//       /consegue me dizer/i,
//       /quero saber (mais |sobre )/i,
//       /me explique/i,
//       /como (é|funciona)/i,
//       /o que é/i,
//       /pode me explicar/i,
//       /mais detalhes sobre/i,
//       /informações sobre esse/i,
//       /gostaria de saber sobre/i,
//       /me conte sobre/i,
//     ];

//     const ehPerguntaConversacional = perguntasConversacionais.some((regex) =>
//       regex.test(message)
//     );

//     console.log(
//       `[DECISÃO] ✨ Pergunta conversacional: ${ehPerguntaConversacional}`
//     );
//     console.log(`[DECISÃO] 📝 Mensagem: "${message}"`);

//     // ✅ SE FOR PERGUNTA CONVERSACIONAL → FORÇAR OpenAI
//     if (ehPerguntaConversacional) {
//       console.log(`[CHAT] 💬 FORÇANDO OpenAI para pergunta conversacional`);

//       try {
//         const respostaRaw = await getChatResponse(message, email);

//         // ✅ APLICAR LINKS MESMO NO CHATGPT
//         const respostaComLinks = aplicarLinks(
//           respostaRaw,
//           nome,
//           email,
//           telefone,
//           "",
//           "",
//           ""
//         );

//         const respostaFinal = formatChatbotResponse(respostaComLinks);

//         // ✅ SALVAR NO BANCO (apenas se tiver email)
//         if (email) {
//           await pool.query(
//             `INSERT INTO messages (user_id, user_message, bot_response, nome, email, telefone, curso, cidade, modalidade, cidade_lead)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//             [
//               null,
//               message,
//               respostaFinal,
//               nome,
//               email,
//               telefone,
//               "conversacional",
//               "OpenAI",
//               "N/A",
//               cidadeLead,
//             ]
//           );

//           await logInteracao(email, message, respostaFinal, {
//             tipo: "conversacional",
//             openai: true,
//             cidadeLead,
//           });
//         }

//         console.log(
//           `[CHAT] ✅ Resposta conversacional gerada (${respostaFinal.length} chars)`
//         );
//         return res.status(200).json({ reply: respostaFinal });
//       } catch (openaiError) {
//         console.error(
//           `[CHAT] ❌ Erro OpenAI conversacional:`,
//           openaiError.message
//         );

//         // FALLBACK: Resposta manual para erro OpenAI
//         const respostaFallback = `Oi ${nome}! 😊

// Para informações mais detalhadas sobre nossos cursos, nossos especialistas podem te ajudar melhor!

// 📲 WhatsApp: https://wa.me/5541987249685
// 🌐 Site: https://www.senaipr.org.br/cursos-tecnicos/

// Eles têm todas as informações que você precisa! 😊`;

//         if (email) {
//           await pool.query(
//             `INSERT INTO messages (user_id, user_message, bot_response, nome, email, telefone, curso, cidade, modalidade, cidade_lead)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//             [
//               null,
//               message,
//               respostaFallback,
//               nome,
//               email,
//               telefone,
//               "erro_openai",
//               "fallback",
//               "N/A",
//               cidadeLead,
//             ]
//           );

//           await logInteracao(email, message, respostaFallback, {
//             tipo: "fallback_openai_error",
//             error: openaiError.message,
//             cidadeLead,
//           });
//         }

//         console.log(`[CHAT] ✅ Resposta fallback enviada`);
//         return res.status(200).json({ reply: respostaFallback });
//       }
//     }

//     // ✅ VERIFICAR PERGUNTA SOBRE DESCRIÇÃO
//     if (detectarPerguntaDescricao && detectarPerguntaDescricao(message)) {
//       console.log(`[CHAT] 📖 Pergunta sobre descrição detectada`);

//       const nomeCurso = extrairNomeCursoDaPergunta(message);

//       if (nomeCurso) {
//         console.log(`[CHAT] 🎯 Curso extraído: "${nomeCurso}"`);

//         const descricao = buscarDescricaoCurso(nomeCurso);

//         if (descricao) {
//           const respostaCompletaRaw = `${descricao}

// ✨ **Ficou interessado(a)?**

// O SENAI Paraná é referência nacional em educação profissional! 🏆

// 📍 **Próximos passos:**
// • 📋 **Pré-matrícula:** https://www.senaipr.org.br/cursos-tecnicos/pre-matricula/
// • 📲 **WhatsApp:** https://wa.me/5541987249685?text=${encodeURIComponent(
//             `Olá! Tenho interesse no curso de ${nomeCurso}. Poderia me ajudar?`
//           )}

// 💡 **Dica:** As vagas são limitadas! Não perca essa oportunidade! 🚀`;

//           const respostaCompleta = formatChatbotResponse(respostaCompletaRaw);

//           // ✅ SALVAR APENAS SE TIVER EMAIL
//           if (email) {
//             await pool.query(
//               `INSERT INTO messages (user_id, user_message, bot_response, nome, email, telefone, curso, cidade, modalidade, cidade_lead)
//                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//               [
//                 null,
//                 message,
//                 respostaCompleta,
//                 nome,
//                 email,
//                 telefone,
//                 nomeCurso,
//                 "descrição solicitada",
//                 "N/A",
//                 cidadeLead,
//               ]
//             );

//             await logInteracao(email, message, respostaCompleta, {
//               curso: nomeCurso,
//               tipo: "descrição",
//             });
//           }

//           console.log(`[CHAT] ✅ Descrição retornada para: ${nomeCurso}`);
//           return res.status(200).json({ reply: respostaCompleta });
//         }
//       }

//       console.log(`[CHAT] ⚠️ Descrição não encontrada, usando fluxo normal`);
//     }

//     // ✅ EXTRAÇÃO DE FILTROS
//     let filtros = {};
//     try {
//       filtros = (await extrairFiltrosDeTexto(message)) || {};
//       console.log(`[CHAT] 🤖 Filtros OpenAI:`, filtros);
//     } catch (error) {
//       console.warn(`[CHAT] ⚠️ Erro OpenAI, usando heurística:`, error.message);
//       filtros = {};
//     }

//     const filtrosHeuristicos = extrairFiltrosHeuristico(message);

//     const filtrosFinal = {
//       curso: filtros.curso || filtrosHeuristicos.curso || "",
//       cidade: filtros.cidade || filtrosHeuristicos.cidade || "",
//       modalidade: filtros.modalidade || filtrosHeuristicos.modalidade || "",
//     };

//     // ✅ SE NÃO TEM CIDADE ESPECÍFICA MAS O LEAD TEM CIDADE, USAR COMO PADRÃO
//     if (!filtrosFinal.cidade && cidadeLead) {
//       // Verificar se a mensagem é sobre cursos em geral (sem especificar outra cidade)
//       const msgLower = message.toLowerCase();
//       const isBuscaGenerica = [
//         /^tem curso/i,
//         /^quais curso/i,
//         /^que curso/i,
//         /^cursos dispon/i,
//         /^mostrar curso/i,
//         /^ver curso/i,
//         /^listar curso/i,
//       ].some((regex) => regex.test(msgLower));

//       const isBuscaCidade = [
//         /curso.*em\s+\w+/i,
//         /em\s+\w+.*curso/i,
//         /na cidade de/i,
//         /na região de/i,
//       ].some((regex) => regex.test(msgLower));

//       // Se é busca genérica E não especifica outra cidade, usar cidade do lead
//       if (isBuscaGenerica && !isBuscaCidade) {
//         filtrosFinal.cidade = cidadeLead;
//         console.log(`[CONTEXTO] 🏠 Usando cidade do lead: ${cidadeLead}`);
//       }
//     }

//     // ✅ LÓGICA ESPECIAL PARA UNIDADES DE CURITIBA
//     if (cidadeLead === "Curitiba" && !filtrosFinal.cidade) {
//       const unidadesCuritiba = [
//         "boqueirão",
//         "campus da indústria",
//         "cic",
//         "centro",
//       ];
//       const msgLower = message.toLowerCase();

//       const unidadeMencionada = unidadesCuritiba.find((unidade) =>
//         msgLower.includes(unidade)
//       );

//       if (unidadeMencionada) {
//         // Mapear para nome correto
//         const mapeamento = {
//           boqueirão: "Boqueirão",
//           "campus da indústria": "Campus da Indústria",
//           cic: "CIC",
//           centro: "Centro",
//         };
//         filtrosFinal.cidade = mapeamento[unidadeMencionada];
//         console.log(
//           `[CONTEXTO] 🏢 Unidade específica detectada: ${filtrosFinal.cidade}`
//         );
//       }
//     }

//     console.log(`[CHAT] 🎯 Filtros finais (com contexto):`, filtrosFinal);
//     console.log(
//       `[CONTEXTO] 📍 Cidade do lead: ${cidadeLead || "não informada"}`
//     );

//     const curso = filtrosFinal.curso;
//     const cidade = filtrosFinal.cidade
//       ? normalizarCidade(filtrosFinal.cidade)
//       : "";
//     const modalidade = filtrosFinal.modalidade
//       ? normalizarModalidade(filtrosFinal.modalidade)
//       : "";

//     let respostaFinal = "";

//     // ✅ PROCESSAMENTO PRINCIPAL
//     if (curso || cidade || modalidade) {
//       console.log(`[CHAT] 🔍 Usando sistema de filtros`);

//       try {
//         const dicionario = await construirDicionarioPorCidade();

//         const resultado = filtrarCursosOtimizado(
//           dicionario,
//           { curso, cidade, modalidade },
//           message
//         );

//         // Verificar resposta especial de Curitiba
//         if (resultado.info?.mostrarOpcoesCuritiba) {
//           const respostaEspecial = resultado.info.respostaEspecialCuritiba;

//           // ✅ SALVAR APENAS SE TIVER EMAIL
//           if (email) {
//             await pool.query(
//               "INSERT INTO messages (user_id, user_message, bot_response, nome, email, telefone, curso, cidade, modalidade, cidade_lead) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
//               [
//                 null,
//                 message,
//                 respostaEspecial,
//                 nome,
//                 email,
//                 telefone,
//                 "consulta curitiba",
//                 "opções especiais",
//                 "N/A",
//                 cidadeLead,
//               ]
//             );

//             await logInteracao(email, message, respostaEspecial, {
//               tipo: "curitiba_opcoes",
//               cidadeLead,
//             });
//           }

//           return res.status(200).json({ reply: respostaEspecial });
//         }

//         const respostaRaw = gerarResposta(
//           resultado,
//           { curso, cidade, modalidade },
//           nome
//         );

//         console.log("📝 RESPOSTA RAW COMPLETA:");
//         console.log("Tamanho:", respostaRaw.length);
//         console.log("Conteúdo completo:", respostaRaw);
//         console.log(
//           "Contém LINK_PRE_MATRICULA:",
//           respostaRaw.includes("LINK_PRE_MATRICULA")
//         );
//         console.log(
//           "Contém LINK_WHATSAPP:",
//           respostaRaw.includes("LINK_WHATSAPP")
//         );
//         console.log("═".repeat(80));

//         console.log("Antes aplicarLinks:", respostaRaw.substring(0, 100));

//         // SEMPRE aplicar os links
//         const respostaCompleta = aplicarLinks(
//           respostaRaw,
//           nome,
//           email,
//           telefone,
//           curso,
//           cidade,
//           modalidade
//         );

//         console.log("🔗 RESPOSTA APÓS APLICAR LINKS:");
//         console.log("Tamanho:", respostaCompleta.length);
//         console.log("Conteúdo completo:", respostaCompleta);
//         console.log("Contém href=:", respostaCompleta.includes("href="));
//         console.log("═".repeat(80));

//         console.log("Depois aplicarLinks:", respostaCompleta.substring(0, 100));

//         respostaFinal = formatChatbotResponse(respostaCompleta);

//         console.log("✨ RESPOSTA FINAL FORMATADA:");
//         console.log("Tamanho:", respostaFinal.length);
//         console.log("Conteúdo completo:", respostaFinal);
//         console.log("═".repeat(80));
//       } catch (error) {
//         console.error(`[CHAT] ❌ Erro no filtro, usando ChatGPT:`, error);
//         const respostaRaw = await getChatResponse(message, email, cidadeLead);

//         // ✅ APLICAR LINKS MESMO NO CHATGPT
//         const respostaComLinks = aplicarLinks(
//           respostaRaw,
//           nome,
//           email,
//           telefone,
//           "",
//           "",
//           ""
//         );

//         respostaFinal = formatChatbotResponse(respostaComLinks);
//       }
//     } else {
//       console.log(`[CHAT] 🤖 Usando ChatGPT`);
//       const respostaRaw = await getChatResponse(message, email);

//       // ✅ APLICAR LINKS MESMO NO CHATGPT
//       const respostaComLinks = aplicarLinks(
//         respostaRaw,
//         nome,
//         email,
//         telefone,
//         "",
//         "",
//         ""
//       );

//       respostaFinal = formatChatbotResponse(respostaComLinks);
//     }

//     // ✅ SALVAR NO BANCO (apenas se tiver email)
//     if (email) {
//       await pool.query(
//         `INSERT INTO messages (user_id, user_message, bot_response, nome, email, telefone, curso, cidade, modalidade, cidade_lead)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//         [
//           null,
//           message,
//           respostaFinal,
//           nome,
//           email,
//           telefone,
//           curso || "não informado",
//           cidade || "não informado",
//           modalidade || "não informado",
//           cidadeLead || "não informado",
//         ]
//       );

//       await logInteracao(email, message, respostaFinal, {
//         curso,
//         cidade,
//         cidadeLead,
//         modalidade,
//       });
//     } else {
//       console.log(`[CHAT] Modo público - não salvando no banco`);
//     }

//     console.log(`[CHAT] ✅ Resposta gerada (${respostaFinal.length} chars)`);

//     return res.status(200).json({ reply: respostaFinal });
//   } catch (error) {
//     console.error(`[CHAT] ❌ Erro geral:`, error);

//     if (email) {
//       await logInteracao(
//         email,
//         req.body.message || "",
//         `ERRO: ${error.message}`,
//         {
//           erro: true,
//           cidadeLead: cidadeLead || "não informado",
//         }
//       );
//     }

//     return res.status(500).json({
//       error: "Erro ao processar a mensagem. Por favor, tente novamente.",
//       code: "INTERNAL_SERVER_ERROR",
//     });
//   }
// }

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> NOVA VERSÃO TESTE 02/07/2025 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import {
  getChatResponse,
  extrairFiltrosDeTexto,
  detectarPerguntaDescricao,
  extrairNomeCursoDaPergunta,
  buscarDescricaoCurso,
} from "../services/openai.service.js";
import {
  normalizarCidade,
  normalizarModalidade,
} from "../utils/normalizacao.js";
import pool from "../config/db.js";
import fs from "fs";
import { construirDicionarioPorCidade } from "../utils/carregarCursoCsv.js";

// ============================================
// 🔧 FORMATAÇÃO E LIMPEZA
// ============================================

function formatChatbotResponse(rawResponse) {
  if (!rawResponse) return rawResponse;

  return (
    rawResponse
      // Estruturar quebras importantes
      .replace(/(\n📍|\n👉|\n💬|\n🎯|\n✨)/g, "\n\n$1") // Dupla quebra antes de seções
      .replace(/(\n• )/g, "\n$1") // Manter quebra simples para listas
      .replace(/\n{3,}/g, "\n\n") // Max 2 quebras
      .replace(/[ \t]+/g, " ") // Normalizar espaços
      .replace(/\n\s+/g, "\n") // Limpar espaços após quebras
      .trim()
  );
}

// ============================================
// 🏢 MAPEAMENTO CURITIBA - UNIDADES
// ============================================

const UNIDADES_CURITIBA = {
  Boqueirão: true,
  "Campus da Indústria": true,
  CIC: true,
  "Dr. Celso Charuri": true,
};

function ehUnidadeCuritiba(cidade) {
  return UNIDADES_CURITIBA[cidade] === true;
}

function formatarCidadeParaFormulario(cidadeOriginal) {
  return ehUnidadeCuritiba(cidadeOriginal)
    ? `Curitiba - ${cidadeOriginal}`
    : cidadeOriginal;
}

function gerarMensagemWhatsAppContextualizada(nome, curso, cidade) {
  // ✅ SEMPRE RETORNAR LINK SIMPLES
  return `https://wa.me/5541987249685`;
}

// ============================================
// 🔍 SISTEMA DE FILTROS
// ============================================

function verificarCuritibaGenerica(userMessage, cidade) {
  const msgLower = userMessage.toLowerCase();

  const mencionaCuritiba = ["curitiba", "cwb", "ctba"].some((variacao) =>
    msgLower.includes(variacao)
  );

  const unidadesCuritiba = [
    "boqueirão",
    "boqueirao",
    "campus da indústria",
    "campus da industria",
    "cic",
    "dr. celso charuri",
    "dr celso charuri",
    "celso charuri",
  ];

  const mencionaUnidadeEspecifica = unidadesCuritiba.some((unidade) =>
    msgLower.includes(unidade)
  );

  return mencionaCuritiba && !mencionaUnidadeEspecifica;
}

function buscarCursosEmCuritiba(dicionario) {
  const unidadesCuritiba = [
    "Boqueirão",
    "Campus da Indústria",
    "CIC",
    "Dr. Celso Charuri",
  ];
  let cursosEncontrados = [];

  console.log(`[CURITIBA] Buscando em unidades:`, unidadesCuritiba);

  for (const unidade of unidadesCuritiba) {
    if (dicionario[unidade]) {
      cursosEncontrados.push(...dicionario[unidade]);
      console.log(
        `[CURITIBA] Encontrados ${dicionario[unidade].length} cursos em ${unidade}`
      );
    } else {
      console.log(
        `[CURITIBA] ⚠️ Unidade ${unidade} não encontrada no dicionário`
      );
    }
  }

  console.log(
    `[CURITIBA] Total de cursos encontrados: ${cursosEncontrados.length}`
  );
  return cursosEncontrados;
}

function filtrarCursosOtimizado(dicionario, filtros, userMessage = "") {
  const { cidade, curso, modalidade } = filtros;
  console.log(`[FILTRO] Iniciando com:`, { cidade, curso, modalidade });

  let cursosEncontrados = [];

  // Verificar busca genérica por Curitiba
  const ehBuscaCuritibaGenerica = verificarCuritibaGenerica(
    userMessage,
    cidade
  );

  if (ehBuscaCuritibaGenerica) {
    console.log(`[FILTRO] 🏢 Detectada busca genérica por Curitiba`);

    if (!curso) {
      return {
        cursos: [],
        info: {
          mostrarOpcoesCuritiba: true,
          respostaEspecialCuritiba: `Ótimo! 😊

Em Curitiba temos 4 unidades do SENAI:

📍 Boqueirão
📍 Campus da Indústria
📍 CIC - Cidade Industrial
📍 Centro

Qual fica mais próxima de você? 

Cada unidade tem cursos e horários diferentes! Me diga sua preferência para informações específicas.

📲 WhatsApp: https://wa.me/5541987249685
🌐 Site: https://www.senaipr.org.br/cursos-tecnicos/

🎯`,
        },
      };
    }

    cursosEncontrados = buscarCursosEmCuritiba(dicionario);
  }
  // Busca normal por cidade específica
  else if (cidade && dicionario[cidade]) {
    cursosEncontrados = [...dicionario[cidade]];
    console.log(`[FILTRO] ${cursosEncontrados.length} cursos em ${cidade}`);
  }
  // Busca por "Curitiba" diretamente
  else if (cidade && cidade.toLowerCase() === "curitiba") {
    console.log(`[FILTRO] 🏢 Busca direta por Curitiba`);
    cursosEncontrados = buscarCursosEmCuritiba(dicionario);
  }
  // Busca flexível por cidades similares
  else if (cidade) {
    for (const [cidadeDict, cursosDict] of Object.entries(dicionario)) {
      const cityLower = cidadeDict
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const searchLower = cidade
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      if (cityLower.includes(searchLower) || searchLower.includes(cityLower)) {
        cursosEncontrados.push(...cursosDict);
        console.log(
          `[FILTRO] Incluindo cursos de ${cidadeDict} (busca por ${cidade})`
        );
      }
    }
  }
  // Busca em todas as cidades
  else {
    cursosEncontrados = Object.values(dicionario).flat();
    console.log(
      `[FILTRO] ${cursosEncontrados.length} cursos em todas as cidades`
    );
  }

  // Filtro de curso
  if (curso) {
    const cursosAntes = cursosEncontrados.length;
    cursosEncontrados = cursosEncontrados.filter((c) => {
      const nomeCurso = (c.nome_curso || c.curso || "").toLowerCase();
      const cursoLower = curso.toLowerCase();

      return (
        nomeCurso.includes(cursoLower) ||
        cursoLower.includes(nomeCurso) ||
        nomeCurso
          .split(" ")
          .some((palavra) => cursoLower.includes(palavra) && palavra.length > 2)
      );
    });
    console.log(
      `[FILTRO] ${cursosEncontrados.length} após filtro de curso (era ${cursosAntes})`
    );
  }

  // Filtro de modalidade
  if (modalidade) {
    const cursosAntes = cursosEncontrados.length;
    cursosEncontrados = cursosEncontrados.filter((c) => {
      const modalidadeCurso = (c.modalidade || "").toLowerCase();
      const modalidadeLower = modalidade.toLowerCase();

      return (
        modalidadeCurso.includes(modalidadeLower) ||
        modalidadeLower.includes(modalidadeCurso)
      );
    });
    console.log(
      `[FILTRO] ${cursosEncontrados.length} após filtro de modalidade (era ${cursosAntes})`
    );
  }

  // Remover duplicatas
  const cursosUnicos = cursosEncontrados.filter((curso, index, array) => {
    // Criar chave única baseada em múltiplos campos
    const chaveUnica = [
      (curso.nome_curso || curso.curso || "").trim().toLowerCase(),
      (curso.cidade || "").trim(),
      (curso.modalidade || "").trim().toLowerCase(),
      (curso.turno || "").trim().toLowerCase(),
    ].join("|");

    // Verificar se é a primeira ocorrência desta chave
    const primeiraOcorrencia = array.findIndex((c) => {
      const chaveComparacao = [
        (c.nome_curso || c.curso || "").trim().toLowerCase(),
        (c.cidade || "").trim(),
        (c.modalidade || "").trim().toLowerCase(),
        (c.turno || "").trim().toLowerCase(),
      ].join("|");
      return chaveComparacao === chaveUnica;
    });

    return index === primeiraOcorrencia;
  });

  // ✅ LOG DETALHADO DE DUPLICATAS
  const duplicatasRemovidas = cursosEncontrados.length - cursosUnicos.length;
  if (duplicatasRemovidas > 0) {
    console.log(`[FILTRO] ⚠️ Removidas ${duplicatasRemovidas} duplicatas`);

    // Debug: mostrar algumas duplicatas removidas
    const duplicatas = cursosEncontrados.filter((curso, index, array) => {
      const chaveUnica = [
        (curso.nome_curso || curso.curso || "").trim().toLowerCase(),
        curso.cidade || "",
        (curso.modalidade || "").trim().toLowerCase(),
        (curso.turno || "").trim().toLowerCase(),
      ].join("|");

      const primeiraOcorrencia = array.findIndex((c) => {
        const chaveComparacao = [
          (c.nome_curso || c.curso || "").trim().toLowerCase(),
          c.cidade || "",
          (c.modalidade || "").trim().toLowerCase(),
          (c.turno || "").trim().toLowerCase(),
        ].join("|");
        return chaveComparacao === chaveUnica;
      });

      return index !== primeiraOcorrencia;
    });

    console.log(
      `[FILTRO] 📊 Exemplos de duplicatas removidas:`,
      duplicatas.slice(0, 3).map((d) => ({
        nome: d.nome_curso || d.curso,
        cidade: d.cidade,
        modalidade: d.modalidade,
        turno: d.turno,
      }))
    );
  }

  console.log(`[FILTRO] ${cursosUnicos.length} cursos únicos finais`);

  return {
    cursos: cursosUnicos,
    info: {
      cidadeEncontrada: cidade,
      totalCursos: cursosUnicos.length,
      duplicatasRemovidas,
      modalidadesDisponiveis: [
        ...new Set(cursosUnicos.map((c) => c.modalidade)),
      ],
      cidadesDisponiveis: [...new Set(cursosUnicos.map((c) => c.cidade))],
    },
  };
}

// ============================================
// 🎨 GERAÇÃO DE RESPOSTAS
// ============================================
// ✅ 3. ATUALIZAR gerarRespostaCuritiba - VERSÃO ROBUSTA
function gerarRespostaCuritiba(cursos, filtros, nome) {
  // Gerar links contextualizados
  const links = gerarLinksContextualizados(nome, filtros.curso, "Curitiba");

  if (cursos.length === 0) {
    return `Oi ${nome}! Não encontrei cursos disponíveis em Curitiba com esses filtros.\n\n💡 Que tal tentar outras modalidades ou falar conosco?\n\n📲 ${links.linkWhatsappHTML}`;
  }

  const cursosPorUnidade = {};
  cursos.forEach((curso) => {
    const unidade = curso.cidade;
    if (!cursosPorUnidade[unidade]) {
      cursosPorUnidade[unidade] = [];
    }
    cursosPorUnidade[unidade].push(curso);
  });

  let resposta = `Oi ${nome}! 😊 Encontrei alguns cursos`;
  if (filtros.modalidade) resposta += ` ${filtros.modalidade}`;
  resposta += ` disponíveis pra você em Curitiba:\n\n`;

  let cursosMostrados = 0;
  const maxCursos = 8;

  for (const [unidade, cursosUnidade] of Object.entries(cursosPorUnidade)) {
    if (cursosMostrados >= maxCursos) break;

    resposta += `📍 ${unidade}:\n`;

    const cursosParaMostrar = cursosUnidade.slice(
      0,
      Math.min(3, maxCursos - cursosMostrados)
    );

    cursosParaMostrar.forEach((curso) => {
      const nomeCurso =
        curso.nome_curso || curso.curso || "Curso não identificado";
      const turnoCurso = curso.turno || "Turno não informado";

      // ✅ SEM valor (conforme correção anterior)
      resposta += `🔹 ${nomeCurso} – ${turnoCurso}\n`;
      cursosMostrados++;
    });

    if (cursosUnidade.length > cursosParaMostrar.length) {
      resposta += `🔹 E mais ${
        cursosUnidade.length - cursosParaMostrar.length
      } curso(s)...\n`;
    }
    resposta += `\n`;
  }

  if (Object.keys(cursosPorUnidade).length > 1) {
    resposta += `💡 Temos unidades no Boqueirão, Campus da Indústria, CIC e Dr. Celso Charuri.\n\n`;
  }

  // ✅ URLs DIRETAS - SEM PLACEHOLDERS
  resposta += `Se quiser, posso te ajudar com a pré-matrícula 👇\n`;
  resposta += `👉 ${links.linkPreMatriculaHTML}\n\n`;
  resposta += `Ou, se preferir, fale direto com a gente no WhatsApp:\n`;
  resposta += `💬 ${links.linkWhatsappHTML}\n\n`;
  resposta += `Qual desses você gostaria de saber mais? 😊`;

  return resposta;
}

// ✅ 1. CRIAR FUNÇÃO PARA GERAR LINKS CONTEXTUALIZADOS
function gerarLinksContextualizados(nome, curso, cidade) {
  const linkInscricao =
    "https://www.senaipr.org.br/cursos-tecnicos/pre-matricula/";

  // Gerar mensagem contextualizada para WhatsApp
  const mensagemWhatsApp = gerarMensagemWhatsAppContextualizada(
    nome,
    curso,
    cidade
  );
  const linkWhatsapp = `https://wa.me/5541987249685?text=${encodeURIComponent(
    mensagemWhatsApp
  )}`;

  return {
    preMatricula: linkInscricao,
    whatsapp: linkWhatsapp,
    // Versões HTML prontas
    linkPreMatriculaHTML: `<a href="${linkInscricao}">Fazer pré-matrícula</a>`,
    linkWhatsappHTML: `<a href="${linkWhatsapp}">Abrir WhatsApp</a>`,
  };
}

// ✅ 2. ATUALIZAR FUNÇÃO gerarResposta - VERSÃO ROBUSTA
function gerarResposta(resultado, filtros, nome) {
  const { cursos } = resultado;

  // Gerar links contextualizados
  const links = gerarLinksContextualizados(nome, filtros.curso, filtros.cidade);

  if (cursos.length === 0) {
    let resposta = `Oi ${nome}! 😊 Infelizmente não encontrei cursos disponíveis`;
    if (filtros.curso) resposta += ` de ${filtros.curso}`;
    if (filtros.cidade) resposta += ` em ${filtros.cidade}`;
    if (filtros.modalidade) resposta += ` na modalidade ${filtros.modalidade}`;

    resposta += `.\n\n💡 Algumas sugestões:\n`;
    resposta += `• Digite outros cursos de seu interesse\n`;
    resposta += `• Consulte outras cidades próximas\n`;
    resposta += `• Ou fale conosco para mais opções\n\n`;

    // ✅ URL DIRETA - SEM PLACEHOLDER
    resposta += `📲 ${links.linkWhatsappHTML}`;

    return resposta;
  }

  let resposta = `Oi ${nome}! 😊 Encontrei alguns cursos`;
  if (filtros.modalidade) resposta += ` ${filtros.modalidade}`;
  resposta += ` disponíveis pra você`;
  if (filtros.cidade) resposta += ` em ${filtros.cidade}`;
  resposta += `:\n\n`;

  const cursosParaMostrar = cursos.slice(0, 6);
  cursosParaMostrar.forEach((curso) => {
    const nomeCurso =
      curso.nome_curso || curso.curso || "Curso não identificado";
    const turnoCurso = curso.turno || "Turno não informado";

    // ✅ SEM valor (conforme correção anterior)
    resposta += `🔹 ${nomeCurso} – ${turnoCurso}\n`;
  });

  if (cursos.length > 6) {
    resposta += `\nE mais ${cursos.length - 6} curso(s)...\n`;
  }

  // ✅ URLs DIRETAS - SEM PLACEHOLDERS
  resposta += `\nSe quiser, posso te ajudar com a pré-matrícula 👇\n`;
  resposta += `👉 ${links.linkPreMatriculaHTML}\n\n`;
  resposta += `Ou, se preferir, fale direto com a gente no WhatsApp:\n`;
  resposta += `💬 ${links.linkWhatsappHTML}\n\n`;
  resposta += `Qual desses você gostaria de saber mais? 😊`;

  console.log(
    "📝 [GERAR] Resposta com URLs diretas:",
    resposta.includes('<a href="https://')
  );

  return resposta;
}
// ============================================
// 🔧 APLICAR LINKS
// ============================================

function aplicarLinks(
  resposta,
  nome,
  email,
  telefone,
  curso,
  cidade,
  modalidade
) {
  console.log("🔗 [DEBUG] === INICIANDO aplicarLinks ===");
  console.log("🔗 [DEBUG] Resposta ANTES:", resposta.substring(0, 200));
  console.log(
    "🔗 [DEBUG] Contém LINK_PRE_MATRICULA:",
    resposta.includes("LINK_PRE_MATRICULA")
  );
  console.log(
    "🔗 [DEBUG] Contém LINK_WHATSAPP:",
    resposta.includes("LINK_WHATSAPP")
  );

  // Como agora usamos URLs diretas, esta função só garante que não há placeholders
  return resposta
    .replace(
      /LINK_PRE_MATRICULA/g,
      "https://www.senaipr.org.br/cursos-tecnicos/pre-matricula/"
    )
    .replace(/LINK_WHATSAPP/g, "https://wa.me/5541987249685");
}

function gerarLinksInteligentes(nome, email, telefone, cidadeLead, nomeCurso) {
  // Se tem dados do lead autenticado, gerar links personalizados
  if (email & nome & telefone) {
    console.log(`[LINKS] Usuario autenticado - direcionando para formulário`);

    const paramatros = new URLSearchParams({
      nome: nome,
      email: email,
      telefone: telefone,
      cidade: cidadeLead || "",
      curso: nomeCurso || "",
      origem: "chatbot_descricao",
    });

    const linkFormulario = `https://www.senaipr.org.br/cursos-tecnicos/pre-matricula/?${paramatros.toString()}`;

    return {
      linkPrincipal: linkFormulario,
      textoPrincipal: "Fazer pré-matrícula",
      tipoLink: "formulario",
      textoSecundario:
        "Seus dados já estão preenchidos! É só confirmar e enviar.",
    };
  }

  // Se não tem dados (público) → WhatsApp SIMPLES
  else {
    console.log(`[LINKS] 📱 Usuário público - direcionando para WhatsApp`);

    // ✅ LINK SIMPLES - SEM CONTEXTO
    const linkWhatsApp = `https://wa.me/5541987249685`;

    return {
      linkPrincipal: linkWhatsApp,
      textoPrincipal: "Falar no WhatsApp",
      tipoLink: "whatsapp",
      textoSecundario: "Converse com nossos especialistas 💬",
    };
  }
}

// ============================================
// LINK CLICAVEIS
// ============================================

function tornarLinksClicaveis(texto) {
  if (!texto) return texto;

  return (
    texto
      // Apenas links básicos, sem atributos extras
      .replace(/(https:\/\/wa\.me\/[^\s]+)/g, '<a href="$1">Abrir WhatsApp</a>')
      .replace(
        /(https:\/\/[^\/]*senaipr[^\/]*\/[^\s]*pre-matricula[^\s]*)/g,
        '<a href="$1">Fazer Pré-matrícula</a>'
      )
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">Clique aqui</a>')
  );
}

// respostaFinal = tornarLinksClicaveis(respostaFinal);

// ============================================
// 🔍 EXTRAÇÃO DE FILTROS HEURÍSTICA
// ============================================

function extrairFiltrosHeuristico(message) {
  const CIDADES_MELHORADO = {
    // Curitiba e variações
    curitiba: "Curitiba",
    cwb: "Curitiba",
    ctba: "Curitiba",

    // Unidades específicas de Curitiba
    boqueirão: "Boqueirão",
    boqueirao: "Boqueirão",
    "campus da indústria": "Campus da Indústria",
    "campus da industria": "Campus da Indústria",
    cic: "CIC",
    centro: "Centro - Curitiba",

    // Outras cidades
    "ponta grossa": "Ponta Grossa",
    pg: "Ponta Grossa",
    londrina: "Londrina",
    maringá: "Maringá",
    maringa: "Maringá",
    cascavel: "Cascavel",
    palmas: "Palmas",
    "foz do iguaçu": "Foz do Iguaçu",
    foz: "Foz do Iguaçu",
    guarapuava: "Guarapuava",
    paranavaí: "Paranavaí",
    paranavai: "Paranavaí",
    colombo: "Colombo",
    "são josé dos pinhais": "São José dos Pinhais",
    "sao jose dos pinhais": "São José dos Pinhais",

    // ✅ ADICIONAR IRATI E OUTRAS CIDADES FALTANTES
    irati: "Irati",
    "união da vitória": "União da Vitória",
    "uniao da vitoria": "União da Vitória",
    apucarana: "Apucarana",
    toledo: "Toledo",
    umuarama: "Umuarama",
    "campo mourão": "Campo Mourão",
    "campo mourao": "Campo Mourão",
    paranaguá: "Paranaguá",
    paranagua: "Paranaguá",
    "são mateus do sul": "São Mateus do Sul",
    "sao mateus do sul": "São Mateus do Sul",
    telêmaco: "Telêmaco Borba",
    "telemaco borba": "Telêmaco Borba",
    jacarezinho: "Jacarezinho",
    cornélio: "Cornélio Procópio",
    "cornelio procopio": "Cornélio Procópio",
  };

  const CURSOS_PATTERNS = {
    "desenvolvimento de sistemas":
      /desenvolvimento\s*(de\s*)?sistemas?|programação|programacao|informatica|informática|\bti\b|\bds\b|software|sistemas/i,
    eletrônica: /eletrônica|eletronica|eletrica|elétrica/i,
    mecânica: /mecânica|mecanica|manutenção|manutencao|usinagem|soldagem/i,
    "automação industrial": /automação|automacao|controle|instrumentacao/i,
    enfermagem: /enfermagem|saude|saúde/i,
    administração: /administração|administracao|gestao|gestão/i,
    logística: /logística|logistica|transporte/i,
    "segurança do trabalho":
      /segurança|seguranca|seguranca\s*do\s*trabalho|\bsst\b/i,
    química: /química|quimica|laboratorio|laboratório/i,
    "redes de computadores": /redes|rede|computadores|networking/i,
  };

  const lower = message
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  console.log(`[HEURISTICA] Processando: "${lower}"`);

  // Extrair modalidade
  let modalidade = "";
  if (/\b(ead|online|remoto|distancia|a\s*distancia|virtual)\b/.test(lower)) {
    modalidade = "EAD";
  } else if (/\b(presencial|presenciais|sala\s*de\s*aula)\b/.test(lower)) {
    modalidade = "Presencial";
  }

  // Buscar cidade
  let cidade = "";
  let melhorMatch = "";

  for (const [chave, valor] of Object.entries(CIDADES_MELHORADO)) {
    if (lower.includes(chave) && chave.length > melhorMatch.length) {
      cidade = valor;
      melhorMatch = chave;
    }
  }

  // Segundo: busca por inclusão (fallback)
  if (!cidade) {
    for (const [chave, valor] of Object.entries(CIDADES_MELHORADO)) {
      if (lower.includes(chave) && chave.length > melhorMatch.length) {
        cidade = valor;
        melhorMatch = chave;
      }
    }
  }

  // Buscar curso
  let curso = "";
  for (const [nomeCurso, pattern] of Object.entries(CURSOS_PATTERNS)) {
    if (pattern.test(message)) {
      curso = nomeCurso;
      break;
    }
  }

  const resultado = { curso, cidade, modalidade };
  console.log(`[HEURISTICA] Extraído:`, resultado);
  return resultado;
}

// ============================================
// 📝 SISTEMA DE LOG
// ============================================

async function logInteracao(email, mensagem, resposta, metadata = {}) {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      email,
      mensagem: mensagem.substring(0, 500),
      resposta: resposta.substring(0, 1000),
      metadata,
    };

    const logString =
      `\n[${logEntry.timestamp}] ${email}\n` +
      `MSG: ${logEntry.mensagem}\n` +
      `RSP: ${logEntry.resposta}\n` +
      `META: ${JSON.stringify(logEntry.metadata)}\n` +
      `${"=".repeat(80)}\n`;

    fs.appendFile("chat.log", logString, (err) => {
      if (err) console.warn("[LOG] Erro ao escrever log:", err);
    });
  } catch (error) {
    console.warn("[LOG] Erro no sistema de log:", error);
  }
}

// ============================================
// 🎯 CONTROLADOR PRINCIPAL
// ============================================

export async function chatController(req, res) {
  try {
    const message = req.body.message?.trim();
    const email = req.email;

    console.log(`[CHAT] Nova mensagem de ${email || "PÚBLICO"}: "${message}"`);

    if (!message) {
      return res.status(400).json({
        error: "Mensagem não pode estar vazia.",
        code: "MISSING_MESSAGE",
      });
    }

    // ✅ BUSCAR DADOS DO LEAD (se tiver email)
    let nome = "amigo(a)";
    let telefone = "";
    let cidadeLead = "";

    if (email) {
      const [[lead]] = await pool.query(
        "SELECT nome, telefone, cidade FROM leads WHERE email = ?",
        [email]
      );

      nome = lead?.nome || "amigo(a)";
      telefone = lead?.telefone || "";
      cidadeLead = lead?.cidade || "";

      console.log(
        `[CHAT] Lead encontrado: ${nome} (${telefone}) - Cidade: ${cidadeLead}`
      );
    } else {
      console.log(`[CHAT] Modo público - sem dados de lead`);
    }

    console.log(`[DECISÃO] 🎯 Analisando tipo de mensagem...`);

    // Detectar perguntas conversacionais
    const perguntasConversacionais = [
      /quero mais informações sobre/i,
      /me fale (mais |sobre )/i,
      /fale(me)? (mais |sobre )/i,
      /consegue me dizer/i,
      /quero saber (mais |sobre )/i,
      /me explique/i,
      /como (é|funciona)/i,
      /o que é/i,
      /pode me explicar/i,
      /mais detalhes sobre/i,
      /informações sobre esse/i,
      /gostaria de saber sobre/i,
      /me conte sobre/i,
    ];

    const ehPerguntaConversacional = perguntasConversacionais.some((regex) =>
      regex.test(message)
    );

    console.log(
      `[DECISÃO] ✨ Pergunta conversacional: ${ehPerguntaConversacional}`
    );
    console.log(`[DECISÃO] 📝 Mensagem: "${message}"`);

    // ✅ SE FOR PERGUNTA CONVERSACIONAL → FORÇAR OpenAI
    if (ehPerguntaConversacional) {
      console.log(`[CHAT] 💬 FORÇANDO OpenAI para pergunta conversacional`);

      try {
        const respostaRaw = await getChatResponse(message, email);

        // ✅ APLICAR LINKS MESMO NO CHATGPT
        const respostaComLinks = aplicarLinks(
          respostaRaw,
          nome,
          email,
          telefone,
          "",
          "",
          ""
        );

        const respostaFinal = formatChatbotResponse(respostaComLinks);

        // ✅ SALVAR NO BANCO (apenas se tiver email)
        if (email) {
          await pool.query(
            `INSERT INTO messages (user_id, user_message, bot_response, nome, email, telefone, curso, cidade, modalidade, cidade_lead)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              null,
              message,
              respostaFinal,
              nome,
              email,
              telefone,
              "conversacional",
              "OpenAI",
              "N/A",
              cidadeLead,
            ]
          );

          await logInteracao(email, message, respostaFinal, {
            tipo: "conversacional",
            openai: true,
            cidadeLead,
          });
        }

        console.log(
          `[CHAT] ✅ Resposta conversacional gerada (${respostaFinal.length} chars)`
        );
        return res.status(200).json({ reply: respostaFinal });
      } catch (openaiError) {
        console.error(
          `[CHAT] ❌ Erro OpenAI conversacional:`,
          openaiError.message
        );

        // FALLBACK: Resposta manual para erro OpenAI
        const respostaFallback = `Oi ${nome}! 😊

Para informações mais detalhadas sobre nossos cursos, nossos especialistas podem te ajudar melhor!

📲 WhatsApp: https://wa.me/5541987249685
🌐 Site: https://www.senaipr.org.br/cursos-tecnicos/

Eles têm todas as informações que você precisa! 😊`;

        if (email) {
          await pool.query(
            `INSERT INTO messages (user_id, user_message, bot_response, nome, email, telefone, curso, cidade, modalidade, cidade_lead)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              null,
              message,
              respostaFallback,
              nome,
              email,
              telefone,
              "erro_openai",
              "fallback",
              "N/A",
              cidadeLead,
            ]
          );

          await logInteracao(email, message, respostaFallback, {
            tipo: "fallback_openai_error",
            error: openaiError.message,
            cidadeLead,
          });
        }

        console.log(`[CHAT] ✅ Resposta fallback enviada`);
        return res.status(200).json({ reply: respostaFallback });
      }
    }

    // ✅ VERIFICAR PERGUNTA SOBRE DESCRIÇÃO
    if (detectarPerguntaDescricao && detectarPerguntaDescricao(message)) {
      console.log(`[CHAT] 📖 Pergunta sobre descrição detectada`);

      const nomeCurso = extrairNomeCursoDaPergunta(message);

      if (nomeCurso) {
        console.log(`[CHAT] 🎯 Curso extraído: "${nomeCurso}"`);

        const descricao = buscarDescricaoCurso(nomeCurso);

        if (descricao) {
          const respostaCompletaRaw = `${descricao}

✨ **Ficou interessado(a)?**

O SENAI Paraná é referência nacional em educação profissional! 🏆

📍 **Próximos passos:**
• 📋 **Pré-matrícula:** https://www.senaipr.org.br/cursos-tecnicos/pre-matricula/
• 📲 **WhatsApp:** https://wa.me/5541987249685?text=${encodeURIComponent(
            `Olá! Tenho interesse no curso de ${nomeCurso}. Poderia me ajudar?`
          )}

💡 **Dica:** As vagas são limitadas! Não perca essa oportunidade! 🚀`;

          const respostaCompleta = formatChatbotResponse(respostaCompletaRaw);

          // ✅ SALVAR APENAS SE TIVER EMAIL
          if (email) {
            await pool.query(
              `INSERT INTO messages (user_id, user_message, bot_response, nome, email, telefone, curso, cidade, modalidade, cidade_lead)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                null,
                message,
                respostaCompleta,
                nome,
                email,
                telefone,
                nomeCurso,
                "descrição solicitada",
                "N/A",
                cidadeLead,
              ]
            );

            await logInteracao(email, message, respostaCompleta, {
              curso: nomeCurso,
              tipo: "descrição",
            });
          }

          console.log(`[CHAT] ✅ Descrição retornada para: ${nomeCurso}`);
          return res.status(200).json({ reply: respostaCompleta });
        }
      }

      console.log(`[CHAT] ⚠️ Descrição não encontrada, usando fluxo normal`);
    }

    // ✅ EXTRAÇÃO DE FILTROS
    let filtros = {};
    try {
      filtros = (await extrairFiltrosDeTexto(message)) || {};
      console.log(`[CHAT] 🤖 Filtros OpenAI:`, filtros);
    } catch (error) {
      console.warn(`[CHAT] ⚠️ Erro OpenAI, usando heurística:`, error.message);
      filtros = {};
    }

    const filtrosHeuristicos = extrairFiltrosHeuristico(message);

    const filtrosFinal = {
      curso: filtros.curso || filtrosHeuristicos.curso || "",
      cidade: filtros.cidade || filtrosHeuristicos.cidade || "",
      modalidade: filtros.modalidade || filtrosHeuristicos.modalidade || "",
    };

    // ✅ SE NÃO TEM CIDADE ESPECÍFICA MAS O LEAD TEM CIDADE, USAR COMO PADRÃO
    if (!filtrosFinal.cidade && cidadeLead) {
      // Verificar se a mensagem é sobre cursos em geral (sem especificar outra cidade)
      const msgLower = message.toLowerCase();
      const isBuscaGenerica = [
        /^tem curso/i,
        /^quais curso/i,
        /^que curso/i,
        /^cursos dispon/i,
        /^mostrar curso/i,
        /^ver curso/i,
        /^listar curso/i,
      ].some((regex) => regex.test(msgLower));

      const isBuscaCidade = [
        /curso.*em\s+\w+/i,
        /em\s+\w+.*curso/i,
        /na cidade de/i,
        /na região de/i,
      ].some((regex) => regex.test(msgLower));

      // Se é busca genérica E não especifica outra cidade, usar cidade do lead
      if (isBuscaGenerica && !isBuscaCidade) {
        filtrosFinal.cidade = cidadeLead;
        console.log(`[CONTEXTO] 🏠 Usando cidade do lead: ${cidadeLead}`);
      }
    }

    // ✅ LÓGICA ESPECIAL PARA UNIDADES DE CURITIBA
    if (cidadeLead === "Curitiba" && !filtrosFinal.cidade) {
      const unidadesCuritiba = [
        "boqueirão",
        "campus da indústria",
        "cic",
        "centro",
      ];
      const msgLower = message.toLowerCase();

      const unidadeMencionada = unidadesCuritiba.find((unidade) =>
        msgLower.includes(unidade)
      );

      if (unidadeMencionada) {
        // Mapear para nome correto
        const mapeamento = {
          boqueirão: "Boqueirão",
          "campus da indústria": "Campus da Indústria",
          cic: "CIC",
          centro: "Centro",
        };
        filtrosFinal.cidade = mapeamento[unidadeMencionada];
        console.log(
          `[CONTEXTO] 🏢 Unidade específica detectada: ${filtrosFinal.cidade}`
        );
      }
    }

    console.log(`[CHAT] 🎯 Filtros finais (com contexto):`, filtrosFinal);
    console.log(
      `[CONTEXTO] 📍 Cidade do lead: ${cidadeLead || "não informada"}`
    );

    const curso = filtrosFinal.curso;
    const cidade = filtrosFinal.cidade
      ? normalizarCidade(filtrosFinal.cidade)
      : "";
    const modalidade = filtrosFinal.modalidade
      ? normalizarModalidade(filtrosFinal.modalidade)
      : "";

    let respostaFinal = "";

    // ✅ PROCESSAMENTO PRINCIPAL
    if (curso || cidade || modalidade) {
      console.log(`[CHAT] 🔍 Usando sistema de filtros`);

      try {
        const dicionario = await construirDicionarioPorCidade();

        const resultado = filtrarCursosOtimizado(
          dicionario,
          { curso, cidade, modalidade },
          message
        );

        // Verificar resposta especial de Curitiba
        if (resultado.info?.mostrarOpcoesCuritiba) {
          const respostaEspecial = resultado.info.respostaEspecialCuritiba;

          // ✅ SALVAR APENAS SE TIVER EMAIL
          if (email) {
            await pool.query(
              "INSERT INTO messages (user_id, user_message, bot_response, nome, email, telefone, curso, cidade, modalidade, cidade_lead) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
              [
                null,
                message,
                respostaEspecial,
                nome,
                email,
                telefone,
                "consulta curitiba",
                "opções especiais",
                "N/A",
                cidadeLead,
              ]
            );

            await logInteracao(email, message, respostaEspecial, {
              tipo: "curitiba_opcoes",
              cidadeLead,
            });
          }

          return res.status(200).json({ reply: respostaEspecial });
        }

        const respostaRaw = gerarResposta(
          resultado,
          { curso, cidade, modalidade },
          nome
        );

        console.log("📝 RESPOSTA RAW COMPLETA:");
        console.log("Tamanho:", respostaRaw.length);
        console.log("Conteúdo completo:", respostaRaw);
        console.log(
          "Contém LINK_PRE_MATRICULA:",
          respostaRaw.includes("LINK_PRE_MATRICULA")
        );
        console.log(
          "Contém LINK_WHATSAPP:",
          respostaRaw.includes("LINK_WHATSAPP")
        );
        console.log("═".repeat(80));

        console.log("Antes aplicarLinks:", respostaRaw.substring(0, 100));

        // SEMPRE aplicar os links
        const respostaCompleta = aplicarLinks(
          respostaRaw,
          nome,
          email,
          telefone,
          curso,
          cidade,
          modalidade
        );

        console.log("🔗 RESPOSTA APÓS APLICAR LINKS:");
        console.log("Tamanho:", respostaCompleta.length);
        console.log("Conteúdo completo:", respostaCompleta);
        console.log("Contém href=:", respostaCompleta.includes("href="));
        console.log("═".repeat(80));

        console.log("Depois aplicarLinks:", respostaCompleta.substring(0, 100));

        respostaFinal = formatChatbotResponse(respostaCompleta);

        console.log("✨ RESPOSTA FINAL FORMATADA:");
        console.log("Tamanho:", respostaFinal.length);
        console.log("Conteúdo completo:", respostaFinal);
        console.log("═".repeat(80));
      } catch (error) {
        console.error(`[CHAT] ❌ Erro no filtro, usando ChatGPT:`, error);
        const respostaRaw = await getChatResponse(message, email, cidadeLead);

        // ✅ APLICAR LINKS MESMO NO CHATGPT
        const respostaComLinks = aplicarLinks(
          respostaRaw,
          nome,
          email,
          telefone,
          "",
          "",
          ""
        );

        respostaFinal = formatChatbotResponse(respostaComLinks);
      }
    } else {
      console.log(`[CHAT] 🤖 Usando ChatGPT`);
      const respostaRaw = await getChatResponse(message, email);

      // ✅ APLICAR LINKS MESMO NO CHATGPT
      const respostaComLinks = aplicarLinks(
        respostaRaw,
        nome,
        email,
        telefone,
        "",
        "",
        ""
      );

      respostaFinal = formatChatbotResponse(respostaComLinks);
    }

    // ✅ SALVAR NO BANCO (apenas se tiver email)
    if (email) {
      await pool.query(
        `INSERT INTO messages (user_id, user_message, bot_response, nome, email, telefone, curso, cidade, modalidade, cidade_lead)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          null,
          message,
          respostaFinal,
          nome,
          email,
          telefone,
          curso || "não informado",
          cidade || "não informado",
          modalidade || "não informado",
          cidadeLead || "não informado",
        ]
      );

      await logInteracao(email, message, respostaFinal, {
        curso,
        cidade,
        cidadeLead,
        modalidade,
      });
    } else {
      console.log(`[CHAT] Modo público - não salvando no banco`);
    }

    console.log(`[CHAT] ✅ Resposta gerada (${respostaFinal.length} chars)`);

    return res.status(200).json({ reply: respostaFinal });
  } catch (error) {
    console.error(`[CHAT] ❌ Erro geral:`, error);

    if (email) {
      await logInteracao(
        email,
        req.body.message || "",
        `ERRO: ${error.message}`,
        {
          erro: true,
          cidadeLead: cidadeLead || "não informado",
        }
      );
    }

    return res.status(500).json({
      error: "Erro ao processar a mensagem. Por favor, tente novamente.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}
