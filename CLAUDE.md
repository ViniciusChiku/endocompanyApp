# CLAUDE.md — Endocompany SuperApp

Diretrizes imperativas de TDD, Planejamento, Edições Cirúrgicas e Gestão de Memória para o **Endocompany SuperApp**.

## 🧠 Workflow Superpowers (Obrigatório)
1. **Brainstorm:** Se a tarefa for complexa ou ambígua, pergunte e alinhe as suposições com o usuário antes de codar.
2. **Plan First:** Mapeie os arquivos envolvidos e os passos atômicos em um checklist rápido antes de codar.
3. **TDD & Regressão:** 
   - Escreva um teste de unidade automatizado (em `src/services/rules.test.js` ou similar) reproduzindo o bug ou validando a nova função.
   - Execute o teste e garanta que ele falhou (Red).
   - Implemente apenas o código necessário para passar o teste (Green).
   - **Rode a suíte de testes completa** (`npm test`) para garantir regressão zero.
   - Refatore o código mantendo todos os testes passando (Refactor).
4. **Surgical Edits:** Altere apenas o necessário. Nunca mexa em formatação ou lógica de código adjacente que não pertença à tarefa.

## 🏛️ Histórico de Decisões (Escrito Automaticamente Pelo Agente)
*   **[2026-05-28]** Migrado o repositório completo do Endocompany SuperApp para a pasta projetos-antigravity e ativado o sistema de Skills de Desenvolvimento, Design e Segurança.
*   **[2026-05-28]** Executado **Security Ultrareview (Tier 2 - Deploy Audit)**. Instalado Java 25 (Microsoft OpenJDK 25) via `winget` como dependência mandatória da nova CLI do Firebase. Corrigido bug de setup no teste original do Vitest usando `withSecurityRulesDisabled`. Escritos 5 testes unitários de segurança baseados em TDD e atualizado o `firestore.rules` usando `.hasOnly()` para isolar mutações (auto-exclusão lógica restringindo campos extras, e inscrições de eventos protegendo metadados) e validações estruturais de strings para prevenir abusos/DoS em tickets públicos.
*   **[2026-05-28]** Expandido o **Security Ultrareview para a Fase 2 (Peso Pesado)**. Mapeada a porta `9199` no emulador de Storage e redirecionado o fluxo localmente via `process.env.FIREBASE_STORAGE_EMULATOR_HOST`. Prevenido erro de serialização do JSDOM definindo a diretiva `// @vitest-environment node` no topo de `rules.test.js`. Implementados Guardas de Segurança Nula em `storage.rules` para sanar crashes do motor CEL e adicionada trava de chaves permitidas em equipamentos e imutabilidade de UID em CPFs. Efetuado deploy das regras consolidadas do Firestore.
*   **[2026-05-29]** Executado e aprovado **Ultrareview (Tier 3 - Production Readiness)**. Realizada validação de build de produção local e aprovação de regressão nos testes de utilitários e 35 testes de segurança do Firebase. Resolvidos avisos do ESLint por edições estéticas e imports orfãos. Ajustada a função de navegação `voltarPainel` em `AppContext` para redirecionar sempre diretamente à Dashboard ('painel'). Efetuado commit atômico das alterações e deploy bem-sucedido no Firebase Hosting oficial (`endocompany-app`).



## 🛠️ Estilo de Código & Regras
- **Funções:** 4 a 20 linhas. Divida se passar disso.
- **Arquivos:** Menos de 300 linhas de código altamente coeso (SRP).
- **Tipagem Estrita:** Tipos obrigatórios em todas as declarações (JS/JSX com prop-types ou typescript se aplicável).
- **LOG:** Use logs estruturados em JSON para I/O.
- **Formatação:** Deixe o auto-formatter (`npm run lint` ou `prettier`) rodar no pre-commit. Sem edições estéticas manuais.
- **Chaves de API:** **PROIBIDO** chaves duras em código. Use `import.meta.env.VITE_FIREBASE_...` via `.env.local`.

## 🧪 Comandos do Projeto
- **Instalar:** `npm install`
- **Testar Tudo (Regressão):** `npm test`
- **Formatter / Lint:** `npm run lint`
- **Iniciar:** `npm run dev`
