# TimeControl

Projeto fullstack: **NestJS** (backend), **Angular** (frontend) e **PostgreSQL** (Docker).

## Rodar tudo com Docker

Na raiz do projeto:

```bash
docker compose up -d --build
```

- **Frontend:** http://localhost:4201  
- **Backend (acesso direto):** http://localhost:3001  
- **Banco:** localhost:5432 (credenciais no `docker-compose.yml`)

Para acessar de outros PCs na mesma rede, use **http://\<IP-deste-PC\>:4201** (detalhes em [docs/DOCKER.md](docs/DOCKER.md)).

Parar sem apagar dados: `docker compose down`. Parar e apagar o banco: `docker compose down -v`.  
Detalhes e persistência dos dados: [docs/DOCKER.md](docs/DOCKER.md).

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
├── docker/           # Configurações (ex.: nginx para o frontend)
├── docs/             # Documentação (ex.: DOCKER.md)
├── docker-compose.yml
└── README.md
```

## Variáveis de ambiente (backend)

Copie `backend/.env.example` para `backend/.env`. Os valores padrão já batem com o `docker-compose.yml`.
