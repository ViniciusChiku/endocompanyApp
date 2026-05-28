import React from 'react';
import {
  calendarHeaderStyle,
  navBtnStyle,
  calendarDaysRowStyle,
  calendarDayHeaderStyle,
  calendarGridStyle,
  emptyCellStyle,
  dayCellStyle,
  dayNumberStyle,
  dayEventContainerStyle,
  calendarEventBadgeStyle
} from './styles';

export default function EventosCalendario({
  dataFocal,
  handleMesAnterior,
  handleMesProximo,
  meses,
  diasDaSemana,
  obterDiasCalendario,
  normalizarEvento,
  eventosFiltrados,
  handleDiaClick,
  eFuncionarioOuAdm,
  diasExpandidos,
  setDiasExpandidos,
  currentUser,
  handleAbrirDetalhesModal
}) {
  return (
    <div className="app-card" style={{ padding: '30px' }}>
      <div style={calendarHeaderStyle}>
        <button onClick={handleMesAnterior} style={navBtnStyle}>◀ Anterior</button>
        <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', fontWeight: '700', margin: 0 }}>
          {meses[dataFocal.getMonth()]} de {dataFocal.getFullYear()}
        </h2>
        <button onClick={handleMesProximo} style={navBtnStyle}>Próximo ▶</button>
      </div>

      {/* Cabeçalho dos dias da semana */}
      <div style={calendarDaysRowStyle}>
        {diasDaSemana.map((d, index) => (
          <div key={index} style={calendarDayHeaderStyle}>{d}</div>
        ))}
      </div>

      {/* Grid de dias do mês */}
      <div style={calendarGridStyle}>
        {obterDiasCalendario().map((dia, index) => {
          if (dia === null) {
            return <div key={`empty-${index}`} style={emptyCellStyle} />;
          }

          const diaFormatado = String(dia).padStart(2, '0');
          const mesFormatado = String(dataFocal.getMonth() + 1).padStart(2, '0');
          const dataCompleta = `${dataFocal.getFullYear()}-${mesFormatado}-${diaFormatado}`;
          
          // Filtra eventos que possuem sessões nesta data
          const eventosDoDia = [];
          eventosFiltrados.forEach(evRaw => {
            const ev = normalizarEvento(evRaw);
            ev.dias.forEach(d => {
              if (d.data === dataCompleta) {
                d.horarios.forEach(h => {
                  eventosDoDia.push({
                    eventoOriginal: ev,
                    slotId: h.id,
                    hora: h.hora,
                    horaFim: h.horaFim || '',
                    limite: h.limite,
                    inscritos: h.inscritos || [],
                    titulo: ev.titulo,
                    local: ev.local
                  });
                });
              }
            });
          });

          return (
            <div 
              key={dia} 
              onClick={() => handleDiaClick(dataCompleta)}
              style={{
                ...dayCellStyle,
                cursor: eFuncionarioOuAdm ? 'pointer' : 'default',
                backgroundColor: 'var(--bg-card)'
              }}
              title={eFuncionarioOuAdm ? "Clique aqui para criar um evento nesta data" : undefined}
            >
              <span style={dayNumberStyle}>{dia}</span>
              <div style={{ ...dayEventContainerStyle, overflowY: diasExpandidos[dataCompleta] ? 'visible' : 'auto' }}>
                {(diasExpandidos[dataCompleta] ? eventosDoDia : eventosDoDia.slice(0, 2)).map((ev, sIdx) => {
                  const totalInscritos = (ev.inscritos || []).length;
                  const esgotado = totalInscritos >= ev.limite;
                  const inscrito = (ev.inscritos || []).some(i => i.uid === currentUser?.uid);
                  
                  let borderCol = '1px solid rgba(0, 208, 132, 0.3)';
                  let bgCol = 'var(--brand-light)';
                  let textCol = 'var(--brand)';
                  
                  if (inscrito) {
                    bgCol = 'rgba(16, 185, 129, 0.12)';
                    textCol = '#10b981';
                    borderCol = '1px solid rgba(16, 185, 129, 0.3)';
                  } else if (esgotado) {
                    bgCol = 'rgba(239, 68, 68, 0.12)';
                    textCol = '#ef4444';
                    borderCol = '1px solid rgba(239, 68, 68, 0.3)';
                  }

                  return (
                    <div 
                      key={`${ev.eventoOriginal.id}_${ev.slotId}_${sIdx}`} 
                      onClick={(e) => { 
                        e.stopPropagation(); // Evita clique na célula do dia para criar evento
                        handleAbrirDetalhesModal(ev.eventoOriginal); 
                      }}
                      title={`${ev.titulo} das ${ev.hora}${ev.horaFim ? ` às ${ev.horaFim}` : ''} - ${ev.local} (${totalInscritos}/${ev.limite} vagas)`}
                      style={{ 
                        ...calendarEventBadgeStyle, 
                        backgroundColor: bgCol,
                        color: textCol,
                        border: borderCol,
                        whiteSpace: 'normal',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        padding: '5px 7px'
                      }}
                    >
                      <div style={{ fontWeight: 'bold', fontSize: '11px', lineHeight: '1.2', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev.titulo}
                      </div>
                      <div style={{ fontSize: '10px', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        🕒 {ev.hora}{ev.horaFim ? ` - ${ev.horaFim}` : ''}
                      </div>
                    </div>
                  );
                })}

                {eventosDoDia.length > 2 && (
                  diasExpandidos[dataCompleta] ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDiasExpandidos(prev => ({ ...prev, [dataCompleta]: false }));
                      }}
                      style={{
                        background: 'transparent',
                        color: '#64748b',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '2px 4px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        alignSelf: 'flex-start',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        transition: 'all 0.2s',
                        textDecoration: 'underline'
                      }}
                    >
                      ➖ Ver menos
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDiasExpandidos(prev => ({ ...prev, [dataCompleta]: true }));
                      }}
                      style={{
                        background: 'transparent',
                        color: 'var(--brand)',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '2px 4px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        alignSelf: 'flex-start',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        transition: 'all 0.2s',
                        textDecoration: 'underline'
                      }}
                    >
                      ➕ {eventosDoDia.length - 2} mais
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
