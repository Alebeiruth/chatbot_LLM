import fs from "fs";

export function logInteracao(message, resposta) {
  fs.appendFileSync(
    "chat.log",
    `\n[${new Date().toISOString()}] Pergunta: ${message}\nResposta: ${resposta}\n`
  );
}
