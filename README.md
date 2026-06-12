# FinancialHero - Frontend

## Sobre o projeto

O **FinancialHero** é um sistema web voltado para **organização financeira pessoal**.

A aplicação permite que usuários registrem gastos, armazenem comprovantes e acompanhem informações relacionadas às suas finanças de forma simples e organizada.

Este repositório contém a parte responsável pela **interface do sistema e interação com o usuário**.

---

## Backend

O backend da aplicação está disponível em:

[FinancialHero Backend ](https://github.com/Kauany-Pecuch/financialhero-backend)

---

## Como rodar o projeto

### Pré-requisitos

- **Node.js 20 ou superior** (recomendado a versão LTS) — já inclui o `npm`
- O **backend** em execução (veja o repositório acima)

### Passo a passo

1. Clone o repositório e entre na pasta do projeto:

   ```bash
   git clone https://github.com/<organizacao>/financialhero-frontend.git
   cd financialhero-frontend
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente. Crie um arquivo `.env.local` na raiz do projeto
   (pode copiar o `.env.example`):

   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
   ```

   > Esse é o endereço em que o backend está rodando. Se o backend estiver em
   > `http://localhost:8080`, essa etapa é opcional, pois esse já é o valor padrão.

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

5. Acesse a aplicação no navegador:

   ```
   http://localhost:3000
   ```

> **Importante:** o front-end depende do backend para login e demais funcionalidades.
> Certifique-se de que o backend esteja rodando antes de usar a aplicação.

---
## Gestão de Configuração

### Workflow de Branches (Git Flow)

O projeto utiliza o modelo Git Flow, de forma simples:

- `main` → versão principal (produção)  
- `feature/nome-da-tarefa` → desenvolvimento de novas funcionalidades  

#### Como trabalhar:

1. Criar uma branch a partir da `main`  
2. Desenvolver a funcionalidade  
3. Fazer commits seguindo o padrão  
4. Abrir um Pull Request (PR)  
5. Outro integrante revisa  
6. Após aprovação, realizar merge na `main`  

---

### Padrão de Commits (Conventional Commits)

Todos os commits devem seguir este padrão:


tipo: descrição curta


#### Tipos mais usados:

- `feat:` nova funcionalidade  
- `fix:` correção de bug  
- `docs:` documentação  
- `test:` testes  
- `refactor:` melhoria de código sem alterar comportamento  

#### Exemplos:


fix: corrigir erro no login


#### Não permitido:


corrigindo coisas

---

## Estrutura do Front-end

O projeto é construído com **Next.js (App Router)**, **React**, **TypeScript** e **Tailwind CSS**. Os testes são feitos com **Vitest** e **Testing Library**, e a comunicação com o backend usa **Axios**.

```
financialhero-frontend/
├── public/                   # Arquivos estáticos (imagens, ilustrações)
│
├── src/
│   ├── api/                  # Camada de comunicação com o backend (Axios)
│   │   ├── http.ts           # Instância e interceptors do Axios
│   │   ├── auth.ts           # Login, registro e recuperação de senha
│   │   ├── bills.ts          # Contas e gastos
│   │   ├── files.ts          # Upload/download de comprovantes
│   │   ├── metrics.ts        # Métricas do dashboard
│   │   ├── storage.ts        # Acesso a tokens / armazenamento local
│   │   ├── user.ts           # Dados do usuário
│   │   └── index.ts          # Exportações centralizadas
│   │
│   ├── app/                  # Rotas da aplicação (Next.js App Router)
│   │   ├── layout.tsx        # Layout raiz
│   │   ├── page.tsx          # Landing page
│   │   ├── globals.css       # Estilos globais (Tailwind CSS)
│   │   ├── login/            # Tela de login
│   │   ├── register/         # Tela de cadastro
│   │   ├── forgot-password/  # Solicitação de redefinição de senha
│   │   ├── reset-password/   # Redefinição de senha
│   │   └── dashboard/        # Área autenticada
│   │       ├── layout.tsx    # Layout da área logada
│   │       ├── page.tsx      # Visão geral do dashboard
│   │       ├── gastos/       # Registro e listagem de gastos
│   │       ├── comprovantes/ # Gestão de comprovantes
│   │       ├── calculadora/  # Calculadora financeira
│   │       └── perfil/       # Perfil do usuário
│   │
│   ├── components/           # Componentes reutilizáveis
│   │   ├── AuthGuard.tsx     # Proteção de rotas autenticadas
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── ThemeToggle.tsx   # Alternância de tema claro/escuro
│   │   ├── dashboard/        # Gráficos e seletores do dashboard
│   │   └── landing/          # Seções e componentes da landing page
│   │
│   ├── contexts/             # Estado global (React Context API)
│   │   ├── AuthContext.tsx   # Estado de autenticação
│   │   ├── ThemeContext.tsx  # Estado do tema
│   │   ├── ToastContext.tsx  # Notificações (toasts)
│   │   └── decodeToken.ts    # Decodificação do JWT
│   │
│   └── global.d.ts           # Tipagens globais do TypeScript
│
├── next.config.mjs           # Configuração do Next.js
├── postcss.config.mjs        # Configuração do PostCSS / Tailwind
├── tsconfig.json             # Configuração do TypeScript
├── vitest.config.ts          # Configuração dos testes (Vitest)
├── vitest.setup.ts           # Setup dos testes
└── package.json              # Dependências e scripts
```

> Os arquivos de teste ficam ao lado do código que testam, com o sufixo `.test.ts` ou `.test.tsx`.

### Scripts disponíveis

| Comando             | Descrição                                  |
|---------------------|--------------------------------------------|
| `npm run dev`       | Inicia o servidor de desenvolvimento       |
| `npm run build`     | Gera a build de produção                   |
| `npm run start`     | Executa a build de produção                |
| `npm run lint`      | Verifica o código com o ESLint             |
| `npm run test`      | Executa os testes uma vez                  |
| `npm run test:watch`| Executa os testes em modo observação       |
| `npm run test:ui`   | Abre a interface visual de testes do Vitest|

---

## Autores
- Djeferson Luiz Kuhn Almeida
- Gabriel Da Fonseca Meira
- Gustavo Drohobeczky Silles
- Kauany Pecuch Ramos

Projeto desenvolvido para fins acadêmicos.
