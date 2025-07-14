# 🤖 SENAI Paraná - Chatbot Inteligente para Cursos Técnicos

Este projeto faz parte de um sistema de atendimento automatizado envolvendo processamento de linguagem natural com OpenAI GPT, filtros inteligentes e dados estruturados em CSV.

O sistema é capaz de extrair filtros de cursos, cidades e modalidades automaticamente, contendo:

• **Cursos**: Base de dados com cursos técnicos disponíveis
• **Cidades**: Informações geográficas das unidades SENAI-PR  
• **Descrições**: Dataset com objetivos, público-alvo e áreas de atuação

Além dos datasets locais, o projeto conta com a subpasta `data_science_codes/` que contém scripts Python para preparação e limpeza dos dados.

As funcionalidades principais incluem:
• **openai.service.js**: Processamento de linguagem natural e extração de entidades
• **chat.controller.js**: Controle de fluxo, filtros e geração de respostas contextualizadas  

Adicionalmente, dentro de `middleware/` estão disponíveis os arquivos:
• **jwt.guard.js**: Contém os links oficiais para download dos middlewares de autenticação
• **validation.js**: Descrição completa para verificação de entrada e limpeza de dados

Os resultados experimentais são armazenados automaticamente em um banco de dados MySQL Workbench (`resultados.db`) e exportados para análise estatística via `resultado_experimento.csv` para posterior análise estatística e comparação de desempenho dos modelos.

## 🛠️ Tecnologias Utilizadas

• **Node.js**
• **Express.js** 
• **OpenAI GPT-4o-mini**
• **MySQL**
• **Papa Parse** (para processamento CSV)
• **JWT** (para autenticação)
• **Docker** (para reprodutibilidade)

## 📁 Estrutura do Projeto

```
src/
├── controllers/
│   └── chat.controller.js
├── services/
│   └── openai.service.js
├── middleware/
│   └── jwt.guard.js
├── config/
│   └── db.js
├── utils/
│   ├── normalizacao.js
│   └── carregarCursoCsv.js
├── data/
│   ├── novos_cursos.csv
│   └── curso_tecnicos.csv
└── logs/
    └── chat.log
```

## 🚀 Como Executar

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente no `.env`
4. Execute: `npm run dev`

## ⚙️ Configuração

Crie um arquivo `.env` com:

```env
OPENAI_API_KEY=sua_chave_aqui
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=senha
DB_NAME=senai_chatbot
JWT_SECRET=seu_jwt_secret
```

## 📊 Dados

O sistema utiliza dois datasets principais:
• **novos_cursos.csv**: Informações de cursos, cidades, modalidades e valores
• **curso_tecnicos.csv**: Descrições detalhadas dos cursos técnicos

## 💬 Como Usar

Após executar o sistema, envie requisições POST para `/api/chat` com:

```json
{
  "message": "quero curso de desenvolvimento de sistemas em curitiba"
}
```

O sistema retornará respostas contextualizadas com:
• Cursos disponíveis filtrados
• Links para pré-matrícula 
• Opções de contato via WhatsApp

## 🔍 Funcionalidades

• **Extração automática** de filtros (curso, cidade, modalidade)
• **Respostas contextualizadas** com base nos dados reais
• **Tratamento especial** para cidades com múltiplas unidades
• **Histórico de conversas** armazenado no banco
• **Links clicáveis** para ações de conversão

## 📈 Resultados

O chatbot processa automaticamente mensagens como:
• "tem curso de enfermagem em londrina?"
• "quero fazer técnico em eletrônica"
• "o que é o curso de desenvolvimento de sistemas?"

E retorna informações precisas baseadas nos dados disponíveis.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
