import React from 'react';
import {
  gridStyle,
  cardEventStyle,
  cardHeaderStyle,
  cardTitleStyle,
  cardBodyStyle,
  obsSnippetStyle,
  cardDayGroupStyle,
  cardSlotRowStyle,
  cardSlotBtnStyle,
  progressBgStyle,
  progressFillStyle,
  cardFooterStyle
} from './styles';

export default function EventosCards({
  eventosFiltrados,
  normalizarEvento,
  currentUser,
  handleInscricaoSlot,
  handleAbrirDetalhesModal,
  formatarDataBr
}) {
  return (
    <div style={gridStyle}>
      {eventosFiltrados.map((evRaw) => {
        const ev = normalizarEvento(evRaw);

        return (
          <div key={ev.id} className="app-card" style={cardEventStyle}>
            <div style={cardHeaderStyle}>
              <div style={{ flex: 1 }}>
                <h3 style={cardTitleStyle}>{ev.titulo}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  🏢 <strong>Local:</strong> {ev.local}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '1px' }}>
                  📍 {ev.endereco}
                </p>
              </div>
            </div>

            <div style={cardBodyStyle}>
              {ev.observacoes && (
                <div style={obsSnippetStyle}>
                  <strong>💡 Nota:</strong> {ev.observacoes.slice(0, 80)}{ev.observacoes.length > 80 ? '...' : ''}
                </div>
              )}

              {/* Exibe dias e slots de turnos */}
              <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>🕒 Horários e Inscrições por Sessão:</strong>
                
                {ev.dias.map((d, dIdx) => (
                  <div key={dIdx} style={cardDayGroupStyle}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--brand)', marginBottom: '5px' }}>
                      📅 {formatarDataBr(d.data)}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {d.horarios.map((h, hIdx) => {
                        const totalInscritos = (h.inscritos || []).length;
                        const estaInscrito = (h.inscritos || []).some(i => i.uid === currentUser?.uid);
                        const percentual = Math.min(100, (totalInscritos / h.limite) * 100);
                        const esgotado = totalInscritos >= h.limite;

                        let progressColor = 'var(--brand)';
                        if (percentual >= 100) progressColor = 'var(--danger)';
                        else if (percentual >= 80) progressColor = 'var(--warning)';

                        return (
                          <div key={h.id || hIdx} style={cardSlotRowStyle}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                <strong>🕒 {h.hora}{h.horaFim ? ` às ${h.horaFim}` : ''}</strong>
                                <span style={{ fontSize: '11px', color: esgotado ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: '500' }}>
                                  {totalInscritos} / {h.limite} vagas
                                </span>
                              </div>
                              
                              <div style={{ ...progressBgStyle, height: '4px', marginTop: '3px' }}>
                                <div style={{ ...progressFillStyle, width: `${percentual}%`, backgroundColor: progressColor }} />
                              </div>
                            </div>

                            {/* Botão de ação do slot */}
                            {estaInscrito ? (
                              <button 
                                onClick={() => handleInscricaoSlot(ev, d.data, h.id)} 
                                className="btn-brand" 
                                style={{ ...cardSlotBtnStyle, backgroundColor: 'var(--danger, #ef4444)' }}
                              >
                                ⭐ Sair
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleInscricaoSlot(ev, d.data, h.id)} 
                                disabled={esgotado}
                                className="btn-brand" 
                                style={{
                                  ...cardSlotBtnStyle,
                                  backgroundColor: esgotado ? 'var(--bg-app)' : 'var(--brand)',
                                  color: esgotado ? 'var(--text-secondary)' : '#fff',
                                  cursor: esgotado ? 'not-allowed' : 'pointer'
                                }}
                              >
                                {esgotado ? '🔒 Lotado' : 'Quero Ir'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

            </div>

            <div style={cardFooterStyle}>
              <button 
                onClick={() => handleAbrirDetalhesModal(ev)} 
                className="btn-outline" 
                style={{ width: '100%', padding: '10px', fontSize: '13px', fontWeight: 'bold' }}
              >
                🔍 Detalhes do Evento & Presenças
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
