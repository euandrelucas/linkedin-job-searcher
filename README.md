# LinkedIn Job Searcher

Um projeto **monorepo** que permite pesquisar vagas de emprego no LinkedIn de forma automatizada, com backend em **NestJS** para scraping e frontend em **Next.js** para interface web.

## 📂 Estrutura do projeto

```
linkedin-job-searcher/
│
├─ package.json            # Configuração do monorepo e workspaces
├─ pnpm-workspace.yaml     # Configuração do pnpm workspaces
├─ apps/
│   ├─ backend/            # Backend NestJS
│   │   ├─ src/
│   │   │   ├─ jobs/       # Módulo de scraping de vagas
│   │   │   ├─ app.module.ts
│   │   │   └─ main.ts
│   │   └─ package.json
│   └─ frontend/           # Frontend Next.js
│       ├─ src/
│       └─ package.json
└─ packages/               # Bibliotecas compartilhadas (opcional)
    └─ common/
```

## ⚡ Pré-requisitos

* **Node.js** (>= 20)
* **pnpm** (para gerenciar workspaces):

```bash
npm install -g pnpm
```

## 💻 Configuração inicial

1. Instalar dependências do monorepo:

```bash
pnpm install
```

2. Gerar módulos, controllers e services (já feito para o módulo `jobs`):

```bash
pnpm dlx @nestjs/cli g mo jobs
pnpm dlx @nestjs/cli g s jobs
pnpm dlx @nestjs/cli g co jobs
```

## 🏃‍♂️ Rodando em desenvolvimento

Para rodar **backend** e **frontend** simultaneamente com auto-refresh:

1. Instalar `concurrently` na raiz (para rodar os dois apps juntos):

```bash
pnpm add -D concurrently -w
```

2. Adicionar scripts no `package.json` da raiz:

```json
"scripts": {
  "dev:backend": "pnpm --filter backend dev",
  "dev:frontend": "pnpm --filter frontend dev",
  "dev": "concurrently \"pnpm dev:backend\" \"pnpm dev:frontend\""
}
```

3. Rodar:

```bash
pnpm dev
```

* Backend: NestJS (`http://localhost:3000`)
* Frontend: Next.js (`http://localhost:3001` ou `3000`)

## 📦 Instalando dependências específicas

Cada app tem seu próprio `package.json`.

* **Backend**:

```bash
cd apps/backend
pnpm add axios cheerio
```

* **Frontend**:

```bash
cd apps/frontend
pnpm add axios tailwindcss
```

O **pnpm workspace** gerencia separadamente cada app.

## 🏗 Scripts de build

No `package.json` da raiz:

```json
"scripts": {
  "build:backend": "pnpm --filter backend build",
  "build:frontend": "pnpm --filter frontend build",
  "build": "pnpm build:backend && pnpm build:frontend"
}
```

* `build:backend` → cria `dist/`
* `build:frontend` → cria `.next/`

## 🚀 Scripts para produção

```json
"scripts": {
  "start:backend": "pnpm --filter backend start:prod",
  "start:frontend": "pnpm --filter frontend start",
  "start:prod": "concurrently \"pnpm start:backend\" \"pnpm start:frontend\""
}
```

## 📝 Estrutura do backend (NestJS)

* `jobs/` → Módulo responsável por buscar vagas no LinkedIn via scraping
* `jobs.service.ts` → Lógica do scraping usando `axios` + `cheerio`
* `jobs.controller.ts` → Endpoint `GET /jobs/search` que recebe parâmetros como `keywords`, `location` e `timeFilter` (`r3600`, `r1800`, etc.)
* `search-jobs.dto.ts` → DTO com parâmetros de busca

Exemplo de endpoint:

```
GET /jobs/search?keywords=Node.js&location=Natal, RN&timeFilter=3600
```

Retorna JSON com as vagas mais recentes.

## 📝 Estrutura do frontend (Next.js)

* Landing page `/` → Apresenta o projeto
* Página de pesquisa `/jobs` → Exibe vagas com filtros e cards, inspirada no LinkedIn Jobs
* Estilização com **Tailwind CSS**
* Componentes organizados em `src/components/`

## ⚡ Dicas e boas práticas

* Mantenha o monorepo organizado: cada app dentro de `apps/` e libs compartilhadas em `packages/`.
* Sempre usar **pnpm install** na raiz do monorepo.
* Para adicionar novas bibliotecas a um app específico, vá para a pasta do app e use `pnpm add <package>`.
* Use o endpoint do backend para popular a página de pesquisa do frontend.
