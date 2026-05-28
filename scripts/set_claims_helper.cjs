/**
 * Script Utilitário: set_claims_helper.cjs
 * 
 * Este script permite atribuir Custom Claims (Reivindicações Personalizadas) como cargos ('ADM', 'Funcionario', 'Comum')
 * para o UID do usuário do Firebase Auth. Isso é essencial para as regras de segurança.
 * 
 * USO LOCAL/PRODUÇÃO:
 * 1. Obtenha a chave de conta de serviço (serviceAccountKey.json) no console do Firebase:
 *    Configurações do Projeto -> Contas de Serviço -> Gerar nova chave privada.
 * 2. Salve o arquivo JSON na mesma pasta deste script com o nome 'serviceAccountKey.json'.
 * 3. Execute no seu terminal:
 *    node scripts/set_claims_helper.cjs
 */

const admin = require('firebase-admin');

// CONFIGURAÇÕES DINÂMICAS VIA TERMINAL
// Uso: node scripts/set_claims_helper.cjs <UID> <CARGO>
const args = process.argv.slice(2);
const USER_UID = args[0] || 'HfwwaFtLXmfVrq5vi687bHgnAHj2'; // UID padrão ou recebido via parâmetro
const ROLE_TO_SET = args[1] || 'ADM'; // Cargo padrão ou recebido via parâmetro (ADM | Funcionario | Comum)

console.log(`💡 Dica de uso: node scripts/set_claims_helper.cjs <UID> <CARGO>`);
console.log(`💡 Exemplo: node scripts/set_claims_helper.cjs UID_DE_OUTRO_USUARIO Funcionario\n`);

// 1. Inicializa o SDK Admin do Firebase
try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error("❌ ERRO: Arquivo 'serviceAccountKey.json' não encontrado na pasta 'scripts/'.");
  console.error("Por favor, gere e salve a chave de conta de serviço no console do Firebase para rodar o script administrativo em produção.");
  process.exit(1);
}

// 2. Define as Custom Claims
async function setCustomClaims() {
  console.log(`⏳ Definindo cargo '${ROLE_TO_SET}' para o usuário UID: ${USER_UID}...`);
  try {
    await admin.auth().setCustomUserClaims(USER_UID, { role: ROLE_TO_SET });
    console.log(`✅ SUCESSO: Cargo definido com êxito!`);
    
    // Verifica se as claims foram salvas corretamente
    const userRecord = await admin.auth().getUser(USER_UID);
    console.log("🔍 Claims atuais atribuídas ao usuário:", userRecord.customClaims);
    console.log("\n💡 Nota: Para que a alteração tenha efeito na UI cliente, o usuário precisará fazer logout e login novamente ou forçar a atualização do token.");
  } catch (error) {
    console.error("❌ Erro ao definir claims:", error.message);
  } finally {
    process.exit(0);
  }
}

setCustomClaims();
