import React from 'react';

// Estilos idênticos ao formulário do Estoque
const cardStyle = {
  backgroundColor: 'var(--bg-card)',
  borderRadius: '16px',
  border: '1px solid var(--border-light)',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  padding: '30px',
  marginBottom: '0'
};

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  fontSize: '14px',
  fontWeight: '600',
  color: 'var(--text-secondary)'
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '6px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-card)',
  color: 'var(--text-primary)',
  fontSize: '14px',
  fontFamily: 'inherit',
  boxSizing: 'border-box'
};

const selectStyle = {
  padding: '10px 12px',
  borderRadius: '6px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-card)',
  color: 'var(--text-primary)',
  fontSize: '14px',
  width: '100%',
  fontFamily: 'inherit'
};

const sectionTitleStyle = {
  margin: '0 0 16px 0',
  fontSize: '16px',
  fontWeight: '700',
  color: 'var(--text-primary)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const dividerStyle = {
  borderTop: '1px solid var(--border-light)',
  margin: '24px 0'
};

const grid2Style = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '15px'
};

const grid3Style = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: '15px'
};

const grid4Style = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr 1fr',
  gap: '15px'
};

const checkboxAreaStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px',
  backgroundColor: 'var(--bg-app)',
  borderRadius: '8px',
  border: '1px solid var(--border-light)',
  marginTop: '5px'
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

