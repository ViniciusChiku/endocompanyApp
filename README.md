# 🧬 Endocompany SuperApp - Portal de Operações e Simuladores Cirúrgicos

O **Endocompany SuperApp** é uma plataforma corporativa centralizada desenhada como um SuperApp operacional para gerenciar o ecossistema de **simuladores de cirurgia robótica e laparoscópica de alta tecnologia** (como *Robotix*, *Lap Mentor* e *Exact View*) comercializados para faculdades e hospitais de ponta.

A aplicação unifica o controle de ativos robóticos de alta tecnologia, automatiza o fluxo de manutenções preventivas, gerencia o estoque de peças sobressalentes, oferece um canal de inscrições para treinamentos e disponibiliza um portal de suporte técnico de missão crítica com simulador de SMTP/Logs integrados para apoiar a renovação de contratos de manutenção.

---

## 🚀 Principais Módulos do Sistema

*   **🤖 Controle de Ativos de Alta Tecnologia (Simuladores):**
    *   Painel completo de controle dos simuladores cirúrgicos ativos nos clientes. Permite associar números de série, localizações (hospitais/universidades) e modelos específicos de forma estruturada.
*   **📅 Calendário Inteligente de Manutenções Preventivas (Auto-Scheduling):**
    *   O sistema conta com um motor de agendamento automático de tarefas de rotina. Ao marcar uma preventiva técnica como concluída em um equipamento, as regras de negócio do app geram e agendam automaticamente a próxima revisão de preventiva de forma automática, garantindo que nenhum simulador cirúrgico fique sem calibração ou manutenção obrigatória.
*   **🩺 Portal de Chamados com Simulação SMTP & Logs de Disparo:**
    *   Clientes e hospitais podem abrir chamados de suporte técnico diretamente pela plataforma. 
    *   **Simulador de Infraestrutura:** O sistema exibe um terminal de log detalhado mostrando o trigger do Firestore enviando o registro em `/tickets` e simulando as saídas SMTP de e-mails corporativos em tempo real para a equipe de suporte técnico e de faturamento (essencial para coletar métricas no momento da renovação de contratos de assistência).
*   **🔧 Gestão de Estoque e Peças Sobressalentes (Estoque):**
    *   Inventário inteligente de peças de reposição e itens gerais de hardware, auxiliando no controle de estoque para visitas técnicas de reparo.
*   **🎓 Portal de Cursos e Treinamento em Cirurgia Robótica:**
    *   Área pública para que alunos, médicos e pesquisadores possam visualizar os cursos disponíveis nos simuladores e realizar suas inscrições diretamente.
*   **🔄 Sistema de Auto-Cura (Self-Healing) do Banco de Dados:**
    *   Controle automático de consistência de dados no Firebase Firestore. O sistema verifica em segundo plano a consistência das coleções públicas de equipamentos, coletando novos tipos de dados cadastrados e sincronizando-os automaticamente em listas públicas de consultas, impedindo inconsistências e dados órfãos.
*   **🗺️ Geolocalização Dinâmica:**
    *   Exibição e mapeamento dinâmico de dados geográficos usando a biblioteca `react-simple-maps`.

---

## 🛡️ Segurança & Privacidade (Conformidade LGPD)

O portal é estruturado sob as melhores práticas de segurança cibernética e em **estrita conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)**:

*   **🔒 Cabeçalhos HTTP de Segurança Avançada:**
    *   **Content-Security-Policy (CSP):** CSP rígido customizado para blindar a aplicação contra ataques XSS (Cross-Site Scripting), restringindo execuções de scripts locais e do ecossistema Google/Firebase.
    *   **X-Content-Type-Options (nosniff):** Impede mime-sniffing de arquivos.
    *   **X-Frame-Options (SAMEORIGIN):** Proteção integral contra sequestro de cliques (Clickjacking).
    *   **Referrer-Policy (strict-origin-when-cross-origin):** Controle rígido de vazamento de URLs de referência.
*   **📝 Consentimento Explícito (LGPD Art. 8º):**
    *   Checkboxes obrigatórios nos formulários de cadastro de novos usuários e na abertura de chamados por visitantes, vinculando o aceite da política de privacidade. O banco registra o timestamp e versão do consentimento.
*   **📥 Portabilidade & Direitos do Titular (LGPD Art. 18):**
    *   Subpainel **"Minha Privacidade"** na conta do cliente permitindo a exportação completa de seus dados pessoais em formato padronizado `.json` estruturado.
*   **⚠️ Eliminação e Auto-Anonimização permanente (LGPD Art. 18, VI):**
    *   Mecanismo reativo de exclusão que remove permanentemente o acesso do Firebase Auth e **anonimiza de forma irreversível** todos os dados cadastrais sensíveis no Firestore (Nome, Telefone, Endereço e E-mail convertidos para tags de anonimização), cumprindo a lei enquanto mantém a integridade de métricas e chamados anteriores sem identificação.
*   **🧑‍💼 Canal com o DPO (Encarregado):**
    *   Identificação do encarregado de dados e e-mail oficial do DPO (**`endocare@endocompany.com.br`**) integrado em rodapés informativos e nas políticas da aplicação.

---

## 🛠️ Stack Tecnológica

*   **Front-end:** React 19 (Moderna estruturação reativa) e React Simple Maps (Visualização cartográfica).
*   **Orquestração de Build:** Vite v8 (Build ultra rápido de última geração) e ESLint v10 (Políticas de lint corporativo).
*   **Banco de Dados & Servidor:** Firebase Firestore (Estruturado com regras de segurança estritas e personalizadas em `firestore.rules`).
*   **Autenticação:** Firebase Auth (Gerenciamento de regras de ADM, Funcionário e Leitura).
*   **Design & Tema:** Variáveis nativas modernas de CSS com suporte completo a **Tema Escuro/Claro (Dark/Light Mode)** persistido no `localStorage`.
*   **Navegação Robusta:** Controle virtual de histórico mapeado diretamente através da API nativa do navegador (`window.history`).

---

## 📦 Como Executar o Projeto Localmente

### Pré-requisitos
*   Node.js instalado.
*   Um projeto ativo configurado no console do Firebase.

### Passo 1: Instalar Dependências
No diretório do projeto, execute:
```bash
npm install
```

### Passo 2: Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto com as chaves do seu banco:
```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=sua_auth_domain
VITE_FIREBASE_PROJECT_ID=sua_project_id
VITE_FIREBASE_STORAGE_BUCKET=sua_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=sua_messaging_sender_id
VITE_FIREBASE_APP_ID=sua_app_id
```

### Passo 3: Executar em Modo de Desenvolvimento
```bash
npm run dev
```
O projeto estará rodando localmente no endereço exibido no terminal (geralmente [http://localhost:5173](http://localhost:5173)).

### Passo 4: Build de Produção
```bash
npm run build
```

---

## 👨‍💻 Metodologia de Desenvolvimento
Este software foi desenvolvido aplicando **Engenharia de Software Assistida por IA**, utilizando o **Antigravity com Gemini** como parceiro de desenvolvimento. O desenvolvedor atuou como Tech Lead e arquiteto de soluções, definindo os requisitos de negócio operacionais complexos, enquanto o código foi otimizado e estruturado de forma automatizada e revisado detalhadamente.
