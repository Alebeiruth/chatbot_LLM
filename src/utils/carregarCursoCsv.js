import fs from "fs";
import path from "path";
import csv from "csv-parser";

export async function buscarDescricaoCurso(nomeCurso) {
  const filePath = path.resolve(
    "data",
    "Cursos_Tecnicos_Simplificados_Completos.csv"
  );

  return new Promise((resolve, reject) => {
    const resultados = [];

    fs.createReadStream(filePath)
      .pipe(csv({ separator: ";" }))
      .on("data", (data) => resultados.push(data))
      .on("end", () => {
        const cursoEncontrado = resultados.find((row) =>
          row["Nome do Curso"]?.toLowerCase().includes(nomeCurso.toLowerCase())
        );

        if (!cursoEncontrado) {
          return resolve(null);
        }

        const respostaFormatada = `
*Curso:* ${cursoEncontrado["Nome do Curso"] || ""}
*Objetivo:* ${cursoEncontrado["Objetivos do Curso"] || ""}
*Público-alvo:* ${cursoEncontrado["Público-Alvo"] || ""}
*Onde pode trabalhar:* ${cursoEncontrado["Onde Pode Trabalhar"] || ""}
        `.trim();

        resolve(respostaFormatada);
      })
      .on("error", (err) => reject(err));
  });
}
