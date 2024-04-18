# Khipo_backend

## Pré-requisitos

- Node.js
- npm (geralmente vem junto com o Node.js)

## Instalação

criar um arquivo chamado ".env" com a url para seu database (postgre). Coloque a linha abaixo no arquivo e mude os parâmetros de acordo com os da sua máquina

- DATABASE_URL="postgresql://[USUÁRIO]:[SENHA]@[HOST]:[PORTA]/[NOME_DO_BANCO_DE_DADOS]?schema=[ESQUEMA]"

### Rode os seguintes comandos:

Instalar dependencias

- npm i
- npx prisma migrate dev

Iniciar o projeto

- npm run start:dev
