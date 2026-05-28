import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, addDoc, updateDoc, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebaseConfig'; 

import CalendarioLista from './Calendario/CalendarioLista';
import CalendarioGrade from './Calendario/CalendarioGrade';
import CalendarioModal from './Calendario/CalendarioModal';
import { btnVoltarStyle, toolbarStyle } from './Calendario/styles';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function Calendario({ currentUser, userData }) {
  const { userRole } = useAuth();
  const { voltarPainel } = useApp();
  const { showToast, showConfirm } = useUI();
  const [dataFocal, setDataFocal] = useState(new Date());
  
  const [listaPreventivas, setListaPreventivas] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [diaSelecionado, setDiaSelecionado] = useState(new Date().getDate());

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [equipamentosDB, setEquipamentosDB] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [modoView, setModoView] = useState('lista');
  const [buscaPlanilha, setBuscaPlanilha] = useState('');
  const [arquivosPdf, setArquivosPdf] = useState({});
  const [subindoPdf, setSubindoPdf] = useState(false);
  
  // Estados do Modal
  const [modalAberto, setModalAberto] = useState(false);

  // Histórico de navegação virtual (botão voltar do navegador)
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.screen === 'calendario') {
        setModalAberto(!!event.state.modalAberto);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const currentHistState = window.history.state;
    if (currentHistState && currentHistState.screen === 'calendario') {
      const histModal = !!currentHistState.modalAberto;
      if (histModal !== modalAberto) {
        if (modalAberto) {
          window.history.pushState({ screen: 'calendario', modalAberto: true }, '');
        } else {
          if (currentHistState.modalAberto) {
            window.history.back();
          }
        }
      }
    }
  }, [modalAberto]);

  const [idEditando, setIdEditando] = useState(null);
  
  // Campos do formulário
  const [formData, setFormData] = useState(''); 
  const [formDataFim, setFormDataFim] = useState(''); 
  const [formStatus, setFormStatus] = useState('Agendado');
  const [equipamentosSelecionados, setEquipamentosSelecionados] = useState([]); 
  const [buscaEquipModal, setBuscaEquipModal] = useState(''); 
  const [nomeLegado, setNomeLegado] = useState(''); 
  const [salvando, setSalvando] = useState(false);

  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const anos = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
  const diasDaSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const buscarDados = () => {
    // Sincronização em tempo real ativa via onSnapshot no useEffect
  };

  useEffect(() => {
    setLoading(true);

    // 1. Escuta preventivas em tempo real
    const qPrev = query(collection(db, 'preventivas_endocompany'), orderBy('dataPreventiva', 'asc'));
    const unsubscribePrev = onSnapshot(qPrev, (snapPrev) => {
      const prevs = [];
      snapPrev.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.status === 'Preventiva') {
          data.status = 'Agendado';
        }
        prevs.push({ id: docSnap.id, ...data });
      });
      setListaPreventivas(prevs);
    }, (error) => {
      console.error("Erro ao escutar preventivas em tempo real:", error);
    });

    // 2. Escuta equipamentos em tempo real
    const qEq = query(collection(db, 'equipamentos_endocompany'));
    const unsubscribeEq = onSnapshot(qEq, (snapEq) => {
      const eqs = [];
      snapEq.forEach((docSnap) => eqs.push({ id: docSnap.id, ...docSnap.data() }));
      setEquipamentosDB(eqs);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao escutar equipamentos em tempo real:", error);
      setLoading(false);
    });

    // Cleanup: Desinscreve os listeners ao desmontar o componente
    return () => {
      unsubscribePrev();
      unsubscribeEq();
    };
  }, []);

  const atualizarDataEquipamento = (idEquipamento, campoData, novoValor) => {
    setEquipamentosSelecionados((prev) => 
      prev.map((eq) => {
        if (eq.id === idEquipamento) {
          const equipAtualizado = { ...eq, [campoData]: novoValor };
          if (campoData === 'dataInicial') equipAtualizado.dataFinal = novoValor;
          return equipAtualizado;
        }
        return eq;
      })
    );
  };

  const handleToggleEquipamento = (equipamentoBanco, isChecked) => {
    if (isChecked) {
      setEquipamentosSelecionados(prev => [
        ...prev, 
        { ...equipamentoBanco, dataInicial: formData, dataFinal: formDataFim, concluido: false }
      ]);
    } else {
      setEquipamentosSelecionados(prev => prev.filter(eq => eq.id !== equipamentoBanco.id));
    }
  };

  const handleDiaClick = (dia) => {
    if (!dia || userRole === 'Comum') return;
    const mesFormatado = String(dataFocal.getMonth() + 1).padStart(2, '0');
    const diaFormatado = String(dia).padStart(2, '0');
    const dataCompleta = `${dataFocal.getFullYear()}-${mesFormatado}-${diaFormatado}`;
    
    setIdEditando(null);
    setFormData(dataCompleta);
    setFormDataFim(dataCompleta); 
    setFormStatus('Agendado');
    setEquipamentosSelecionados([]);
    setBuscaEquipModal('');
    setNomeLegado('');
    setArquivosPdf({});
    setModalAberto(true);
  };

  const executarCliqueDia = (dia) => {
    if (!dia) return;
    setDiaSelecionado(dia);
  };

  const handleEventoClick = (e, evento) => {
    if (e) e.stopPropagation(); 
    
    setIdEditando(evento.id);
    setFormData(evento.dataPreventiva);
    setFormDataFim(evento.dataFim || evento.dataPreventiva); 
    setNomeLegado(evento.equipamento || ''); 
    setFormStatus(evento.status);
    setArquivosPdf({}); 

    if (evento.equipamentos_detalhes) {
      const selecionados = evento.equipamentos_detalhes.map(detalhe => {
        const eqBanco = equipamentosDB.find(eq => eq.id === detalhe.id);
        if (eqBanco) return { 
          ...eqBanco, 
          dataInicial: detalhe.dataInicial, 
          dataFinal: detalhe.dataFinal,
          concluido: detalhe.concluido || false,
          pdfUrl: detalhe.pdfUrl || ''
        };
        return null;
      }).filter(eq => eq !== null);
      setEquipamentosSelecionados(selecionados);
    } else if (evento.equipamentos_ids) {
      const selecionados = equipamentosDB.filter(eq => evento.equipamentos_ids.includes(eq.id));
      setEquipamentosSelecionados(selecionados.map(eq => ({...eq, dataInicial: evento.dataPreventiva, dataFinal: evento.dataFim || evento.dataPreventiva, concluido: evento.status === 'Concluída'})));
    } else {
      setEquipamentosSelecionados([]);
    }
    
    setBuscaEquipModal('');
    setModalAberto(true);
  };

  const obterSubtituloEquipamento = (item) => {
    if (item.equipamentos_detalhes && item.equipamentos_detalhes.length > 0) {
      return `${item.equipamentos_detalhes.length} equipamento(s) vinculado(s)`;
    }
    return item.equipamento || "Nenhum equipamento detalhado.";
  };

  const handleSalvarModal = async (e) => {
    e.preventDefault();

    if (equipamentosSelecionados.length === 0 && !idEditando) {
      showToast("Você precisa selecionar pelo menos um equipamento na lista!", "warning");
      return;
    }

    setSalvando(true);
    // Variáveis de controle para o fluxo do redirecionamento pós-salvamento
    let abrirProximoAgendamentoImediato = false;
    let dataProximaPreventivaCalculada = '';
    let equipamentoParaReagendar = null;

    try {
      const detalhesFinais = [];
      let statusGlobal = formStatus;

      if (idEditando) {
        const todosConcluidos = equipamentosSelecionados.length > 0 && equipamentosSelecionados.every(eq => eq.concluido);
        const algumConcluido = equipamentosSelecionados.some(eq => eq.concluido);
        statusGlobal = todosConcluidos ? 'Concluída' : (algumConcluido ? 'Parcial' : formStatus);
      }

      for (const eq of equipamentosSelecionados) {
        let finalPdfUrl = eq.pdfUrl || '';
        const arquivoNovo = arquivosPdf[eq.id];
        
        if (arquivoNovo) {
          const urlRef = ref(storage, `relatorios_preventivas/${idEditando || Date.now()}_${eq.id}_${arquivoNovo.name}`);
          const snapshot = await uploadBytes(urlRef, arquivoNovo);
          finalPdfUrl = await getDownloadURL(snapshot.ref);
        }

        detalhesFinais.push({
          id: eq.id,
          dataInicial: eq.dataInicial || formData,
          dataFinal: eq.dataFinal || formDataFim,
          concluido: eq.concluido || false,
          pdfUrl: finalPdfUrl
        });
      }

      const primeiroLocal = equipamentosSelecionados.length > 0 ? (equipamentosSelecionados[0].local || 'Local Não Informado') : 'Local Não Informado';
      let tituloGerado = `🏥 ${primeiroLocal}`;
      if (equipamentosSelecionados.length > 1) tituloGerado += ` (+${equipamentosSelecionados.length - 1})`;

      const minDate = detalhesFinais.length > 0 ? detalhesFinais.map(e => e.dataInicial).sort()[0] : formData;
      const maxDate = detalhesFinais.length > 0 ? detalhesFinais.map(e => e.dataFinal).sort().reverse()[0] : formDataFim;

      const dados = {
        equipamento: idEditando ? nomeLegado : tituloGerado,
        dataPreventiva: minDate,
        dataFim: maxDate,
        status: statusGlobal,
        equipamentos_ids: equipamentosSelecionados.map(eq => eq.id),
        equipamentos_detalhes: detalhesFinais
      };

      if (idEditando) {
        const preventivaOriginal = listaPreventivas.find(p => p.id === idEditando);
        await updateDoc(doc(db, 'preventivas_endocompany', idEditando), dados);
        
        for (const eq of equipamentosSelecionados) {
          if (eq.concluido) {
            const detalheOriginal = preventivaOriginal?.equipamentos_detalhes?.find(d => d.id === eq.id);
            const jaEstavaConcluido = detalheOriginal ? detalheOriginal.concluido : (preventivaOriginal?.status === 'Concluída');
            const eqCompleto = equipamentosDB.find(item => item.id === eq.id) || eq;

            let dadosAtualizacaoEquip = { ultima_manutencao: eq.dataFinal };

            // Fluxo modificado: Se acabou de ser concluído e tem contrato, dispara a pergunta em tela
            if (!jaEstavaConcluido && eqCompleto.em_contrato && eqCompleto.frequencia_meses) {
              const dataFutura = new Date(eq.dataFinal + 'T12:00:00'); 
              dataFutura.setMonth(dataFutura.getMonth() + parseInt(eqCompleto.frequencia_meses));
              const dataFormatada = dataFutura.toISOString().split('T')[0];
              
              dadosAtualizacaoEquip.proxima_preventiva = dataFormatada;

              // DISPARA A PERGUNTA SE DESEJA AGENDAR O PRÓXIMO CICLO AGORA
              const querAgendar = await showConfirm(
                `🏥 O equipamento "${eqCompleto.nome_produto}" foi concluído!\n\nDeseja abrir a tela para realizar o novo agendamento previsto para ${dataFormatada.split('-').reverse().join('/')}?`,
                { title: "Novo Agendamento Previsto" }
              );

              if (querAgendar) {
                abrirProximoAgendamentoImediato = true;
                dataProximaPreventivaCalculada = dataFormatada;
                equipamentoParaReagendar = eqCompleto;
              }
            }

            const equipamentoRef = doc(db, 'equipamentos_endocompany', eq.id);
            await updateDoc(equipamentoRef, dadosAtualizacaoEquip);

            // Se acabou de ser concluído, cria um atendimento correspondente como Concluído
            if (!jaEstavaConcluido) {
              try {
                const ticketDoc = {
                  nome: userData?.nome || currentUser?.email || 'Técnico Endocompany',
                  email: currentUser?.email || '',
                  hospital: eqCompleto.local || 'Local Não Informado',
                  tipoProduto: eqCompleto.tipo_equipamento || 'Outro',
                  serial: eqCompleto.serial || '',
                  status: 'Concluído',
                  createdAt: new Date(),
                  cliente: eqCompleto.local || '',
                  tipoAtendimento: 'presencial preventiva',
                  descricao: `Atendimento gerado automaticamente a partir da conclusão da preventiva agendada para o período de ${formatarDataRange(eq.dataInicial, eq.dataFinal)}.`,
                  equipamentoId: eq.id
                };
                await addDoc(collection(db, 'tickets'), ticketDoc);
                console.log(`🎫 [TICKET SYSTEM] Chamado concluído gerado automaticamente para o equipamento ${eqCompleto.nome_produto} (${eqCompleto.serial})`);
              } catch (ticketErr) {
                console.error("Erro ao gerar chamado concluído automático:", ticketErr);
              }
            }
          }
        }
      } else {
        await addDoc(collection(db, 'preventivas_endocompany'), { ...dados, data_cadastro: new Date() });
      }

      // Atualiza os dados da grade/tabela em segundo plano
      await buscarDados();

      // EXECUTA O REDIRECIONAMENTO SE O USUÁRIO CLICOU EM "SIM"
      if (abrirProximoAgendamentoImediato && equipamentoParaReagendar) {
        setIdEditando(null); // Transforma o modal em modo de "Criação"
        setFormData(dataProximaPreventivaCalculada); 
        setFormDataFim(dataProximaPreventivaCalculada); 
        setFormStatus('Agendado');
        setBuscaEquipModal('');
        setNomeLegado('');
        setArquivosPdf({});
        
        setEquipamentosSelecionados([
          { 
            ...equipamentoParaReagendar, 
            dataInicial: dataProximaPreventivaCalculada, 
            dataFinal: dataProximaPreventivaCalculada, 
            concluido: false 
          }
        ]);

        setModalAberto(true);
      } else {
        setModalAberto(false);
      }

    } catch (error) {
      console.error("Erro ao salvar:", error);
      showToast("Erro ao salvar as informações.", "error");
    }
    setSalvando(false);
  };

  const handleExcluirModal = async () => {
    const confirmado = await showConfirm('Tem certeza que deseja excluir este agendamento?', {
      title: "Excluir Agendamento",
      confirmText: "Sim, excluir",
      cancelText: "Cancelar"
    });
    if (confirmado) {
      setSalvando(true);
      try {
        await deleteDoc(doc(db, 'preventivas_endocompany', idEditando));
        setModalAberto(false);
        buscarDados();
        showToast("Agendamento excluído com sucesso!", "success");
      } catch (error) {
        console.error("Erro ao excluir:", error);
        showToast("Erro ao excluir o agendamento.", "error");
      }
      setSalvando(false);
    }
  };

  const equipamentosVisiveisNoModal = equipamentosDB.filter(eq => {
    const isDem = eq.status_equipamento === 'Equipamento de Demonstração';
    if (formStatus === 'Demonstração' && !isDem) return false;
    if (formStatus !== 'Demonstração' && isDem) return false;

    if (buscaEquipModal) {
      const termo = buscaEquipModal.toLowerCase();
      return (eq.nome_produto?.toLowerCase().includes(termo)) ||
             (eq.local?.toLowerCase().includes(termo)) ||
             (eq.serial?.toLowerCase().includes(termo));
    }
    return true;
  });

  const alterarMesSetas = (direcao) => setDataFocal(new Date(dataFocal.getFullYear(), dataFocal.getMonth() + direcao, 1));
  const anoAtual = dataFocal.getFullYear();
  const mesAtual = dataFocal.getMonth();
  const primeiroDiaSemana = new Date(anoAtual, mesAtual, 1).getDay();
  const totalDiasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();

  const gradeDias = [];
  for (let i = 0; i < primeiroDiaSemana; i++) gradeDias.push(null);
  for (let dia = 1; dia <= totalDiasNoMes; dia++) gradeDias.push(dia);

  const obterPreventivasDoDia = (dia) => {
    if (!dia) return [];
    const dataStringChave = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return listaPreventivas.filter(p => {
      if (p.equipamentos_detalhes && p.equipamentos_detalhes.length > 0) {
        return p.equipamentos_detalhes.some(eq => dataStringChave >= eq.dataInicial && dataStringChave <= eq.dataFinal);
      }
      return dataStringChave >= p.dataPreventiva && dataStringChave <= (p.dataFim || p.dataPreventiva);
    });
  };

  const obterCorStatus = (status) => {
    if (status === 'Concluída') return '#28a745';
    if (status === 'Parcial') return '#17a2b8'; 
    if (status === 'Demonstração') return '#6f42c1'; 
    return '#ffc107'; 
  };

  const formatarDataRange = (inicio, fim) => {
    const formata = (d) => {
      if (!d) return '';
      const p = d.split('-');
      return `${p[2]}/${p[1]}/${p[0]}`;
    };
    if (!fim || inicio === fim) return formata(inicio);
    return `${formata(inicio)} até ${formata(fim)}`;
  };

  const obterTituloLocal = (item) => {
    if (!item) return '🏥 Sem Informação';
    if (item.equipamentos_ids && item.equipamentos_ids.length > 0) {
      const eq = equipamentosDB.find(e => e.id === item.equipamentos_ids[0]);
      if (eq && eq.local) return `🏥 ${eq.local} ${item.equipamentos_ids.length > 1 ? `(+${item.equipamentos_ids.length - 1})` : ''}`;
    }
    if (item.equipamento && item.equipamento.includes('(Serial:')) {
      const serialMatch = item.equipamento.match(/Serial:\s*([^)]+)/)?.[1]?.trim();
      if (serialMatch) {
        const eqDb = equipamentosDB.find(e => e.serial === serialMatch);
        if (eqDb && eqDb.local) return `🏥 ${eqDb.local}`;
      }
    }
    if (!item.equipamento) return '🏥 Local Não Informado';
    return item.equipamento.includes('🏥') ? item.equipamento : `🏥 ${item.equipamento.split(' (')[0]}`;
  };

  const obterEquipamentosVinculados = (item) => {
    if (item.equipamentos_detalhes && item.equipamentos_detalhes.length > 0) {
      return item.equipamentos_detalhes.map(detalhe => {
        const eqBanco = equipamentosDB.find(e => e.id === detalhe.id);
        return eqBanco ? eqBanco.nome_produto : 'Equipamento desconhecido';
      });
    } else if (item.equipamentos_ids && item.equipamentos_ids.length > 0) {
      return item.equipamentos_ids.map(id => {
        const eqBanco = equipamentosDB.find(e => e.id === id);
        return eqBanco ? eqBanco.nome_produto : 'Equipamento desconhecido';
      });
    }
    return [item.equipamento || "Nenhum equipamento vinculado"];
  };

  const obterSeriaisVinculados = (item) => {
    if (item.equipamentos_detalhes && item.equipamentos_detalhes.length > 0) {
      return item.equipamentos_detalhes.map(detalhe => {
        const eqBanco = equipamentosDB.find(e => e.id === detalhe.id);
        return eqBanco ? eqBanco.serial : '-';
      });
    } else if (item.equipamentos_ids && item.equipamentos_ids.length > 0) {
      return item.equipamentos_ids.map(id => {
        const eqBanco = equipamentosDB.find(e => e.id === id);
        return eqBanco ? eqBanco.serial : '-';
      });
    }
    if (item.equipamento && item.equipamento.includes('(Serial:')) {
      const serialMatch = item.equipamento.match(/Serial:\s*([^)]+)/)?.[1]?.trim();
      if (serialMatch) return [serialMatch];
    }
    return ['-'];
  };

  const obterPdfsVinculados = (item) => {
    const urls = [];
    if (item.equipamentos_detalhes && item.equipamentos_detalhes.length > 0) {
      item.equipamentos_detalhes.forEach(detalhe => {
        if (detalhe.pdfUrl) {
          const eqBanco = equipamentosDB.find(e => e.id === detalhe.id);
          urls.push({
            nome: eqBanco ? eqBanco.nome_produto : 'PDF',
            url: detalhe.pdfUrl
          });
        }
      });
    }
    return urls;
  };

  const handleNovoAgendamentoLista = () => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const dataCompleta = `${ano}-${mes}-${dia}`;
    
    setIdEditando(null);
    setFormData(dataCompleta);
    setFormDataFim(dataCompleta); 
    setFormStatus('Agendado');
    setEquipamentosSelecionados([]);
    setBuscaEquipModal('');
    setNomeLegado('');
    setArquivosPdf({});
    setModalAberto(true);
  };

  const preventivasFiltradas = listaPreventivas.filter(item => {
    if (!buscaPlanilha) return true;
    const termo = buscaPlanilha.toLowerCase();
    const local = obterTituloLocal(item).toLowerCase();
    const equips = obterEquipamentosVinculados(item).join(' ').toLowerCase();
    const seriais = obterSeriaisVinculados(item).join(' ').toLowerCase();
    const status = (item.status || '').toLowerCase();
    return local.includes(termo) || equips.includes(termo) || seriais.includes(termo) || status.includes(termo);
  });

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
      <div style={toolbarStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start', width: '100%' }}>
          <button onClick={voltarPainel} style={btnVoltarStyle}>← Voltar ao Painel</button>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '26px', fontWeight: 'bold' }}>📅 Agenda de Preventivas</h2>
              <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>
                Área Técnica - Acompanhe e gerencie as datas, ciclos e relatórios de preventivas dos equipamentos.
              </p>
            </div>
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-light)', padding: '3px', borderRadius: '8px' }}>
              <button type="button" onClick={() => setModoView('lista')} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: modoView === 'lista' ? 'var(--brand)' : 'transparent', color: modoView === 'lista' ? '#ffffff' : 'var(--text-secondary)', fontWeight: 'bold', fontSize: '13px', transition: 'all 0.2s' }}>📋 Planilha</button>
              <button type="button" onClick={() => setModoView('calendario')} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: modoView === 'calendario' ? 'var(--brand)' : 'transparent', color: modoView === 'calendario' ? '#ffffff' : 'var(--text-secondary)', fontWeight: 'bold', fontSize: '13px', transition: 'all 0.2s' }}>📅 Calendário</button>
            </div>
          </div>
        </div>
      </div>

      {modoView === 'lista' && (
        <CalendarioLista
          buscaPlanilha={buscaPlanilha}
          setBuscaPlanilha={setBuscaPlanilha}
          userRole={userRole}
          handleNovoAgendamentoLista={handleNovoAgendamentoLista}
          preventivasFiltradas={preventivasFiltradas}
          handleEventoClick={handleEventoClick}
          obterEquipamentosVinculados={obterEquipamentosVinculados}
          obterSeriaisVinculados={obterSeriaisVinculados}
          obterPdfsVinculados={obterPdfsVinculados}
          obterCorStatus={obterCorStatus}
          obterTituloLocal={obterTituloLocal}
          formatarDataRange={formatarDataRange}
        />
      )}

      {modoView === 'calendario' && (
        <CalendarioGrade
          dataFocal={dataFocal}
          setDataFocal={setDataFocal}
          meses={meses}
          anos={anos}
          diasDaSemana={diasDaSemana}
          alterarMesSetas={alterarMesSetas}
          mesAtual={mesAtual}
          anoAtual={anoAtual}
          isMobile={isMobile}
          loading={loading}
          gradeDias={gradeDias}
          obterPreventivasDoDia={obterPreventivasDoDia}
          obterCorStatus={obterCorStatus}
          obterTituloLocal={obterTituloLocal}
          obterEquipamentosVinculados={obterEquipamentosVinculados}
          diaSelecionado={diaSelecionado}
          executarCliqueDia={executarCliqueDia}
          userRole={userRole}
          handleDiaClick={handleDiaClick}
          handleEventoClick={handleEventoClick}
        />
      )}

      {modalAberto && (
        <CalendarioModal
          userRole={userRole}
          idEditando={idEditando}
          setIdEditando={setIdEditando}
          equipamentosSelecionados={equipamentosSelecionados}
          setEquipamentosSelecionados={setEquipamentosSelecionados}
          nomeLegado={nomeLegado}
          setNomeLegado={setNomeLegado}
          arquivosPdf={arquivosPdf}
          setArquivosPdf={setArquivosPdf}
          formStatus={formStatus}
          setFormStatus={setFormStatus}
          formData={formData}
          setFormData={setFormData}
          formDataFim={formDataFim}
          setFormDataFim={setFormDataFim}
          salvando={salvando}
          subindoPdf={subindoPdf}
          buscaEquipModal={buscaEquipModal}
          setBuscaEquipModal={setBuscaEquipModal}
          equipamentosVisiveisNoModal={equipamentosVisiveisNoModal}
          handleSalvarModal={handleSalvarModal}
          handleExcluirModal={handleExcluirModal}
          handleToggleEquipamento={handleToggleEquipamento}
          atualizarDataEquipamento={atualizarDataEquipamento}
          setModalAberto={setModalAberto}
        />
      )}
    </div>
  );
}