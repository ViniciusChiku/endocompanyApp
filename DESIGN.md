# DESIGN.md — Endocompany SuperApp Design System

Este documento define as diretrizes visuais e componentes de UI para o **Endocompany SuperApp**.

---

## 🎨 Identidade Visual & Tema
- **Estilo Visual:** Sleek Modern Tech Dashboard com suporte a **Tema Escuro/Claro (Dark/Light Mode)** persistido no `localStorage`.
- **Componentes Visuais:** Lucide React para ícones, React Simple Maps para visualização geográfica do Brasil.

---

## 🎛️ Color Palette Tokens (HSL)
As cores são gerenciadas de forma dinâmica no `index.css`:

- **Modo Escuro (Padrão):**
  - **Fundo Principal:** HSL 220 15% 8% (cinza azulado escuro)
  - **Fundo de Cards (Surface):** HSL 220 12% 14%
  - **Textos Dominantes:** HSL 220 10% 95%
- **Modo Claro:**
  - **Fundo Principal:** HSL 220 15% 98%
  - **Fundo de Cards (Surface):** HSL 0 0% 100%
  - **Textos Dominantes:** HSL 220 15% 15%
- **Cores Globais do Brand:**
  - **Primária:** HSL 260 85% 65% (Violeta vibrante)
  - **Acento/Estados:** HSL 160 85% 55% (Verde esmeralda para status e sucesso)

---

## 🔤 Tipografia (Google Fonts)
- **Família de Fontes:** Outfit (Headings) e Inter (Body Text).
- **Line Height:** `line-height: 1.5` ou `1.6` para leitura premium.

---

## 🏎️ Interações & Micro-Animações
- **Hover Scale:** Efeito de elevação suave em cards e botões.
- **Click Feedback:** Press-scale `active: scale(0.98)` para feedback tátil.
- **Transições:** Suaves utilizando `cubic-bezier(0.4, 0, 0.2, 1)` em mudanças de tema e abas.
- **History Navigation:** Rotas virtuais integradas ao histórico (`popstate` e botão lateral do mouse) para fechar modais e retroceder visualizações sem recarregar.
