// @vitest-environment node
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { describe, it, beforeAll, beforeEach, afterAll } from 'vitest';
import { setDoc, getDoc, updateDoc, deleteDoc, doc, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

let testEnv;

beforeAll(async () => {
  // Configura a variável de ambiente para que o cliente de Storage aponte localmente para o emulador
  process.env.FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199';

  // Carrega as regras de segurança locais do Firestore
  const firestoreRulesPath = path.resolve(__dirname, '../../firestore.rules');
  const firestoreRules = fs.readFileSync(firestoreRulesPath, 'utf8');

  // Carrega as regras de segurança locais do Storage
  const storageRulesPath = path.resolve(__dirname, '../../storage.rules');
  const storageRules = fs.readFileSync(storageRulesPath, 'utf8');
  
  testEnv = await initializeTestEnvironment({
    projectId: 'endocompany-app',
    firestore: {
      rules: firestoreRules,
      host: '127.0.0.1',
      port: 8080,
    },
    storage: {
      rules: storageRules,
      host: '127.0.0.1',
      port: 9199,
    }
  });
});

beforeEach(async () => {
  // Limpa o banco de dados antes de cada teste para evitar contaminação
  await testEnv.clearFirestore();
});

afterAll(async () => {
  // Finaliza o ambiente de testes
  await testEnv.cleanup();
});

describe('Firestore Security Rules', () => {
  
  // ─────────────────────────────────────────────────────────
  // COLEÇÃO: usuarios
  // ─────────────────────────────────────────────────────────
  describe('Coleção: usuarios', () => {
    it('deve permitir que usuário autenticado leia seu próprio perfil', async () => {
      const aliceDb = testEnv.authenticatedContext('alice', { role: 'Comum' }).firestore();
      const profileDoc = doc(aliceDb, 'usuarios/alice');
      
      await assertSucceeds(getDoc(profileDoc));
    });

    it('deve impedir que usuário comum leia o perfil de outro usuário', async () => {
      const aliceDb = testEnv.authenticatedContext('alice', { role: 'Comum' }).firestore();
      const bobDoc = doc(aliceDb, 'usuarios/bob');
      
      await assertFails(getDoc(bobDoc));
    });

    it('deve permitir que ADM leia qualquer perfil de usuário', async () => {
      const adminDb = testEnv.authenticatedContext('admin-user', { role: 'ADM' }).firestore();
      const bobDoc = doc(adminDb, 'usuarios/bob');
      
      await assertSucceeds(getDoc(bobDoc));
    });

    it('deve permitir que usuário comum crie seu perfil com a role Comum', async () => {
      const aliceDb = testEnv.authenticatedContext('alice').firestore();
      const profileDoc = doc(aliceDb, 'usuarios/alice');
      
      await assertSucceeds(
        setDoc(profileDoc, {
          nome: 'Alice',
          role: 'Comum',
        })
      );
    });

    it('deve impedir que usuário comum crie seu perfil com a role ADM se o setup já existir', async () => {
      // Cria a configuração de setup no banco primeiro
      const adminDb = testEnv.authenticatedContext('admin-user', { role: 'ADM' }).firestore();
      await setDoc(doc(adminDb, 'config/setup'), { initialized: true });

      const aliceDb = testEnv.authenticatedContext('alice').firestore();
      const profileDoc = doc(aliceDb, 'usuarios/alice');
      
      await assertFails(
        setDoc(profileDoc, {
          nome: 'Alice',
          role: 'ADM',
        })
      );
    });

    it('deve impedir que usuário altere sua própria role na atualização', async () => {
      const aliceDb = testEnv.authenticatedContext('alice', { role: 'Comum' }).firestore();
      const profileDoc = doc(aliceDb, 'usuarios/alice');
      
      // Setup inicial usando contexto sem regras (admin)
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await setDoc(doc(adminDb, 'usuarios/alice'), { nome: 'Alice', role: 'Comum' });
      });

      await assertFails(
        updateDoc(profileDoc, {
          role: 'ADM',
        })
      );
    });

    it('deve impedir que usuário crie seu perfil diretamente com a role Excluido', async () => {
      const aliceDb = testEnv.authenticatedContext('alice').firestore();
      const profileDoc = doc(aliceDb, 'usuarios/alice');
      
      await assertFails(
        setDoc(profileDoc, {
          nome: 'Alice',
          role: 'Excluido',
        })
      );
    });

    it('deve permitir que usuário altere sua role para Excluido na auto-exclusão lógica', async () => {
      const aliceDb = testEnv.authenticatedContext('alice', { role: 'Comum' }).firestore();
      const profileDoc = doc(aliceDb, 'usuarios/alice');
      
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'usuarios/alice'), { nome: 'Alice', role: 'Comum' });
      });

      await assertSucceeds(
        updateDoc(profileDoc, {
          role: 'Excluido',
        })
      );
    });

    it('deve impedir que usuário altere outros campos sensíveis ao mudar para a role Excluido', async () => {
      const aliceDb = testEnv.authenticatedContext('alice', { role: 'Comum' }).firestore();
      const profileDoc = doc(aliceDb, 'usuarios/alice');
      
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'usuarios/alice'), { nome: 'Alice', role: 'Comum', email: 'alice@endo.com' });
      });

      // Tenta burlar alterando o e-mail em paralelo com a exclusão
      await assertFails(
        updateDoc(profileDoc, {
          role: 'Excluido',
          email: 'hacker@endo.com',
        })
      );
    });

    it('deve impedir qualquer deleção de usuários', async () => {
      const adminDb = testEnv.authenticatedContext('admin-user', { role: 'ADM' }).firestore();
      const aliceDoc = doc(adminDb, 'usuarios/alice');
      
      await assertFails(deleteDoc(aliceDoc));
    });
  });

  // ─────────────────────────────────────────────────────────
  // COLEÇÃO: cpfs
  // ─────────────────────────────────────────────────────────
  describe('Coleção: cpfs', () => {
    it('deve permitir que usuário crie seu registro de CPF desde que o vincule ao seu próprio UID', async () => {
      const aliceDb = testEnv.authenticatedContext('alice').firestore();
      const cpfDoc = doc(aliceDb, 'cpfs/12345678900');
      
      await assertSucceeds(
        setDoc(cpfDoc, {
          uid: 'alice',
        })
      );
    });

    it('deve impedir que usuário altere o campo uid de seu CPF (imutabilidade avançada)', async () => {
      const aliceDb = testEnv.authenticatedContext('alice').firestore();
      const cpfDoc = doc(aliceDb, 'cpfs/12345678900');
      
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'cpfs/12345678900'), { uid: 'alice' });
      });

      await assertFails(
        updateDoc(cpfDoc, {
          uid: 'bob',
        })
      );
    });
  });

  // ─────────────────────────────────────────────────────────
  // COLEÇÃO: tickets
  // ─────────────────────────────────────────────────────────
  describe('Coleção: tickets', () => {
    it('deve permitir que qualquer pessoa (mesmo não logada) crie um ticket', async () => {
      const anonDb = testEnv.unauthenticatedContext().firestore();
      const ticketDoc = doc(collection(anonDb, 'tickets'));
      
      await assertSucceeds(
        setDoc(ticketDoc, {
          titulo: 'Problema no Simulador',
          descricao: 'Simulador não liga',
          criadoEm: new Date(),
        })
      );
    });

    it('deve impedir a criação de tickets com título abusivo (> 100 caracteres)', async () => {
      const anonDb = testEnv.unauthenticatedContext().firestore();
      const ticketDoc = doc(collection(anonDb, 'tickets'));
      
      await assertFails(
        setDoc(ticketDoc, {
          titulo: 'T'.repeat(101),
          descricao: 'Problema no Simulador',
          criadoEm: new Date(),
        })
      );
    });

    it('deve impedir a criação de tickets com descrição abusiva (> 1000 caracteres)', async () => {
      const anonDb = testEnv.unauthenticatedContext().firestore();
      const ticketDoc = doc(collection(anonDb, 'tickets'));
      
      await assertFails(
        setDoc(ticketDoc, {
          titulo: 'Simulador Quebrado',
          descricao: 'D'.repeat(1001),
          criadoEm: new Date(),
        })
      );
    });

    it('deve impedir a criação de tickets com tipos de dados inválidos', async () => {
      const anonDb = testEnv.unauthenticatedContext().firestore();
      const ticketDoc = doc(collection(anonDb, 'tickets'));
      
      await assertFails(
        setDoc(ticketDoc, {
          titulo: 12345, // Espera string
          descricao: 'Descrição do ticket',
          criadoEm: new Date(),
        })
      );
    });

    it('deve impedir que usuário comum leia ou liste tickets', async () => {
      const aliceDb = testEnv.authenticatedContext('alice', { role: 'Comum' }).firestore();
      const ticketDoc = doc(aliceDb, 'tickets/ticket123');
      
      await assertFails(getDoc(ticketDoc));
      await assertFails(getDocs(collection(aliceDb, 'tickets')));
    });

    it('deve permitir que Funcionário leia e gerencie tickets', async () => {
      const staffDb = testEnv.authenticatedContext('staff-user', { role: 'Funcionario' }).firestore();
      const ticketDoc = doc(staffDb, 'tickets/ticket123');
      
      await assertSucceeds(getDoc(ticketDoc));
    });
  });

  // ─────────────────────────────────────────────────────────
  // COLEÇÃO: equipamentos_endocompany
  // ─────────────────────────────────────────────────────────
  describe('Coleção: equipamentos_endocompany', () => {
    it('deve permitir que staff crie equipamentos com esquema de chaves válido', async () => {
      const staffDb = testEnv.authenticatedContext('staff', { role: 'Funcionario' }).firestore();
      const equipDoc = doc(staffDb, 'equipamentos_endocompany/equip123');
      
      await assertSucceeds(
        setDoc(equipDoc, {
          serial: 'SER123456',
          local: 'Centro Clínico Alfa',
          status_equipamento: 'Equipamento Funcionando',
        })
      );
    });

    it('deve impedir que staff crie equipamentos injetando chaves extras no esquema', async () => {
      const staffDb = testEnv.authenticatedContext('staff', { role: 'Funcionario' }).firestore();
      const equipDoc = doc(staffDb, 'equipamentos_endocompany/equip123');
      
      await assertFails(
        setDoc(equipDoc, {
          serial: 'SER123456',
          local: 'Centro Clínico Alfa',
          status_equipamento: 'Equipamento Funcionando',
          admin_bypass: true, // Injeção maliciosa de propriedade não listada
          custo_aquisicao: 999999,
        })
      );
    });
  });

  // ─────────────────────────────────────────────────────────
  // COLEÇÃO: eventos_endocompany
  // ─────────────────────────────────────────────────────────
  describe('Coleção: eventos_endocompany', () => {
    it('deve permitir que usuário autenticado leia eventos', async () => {
      const aliceDb = testEnv.authenticatedContext('alice', { role: 'Comum' }).firestore();
      const eventDoc = doc(aliceDb, 'eventos_endocompany/evento123');
      
      await assertSucceeds(getDoc(eventDoc));
    });

    it('deve impedir que usuário comum crie ou delete eventos', async () => {
      const aliceDb = testEnv.authenticatedContext('alice', { role: 'Comum' }).firestore();
      const eventDoc = doc(aliceDb, 'eventos_endocompany/evento123');
      
      await assertFails(
        setDoc(eventDoc, {
          titulo: 'Treinamento de Endoscopia',
          data: '2026-06-01',
          inscritos: [],
        })
      );
      
      await assertFails(deleteDoc(eventDoc));
    });

    it('deve permitir que staff crie eventos', async () => {
      const staffDb = testEnv.authenticatedContext('staff-user', { role: 'Funcionario' }).firestore();
      const eventDoc = doc(staffDb, 'eventos_endocompany/evento123');
      
      await assertSucceeds(
        setDoc(eventDoc, {
          titulo: 'Treinamento de Endoscopia',
          data: '2026-06-01',
          inscritos: [],
        })
      );
    });

    it('deve permitir que usuário comum se inscreva no evento (alterando apenas inscritos)', async () => {
      const aliceDb = testEnv.authenticatedContext('alice', { role: 'Comum' }).firestore();
      const eventDoc = doc(aliceDb, 'eventos_endocompany/evento123');
      
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'eventos_endocompany/evento123'), {
          titulo: 'Treinamento de Endoscopia',
          data: '2026-06-01',
          inscritos: ['bob'],
        });
      });

      await assertSucceeds(
        updateDoc(eventDoc, {
          inscritos: ['bob', 'alice'],
        })
      );
    });

    it('deve impedir que usuário comum altere metadados do evento (titulo) na atualização', async () => {
      const aliceDb = testEnv.authenticatedContext('alice', { role: 'Comum' }).firestore();
      const eventDoc = doc(aliceDb, 'eventos_endocompany/evento123');
      
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'eventos_endocompany/evento123'), {
          titulo: 'Treinamento de Endoscopia',
          data: '2026-06-01',
          inscritos: [],
        });
      });

      await assertFails(
        updateDoc(eventDoc, {
          titulo: 'Título Hackeado!',
        })
      );
    });
  });

  // ─────────────────────────────────────────────────────────
  // COLEÇÃO: logs_auditoria
  // ─────────────────────────────────────────────────────────
  describe('Coleção: logs_auditoria', () => {
    it('deve permitir que usuário autenticado crie um log', async () => {
      const aliceDb = testEnv.authenticatedContext('alice', { role: 'Comum' }).firestore();
      const logDoc = doc(collection(aliceDb, 'logs_auditoria'));
      
      await assertSucceeds(
        setDoc(logDoc, {
          acao: 'login',
          timestamp: new Date(),
        })
      );
    });

    it('deve impedir que qualquer pessoa (incluindo ADM) leia logs diretamente no cliente', async () => {
      const adminDb = testEnv.authenticatedContext('admin-user', { role: 'ADM' }).firestore();
      const logDoc = doc(adminDb, 'logs_auditoria/log123');
      
      await assertFails(getDoc(logDoc));
      await assertFails(getDocs(collection(adminDb, 'logs_auditoria')));
    });
  });

  // ─────────────────────────────────────────────────────────
  // REGRA PADRÃO (BLOQUEIO)
  // ─────────────────────────────────────────────────────────
  describe('Regra Padrão: Bloqueio de Coleções não Declaradas', () => {
    it('deve bloquear leitura e escrita em coleções aleatórias', async () => {
      const adminDb = testEnv.authenticatedContext('admin-user', { role: 'ADM' }).firestore();
      const secretDoc = doc(adminDb, 'dados_secretos/segredo');
      
      await assertFails(getDoc(secretDoc));
      await assertFails(setDoc(secretDoc, { dados: 'confidenciais' }));
    });
  });
});

