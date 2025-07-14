// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> NOVA VERSÃO TESTE 20/05/2025 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// import fs from "fs";
// import path from "path";
// import csv from "csv-parser";

// const normalizar = (texto) =>
//   typeof texto === "string"
//     ? texto
//         .toLowerCase()
//         .normalize("NFD")
//         .replace(/[\u0300-\u036f]/g, "")
//     : "";

// export async function buscarDescricaoCurso(nomeCurso) {
//   const filePath = path.join(
//     process.cwd(),
//     "src",
//     "data",
//     "curso_tecnicos.csv"
//   );

//   return new Promise((resolve, reject) => {
//     const dicionario = {};

//     fs.createReadStream(filePath)
//       .pipe(csv({ separator: ";" }))
//       .on("data", (row) => {
//         const nomeBruto = row["Nome do Curso"];
//         if (!nomeBruto) return;

//         const nomeNormalizado = normalizar(nomeBruto);
//         dicionario[nomeNormalizado] = {
//           nome: nomeBruto,
//           objetivo: row["Objetivos do Curso"] || "",
//           publicoAlvo: row["Público-Alvo"] || "",
//           ondeTrabalhar: row["Onde Pode Trabalhar"] || "",
//         };
//       })
//       .on("end", () => {
//         const nomeCursoNormalizado = normalizar(nomeCurso);
//         const curso = dicionario[nomeCursoNormalizado];
//         resolve(
//           curso
//             ? `*Curso:* ${curso.nome}\n*Objetivo:* ${curso.objetivo}\n*Público-alvo:* ${curso.publicoAlvo}\n*Onde pode trabalhar:* ${curso.ondeTrabalhar}`
//             : null
//         );
//       })
//       .on("error", (err) => reject(err));
//   });
// }

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> NOVA VERSÃO TESTE 21/05/2025 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

import fs from "fs";
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
    : "";
}

let dicionarioDescricao = null;

async function construirDicionarioDescricao() {
  if (dicionarioDescricao) {
    return dicionarioDescricao; // ✅ Retorna dicionário em memória
  }

  const filePath = path.join(__dirname, "../data/curso_tecnicos.csv");
  const novoDicionario = {};

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv({ separator: "," }))
      .on("data", (row) => {
        const nomeBruto = row["Nome do Curso"];
        if (!nomeBruto) return;

        const nomeNormalizado = normalizar(nomeBruto);

        novoDicionario[nomeNormalizado] = {
          nome: nomeBruto,
          objetivo: row["Objetivos do Curso"] || "",
          publicoAlvo: row["Público-Alvo"] || "",
          ondeTrabalhar: row["Onde Pode Trabalhar"] || "",
        };
      })
      .on("end", () => {
        dicionarioDescricao = novoDicionario; // ✅ Salva em memória
        resolve(dicionarioDescricao);
      })
      .on("error", (err) => reject(err));
  });
}

async function buscarDescricaoCurso(nomeCurso) {
  const dicionario = await construirDicionarioDescricao();
  const nomeCursoNormalizado = normalizar(nomeCurso);
  const curso = dicionario[nomeCursoNormalizado];

  if (curso) {
    return `*Curso:* ${curso.nome}
*Objetivo:* ${curso.objetivo}
*Público-alvo:* ${curso.publicoAlvo}
*Onde pode trabalhar:* ${curso.ondeTrabalhar}`;
  } else {
    return null;
  }
}

export { construirDicionarioDescricao, buscarDescricaoCurso, normalizar };
