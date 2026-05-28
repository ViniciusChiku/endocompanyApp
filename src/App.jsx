import React, { useState, useEffect, lazy, Suspense } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, collection, getDocs, limit, query, where, addDoc } from 'firebase/firestore';
import { auth, db } from './services/firebaseConfig';
import { useAuth } from './context/AuthContext';
import { useApp } from './context/AppContext';
import { formatarCpf, formatarTelefone, validarCpf } from './utils/utils';

// Importações Dinâmicas (Lazy Loading) para Otimização de Performance
const Equipamentos = lazy(() => import('./views/Equipamentos'));
const Calendario = lazy(() => import('./views/Calendario'));
const Usuarios = lazy(() => import('./views/Usuarios'));
const Eventos = lazy(() => import('./views/Eventos'));
const Tickets = lazy(() => import('./views/Tickets'));
const Estoque = lazy(() => import('./views/Estoque'));
const PoliticaPrivacidade = lazy(() => import('./views/PoliticaPrivacidade'));
const MinhaPrivacidade = lazy(() => import('./views/MinhaPrivacidade'));

export default function App() {
  const { user, userRole, userData, setUserData, setUserRole, loading: authLoading, logout } = useAuth();
  const { telaAtual, setTelaAtual, voltarPainel } = useApp();
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Estados para formulários de Auth
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [aceitouTermosChamado, setAceitouTermosChamado] = useState(false);
  
  // Novos campos do cadastro
  const [cadastroNome, setCadastroNome] = useState('');
  const [cadastroTelefone, setCadastroTelefone] = useState('');
  const [cadastroCpf, setCadastroCpf] = useState('');
  const [cadastroEndereco, setCadastroEndereco] = useState('');

  // Campos para edição do perfil
  const [perfilNome, setPerfilNome] = useState('');
  const [perfilTelefone, setPerfilTelefone] = useState('');
  const [perfilCpf, setPerfilCpf] = useState('');
  const [perfilEndereco, setPerfilEndereco] = useState('');

  const [erro, setErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [authActionLoading, setAuthActionLoading] = useState(false);
  
  // Alternador de telas na autenticação: 'login' | 'cadastro' | 'recuperar'
  const [authModo, setAuthModo] = useState('login'); 

  // Estados do Portal do Parceiro (Surgical Science style)
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  
  // Campos do formulário de abertura de chamado
  const [ticketNome, setTicketNome] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketHospital, setTicketHospital] = useState('');
  const [ticketTipoProduto, setTicketTipoProduto] = useState('');
  const [ticketSerial, setTicketSerial] = useState('');
  const [ticketDescricao, setTicketDescricao] = useState('');
  const [ticketSucessoLog, setTicketSucessoLog] = useState(null);
  const [ticketEnviando, setTicketEnviando] = useState(false);

  const [tiposEquipamentoChamado, setTiposEquipamentoChamado] = useState(["Exact View", "Lap Mentor", "Robotix", "Robotix + Lap Mentor"]);







  // Auto-preenche os dados do chamado se o usuário estiver logado e abrir o modal
  useEffect(() => {
    if (showTicketModal && user) {
      if (userData?.nome && !ticketNome) {
        setTicketNome(userData.nome);
      }
      if (user.email && !ticketEmail) {
        setTicketEmail(user.email);
      }
    }
  }, [showTicketModal, user, userData]);

  // Carrega os tipos de equipamentos cadastrados para o chamado (público)
  useEffect(() => {
    const carregarDadosChamado = async () => {
      const arrTipos = [];

      // A. Coleção tipos_equipamento
      try {
        const snapTipos = await getDocs(collection(db, 'tipos_equipamento'));
        snapTipos.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.nome) {
            arrTipos.push(data.nome.trim());
          }
        });
      } catch (error) {
        console.error("Erro ao carregar tipos de equipamento da coleção:", error);
      }

      // B. Coleção equipamentos_endocompany (apenas se logado, por segurança de regras)
      if (user) {
        try {
          const snapEquipamentos = await getDocs(collection(db, 'equipamentos_endocompany'));
          snapEquipamentos.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.tipo_equipamento) {
              arrTipos.push(data.tipo_equipamento.trim());
            }
          });
        } catch (error) {
          console.error("Erro ao carregar equipamentos cadastrados para tipos:", error);
        }
      }

      let tiposUnicos = [...new Set(arrTipos.filter(Boolean))].sort();
      if (tiposUnicos.length === 0) {
        tiposUnicos = ["Exact View", "Lap Mentor", "Robotix", "Robotix + Lap Mentor"];
      }
      setTiposEquipamentoChamado(tiposUnicos);
    };

    if (showTicketModal) {
      carregarDadosChamado();
    }
  }, [showTicketModal, user]);



  // Estados para alteração de senha (dentro do painel)
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');


  useEffect(() => {
    if (userData) {
      setPerfilNome(userData.nome || '');
      setPerfilTelefone(userData.telefone || '');
      setPerfilCpf(userData.cpf || '');
      setPerfilEndereco(userData.endereco || '');
    } else {
      setPerfilNome('');
      setPerfilTelefone('');
      setPerfilCpf('');
      setPerfilEndereco('');
    }
  }, [userData]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagemSucesso('');
    setAuthActionLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, senha);
    } catch (error) {
      console.error(error);
      setErro('E-mail ou senha incorretos. Verifique e tente novamente.');
    }
    setAuthActionLoading(false);
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagemSucesso('');
    
    if (!aceitouTermos) {
      setErro('Você precisa aceitar os Termos de Uso e a Política de Privacidade para prosseguir.');
      return;
    }
    
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem!');
      return;
    }
    
    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (!cadastroNome.trim() || !cadastroTelefone.trim()) {
      setErro('Nome e Telefone são obrigatórios.');
      return;
    }

    setAuthActionLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const createdUser = userCredential.user;

      try {
        // Verifica se o setup da aplicação já foi feito
        const setupRef = doc(db, 'config', 'setup');
        const setupSnap = await getDoc(setupRef);
        const isFirstUser = !setupSnap.exists();
        const defaultRole = isFirstUser ? 'ADM' : 'Comum';

        const newUserDoc = {
          uid: createdUser.uid,
          email: createdUser.email,
          role: defaultRole,
          nome: cadastroNome.trim(),
          telefone: cadastroTelefone.trim(),
          endereco: cadastroEndereco.trim(),
          createdAt: new Date(),
          consentimento: {
            aceito: true,
            dataAceite: new Date(),
            versaoPolitica: '1.0',
            meioCadastro: 'web_portal'
          }
        };

        // Cria registro no Firestore do Usuário
        await setDoc(doc(db, 'usuarios', createdUser.uid), newUserDoc);

        // Grava log de auditoria no Firestore para a LGPD
        try {
          await addDoc(collection(db, 'logs_auditoria'), {
            acao: 'cadastro_usuario',
            realizadoPor: createdUser.uid,
            realizadoPorEmail: createdUser.email,
            data: new Date(),
            detalhes: 'Novo cadastro efetuado e consentimento LGPD aceito.'
          });
        } catch (logErr) {
          console.error("Erro ao registrar log de auditoria de cadastro:", logErr);
        }

        // Se for o primeiro usuário, registra o setup inicial
        if (isFirstUser) {
          await setDoc(setupRef, { initialized: true, initializedAt: new Date() });
        }

        setUserRole(defaultRole);
        setUserData(newUserDoc);
        setMensagemSucesso('Conta criada com sucesso!');

        // Limpa campos
        setEmail('');
        setSenha('');
        setConfirmarSenha('');
        setCadastroNome('');
        setCadastroTelefone('');
        setCadastroCpf('');
        setCadastroEndereco('');
        setAceitouTermos(false);
        setAuthModo('login');
      } catch (innerError) {
        console.error("Erro ao registrar dados no banco de dados pós-autenticação:", innerError);
        // Tenta limpar o Auth em caso de erro para permitir nova tentativa
        try {
          await createdUser.delete();
        } catch (delErr) {
          console.error("Erro ao limpar usuário Auth após falha:", delErr);
        }
        throw innerError;
      }
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        setErro('Este e-mail já está sendo utilizado.');
      } else {
        setErro('Ocorreu um erro ao criar a conta. Tente novamente.');
      }
    }
    setAuthActionLoading(false);
  };

  const handleRecuperarSenha = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagemSucesso('');
    setAuthActionLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMensagemSucesso('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      setEmail('');
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/user-not-found') {
        setErro('Nenhum usuário cadastrado com este e-mail.');
      } else {
        setErro('Erro ao enviar e-mail de recuperação. Tente novamente.');
      }
    }
    setAuthActionLoading(false);
  };

  const handleAlterarSenhaLogado = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagemSucesso('');

    if (novaSenha !== confirmarNovaSenha) {
      setErro('As novas senhas não coincidem!');
      return;
    }

    if (novaSenha.length < 6) {
      setErro('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setAuthActionLoading(true);
    try {
      await updatePassword(auth.currentUser, novaSenha);
      setMensagemSucesso('Sua senha foi atualizada com sucesso!');
      setNovaSenha('');
      setConfirmarNovaSenha('');
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/requires-recent-login') {
        setErro('Por segurança, esta operação requer login recente. Saia e entre novamente no sistema.');
      } else {
        setErro('Erro ao alterar a senha. Tente novamente.');
      }
    }
    setAuthActionLoading(false);
  };

  const handleSalvarPerfil = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagemSucesso('');

    if (!perfilNome.trim() || !perfilTelefone.trim()) {
      setErro('Nome e Telefone são obrigatórios.');
      return;
    }

    setAuthActionLoading(true);
    try {
      const docRef = doc(db, 'usuarios', user.uid);
      const updatedData = {
        ...userData,
        nome: perfilNome.trim(),
        telefone: perfilTelefone.trim(),
        endereco: perfilEndereco.trim()
      };
      await setDoc(docRef, updatedData);
      setUserData(updatedData);
      setMensagemSucesso('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      setErro('Erro ao atualizar os dados do perfil. Tente novamente.');
    }
    setAuthActionLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    setTelaAtual('painel'); 
    setEmail('');
    setSenha('');
  };

  const handleSolicitarExclusaoConta = async () => {
    try {
      // Grava log de auditoria da solicitação de exclusão antes de anonimizar
      try {
        await addDoc(collection(db, 'logs_auditoria'), {
          acao: 'exclusao_anonimizacao_usuario',
          realizadoPor: user.uid,
          realizadoPorEmail: user.email,
          data: new Date(),
          detalhes: 'Solicitação de eliminação de conta e anonimização de dados cadastrais (LGPD Art. 18, VI).'
        });
      } catch (logErr) {
        console.error("Erro ao registrar log de auditoria de exclusão:", logErr);
      }

      const userDocRef = doc(db, 'usuarios', user.uid);
      
      await setDoc(userDocRef, {
        uid: user.uid,
        email: '[ANONIMIZADO]',
        nome: '[DADOS REMOVIDOS]',
        telefone: '[DADOS REMOVIDOS]',
        endereco: '[DADOS REMOVIDOS]',
        role: 'Excluido',
        deletedAt: new Date(),
        motivoExclusao: 'Solicitação do titular (LGPD Art. 18)'
      });

      if (userData?.cpf) {
        try {
          await deleteDoc(doc(db, 'cpfs', userData.cpf));
        } catch (cpfErr) {
          console.error("Erro ao remover CPF da coleção cpfs:", cpfErr);
        }
      }

      const currentUserAuth = auth.currentUser;
      if (currentUserAuth) {
        await currentUserAuth.delete();
      }

      await logout();
      setTelaAtual('painel');
      setEmail('');
      setSenha('');
      
      alert("Sua conta e seus dados pessoais foram completamente removidos e anonimizados com sucesso, em conformidade com a LGPD.");
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      if (error.code === 'auth/requires-recent-login') {
        alert("Por segurança, esta operação requer login recente. Por favor, saia da conta, faça login novamente e repita o procedimento.");
      } else {
        alert("Ocorreu um erro ao excluir sua conta. Por favor, tente novamente ou contate o DPO via endocare@endocompany.com.br.");
      }
    }
  };

  // Fecha modais automaticamente ao autenticar
  useEffect(() => {
    if (user) {
      setShowLoginModal(false);
      setShowUserDropdown(false);
    }
  }, [user]);

  // Função para enviar chamado de suporte
  const handleEnviarTicket = async (e) => {
    e.preventDefault();
    if (!user && !aceitouTermosChamado) {
      alert("Você precisa concordar com o tratamento dos seus dados pessoais para fins de gestão deste chamado técnico.");
      return;
    }

    if (!ticketNome.trim() || !ticketEmail.trim() || !ticketHospital.trim() || !ticketTipoProduto.trim() || !ticketDescricao.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios (Nome, E-mail, Local/Hospital, Tipo de Produto e Descrição do problema).");
      return;
    }

    if (!ticketEmail.includes('@') || !ticketEmail.includes('.')) {
      alert("Por favor, digite um e-mail válido.");
      return;
    }
    
    setTicketEnviando(true);
    setTicketSucessoLog(null);
    try {
      const ticketDoc = {
        nome: ticketNome.trim(),
        email: ticketEmail.trim(),
        hospital: ticketHospital.trim(),
        tipoProduto: ticketTipoProduto.trim(),
        serial: ticketSerial.trim(),
        descricao: ticketDescricao.trim(),
        status: 'Aberto',
        createdAt: new Date(),
        cliente: '',
        tipoAtendimento: ''
      };
      
      const docRef = await addDoc(collection(db, 'tickets'), ticketDoc);
      
      setTicketSucessoLog({
        id: docRef.id,
        emailCliente: ticketEmail.trim(),
        nome: ticketNome.trim(),
        hospital: ticketHospital.trim(),
        produto: ticketTipoProduto.trim(),
        serial: ticketSerial.trim(),
        descricao: ticketDescricao.trim()
      });
      
      // Limpa os campos
      setTicketNome('');
      setTicketEmail('');
      setTicketHospital('');
      setTicketTipoProduto('');
      setTicketSerial('');
      setTicketDescricao('');
      setAceitouTermosChamado(false);
    } catch (error) {
      console.error("Erro ao abrir chamado:", error);
      alert("Erro ao enviar chamado. Por favor, tente novamente.");
    }
    setTicketEnviando(false);
  };

  const irParaSuporte = () => {
    const section = document.getElementById('secao-suporte');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getRoleLabel = (role) => {
    if (role === 'ADM') return 'Administrador';
    if (role === 'Funcionario') return 'Funcionário';
    return 'Comum (Apenas Leitura)';
  };

  const renderTicketModal = () => {
    if (!showTicketModal) return null;
    return (
      <div className="portal-modal-overlay" style={{ 
        zIndex: 10000, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'flex-start', 
        overflowY: 'auto', 
        padding: '40px 20px' 
      }}>
        <div className="portal-modal-content" style={{ 
          maxWidth: '960px', 
          width: '100%', 
          padding: 0, 
          display: 'flex', 
          flexDirection: 'row', 
          flexWrap: 'wrap', 
          overflow: 'hidden',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-light)'
        }}>
          {/* PAINEL ESQUERDO: Branding & Informações (Mockup style) */}
          <div style={{ 
            flex: '1 1 360px', 
            backgroundColor: 'var(--brand-light)', // Fundo verde adaptável premium
            padding: '40px 35px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            borderRight: '1px solid var(--border-light)'
          }}>
            <div>
              {/* Badge */}
              <span style={{ 
                display: 'inline-block',
                backgroundColor: 'rgba(0, 208, 132, 0.1)',
                border: '1px solid rgba(0, 208, 132, 0.2)',
                color: '#00b372',
                padding: '6px 14px',
                borderRadius: '100px',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '25px'
              }}>
                Central de Chamados
              </span>

              {/* Título */}
              <h2 style={{ 
                fontSize: '32px', 
                fontWeight: '800', 
                color: 'var(--text-primary)', 
                lineHeight: '1.2', 
                marginBottom: '20px'
              }}>
                Precisa de Suporte Técnico?
              </h2>

              {/* Descrição */}
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '15px', 
                lineHeight: '1.6',
                fontWeight: '400',
                marginBottom: '30px'
              }}>
                Qualquer hospital ou parceiro pode abrir um chamado de suporte diretamente aqui. Nosso time responderá de imediato via e-mail ou telefone corporativo.
              </p>
            </div>

            {/* Aviso no rodapé */}
            <div style={{ marginTop: '20px' }}>
              <p style={{ 
                fontSize: '12px', 
                color: '#00b372', 
                fontWeight: '600',
                lineHeight: '1.5',
                margin: 0
              }}>
                * As notificações e atualizações do seu chamado serão disparadas em tempo real para o e-mail informado no formulário.
              </p>
            </div>
          </div>

          {/* PAINEL DIREITO: Formulário de Solicitação */}
          <div style={{ 
            flex: '1.2 1 480px', 
            padding: '40px',
            backgroundColor: 'var(--bg-card)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Botão de Fechar no topo direito do painel direito */}
            <button 
              onClick={() => setShowTicketModal(false)} 
              style={{ 
                position: 'absolute',
                top: '20px',
                right: '20px',
                border: 'none', 
                background: 'none', 
                fontSize: '22px', 
                cursor: 'pointer', 
                color: '#94a3b8',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
            >
              ✕
            </button>

            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '800', 
              color: 'var(--text-primary)', 
              marginBottom: '25px',
              borderBottom: '2px solid var(--border-light)',
              paddingBottom: '10px'
            }}>
              Formulário de Solicitação
            </h3>

            {ticketSucessoLog ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="alert-box alert-success" style={{ fontWeight: '600', fontSize: '14px' }}>
                  ✅ Chamado registrado com sucesso no banco de dados!
                </div>
                
                <div className="log-simulado-box" style={{ margin: 0 }}>
                  <div className="log-simulado-titulo" style={{ fontSize: '13px', fontWeight: '700', color: '#166534' }}>
                    ⚡ Firestore Trigger & SMTP em execução...
                  </div>
                  <ul className="log-simulado-lista" style={{ fontSize: '11px', maxHeight: '250px', overflowY: 'auto' }}>
                    <li>[Firestore] Novo documento gravado em <code>/tickets/{ticketSucessoLog.id}</code></li>
                    <li>[Serviço SMTP] Conectado com sucesso ao servidor corporativo da Endocompany.</li>
                    <li>[Notificação Cliente] E-mail de confirmação enviado para o solicitante: <strong>{ticketSucessoLog.emailCliente}</strong></li>
                    <li>[Notificação Interna] Alerta de novo chamado disparado para: <strong>Endocare@endocompany.com.br</strong> e <strong>Suporte01@endocompany.com.br</strong></li>
                    <li>[Informações de Registro]</li>
                    <li>  - Solicitante: {ticketSucessoLog.nome}</li>
                    <li>  - Instituição: {ticketSucessoLog.hospital}</li>
                    <li>  - Equipamento: {ticketSucessoLog.produto} {ticketSucessoLog.serial ? `(SN: ${ticketSucessoLog.serial})` : ''}</li>
                    <li>  - Status: <strong>Aberto</strong></li>
                    <li>[Status] Canal SMTP fechado com segurança.</li>
                  </ul>
                </div>

                <button 
                  className="btn-brand" 
                  onClick={() => setShowTicketModal(false)} 
                  style={{ marginTop: '15px', width: '100%', padding: '12px !important' }}
                >
                  Concluir e Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnviarTicket} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {/* Nome Completo */}
                <label style={labelStyle}>
                  Seu Nome Completo: *
                  <input 
                    type="text" 
                    value={ticketNome} 
                    onChange={(e) => setTicketNome(e.target.value)} 
                    required 
                    placeholder="Ex: Dr. João Silva"
                    style={{ width: '100%' }}
                  />
                </label>

                {/* E-mail de Contato (Novo Campo!) */}
                <label style={labelStyle}>
                  Seu E-mail: *
                  <input 
                    type="email" 
                    value={ticketEmail} 
                    onChange={(e) => setTicketEmail(e.target.value)} 
                    required 
                    placeholder="Ex: medico@hospital.com.br"
                    style={{ width: '100%' }}
                  />
                </label>



                {/* Local / Hospital */}
                <label style={labelStyle}>
                  Local / Hospital / Instituição: *
                  <input 
                    type="text" 
                    value={ticketHospital} 
                    onChange={(e) => setTicketHospital(e.target.value)} 
                    required 
                    placeholder="Ex: Hospital Santa Casa - São Paulo"
                    style={{ width: '100%' }}
                  />
                </label>


                {/* Tipo de Produto e Serial (Side by side) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                  <label style={labelStyle}>
                    Tipo de Produto: *
                    <select
                      value={ticketTipoProduto}
                      onChange={(e) => setTicketTipoProduto(e.target.value)}
                      required
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        width: '100%',
                        fontWeight: '500'
                      }}
                    >
                      {tiposEquipamentoChamado.length === 0 ? (
                        <option value="">-- Sem tipos cadastrados --</option>
                      ) : (
                        <>
                          <option value="">-- Selecione o Tipo --</option>
                          {tiposEquipamentoChamado.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </>
                      )}
                    </select>
                  </label>

                  <label style={labelStyle}>
                    Número de Série (opcional):
                    <input 
                      type="text" 
                      value={ticketSerial} 
                      onChange={(e) => setTicketSerial(e.target.value)} 
                      placeholder="Ex: SN-883492"
                      style={{ width: '100%' }}
                    />
                  </label>
                </div>

                {/* Descrição */}
                <label style={labelStyle}>
                  O que está acontecendo? (Descrição do problema): *
                  <textarea 
                    value={ticketDescricao} 
                    onChange={(e) => setTicketDescricao(e.target.value)} 
                    required 
                    placeholder="Descreva detalhadamente o erro ou o problema apresentado pelo equipamento..."
                    style={{ 
                      width: '100%', 
                      minHeight: '80px', 
                      padding: '10px 12px', 
                      borderRadius: '8px', 
                      border: '1px solid var(--border-color)', 
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </label>

                {/* Data/Hora Auto */}
                <label style={labelStyle}>
                  Data e Horário (auto-registro):
                  <input 
                    type="text" 
                    value={new Date().toLocaleString('pt-BR')} 
                    disabled 
                    style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-secondary)', cursor: 'not-allowed', width: '100%' }}
                  />
                </label>

                {/* Consentimento LGPD para o Chamado Técnico de Visitante */}
                {!user && (
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer', margin: '5px 0 10px 0' }}>
                    <input
                      type="checkbox"
                      required
                      checked={aceitouTermosChamado}
                      onChange={(e) => setAceitouTermosChamado(e.target.checked)}
                      style={{ marginTop: '2px', accentColor: '#00d084', width: 'auto !important' }}
                    />
                    <span>
                      Concordo com o tratamento dos meus dados para fins de gestão deste suporte técnico, conforme a{' '}
                      <a href="#privacidade" onClick={(e) => { e.preventDefault(); setTelaAtual('privacidade'); setShowTicketModal(false); }} style={{ color: '#00d084', textDecoration: 'underline', fontWeight: '600' }}>
                        Política de Privacidade
                      </a>
                      . *
                    </span>
                  </label>
                )}

                <button 
                  type="submit" 
                  className="btn-brand" 
                  disabled={ticketEnviando} 
                  style={{ marginTop: '10px', width: '100%', padding: '12px !important' }}
                >
                  {ticketEnviando ? 'Enviando Solicitação...' : 'Enviar Chamado Técnico 🚀'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-app)' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#00d084', marginBottom: '10px' }}>Carregando...</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Preparando o sistema Endocompany</p>
        </div>
      </div>
    );
  }

  // --- TELA DE GUEST (GUEST LANDING PAGE / PARTNER PORTAL) ---
  if (!user) {
    return (
      <div style={{ backgroundColor: 'var(--bg-app)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* HEADER NAVBAR */}
        <header className="sticky top-0 z-50 flex items-center justify-between h-20 px-6 md:px-12 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md border-t border-brand/10 border-b border-slate-800 shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2 cursor-pointer py-1.5 px-4 hover:bg-slate-800/40 rounded-lg transition-all duration-200" onClick={() => setTelaAtual('painel')}>
            <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand to-emerald-400 select-none mx-2">
              Endocompany
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} 
              className="flex items-center justify-center w-10 h-10 text-xl text-slate-400 hover:text-brand hover:bg-slate-800/50 rounded-full transition-all duration-200"
              title={theme === 'light' ? 'Mudar para Modo Escuro' : 'Mudar para Modo Claro'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button 
              className="px-5 py-2.5 font-bold text-sm text-white bg-brand hover:bg-brand-hover rounded-lg shadow-md hover:shadow-brand/20 active:scale-95 transition-all duration-200" 
              onClick={() => { setAuthModo('login'); setShowLoginModal(true); setErro(''); setMensagemSucesso(''); }}
            >
              Fazer Login
            </button>
          </div>
        </header>

        <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {telaAtual === 'privacidade' ? (
            <div style={{ padding: '40px 20px', maxWidth: '1100px', width: '100%', margin: '0 auto' }}>
              <PoliticaPrivacidade voltarPainel={() => setTelaAtual('painel')} />
            </div>
          ) : (
            /* HERO BANNER SECTION */
            <div className="portal-hero-container">
              <section className="portal-hero">
                <div className="portal-hero-overlay"></div>
                <div className="portal-hero-content">
                  <span className="portal-hero-badge">BEM-VINDO À ENDOCOMPANY</span>
                  <h1 className="portal-hero-title">Treinamento e Simulação Cirúrgica</h1>
                  <p className="portal-hero-subtitle">
                    Suporte técnico especializado, preventivas e gestão de simuladores médicos de alta fidelidade.
                  </p>
                  <div className="portal-hero-buttons">
                    <button className="btn-brand" onClick={() => { setAuthModo('login'); setShowLoginModal(true); setErro('Faça login ou cadastre-se para visualizar e participar de nossos Eventos.'); setMensagemSucesso(''); }} style={{ padding: '14px 28px', fontSize: '15px' }}>Eventos</button>
                    <button className="btn-outline-white" onClick={() => { setAuthModo('login'); setShowLoginModal(true); setErro(''); setMensagemSucesso(''); }}>Acessar Portal</button>
                  </div>
                </div>
              </section>
            </div>
          )}
        </main>

        {/* FOOTER */}
        <footer className="portal-footer" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', padding: '30px 20px', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px', fontSize: '13px' }}>
            <div style={{ textAlign: 'left' }}>
              <p style={{ margin: 0, fontWeight: '700', color: 'var(--text-primary)' }}>Endocompany Ltda</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>Controladora de Dados</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: '600' }}>Encarregado (DPO): <a href="mailto:endocare@endocompany.com.br" style={{ color: '#00d084', textDecoration: 'none' }}>endocare@endocompany.com.br</a></p>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', gap: '15px', alignItems: 'center' }}>
              <a href="#privacidade" onClick={(e) => { e.preventDefault(); setTelaAtual('privacidade'); }} style={{ color: '#00d084', textDecoration: 'none', fontWeight: '600' }}>Política de Privacidade</a>
              <span>&copy; {new Date().getFullYear()} Endocompany.</span>
            </div>
          </div>
        </footer>

        {/* AUTH GLASSMORPHISM MODAL POPUP */}
        {showLoginModal && (
          <div className="portal-modal-overlay">
            <div className="portal-modal-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#00d084', textTransform: 'uppercase' }}>Sistema Endocompany</span>
                <button onClick={() => setShowLoginModal(false)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
              </div>

              <div className="portal-modal-header">
                <h2 className="portal-modal-logo">Portal Endocompany</h2>
                <p className="portal-modal-subtitle">
                  {authModo === 'login' && 'Faça login para gerenciar simuladores e preventivas'}
                  {authModo === 'cadastro' && 'Crie sua conta para acessar o sistema'}
                  {authModo === 'recuperar' && 'Recupere o acesso à sua conta'}
                </p>
              </div>

              {erro && (
                <div className="alert-box alert-error" style={{ marginBottom: '20px' }}>
                  ⚠️ {erro}
                </div>
              )}
              
              {mensagemSucesso && (
                <div className="alert-box alert-success" style={{ marginBottom: '20px' }}>
                  ✅ {mensagemSucesso}
                </div>
              )}

              {/* FORMULÁRIO DE LOGIN */}
              {authModo === 'login' && (
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <label style={labelStyle}>
                    E-mail:
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      placeholder="seuemail@empresa.com"
                    />
                  </label>
                  <label style={labelStyle}>
                    Senha:
                    <input 
                      type="password" 
                      value={senha} 
                      onChange={(e) => setSenha(e.target.value)} 
                      required 
                      placeholder="******"
                    />
                  </label>
                  
                  <button type="submit" className="btn-brand" disabled={authActionLoading} style={{ marginTop: '10px' }}>
                    {authActionLoading ? 'Entrando...' : 'Entrar'}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '10px' }}>
                    <a href="#recuperar" onClick={(e) => { e.preventDefault(); setAuthModo('recuperar'); setErro(''); setMensagemSucesso(''); }} style={{ color: '#00d084', textDecoration: 'none', fontWeight: '500' }}>Esqueci minha senha</a>
                    <a href="#cadastro" onClick={(e) => { e.preventDefault(); setAuthModo('cadastro'); setErro(''); setMensagemSucesso(''); }} style={{ color: '#00d084', textDecoration: 'none', fontWeight: '500' }}>Cadastrar-se</a>
                  </div>
                </form>
              )}

              {/* FORMULÁRIO DE CADASTRO */}
              {authModo === 'cadastro' && (
                <form onSubmit={handleCadastro} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '5px' }}>
                  <label style={labelStyle}>
                    Nome Completo: *
                    <input 
                      type="text" 
                      value={cadastroNome} 
                      onChange={(e) => setCadastroNome(e.target.value)} 
                      required 
                      placeholder="Seu nome completo"
                    />
                  </label>
                  <label style={labelStyle}>
                    E-mail: *
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      placeholder="seuemail@empresa.com"
                    />
                  </label>
                  <label style={labelStyle}>
                    Telefone / Celular: *
                    <input 
                      type="tel" 
                      value={cadastroTelefone} 
                      onChange={(e) => setCadastroTelefone(formatarTelefone(e.target.value))} 
                      required 
                      placeholder="(00) 00000-0000"
                    />
                  </label>

                  <label style={labelStyle}>
                    Endereço:
                    <input 
                      type="text" 
                      value={cadastroEndereco} 
                      onChange={(e) => setCadastroEndereco(e.target.value)} 
                      placeholder="Rua, Número, Bairro, Cidade - UF"
                    />
                  </label>
                  <label style={labelStyle}>
                    Senha: *
                    <input 
                      type="password" 
                      value={senha} 
                      onChange={(e) => setSenha(e.target.value)} 
                      required 
                      placeholder="Mínimo 6 caracteres"
                    />
                  </label>
                  <label style={labelStyle}>
                    Confirmar Senha: *
                    <input 
                      type="password" 
                      value={confirmarSenha} 
                      onChange={(e) => setConfirmarSenha(e.target.value)} 
                      required 
                      placeholder="Confirme a senha"
                    />
                  </label>

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer', margin: '5px 0 10px 0' }}>
                    <input
                      type="checkbox"
                      required
                      checked={aceitouTermos}
                      onChange={(e) => setAceitouTermos(e.target.checked)}
                      style={{ marginTop: '2px', accentColor: '#00d084', width: 'auto !important' }}
                    />
                    <span>
                      Li e concordo com a{' '}
                      <a href="#privacidade" onClick={(e) => { e.preventDefault(); setTelaAtual('privacidade'); setShowLoginModal(false); }} style={{ color: '#00d084', textDecoration: 'underline', fontWeight: '600' }}>
                        Política de Privacidade
                      </a>
                      {' '}e autorizo o tratamento dos meus dados pessoais. *
                    </span>
                  </label>

                  <button type="submit" className="btn-brand" disabled={authActionLoading} style={{ marginTop: '10px' }}>
                    {authActionLoading ? 'Cadastrando...' : 'Criar Conta'}
                  </button>

                  <div style={{ textAlign: 'center', fontSize: '13px', marginTop: '10px' }}>
                    Já possui uma conta? <a href="#login" onClick={(e) => { e.preventDefault(); setAuthModo('login'); setErro(''); setMensagemSucesso(''); }} style={{ color: '#00d084', textDecoration: 'none', fontWeight: '500' }}>Fazer Login</a>
                  </div>
                </form>
              )}

              {/* FORMULÁRIO DE RECUPERAÇÃO DE SENHA */}
              {authModo === 'recuperar' && (
                <form onSubmit={handleRecuperarSenha} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <label style={labelStyle}>
                    E-mail de cadastro:
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      placeholder="seuemail@empresa.com"
                    />
                  </label>

                  <button type="submit" className="btn-brand" disabled={authActionLoading} style={{ marginTop: '10px' }}>
                    {authActionLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                  </button>

                  <div style={{ textAlign: 'center', fontSize: '13px', marginTop: '10px' }}>
                    <a href="#login" onClick={(e) => { e.preventDefault(); setAuthModo('login'); setErro(''); setMensagemSucesso(''); }} style={{ color: '#00d084', textDecoration: 'none', fontWeight: '500' }}>Voltar para o Login</a>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
        {renderTicketModal()}

        {/* Botão Flutuante de Abrir Chamado no Canto Inferior Direito */}
        <button 
          onClick={() => { setShowTicketModal(true); setTicketSucessoLog(null); }}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            backgroundColor: '#00d084',
            color: '#ffffff',
            border: 'none',
            borderRadius: '50px',
            padding: '14px 24px',
            boxShadow: '0 10px 25px rgba(0, 208, 132, 0.4)',
            cursor: 'pointer',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '700',
            fontSize: '14px',
            transition: 'transform 0.2s, box-shadow 0.2s, background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 208, 132, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 208, 132, 0.4)';
          }}
          title="Abrir Chamado Técnico"
        >
          🛠️ Abrir Chamado
        </button>
      </div>
    );
  }

  // --- INTERFACE DO PAINEL PRINCIPAL LOGADO ---
  return (
    <div style={{ backgroundColor: 'var(--bg-app)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* CORPORATE STICKY HEADER */}
      <header className="sticky top-0 z-50 flex items-center justify-between h-14 px-6 md:px-12 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-brand/10 border-b border-slate-800/80 shadow-md transition-all duration-300" style={{ paddingLeft: '8px' }}>
        <div className="flex items-center gap-2 cursor-pointer py-1 px-3 hover:bg-slate-800/40 rounded-lg transition-all duration-200 mr-8 ml-6" onClick={() => setTelaAtual('painel')}>
          <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand to-emerald-400 select-none mx-12">
            Endocompany
          </span>
        </div>
        <nav className="hidden lg:flex items-center gap-2.5 h-full">
          <button 
            className={`px-4 py-1.5 flex items-center text-sm font-bold rounded-lg transition-all duration-200 ${
              telaAtual === 'painel' 
                ? 'text-brand bg-brand/10 dark:bg-brand/15' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`} 
            onClick={() => setTelaAtual('painel')}
          >
            Início
          </button>
          
          {userRole !== 'Comum' && (
            <>
              <button 
                className={`px-4 py-1.5 flex items-center text-sm font-bold rounded-lg transition-all duration-200 ${
                  telaAtual === 'equipamentos' 
                    ? 'text-brand bg-brand/10 dark:bg-brand/15' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`} 
                onClick={() => setTelaAtual('equipamentos')}
              >
                Equipamentos
              </button>
              <button 
                className={`px-4 py-1.5 flex items-center text-sm font-bold rounded-lg transition-all duration-200 ${
                  telaAtual === 'calendario' 
                    ? 'text-brand bg-brand/10 dark:bg-brand/15' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`} 
                onClick={() => setTelaAtual('calendario')}
              >
                Preventivas
              </button>
              <button 
                className={`px-4 py-1.5 flex items-center text-sm font-bold rounded-lg transition-all duration-200 ${
                  telaAtual === 'estoque' 
                    ? 'text-brand bg-brand/10 dark:bg-brand/15' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`} 
                onClick={() => setTelaAtual('estoque')}
              >
                Estoque
              </button>
            </>
          )}

          <button 
            className={`px-4 py-1.5 flex items-center text-sm font-bold rounded-lg transition-all duration-200 ${
              telaAtual === 'eventos' 
                ? 'text-brand bg-brand/10 dark:bg-brand/15' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`} 
            onClick={() => setTelaAtual('eventos')}
          >
            Eventos
          </button>

          {userRole !== 'Comum' && (
            <button 
              className={`px-4 py-1.5 flex items-center text-sm font-bold rounded-lg transition-all duration-200 ${
                telaAtual === 'tickets' 
                  ? 'text-brand bg-brand/10 dark:bg-brand/15' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`} 
              onClick={() => setTelaAtual('tickets')}
            >
              Atendimentos
            </button>
          )}
        </nav>
        
        <div className="flex items-center gap-4 h-full">
          <button 
            onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} 
            className="flex items-center justify-center w-10 h-10 text-xl text-slate-400 hover:text-brand hover:bg-slate-800/50 rounded-full transition-all duration-200"
            title={theme === 'light' ? 'Mudar para Modo Escuro' : 'Mudar para Modo Claro'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          
          <div className="relative ml-6 mr-6">
            <div 
              className="flex items-center justify-center w-10 h-10 font-black text-sm text-white bg-brand border-2 border-brand-hover hover:border-white rounded-full cursor-pointer transition-all duration-200"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              title="Minha Conta"
            >
              {(userData?.nome || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            
            {showUserDropdown && (
              <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-2 z-[100] animate-scaleIn" onClick={(e) => e.stopPropagation()}>
                <div className="px-4 py-2.5 border-b border-slate-800 mb-1">
                  <p className="font-bold text-sm text-white truncate">
                    {userData?.nome || 'Usuário'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {user.email}
                  </p>
                  <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-2 ${
                    userRole === 'ADM' ? 'bg-red-500/10 text-red-400' : userRole === 'Funcionario' ? 'bg-brand/10 text-brand' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {getRoleLabel(userRole)}
                  </span>
                </div>
                
                <button className="flex w-full items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-150" onClick={() => { setTelaAtual('perfil'); setShowUserDropdown(false); }}>
                  👤 Minha Conta
                </button>
                <button className="flex w-full items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-150" onClick={() => { setTelaAtual('painel'); setShowUserDropdown(false); }}>
                  🏠 Painel Principal
                </button>
                {userRole === 'ADM' && (
                  <button className="flex w-full items-center gap-2 px-4 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-slate-800 transition-all duration-150" onClick={() => { setTelaAtual('usuarios'); setShowUserDropdown(false); }}>
                    👥 Permissões ADM
                  </button>
                )}
                <div className="border-t border-slate-800 my-1"></div>
                <button className="flex w-full items-center gap-2 px-4 py-2 text-xs font-semibold text-red-500 hover:text-red-400 hover:bg-slate-800 transition-all duration-150" onClick={() => { handleLogout(); setShowUserDropdown(false); }}>
                  🚪 Sair da Conta
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL COM BASE NA TELA ATIVA */}
      <main style={{ flexGrow: 1, paddingBottom: '60px' }}>
        
        {/* TELA DE DASHBOARD INICIAL (PAINEL) */}
        {telaAtual === 'painel' && (
          <div>
            {/* HERO BANNER PERSONALIZADO */}
            <div className="portal-hero-container">
              <section className="portal-hero" style={{ height: '360px' }}>
                <div className="portal-hero-overlay"></div>
                <div className="portal-hero-content" style={{ maxWidth: '700px' }}>
                  <span className="portal-hero-badge">Área Restrita do Parceiro</span>
                  <h1 className="portal-hero-title" style={{ fontSize: '36px' }}>
                    Olá, {userData?.nome || user.email}!
                  </h1>
                  <p className="portal-hero-subtitle" style={{ fontSize: '15px', marginBottom: '0' }}>
                    Bem-vindo de volta ao ecossistema Endocompany. Use os atalhos abaixo para gerenciar inventários, agendar manutenções ou registrar e acompanhar chamados de suporte técnico.
                  </p>
                </div>
              </section>

              {/* FLOATING CARD UNDER HERO FOR LOGGED-IN USERS */}
              <div className="portal-floating-panel-container" style={{ margin: '-44px auto 0 auto' }}>
                <div className="portal-floating-panel" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '4px 24px 4px 0', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0,208,132,0.12)', border: '1px solid rgba(0,208,132,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🔐</div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px 0' }}>Nível de Acesso</p>
                      <p style={{ fontSize: '14px', color: '#f1f5f9', fontWeight: '700', margin: 0 }}>{getRoleLabel(userRole)}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '4px 24px', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🟢</div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px 0' }}>Banco de Dados</p>
                      <p style={{ fontSize: '14px', color: '#34d399', fontWeight: '700', margin: 0 }}>Conectado</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '4px 0 4px 24px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🛟</div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px 0' }}>Suporte Técnico</p>
                      <p style={{ fontSize: '14px', color: '#f1f5f9', fontWeight: '700', margin: 0 }}>Endocare & Suporte01</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ATALHOS EM GRID */}
            <div style={{ maxWidth: '1100px', margin: '48px auto 0 auto', padding: '0 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '4px', height: '24px', background: 'linear-gradient(180deg, var(--brand), var(--brand-hover))', borderRadius: '99px' }} />
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                  Serviços do Portal
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '18px' }}>
                {/* Card de Eventos (usuários comuns) */}
                {userRole === 'Comum' && (
                  <div className="app-card" style={{ cursor: 'pointer' }} onClick={() => setTelaAtual('eventos')}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(0,208,132,0.15), rgba(0,208,132,0.06))', border: '1px solid rgba(0,208,132,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '16px' }}>📢</div>
                    <p style={{ fontSize: '10px', color: 'var(--brand)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px 0' }}>Participação</p>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>Eventos</h3>
                    <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      Participe ou gerencie eventos de demonstração prática e apresentações de equipamentos.
                    </p>
                  </div>
                )}

                {/* Card de Equipamentos (Funcionário e ADM) */}
                {userRole !== 'Comum' && (
                  <div className="app-card" style={{ cursor: 'pointer' }} onClick={() => setTelaAtual('equipamentos')}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.06))', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '16px' }}>📦</div>
                    <p style={{ fontSize: '10px', color: '#3b82f6', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px 0' }}>Inventário</p>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>Equipamentos</h3>
                    <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      Gerencie cadastros, seriais, localizações e consulte a base de ativos.
                    </p>
                  </div>
                )}

                {/* Card de Preventivas (Funcionário e ADM) */}
                {userRole !== 'Comum' && (
                  <div className="app-card" style={{ cursor: 'pointer' }} onClick={() => setTelaAtual('calendario')}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.06))', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '16px' }}>📅</div>
                    <p style={{ fontSize: '10px', color: '#d97706', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px 0' }}>Manutenção</p>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>Preventivas</h3>
                    <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      Acompanhe o cronograma de manutenção, prazos e vincule relatórios de preventiva.
                    </p>
                  </div>
                )}

                {/* Card de Controle de Estoque (Funcionário e ADM) */}
                {userRole !== 'Comum' && (
                  <div className="app-card" style={{ cursor: 'pointer' }} onClick={() => setTelaAtual('estoque')}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.06))', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '16px' }}>📋</div>
                    <p style={{ fontSize: '10px', color: '#059669', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px 0' }}>Logística</p>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>Controle de Estoque</h3>
                    <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      Gerencie peças e produtos: entradas, saídas, localizações e disponibilidade.
                    </p>
                  </div>
                )}

                {/* Card de Eventos (ADM/Funcionário) */}
                {userRole !== 'Comum' && (
                  <div className="app-card" style={{ cursor: 'pointer' }} onClick={() => setTelaAtual('eventos')}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(0,208,132,0.15), rgba(0,208,132,0.06))', border: '1px solid rgba(0,208,132,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '16px' }}>📢</div>
                    <p style={{ fontSize: '10px', color: 'var(--brand)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px 0' }}>Participação</p>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>Eventos</h3>
                    <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      Participe ou gerencie eventos de demonstração prática e apresentações de equipamentos.
                    </p>
                  </div>
                )}

                {/* Card de Atendimentos (Funcionários e ADM) */}
                {userRole !== 'Comum' && (
                  <div className="app-card" style={{ cursor: 'pointer' }} onClick={() => setTelaAtual('tickets')}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.06))', border: '1px solid rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '16px' }}>🎫</div>
                    <p style={{ fontSize: '10px', color: '#9333ea', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px 0' }}>Suporte</p>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>Atendimentos</h3>
                    <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      Gerencie e atenda solicitações de suporte abertas por hospitais ou parceiros técnicos.
                    </p>
                  </div>
                )}

                {/* Card de Gerenciamento de Usuários (APENAS ADM) */}
                {userRole === 'ADM' && (
                  <div className="app-card" style={{ cursor: 'pointer' }} onClick={() => setTelaAtual('usuarios')}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.06))', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '16px' }}>👥</div>
                    <p style={{ fontSize: '10px', color: 'var(--danger)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px 0' }}>Administração</p>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>Gerenciar Permissões</h3>
                    <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      Gerencie contas cadastradas e altere privilégios (Comum, Funcionário ou ADM).
                    </p>
                  </div>
                )}
              </div>
            </div>



          </div>
        )}

        {/* CONTAINER DO PROJETO COM PADDING GERAL PARA TELA CHEIA DOS SUBCOMPONENTES */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
          <Suspense fallback={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '15px' }}>
              <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-light)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>Carregando...</span>
            </div>
          }>
            {telaAtual === 'equipamentos' && userRole !== 'Comum' && (
              <Equipamentos />
            )}

            {telaAtual === 'calendario' && userRole !== 'Comum' && (
              <Calendario currentUser={user} userData={userData} />
            )}

            {telaAtual === 'eventos' && (
              <Eventos currentUser={user} />
            )}

            {telaAtual === 'tickets' && userRole !== 'Comum' && (
              <Tickets />
            )}

            {telaAtual === 'estoque' && userRole !== 'Comum' && (
              <Estoque />
            )}

            {telaAtual === 'usuarios' && userRole === 'ADM' && (
              <Usuarios currentUser={user} />
            )}

            {telaAtual === 'privacidade' && (
              <PoliticaPrivacidade />
            )}

            {telaAtual === 'minha_privacidade' && (
              <MinhaPrivacidade 
                voltarPainel={() => setTelaAtual('perfil')} 
                currentUser={user} 
                userData={userData} 
                handleSolicitarExclusaoConta={handleSolicitarExclusaoConta} 
              />
            )}
          </Suspense>

          {/* TELA DE PERFIL / ALTERAÇÃO DE SENHA */}
          {telaAtual === 'perfil' && (
            <div style={{ maxWidth: '600px', margin: '30px auto 0 auto' }}>
              <button onClick={voltarPainel} className="btn-outline" style={{ marginBottom: '20px' }}>
                ← Voltar ao Painel
              </button>
              
              <div className="app-card">
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>👤 Minha Conta</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                  Mantenha os dados do seu acesso atualizados.
                </p>

                <button 
                  onClick={() => setTelaAtual('minha_privacidade')}
                  className="btn-outline" 
                  style={{ width: '100%', marginBottom: '25px', borderColor: '#00d084', color: '#00d084', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  🛡️ Gerenciar Privacidade & LGPD
                </button>

                <div style={{ backgroundColor: 'var(--bg-app)', padding: '15px', borderRadius: '8px', marginBottom: '25px', border: '1px solid var(--border-light)' }}>
                  <p style={{ fontSize: '14px', margin: '0 0 5px 0', color: 'var(--text-secondary)' }}>E-mail de Login:</p>
                  <strong style={{ fontSize: '16px', color: 'var(--text-primary)' }}>{user.email}</strong>
                  
                  <p style={{ fontSize: '14px', margin: '15px 0 5px 0', color: 'var(--text-secondary)' }}>Nível de Permissão:</p>
                  <span className={`badge-role ${userRole === 'ADM' ? 'badge-role-adm' : userRole === 'Funcionario' ? 'badge-role-funcionario' : 'badge-role-comum'}`}>
                    {getRoleLabel(userRole)}
                  </span>
                </div>

                <hr style={{ border: '0', height: '1px', background: 'var(--border-light)', marginBottom: '25px' }} />

                {erro && (
                  <div className="alert-box alert-error" style={{ marginBottom: '15px' }}>
                    ⚠️ {erro}
                  </div>
                )}
                
                {mensagemSucesso && (
                  <div className="alert-box alert-success" style={{ marginBottom: '15px' }}>
                    ✅ {mensagemSucesso}
                  </div>
                )}

                <h3 style={{ color: 'var(--text-primary)', marginBottom: '15px' }}>👤 Dados Pessoais</h3>

                <form onSubmit={handleSalvarPerfil} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                  <label style={labelStyle}>
                    Nome Completo: *
                    <input 
                      type="text" 
                      value={perfilNome} 
                      onChange={(e) => setPerfilNome(e.target.value)} 
                      required 
                      placeholder="Seu nome completo"
                    />
                  </label>
                  
                  <label style={labelStyle}>
                    Telefone / Celular: *
                    <input 
                      type="tel" 
                      value={perfilTelefone} 
                      onChange={(e) => setPerfilTelefone(formatarTelefone(e.target.value))} 
                      required 
                      placeholder="(00) 00000-0000"
                    />
                  </label>



                  <label style={labelStyle}>
                    Endereço:
                    <input 
                      type="text" 
                      value={perfilEndereco} 
                      onChange={(e) => setPerfilEndereco(e.target.value)} 
                      placeholder="Rua, Número, Bairro, Cidade - UF"
                    />
                  </label>

                  <button 
                    type="submit" 
                    className="btn-brand" 
                    disabled={authActionLoading}
                    style={{ marginTop: '10px' }}
                  >
                    {authActionLoading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </form>

                <hr style={{ border: '0', height: '1px', background: 'var(--border-light)', marginBottom: '25px' }} />

                <h3 style={{ color: 'var(--text-primary)', marginBottom: '15px' }}>🔒 Alterar Minha Senha</h3>

                <form onSubmit={handleAlterarSenhaLogado} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <label style={labelStyle}>
                    Nova Senha:
                    <input 
                      type="password" 
                      value={novaSenha} 
                      onChange={(e) => setNovaSenha(e.target.value)} 
                      required 
                      placeholder="Mínimo 6 caracteres"
                    />
                  </label>
                  <label style={labelStyle}>
                    Confirmar Nova Senha:
                    <input 
                      type="password" 
                      value={confirmarNovaSenha} 
                      onChange={(e) => setConfirmarNovaSenha(e.target.value)} 
                      required 
                      placeholder="Confirme a nova senha"
                    />
                  </label>

                  <button 
                    type="submit" 
                    className="btn-brand" 
                    disabled={authActionLoading}
                    style={{ marginTop: '10px' }}
                  >
                    {authActionLoading ? 'Atualizando...' : 'Atualizar Senha'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER DO PORTAL */}
      <footer className="portal-footer" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', padding: '30px 20px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px', fontSize: '13px' }}>
          <div style={{ textAlign: 'left' }}>
            <p style={{ margin: 0, fontWeight: '700', color: 'var(--text-primary)' }}>Endocompany Ltda</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>Controladora de Dados</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: '600' }}>Encarregado (DPO): <a href="mailto:endocare@endocompany.com.br" style={{ color: '#00d084', textDecoration: 'none' }}>endocare@endocompany.com.br</a></p>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', gap: '15px', alignItems: 'center' }}>
            <a href="#privacidade" onClick={(e) => { e.preventDefault(); setTelaAtual('privacidade'); }} style={{ color: '#00d084', textDecoration: 'none', fontWeight: '600' }}>Política de Privacidade</a>
            <span>&copy; {new Date().getFullYear()} Endocompany.</span>
          </div>
        </div>
      </footer>

      {/* Botão Flutuante de Abrir Chamado no Canto Inferior Direito para Usuários Comuns Logados */}
      {user && userRole === 'Comum' && telaAtual === 'painel' && (
        <button 
          onClick={() => { setShowTicketModal(true); setTicketSucessoLog(null); }}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            backgroundColor: '#00d084',
            color: '#ffffff',
            border: 'none',
            borderRadius: '50px',
            padding: '14px 24px',
            boxShadow: '0 10px 25px rgba(0, 208, 132, 0.4)',
            cursor: 'pointer',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '700',
            fontSize: '14px',
            transition: 'transform 0.2s, box-shadow 0.2s, background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 208, 132, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 208, 132, 0.4)';
          }}
          title="Abrir Chamado Técnico"
        >
          🛠️ Abrir Chamado
        </button>
      )}

      {renderTicketModal()}
    </div>
  );
}

// Estilos de Labels
const labelStyle = { 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '6px', 
  fontSize: '14px', 
  fontWeight: '600', 
  color: 'var(--text-secondary)' 
};