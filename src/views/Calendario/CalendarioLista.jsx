import React from 'react';

export default function CalendarioLista({
  buscaPlanilha, setBuscaPlanilha,
  userRole,
  handleNovoAgendamentoLista,
  preventivasFiltradas,
  handleEventoClick,
  obterEquipamentosVinculados,
  obterSeriaisVinculados,
  obterPdfsVinculados,
  obterCorStatus,
  obterTituloLocal,
  formatarDataRange
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {/* Barra de Ações da Planilha */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="🔍 Buscar na planilha (hospital, serial, equipamento...)" 
          value={buscaPlanilha} 
          onChange={(e) => setBuscaPlanilha(e.target.value)} 
          style={{
            flex: 1,
            minWidth: '250px',
            padding: '10px 15px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '14px',
            outline: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            transition: 'all 0.2s',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
        />
        {userRole !== 'Comum' && (
          <button 
            type="button" 
            onClick={handleNovoAgendamentoLista} 
            style={{
              padding: '10px 18px',
              backgroundColor: 'var(--brand)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 6px rgba(0, 208, 132, 0.15)',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--brand-hover)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--brand)'}
          >
            ➕ Novo Agendamento
          </button>
        )}
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr>
              <th style={{ backgroundColor: 'var(--bg-app)', padding: '14px 16px', borderBottom: '2px solid var(--border-light)', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Período</th>
              <th style={{ backgroundColor: 'var(--bg-app)', padding: '14px 16px', borderBottom: '2px solid var(--border-light)', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Hospital / Local</th>
              <th style={{ backgroundColor: 'var(--bg-app)', padding: '14px 16px', borderBottom: '2px solid var(--border-light)', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Equipamento(s)</th>
              <th style={{ backgroundColor: 'var(--bg-app)', padding: '14px 16px', borderBottom: '2px solid var(--border-light)', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Nº de Série</th>
              <th style={{ backgroundColor: 'var(--bg-app)', padding: '14px 16px', borderBottom: '2px solid var(--border-light)', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Status</th>
              <th style={{ backgroundColor: 'var(--bg-app)', padding: '14px 16px', borderBottom: '2px solid var(--border-light)', color: 'var(--text-secondary)', fontWeight: 'bold', textAlign: 'center' }}>Relatório</th>
            </tr>
          </thead>
          <tbody>
            {preventivasFiltradas.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: '24px', marginBottom: '10px' }}>📋</div>
                  Nenhum agendamento encontrado na planilha.
                </td>
              </tr>
            ) : (
              preventivasFiltradas.map(item => {
                const equips = obterEquipamentosVinculados(item);
                const seriais = obterSeriaisVinculados(item);
                const pdfs = obterPdfsVinculados(item);
                
                return (
                  <tr 
                    key={item.id} 
                    onClick={(e) => handleEventoClick(e, item)} 
                    style={{ 
                      borderBottom: '1px solid var(--border-light)',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--brand-light)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 'bold', color: 'var(--brand)', whiteSpace: 'nowrap' }}>
                      📅 {formatarDataRange(item.dataPreventiva, item.dataFim)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'block' }}>
                        {obterTituloLocal(item)}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {equips.map((eq, i) => (
                          <span key={i} style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-app)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', fontSize: '11px', width: 'fit-content' }}>
                            🛠️ {eq}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {seriais.map((sr, i) => (
                          <span key={i} style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '11px' }}>
                            {sr}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ 
                        backgroundColor: obterCorStatus(item.status), 
                        color: obterCorStatus(item.status) === '#ffc107' ? '#212529' : '#fff', 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '11px', 
                        fontWeight: 'bold',
                        display: 'inline-block',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      {pdfs.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                          {pdfs.map((pdf, idx) => (
                            <a 
                              key={idx} 
                              href={pdf.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              onClick={(e) => e.stopPropagation()} 
                              title={`Ver relatório de ${pdf.nome}`}
                              style={{ 
                                color: 'var(--text-primary)', 
                                textDecoration: 'none', 
                                fontWeight: 'bold', 
                                fontSize: '11px',
                                backgroundColor: 'var(--brand-light)',
                                border: '1px solid var(--brand)',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'var(--brand)';
                                e.target.style.color = '#fff';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'var(--brand-light)';
                                e.target.style.color = 'var(--text-primary)';
                              }}
                            >
                              📄 PDF
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Sem Relatório</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
