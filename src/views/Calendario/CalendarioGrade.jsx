import React from 'react';
import {
  controleMesStyle,
  btnSetaStyle,
  selectHeaderStyle,
  calendarioContainerStyle,
  cabecalhoDiaSemanaStyle,
  celulaDiaStyle,
  legendaStyle
} from './styles';

export default function CalendarioGrade({
  dataFocal, setDataFocal,
  meses, anos, diasDaSemana,
  alterarMesSetas,
  mesAtual, anoAtual,
  isMobile,
  loading,
  gradeDias,
  obterPreventivasDoDia,
  obterCorStatus,
  obterTituloLocal,
  obterEquipamentosVinculados,
  diaSelecionado, executarCliqueDia,
  userRole,
  handleDiaClick,
  handleEventoClick
}) {
  return (
    <>
      <div style={controleMesStyle}>
        <button type="button" onClick={() => alterarMesSetas(-1)} style={btnSetaStyle}>◀</button>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select value={mesAtual} onChange={(e) => setDataFocal(new Date(anoAtual, parseInt(e.target.value), 1))} style={selectHeaderStyle}>
            {meses.map((m, idx) => <option key={idx} value={idx}>{m}</option>)}
          </select>
          <select value={anoAtual} onChange={(e) => setDataFocal(new Date(parseInt(e.target.value), mesAtual, 1))} style={selectHeaderStyle}>
            {anos.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <button type="button" onClick={() => alterarMesSetas(1)} style={btnSetaStyle}>▶</button>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        gap: '20px', 
        alignItems: 'flex-start',
        width: '100%',
        marginBottom: '20px'
      }}>
        {/* Lado Esquerdo: Calendário */}
        <div style={{ flex: isMobile ? '1' : '1.8', width: '100%', minWidth: 0 }}>
          <div style={calendarioContainerStyle}>
            {diasDaSemana.map((ds, index) => <div key={index} style={cabecalhoDiaSemanaStyle}>{ds}</div>)}
            {loading ? (
              <div style={{ gridColumn: 'span 7', textAlign: 'center', padding: '30px', color: '#666' }}>Carregando dados...</div>
            ) : (
              gradeDias.map((dia, index) => {
                const prevs = obterPreventivasDoDia(dia);
                const estaSelecionado = diaSelecionado === dia;

                return (
                  <div 
                    key={index} 
                    onClick={() => executarCliqueDia(dia)} 
                    style={{
                      ...celulaDiaStyle,
                      backgroundColor: dia ? (estaSelecionado ? 'var(--brand-light)' : 'var(--bg-card)') : 'transparent',
                      border: dia ? (estaSelecionado ? '2px solid var(--brand)' : '1px solid var(--border-light)') : 'none',
                      cursor: dia ? 'pointer' : 'default',
                      padding: '4px',
                      height: isMobile ? '52px' : '100px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start'
                    }}
                  >
                    {dia && (
                      <span style={{ 
                        fontWeight: 'bold', 
                        fontSize: isMobile ? '11px' : '12px', 
                        color: estaSelecionado ? 'var(--brand)' : 'var(--text-primary)', 
                        display: 'block', 
                        marginBottom: '3px' 
                      }}>
                        {dia}
                      </span>
                    )}
                    
                    {isMobile ? (
                      <div style={{ display: 'flex', gap: '3px', marginTop: 'auto', marginBottom: '2px', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
                        {prevs.slice(0, 3).map((prev) => (
                          <div 
                            key={prev.id} 
                            style={{ 
                              width: '6px', 
                              height: '6px', 
                              borderRadius: '50%', 
                              backgroundColor: obterCorStatus(prev.status) 
                            }} 
                          />
                        ))}
                        {prevs.length > 3 && (
                          <span style={{ fontSize: '7px', fontWeight: 'bold', color: 'var(--text-secondary)', lineHeight: '6px' }}>+</span>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto', flex: 1, paddingRight: '2px' }}>
                        {prevs.map((prev) => {
                          const cor = obterCorStatus(prev.status);
                          return (
                            <div 
                              key={prev.id} 
                              onClick={(e) => {
                                e.stopPropagation();
                                executarCliqueDia(dia);
                              }} 
                              title={prev.equipamento} 
                              style={{ 
                                borderLeft: `3px solid ${cor}`,
                                backgroundColor: 'var(--bg-app)',
                                color: 'var(--text-primary)', 
                                fontSize: '9px', 
                                padding: '2px 4px', 
                                borderRadius: '2px', 
                                whiteSpace: 'nowrap', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                fontWeight: '600', 
                                cursor: 'pointer',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--border-light)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-app)';
                              }}
                            >
                              {obterTituloLocal(prev).replace('🏥 ', '')}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Lado Direito: Agenda do Dia */}
        <div style={{ 
          width: isMobile ? '100%' : '300px', 
          alignSelf: 'stretch',
          minHeight: isMobile ? 'auto' : '450px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-md)',
          padding: '16px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)', fontWeight: 'bold' }}>
              📅 {diaSelecionado ? `Agenda: ${diaSelecionado} de ${meses[mesAtual]}` : 'Selecione um Dia'}
            </h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              {userRole !== 'Comum' && diaSelecionado && (
                <button 
                  type="button" 
                  onClick={() => handleDiaClick(diaSelecionado)} 
                  style={{ 
                    border: 'none', 
                    background: 'var(--brand)', 
                    color: '#fff', 
                    fontWeight: 'bold', 
                    fontSize: '11px', 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0, 208, 132, 0.15)',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--brand-hover)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--brand)'}
                >
                  ➕ Novo
                </button>
              )}
            </div>
          </div>
          
          {!diaSelecionado ? (
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
              Selecione um dia no calendário para ver seus agendamentos.
            </p>
          ) : obterPreventivasDoDia(diaSelecionado).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', backgroundColor: 'var(--bg-app)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Nenhuma preventiva agendada para este dia.</p>
              {userRole !== 'Comum' && (
                <button 
                  type="button" 
                  onClick={() => handleDiaClick(diaSelecionado)}
                  style={{
                    marginTop: '10px',
                    padding: '6px 12px',
                    backgroundColor: 'transparent',
                    color: 'var(--brand)',
                    border: '1px solid var(--brand)',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--brand)';
                    e.target.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = 'var(--brand)';
                  }}
                >
                  Agendar Agora
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: isMobile ? '400px' : '500px', paddingRight: '2px' }}>
              {obterPreventivasDoDia(diaSelecionado).map(prev => (
                <div 
                  key={prev.id} 
                  onClick={(e) => handleEventoClick(e, prev)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${obterCorStatus(prev.status)}`,
                    backgroundColor: 'var(--bg-app)',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s',
                    border: '1px solid var(--border-light)',
                    borderLeftWidth: '4px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--border-light)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-app)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block' }}>{obterTituloLocal(prev)}</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                    🛠️ {obterEquipamentosVinculados(prev).join(', ')}
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <span style={{ 
                      fontSize: '9px', 
                      fontWeight: 'bold', 
                      color: obterCorStatus(prev.status) === '#ffc107' ? '#212529' : '#fff',
                      backgroundColor: obterCorStatus(prev.status),
                      padding: '2px 6px',
                      borderRadius: '10px'
                    }}>
                      {prev.status}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--brand)', fontWeight: 'bold' }}>Editar/Detalhes →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={legendaStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '12px', height: '12px', backgroundColor: '#ffc107', borderRadius: '3px' }}></div><span>Agendada</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '12px', height: '12px', backgroundColor: '#28a745', borderRadius: '3px' }}></div><span>Concluída</span></div>
      </div>
    </>
  );
}
