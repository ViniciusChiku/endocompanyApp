import React from 'react';

export default function EquipamentosLista({
  loading,
  buscaTexto, setBuscaTexto,
  filtroTipo, setFiltroTipo,
  filtroStatus, setFiltroStatus,
  listaOrdenada,
  lista,
  handleSort,
  getSortIndicator,
  prepararEdicao,
  obterCoresStatus,
  formatarDataBR,
  carregarMaisDados,
  temMais,
  carregandoMais
}) {
  const loadMoreRef = React.useRef(null);

  React.useEffect(() => {
    if (!temMais || loading || carregandoMais) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        carregarMaisDados();
      }
    }, {
      rootMargin: '150px' // Dispara um pouco antes de chegar na borda final
    });

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [temMais, loading, carregandoMais, carregarMaisDados]);

  const renderProductBadge = (product) => {
    const p = product || '';
    if (p === 'Robotix') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded">
          🤖 Robotix
        </span>
      );
    }
    if (p === 'Lap Mentor') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded">
          🥼 Lap Mentor
        </span>
      );
    }
    if (p === 'Robotix + Lap Mentor') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded">
          ✨ Robotix + Lap
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold text-slate-650 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
        📺 {p}
      </span>
    );
  };

  const renderEquipStatusBadge = (status) => {
    const s = status || 'Equipamento Funcionando';
    if (s === 'Equipamento Funcionando') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/10 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Funcionando
        </span>
      );
    }
    if (s === 'Equipamento de Demonstração') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 dark:border-blue-500/10 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          Demonstração
        </span>
      );
    }
    if (s === 'Backup') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500"></span>
          Backup
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 dark:border-red-500/10 rounded-full animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
        Em Manutenção
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-16 px-5 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-2xl shadow-sm">
        <div style={{ width: '36px', height: '36px', border: '3px solid var(--border-light)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 14px' }} />
        <p className="text-[var(--text-muted)] text-sm font-semibold">Carregando base de simuladores...</p>
      </div>
    );
  }

  return (
    <>
      {/* FILTROS E BUSCA */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        width: '100%'
      }}>
        <input 
          type="text" 
          placeholder="🔍 Buscar por Cliente, Série, Produto ou Cidade..." 
          value={buscaTexto} 
          onChange={(e) => setBuscaTexto(e.target.value)} 
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <select 
            value={filtroTipo} 
            onChange={(e) => setFiltroTipo(e.target.value)} 
            style={{ 
              minWidth: '170px',
              padding: '10px 15px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
          >
            <option value="">Todos os Produtos</option>
            <option value="Exact View">Exact View</option>
            <option value="Lap Mentor">Lap Mentor</option>
            <option value="Robotix">Robotix</option>
            <option value="Robotix + Lap Mentor">Robotix + Lap Mentor</option>
          </select>
          <select 
            value={filtroStatus} 
            onChange={(e) => setFiltroStatus(e.target.value)} 
            style={{ 
              minWidth: '160px',
              padding: '10px 15px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
          >
            <option value="">Status (Todos)</option>
            <option value="Equipamento Funcionando">🟢 Funcionando</option>
            <option value="Equipamento de Demonstração">🔵 Demonstração</option>
            <option value="Backup">⚪ Backup</option>
            <option value="Em Manutenção">🔴 Em Manutenção</option>
          </select>
        </div>
      </div>

      {/* CONTADOR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px', padding: '0 8px' }}>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Mostrando <strong style={{ color: 'var(--brand)' }}>{listaOrdenada.length}</strong> de {lista.length} equipamentos</p>
        <span style={{ fontSize: '9.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>* Clique nos títulos para ordenar</span>
      </div>
        
      {listaOrdenada.length === 0 ? (
        <div className="py-16 px-5 text-center bg-[var(--bg-card)] border border-dashed border-[var(--border-color)] rounded-2xl">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-[var(--text-secondary)] text-base font-semibold">Nenhum equipamento encontrado.</p>
          <p className="text-[var(--text-muted)] text-xs mt-1">Tente ajustar os filtros de busca.</p>
        </div>
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1.5px solid var(--border-light)' }}>
                  {[['local','Cliente (Local)'],['status_equipamento','Status'],['serial','Nº de Série'],['nome_produto','Produto'],['cidade','Cidade'],['estado','UF'],['fornecedor','Fornecedor'],['instalacao','Instalação'],['simulador','Simulador'],['mentor_learn','Mentor Learn'],['inicio_contrato','Início Contrato'],['metodo_contrato','Método Contrato'],['fim_contrato','Fim Contrato'],['preventivas_anuais','Prev. Anuais'],['status_mentor_learn','Status ML'],['fim_mentor_learn','Fim ML'],['ultima_manutencao','Últ. Preventiva'],['proxima_preventiva','Próx. Preventiva'],['email','Email'],['endereco','Endereço'],['observacoes','Observação']].map(([key, label]) => (
                    <th key={key} style={{ padding: '12px 18px', textAlign: key === 'preventivas_anuais' ? 'center' : 'left', fontSize: '10.5px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap', cursor: 'pointer', transition: 'background 0.15s ease', userSelect: 'none' }}
                      onClick={() => handleSort(key)}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--border-subtle)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {label}{getSortIndicator(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listaOrdenada.map((item) => {
                  return (
                    <tr key={item.id} onClick={() => prepararEdicao(item)}
                      style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'background 0.15s ease' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-light)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 18px', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{item.local}</td>
                      <td style={{ padding: '12px 18px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{renderEquipStatusBadge(item.status_equipamento)}</td>
                      <td style={{ padding: '12px 18px', fontSize: '12px', fontFamily: 'monospace', fontWeight: '700', color: 'var(--text-secondary)', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{item.serial}</td>
                      <td style={{ padding: '12px 18px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{renderProductBadge(item.nome_produto)}</td>
                      <td style={{ padding: '12px 18px', fontSize: '12.5px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{item.cidade || '-'}</td>
                      <td style={{ padding: '12px 18px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{item.estado || '-'}</td>
                      <td style={{ padding: '12px 18px', fontSize: '12.5px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{item.fornecedor || '-'}</td>
                      <td style={{ padding: '12px 18px', fontSize: '12.5px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{item.instalacao ? formatarDataBR(item.instalacao) : '-'}</td>
                      <td style={{ padding: '12px 18px', fontSize: '12.5px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{item.simulador || '-'}</td>
                      <td style={{ padding: '12px 18px', fontSize: '12.5px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{item.mentor_learn || '-'}</td>
                      <td style={{ padding: '12px 18px', fontSize: '12.5px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{item.inicio_contrato ? formatarDataBR(item.inicio_contrato) : '-'}</td>
                      <td style={{ padding: '12px 18px', fontSize: '12.5px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{item.metodo_contrato || '-'}</td>
                      <td style={{ padding: '12px 18px', fontSize: '12.5px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{item.fim_contrato ? formatarDataBR(item.fim_contrato) : '-'}</td>
                      <td style={{ padding: '12px 18px', fontSize: '12.5px', fontWeight: '700', color: 'var(--text-secondary)', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{item.preventivas_anuais || '-'}</td>
                      <td style={{ padding: '12px 18px', fontSize: '12.5px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{item.status_mentor_learn || '-'}</td>
                      <td style={{ padding: '12px 18px', fontSize: '12.5px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{item.fim_mentor_learn ? formatarDataBR(item.fim_mentor_learn) : '-'}</td>
                      <td style={{ padding: '12px 18px', fontSize: '12.5px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{formatarDataBR(item.ultima_manutencao)}</td>
                      <td style={{ padding: '12px 18px', fontSize: '12.5px', fontWeight: '700', color: 'var(--brand)', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{formatarDataBR(item.proxima_preventiva)}</td>
                      <td style={{ padding: '12px 18px', fontSize: '12.5px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{item.email || '-'}</td>
                      <td style={{ padding: '12px 18px', fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'middle' }} title={item.endereco}>{item.endereco || '-'}</td>
                      <td style={{ padding: '12px 18px', fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'middle' }} title={item.observacoes}>{item.observacoes || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gatilho de Rolagem Infinita */}
      {temMais && (
        <div 
          ref={loadMoreRef} 
          className="flex justify-center items-center gap-2.5 p-6 text-slate-500 dark:text-slate-400 font-bold text-sm"
        >
          <div className="w-5 h-5 border-3 border-slate-200 dark:border-slate-800 border-t-brand rounded-full animate-spin"></div>
          <span>Carregando mais simuladores...</span>
        </div>
      )}
    </>
  );
}
