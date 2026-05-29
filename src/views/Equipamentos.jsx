import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, orderBy, query, doc, updateDoc, where, writeBatch, limit, startAfter } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { sincronizarTiposEquipamento } from '../services/autoCuraService';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useApp } from '../context/AppContext';

import EquipamentosForm from './Equipamentos/EquipamentosForm';
import EquipamentosLista from './Equipamentos/EquipamentosLista';
import EquipamentosMapa from './Equipamentos/EquipamentosMapa';


export default function Equipamentos() {
  const { showToast, showAlert } = useUI();
  const { user, userRole } = useAuth();
  const { voltarPainel } = useApp();
  const [telaLocal, setTelaLocal] = useState('lista');

  const registrarLogAuditoria = async (acao, detalhes) => {
    try {
      await addDoc(collection(db, 'logs_auditoria'), {
        acao,
        realizadoPor: user ? user.uid : 'desconhecido',
        realizadoPorEmail: user ? user.email : 'desconhecido',
        data: new Date(),
        detalhes
      });
      console.log(`🔒 [AUDIT LOG] Ação "${acao}" registrada com sucesso!`);
    } catch (err) {
      console.error("Erro ao registrar log de auditoria:", err);
    }
  }; 

  // Histórico de navegação virtual (botão voltar do navegador)
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.screen === 'equipamentos') {
        const targetTela = event.state.telaLocal || 'lista';
        setTelaLocal(targetTela);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const currentHistState = window.history.state;
    if (currentHistState && currentHistState.screen === 'equipamentos') {
      if (currentHistState.telaLocal !== telaLocal) {
        if (telaLocal === 'lista' && !currentHistState.telaLocal) {
          window.history.replaceState({ screen: 'equipamentos', telaLocal: 'lista' }, '');
        } else {
          window.history.pushState({ screen: 'equipamentos', telaLocal: telaLocal }, '');
        }
      }
    }
  }, [telaLocal]);

  const voltarParaLista = () => {
    const currentHistState = window.history.state;
    if (currentHistState && currentHistState.telaLocal && currentHistState.telaLocal !== 'lista') {
      window.history.back();
    } else {
      setTelaLocal('lista');
    }
  };

  const [idEditando, setIdEditando] = useState(null);
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [mensagem, setMensagem] = useState('');

  // 21 Campos do Equipamento
  const [local, setLocal] = useState('');
  const [cidade, setCidade] = useState('');
  const [estadoLoc, setEstadoLoc] = useState('SP');
  const [fornecedor, setFornecedor] = useState('');
  const [produto, setProduto] = useState('');
  const [instalacao, setInstalacao] = useState('');
  const [simulador, setSimulador] = useState('');
  const [serial, setSerial] = useState('');
  const [mentorLearn, setMentorLearn] = useState('');
  const [inicioContrato, setInicioContrato] = useState('');
  const [metodoContrato, setMetodoContrato] = useState('');
  const [fimContrato, setFimContrato] = useState('');
  const [preventivasAnuais, setPreventivasAnuais] = useState('');
  const [statusMentorLearn, setStatusMentorLearn] = useState('');
  const [fimMentorLearn, setFimMentorLearn] = useState('');
  const [ultimaManutencao, setUltimaManutencao] = useState('');
  const [proximaPreventiva, setProximaPreventiva] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [statusEquip, setStatusEquip] = useState('Equipamento Funcionando');
  const [emContrato, setEmContrato] = useState(false);
  const [frequencia, setFrequencia] = useState('');

  // Auto-calculador em tempo real de Próxima Preventiva
  useEffect(() => {
    if (ultimaManutencao && preventivasAnuais && Number(preventivasAnuais) > 0) {
      const freqMeses = Math.round(12 / Number(preventivasAnuais));
      const data = new Date(ultimaManutencao + 'T12:00:00'); 
      data.setMonth(data.getMonth() + freqMeses);
      const dataFormatada = data.toISOString().split('T')[0];
      setProximaPreventiva(dataFormatada);
    }
  }, [ultimaManutencao, preventivasAnuais]);

  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  const [sortConfig, setSortConfig] = useState({ key: 'local', direction: 'asc' });
  const [estadoSelecionadoMapa, setEstadoSelecionadoMapa] = useState(null);

  const [ultimoDocCursor, setUltimoDocCursor] = useState(null);
  const [temMais, setTemMais] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);

  const buscarDados = async () => {
    setLoading(true); 
    setTemMais(true);
    try {
      const q = query(collection(db, 'equipamentos_endocompany'), orderBy('data_cadastro', 'desc'), limit(20));
      const qsEquip = await getDocs(q);
      const dados = [];
      qsEquip.forEach((doc) => dados.push({ id: doc.id, ...doc.data() }));
      setLista(dados);
      
      if (qsEquip.docs.length < 20) {
        setTemMais(false);
      }
      setUltimoDocCursor(qsEquip.docs[qsEquip.docs.length - 1] || null);
    } catch (error) {
      console.error("Erro ao buscar dados iniciais:", error);
    }
    setLoading(false); 
  };

  const carregarMaisDados = async () => {
    if (carregandoMais || !temMais || !ultimoDocCursor) return;
    setCarregandoMais(true);
    try {
      const q = query(
        collection(db, 'equipamentos_endocompany'),
        orderBy('data_cadastro', 'desc'),
        startAfter(ultimoDocCursor),
        limit(20)
      );
      const qsEquip = await getDocs(q);
      
      if (qsEquip.docs.length < 20) {
        setTemMais(false);
      }
      
      const novosDados = [];
      qsEquip.forEach((doc) => novosDados.push({ id: doc.id, ...doc.data() }));
      
      if (novosDados.length > 0) {
        setLista(prev => [...prev, ...novosDados]);
        setUltimoDocCursor(qsEquip.docs[qsEquip.docs.length - 1]);
      }
    } catch (error) {
      console.error("Erro ao buscar mais dados:", error);
    }
    setCarregandoMais(false);
  };

  useEffect(() => {
    buscarDados();
  }, []);

  const parseCSVLine = (text) => {
    let p = '', r = [];
    let q = false;
    for (let i = 0; i < text.length; i++) {
      let c = text[i];
      if (c === '"') {
        if (q && text[i+1] === '"') {
          p += '"'; i++;
        } else {
          q = !q;
        }
      } else if ((c === ',' || c === ';') && !q) {
        r.push(p); p = '';
      } else {
        p += c;
      }
    }
    r.push(p);
    return r;
  };

  const exportarDadosCSV = () => {
    if (!lista || lista.length === 0) {
      showToast("A lista de equipamentos está vazia! Não há nada para exportar.", "warning");
      return;
    }

    try {
      const headers = [
        "Cliente", "Cidade", "Estado", "Fornecedor", "Produto", "Instalação",
        "Simulador", "Número de Série", "Mentor Learn", 
        "Inicio de Contrato", "Método de Contrato", "Fim de Contrato", 
        "Preventivas Anuais", "Status Mentor Learn", "Fim Mentor Learn", 
        "Última Preventiva", "Próxima Preventiva", "Email", "Endereço", "Observação"
      ];
      
      const rows = lista.map(eq => [
        eq.local || "",
        eq.cidade || "",
        eq.estado || "",
        eq.fornecedor || "",
        eq.nome_produto || "",
        eq.instalacao || "",
        eq.simulador || "",
        eq.serial || "",
        eq.mentor_learn || "",
        eq.inicio_contrato || "",
        eq.metodo_contrato || "",
        eq.fim_contrato || "",
        eq.preventivas_anuais || "",
        eq.status_mentor_learn || "",
        eq.fim_mentor_learn || "",
        eq.ultima_manutencao || "",
        eq.proxima_preventiva || "",
        eq.email || "",
        eq.endereco || "",
        eq.observacoes || ""
      ]);

      const escapeCSVValue = (val) => {
        const str = String(val);
        return `"${str.replace(/"/g, '""')}"`;
      };

      const csvContent = [
        headers.map(escapeCSVValue).join(","),
        ...rows.map(row => row.map(escapeCSVValue).join(","))
      ].join("\n");
      
      const blob = new Blob(["\ufeff", csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'equipamentos_endocompany.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Registra log de auditoria LGPD
      registrarLogAuditoria('exportacao_csv_equipamentos', `Exportação da planilha de equipamentos contendo ${lista.length} registros realizada com sucesso.`);
    } catch (error) {
      console.error("Erro ao gerar CSV:", error);
      showToast("Ocorreu um erro ao gerar o arquivo CSV.", "error");
    }
  };
  
  const importarDadosCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text.split(/\r?\n/);
      if (lines.length < 2) return;
      
      let importados = 0;
      let duplicados = 0;
      
      const seriaisExistentes = new Set(lista.map(eq => (eq.serial || '').trim().toLowerCase()));
      const seriaisNoArquivo = new Set();

      const headerLine = parseCSVLine(lines[0]);
      const isNewFormat = headerLine.some(h => h.trim().toLowerCase().includes('cliente') || h.trim().toLowerCase().includes('cidade'));

      let batch = writeBatch(db);
      let batchCount = 0;

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = parseCSVLine(lines[i]);
        if (values.length === 0) continue;

        let novoEquipamento = {};

        if (isNewFormat) {
          const serialImportado = (values[7] || '').trim();
          if (!serialImportado || seriaisExistentes.has(serialImportado.toLowerCase()) || seriaisNoArquivo.has(serialImportado.toLowerCase())) {
            duplicados++;
            continue;
          }
          seriaisNoArquivo.add(serialImportado.toLowerCase());

          let produtoVal = (values[4] || '').trim();
          const isComboVal = produtoVal.includes('Robotix') && produtoVal.includes('Lap');
          if (isComboVal) {
            produtoVal = 'Robotix + Lap Mentor';
          }

          novoEquipamento = {
            local: (values[0] || '').trim(),
            cidade: (values[1] || '').trim(),
            estado: (values[2] || 'SP').trim(),
            fornecedor: (values[3] || '').trim(),
            nome_produto: produtoVal,
            tipo_equipamento: produtoVal,
            quantidade: isComboVal ? 2 : 1,
            acompanhado_lapmentor: isComboVal,
            instalacao: (values[5] || '').trim(),
            simulador: (values[6] || '').trim(),
            serial: serialImportado,
            mentor_learn: (values[8] || '').trim(),
            inicio_contrato: (values[9] || '').trim(),
            metodo_contrato: (values[10] || '').trim(),
            fim_contrato: (values[11] || '').trim(),
            preventivas_anuais: Number(values[12]) || null,
            status_mentor_learn: (values[13] || '').trim(),
            fim_mentor_learn: (values[14] || '').trim(),
            ultima_manutencao: (values[15] || '').trim(),
            proxima_preventiva: (values[16] || '').trim(),
            email: (values[17] || '').trim(),
            endereco: (values[18] || '').trim(),
            observacoes: (values[19] || '').trim(),
            status_equipamento: 'Equipamento Funcionando',
            data_cadastro: new Date()
          };
        } else {
          // Formato Antigo
          const serialImportado = (values[2] || '').trim();
          if (!serialImportado || seriaisExistentes.has(serialImportado.toLowerCase()) || seriaisNoArquivo.has(serialImportado.toLowerCase())) {
            duplicados++;
            continue;
          }
          seriaisNoArquivo.add(serialImportado.toLowerCase());

          let legacyProd = (values[0] || '').trim();
          const isComboLegacy = legacyProd.includes('Robotix') && legacyProd.includes('Lap');
          if (isComboLegacy) {
            legacyProd = 'Robotix + Lap Mentor';
          }

          novoEquipamento = {
            nome_produto: legacyProd,
            tipo_equipamento: legacyProd,
            quantidade: isComboLegacy ? 2 : 1,
            acompanhado_lapmentor: isComboLegacy,
            serial: serialImportado,
            local: (values[3] || '').trim(),
            estado: (values[4] || 'SP').trim(),         
            status_equipamento: (values[5] || 'Equipamento Funcionando').trim(),
            simulador: '',
            data_cadastro: new Date()
          };
        }
        
        const docRef = doc(collection(db, "equipamentos_endocompany"));
        batch.set(docRef, novoEquipamento);
        importados++;
        batchCount++;

        if (batchCount === 500) {
          await batch.commit();
          batch = writeBatch(db);
          batchCount = 0;
        }
      }

      if (batchCount > 0) {
        await batch.commit();
      }

      // Registra log de auditoria LGPD
      await registrarLogAuditoria('importacao_csv_equipamentos', `Importação em lote de planilha concluída. ${importados} equipamentos inseridos, ${duplicados} registros ignorados.`);

      // Aciona a Auto-Cura de categorias de forma lazy após a importação ser concluída
      try {
        await sincronizarTiposEquipamento(db);
      } catch (err) {
        console.error("Erro ao sincronizar tipos pós-importação:", err);
      }
      
      if (duplicados > 0) {
        showAlert(`Importação concluída!\n- ${importados} equipamentos importados.\n- ${duplicados} ignorados (serial em branco ou duplicado).`, "Importação Concluída");
      } else {
        showToast(`Importação concluída com sucesso! ${importados} equipamentos importados.`, "success");
      }
      buscarDados();
    };
    reader.readAsText(file);
  };

  const abrirNovoFormulario = () => {
    setLocal('');
    setCidade('');
    setEstadoLoc('SP');
    setFornecedor('');
    setProduto('');
    setInstalacao('');
    setSimulador('');
    setSerial('');
    setMentorLearn('');
    setInicioContrato('');
    setMetodoContrato('');
    setFimContrato('');
    setPreventivasAnuais('');
    setStatusMentorLearn('');
    setFimMentorLearn('');
    setUltimaManutencao('');
    setProximaPreventiva('');
    setEmail('');
    setEndereco('');
    setObservacoes('');

    setStatusEquip('Equipamento Funcionando');
    setEmContrato(false);
    setFrequencia('');
    setIdEditando(null); 
    setMensagem(''); 
    setTelaLocal('formulario');
  };

  const prepararEdicao = (item) => {
    setLocal(item.local || '');
    setCidade(item.cidade || '');
    setEstadoLoc(item.estado || 'SP');
    setFornecedor(item.fornecedor || '');
    setProduto(item.nome_produto || '');
    setInstalacao(item.instalacao || '');
    setSimulador(item.simulador || item.tipo_equipamento || '');
    setSerial(item.serial || '');
    setMentorLearn(item.mentor_learn || '');
    setInicioContrato(item.inicio_contrato || '');
    setMetodoContrato(item.metodo_contrato || '');
    setFimContrato(item.fim_contrato || '');
    setPreventivasAnuais(item.preventivas_anuais || '');
    setStatusMentorLearn(item.status_mentor_learn || '');
    setFimMentorLearn(item.fim_mentor_learn || '');
    setUltimaManutencao(item.ultima_manutencao || '');
    setProximaPreventiva(item.proxima_preventiva || '');
    setEmail(item.email || '');
    setEndereco(item.endereco || '');
    setObservacoes(item.observacoes || '');

    setStatusEquip(item.status_equipamento || 'Equipamento Funcionando');
    setEmContrato(item.em_contrato || false);
    setFrequencia(item.frequencia_meses ? item.frequencia_meses.toString() : '');
    setIdEditando(item.id); 
    setMensagem(''); 
    setTelaLocal('formulario');
  };

  const handleSalvar = async () => {
    if (!local.trim() || !serial.trim() || !produto) {
      throw new Error('Preencha Cliente, Número de Série e selecione o Produto.');
    }

    // Validação de Duplicidade de Número de Série
    const qSerial = query(collection(db, 'equipamentos_endocompany'), where('serial', '==', serial.trim()));
    const snapSerial = await getDocs(qSerial);
    let duplicado = false;
    snapSerial.forEach(docSnap => {
      if (!idEditando || docSnap.id !== idEditando) {
        duplicado = true;
      }
    });
    
    if (duplicado) {
      throw new Error('Já existe um equipamento cadastrado com este número de série.');
    }

    // Auto-calcula frequência se preventivas anuais for especificado
    let frequenciaFinal = emContrato && frequencia ? parseInt(frequencia) : null;
    if (preventivasAnuais && Number(preventivasAnuais) > 0) {
      frequenciaFinal = Math.round(12 / Number(preventivasAnuais));
    }

    const dadosEquipamento = {
      local: local.trim(),
      cidade: cidade.trim(),
      estado: estadoLoc,
      fornecedor: fornecedor.trim(),
      nome_produto: produto,
      tipo_equipamento: produto,
      quantidade: produto === 'Robotix + Lap Mentor' ? 2 : 1,
      acompanhado_lapmentor: produto === 'Robotix + Lap Mentor',
      instalacao: instalacao,
      simulador: simulador.trim(),
      serial: serial.trim(),
      mentor_learn: mentorLearn.trim(),
      inicio_contrato: inicioContrato,
      metodo_contrato: metodoContrato.trim(),
      fim_contrato: fimContrato,
      preventivas_anuais: preventivasAnuais ? Number(preventivasAnuais) : null,
      status_mentor_learn: statusMentorLearn.trim(),
      fim_mentor_learn: fimMentorLearn,
      ultima_manutencao: ultimaManutencao,
      proxima_preventiva: proximaPreventiva,
      email: email.trim(),
      endereco: endereco.trim(),
      observacoes: observacoes.trim(),
      status_equipamento: statusEquip,
      em_contrato: emContrato,
      frequencia_meses: frequenciaFinal
    };

    try {
      let eqId = idEditando;
      if (idEditando) {
        const docRef = doc(db, 'equipamentos_endocompany', idEditando);
        await updateDoc(docRef, dadosEquipamento);
        await registrarLogAuditoria('edicao_equipamento', `Equipamento ID ${idEditando} (Serial: ${serial.trim()}) atualizado.`);
      } else {
        const docRef = await addDoc(collection(db, 'equipamentos_endocompany'), {
          ...dadosEquipamento,
          data_cadastro: new Date()
        });
        eqId = docRef.id;
        await registrarLogAuditoria('cadastro_equipamento', `Novo equipamento cadastrado com ID ${eqId} (Serial: ${serial.trim()}).`);
      }

      // Sincronização segura com o calendário de preventivas
      if (proximaPreventiva) {
        const qPrev = query(
          collection(db, 'preventivas_endocompany'),
          where('dataPreventiva', '==', proximaPreventiva)
        );
        const snapPrev = await getDocs(qPrev);
        let jaExiste = false;
        snapPrev.forEach(docSnap => {
          const data = docSnap.data();
          if (data.equipamentos_ids && data.equipamentos_ids.includes(eqId)) {
            jaExiste = true;
          }
        });

        if (!jaExiste) {
          const primeiroLocal = local.trim() || 'Local Não Informado';
          await addDoc(collection(db, 'preventivas_endocompany'), {
            equipamento: `🏥 ${primeiroLocal}`,
            dataPreventiva: proximaPreventiva,
            dataFim: proximaPreventiva,
            status: 'Agendado',
            equipamentos_ids: [eqId],
            equipamentos_detalhes: [
              {
                id: eqId,
                dataInicial: proximaPreventiva,
                dataFinal: proximaPreventiva,
                concluido: false,
                pdfUrl: ""
              }
            ],
            data_cadastro: new Date()
          });
        }
      }

      buscarDados(); 
      
      try {
        await sincronizarTiposEquipamento(db);
      } catch (err) {
        console.error("Erro ao sincronizar tipos após salvar:", err);
      }

      setTimeout(() => voltarParaLista(), 1000);
      return 'Salvo com sucesso! Voltando...';
    } catch (error) {
      console.error("Erro ao salvar:", error);
      throw new Error('Erro ao salvar no banco de dados. Verifique a conexão.');
    }
  };

  const listaFiltrada = lista.filter((item) => {
    const textoMatch = (item.local || '').toLowerCase().includes(buscaTexto.toLowerCase()) || 
                       (item.serial || '').toLowerCase().includes(buscaTexto.toLowerCase()) ||
                       (item.nome_produto || '').toLowerCase().includes(buscaTexto.toLowerCase()) ||
                       (item.cidade || '').toLowerCase().includes(buscaTexto.toLowerCase());
    const tipoMatch = filtroTipo === '' || item.nome_produto === filtroTipo;
    const statusMatch = filtroStatus === '' || item.status_equipamento === filtroStatus;
    
    // Filtro por Estado selecionado no Mapa
    const estadoMatch = telaLocal !== 'mapa' || !estadoSelecionadoMapa || item.estado === estadoSelecionadoMapa;

    return textoMatch && tipoMatch && statusMatch && estadoMatch;
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const listaOrdenada = [...listaFiltrada].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let valA = a[sortConfig.key] ?? '';
    let valB = b[sortConfig.key] ?? '';
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) return sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽';
    return '';
  };

  const obterCoresStatus = (status) => {
    if (status === 'Em Manutenção') return { bg: '#fee2e2', text: '#991b1b' };
    if (status === 'Equipamento de Demonstração') return { bg: '#dbeafe', text: '#1e40af' };
    if (status === 'Backup') return { bg: '#f1f5f9', text: '#475569' };
    return { bg: '#d1fae5', text: '#065f46' }; 
  };

  const formatarDataBR = (data) => data ? `${data.split('-')[2]}/${data.split('-')[1]}/${data.split('-')[0]}` : '-';

  // LÓGICA DO MAPA
  const contagemEstados = {};
  lista.forEach(eq => {
    const uf = eq.estado || 'SP'; 
    contagemEstados[uf] = (contagemEstados[uf] || 0) + 1;
  });

  const isComum = userRole === 'Comum';

  // CONFIGURAÇÕES DE ESTILO COMPARTILHADO IDÊNTICO AO DE PREVENTIVAS
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

  const btnAcaoVerdeStyle = {
    padding: '8px 16px', // Espaçoso e volumoso exatamente como a Preventivas
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

  const btnAcaoCinzaStyle = {
    padding: '8px 16px',
    backgroundColor: 'var(--bg-app)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-light)',
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

  const CabecalhoUnificado = () => (
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
        
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start', gap: '15px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '26px', fontWeight: 'bold' }}>
              📦 Equipamentos
            </h2>
            <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>
              Área Técnica — Cadastre, gerencie, consulte a base de ativos e visualize a distribuição geográfica de equipamentos.
            </p>
          </div>

          {telaLocal !== 'formulario' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexShrink: 0 }}>
              <button 
                onClick={() => {
                  if (telaLocal === 'mapa') {
                    voltarParaLista();
                  } else {
                    setTelaLocal('mapa');
                  }
                }} 
                style={{ ...btnAcaoCinzaStyle, width: '100%' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--bg-app)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                🗺️ Ver Mapa
              </button>
              
              {!isComum && (
                <>
                  <button 
                    onClick={abrirNovoFormulario} 
                    style={{ ...btnAcaoVerdeStyle, width: '100%' }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                  >
                    ➕ Novo Equipamento
                  </button>
                  
                  <button 
                    onClick={exportarDadosCSV} 
                    style={{ ...btnAcaoCinzaStyle, width: '100%' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--bg-app)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    📥 Exportar CSV
                  </button>

                  <label 
                    style={{ ...btnAcaoCinzaStyle, width: '100%' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--bg-app)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    📤 Importar CSV
                    <input 
                      type="file" 
                      accept=".csv" 
                      onChange={importarDadosCSV} 
                      className="hidden" 
                    />
                  </label>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={pageContainerStyle}>
      <CabecalhoUnificado />

      {telaLocal === 'formulario' && (
        <EquipamentosForm
          isComum={isComum}
          idEditando={idEditando}
          handleSalvar={handleSalvar}
          voltarParaLista={voltarParaLista}
          
          // Form States passing
          local={local} setLocal={setLocal}
          cidade={cidade} setCidade={setCidade}
          estadoLoc={estadoLoc} setEstadoLoc={setEstadoLoc}
          fornecedor={fornecedor} setFornecedor={setFornecedor}
          produto={produto} setProduto={setProduto}
          instalacao={instalacao} setInstalacao={setInstalacao}
          simulador={simulador} setSimulador={setSimulador}
          serial={serial} setSerial={setSerial}
          mentorLearn={mentorLearn} setMentorLearn={setMentorLearn}
          inicioContrato={inicioContrato} setInicioContrato={setInicioContrato}
          metodoContrato={metodoContrato} setMetodoContrato={setMetodoContrato}
          fimContrato={fimContrato} setFimContrato={setFimContrato}
          preventivasAnuais={preventivasAnuais} setPreventivasAnuais={setPreventivasAnuais}
          statusMentorLearn={statusMentorLearn} setStatusMentorLearn={setStatusMentorLearn}
          fimMentorLearn={fimMentorLearn} setFimMentorLearn={setFimMentorLearn}
          ultimaManutencao={ultimaManutencao} setUltimaManutencao={setUltimaManutencao}
          proximaPreventiva={proximaPreventiva} setProximaPreventiva={setProximaPreventiva}
          email={email} setEmail={setEmail}
          endereco={endereco} setEndereco={setEndereco}
          observacoes={observacoes} setObservacoes={setObservacoes}
          statusEquip={statusEquip} setStatusEquip={setStatusEquip}
          emContrato={emContrato} setEmContrato={setEmContrato}
        />
      )}

      {telaLocal === 'mapa' && (
        <EquipamentosMapa
          filtroTipo={filtroTipo}
          setFiltroTipo={setFiltroTipo}
          filtroStatus={filtroStatus}
          setFiltroStatus={setFiltroStatus}
          estadoSelecionadoMapa={estadoSelecionadoMapa}
          setEstadoSelecionadoMapa={setEstadoSelecionadoMapa}
          contagemEstados={contagemEstados}
          listaFiltrada={listaFiltrada}
          prepararEdicao={prepararEdicao}
        />
      )}

      {telaLocal === 'lista' && (
        <EquipamentosLista
          loading={loading}
          buscaTexto={buscaTexto}
          setBuscaTexto={setBuscaTexto}
          filtroTipo={filtroTipo}
          setFiltroTipo={setFiltroTipo}
          filtroStatus={filtroStatus}
          setFiltroStatus={setFiltroStatus}
          listaOrdenada={listaOrdenada}
          lista={lista}
          handleSort={handleSort}
          getSortIndicator={getSortIndicator}
          prepararEdicao={prepararEdicao}
          obterCoresStatus={obterCoresStatus}
          formatarDataBR={formatarDataBR}
          carregarMaisDados={carregarMaisDados}
          temMais={temMais}
          carregandoMais={carregandoMais}
        />
      )}
    </div>
  );
}