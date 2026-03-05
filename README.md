# TimeControl

Projeto fullstack: **NestJS** (backend), **Angular** (frontend) e **PostgreSQL** (Docker).

## Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- npm

## Como rodar

### 1. Banco de dados (PostgreSQL)

Na raiz do projeto:

```bash
docker compose up -d
```

O PostgreSQL sobe na porta **5432** com:

- **Usuário:** `timecontrol`
- **Senha:** `timecontrol_secret`
- **Database:** `timecontrol`

### 2. Backend (NestJS)

```bash
cd backend
cp .env.example .env   # opcional: edite .env se precisar
npm install
npm run start:dev
```

API em **http://localhost:3000**, prefixo global **/api** (ex.: `http://localhost:3000/api`).

### 3. Frontend (Angular)

Em outro terminal:

```bash
cd frontend
npm install
npm start
```

App em **http://localhost:4200**. As chamadas para `/api` são redirecionadas para o backend via proxy.

## Estrutura

```
TimeControl/
├── backend/          # NestJS + TypeORM + PostgreSQL
├── frontend/         # Angular
├── docker-compose.yml
└── README.md
```

## Variáveis de ambiente (backend)

Copie `backend/.env.example` para `backend/.env`. Os valores padrão já batem com o `docker-compose.yml`.
