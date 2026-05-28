import { collection, getDocs, addDoc } from 'firebase/firestore';

/**
 * Rotina de Auto-Cura (Self-Healing):
 * Compara as categorias cadastradas na coleção 'tipos_equipamento' com os tipos
 * cadastrados nos documentos da coleção 'equipamentos_endocompany' e atualiza
 * automaticamente as categorias públicas para evitar dados órfãos.
 * 
 * @param {import("firebase/firestore").Firestore} db - A instância do Firestore
 * @returns {Promise<number>} Quantidade de novas categorias adicionadas
 */
export const sincronizarTiposEquipamento = async (db) => {
  try {
    console.log("🔄 [SYNC SYSTEM] Iniciando verificação e sincronização de tipos de equipamento...");
    
    // 1. Ler tipos já cadastrados na coleção 'tipos_equipamento'
    const snapTipos = await getDocs(collection(db, 'tipos_equipamento'));
    const tiposNoBanco = [];
    snapTipos.forEach((docSnap) => {
      const nome = docSnap.data().nome;
      if (nome) tiposNoBanco.push(nome.trim().toLowerCase());
    });

    // 2. Coletar tipos do cadastro de equipamentos (equipamentos_endocompany)
    const snapEquipamentos = await getDocs(collection(db, 'equipamentos_endocompany'));
    const tiposColetados = new Set();
    snapEquipamentos.forEach((docSnap) => {
      const tipo = docSnap.data().tipo_equipamento;
      if (tipo) tiposColetados.add(tipo.trim());
    });

    // Adicionar padrões (Robotix, Lap Mentor, Exact View) como garantia
    const padroes = ["Exact View", "Lap Mentor", "Robotix", "Robotix + Lap Mentor"];
    padroes.forEach(p => tiposColetados.add(p));

    // 3. Cadastrar novos tipos que ainda não existem na coleção pública
    let novosCadastrados = 0;
    for (let tipo of tiposColetados) {
      const tipoLower = tipo.toLowerCase();
      if (!tiposNoBanco.includes(tipoLower)) {
        console.log(`🆕 [SYNC SYSTEM] Adicionando novo tipo público ao banco: "${tipo}"`);
        await addDoc(collection(db, 'tipos_equipamento'), { nome: tipo });
        novosCadastrados++;
      }
    }
    console.log(`✅ [SYNC SYSTEM] Sincronização de tipos finalizada! Novos tipos adicionados: ${novosCadastrados}`);
    return novosCadastrados;
  } catch (err) {
    console.error("❌ [SYNC SYSTEM] Erro durante a sincronização de tipos:", err);
    throw err;
  }
};