export default function EquipamentosForm({
  isComum,
  idEditando,
  handleSalvar,
  voltarParaLista,

  // States
  local, setLocal,
  cidade, setCidade,
  estadoLoc, setEstadoLoc,
  fornecedor, setFornecedor,
  produto, setProduto,
  instalacao, setInstalacao,
  simulador, setSimulador,
  serial, setSerial,
  mentorLearn, setMentorLearn,
  inicioContrato, setInicioContrato,
  metodoContrato, setMetodoContrato,
  fimContrato, setFimContrato,
  preventivasAnuais, setPreventivasAnuais,
  statusMentorLearn, setStatusMentorLearn,
  fimMentorLearn, setFimMentorLearn,
  ultimaManutencao, setUltimaManutencao,
  proximaPreventiva, setProximaPreventiva,
  email, setEmail,
  endereco, setEndereco,
  observacoes, setObservacoes,
  statusEquip, setStatusEquip,
  emContrato, setEmContrato
}) {
  const [formState, formAction, isPending] = React.useActionState(
    // eslint-disable-next-line no-unused-vars
    async (prevState, formData) => {
      try {
        const msg = await handleSalvar();
        return { success: true, message: msg, error: null };
      } catch (err) {
        return { success: false, message: null, error: err.message || 'Erro desconhecido ao salvar.' };
      }
    },
    { success: null, message: null, error: null }
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 16px 32px', boxSizing: 'border-box' }}>
      <div style={cardStyle} className="app-card--static">

        {/* CABEÇALHO */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '20px', fontWeight: 'bold' }}>
              {isComum ? '🔍 Detalhes do Equipamento' : (idEditando ? '✏️ Editar Equipamento' : '✨ Novo Equipamento')}
            </h3>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
              {isComum
                ? 'Visualização dos dados de registro do ativo.'
                : 'Preencha as especificações técnicas, contratos e informações do cliente para este ativo.'}
            </p>
          </div>
        </div>

        {/* ALERTAS */}
        {formState.error && (
          <div style={{ padding: '12px 16px', marginBottom: '20px', backgroundColor: 'var(--danger-light)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', color: 'var(--danger)', fontSize: '14px', fontWeight: '600' }}>
            ⚠️ {formState.error}
          </div>
        )}
        {formState.message && (
          <div style={{ padding: '12px 16px', marginBottom: '20px', backgroundColor: '#d1fae5', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', color: '#065f46', fontSize: '14px', fontWeight: '600' }}>
            ✅ {formState.message}
          </div>
        )}

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

          {/* SEÇÃO 1: CLIENTE & LOCALIZAÇÃO */}
          <p style={sectionTitleStyle}>📍 Cliente &amp; Localização</p>

          <div style={{ ...grid4Style, marginBottom: '15px' }}>
            <label style={labelStyle}>
              Cliente / Hospital *
              <input disabled={isComum} type="text" value={local} onChange={(e) => setLocal(e.target.value)} required style={inputStyle} placeholder="Ex: Hospital Samaritano" />
            </label>
            <label style={labelStyle}>
              Email de Contato
              <input disabled={isComum} type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="Ex: engenharia@hospital.com" />
            </label>
            <label style={labelStyle}>
              Cidade
              <input disabled={isComum} type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} style={inputStyle} placeholder="Ex: São Paulo" />
            </label>
            <label style={labelStyle}>
              UF (Estado) *
              <select disabled={isComum} value={estadoLoc} onChange={(e) => setEstadoLoc(e.target.value)} required style={selectStyle}>
                <option value="AC">Acre</option><option value="AL">Alagoas</option><option value="AP">Amapá</option><option value="AM">Amazonas</option>
                <option value="BA">Bahia</option><option value="CE">Ceará</option><option value="DF">Distrito Federal</option><option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option><option value="MA">Maranhão</option><option value="MT">Mato Grosso</option><option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option><option value="PA">Pará</option><option value="PB">Paraíba</option><option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option><option value="PI">Piauí</option><option value="RJ">Rio de Janeiro</option><option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option><option value="RO">Rondônia</option><option value="RR">Roraima</option><option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option><option value="SE">Sergipe</option><option value="TO">Tocantins</option>
              </select>
            </label>
          </div>

          <label style={{ ...labelStyle, marginBottom: '15px' }}>
            Endereço Completo
            <input disabled={isComum} type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} style={inputStyle} placeholder="Ex: Av. Paulista, 1000, Bloco B, Bairro Bela Vista" />
          </label>

          <div style={dividerStyle} />

          {/* SEÇÃO 2: DADOS DO EQUIPAMENTO */}
          <p style={sectionTitleStyle}>📦 Dados do Equipamento</p>

          <div style={{ ...grid4Style, marginBottom: '15px' }}>
            <label style={labelStyle}>
              Produto *
              <select disabled={isComum} value={produto} onChange={(e) => setProduto(e.target.value)} required style={selectStyle}>
                <option value="">-- Selecione o Produto --</option>
                <option value="Exact View">Exact View</option>
                <option value="Lap Mentor">Lap Mentor</option>
                <option value="Robotix">Robotix</option>
                <option value="Robotix + Lap Mentor">Robotix + Lap Mentor</option>
              </select>
            </label>
            <label style={labelStyle}>
              Simulador (Texto Livre)
              <input disabled={isComum} type="text" value={simulador} onChange={(e) => setSimulador(e.target.value)} style={inputStyle} placeholder="Ex: Versão Lite..." />
            </label>
            <label style={labelStyle}>
              Número de Série *
              <input disabled={isComum} type="text" value={serial} onChange={(e) => setSerial(e.target.value)} required style={inputStyle} placeholder="Nº de Série do Fabricante" />
            </label>
            <label style={labelStyle}>
              Fornecedor
              <input disabled={isComum} type="text" value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} style={inputStyle} placeholder="Ex: Surgical Science" />
            </label>
          </div>

          <div style={{ ...grid2Style, marginBottom: '15px' }}>
            <label style={labelStyle}>
              Status de Operação *
              <select disabled={isComum} value={statusEquip} onChange={(e) => setStatusEquip(e.target.value)} required style={selectStyle}>
                <option value="Equipamento Funcionando">🟢 Equipamento Funcionando</option>
                <option value="Equipamento de Demonstração">🔵 Equipamento de Demonstração</option>
                <option value="Backup">⚪ Backup</option>
                <option value="Em Manutenção">🔴 Em Manutenção</option>
              </select>
            </label>
            <label style={labelStyle}>
              Data de Instalação
              <input disabled={isComum} type="date" value={instalacao} onChange={(e) => setInstalacao(e.target.value)} style={inputStyle} />
            </label>
          </div>

          <div style={dividerStyle} />

          {/* SEÇÃO 3: CONTRATO & PRAZOS */}
          <p style={sectionTitleStyle}>📝 Contrato &amp; Prazos</p>

          <div style={checkboxAreaStyle}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none', margin: 0, fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
              <input
                disabled={isComum}
                id="emContratoCheck"
                type="checkbox"
                checked={emContrato}
                onChange={(e) => setEmContrato(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--brand)' }}
              />
              Este equipamento está coberto por um Contrato de Manutenção Ativo?
            </label>
          </div>

          {emContrato && (
            <div style={{ ...grid3Style, marginTop: '15px' }}>
              <label style={labelStyle}>
                Data Início do Contrato
                <input disabled={isComum} type="date" value={inicioContrato} onChange={(e) => setInicioContrato(e.target.value)} style={inputStyle} />
              </label>
              <label style={labelStyle}>
                Método de Contrato
                <input disabled={isComum} type="text" value={metodoContrato} onChange={(e) => setMetodoContrato(e.target.value)} style={inputStyle} placeholder="Ex: Anual, Comodato..." />
              </label>
              <label style={labelStyle}>
                Data Fim do Contrato
                <input disabled={isComum} type="date" value={fimContrato} onChange={(e) => setFimContrato(e.target.value)} style={inputStyle} />
              </label>
            </div>
          )}

          <div style={dividerStyle} />

          {/* SEÇÃO 4: MENTOR LEARN */}
          <p style={sectionTitleStyle}>💻 Licença Mentor Learn</p>

          <div style={{ ...grid3Style, marginBottom: '15px' }}>
            <label style={labelStyle}>
              Mentor Learn
              <input disabled={isComum} type="text" value={mentorLearn} onChange={(e) => setMentorLearn(e.target.value)} style={inputStyle} placeholder="Ex: Mentor Learning" />
            </label>
            <label style={labelStyle}>
              Status Mentor Learn
              <input disabled={isComum} type="text" value={statusMentorLearn} onChange={(e) => setStatusMentorLearn(e.target.value)} style={inputStyle} placeholder="Ex: Ativo, Expirado" />
            </label>
            <label style={labelStyle}>
              Fim Mentor Learn
              <input disabled={isComum} type="date" value={fimMentorLearn} onChange={(e) => setFimMentorLearn(e.target.value)} style={inputStyle} />
            </label>
          </div>

          <div style={dividerStyle} />

          {/* SEÇÃO 5: PREVENTIVAS & OBSERVAÇÕES */}
          <p style={sectionTitleStyle}>🔧 Preventivas &amp; Observações</p>

          <div style={{ ...grid3Style, marginBottom: '15px' }}>
            <label style={labelStyle}>
              Preventivas Anuais (Qtde)
              <input disabled={isComum} type="number" min="0" value={preventivasAnuais} onChange={(e) => setPreventivasAnuais(e.target.value)} style={inputStyle} placeholder="Ex: 2" />
            </label>
            <label style={labelStyle}>
              Última Preventiva
              <input disabled={isComum} type="date" value={ultimaManutencao} onChange={(e) => setUltimaManutencao(e.target.value)} style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Próxima Preventiva
              <input disabled={isComum} type="date" value={proximaPreventiva} onChange={(e) => setProximaPreventiva(e.target.value)} style={inputStyle} />
            </label>
          </div>

          <label style={{ ...labelStyle, marginBottom: '15px' }}>
            Observações Gerais
            <textarea
              disabled={isComum}
              rows="3"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }}
              placeholder="Histórico, detalhes adicionais, acessórios..."
            />
          </label>

          {/* BOTÕES */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
            <button type="button" onClick={voltarParaLista} style={btnCancelStyle}>
              {isComum ? 'Voltar' : 'Cancelar'}
            </button>
            {!isComum && (
              <button type="submit" disabled={isPending} style={{ ...btnSubmitStyle, opacity: isPending ? 0.6 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}>
                {isPending ? '⏳ Salvando...' : (idEditando ? 'Salvar Edição' : 'Cadastrar Equipamento')}
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}
