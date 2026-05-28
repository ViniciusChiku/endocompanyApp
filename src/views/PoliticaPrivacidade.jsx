import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function PoliticaPrivacidade() {
  const { voltarPainel } = useApp();
  
  // Faz scroll automático para o topo ao carregar a página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 0' }}>
      
      {/* BOTÃO VOLTAR E CABEÇALHO */}
      <div style={toolbarStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
          <button onClick={voltarPainel} style={btnVoltarStyle}>
            ← Voltar
          </button>
          <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '28px', fontWeight: 'bold' }}>
            🔒 Política de Privacidade e Proteção de Dados
          </h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
            Lei Geral de Proteção de Dados Pessoais (LGPD) — Lei nº 13.709/2018
          </p>
        </div>
      </div>

      <div style={cardStyle} className="app-card">
        <p style={paragraphStyle}>
          A <strong>Endocompany</strong> se compromete com a transparência, segurança e privacidade dos seus dados pessoais. Esta política detalha como coletamos, tratamos, armazenamos e protegemos suas informações quando você utiliza nosso portal corporativo e serviços relacionados.
        </p>

        <hr style={dividerStyle} />

        {/* 1. AGENTE DE TRATAMENTO */}
        <h3 style={sectionTitleStyle}>1. Agente de Tratamento (Controlador)</h3>
        <p style={paragraphStyle}>
          A <strong>Endocompany</strong> atua como Controladora no tratamento de seus dados pessoais. Isso significa que somos responsáveis pelas decisões referentes ao uso das informações coletadas no portal de simulação cirúrgica e suporte técnico.
        </p>

        {/* 2. ENCARREGADO (DPO) */}
        <div style={dpoBoxStyle}>
          <h4 style={{ margin: '0 0 8px 0', color: '#00b372', fontWeight: '700', fontSize: '16px' }}>
            🧑‍💼 Encarregado pelo Tratamento de Dados (DPO)
          </h4>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
            Para exercer seus direitos de privacidade ou esclarecer dúvidas, entre em contato direto com nosso Encarregado (DPO) através do e-mail oficial:
          </p>
          <p style={{ margin: '10px 0 0 0', fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            ✉️ <a href="mailto:endocare@endocompany.com.br" style={{ color: '#00d084', textDecoration: 'none' }}>endocare@endocompany.com.br</a>
          </p>
        </div>

        {/* 3. DADOS COLETADOS E FINALIDADES */}
        <h3 style={sectionTitleStyle}>2. Dados Coletados e Finalidades do Tratamento</h3>
        <p style={paragraphStyle}>
          Coletamos apenas os dados estritamente necessários para viabilizar sua operação no portal:
        </p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Dado Pessoal</th>
              <th style={thStyle}>Finalidade do Tratamento</th>
              <th style={thStyle}>Base Legal (LGPD)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}><strong>Nome completo</strong></td>
              <td style={tdStyle}>Identificação e comunicação do usuário no sistema.</td>
              <td style={tdStyle}>Consentimento (Art. 7º, I)</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>E-mail corporativo</strong></td>
              <td style={tdStyle}>Autenticação de acesso, disparo de notificações em tempo real e resposta a chamados de suporte técnico.</td>
              <td style={tdStyle}>Consentimento (Art. 7º, I)</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Telefone / Celular</strong></td>
              <td style={tdStyle}>Contato urgente do time técnico ou suporte sobre manutenções de simuladores.</td>
              <td style={tdStyle}>Consentimento (Art. 7º, I)</td>
            </tr>
            <tr>
              <td style={tdStyle}><strong>Endereço / Hospital</strong></td>
              <td style={tdStyle}>Identificação física dos simuladores cirúrgicos atendidos e logística de preventivas.</td>
              <td style={tdStyle}>Execução de Contrato (Art. 7º, V)</td>
            </tr>
          </tbody>
        </table>

        {/* 4. PERÍODO DE RETENÇÃO */}
        <h3 style={sectionTitleStyle}>3. Período de Armazenamento e Retenção</h3>
        <p style={paragraphStyle}>
          Mantemos seus dados no banco de dados corporativo apenas enquanto forem necessários para cumprir a finalidade para a qual foram coletados:
        </p>
        <ul style={listStyle}>
          <li><strong>Dados de Perfil da Conta:</strong> Mantidos enquanto a conta do portal estiver ativa ou até solicitação de exclusão por parte do titular.</li>
          <li><strong>Chamados Técnicos e Atendimentos:</strong> Retidos por até <strong>5 anos</strong> após a conclusão do chamado técnico para fins de cumprimento de obrigações contratuais e fiscais.</li>
          <li><strong>Inscrições em Eventos e Presença:</strong> Retidos por até <strong>2 anos</strong> após a realização da demonstração prática para fins estatísticos e de controle operacional.</li>
        </ul>

        {/* 5. DIREITOS DOS TITULARES */}
        <h3 style={sectionTitleStyle}>4. Direitos dos Titulares de Dados (Art. 18)</h3>
        <p style={paragraphStyle}>
          Como titular de dados pessoais, você pode requerer a qualquer momento através do painel "Privacidade" (ou entrando em contato com nosso DPO):
        </p>
        <ul style={listStyle}>
          <li>A confirmação da existência de tratamento de seus dados.</li>
          <li>O acesso gratuito e integral a todos os seus dados armazenados.</li>
          <li>A retificação ou correção de dados incompletos, inexatos ou desatualizados.</li>
          <li>A eliminação (anonimização) de dados pessoais tratados com o seu consentimento.</li>
          <li>A revogação do consentimento concedido anteriormente.</li>
        </ul>

        {/* 6. MEDIDAS DE SEGURANÇA */}
        <h3 style={sectionTitleStyle}>5. Segurança e Medidas Técnicas</h3>
        <p style={paragraphStyle}>
          Adotamos políticas técnicas modernas para proteger seus dados, tais como criptografia HTTPS em trânsito, regras granulares de banco de dados do Cloud Firestore que bloqueiam acessos externos não autenticados, hashing de senhas via Firebase Auth e controle estrito de permissões operacionais (ADMs e Funcionários).
        </p>

        <p style={{ ...paragraphStyle, marginTop: '30px', fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center' }}>
          Última atualização: 25 de Maio de 2026. Versão da Política: 1.0 (Endocompany App).
        </p>
      </div>
    </div>
  );
}

// Estilos elegante de UI
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
  padding: '40px',
  backgroundColor: 'var(--bg-card)',
  borderRadius: '16px',
  border: '1px solid var(--border-light)',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  lineHeight: '1.7'
};

