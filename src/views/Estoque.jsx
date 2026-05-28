import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useUI } from '../context/UIContext';

export default function Estoque() {
  const { showToast, showConfirm } = useUI();
  const { userRole } = useAuth();
  const { voltarPainel } = useApp();
  const [listaEstoque, setListaEstoque] = useState([]);
  const [tiposEquipamento, setTiposEquipamento] = useState(["Exact View", "Lap Mentor", "Robotix", "Robotix + Lap Mentor"]);
  const [loading, setLoading] = useState(true);

  // Estados para busca e filtros
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState('Todos');

  // Estados do Modal de Criação / Edição
  const [modalAberto, setModalAberto] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);
  
  // Campos do Formulário
  const [nProd, setNProd] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipoEquipamento, setTipoEquipamento] = useState('');
  const [dataEntrada, setDataEntrada] = useState('');
  const [dataSaida, setDataSaida] = useState('');
  const [local, setLocal] = useState('');
  const [disponivel, setDisponivel] = useState(true);

  const [salvando, setSalvando] = useState(false);

  // Buscar dados de estoque e tipos de equipamento do Firestore
  // Carrega os tipos e nomes de equipamentos cadastrados para o dropdown (sem duplicados)
  const carregarTiposDropdown = async () => {
    const arrTipos = [];

    // A. Buscar da coleção tipos_equipamento
    try {
      const snapTiposCollection = await getDocs(collection(db, 'tipos_equipamento'));
      snapTiposCollection.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.nome) {
          arrTipos.push(data.nome.trim());
        }
      });
    } catch (err) {
      console.error("Erro ao carregar tipos de equipamentos da coleção tipos_equipamento:", err);
    }

    // B. Buscar da coleção equipamentos_endocompany (apenas tipo_equipamento, excluindo nome_produto)
    try {
      const snapEquipamentos = await getDocs(collection(db, 'equipamentos_endocompany'));
      snapEquipamentos.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.tipo_equipamento) {
          arrTipos.push(data.tipo_equipamento.trim());
        }
      });
    } catch (err) {
      console.error("Erro ao carregar equipamentos cadastrados:", err);
    }

    // C. Limpar duplicados, vazios e ordenar alfabeticamente
    let tiposUnicos = [...new Set(arrTipos.filter(Boolean))].sort();
    if (tiposUnicos.length === 0) {
      tiposUnicos = ["Exact View", "Lap Mentor", "Robotix", "Robotix + Lap Mentor"];
    }
    setTiposEquipamento(tiposUnicos);
  };

  const carregarDados = () => {
    carregarTiposDropdown();
  };

  useEffect(() => {
    setLoading(true);
    carregarTiposDropdown();

    const q = query(collection(db, 'estoque_endocompany'), orderBy('data_entrada', 'desc'));
    
    // Escuta em tempo real para estoque
    const unsubscribe = onSnapshot(q, (snapEstoque) => {
      const arrEstoque = [];
      snapEstoque.forEach((docSnap) => {
        arrEstoque.push({ id: docSnap.id, ...docSnap.data() });
      });
      setListaEstoque(arrEstoque);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao escutar dados do estoque em tempo real:", error);
      if (userRole !== 'Comum') {
        showToast('Não foi possível carregar as informações do estoque em tempo real.', 'error');
      }
      setLoading(false);
    });

    // Cleanup: Desinscreve o listener
    return () => unsubscribe();
  }, []);

  // Abrir modal para Adicionar Novo Item
  const abrirModalNovo = () => {
    setItemEditando(null);
    setNProd('');
    setDescricao('');
    setTipoEquipamento('');
    // Define a data atual como padrão para entrada
    const hoje = new Date().toISOString().split('T')[0];
    setDataEntrada(hoje);
    setDataSaida('');
    setLocal('');
    setDisponivel(true);
    setModalAberto(true);
  };

  // Abrir modal para Editar Item existente
  const abrirModalEdicao = (item) => {
    setItemEditando(item);
    setNProd(item.n_prod || '');
    setDescricao(item.descricao || '');
    setTipoEquipamento(item.tipo_equipamento || '');
    setDataEntrada(item.data_entrada || '');
    setDataSaida(item.data_saida || '');
    setLocal(item.local || '');
    setDisponivel(item.disponivel !== false); // fallback para true
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setItemEditando(null);
  };

  // Salvar Item (Novo ou Edição)
  const handleSalvarItem = async (e) => {
    e.preventDefault();
    if (!nProd.trim() || !tipoEquipamento) {
      showToast('Preencha o Número do Produto e selecione o Tipo do Equipamento.', 'warning');
      return;
    }

    setSalvando(true);

    const itemDoc = {
      n_prod: nProd.trim(),
      descricao: descricao.trim(),
      tipo_equipamento: tipoEquipamento,
      data_entrada: dataEntrada,
      data_saida: dataSaida,
      local: local.trim(),
      disponivel: disponivel
    };

    try {
      if (itemEditando) {
        // Editar
        const itemRef = doc(db, 'estoque_endocompany', itemEditando.id);
        await updateDoc(itemRef, itemDoc);
        showToast('Item do estoque atualizado com sucesso!', 'success');
      } else {
        // Novo
        await addDoc(collection(db, 'estoque_endocompany'), {
          ...itemDoc,
          data_cadastro: new Date().toISOString()
        });
        showToast('Item adicionado ao estoque com sucesso!', 'success');
      }

      await carregarDados(); // Recarrega do banco
      setTimeout(() => fecharModal(), 1500);
    } catch (error) {
      console.error("Erro ao salvar item de estoque:", error);
      showToast('Erro ao salvar informações do estoque no servidor.', 'error');
    }
    setSalvando(false);
  };

  // Deletar Item
  const handleDeletarItem = async () => {
    if (!itemEditando) return;
    const confirmado = await showConfirm("Deseja realmente remover este item do estoque permanentemente?", {
      title: "Remover Item do Estoque",
      confirmText: "Sim, remover",
      cancelText: "Cancelar"
    });
    if (!confirmado) return;

    setSalvando(true);
    try {
      const itemRef = doc(db, 'estoque_endocompany', itemEditando.id);
      await deleteDoc(itemRef);
      showToast('Item removido do estoque.', 'success');
      await carregarDados();
      setTimeout(() => fecharModal(), 1000);
    } catch (error) {
      console.error("Erro ao deletar item:", error);
      showToast('Erro ao remover item do estoque.', 'error');
    }
    setSalvando(false);
  };

  // Cálculos de métricas do estoque
  const totalItens = listaEstoque.length;
  const disponiveisCount = listaEstoque.filter(item => item.disponivel !== false).length;
  const indisponiveisCount = totalItens - disponiveisCount;

  // Filtragem da tabela
  const estoqueFiltrado = listaEstoque.filter((item) => {
    const correspondeBusca =
      (item.n_prod || '').toLowerCase().includes(buscaTexto.toLowerCase()) ||
      (item.descricao || '').toLowerCase().includes(buscaTexto.toLowerCase()) ||
      (item.local || '').toLowerCase().includes(buscaTexto.toLowerCase());

    const correspondeTipo = filtroTipo === '' || item.tipo_equipamento === filtroTipo;

    let correspondeDisp = true;
    if (filtroDisponibilidade === 'Disponivel') correspondeDisp = item.disponivel !== false;
    if (filtroDisponibilidade === 'Indisponivel') correspondeDisp = item.disponivel === false;

    return correspondeBusca && correspondeTipo && correspondeDisp;
  });

  // Formata datas YYYY-MM-DD para DD/MM/YYYY
  const formatarDataBr = (dataString) => {
    if (!dataString) return '-';
    const partes = dataString.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataString;
  };

  return (
    <div style={pageContainerStyle}>
      
      {/* CABEÇALHO UNIFICADO */}
      <div style={toolbarStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start', width: '100%' }}>
          <button onClick={voltarPainel} style={btnVoltarStyle}>
            ← Voltar ao Painel
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '26px', fontWeight: 'bold' }}>
                📦 Controle de Estoque de Produtos
              </h2>
              <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>
                Área Interna - Cadastre, gerencie entradas e saídas de peças e produtos e consulte disponibilidade.
              </p>
            </div>
            {userRole !== 'Comum' && (
              <button onClick={abrirModalNovo} style={btnAdicionarStyle}>
                ➕ Adicionar Item ao Estoque
              </button>
            )}
          </div>
        </div>
      </div>



      {/* 📊 METRICAS DO ESTOQUE */}
      <div style={dashGridStyle}>
        <div style={{ ...dashCardStyle, borderLeft: '4px solid var(--border-color)' }}>
          <p style={dashLabelStyle}>Total de Itens</p>
          <h3 style={dashValueStyle}>{totalItens}</h3>
        </div>
        <div style={{ ...dashCardStyle, borderLeft: '4px solid var(--success)' }}>
          <p style={dashLabelStyle}>Disponíveis no Estoque</p>
          <h3 style={{ ...dashValueStyle, color: 'var(--success)' }}>{disponiveisCount}</h3>
        </div>
        <div style={{ ...dashCardStyle, borderLeft: '4px solid var(--danger)' }}>
          <p style={dashLabelStyle}>Indisponíveis / Saídos</p>
          <h3 style={{ ...dashValueStyle, color: 'var(--danger)' }}>{indisponiveisCount}</h3>
        </div>
      </div>

      {/* FILTROS E BUSCA */}
      <div style={filterBarStyle}>
        <input 
          type="text" 
          placeholder="🔍 Buscar por número, descrição ou local..." 
          value={buscaTexto} 
          onChange={(e) => setBuscaTexto(e.target.value)} 
          style={inputBuscaStyle} 
        />
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Equipamento:
            <select 
              value={filtroTipo} 
              onChange={(e) => setFiltroTipo(e.target.value)} 
              style={selectFiltroStyle}
            >
              <option value="">Todos</option>
              {tiposEquipamento.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Status:
            <select 
              value={filtroDisponibilidade} 
              onChange={(e) => setFiltroDisponibilidade(e.target.value)} 
              style={selectFiltroStyle}
            >
              <option value="Todos">Todos</option>
              <option value="Disponivel">Disponíveis</option>
              <option value="Indisponivel">Indisponíveis</option>
            </select>
          </label>
        </div>
      </div>

      {/* TABELA DE ESTOQUE */}
      <div style={cardStyle} className="app-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <h3 style={{ color: '#00d084' }}>Carregando dados do estoque...</h3>
          </div>
        ) : estoqueFiltrado.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
            Nenhum item encontrado no estoque com os filtros selecionados.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Nº Produto / ID</th>
                  <th>Equipamento Relacionado</th>
                  <th>Descrição / Peça</th>
                  <th style={{ textAlign: 'center' }}>Data Entrada</th>
                  <th style={{ textAlign: 'center' }}>Data Saída</th>
                  <th>Local</th>
                  <th style={{ textAlign: 'center' }}>Disponível</th>
                  {userRole !== 'Comum' && <th style={{ textAlign: 'center', width: '90px' }}>Ações</th>}
                </tr>
              </thead>
              <tbody>
                {estoqueFiltrado.map((item) => (
                  <tr 
                    key={item.id} 
                    style={{ cursor: userRole !== 'Comum' ? 'pointer' : 'default' }}
                    onClick={() => userRole !== 'Comum' && abrirModalEdicao(item)}
                  >
                    <td>
                      <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '14px' }}>
                        {item.n_prod}
                      </strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {item.tipo_equipamento}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.descricao || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Sem descrição</span>}
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {formatarDataBr(item.data_entrada)}
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {item.data_saida ? formatarDataBr(item.data_saida) : <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>-</span>}
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {item.local || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Estoque Central</span>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge-role ${item.disponivel !== false ? 'badge-role-comum' : 'badge-role-adm'}`} style={{ 
                        backgroundColor: item.disponivel !== false ? '#d1fae5' : '#fee2e2', 
                        color: item.disponivel !== false ? '#065f46' : '#991b1b',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '11px'
                      }}>
                        {item.disponivel !== false ? '🟢 Sim' : '🔴 Não'}
                      </span>
                    </td>
                    {userRole !== 'Comum' && (
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => abrirModalEdicao(item)}
                          style={btnAcaoStyle}
                        >
                          📝 Editar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE CRIAÇÃO OU EDIÇÃO DE ITEM */}
      {modalAberto && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle} className="app-card">
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '20px', fontWeight: 'bold' }}>
                {itemEditando ? 'Editar Item do Estoque' : 'Adicionar Item ao Estoque'}
              </h3>
              <button onClick={fecharModal} style={btnCloseModalStyle}>✕</button>
            </div>



            <form onSubmit={handleSalvarItem} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <label style={labelStyle}>
                  Nº Produto / ID: *
                  <input 
                    type="text" 
                    value={nProd} 
                    onChange={(e) => setNProd(e.target.value)} 
                    placeholder="Ex: P-90883"
                    required
                    style={{ width: '100%' }}
                  />
                </label>

                <label style={labelStyle}>
                  Qual Equipamento (Tipo): *
                  <select 
                    value={tipoEquipamento} 
                    onChange={(e) => setTipoEquipamento(e.target.value)}
                    required
                    style={selectStyle}
                  >
                    {tiposEquipamento.length === 0 ? (
                      <option value="">-- Sem tipos cadastrados --</option>
                    ) : (
                      <>
                        <option value="">-- Selecione o Tipo --</option>
                        {tiposEquipamento.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </>
                    )}
                  </select>
                </label>
              </div>

              <label style={labelStyle}>
                Descrição / Detalhes da Peça:
                <textarea 
                  value={descricao} 
                  onChange={(e) => setDescricao(e.target.value)} 
                  placeholder="Escreva a descrição do produto ou peça em estoque..."
                  style={{ 
                    width: '100%', 
                    minHeight: '70px', 
                    padding: '10px 12px', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border-color)', 
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <label style={labelStyle}>
                  Data de Entrada: *
                  <input 
                    type="date" 
                    value={dataEntrada} 
                    onChange={(e) => setDataEntrada(e.target.value)} 
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '14px' }}
                  />
                </label>

                <label style={labelStyle}>
                  Data de Saída:
                  <input 
                    type="date" 
                    value={dataSaida} 
                    onChange={(e) => setDataSaida(e.target.value)} 
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '14px' }}
                  />
                </label>
              </div>

              <label style={labelStyle}>
                Local de Armazenamento / Destino:
                <input 
                  type="text" 
                  value={local} 
                  onChange={(e) => setLocal(e.target.value)} 
                  placeholder="Ex: Galpão A, Sala Técnica, Hosp. Albert Einstein"
                  style={{ width: '100%' }}
                />
              </label>

              {/* CHECKLIST DE DISPONIBILIDADE */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--border-light)', marginTop: '5px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none', margin: 0, fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                  <input 
                    type="checkbox" 
                    checked={disponivel} 
                    onChange={(e) => setDisponivel(e.target.checked)} 
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#00d084' }}
                  />
                  Disponível para uso imediato? (Sim / Não)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '20px' }}>
                <div>
                  {itemEditando && (
                    <button 
                      type="button" 
                      onClick={handleDeletarItem} 
                      disabled={salvando}
                      style={btnExcluirStyle}
                    >
                      🗑️ Excluir Item
                    </button>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={fecharModal} style={btnCancelStyle}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={salvando} style={btnSubmitStyle}>
                    {salvando ? 'Salvando...' : itemEditando ? 'Salvar Edição' : 'Cadastrar Item'}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

// Estilos dinâmicos
const pageContainerStyle = {
  maxWidth: '1100px',
  margin: '0 auto',
  padding: '32px 16px',
  boxSizing: 'border-box',
  width: '100%',
  fontFamily: 'sans-serif'
};

const toolbarStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'var(--bg-card)',
  padding: '24px 28px',
  borderRadius: '16px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
  marginBottom: '25px',
  border: '1px solid var(--border-light)',
  width: '100%',
  boxSizing: 'border-box',
  minHeight: '165px'
};

const btnVoltarStyle = { 
  padding: '8px 16px', 
  backgroundColor: '#64748b', 
  color: '#fff', 
  border: 'none', 
  borderRadius: '6px', 
  cursor: 'pointer', 
  fontSize: '14px',
  fontWeight: '700',
  transition: 'all 0.2s ease',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  textDecoration: 'none',
  width: 'fit-content'
};

const btnAdicionarStyle = {
  padding: '8px 16px',
  backgroundColor: 'var(--brand)',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 'bold',
  transition: 'all 0.2s ease',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px'
};

const cardStyle = {
  padding: '30px',
  backgroundColor: 'var(--bg-card)',
  borderRadius: '16px',
  border: '1px solid var(--border-light)',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
};

const dashGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '15px',
  marginBottom: '25px'
};

const dashCardStyle = {
  backgroundColor: 'var(--bg-card)',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  border: '1px solid var(--border-light)'
};

const dashLabelStyle = {
  margin: 0,
  fontSize: '13px',
  color: 'var(--text-secondary)',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const dashValueStyle = {
  margin: '5px 0 0 0',
  fontSize: '28px',
  fontWeight: '800',
  color: 'var(--text-primary)'
};

const filterBarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '15px',
  marginBottom: '20px'
};

const inputBuscaStyle = {
  padding: '10px 16px',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-card)',
  color: 'var(--text-primary)',
  fontSize: '14px',
  width: '340px',
  maxWidth: '100%'
};

const selectFiltroStyle = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-card)',
  color: 'var(--text-primary)',
  fontSize: '14px'
};

const btnAcaoStyle = {
  padding: '6px 12px',
  backgroundColor: 'var(--bg-app)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-light)',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: '600'
};

const selectStyle = {
  padding: '10px 12px',
  borderRadius: '6px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-card)',
  color: 'var(--text-primary)',
  fontSize: '14px',
  width: '100%'
};

const labelStyle = { 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '6px', 
  fontSize: '14px', 
  fontWeight: '600', 
  color: 'var(--text-secondary)' 
};

// MODAL STYLES
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(15, 23, 42, 0.4)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  overflowY: 'auto',
  zIndex: 9999,
  padding: '40px 20px'
};

const modalContentStyle = {
  width: '100%',
  maxWidth: '650px',
  backgroundColor: 'var(--bg-card)',
  borderRadius: '16px',
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
  padding: '30px',
  border: '1px solid var(--border-light)',
  animation: 'fadeIn 0.3s ease-out'
};

const btnCloseModalStyle = {
  border: 'none',
  background: 'none',
  fontSize: '20px',
  cursor: 'pointer',
  color: 'var(--text-secondary)'
};

const btnCancelStyle = {
  padding: '10px 20px',
  backgroundColor: 'var(--bg-card)',
  color: 'var(--text-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600'
};

const btnSubmitStyle = {
  padding: '10px 20px',
  backgroundColor: 'var(--brand)',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600'
};

const btnExcluirStyle = {
  padding: '10px 16px',
  backgroundColor: 'var(--danger-light)',
  color: 'var(--danger)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600'
};