// ═══════════════════════════════════════════════
// FIREBASE STORAGE SECURITY RULES
// ═══════════════════════════════════════════════
describe('Firebase Storage Security Rules', () => {
  it('deve impedir que usuário comum ou anônimo faça upload de relatórios', async () => {
    const aliceStorage = testEnv.authenticatedContext('alice', { role: 'Comum' }).storage();
    const fileRef = aliceStorage.ref('relatorios_preventivas/relatorio1.pdf');

    await assertFails(fileRef.putString('dummy content', 'raw', { contentType: 'application/pdf' }));
  });

  it('deve impedir que usuário comum ou anônimo leia relatórios', async () => {
    const aliceStorage = testEnv.authenticatedContext('alice', { role: 'Comum' }).storage();
    const fileRef = aliceStorage.ref('relatorios_preventivas/relatorio1.pdf');

    await assertFails(fileRef.getMetadata());
  });

  it('deve permitir que staff faça upload de PDF válido com menos de 10MB', async () => {
    const staffStorage = testEnv.authenticatedContext('staff', { role: 'Funcionario' }).storage();
    const fileRef = staffStorage.ref('relatorios_preventivas/relatorio1.pdf');

    await assertSucceeds(fileRef.putString('dummy content', 'raw', { contentType: 'application/pdf' }));
  });

  it('deve impedir que staff faça upload de arquivo maior que 10MB', async () => {
    const staffStorage = testEnv.authenticatedContext('staff', { role: 'Funcionario' }).storage();
    const fileRef = staffStorage.ref('relatorios_preventivas/relatorioHuge.pdf');
    
    // Simula tamanho superior a 10MB usando string repetida
    const hugeData = 'A'.repeat(10 * 1024 * 1024 + 1);

    await assertFails(fileRef.putString(hugeData, 'raw', { contentType: 'application/pdf' }));
  });

  it('deve impedir que staff faça upload de arquivo não-PDF (ex: executável ou script)', async () => {
    const staffStorage = testEnv.authenticatedContext('staff', { role: 'Funcionario' }).storage();
    
    const fileRefExe = staffStorage.ref('relatorios_preventivas/exploit.exe');
    const fileRefJs = staffStorage.ref('relatorios_preventivas/exploit.js');

    await assertFails(fileRefExe.putString('exe content', 'raw', { contentType: 'application/octet-stream' }));
    await assertFails(fileRefJs.putString('js content', 'raw', { contentType: 'text/javascript' }));
  });

  it('deve impedir que staff delete relatórios', async () => {
    const staffStorage = testEnv.authenticatedContext('staff', { role: 'Funcionario' }).storage();
    const fileRef = staffStorage.ref('relatorios_preventivas/relatorio1.pdf');

    await assertFails(fileRef.delete());
  });

  it('deve permitir que administrador delete relatórios', async () => {
    // Primeiro fazemos o upload usando staff
    const staffStorage = testEnv.authenticatedContext('staff', { role: 'Funcionario' }).storage();
    const staffRef = staffStorage.ref('relatorios_preventivas/relatorioDelete.pdf');
    await assertSucceeds(staffRef.putString('dummy delete content', 'raw', { contentType: 'application/pdf' }));

    // Agora deletamos como admin
    const adminStorage = testEnv.authenticatedContext('admin', { role: 'ADM' }).storage();
    const adminRef = adminStorage.ref('relatorios_preventivas/relatorioDelete.pdf');

    await assertSucceeds(adminRef.delete());
  });
});
