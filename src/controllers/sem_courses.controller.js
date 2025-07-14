import { buscarCursos } from "../services/courses.service.js";
import { extrairFiltrosDeTexto } from "../services/openai.service.js";

async function responderCursosPorTexto(req, res) {
  const { message } = req.body;

  try {
    const filtros = await extrairFiltrosDeTexto(message);
    const cursos = await buscarCursos(filtros);

    if (!cursos.length) {
      return res.status(200).json({
        reply: "Nenhum curso encontrado com as informações fornecidas.",
      });
    }

    const curso = cursos[0];
    const resposta = `Curso: ${curso.curso}, Região: ${curso.regional}, Modelo: ${curso.estrategia}, Horario: ${curso.horario_aulas}, Aulas : ${curso.momento_presencial}, Vagas: ${curso.vagas}  Unidade: ${curso.unidade}, Turno: ${curso.turno}, Data de Início: ${curso.data_inicio}, Duração: ${curso.duracao_meses} meses, Valor: R$${curso.valor_curso}`;
    res.status(200).json({ reply: resposta });
  } catch (err) {
    console.error("Erro ao consultar cursos:", err);
    res.status(500).json({ error: "Erro ao consultar cursos" });
  }
}

export { responderCursosPorTexto };
