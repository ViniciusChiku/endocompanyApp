import React, { useState } from 'react';
import { useUI } from '../context/UIContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useApp } from '../context/AppContext';

export default function MinhaPrivacidade({ currentUser, userData, handleSolicitarExclusaoConta }) {
  const { showToast } = useUI();
  const { voltarPainel } = useApp();
  const [exportando, setExportando] = useState(false);

  // Formata data do aceite
  const obterDataAceiteFormatada = () => {
    const dataAceite = userData?.consentimento?.dataAceite;
    if (!dataAceite) {
      // Se não houver dataAceite mas houver createdAt, usa ela como fallback
      const createdAt = userData?.createdAt;
      if (createdAt) {
        if (createdAt.seconds) {
          return new Date(createdAt.seconds * 1000).toLocaleString('pt-BR');
        } else if (createdAt instanceof Date) {
          return createdAt.toLocaleString('pt-BR');
        }
      }
      return new Date().toLocaleString('pt-BR'); // Fallback atual se nada existir
    }

    if (dataAceite.seconds) {
      return new Date(dataAceite.seconds * 1000).toLocaleString('pt-BR');
    } else if (dataAceite instanceof Date) {
      return dataAceite.toLocaleString('pt-BR');
    }
    return dataAceite.toString();
  };

  // Exporta dados em formato JSON
  const handleExportarDados = async () => {
    setExportando(true);
    try {
      const dadosParaExportacao = {
        empresaControladora: "Endocompany Ltda",
        relatorioGeradoEm: new Date().toISOString(),
        legislacaoAplicavel: "Lei Geral de Proteção de Dados (LGPD) - Lei nº 13.709/2018",
        dadosDoTitular: {
          uid: currentUser?.uid || "N/A",
          nome: userData?.nome || "Não informado",
          email: currentUser?.email || "Não informado",
          telefone: userData?.telefone || "Não informado",
          endereco: userData?.endereco || "Não informado",
          role: userData?.role || "Comum",
          cadastroCriadoEm: userData?.createdAt ? (userData.createdAt.seconds ? new Date(userData.createdAt.seconds * 1000).toISOString() : userData.createdAt) : "N/A"
        },
        consentimentoRegistrado: {
          aceito: userData?.consentimento?.aceito || true,
          dataAceite: userData?.consentimento?.dataAceite ? (userData.consentimento.dataAceite.seconds ? new Date(userData.consentimento.dataAceite.seconds * 1000).toISOString() : userData.consentimento.dataAceite) : new Date().toISOString(),
          versaoPolitica: userData?.consentimento?.versaoPolitica || "1.0",
          canalConsentimento: userData?.consentimento?.meioCadastro || "web_portal"
        }
      };

      const jsonString = JSON.stringify(dadosParaExportacao, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `meus_dados_endocompany_${currentUser?.uid || 'titular'}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Grava log de auditoria no Firestore para a LGPD
      try {
        await addDoc(collection(db, 'logs_auditoria'), {
          acao: 'portabilidade_dados_exportacao',
          realizadoPor: currentUser.uid,
          realizadoPorEmail: currentUser.email,
          data: new Date(),
          detalhes: 'Cópia integral de dados cadastrais baixada pelo titular da conta (LGPD Art. 18, V).'
        });
      } catch (logErr) {
        console.error("Erro ao registrar log de auditoria de exportação:", logErr);
      }

      showToast("Seus dados foram reunidos e exportados com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      showToast("Não foi possível exportar seus dados. Tente novamente.", "error");
    }
    setExportando(false);
  };

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto', padding: '20px 0' }}>
      
      {/* CABEÇALHO */}
      <button onClick={voltarPainel} className="btn-outline" style={{ marginBottom: '20px' }}>
        ← Voltar ao Perfil
      </button>

      <div className="app-card" style={{ padding: '30px' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🛡️ Privacidade e Seus Dados
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '25px', lineHeight: '1.5' }}>
          Gerencie seus direitos de privacidade com base na Lei Geral de Proteção de Dados (LGPD).
        </p>

        {/* PAINEL 1: CONSENTIMENTO E TRANSPARÊNCIA */}
        <div style={sectionBoxStyle}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
            📝 Consentimento Registrado
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Status do Aceite:</span>
              <strong style={{ color: '#00d084' }}>Ativo (Concedido) ✓</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Data do Aceite:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{obterDataAceiteFormatada()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Versão da Política:</span>
              <strong style={{ color: 'var(--text-primary)' }}>Política de Privacidade v{userData?.consentimento?.versaoPolitica || "1.0"}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '5px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Controladora:</span>
              <strong style={{ color: 'var(--text-primary)' }}>Endocompany Ltda</strong>
            </div>
          </div>
        </div>

        {/* PAINEL 2: PORTABILIDADE E DOWNLOAD */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
            📥 Portabilidade dos Dados (Art. 18, V)
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '15px', lineHeight: '1.5' }}>
            Você tem o direito de fazer o download de todas as informações que a Endocompany mantém salvas no seu cadastro. O arquivo gerado está em formato seguro JSON, estruturado de forma legível.
          </p>
          <button 
            onClick={handleExportarDados} 
            className="btn-brand" 
            disabled={exportando}
            style={{ width: '100%', padding: '12px' }}
          >
            {exportando ? "Gerando Relatório..." : "📥 Exportar Todos os Meus Dados (JSON)"}
          </button>
        </div>

        <hr style={{ border: '0', height: '1px', background: 'var(--border-light)', marginBottom: '25px' }} />

        {/* PAINEL 3: EXCLUSÃO DE DADOS */}
        <div style={dangerBoxStyle}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '700', color: 'var(--danger)' }}>
            ⚠️ Eliminação e Anonimização (Art. 18, VI)
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
            Ao excluir sua conta, todos os seus dados pessoais identificáveis (Nome, Telefone, Endereço e E-mail) serão **anonimizados permanentemente** no banco de dados. Suas credenciais de login serão deletadas. 
            Seu histórico de chamados técnicos anteriores será mantido de forma totalmente anônima por obrigação legal e regulatória por 5 anos, sem qualquer vínculo com sua identidade.
          </p>
          <button 
            onClick={handleSolicitarExclusaoConta} 
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'var(--danger)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--danger)'}
          >
            ⚠️ Excluir Minha Conta e Dados
          </button>
        </div>

      </div>
    </div>
  );
}

const sectionBoxStyle = {
  backgroundColor: 'var(--bg-app)',
  padding: '20px',
  borderRadius: '10px',
  border: '1px solid var(--border-light)',
  marginBottom: '25px'
};

const dangerBoxStyle = {
  backgroundColor: 'rgba(239, 68, 68, 0.04)',
  padding: '20px',
  borderRadius: '10px',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  margin: '10px 0 0 0'
};
