// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> NOVA VERSÃO TESTE 21/05/2025 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

import fs from "fs";
import Papa from "papaparse";
import path from "path";
import csv from "csv-parser";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function normalizar(texto) {
  return typeof texto === "string"
    ? texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
    : "";
}

export function sanitizeInput(input) {
  if (typeof input !== "string") return "";

  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .substring(0, 500); // Limita 500 caracteres para campo de curso
}

let dicionarioPorCidade = null;
let colunaCorretaCurso = null;
let cacheTimestamp = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos

/**
 * Detecta a coluna correta do curso no CSV
 */

function detectarColunaCurso(primeiraLinha) {
  console.log("[CSV] 🔍 Detectando coluna de curso...");

  if (!primeiraLinha || typeof primeiraLinha !== "object") {
    console.error(`[CSV] Primeira linha inválida`, primeiraLinha);
    return null;
  }

  const possiveisNomes = [
    "nome_curso",
    "curso",
    "nome do curso",
    "Nome do Curso",
    "Curso",
    "Nome do Curso",
    "CURSO",
    "nome_do_curso",
    "NomeCurso",
  ];

  console.log(`[CSV] Colunas disponiveis:`, Object.keys(primeiraLinha));

  for (const nome of possiveisNomes) {
    const valor = primeiraLinha[nome];

    if (
      valor &&
      typeof valor === "string" &&
      valor.trim() !== "" &&
      valor.length > 2 &&
      !valor.toLowerCase().includes("curso") &&
      valor.length < 200
    ) {
      console.log(`Coluna de curso detectada: "${nome}" = "${valor}"`);
      return nome;
    }
  }

  // Se não encontrou, mostra todas as coluanas disponíveis
  console.log("[CSV] Coluna de curso não detectada automaticamente!");
  console.log("[CSV] Valores da primeira linha:");
  Object.entries(primeiraLinha).forEach(([key, value]) => {
    const valorLimitado =
      typeof value === "string" ? value.substring(0, 100) : value;
    console.log(
      `  ${key}: "${valorLimitado}" (tipo: ${typeof value}, length: ${
        value?.length || 0
      })`
    );
  });

  for (const [key, value] of Object.entries(primeiraLinha)) {
    if (
      typeof value === "string" &&
      value.trim().length > 5 &&
      value.trim().length < 150 &&
      !key.toLowerCase().includes("id") &&
      !key.toLowerCase().includes("data") &&
      !key.toLowerCase().includes("valor")
    ) {
      console.log(`[CSV] Usando coluna por inferência: "${key}" = "${value}"`);
      return key;
    }
  }
  return null; // Não encontrou nenhuma coluna válida
}

