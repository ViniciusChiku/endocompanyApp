# 🪐 Diretrizes de Desenvolvimento e Governança: `ANTIGRAVITY.md`
### 🧬 Projeto: Endocompany SuperApp

Este arquivo serve como o manual de regras, convenções técnicas e governança de contexto para mim (Antigravity, seu agente de IA com Gemini) especificamente para o projeto **Endocompany SuperApp**.

---

## 🛠️ 1. Comandos de Desenvolvimento e Build

*   **Executar em Modo de Desenvolvimento (Vite):** `npm run dev`
*   **Executar Testes Automatizados:** `npm test`
*   **Compilar para Produção (Build):** `npm run build`
*   **Verificar Erros de Formatação (Lint):** `npm run lint`

---

## 📐 2. Diretrizes Arquiteturais e de Código

*   **Pilha de Tecnologia:**
    *   **Frontend:** React 19 + Vite, React Simple Maps, Lucide React.
    *   **Backend / Serverless:** Firebase (Firestore com regras de segurança em `firestore.rules`).
    *   **Arquitetura:** Componentes modularizados divididos em `views/`, `components/`, `context/` e `services/`.
*   **Estilo e Legibilidade:**
    *   Manter o suporte a **Tema Escuro/Claro (Dark/Light Mode)** persistido no `localStorage`.
    *   Controlar rotas virtuais de SPA utilizando a API nativa do histórico do navegador (`window.history`).
*   **Segurança (Chaves Privadas):**
    *   **PROIBIDO** escrever chaves de API do Firebase diretamente no código de produção.
    *   Todas as chaves devem vir de variáveis de ambiente do Vite (`import.meta.env.VITE_FIREBASE_...`) a partir do arquivo `.env.local`.
    *   Garantir que o arquivo `.env.local` esteja listado no `.gitignore`.

---

## 🤖 3. O "Jeito Antigravity" de Programar (Modo Agente)

Sempre que eu (Antigravity) atuar neste repositório, devo seguir rigidamente estes passos:

1.  **Modo de Planejamento (Planning Mode):**
    *   Para qualquer alteração complexa, eu criarei um `implementation_plan.md` e pedirei seu feedback explícito antes de escrever código.
2.  **Execução via Checklist (`task.md`):**
    *   Controlarei os passos da entrega marcando `[x]` em tempo real para você acompanhar a execução.
3.  **Comando Seguro:**
    *   Todos os comandos de terminal gerados por mim via `run_command` exigirão a sua aprovação manual no PowerShell do VS Code.
4.  **Treinar, Não Apenas Consertar:**
    *   Se eu cometer um erro, me oriente a atualizar as regras deste arquivo ou do arquivo local correspondente, para que eu aprenda e não repita o erro.

---

## 🚀 4. Integração com GitHub Desktop e Versionamento

*   **Commits Atômicos:** Gerar sugestões de commits focados (ex: `feat: add calendar preventive sync trigger` ou `fix: resolve maps loading layout`).
*   **Sincronização:** Orientar o desenvolvedor a fazer commits e pushes granulares pelo GitHub Desktop a cada entrega testada com sucesso para manter o portfólio atualizado.
