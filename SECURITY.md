# SECURITY.md — Endocompany Security & LGPD Ledger

Este documento mapeia as regras estritas de segurança da informação, privacidade de dados e conformidade com a LGPD implementadas no **Endocompany SuperApp**.

---

## 🔒 Mapa de Privacidade de Dados (LGPD)
- **Minimização de CPFs (Coleção `cpfs`):** Garante a unicidade cadastral. O usuário autenticado pode fazer a busca individual (`allow get`), mas a varredura completa da base é expressamente proibida (`allow list: if false;`), evitando vazamentos em massa.
- **Isolamento de Usuários (Coleção `usuarios`):** Apenas o próprio usuário ou administradores (`isAdmin()`) podem ler perfis individuais. Regras de escrita impedem a alteração do campo `role` pelo próprio usuário comum (bloqueando auto-promoção).
- **Direito ao Esquecimento (Anonymization):** Em conformidade com a LGPD, a alteração cadastral permite marcar a conta com a tag `Excluido` mantendo a segurança e integridade das chaves.

---

## 🛡️ Segurança de Banco de Dados & Firewall (Firestore)
- **Configuração:** Gerenciada via `firestore.rules`.
- **Trilha de Auditoria Imutável (Coleção `logs_auditoria`):** Permite escrita assíncrona (`allow create: if isAuthenticated();`), mas bloqueia 100% de leitura, deleção e atualização pelo lado do cliente. Registros imutáveis e auditáveis contra adulterações.
- **Sanitização contra Injeções:** Coleções estritas de equipamentos validam tipos de variáveis e limitam o tamanho máximo das strings (ex: `serial.size() <= 20` e enums fechados para estados de equipamentos).
- **Bloqueio Padrão (Default Deny):** O arquivo conclui bloqueando qualquer rota não declarada por padrão.

---

## 📁 Segurança de Arquivos (Storage)
- **Configuração:** Gerenciada via `storage.rules`.
- **Diretório `relatorios_preventivas/`:** 
  - Restrito a funcionários e ADMs (`isStaff()`).
  - Limite estrito de tamanho de arquivo (`< 10 MB`).
  - Mime-Type rigidamente validado para **apenas PDFs** (`application/pdf`), blindando o servidor contra injeções de scripts executáveis (.exe, .js) maliciosos.
  - Deleção restrita a administradores.

---

## 🏛️ Histórico de Segurança (Escrito Automaticamente Pelo Agente)
*   **[2026-05-28]** Migrado o repositório de segurança e ativado o monitoramento e auditoria automática do Gemini 3.5 Flash para pre-push/deploy.
*   **[2026-05-28]** Executado **Security Ultrareview (Tier 2 - Deploy Audit)**. Mapeadas, demonstradas em TDD (24 testes unitários) e corrigidas com sucesso as seguintes vulnerabilidades em `firestore.rules`:
    *   *Sanitização & Prevenção de Spam em Tickets:* Enrijecida a criação anônima de chamados em `/tickets` exigindo tipos string válidos e limites estritos de tamanho (titulo <= 100 caracteres, descricao <= 1000 caracteres), neutralizando riscos de DoS/Spam.
    *   *Privacidade & Integridade na Auto-Exclusão:* Blindado o processo de exclusão lógica em `/usuarios` garantindo que a mudança de role para `'Excluido'` ocorra estritamente sem alteração ou injeção de outros dados confidenciais usando `affectedKeys().hasOnly(['role'])`.
    *   *Controle de Acesso de Atributos de Eventos:* Protegidos os metadados de `/eventos_endocompany` de forma que usuários não-staff apenas consigam se inscrever (afetar exclusivamente a chave `inscritos` com `affectedKeys().hasOnly(['inscritos'])`), impedindo a adulteração do título, data ou autoria.
*   **[2026-05-28]** Executado **Security Ultrareview Fase 2 (Peso Pesado)**. Ampliada a suíte para **35 testes unitários de segurança** integrando a cobertura de regras do Firebase Storage sob o ambiente Node.js. Corrigidas e validadas as seguintes vulnerabilidades de segurança avançadas:
    *   *Prevenção de Sequestro de CPF no Firestore:* Imposta a imutabilidade absoluta do campo `uid` na coleção `/cpfs` durante atualizações para impedir a transferência ilícita de propriedade de CPF entre usuários.
    *   *Esquema Estrito em Equipamentos no Firestore:* Adicionada trava de chaves permitidas em `/equipamentos_endocompany` via `keys().hasOnly(['serial', 'local', 'status_equipamento'])` para neutralizar a injeção de propriedades maliciosas extras (como flags de bypass).
    *   *Resiliência e Correção de Runtime no Storage:* Desmembrada a regra `write` em `create, update` e `delete` em `/relatorios_preventivas` para evitar exceções nulas no motor CEL durante exclusões, e implementados Guardas de Segurança Nula (`!= null`) para blindar o upload de PDFs contra ruídos/erros de serialização.


