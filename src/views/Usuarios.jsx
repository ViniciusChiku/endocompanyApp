import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy, addDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useUI } from '../context/UIContext';

export default function Usuarios() {
  const { showToast, showConfirm } = useUI();
  const { user: currentUser } = useAuth();
  const { voltarPainel } = useApp();
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscaTexto, setBuscaTexto] = useState('');
  const [salvandoId, setSalvandoId] = useState(null);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  const buscarUsuarios = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'usuarios'), orderBy('email', 'asc'));
      const snap = await getDocs(q);
      const users = [];
      snap.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      setListaUsuarios(users);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setMensagem({ tipo: 'erro', texto: 'Não foi possível carregar a lista de usuários.' });
    }
    setLoading(false);
  };

  useEffect(() => {
    buscarUsuarios();
  }, []);

  const handleAlterarRole = async (userId, userEmail, novaRole) => {
    if (userId === currentUser.uid) {
      showToast("Você não pode alterar o seu próprio tipo de usuário!", "warning");
      return;
    }

    const confirmar = await showConfirm(`Deseja alterar a função de "${userEmail}" para "${novaRole}"?`, {
      title: "Alterar Permissão",
      confirmText: "Sim, alterar",
      cancelText: "Cancelar"
    });
    if (!confirmar) {
      // Re-fetch users to reset select dropdown visual if cancelled
      buscarUsuarios();
      return;
    }

    setSalvandoId(userId);
    setMensagem({ tipo: '', texto: '' });
    try {
      const docRef = doc(db, 'usuarios', userId);
      await updateDoc(docRef, { role: novaRole });
      
      // Grava log de auditoria no Firestore para a LGPD
      try {
        await addDoc(collection(db, 'logs_auditoria'), {
          acao: 'alteracao_permissao',
          realizadoPor: currentUser.uid,
          realizadoPorEmail: currentUser.email,
          usuarioAfetadoId: userId,
          usuarioAfetadoEmail: userEmail,
          novaRole: novaRole,
          data: new Date(),
          detalhes: `Função de acesso de ${userEmail} alterada para ${novaRole} pelo administrador.`
        });
      } catch (logErr) {
        console.error("Erro ao registrar log de auditoria de alteração de permissão:", logErr);
      }
      
      setMensagem({ tipo: 'sucesso', texto: `Função de ${userEmail} alterada para ${novaRole}!` });
      buscarUsuarios(); // Recarrega a lista
    } catch (error) {
      console.error("Erro ao alterar função:", error);
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar a alteração de permissão.' });
      setSalvandoId(null);
    }
  };

  const usuariosFiltrados = listaUsuarios.filter((u) => {
    return (u.email || '').toLowerCase().includes(buscaTexto.toLowerCase());
  });

  const getRoleBadgeClass = (role) => {
    if (role === 'ADM') return 'badge-role badge-role-adm';
    if (role === 'Funcionario') return 'badge-role badge-role-funcionario';
    return 'badge-role badge-role-comum';
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 0' }}>
      
      {/* CABEÇALHO UNIFICADO */}
      <div style={toolbarStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
          <button onClick={voltarPainel} style={btnVoltarStyle}>
            ← Voltar ao Painel
          </button>
          <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '26px', fontWeight: 'bold' }}>
            Gerenciamento de Usuários
          </h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
            Apenas administradores podem gerenciar permissões de acesso.
          </p>
        </div>
      </div>

      {mensagem.texto && (
        <div style={{ marginBottom: '20px' }} className={`alert-box alert-${mensagem.tipo === 'sucesso' ? 'success' : 'error'}`}>
          {mensagem.tipo === 'sucesso' ? '✅' : '❌'} {mensagem.texto}
        </div>
      )}

      <div style={cardStyle} className="app-card">
        
        {/* BUSCA */}
        <div style={{ marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="🔍 Buscar usuário por e-mail..." 
            value={buscaTexto} 
            onChange={(e) => setBuscaTexto(e.target.value)} 
            style={inputBuscaStyle} 
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <h3 style={{ color: '#00d084' }}>Carregando usuários...</h3>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
            Nenhum usuário cadastrado ou correspondente à busca.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>E-mail</th>
                  <th>Função Atual</th>
                  <th style={{ width: '220px', textAlign: 'center' }}>Alterar Função</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((u) => {
                  const ehProprioUsuario = u.id === currentUser.uid;
                  return (
                    <tr key={u.id}>
                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>{u.email}</strong>
                        {ehProprioUsuario && <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>(você)</span>}
                      </td>
                      <td>
                        <span className={getRoleBadgeClass(u.role)}>
                          {u.role || 'Comum'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <select 
                          value={u.role || 'Comum'} 
                          disabled={ehProprioUsuario || salvandoId === u.id}
                          onChange={(e) => handleAlterarRole(u.id, u.email, e.target.value)}
                          style={{
                            ...selectStyle,
                            opacity: ehProprioUsuario ? 0.6 : 1,
                            cursor: ehProprioUsuario ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <option value="Comum">Comum</option>
                          <option value="Funcionario">Funcionário</option>
                          <option value="ADM">Administrador (ADM)</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Estilos locais elegantes
const toolbarStyle = {
  backgroundColor: 'var(--bg-card)',
  padding: '24px 28px',
  borderRadius: '16px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
  marginBottom: '24px',
  border: '1px solid var(--border-light)'
};

const btnVoltarStyle = {
  padding: '8px 16px',
  backgroundColor: '#64748b',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  marginBottom: '10px'
};

const cardStyle = {
  padding: '30px',
  backgroundColor: 'var(--bg-card)',
  borderRadius: '16px',
  border: '1px solid var(--border-light)',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
};

const inputBuscaStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-card)',
  color: 'var(--text-primary)',
  fontSize: '15px'
};

const selectStyle = {
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-card)',
  color: 'var(--text-primary)',
  fontSize: '14px',
  width: '180px',
  boxSizing: 'border-box'
};
