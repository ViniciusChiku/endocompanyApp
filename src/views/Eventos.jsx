import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useUI } from '../context/UIContext';

// Importando estilos estáticos e compartilhados do diretório Eventos
import {
  toolbarStyle,
  btnVoltarStyle,
  filterContainerStyle,
  inputBuscaStyle,
  toggleBtnStyle
} from './Eventos/styles';

// Importando os subcomponentes modularizados
import EventosCards from './Eventos/EventosCards';
import EventosCalendario from './Eventos/EventosCalendario';
import EventosFormModal from './Eventos/EventosFormModal';
import EventosDetalhesModal from './Eventos/EventosDetalhesModal';

import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function Eventos({ currentUser }) {
  const { userRole } = useAuth();
  const { voltarPainel } = useApp();
  const { showToast, showConfirm } = useUI();
  const [listaEventos, setListaEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscaTexto, setBuscaTexto] = useState('');
  
  // Modos de visualização: 'grid' | 'calendario' | 'meus'
  const [modoView, setModoView] = useState('grid');
  
  // Estado para Navegação de Mês do Calendário
  const [dataFocal, setDataFocal] = useState(new Date());

  // Estados dos Modais
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [idEditando, setIdEditando] = useState(null);
  
  // Campos do formulário
  const [formTitulo, setFormTitulo] = useState('');
  const [formLocal, setFormLocal] = useState('');
  const [formEndereco, setFormEndereco] = useState('');
  const [formObservacoes, setFormObservacoes] = useState('');
  
  // Estrutura de múltiplos dias: [{ data: '', horarios: [{ id: '', hora: '', horaFim: '', limite: 10, inscritos: [] }] }]
  const [formDias, setFormDias] = useState([
    {
      data: '',
      horarios: [{ id: Date.now().toString() + '_0', hora: '', horaFim: '', limite: 10, inscritos: [] }]
    }
  ]);

  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  // Estado para controle de chamada no modal de detalhes
  const [selectedSlotId, setSelectedSlotId] = useState('');

  // Estado para controlar quais dias do calendário estão expandidos para ver todas as sessões
  const [diasExpandidos, setDiasExpandidos] = useState({});

  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const diasDaSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const eFuncionarioOuAdm = userRole === 'Funcionario' || userRole === 'ADM';

  // Helper para normalizar eventos e garantir total compatibilidade com eventos legados de sessão única
  const normalizarEvento = (ev) => {
    if (ev.dias && ev.dias.length > 0) {
      const diasNormalizados = ev.dias.map(d => ({
        ...d,
        horarios: (d.horarios || []).map(h => ({
          ...h,
          horaFim: h.horaFim || ''
        }))
      }));
      return { ...ev, dias: diasNormalizados };
    }
    // Converte esquema antigo de campos únicos em estrutura aninhada compatível
    return {
      ...ev,
      dias: [
        {
          data: ev.data || '',
          horarios: [
            {
              id: ev.id + '_legacy',
              hora: ev.hora || '',
              horaFim: ev.horaFim || '',
              limite: ev.limite || 10,
              inscritos: ev.inscritos || []
            }
          ]
        }
      ]
    };
  };

  // Sincronização em tempo real dos eventos do banco
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'eventos_endocompany'), orderBy('data_cadastro', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const evs = [];
      snap.forEach((doc) => {
        evs.push({ id: doc.id, ...doc.data() });
      });
      setListaEventos(evs);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao sincronizar eventos:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Mantém os detalhes atualizados no modal quando a lista em tempo real for modificada
  useEffect(() => {
    if (eventoSelecionado) {
      const atualizado = listaEventos.find(e => e.id === eventoSelecionado.id);
      if (atualizado) {
        setEventoSelecionado(normalizarEvento(atualizado));
      }
    }
  }, [listaEventos, eventoSelecionado?.id]);

  // Manipulação de Dias no Formulário
  const handleAdicionarDia = () => {
    setFormDias([
      ...formDias,
      {
        data: '',
        horarios: [{ id: Date.now().toString() + '_' + formDias.length + '_0', hora: '', horaFim: '', limite: 10, inscritos: [] }]
      }
    ]);
  };

  const handleRemoverDia = (diaIndex) => {
    if (formDias.length <= 1) {
      showToast("O evento de demonstração precisa ter pelo menos 1 dia programado!", "warning");
      return;
    }
    setFormDias(formDias.filter((_, idx) => idx !== diaIndex));
  };

  const handleAlterarDiaData = (diaIndex, novaData) => {
    const novos = [...formDias];
    novos[diaIndex].data = novaData;
    setFormDias(novos);
  };

  // Manipulação de Horários (Slots de sessões) no Formulário
  const handleAdicionarHorario = (diaIndex) => {
    const novos = [...formDias];
    const novoId = Date.now().toString() + '_' + diaIndex + '_' + novos[diaIndex].horarios.length;
    novos[diaIndex].horarios.push({ id: novoId, hora: '', horaFim: '', limite: 10, inscritos: [] });
    setFormDias(novos);
  };

  const handleRemoverHorario = (diaIndex, horIndex) => {
    const novos = [...formDias];
    if (novos[diaIndex].horarios.length <= 1) {
      showToast("Cada dia programado precisa ter pelo menos 1 horário/turno definido!", "warning");
      return;
    }
    novos[diaIndex].horarios = novos[diaIndex].horarios.filter((_, idx) => idx !== horIndex);
    setFormDias(novos);
  };

  const handleAlterarHorarioHora = (diaIndex, horIndex, novaHora) => {
    const novos = [...formDias];
    novos[diaIndex].horarios[horIndex].hora = novaHora;
    setFormDias(novos);
  };

  const handleAlterarHorarioHoraFim = (diaIndex, horIndex, novaHoraFim) => {
    const novos = [...formDias];
    novos[diaIndex].horarios[horIndex].horaFim = novaHoraFim;
    setFormDias(novos);
  };

  const handleAlterarHorarioLimite = (diaIndex, horIndex, novoLimite) => {
    const novos = [...formDias];
    novos[diaIndex].horarios[horIndex].limite = Number(novoLimite);
    setFormDias(novos);
  };

  // Criação ou Edição de Evento
  const handleSalvarEvento = async (e) => {
    e.preventDefault();
    if (!formTitulo || !formLocal || !formEndereco) {
      showToast("Por favor, preencha todos os campos obrigatórios!", "warning");
      return;
    }

    // Validação profunda
    for (let d of formDias) {
      if (!d.data) {
        showToast("Preencha as datas de todos os dias adicionados!", "warning");
        return;
      }
      for (let h of d.horarios) {
        if (!h.hora || !h.horaFim || h.limite <= 0) {
          showToast("Todos os horários adicionados devem conter hora de início, hora de término e limite válidos!", "warning");
          return;
        }
      }
    }

    setSalvando(true);
    setMensagem({ tipo: '', texto: '' });

    // Ordena dias e horários de forma lógica antes do salvamento
    const diasOrdenados = [...formDias].sort((a, b) => a.data.localeCompare(b.data));
    diasOrdenados.forEach(d => {
      d.horarios.sort((a, b) => a.hora.localeCompare(b.hora));
    });

    const dadosEvento = {
      titulo: formTitulo,
      local: formLocal,
      endereco: formEndereco,
      observacoes: formObservacoes,
      dias: diasOrdenados,
      atualizadoEm: new Date()
    };

    try {
      if (idEditando) {
        const docRef = doc(db, 'eventos_endocompany', idEditando);
        await updateDoc(docRef, dadosEvento);
        setMensagem({ tipo: 'sucesso', texto: 'Evento de demonstração atualizado com sucesso!' });
      } else {
        dadosEvento.criadoPor = currentUser.uid;
        dadosEvento.criadoPorEmail = currentUser.email;
        dadosEvento.data_cadastro = new Date();
        await addDoc(collection(db, 'eventos_endocompany'), dadosEvento);
        setMensagem({ tipo: 'sucesso', texto: 'Novo evento de demonstração registrado com sucesso!' });
      }
      handleFecharCriarModal();
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      setMensagem({ tipo: 'erro', texto: 'Não foi possível salvar os dados do evento.' });
    }
    setSalvando(false);
  };

  // Exclusão física do evento no Firestore
  const handleExcluirEvento = async (eventoId) => {
    const confirmar = await showConfirm("⚠️ Tem certeza absoluta que deseja excluir este evento? Isso apagará todas as sessões e listas de presença relacionadas!", {
      title: "Excluir Evento",
      confirmText: "Sim, excluir",
      cancelText: "Cancelar"
    });
    if (!confirmar) return;

    try {
      await deleteDoc(doc(db, 'eventos_endocompany', eventoId));
      setMensagem({ tipo: 'sucesso', texto: 'Evento removido com sucesso!' });
      setModalDetalhesAberto(false);
      setEventoSelecionado(null);
      showToast('Evento excluído com sucesso!', 'success');
    } catch (error) {
      console.error("Erro ao deletar evento:", error);
      showToast("Erro ao excluir evento do banco.", "error");
    }
  };

  // Inscrição dinâmica em slots de sessões consolidando os inscritos
  const handleInscricaoSlot = async (evento, dataSlot, slotId) => {
    if (!currentUser) return;
    
    const evNorm = normalizarEvento(evento);
    const diaAlvo = evNorm.dias.find(d => d.data === dataSlot);
    const slotAlvo = diaAlvo?.horarios.find(h => h.id === slotId);
    if (!slotAlvo) return;

    const inscritos = slotAlvo.inscritos || [];
    const estaInscrito = inscritos.some(i => i.uid === currentUser.uid);
    let operacaoSucesso = '';

    if (estaInscrito) {
      const confirmar = await showConfirm("Confirmar cancelamento de inscrição nesta sessão?", {
        title: "Cancelar Inscrição",
        confirmText: "Sim, cancelar",
        cancelText: "Voltar"
      });
      if (!confirmar) return;
      operacaoSucesso = 'cancelado';
    } else {
      if (inscritos.length >= slotAlvo.limite) {
        showToast("Sessão Lotada! O limite máximo de vagas já foi atingido para este horário.", "warning");
        return;
      }
      operacaoSucesso = 'inscrito';
    }

    const novosDias = evNorm.dias.map(d => {
      if (d.data === dataSlot) {
        const novosHorarios = d.horarios.map(h => {
          if (h.id === slotId) {
            if (operacaoSucesso === 'cancelado') {
              return {
                ...h,
                inscritos: inscritos.filter(i => i.uid !== currentUser.uid)
              };
            } else {
              const novoInscrito = {
                uid: currentUser.uid,
                email: currentUser.email,
                status: 'Inscrito',
                timestamp: new Date()
              };
              return {
                ...h,
                inscritos: [...inscritos, novoInscrito]
              };
            }
          }
          return h;
        });
        return { ...d, horarios: novosHorarios };
      }
      return d;
    });

    try {
      const docRef = doc(db, 'eventos_endocompany', evento.id);
      await updateDoc(docRef, { dias: novosDias });
      
      if (operacaoSucesso === 'inscrito') {
        setMensagem({ tipo: 'sucesso', texto: 'Inscrição realizada com sucesso! Vaga garantida na sessão selecionada.' });
      } else {
        setMensagem({ tipo: 'sucesso', texto: 'Sua inscrição foi cancelada com sucesso.' });
      }
    } catch (error) {
      console.error("Erro ao registrar inscrição:", error);
      showToast("Houve um erro ao processar seu pedido.", "error");
    }
  };

  // Alteração de status da presença dos inscritos
  const handleAlterarStatusParticipante = async (evento, inscritoUid, novoStatus, dataSlot, slotId) => {
    const evNorm = normalizarEvento(evento);
    const novosDias = evNorm.dias.map(d => {
      if (d.data === dataSlot) {
        const novosHorarios = d.horarios.map(h => {
          if (h.id === slotId) {
            const novosInscritos = (h.inscritos || []).map(i => {
              if (i.uid === inscritoUid) {
                return { ...i, status: novoStatus };
              }
              return i;
            });
            return { ...h, inscritos: novosInscritos };
          }
          return h;
        });
        return { ...d, horarios: novosHorarios };
      }
      return d;
    });

    try {
      const docRef = doc(db, 'eventos_endocompany', evento.id);
      await updateDoc(docRef, { dias: novosDias });
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      showToast("Erro ao alterar status do participante.", "error");
    }
  };

  // Remoção manual de inscritos no slot selecionado
  const handleRemoverParticipante = async (evento, inscritoUid, dataSlot, slotId) => {
    const confirmar = await showConfirm("Deseja realmente remover este participante da sessão?", {
      title: "Remover Participante",
      confirmText: "Sim, remover",
      cancelText: "Cancelar"
    });
    if (!confirmar) return;

    const evNorm = normalizarEvento(evento);
    const novosDias = evNorm.dias.map(d => {
      if (d.data === dataSlot) {
        const novosHorarios = d.horarios.map(h => {
          if (h.id === slotId) {
            const novosInscritos = (h.inscritos || []).filter(i => i.uid !== inscritoUid);
            return { ...h, inscritos: novosInscritos };
          }
          return h;
        });
        return { ...d, horarios: novosHorarios };
      }
      return d;
    });

    try {
      const docRef = doc(db, 'eventos_endocompany', evento.id);
      await updateDoc(docRef, { dias: novosDias });
      showToast("Participante removido com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao remover participante:", error);
      showToast("Erro ao remover participante.", "error");
    }
  };

  // Exportação consolidada das presenças em formato CSV direto para Excel
  const exportarPresencaCSV = (evento) => {
    const evNorm = normalizarEvento(evento);
    
    let csvRows = [];
    csvRows.push("\uFEFF"); // UTF-8 BOM para Excel
    csvRows.push("Relatório Consolidado de Presença - Evento de Demonstração - Endocompany");
    csvRows.push(`Título do Evento:;${evNorm.titulo}`);
    csvRows.push(`Local do Evento:;${evNorm.local}`);
    csvRows.push(`Endereço Completo:;${evNorm.endereco}`);
    csvRows.push(`Observações de Acesso:;${evNorm.observacoes || 'Nenhuma'}`);
    csvRows.push("");

    evNorm.dias.forEach((d) => {
      d.horarios.forEach((h) => {
        csvRows.push(`Sessão: Dia ${formatarDataBr(d.data)} das ${h.hora}${h.horaFim ? ` às ${h.horaFim}` : ''} (Capacidade: ${h.limite} vagas, Inscritos: ${(h.inscritos || []).length} pessoas)`);
        csvRows.push("E-mail do Participante;Status da Presença;Data de Inscrição");

        if (!h.inscritos || h.inscritos.length === 0) {
          csvRows.push("Nenhum inscrito para esta sessão;;");
        } else {
          h.inscritos.forEach((i) => {
            let dataInsc = 'N/A';
            if (i.timestamp) {
              if (i.timestamp.seconds) {
                dataInsc = new Date(i.timestamp.seconds * 1000).toLocaleString('pt-BR');
              } else if (i.timestamp instanceof Date) {
                dataInsc = i.timestamp.toLocaleString('pt-BR');
              }
            }
            csvRows.push(`${i.email};${i.status};${dataInsc}`);
          });
        }
        csvRows.push("");
      });
    });

    const csvString = csvRows.join("\r\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `lista_presenca_consolidada_${evNorm.titulo.replace(/\s+/g, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Abertura e fechamento de modais
  const handleAbrirCriarModal = (evento = null) => {
    if (evento) {
      const evNorm = normalizarEvento(evento);
      setIdEditando(evNorm.id);
      setFormTitulo(evNorm.titulo);
      setFormLocal(evNorm.local);
      setFormEndereco(evNorm.endereco);
      setFormObservacoes(evNorm.observacoes || '');
      
      setFormDias(evNorm.dias.map(d => ({
        data: d.data,
        horarios: d.horarios.map(h => ({
          id: h.id,
          hora: h.hora,
          horaFim: h.horaFim || '',
          limite: h.limite,
          inscritos: h.inscritos || []
        }))
      })));
    } else {
      setIdEditando(null);
      setFormTitulo('');
      setFormLocal('');
      setFormEndereco('');
      setFormObservacoes('');
      setFormDias([
        {
          data: '',
          horarios: [{ id: Date.now().toString() + '_0', hora: '', horaFim: '', limite: 10, inscritos: [] }]
        }
      ]);
    }
    setModalCriarAberto(true);
  };

  const handleAbrirCriarModalComData = (dataCompleta) => {
    setIdEditando(null);
    setFormTitulo('');
    setFormLocal('');
    setFormEndereco('');
    setFormObservacoes('');
    setFormDias([
      {
        data: dataCompleta,
        horarios: [{ id: Date.now().toString() + '_0', hora: '', horaFim: '', limite: 10, inscritos: [] }]
      }
    ]);
    setModalCriarAberto(true);
  };

  const handleFecharCriarModal = () => {
    setModalCriarAberto(false);
    setIdEditando(null);
    setFormTitulo('');
    setFormLocal('');
    setFormEndereco('');
    setFormObservacoes('');
    setFormDias([
      {
        data: '',
        horarios: [{ id: Date.now().toString() + '_0', hora: '', horaFim: '', limite: 10, inscritos: [] }]
      }
    ]);
  };

  const handleAbrirDetalhesModal = (evento) => {
    const evNorm = normalizarEvento(evento);
    setEventoSelecionado(evNorm);
    
    if (evNorm.dias && evNorm.dias.length > 0 && evNorm.dias[0].horarios && evNorm.dias[0].horarios.length > 0) {
      setSelectedSlotId(evNorm.dias[0].horarios[0].id);
    } else {
      setSelectedSlotId('');
    }
    
    setModalDetalhesAberto(true);
  };

  const handleFecharDetalhesModal = () => {
    setModalDetalhesAberto(false);
    setEventoSelecionado(null);
    setSelectedSlotId('');
  };

  const handleDiaClick = (dataCompleta) => {
    if (!eFuncionarioOuAdm) return;
    handleAbrirCriarModalComData(dataCompleta);
  };

  // Tratamento de Busca & Filtros
  const eventosFiltrados = listaEventos.filter((ev) => {
    const matchesSearch = 
      ev.titulo.toLowerCase().includes(buscaTexto.toLowerCase()) ||
      ev.local.toLowerCase().includes(buscaTexto.toLowerCase()) ||
      ev.endereco.toLowerCase().includes(buscaTexto.toLowerCase());
      
    if (modoView === 'meus') {
      const evNorm = normalizarEvento(ev);
      const inscritoAlgumSlot = evNorm.dias.some(d => 
        d.horarios.some(h => 
          (h.inscritos || []).some(i => i.uid === currentUser?.uid)
        )
      );
      return matchesSearch && inscritoAlgumSlot;
    }
    return matchesSearch;
  });

  // Funções Auxiliares do Calendário
  const handleMesAnterior = () => {
    setDataFocal(new Date(dataFocal.getFullYear(), dataFocal.getMonth() - 1, 1));
  };
  
  const handleMesProximo = () => {
    setDataFocal(new Date(dataFocal.getFullYear(), dataFocal.getMonth() + 1, 1));
  };

  const obterDiasCalendario = () => {
    const ano = dataFocal.getFullYear();
    const mes = dataFocal.getMonth();
    
    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    const totalDiasMes = new Date(ano, mes + 1, 0).getDate();
    
    const dias = [];
    for (let i = 0; i < primeiroDiaSemana; i++) {
      dias.push(null);
    }
    for (let i = 1; i <= totalDiasMes; i++) {
      dias.push(i);
    }
    return dias;
  };

  const formatarDataBr = (dataString) => {
    if (!dataString) return '';
    const partes = dataString.split('-');
    if (partes.length !== 3) return dataString;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  const pageContainerStyle = {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '32px 16px',
    boxSizing: 'border-box',
    width: '100%',
    fontFamily: 'sans-serif'
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
                📢 Eventos de Demonstração
              </h2>
              <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>
                Participe de sessões de demonstração práticas e testes de equipamentos médicos.
              </p>
            </div>
            
            {eFuncionarioOuAdm && (
              <button 
                onClick={() => handleAbrirCriarModal()} 
                style={{
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
                }}
              >
                ➕ Criar Novo Evento
              </button>
            )}
          </div>
        </div>
      </div>

      {mensagem.texto && (
        <div 
          style={{ marginBottom: '20px' }} 
          className={`alert-box alert-${mensagem.tipo === 'sucesso' ? 'success' : 'error'}`}
        >
          {mensagem.tipo === 'sucesso' ? '✅' : '❌'} {mensagem.texto}
          <button 
            onClick={() => setMensagem({ tipo: '', texto: '' })} 
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', fontWeight: 'bold', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* FILTROS E CHAVEADORES DE MODO */}
      <div style={filterContainerStyle}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
          <input 
            type="text" 
            placeholder="🔍 Buscar por título, local ou endereço..." 
            value={buscaTexto} 
            onChange={(e) => setBuscaTexto(e.target.value)} 
            style={inputBuscaStyle} 
          />
        </div>
        
        <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
          <button 
            onClick={() => setModoView('grid')}
            style={{
              ...toggleBtnStyle,
              backgroundColor: modoView === 'grid' ? 'var(--primary)' : 'var(--bg-card)',
              color: modoView === 'grid' ? 'var(--bg-card)' : 'var(--text-primary)'
            }}
          >
            📋 Lista
          </button>
          <button 
            onClick={() => setModoView('calendario')}
            style={{
              ...toggleBtnStyle,
              backgroundColor: modoView === 'calendario' ? 'var(--primary)' : 'var(--bg-card)',
              color: modoView === 'calendario' ? 'var(--bg-card)' : 'var(--text-primary)'
            }}
          >
            📅 Calendário
          </button>
          <button 
            onClick={() => setModoView('meus')}
            style={{
              ...toggleBtnStyle,
              backgroundColor: modoView === 'meus' ? 'var(--primary)' : 'var(--bg-card)',
              color: modoView === 'meus' ? 'var(--bg-card)' : 'var(--text-primary)'
            }}
          >
            ⭐ Meus Eventos
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <h3 style={{ color: 'var(--brand)' }}>Carregando eventos...</h3>
        </div>
      ) : eventosFiltrados.length === 0 && modoView === 'meus' ? (
        <div className="app-card" style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>⭐</div>
          <h3>Você ainda não se inscreveu em nenhuma sessão de demonstração.</h3>
          <p style={{ marginTop: '5px' }}>Explore o estoque de eventos e garanta sua vaga!</p>
          <button onClick={() => setModoView('grid')} className="btn-brand" style={{ marginTop: '15px' }}>
            Ver Todos os Eventos
          </button>
        </div>
      ) : eventosFiltrados.length === 0 ? (
        <div className="app-card" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Nenhum evento registrado ou correspondente à busca.
        </div>
      ) : (
        <>
          {/* MODO GRID/LISTA DE CARDS */}
          {modoView !== 'calendario' && (
            <EventosCards
              eventosFiltrados={eventosFiltrados}
              normalizarEvento={normalizarEvento}
              currentUser={currentUser}
              handleInscricaoSlot={handleInscricaoSlot}
              handleAbrirDetalhesModal={handleAbrirDetalhesModal}
              formatarDataBr={formatarDataBr}
            />
          )}

          {/* MODO CALENDÁRIO */}
          {modoView === 'calendario' && (
            <EventosCalendario
              dataFocal={dataFocal}
              handleMesAnterior={handleMesAnterior}
              handleMesProximo={handleMesProximo}
              meses={meses}
              diasDaSemana={diasDaSemana}
              obterDiasCalendario={obterDiasCalendario}
              normalizarEvento={normalizarEvento}
              eventosFiltrados={eventosFiltrados}
              handleDiaClick={handleDiaClick}
              eFuncionarioOuAdm={eFuncionarioOuAdm}
              diasExpandidos={diasExpandidos}
              setDiasExpandidos={setDiasExpandidos}
              currentUser={currentUser}
              handleAbrirDetalhesModal={handleAbrirDetalhesModal}
            />
          )}
        </>
      )}

      {/* MODAL 1: CRIAR / EDITAR EVENTO (ADM/FUNCIONÁRIO) */}
      {modalCriarAberto && (
        <EventosFormModal
          idEditando={idEditando}
          formTitulo={formTitulo}
          setFormTitulo={setFormTitulo}
          formLocal={formLocal}
          setFormLocal={setFormLocal}
          formEndereco={formEndereco}
          setFormEndereco={setFormEndereco}
          formObservacoes={formObservacoes}
          setFormObservacoes={setFormObservacoes}
          formDias={formDias}
          handleRemoverDia={handleRemoverDia}
          handleAlterarDiaData={handleAlterarDiaData}
          handleAdicionarHorario={handleAdicionarHorario}
          handleAlterarHorarioHora={handleAlterarHorarioHora}
          handleAlterarHorarioHoraFim={handleAlterarHorarioHoraFim}
          handleAlterarHorarioLimite={handleAlterarHorarioLimite}
          handleRemoverHorario={handleRemoverHorario}
          handleAdicionarDia={handleAdicionarDia}
          handleFecharCriarModal={handleFecharCriarModal}
          handleSalvarEvento={handleSalvarEvento}
          salvando={salvando}
        />
      )}

      {/* MODAL 2: DETALHES DO EVENTO & CHAMADA */}
      {modalDetalhesAberto && eventoSelecionado && (
        <EventosDetalhesModal
          eventoSelecionado={eventoSelecionado}
          eFuncionarioOuAdm={eFuncionarioOuAdm}
          handleFecharDetalhesModal={handleFecharDetalhesModal}
          handleAbrirCriarModal={handleAbrirCriarModal}
          handleExcluirEvento={handleExcluirEvento}
          formatarDataBr={formatarDataBr}
          currentUser={currentUser}
          handleInscricaoSlot={handleInscricaoSlot}
          exportarPresencaCSV={exportarPresencaCSV}
          selectedSlotId={selectedSlotId}
          setSelectedSlotId={setSelectedSlotId}
          handleAlterarStatusParticipante={handleAlterarStatusParticipante}
          handleRemoverParticipante={handleRemoverParticipante}
        />
      )}

    </div>
  );
}
