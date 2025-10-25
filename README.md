# 📘 DOCUMENTATION — CompressorWeb

## 🧩 Overview

**CompressorWeb** é uma aplicação web desenvolvida em **React + Vite + TypeScript**, voltada para **compressão e manipulação de arquivos** diretamente no navegador, sem necessidade de backend.  
O foco central é oferecer uma **interface performática, leve e intuitiva**, com **build otimizada** e **deploy automatizado via GitHub Pages**.

---

## ⚙️ Stack Tecnológica

| Categoria | Tecnologia | Finalidade |
|------------|-------------|-------------|
| Framework | [React 18](https://react.dev/) | Criação da interface dinâmica e componentizada |
| Build Tool | [Vite](https://vitejs.dev/) | Compilação rápida e otimizada com HMR |
| Linguagem | TypeScript | Tipagem estática e robustez no desenvolvimento |
| UI Framework | [TailwindCSS](https://tailwindcss.com/) | Estilização responsiva e produtiva |
| Plugin React | `@vitejs/plugin-react-swc` | Compilador baseado em SWC para performance superior |
| Hospedagem | GitHub Pages | Deploy automatizado e CI/CD simplificado |
| Ícones | [Lucide React](https://lucide.dev/) | Ícones vetoriais modernos e leves |

---

## 🏗️ Estrutura de Pastas

```
compressorWeb/
├── public/                # Arquivos estáticos (favicon, manifest, etc.)
├── src/
│   ├── assets/            # Imagens e vetores
│   ├── components/        # Componentes reutilizáveis
│   ├── hooks/             # Hooks personalizados
│   ├── pages/             # Páginas principais do app
│   ├── utils/             # Funções auxiliares
│   ├── App.tsx            # Entry point do React
│   └── main.tsx           # Ponto de montagem principal
├── vite.config.ts         # Configuração de build, aliases e plugins
├── package.json           # Dependências e scripts
└── tsconfig.json          # Tipagem global TypeScript
```

---

## 🚀 Setup & Execução Local

### 1️⃣ Clonar o Repositório
```bash
git clone https://github.com/luizjxcoder/compressorWeb.git
cd compressorWeb
```

### 2️⃣ Instalar Dependências
```bash
npm install
```

### 3️⃣ Executar em Ambiente de Desenvolvimento
```bash
npm run dev
```
> O servidor local iniciará em `http://localhost:5173`

### 4️⃣ Gerar Build de Produção
```bash
npm run build
```

### 5️⃣ Visualizar Build Localmente
```bash
npm run preview
```

---

## 🧠 Arquitetura e Estratégia de Build

O arquivo `vite.config.ts` contém uma configuração adaptativa conforme o ambiente:

- **Modo Development:**
  - Desativa minificação para facilitar debug.
  - Mantém nomes de variáveis e JSX legíveis.
  - Define variáveis globais `__DEV__` e `process.env.NODE_ENV`.

- **Modo Produção:**
  - Build minificado e otimizado via SWC.
  - Caminho base configurado para `/compressorWeb/` (essencial para GitHub Pages).
  - Alias configurado: `@` → `/src`.

---

## 🧩 Git & CI/CD Workflow

O pipeline está estruturado para **deploy contínuo via GitHub Actions**:

```yaml
on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install and Build
        run: npm ci && npm run build
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

> Cada `push` no branch **main** dispara uma nova build e atualiza o site em produção automaticamente.

---

## 🧭 Diretrizes de Desenvolvimento

- Todos os commits devem seguir convenções **semânticas**, ex:
  - `feat:` novas funcionalidades  
  - `fix:` correções de bugs  
  - `chore:` manutenção e ajustes técnicos  
  - `docs:` atualização de documentação  

- Antes de qualquer commit:
  ```bash
  git pull origin main
  npm run build
  ```

- Todos os assets devem ser otimizados (compressão e cache-friendly).

---

## 📊 Roadmap Evolutivo

| Etapa | Objetivo | Status |
|--------|-----------|--------|
| 🔹 Versão MVP | Interface base e compressão local | ✅ Concluído |
| 🔹 Integração com APIs externas | Upload/download via APIs de terceiros | 🔄 Em progresso |
| 🔹 Dashboard de logs | Visualização de uso e compressões | ⏳ Planejado |
| 🔹 Suporte PWA | Uso offline e instalação em dispositivos | ⏳ Planejado |
| 🔹 Migração para Supabase backend | Gestão de usuários e storage persistente | ⏳ Avaliação |

---

## 🧰 Scripts NPM

| Comando | Descrição |
|----------|-----------|
| `npm run dev` | Inicia ambiente de desenvolvimento |
| `npm run build` | Gera build otimizada para produção |
| `npm run preview` | Simula build localmente |
| `npm run lint` | (opcional) Executa lint para padronização de código |

---

## 🧱 Boas Práticas de Código

- Componentes devem ser **funcionais** e **modulares**.  
- Utilizar **Hooks** para lógica de estado e efeitos colaterais.  
- Evitar CSS inline — preferir **Tailwind** ou **classes utilitárias**.  
- Imports relativos devem usar alias `@` para legibilidade.  
- Manter **tipagem forte** com TypeScript em todo o código base.

---

## 🧩 Conclusão Estratégica

O **CompressorWeb** é uma base sólida de frontend moderno, pronta para escalabilidade e integração futura com backends cloud (Supabase, Firebase, AWS, etc.).  
A arquitetura é modular, o CI/CD automatizado, e o stack tecnológico está alinhado às melhores práticas do mercado atual.

> **Visão 2025+**: Evoluir o projeto para um **SaaS de compressão inteligente**, com dashboards analíticos e integração IA para otimização automática de arquivos.

---

## 📄 Licença

Este projeto é licenciado sob a [MIT License](./LICENSE).

---

## 👤 Autor

**Luiz Alberto**  
Analista de Sistemas | Web Developer | Especialista em Growth e Design  
🔗 [GitHub](https://github.com/luizjxcoder)
