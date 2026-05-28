import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useUI } from '../context/UIContext';

export default function Configuracoes({ voltarPainel }) {
  const { showToast, showConfirm } = useUI();
  const [novoTipo, setNovoTipo] = useState('');
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Busca os tipos salvos no banco
  const buscarTipos = async () => {
    const querySnapshot = await getDocs(collection(db, 'tipos_equipamento'));
    const lista = [];
    querySnapshot.forEach((doc) => {
      lista.push({ id: doc.id, nome: doc.data().nome });
    });
    // Organiza em ordem alfabética
    lista.sort((a, b) => a.nome.localeCompare(b.nome));
    setTipos(lista);
  };

  useEffect(() => {
    buscarTipos();
  }, []);

  // Adiciona um novo tipo
  const handleAdicionar = async (e) => {
    e.preventDefault();
    if (!novoTipo.trim()) return;
    setLoading(true);
    
    try {
      await addDoc(collection(db, 'tipos_equipamento'), { nome: novoTipo });
      setNovoTipo('');
      buscarTipos();
    } catch (error) {
      console.error("Erro ao adicionar tipo:", error);
    }
    setLoading(false);
  };

  // Exclui um tipo
  const handleExcluir = async (id) => {
    const confirmado = await showConfirm('Tem certeza que deseja excluir este tipo de equipamento?', {
      title: "Excluir Categoria",
      confirmText: "Sim, excluir",
      cancelText: "Cancelar"
    });
    if (confirmado) {
      try {
        await deleteDoc(doc(db, 'tipos_equipamento', id));
        showToast('Categoria de equipamento excluída!', 'success');
        buscarTipos();
      } catch (err) {
        console.error(err);
        showToast('Erro ao excluir categoria.', 'error');
      }
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px 0' }}>
      
      {/* CABEÇALHO UNIFICADO */}
      <div style={toolbarStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
          <button onClick={voltarPainel} style={btnVoltarStyle}>
            ← Voltar ao Painel
          </button>
          <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '26px', fontWeight: 'bold' }}>
            ⚙️ Configurações do Sistema
          </h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
            Área de Administração - Gerencie os Tipos de Equipamentos disponíveis para cadastro no inventário.
          </p>
        </div>
      </div>

      <div className="app-card" style={cardStyle}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
          ➕ Cadastrar Nova Categoria
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 15px 0' }}>
          Insira abaixo o nome da nova categoria/tipo de equipamento (ex: Lap Mentor, Robotix, etc.) para habilitar no estoque.
        </p>

        <form onSubmit={handleAdicionar} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Ex: Bomba de Infusão" 
            value={novoTipo} 
            onChange={(e) => setNovoTipo(e.target.value)} 
            required 
            style={{ flex: 1, height: '42px' }} 
          />
          <button 
            type="submit" 
            disabled={loading} 
            className="btn-brand" 
            style={btnSalvarStyle}
          >
            {loading ? 'Adicionando...' : 'Adicionar Tipo'}
          </button>
        </form>

        <div style={{ marginTop: '35px', borderTop: '1px solid var(--border-light)', paddingTop: '25px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Categorias Cadastradas</span>
            <span style={{ fontSize: '11px', backgroundColor: 'var(--bg-app)', color: 'var(--text-secondary)', padding: '3px 8px', borderRadius: '12px' }}>
              {tipos.length} no total
            </span>
          </h4>
          
          {tipos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-app)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
              Nenhum tipo cadastrado. Adicione a primeira categoria acima.
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tipos.map((tipo) => (
                <li key={tipo.id} style={listItemStyle}>
                  <strong style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{tipo.nome}</strong>
                  <button 
                    onClick={() => handleExcluir(tipo.id)} 
                    style={btnExcluirStyle}
                    className="btn-excluir-item"
                  >
                    🗑️ Excluir
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// Estilos Premium Unificados
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

const btnSalvarStyle = {
  padding: '10px 20px',
  backgroundColor: 'var(--brand)',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '700',
  height: '42px',
  boxShadow: '0 4px 6px -1px rgba(0, 208, 132, 0.2)'
};

const listItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 16px',
  backgroundColor: 'var(--bg-app)',
  border: '1px solid var(--border-light)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '14px'
};

const btnExcluirStyle = {
  color: 'var(--danger)',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '13px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '6px 10px',
  borderRadius: '6px',
  transition: 'all 0.2s'
};