async function construirDicionarioPorCidade() {
  // Verifica cache
  const agora = Date.now();
  if (
    dicionarioPorCidade &&
    cacheTimestamp &&
    agora - cacheTimestamp < CACHE_DURATION
  ) {
    console.log(
      `[CSV] ✅ Usando dicionário do cache (${Math.round(
        (agora - cacheTimestamp) / 1000
      )}s atrás)`
    );
    return dicionarioPorCidade; // ✅ Retorna dicionário em memória
  }

  console.log("[CSV] 🏗️ Construindo dicionário por cidade...");

  const filePath = path.join(__dirname, "../data/nova_base_atualizada_sem.csv");
  console.log(`[CSV] Carregando arquivo: ${filePath}`);

  // Verifica se o arquivo existe
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Arquivo não encontrado: ${filePath}`);
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }

  // Verificar tamanho do arquivo
  try {
    const stats = fs.statSync(filePath);
    console.log(
      `[CSV] Tamamno do arquivo: ${(stats.size / 1024).toFixed(2)} KB`
    );

    if (stats.size === 0) {
      throw new Error(`Arquivo CSV está vazio`);
    }

    if (stats.size > 50 * 1024 * 1024) {
      console.warn(
        `[CSV] Arquivo muito grande: ${(stats.size / 1024 / 1024).toFixed(
          2
        )} MB). Isso pode causar lentidão.`
      );
    }
  } catch (error) {
    console.error(`[CSV]❌ Erro ao verificar o tamanho do arquivo:`, error);
    throw error;
  }

  const dicionario = [];
  let primeiraLinha = true;
  let linhasProcessadas = 0;
  let linhasValidas = 0;
  let errosEncontrados = [];

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("⏰ Tempo limite excedido ao processar o CSV!"));
    }, 30000);

    fs.createReadStream(filePath)
      .pipe(csv({ separator: ";", strict: false, skipEmpityLines: true }))
      .on("data", (row) => {
        try {
          linhasProcessadas++;

          //Na primeira linha, detectar a coluna correta
          if (primeiraLinha) {
            colunaCorretaCurso = detectarColunaCurso(row);
            primeiraLinha = false;

            if (!colunaCorretaCurso) {
              const erro = "Não foi possivel detectar a coluna do cursos";
              console.error(`[CSV] ${erro}`);
              clearTimeout(timeout);
              reject(new Error(erro));
              return;
            }
            console.log(
              `[CSV] Coluna de curso detectada: "${colunaCorretaCurso}"`
            );
          }

          // Validar dados essemciais
          const cidade = sanitizeInput(row["cidade"] || "").trim();
          const nomeCurso = sanitizeInput(row[colunaCorretaCurso] || "").trim();

          if (!cidade || cidade.length < 2) {
            if (errosEncontrados.length < 5) {
              errosEncontrados.push(
                `Linha ${linhasProcessadas}: Cidade inválida "${cidade}"`
              );
            }
            return;
          }

          if (!nomeCurso || nomeCurso.length < 2) {
            if (errosEncontrados.length < 5) {
              errosEncontrados.push(
                `Linha ${linhasProcessadas}: Curso inválido "${nomeCurso}"`
              );
            }
            return;
          }

          // Construir o objeto da oferta com validação
          const oferta = {
            id: Number(row["id"]) || 0,
            regiao: row["regiao"] || "",
            cidade: row["cidade"] || "",
            curso:
              row["nome_curso"] ||
              row["curso"] ||
              row["Curso"] ||
              "Curso não identificado",
            modalidade: row["modalidade"] || "",
            vagas: Number(row["vagas"]) || 0,
            turno: row["turno"] || "",
            momento_presencial: row["momento_presencial"] || "",
            horario_aulas: row["horario_aulas"] || "",
            duracao_mes: Number(row["duracao_mes"]) || 0,
            data_inicio: row["data_inicio"] || "",
            data_inicio_matricula: row["data_inicio_matricula"] || "",
            valor_curso: Number(row["valor_curso"]) || 0,
            endereco: row["endereco"] || "",
          };

          // Validações adicionais
          if (
            oferta.modalidade &&
            !["EAD", "Presencial", "Híbrido", "Semipresencial"].some((m) =>
              oferta.modalidade.toLowerCase().includes(m.toLowerCase())
            )
          ) {
            // Se modalidade não é reconhecida, normalizar
            const modalidadeLower = oferta.modalidade.toLowerCase();
            if (
              modalidadeLower.includes("distancia") ||
              modalidadeLower.includes("online") ||
              modalidadeLower.includes("remoto")
            ) {
              oferta.modalidade = "EAD";
            } else if (
              modalidadeLower.includes("presencial") ||
              modalidadeLower.includes("sala")
            ) {
              oferta.modalidade = "Presencial";
            }
          }

          // Adicionar ao dicionário
          if (!dicionario[cidade]) {
            dicionario[cidade] = [];
          }

          dicionario[cidade].push(oferta);
          linhasValidas++;

          // Log progresso a cada 1000 linhas
          if (linhasProcessadas % 1000 === 0) {
            console.log(
              `[CSV] 📊 Processadas ${linhasProcessadas} linhas, ${linhasValidas} válidas`
            );
          }
        } catch (error) {
          if (errosEncontrados.length < 10) {
            errosEncontrados.push(
              `Linha ${linhasProcessadas}: ${error.message}`
            );
          }
        }
      })
      .on("end", () => {
        clearTimeout(timeout);

        try {
          console.log(`[CSV] ✅ Processamento concluído:`);
          console.log(`   📊 Total de linhas: ${linhasProcessadas}`);
          console.log(`   ✅ Linhas válidas: ${linhasValidas}`);
          console.log(
            `   🏙️ Cidades encontradas: ${Object.keys(dicionario).length}`
          );

          // Mostrar erros encontrados (limitado)
          if (errosEncontrados.length > 0) {
            console.log(`   ⚠️ Erros encontrados: ${errosEncontrados.length}`);
            errosEncontrados
              .slice(0, 5)
              .forEach((erro) => console.log(`      ${erro}`));
            if (errosEncontrados.length > 5) {
              console.log(
                `      ... e mais ${errosEncontrados.length - 5} erros`
              );
            }
          }

          // Verificar se carregou dados válidos
          const totalCursos = Object.values(dicionario).flat();
          const cursosComNome = totalCursos.filter(
            (c) =>
              c.curso &&
              c.curso !== "Curso não identificado" &&
              c.curso.length > 3
          );

          console.log(`[CSV] 📈 Estatísticas finais:`);
          console.log(`   🎓 Total de ofertas: ${totalCursos.length}`);
          console.log(`   ✅ Ofertas com nome válido: ${cursosComNome.length}`);

          if (cursosComNome.length === 0) {
            const erro = "NENHUM curso foi carregado corretamente!";
            console.error(`[CSV] ❌ ${erro}`);

            // Debug da primeira oferta
            if (totalCursos.length > 0) {
              console.log(
                `[CSV] 🔍 Exemplo de oferta carregada:`,
                JSON.stringify(totalCursos[0], null, 2)
              );
            }

            reject(new Error(erro));
            return;
          }

          // Mostrar exemplos de sucesso
          const exemplosCidades = Object.keys(dicionario).slice(0, 5);
          console.log(
            `[CSV] 🏙️ Exemplos de cidades: ${exemplosCidades.join(", ")}`
          );

          const exemplosCursos = cursosComNome
            .slice(0, 5)
            .map((c) => `"${c.curso}"`);
          console.log(
            `[CSV] 🎯 Exemplos de cursos: ${exemplosCursos.join(", ")}`
          );

          // Validação de integridade final
          let integridadeOK = true;
          const verificacoes = [];

          // Verificar se todas as cidades têm pelo menos um curso
          for (const [cidade, cursos] of Object.entries(dicionario)) {
            if (!Array.isArray(cursos) || cursos.length === 0) {
              verificacoes.push(`Cidade "${cidade}" sem cursos válidos`);
              integridadeOK = false;
            }
          }

          // Verificar duplicatas
          const cursosUnicos = new Set();
          let duplicatasEncontradas = 0;
          for (const cursos of Object.values(dicionario)) {
            for (const curso of cursos) {
              const chave = `${curso.cidade}-${curso.curso}-${curso.modalidade}`;
              if (cursosUnicos.has(chave)) {
                duplicatasEncontradas++;
              } else {
                cursosUnicos.add(chave);
              }
            }
          }

          if (duplicatasEncontradas > 0) {
            console.log(
              `[CSV] ⚠️ Encontradas ${duplicatasEncontradas} possíveis duplicatas`
            );
          }

          if (!integridadeOK) {
            console.warn(
              `[CSV] ⚠️ Problemas de integridade encontrados:`,
              verificacoes.slice(0, 3)
            );
          }

          // Salvar no cache
          dicionarioPorCidade = dicionario;
          cacheTimestamp = Date.now();

          console.log(`[CSV] 🎉 Dicionário construído com sucesso!`);
          console.log(
            `[CSV] 💾 Cache salvo por ${CACHE_DURATION / 60000} minutos`
          );

          resolve(dicionarioPorCidade);
        } catch (finalError) {
          console.error(`[CSV] ❌ Erro na finalização:`, finalError);
          reject(finalError);
        }
      })
      .on("error", (err) => {
        clearTimeout(timeout);
        console.error(`[CSV] ❌ Erro no stream:`, err);
        reject(err);
      });
  });
}

// ============================================
// 🔍 BUSCA OTIMIZADA POR CIDADE/CURSO/MODALIDADE
// ============================================

async function buscarOfertaPorCidadeCursoModalidade(
  dicionario,
  cidade,
  curso,
  modalidade
) {
  try {
    console.log(`[BUSCA] 🔍 Iniciando busca:`, { cidade, curso, modalidade });

    // Validar parâmetros
    if (!dicionario || typeof dicionario !== "object") {
      return "Erro: dicionário de cursos não disponível.";
    }

    if (!cidade || typeof cidade !== "string") {
      return "Erro: cidade deve ser especificada.";
    }

    // Sanitizar entradas
    const cidadeSanitizada = sanitizeInput(cidade).trim();
    const cursoSanitizado = sanitizeInput(curso || "").trim();
    const modalidadeSanitizada = sanitizeInput(modalidade || "").trim();

    // Normalizar para busca
    const cidadeN = normalizar(cidadeSanitizada);
    const cursoN = normalizar(cursoSanitizado);
    const modalidadeN = normalizar(modalidadeSanitizada);

    // Buscar ofertas na cidade
    const ofertasNaCidade = dicionario[cidadeSanitizada];

    if (
      !ofertasNaCidade ||
      !Array.isArray(ofertasNaCidade) ||
      ofertasNaCidade.length === 0
    ) {
      const cidadesDisponiveis = Object.keys(dicionario).slice(0, 5).join(", ");
      return `Não há ofertas disponíveis para a cidade "${cidadeSanitizada}". Cidades disponíveis incluem: ${cidadesDisponiveis}...`;
    }

    console.log(
      `[BUSCA] 📊 Encontradas ${ofertasNaCidade.length} ofertas em ${cidadeSanitizada}`
    );

    // Aplicar filtros
    let ofertasFiltradas = ofertasNaCidade;

    // Filtro por curso
    if (cursoSanitizado) {
      ofertasFiltradas = ofertasFiltradas.filter((oferta) => {
        const cursoOferta = normalizar(oferta.curso || "");
        return cursoOferta.includes(cursoN) || cursoN.includes(cursoOferta);
      });

      console.log(
        `[BUSCA] 🎓 Após filtro por curso: ${ofertasFiltradas.length} ofertas`
      );
    }

    // Filtro por modalidade
    if (modalidadeSanitizada) {
      ofertasFiltradas = ofertasFiltradas.filter((oferta) => {
        const modalidadeOferta = normalizar(oferta.modalidade || "");
        return (
          modalidadeOferta.includes(modalidadeN) ||
          modalidadeN.includes(modalidadeOferta)
        );
      });

      console.log(
        `[BUSCA] 📚 Após filtro por modalidade: ${ofertasFiltradas.length} ofertas`
      );
    }

    if (ofertasFiltradas.length === 0) {
      let mensagem = `Não encontramos`;
      if (cursoSanitizado) mensagem += ` o curso "${cursoSanitizado}"`;
      if (modalidadeSanitizada)
        mensagem += ` na modalidade "${modalidadeSanitizada}"`;
      mensagem += ` para a cidade "${cidadeSanitizada}".`;

      // Sugerir alternativas
      const cursosDisponiveis = [
        ...new Set(ofertasNaCidade.map((o) => o.curso)),
      ].slice(0, 3);
      if (cursosDisponiveis.length > 0) {
        mensagem += ` Cursos disponíveis nesta cidade: ${cursosDisponiveis.join(
          ", "
        )}.`;
      }

      return mensagem;
    }

    // Formatar resultados (limitar a 5 ofertas)
    const resultados = ofertasFiltradas.slice(0, 5).map((oferta, index) => {
      let resultado = `**${index + 1}. ${oferta.curso}**\n`;

      if (oferta.modalidade)
        resultado += `📚 *Modalidade:* ${oferta.modalidade}\n`;
      if (oferta.vagas && oferta.vagas > 0)
        resultado += `👥 *Vagas:* ${oferta.vagas}\n`;
      if (oferta.turno) resultado += `🕐 *Turno:* ${oferta.turno}\n`;
      if (oferta.momento_presencial)
        resultado += `🏫 *Presencial:* ${oferta.momento_presencial}\n`;
      if (oferta.horario_aulas)
        resultado += `⏰ *Horário:* ${oferta.horario_aulas}\n`;
      if (oferta.duracao_mes && oferta.duracao_mes > 0)
        resultado += `📅 *Duração:* ${oferta.duracao_mes} meses\n`;
      if (oferta.data_inicio)
        resultado += `🚀 *Início:* ${oferta.data_inicio}\n`;
      if (oferta.data_inicio_matricula)
        resultado += `📝 *Matrícula:* ${oferta.data_inicio_matricula}\n`;
      if (oferta.valor_curso && oferta.valor_curso > 0) {
        resultado += `💰 *Valor:* R$ ${oferta.valor_curso.toLocaleString(
          "pt-BR",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )}\n`;
      }
      if (oferta.endereco) resultado += `📍 *Local:* ${oferta.endereco}\n`;

      return resultado;
    });

    let resposta = resultados.join("\n---\n\n");

    if (ofertasFiltradas.length > 5) {
      resposta += `\n\n📋 *E mais ${
        ofertasFiltradas.length - 5
      } opção(ões) disponível(eis)...*`;
    }

    console.log(
      `[BUSCA] ✅ Busca concluída: ${ofertasFiltradas.length} resultados formatados`
    );
    return resposta;
  } catch (error) {
    console.error(`[BUSCA] ❌ Erro na busca:`, error);
    return `Erro interno na busca. Tente novamente ou contate o suporte.`;
  }
}

// ============================================
// 🔄 FUNÇÕES DE MANUTENÇÃO DO CACHE
// ============================================

function limparCache() {
  console.log(`[CACHE] 🧹 Limpando cache do dicionário...`);
  dicionarioPorCidade = null;
  colunaCorretaCurso = null;
  cacheTimestamp = null;
  console.log(`[CACHE] ✅ Cache limpo`);
}

function obterEstatisticasCache() {
  const stats = {
    cacheAtivo: !!dicionarioPorCidade,
    timestamp: cacheTimestamp,
    idadeCache: cacheTimestamp ? Date.now() - cacheTimestamp : null,
    validoAte: cacheTimestamp
      ? new Date(cacheTimestamp + CACHE_DURATION).toISOString()
      : null,
    colunaDetectada: colunaCorretaCurso,
    totalCidades: dicionarioPorCidade
      ? Object.keys(dicionarioPorCidade).length
      : 0,
    totalCursos: dicionarioPorCidade
      ? Object.values(dicionarioPorCidade).flat().length
      : 0,
  };

  return stats;
}

async function recarregarDicionario() {
  console.log(`[RELOAD] 🔄 Forçando recarga do dicionário...`);
  limparCache();

  try {
    const novoDicionario = await construirDicionarioPorCidade();
    console.log(`[RELOAD] ✅ Dicionário recarregado com sucesso`);
    return novoDicionario;
  } catch (error) {
    console.error(`[RELOAD] ❌ Erro ao recarregar:`, error);
    throw error;
  }
}

// ============================================
// 📤 EXPORTS
// ============================================

export {
  construirDicionarioPorCidade,
  buscarOfertaPorCidadeCursoModalidade,
  normalizar,
  limparCache,
  obterEstatisticasCache,
  recarregarDicionario,
};
