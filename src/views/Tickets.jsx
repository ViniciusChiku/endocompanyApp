import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';



// Importando componentes modularizados
import TicketsLista from './Tickets/TicketsLista';
import TicketsModal from './Tickets/TicketsModal';

export default function Tickets() {
  const { userRole } = useAuth();
  const { voltarPainel } = useApp();
  const [listaTickets, setListaTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Aberto');
  const [modalAberto, setModalAberto] = useState(false);
  const [ticketEditando, setTicketEditando] = useState(null);
  
  // Campos adicionais editados pelo técnico/ADM
  const [editCliente, setEditCliente] = useState('');
  const [editTipoAtendimento, setEditTipoAtendimento] = useState('telefônico');
  const [editStatus, setEditStatus] = useState('Aberto');
  const [editEquipamentoId, setEditEquipamentoId] = useState('');
  const [equipamentosDisponiveis, setEquipamentosDisponiveis] = useState([]);
  
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [ticketSucessoLog, setTicketSucessoLog] = useState(null);
  const [buscaEquipamento, setBuscaEquipamento] = useState('');
  const [dropdownAberto, setDropdownAberto] = useState(false);

  const buscarTickets = () => {
    // A atualização agora ocorre de forma nativa e em tempo real via onSnapshot no useEffect
  };

  const buscarEquipamentos = async () => {
    try {
      const snap = await getDocs(collection(db, 'equipamentos_endocompany'));
      const lista = [];
      snap.forEach((docSnap) => {
        lista.push({ id: docSnap.id, ...docSnap.data() });
      });
      setEquipamentosDisponiveis(lista);
    } catch (error) {
      console.error("Erro ao buscar equipamentos no painel técnico:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    buscarEquipamentos();

    const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
    
    // Inscreve no onSnapshot em tempo real
    const unsubscribe = onSnapshot(q, (snap) => {
      const tickets = [];
      snap.forEach((docSnap) => {
        tickets.push({ id: docSnap.id, ...docSnap.data() });
      });
      setListaTickets(tickets);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao escutar chamados em tempo real:", error);
      setMensagem({ tipo: 'erro', texto: 'Não foi possível carregar a lista de chamados em tempo real.' });
      setLoading(false);
    });

    // Cleanup: Desinscreve o listener quando o componente for desmontado
    return () => unsubscribe();
  }, []);

  const abrirModalEdicao = (ticket) => {
    setTicketEditando(ticket);
    setEditCliente(ticket.cliente || '');
    setEditTipoAtendimento(ticket.tipoAtendimento || 'telefônico');
    setEditStatus(ticket.status || 'Aberto');
    setEditEquipamentoId(ticket.equipamentoId || '');
    
    // Preenche a descrição para a vinculação do equipamento
    const eq = equipamentosDisponiveis.find(item => item.id === ticket.equipamentoId);
    if (eq) {
      setBuscaEquipamento(`[${eq.tipo_equipamento || 'Sem Tipo'}] ${eq.nome_produto} ${eq.serial ? `(SN: ${eq.serial})` : ''} - ${eq.local || 'Sem local'}`);
    } else {
      setBuscaEquipamento('');
    }
    
    setDropdownAberto(false);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setTicketEditando(null);
    setTicketSucessoLog(null);
    setEditEquipamentoId('');
    setBuscaEquipamento('');
    setDropdownAberto(false);
  };

  const handleSalvarTicket = async (e) => {
    e.preventDefault();
    if (!ticketEditando) return;
    
    setSalvando(true);
    setMensagem({ tipo: '', texto: '' });
    try {
      const ticketRef = doc(db, 'tickets', ticketEditando.id);
      await updateDoc(ticketRef, {
        cliente: editCliente.trim(),
        tipoAtendimento: editTipoAtendimento,
        status: editStatus,
        equipamentoId: editEquipamentoId
      });
      
      setMensagem({ tipo: 'sucesso', texto: `Chamado #${ticketEditando.id.slice(0, 6)} atualizado com sucesso!` });
      
      setTicketSucessoLog({
        id: ticketEditando.id,
        emailCliente: ticketEditando.email || 'cliente@hospital.com.br',
        status: editStatus,
        nomeCliente: ticketEditando.nome,
        produto: ticketEditando.tipoProduto
      });

      buscarTickets();
    } catch (error) {
      console.error("Erro ao salvar chamado:", error);
      setMensagem({ tipo: 'erro', texto: 'Erro ao atualizar informações do chamado.' });
    }
    setSalvando(false);
  };

  // --- CÁLCULO DE MÉTRICAS ---
  const totalTickets = listaTickets.length;
  const abertosCount = listaTickets.filter(t => (t.status || 'Aberto') === 'Aberto').length;
  const atendimentoCount = listaTickets.filter(t => t.status === 'Em Atendimento').length;
  const concluidosCount = listaTickets.filter(t => t.status === 'Concluído').length;

  // --- FILTRAGEM ---
  const ticketsFiltrados = listaTickets.filter((t) => {
    const correspondeBusca = 
      (t.nome || '').toLowerCase().includes(buscaTexto.toLowerCase()) ||
      (t.hospital || '').toLowerCase().includes(buscaTexto.toLowerCase()) ||
      (t.tipoProduto || '').toLowerCase().includes(buscaTexto.toLowerCase());
      
    const correspondeFiltro = 
      filtroStatus === 'Todos' || 
      (t.status || 'Aberto') === filtroStatus;
      
    return correspondeBusca && correspondeFiltro;
  });

  const getStatusBadgeClass = (status) => {
    if (status === 'Concluído') return 'badge-role badge-role-comum'; // cinza
    if (status === 'Em Atendimento') return 'badge-role badge-role-atendimento'; // amarelo
    return 'badge-role badge-role-adm'; // vermelho/aberto
  };

  const formatarData = (createdAt) => {
    if (!createdAt) return '';
    if (createdAt.seconds) {
      return new Date(createdAt.seconds * 1000).toLocaleString('pt-BR');
    }
    return new Date(createdAt).toLocaleString('pt-BR');
  };

  // CONFIGURAÇÕES DE ESTILO COMPARTILHADO IDÊNTICO AO DE PREVENTIVAS E EQUIPAMENTOS
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

  return (
    <div style={pageContainerStyle}>
      
      {/* CABEÇALHO PREMIUM UNIFICADO */}
      <div style={toolbarStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start', width: '100%' }}>
          <button 
            onClick={voltarPainel} 
            style={btnVoltarStyle}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#475569'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#64748b'}
          >
            ← Voltar ao Painel
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.06))', border: '1px solid rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>🎫</div>
            <div>
              <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '26px', fontWeight: 'bold' }}>
                Atendimentos & Chamados
              </h2>
              <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>
                Área Técnica — Acompanhe, atenda e conclua chamados de suporte técnico de clientes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {mensagem.texto && (
        <div style={{ marginBottom: '20px' }} className={`alert-box alert-${mensagem.tipo === 'sucesso' ? 'success' : 'error'}`}>
          {mensagem.tipo === 'sucesso' ? '✅' : '❌'} {mensagem.texto}
        </div>
      )}

      {/* LISTAGEM DE CHAMADOS */}
      <TicketsLista
        loading={loading}
        ticketsFiltrados={ticketsFiltrados}
        abrirModalEdicao={abrirModalEdicao}
        formatarData={formatarData}
        equipamentosDisponiveis={equipamentosDisponiveis}
        getStatusBadgeClass={getStatusBadgeClass}
        totalTickets={totalTickets}
        abertosCount={abertosCount}
        atendimentoCount={atendimentoCount}
        concluidosCount={concluidosCount}
        buscaTexto={buscaTexto}
        setBuscaTexto={setBuscaTexto}
        filtroStatus={filtroStatus}
        setFiltroStatus={setFiltroStatus}
      />

      {/* MODAL DE ATENDIMENTO TÉCNICO */}
      {modalAberto && ticketEditando && (
        <TicketsModal
          ticketEditando={ticketEditando}
          fecharModal={fecharModal}
          formatarData={formatarData}
          equipamentosDisponiveis={equipamentosDisponiveis}
          ticketSucessoLog={ticketSucessoLog}
          buscaEquipamento={buscaEquipamento}
          setBuscaEquipamento={setBuscaEquipamento}
          dropdownAberto={dropdownAberto}
          setDropdownAberto={setDropdownAberto}
          editEquipamentoId={editEquipamentoId}
          setEditEquipamentoId={setEditEquipamentoId}
          editCliente={editCliente}
          setEditCliente={setEditCliente}
          editTipoAtendimento={editTipoAtendimento}
          setEditTipoAtendimento={setEditTipoAtendimento}
          editStatus={editStatus}
          setEditStatus={setEditStatus}
          salvando={salvando}
          handleSalvarTicket={handleSalvarTicket}
        />
      )}

    </div>
  );
}
