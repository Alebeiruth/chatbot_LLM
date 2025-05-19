FROM node:20-slim

# Define o diretório de trabalho
WORKDIR /app

# Instala pacotes necessários para compilar módulos nativos
RUN apt-get update && apt-get install -y python3 make g++ 

# Copia o package.json e o package-lock.json
COPY package*.json ./

# Remove node_modules para garantir uma instalação limpa
RUN rm -rf node_modules

# Instala as dependências
RUN npm install

# Copia o restante do código
COPY . .

# Exclui os pacotes de desenvolvimento e recompila os binários nativos
RUN npm rebuild bcrypt --build-from-source

# Define a porta exposta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "server.js"]