import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csv from "csv-parser";

// Compatível com ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function buscarCursos(filtros) {
  return new Promise((resolve, reject) => {
    const cursos = [];

    fs.createReadStream(path.join(__dirname, "../data/courses.csv"))
      .pipe(csv())
      .on("data", (row) => {
        const unidadeCSV = row.cidade.toLowerCase() || "";
        const cursoCSV = row.curso.toLowerCase() || "";
        const regiaoCSV = row.regiao.toLowerCase() || "";
        const modalidadeCSV = row.modalidade.toLowerCase() || "";
        const turnoCSV = row.turno.toLowerCase() || "";
        const dataInicioCSV = row.data_inicio || "";
        const dataFimCSV = row.data_fim || "";

        // Filtro por múltiplas unidades (tem prioridades)
        if (Array.isArray(filtros.unidades)) {
          const match = filtros.unidades.some(
            (u) => u.toLowerCase() === unidadeCSV
          );
          if (!match) return;
        }

        // Se não há multiplas, verifica por unidade única
        else if (filtros.cidade) {
          if (unidadeCSV !== filtros.cidade.toLowerCase()) {
            return;
          }
        }

        // Filtro ADCIONAIS
        if (filtros.curso && !cursoCSV.includes(filtros.curso.toLowerCase())) {
          return;
        }

        if (filtros.regiao && regiaoCSV !== filtros.regiao.toLowerCase()) {
          return;
        }

        if (
          filtros.modalidade &&
          modalidadeCSV !== filtros.modalidade.toLowerCase()
        ) {
          return;
        }

        if (filtros.turno && turnoCSV !== filtros.turno.toLowerCase()) {
          return;
        }

        if (filtros.data_inicio && dataInicioCSV !== filtros.data_inicio) {
          return;
        }

        if (filtros.data_fim && dataFimCSV !== filtros.data_fim) {
          return;
        }

        cursos.push(row);
      })
      .on("end", () => {
        resolve(cursos);
      })
      .on("error", (err) => {
        console.error("Erro ao ler o CSV:", err);
        reject(err);
      });
  });
}
