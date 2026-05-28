import React from 'react';
import {
  modalOverlayStyle,
  modalContentStyle,
  btnCloseStyle,
  detailBoxStyle,
  detailRowStyle,
  detailLabelStyle,
  detailValueStyle,
  cardDayGroupStyle,
  detailSessionRowStyle,
  progressBgStyle,
  progressFillStyle,
  labelStyle,
  subscriberListContainerStyle,
  subscriberRowStyle,
  subscriberEmailStyle,
  badgeRoleStyle,
  actionBtnStyle
} from './styles';

export default function EventosDetalhesModal({
  eventoSelecionado,
  eFuncionarioOuAdm,
  handleFecharDetalhesModal,
  handleAbrirCriarModal,
  handleExcluirEvento,
  formatarDataBr,
  currentUser,
  handleInscricaoSlot,
  exportarPresencaCSV,
  selectedSlotId,
  setSelectedSlotId,
  handleAlterarStatusParticipante,
  handleRemoverParticipante
}) {
  // Encontra o slot ativo correspondente ao selectedSlotId
  let activeSlot = null;
  let activeDayData = '';
  if (eventoSelecionado && selectedSlotId) {
    eventoSelecionado.dias.forEach(d => {
      const found = d.horarios.find(h => h.id === selectedSlotId);
      if (found) {
        activeSlot = found;
        activeDayData = d.data;
      }
    });
  }

  return (
    <div style={modalOverlayStyle}>
      <div style={{ ...modalContentStyle, maxWidth: '900px' }} className="app-card">
        
        {/* Cabeçalho do Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', gap: '10px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--brand)', letterSpacing: '0.05em' }}>
              📢 Evento Clínico / Testes e Demonstração
            </span>
            <h2 style={{ margin: '4px 0 0 0', color: 'var(--primary)', fontSize: '22px' }}>
              {eventoSelecionado.titulo}
            </h2>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {eFuncionarioOuAdm && (
              <>
                <button 
                  onClick={() => {
                    handleFecharDetalhesModal();
                    handleAbrirCriarModal(eventoSelecionado);
                  }} 
                  className="btn-outline"
                  style={{ padding: '6px 12px', fontSize: '13px', fontWeight: '600' }}
                >
                  ✏️ Editar
                </button>
                <button 
                  onClick={() => handleExcluirEvento(eventoSelecionado.id)} 
                  className="btn-danger"
                  style={{ padding: '6px 12px', fontSize: '13px', fontWeight: '600' }}
                >
                  🗑️ Excluir
                </button>
              </>
            )}
            <button onClick={handleFecharDetalhesModal} style={btnCloseStyle}>✕</button>
          </div>
        </div>

        {/* Corpo do Modal: Split view */}
        <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
          
          {/* Coluna Esquerda: Detalhes e Inscrição */}
          <div style={{ flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div style={detailBoxStyle}>
              <div style={detailRowStyle}>
                <span style={{ fontSize: '20px' }}>🏢</span>
                <div>
                  <p style={detailLabelStyle}>Localização:</p>
                  <strong style={detailValueStyle}>{eventoSelecionado.local}</strong>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{eventoSelecionado.endereco}</p>
                </div>
              </div>

              {eventoSelecionado.observacoes && (
                <div style={detailRowStyle}>
                  <span style={{ fontSize: '20px' }}>ℹ️</span>
                  <div>
                    <p style={detailLabelStyle}>Instruções para Acesso / Procurar por:</p>
                    <p style={{ ...detailValueStyle, fontWeight: 'normal', whiteSpace: 'pre-wrap', color: 'var(--text-primary)', fontSize: '13px' }}>
                      {eventoSelecionado.observacoes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* SELETOR DE SESSÕES (Inscrição) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h3 style={{ fontSize: '15px', color: 'var(--primary)', margin: 0, fontWeight: 'bold' }}>
                📅 Escolha uma Sessão para Participar:
              </h3>

              {eventoSelecionado.dias.map((d, dIdx) => (
                <div key={dIdx} style={cardDayGroupStyle}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>
                    📅 Dia {formatarDataBr(d.data)}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {d.horarios.map((h, hIdx) => {
                      const totalInscritos = (h.inscritos || []).length;
                      const estaInscrito = (h.inscritos || []).some(i => i.uid === currentUser?.uid);
                      const esgotado = totalInscritos >= h.limite;
                      const percentual = Math.min(100, (totalInscritos / h.limite) * 100);

                      return (
                        <div key={h.id || hIdx} style={detailSessionRowStyle}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold' }}>
                              <span>🕒 Horário: {h.hora}{h.horaFim ? ` às ${h.horaFim}` : ''}</span>
                              <span style={{ color: esgotado ? 'var(--danger)' : 'var(--brand)' }}>
                                {totalInscritos} de {h.limite} inscritos
                              </span>
                            </div>

                            <div style={{ ...progressBgStyle, height: '6px', marginTop: '4px' }}>
                              <div 
                                style={{ 
                                  ...progressFillStyle, 
                                  width: `${percentual}%`, 
                                  backgroundColor: estaInscrito ? 'var(--success)' : esgotado ? 'var(--danger)' : 'var(--brand)' 
                                }} 
                              />
                            </div>
                          </div>

                          <button 
                            onClick={() => handleInscricaoSlot(eventoSelecionado, d.data, h.id)}
                            disabled={esgotado && !estaInscrito}
                            className={estaInscrito ? "btn-danger" : "btn-brand"}
                            style={{
                              padding: '8px 14px', 
                              fontSize: '12px', 
                              fontWeight: 'bold',
                              opacity: (esgotado && !estaInscrito) ? 0.5 : 1
                            }}
                          >
                            {estaInscrito ? 'Desinscrever' : esgotado ? 'Lotado' : 'Participar'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Coluna Direita: Gestão de Presenças (APENAS ADM/FUNCIONÁRIOS) */}
          {eFuncionarioOuAdm && (
            <div style={{ flex: 1.3, minWidth: '350px', borderLeft: '1px solid var(--border-light)', paddingLeft: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--primary)', fontWeight: 'bold' }}>
                  👥 Lista de Chamada
                </h3>
                <button 
                  onClick={() => exportarPresencaCSV(eventoSelecionado)} 
                  className="btn-outline"
                  style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  📥 Exportar CSV Consolidado
                </button>
              </div>

              {/* SELETOR DE SLOT DA SESSÃO */}
              <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <label style={labelStyle}>
                  Selecione a sessão para chamada:
                  <select 
                    value={selectedSlotId} 
                    onChange={(e) => setSelectedSlotId(e.target.value)}
                    style={{ width: '100%', marginTop: '5px', fontSize: '13px' }}
                  >
                    {eventoSelecionado.dias.flatMap(d => 
                      d.horarios.map(h => (
                        <option key={h.id} value={h.id}>
                          {formatarDataBr(d.data)} das {h.hora}{h.horaFim ? ` às ${h.horaFim}` : ''} ({(h.inscritos || []).length} inscritos)
                        </option>
                      ))
                    )}
                  </select>
                </label>
              </div>

              {/* LISTA DE INSCRITOS DO SLOT SELECIONADO */}
              <div style={subscriberListContainerStyle}>
                {!activeSlot ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    Selecione um horário acima para gerenciar os participantes.
                  </div>
                ) : (!activeSlot.inscritos || activeSlot.inscritos.length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '35px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    Nenhum funcionário inscrito nesta sessão até o momento.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activeSlot.inscritos.map((inscrito) => {
                      let badgeBg = 'var(--bg-app)';
                      let badgeText = 'var(--text-secondary)';
                      if (inscrito.status === 'Confirmado') {
                        badgeBg = 'var(--success-light)';
                        badgeText = 'var(--success)';
                      } else if (inscrito.status === 'Ausente') {
                        badgeBg = 'var(--danger-light)';
                        badgeText = 'var(--danger)';
                      }

                      return (
                        <div key={inscrito.uid} style={subscriberRowStyle}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={subscriberEmailStyle} title={inscrito.email}>
                              {inscrito.email}
                            </p>
                            <span style={{ ...badgeRoleStyle, backgroundColor: badgeBg, color: badgeText }}>
                              {inscrito.status}
                            </span>
                          </div>

                          {/* Ações para a chamada */}
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button 
                              title="Confirmar Presença"
                              onClick={() => handleAlterarStatusParticipante(eventoSelecionado, inscrito.uid, 'Confirmado', activeDayData, selectedSlotId)}
                              style={{ ...actionBtnStyle, backgroundColor: inscrito.status === 'Confirmado' ? 'var(--success)' : 'var(--bg-app)', color: inscrito.status === 'Confirmado' ? '#fff' : 'var(--text-secondary)' }}
                            >
                              ✓
                            </button>
                            <button 
                              title="Marcar Ausência"
                              onClick={() => handleAlterarStatusParticipante(eventoSelecionado, inscrito.uid, 'Ausente', activeDayData, selectedSlotId)}
                              style={{ ...actionBtnStyle, backgroundColor: inscrito.status === 'Ausente' ? 'var(--danger)' : 'var(--bg-app)', color: inscrito.status === 'Ausente' ? '#fff' : 'var(--text-secondary)' }}
                            >
                              ✗
                            </button>
                            <button 
                              title="Remover da Sessão"
                              onClick={() => handleRemoverParticipante(eventoSelecionado, inscrito.uid, activeDayData, selectedSlotId)}
                              style={{ ...actionBtnStyle, backgroundColor: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.1)' }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
