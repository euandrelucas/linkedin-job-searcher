# LinkedIn Job Searcher - Frontend

Frontend em **Next.js** para o projeto LinkedIn Job Searcher, responsável pela interface web para pesquisa de vagas de emprego no LinkedIn.

## 📂 Estrutura do projeto

```
frontend/
│
├─ src/
│   ├─ app/                # Estrutura de rotas (App Router)
│   │   ├─ jobs/           # Página de listagem de vagas
│   │   │   └─ page.tsx    # Componente da página de vagas
│   │   ├─ layout.tsx      # Layout principal da aplicação
│   │   └─ page.tsx        # Página inicial (landing page)
│   ├─ components/         # Componentes reutilizáveis
│   │   ├─ ui/             # Componentes de UI
│   │   │   ├─ button.tsx  # Componente de botão
│   │   │   ├─ card.tsx    # Componente de card
│   │   │   ├─ input.tsx   # Componente de input
│   │   │   ├─ select.tsx  # Componente de select
│   │   │   └─ toast.tsx   # Componente de notificação
│   │   ├─ header.tsx      # Componente de cabeçalho
│   │   └─ theme-provider.tsx # Provedor de tema
│   ├─ hooks/              # Hooks personalizados
│   ├─ lib/                # Utilitários e configurações
│   └─ styles/             # Estilos globais
├─ public/                 # Arquivos estáticos
└─ package.json            # Dependências e scripts
```

## ⚡ Tecnologias utilizadas

* **Next.js** - Framework React para aplicações web
* **React** - Biblioteca para construção de interfaces
* **Tailwind CSS** - Framework CSS utilitário
* **Radix UI** - Componentes acessíveis e sem estilo
* **Lucide React** - Ícones para React

## 💻 Configuração inicial

1. Instalar dependências:

```bash
pnpm install
```

2. Configurar variáveis de ambiente:
   - Crie um arquivo `.env.local` na raiz do projeto
   - Defina a URL da API: `NEXT_PUBLIC_API_URL=http://localhost:4002`

## 🏃‍♂️ Rodando em desenvolvimento

```bash
pnpm dev
```

A aplicação estará disponível em `http://localhost:3001`.

## 🏗 Build para produção

```bash
pnpm build
```

O código compilado será gerado na pasta `.next/`.

## 🚀 Rodando em produção

```bash
pnpm start
```

## 📝 Páginas principais

### Página inicial (/)

Landing page que apresenta o projeto e suas funcionalidades principais.

### Página de pesquisa de vagas (/jobs)

Página que permite pesquisar vagas de emprego no LinkedIn com os seguintes recursos:

* Formulário de pesquisa com campos para:
  * Palavras-chave (ex: "Node.js")
  * Localização (ex: "Natal, RN")
  * Filtro de tempo (última hora, último dia, etc.)
* Listagem de vagas em formato de cards
* Informações detalhadas sobre cada vaga:
  * Título
  * Empresa
  * Localização
  * Data de publicação
  * Link para a vaga no LinkedIn

## 🎨 Componentes UI

O projeto utiliza uma biblioteca de componentes personalizada, localizada em `src/components/ui/`:

* **Button** - Botões estilizados com variantes
* **Card** - Containers para conteúdo
* **Input** - Campos de entrada de texto
* **Select** - Menus de seleção dropdown
* **Toast** - Notificações temporárias
* **Badge** - Etiquetas para destacar informações

## 🐳 Docker

O frontend pode ser executado em um container Docker. Consulte o `Dockerfile` na raiz do projeto e o `docker-compose.yml` no diretório principal do projeto para mais detalhes.

### Construir e executar com Docker

```bash
# Na raiz do projeto principal
docker-compose up -d frontend
```

## 🔄 CI/CD

O frontend é testado e construído automaticamente através do pipeline de CI/CD configurado com GitHub Actions. Consulte o arquivo `.github/workflows/ci-cd.yml` no diretório principal do projeto para mais detalhes.