# LinkedIn Job Searcher - Backend

Backend em **NestJS** para o projeto LinkedIn Job Searcher, responsável pelo scraping de vagas de emprego no LinkedIn.

## 📂 Estrutura do projeto

```
backend/
│
├─ src/
│   ├─ jobs/              # Módulo de scraping de vagas
│   │   ├─ dto/           # Data Transfer Objects
│   │   │   └─ search-jobs.dto.ts  # DTO para parâmetros de busca
│   │   ├─ jobs.controller.ts      # Endpoints da API
│   │   ├─ jobs.service.ts         # Lógica de scraping
│   │   └─ jobs.module.ts          # Configuração do módulo
│   ├─ app.module.ts      # Módulo principal da aplicação
│   └─ main.ts            # Ponto de entrada da aplicação
├─ test/                  # Testes e2e
└─ package.json           # Dependências e scripts
```

## ⚡ Tecnologias utilizadas

* **NestJS** - Framework para construção de aplicações server-side
* **Fastify** - Servidor HTTP de alta performance
* **Axios** - Cliente HTTP para requisições
* **Cheerio** - Biblioteca para parsing e manipulação de HTML

## 💻 Configuração inicial

1. Instalar dependências:

```bash
pnpm install
```

2. Configurar variáveis de ambiente (opcional):
   - Crie um arquivo `.env` na raiz do projeto
   - Defina a porta da aplicação: `PORT=3000`

## 🏃‍♂️ Rodando em desenvolvimento

```bash
pnpm start:dev
```

A aplicação estará disponível em `http://localhost:4002` (ou na porta definida na variável de ambiente `PORT`).

## 🧪 Testes

```bash
# Testes unitários
pnpm test

# Testes e2e
pnpm test:e2e

# Cobertura de testes
pnpm test:cov
```

## 🏗 Build para produção

```bash
pnpm build
```

O código compilado será gerado na pasta `dist/`.

## 🚀 Rodando em produção

```bash
pnpm start:prod
```

## 📝 API Endpoints

### Busca de vagas

```
GET /jobs/search
```

#### Parâmetros

| Parâmetro   | Tipo   | Descrição                                      |
|-------------|--------|------------------------------------------------|
| keywords    | string | Palavras-chave para busca (ex: "Node.js")      |
| location    | string | Localização (ex: "Natal, RN")                  |
| timeFilter  | string | Filtro de tempo (ex: "r3600" para última hora) |

#### Exemplo de requisição

```
GET /jobs/search?keywords=Node.js&location=Natal,%20RN&timeFilter=r3600
```

#### Exemplo de resposta

```json
[
  {
    "title": "Desenvolvedor Node.js",
    "company": "Empresa XYZ",
    "location": "Natal, RN",
    "url": "https://www.linkedin.com/jobs/view/123456789",
    "date": "2023-08-27T14:30:00Z"
  }
]
```

## 🐳 Docker

O backend pode ser executado em um container Docker. Consulte o `Dockerfile` na raiz do projeto e o `docker-compose.yml` no diretório principal do projeto para mais detalhes.

### Construir e executar com Docker

```bash
# Na raiz do projeto principal
docker-compose up -d backend
```

## 🔄 CI/CD

O backend é testado automaticamente através do pipeline de CI/CD configurado com GitHub Actions. Consulte o arquivo `.github/workflows/ci-cd.yml` no diretório principal do projeto para mais detalhes.