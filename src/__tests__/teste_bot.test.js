import { jest } from "@jest/globals";
import { chatController } from "../controllers/chat.controller.js";
import * as db from "../config/db.js";
import * as openaiService from "../services/openai.service.js";
import * as descricao from "../utils/carregarDescricao.js";
import * as cursoCsv from "../utils/carregarCursoCsv.js";

// Mocks
// jest.mock("../config/db.js", () => ({
//   query: jest.fn(),
// }));

// jest.mock("../services/openai.service.js", () => ({
//   getChatResponse: jest.fn(),
//   extrairFiltrosDeTexto: jest.fn(),
// }));

// jest.mock("../utils/carregarDescricao.js", () => ({
//   buscarDescricaoCurso: jest.fn(),
// }));

// jest.mock('../utils/carregarCursoCsv.js', () => ({
//   construirDicionarioPorCidade: jest.fn(),
//   buscarOfertaPorCidadeCursoModalidade: jest.fn(),
//   normalizar: jest.fn()
// }));


// jest.mock("../utils/carregarCursoCsv.js", () => ({
//   construirDicionarioPorCidade: jest.fn(),
//   buscarOfertaPorCidadeCursoModalidade: jest.fn(),
// }));

// describe("chatController", () => {
//   let req, res;

//   beforeEach(() => {
//     req = {
//       body: { message: "O que é o curso de Mecânica?" },
//       email: "test@example.com",
//     };
//     res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     db.default.query.mockResolvedValueOnce([
//       [{ nome: "Teste", telefone: "12345", email: "alebe@email.com" }],
//     ]);
//   });

//   it("deve retornar descrição do curso quando for pergunta de descrição", async () => {
//     descricao.buscarDescricaoCurso.mockResolvedValueOnce(
//       "Descrição do curso de Mecânica"
//     );

//     await chatController(req, res);

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       reply: "Descrição do curso de Mecânica",
//     });
//   });
// });

// describe("chatController - Curso informações", () => {
//   let req, res;

//   beforeEach(() => {
//     req = {
//       body: { message: "" },
//       email: "test@example.com",
//     };
//     res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     db.default.query.mockResolvedValueOnce([
//       [{ nome: "Test User", telefone: "123456" }],
//     ]);
//   });

//   it("deve confirmar se curso existe", async () => {
//     req.body.message = "Existe o curso de Mecânica em Curitiba?";
//     openaiService.getChatResponse.mockResolvedValue("Resposta IA");
//     openaiService.extrairFiltrosDeTexto.mockResolvedValue({
//       curso: "Mecânica",
//       cidade: "Curitiba",
//       modalidade: "Presencial",
//     });
//     cursoCsv.cursoBusca.mockResolvedValueOnce([
//       { curso: "Mecânica", cidade: "Curitiba" },
//     ]);

//     await chatController(req, res);

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalled();
//   });

//   it("deve retornar informações de horário e valor", async () => {
//     req.body.message =
//       "Qual o horário e valor do curso de Mecânica em Curitiba?";
//     openaiService.getChatResponse.mockResolvedValue("Resposta IA");
//     openaiService.extrairFiltrosDeTexto.mockResolvedValue({
//       curso: "Mecânica",
//       cidade: "Curitiba",
//     });
//     cursoCsv.cursoBusca.mockResolvedValueOnce([
//       {
//         curso: "Edificações",
//         cidade: "Curitiba",
//         horario_aulas: "19h às 22h",
//         valor_curso: "1200",
//       },
//     ]);

//     await chatController(req, res);

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalled();
//   });

//   it("deve retornar fallback quando não encontrar curso", async () => {
//     req.body.message = "Tem curso de Astrofísica em Ponta Grossa?";
//     openaiService.getChatResponse.mockResolvedValue("Resposta IA");
//     openaiService.extrairFiltrosDeTexto.mockResolvedValue({
//       curso: "Astrofísica",
//       cidade: "Ponta Grossa",
//     });
//     cursoCsv.cursoBusca.mockResolvedValueOnce([]);

//     await chatController(req, res);

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith(
//       expect.objectContaining({
//         reply: expect.stringContaining("Não encontramos o curso"),
//       })
//     );
//   });
// });

// import { chatController } from "../src/controllers/chat.controller.js";
// import * as openaiService from "../src/services/openai.service.js";
// import * as cursoCsv from "../src/utils/carregarCursoCsv.js";
// import * as db from "../src/config/db.js";

jest.mock("../src/services/openai.service.js");
jest.mock("../src/utils/carregarCursoCsv.js");
jest.mock("../src/config/db.js");

describe("chatController - Curso informações", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { message: "Existe o curso de Mecânica em Curitiba?" },
      email: "test@example.com"
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    db.query = jest.fn().mockResolvedValueOnce([
      [{ nome: "Usuário Teste", telefone: "41999999999" }]
    ]);
  });

  it("deve confirmar se curso existe", async () => {
    // Mock IA
    openaiService.getChatResponse.mockResolvedValue(
      "Resposta IA com {{link_pre_matricula}} e {{link_whatsapp}}"
    );

    // Mock extração de filtros
    openaiService.extrairFiltrosDeTexto.mockResolvedValue({
      curso: "Mecânica",
      cidade: "Curitiba",
      modalidade: "Presencial"
    });

    // Mock busca no CSV
    cursoCsv.cursoBusca.mockResolvedValueOnce([
      { curso: "Mecânica", cidade: "Curitiba" }
    ]);

    // Executa controller
    await chatController(req, res);

    // Valida se retornou status 200
    expect(res.status).toHaveBeenCalledWith(200);

    // Valida se a resposta contém o link de inscrição
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        reply: expect.stringContaining("https://www.senaipr.org.br/cursos-tecnicos/pre-matricula/")
      })
    );

    // Confirma se o cursoBusca foi chamado com os filtros corretos
    expect(cursoCsv.cursoBusca).toHaveBeenCalledWith({
      curso: "Mecânica",
      cidade: "Curitiba",
      modalidade: "Presencial"
    });
  });
});
