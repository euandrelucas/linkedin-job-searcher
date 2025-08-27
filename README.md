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

## 🔄 CI/CD

O projeto utiliza GitHub Actions para automação de CI/CD. O workflow está configurado em `.github/workflows/ci-cd.yml` e inclui:

* **Checkout do código**
* **Setup do Node.js v20**
* **Instalação do pnpm v10.15.0**
* **Cache de dependências** para builds mais rápidas
* **Instalação de dependências**
* **Linting** do backend e frontend
* **Testes** do backend
* **Build** de ambas as aplicações
* **Testes Docker** que verificam se os containers Docker funcionam corretamente:
  * Construção das imagens Docker
  * Inicialização dos containers
  * Verificação de acessibilidade dos serviços backend e frontend
  * Encerramento dos containers

O pipeline é executado automaticamente em:
* Push para as branches `main` ou `master`
* Pull requests para as branches `main` ou `master`

Para configurar o deploy, descomente e configure a seção de deploy no arquivo de workflow.

## 🐳 Docker

O projeto está configurado para ser executado em containers Docker, facilitando a implantação e garantindo consistência entre ambientes.

### Arquivos Docker

* `apps/backend/Dockerfile` - Configuração para construir a imagem do backend NestJS
* `apps/frontend/Dockerfile` - Configuração para construir a imagem do frontend Next.js
* `docker-compose.yml` - Orquestração dos serviços backend e frontend
* `.dockerignore` - Exclui arquivos e diretórios desnecessários do contexto de build (como node_modules)

### Como executar com Docker

1. Construir e iniciar os containers:

```bash
docker-compose up -d --build
```

2. Acessar os serviços:

* Backend: `http://localhost:3000`
* Frontend: `http://localhost:3001`

3. Parar os containers:

```bash
docker-compose down
```

### Variáveis de ambiente

O arquivo `docker-compose.yml` já configura as variáveis de ambiente necessárias:

* Backend:
  * `NODE_ENV=production` - Define o ambiente de execução

* Frontend:
  * `NODE_ENV=production` - Define o ambiente de execução
  * `NEXT_PUBLIC_API_URL=http://backend:3000` - URL da API do backend

Para adicionar mais variáveis de ambiente, edite o arquivo `docker-compose.yml` ou crie arquivos `.env` nas pastas dos respectivos serviços.

### Notas importantes

* O arquivo `.dockerignore` é essencial para excluir o diretório `node_modules` do contexto de build do Docker, evitando problemas com permissões de arquivos e modos de arquivo desconhecidos durante o processo de build.

## ⚡ Dicas e boas práticas

* Mantenha o monorepo organizado: cada app dentro de `apps/` e libs compartilhadas em `packages/`.
* Sempre usar **pnpm install** na raiz do monorepo.
* Para adicionar novas bibliotecas a um app específico, vá para a pasta do app e use `pnpm add <package>`.
* Use o endpoint do backend para popular a página de pesquisa do frontend.