const sectionTitleStyle = {
  fontSize: '18px',
  fontWeight: '700',
  color: 'var(--text-primary)',
  marginTop: '25px',
  marginBottom: '10px'
};

const paragraphStyle = {
  fontSize: '15px',
  color: 'var(--text-secondary)',
  marginBottom: '15px'
};

const dividerStyle = {
  border: '0',
  height: '1px',
  background: 'var(--border-light)',
  margin: '25px 0'
};

const dpoBoxStyle = {
  backgroundColor: 'var(--brand-light)',
  padding: '20px',
  borderRadius: '10px',
  border: '1px solid rgba(0, 208, 132, 0.2)',
  margin: '25px 0'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  margin: '20px 0',
  fontSize: '14px'
};

const thStyle = {
  backgroundColor: 'var(--bg-app)',
  color: 'var(--text-primary)',
  fontWeight: 'bold',
  padding: '12px',
  textAlign: 'left',
  borderBottom: '2px solid var(--border-light)'
};

const tdStyle = {
  padding: '12px',
  borderBottom: '1px solid var(--border-light)',
  color: 'var(--text-secondary)',
  verticalAlign: 'top'
};

const listStyle = {
  paddingLeft: '20px',
  color: 'var(--text-secondary)',
  fontSize: '15px',
  marginBottom: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};
