import React from 'react';

export default function TicketsLista({
  loading,
  ticketsFiltrados,
  abrirModalEdicao,
  formatarData,
  equipamentosDisponiveis,
  getStatusBadgeClass,
  totalTickets,
  abertosCount,
  atendimentoCount,
  concluidosCount,
  buscaTexto,
  setBuscaTexto,
  filtroStatus,
  setFiltroStatus
}) {
  const getCardClassName = (statusChave) => {
    const isActive = filtroStatus === statusChave;
    const baseClass = "flex flex-col justify-between py-6 px-8 bg-white dark:bg-slate-900 border rounded-2xl cursor-pointer hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 shadow-sm relative overflow-hidden group";
    
    if (isActive) {
      if (statusChave === 'Todos') return `${baseClass} border-slate-400 dark:border-slate-500 ring-2 ring-slate-400/10 shadow-md bg-slate-50/50 dark:bg-slate-800/10`;
      if (statusChave === 'Aberto') return `${baseClass} border-rose-500 dark:border-rose-500 ring-2 ring-rose-500/10 shadow-md bg-rose-500/5 dark:bg-rose-950/10`;
      if (statusChave === 'Em Atendimento') return `${baseClass} border-amber-500 dark:border-amber-500 ring-2 ring-amber-500/10 shadow-md bg-amber-500/5 dark:bg-amber-950/10`;
      if (statusChave === 'Concluído') return `${baseClass} border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/10 shadow-md bg-emerald-500/5 dark:bg-emerald-950/10`;
    }
    
    return `${baseClass} border-slate-200 dark:border-slate-800/80 hover:border-slate-350 dark:hover:border-slate-700 hover:shadow-md`;
  };

  const renderStatusBadge = (status) => {
    const s = status || 'Aberto';
    if (s === 'Aberto') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 dark:border-red-500/10 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          Aberto
        </span>
      );
    }
    if (s === 'Em Atendimento') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/10 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          Em Atendimento
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/10 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        Concluído
      </span>
    );
  };

  return (
    <>
      {/* 📊 DASHBOARD DE MÉTRICAS PREMIUM */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {/* Total */}
        <div
          onClick={() => setFiltroStatus('Todos')}
          className={getCardClassName('Todos')}
          style={{ padding: '24px 32px' }}
        >
          <div className="absolute top-0 left-0 right-0 h-[4px] rounded-t-2xl bg-slate-400 dark:bg-slate-500 group-hover:h-[6px] transition-all duration-300" />
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total de Chamados</p>
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-base transition-transform duration-300 group-hover:scale-110">📋</div>
          </div>
          <h3 className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">{totalTickets}</h3>
        </div>

        {/* Abertos */}
        <div
          onClick={() => setFiltroStatus('Aberto')}
          className={getCardClassName('Aberto')}
          style={{ padding: '24px 32px' }}
        >
          <div className="absolute top-0 left-0 right-0 h-[4px] rounded-t-2xl bg-rose-500 group-hover:h-[6px] transition-all duration-300" />
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-extrabold text-rose-500 uppercase tracking-wider">Abertos · Pendentes</p>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-base transition-transform duration-300 group-hover:scale-110">🔴</div>
          </div>
          <h3 className="text-4xl font-black text-rose-600 dark:text-rose-400 tracking-tight leading-none">{abertosCount}</h3>
        </div>

        {/* Em Atendimento */}
        <div
          onClick={() => setFiltroStatus('Em Atendimento')}
          className={getCardClassName('Em Atendimento')}
          style={{ padding: '24px 32px' }}
        >
          <div className="absolute top-0 left-0 right-0 h-[4px] rounded-t-2xl bg-amber-500 group-hover:h-[6px] transition-all duration-300" />
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-extrabold text-amber-600 dark:text-amber-500 uppercase tracking-wider">Em Atendimento</p>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-base transition-transform duration-300 group-hover:scale-110">🟡</div>
          </div>
          <h3 className="text-4xl font-black text-amber-600 dark:text-amber-400 tracking-tight leading-none">{atendimentoCount}</h3>
        </div>

        {/* Concluídos */}
        <div
          onClick={() => setFiltroStatus('Concluído')}
          className={getCardClassName('Concluído')}
          style={{ padding: '24px 32px' }}
        >
          <div className="absolute top-0 left-0 right-0 h-[4px] rounded-t-2xl bg-emerald-500 group-hover:h-[6px] transition-all duration-300" />
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-wider">Concluídos</p>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-base transition-transform duration-300 group-hover:scale-110">✅</div>
          </div>
          <h3 className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight leading-none">{concluidosCount}</h3>
        </div>
      </div>

      {/* FILTROS E BUSCA */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '14px', marginBottom: '20px', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '220px', maxWidth: '340px' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', pointerEvents: 'none' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Buscar nome, hospital ou produto..." 
            value={buscaTexto} 
            onChange={(e) => setBuscaTexto(e.target.value)} 
            style={{ paddingLeft: '40px', width: '100%' }}
          /> 
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>Filtrar:</span>
          <select 
            value={filtroStatus} 
            onChange={(e) => setFiltroStatus(e.target.value)} 
            style={{ minWidth: '160px' }}
          >
            <option value="Todos">Todos os status</option>
            <option value="Aberto">Abertos</option>
            <option value="Em Atendimento">Em Atendimento</option>
            <option value="Concluído">Concluídos</option>
          </select>
        </div>
      </div>
 
      {/* TABELA DE CHAMADOS */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid var(--border-light)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600' }}>Carregando chamados...</p>
          </div>
        ) : ticketsFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: '600' }}>Nenhum chamado de suporte encontrado.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>Ajuste os filtros ou aguarde novos chamados.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1.5px solid var(--border-light)' }}>
                  <th style={{ padding: '13px 20px', textAlign: 'left', fontSize: '10.5px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Data/Hora</th>
                  <th style={{ padding: '13px 20px', textAlign: 'left', fontSize: '10.5px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Solicitante / Local</th>
                  <th style={{ padding: '13px 20px', textAlign: 'left', fontSize: '10.5px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Produto / Série</th>
                  <th style={{ padding: '13px 20px', textAlign: 'left', fontSize: '10.5px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Atendimento / Cliente</th>
                  <th style={{ padding: '13px 20px', textAlign: 'center', fontSize: '10.5px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Status</th>
                  <th style={{ padding: '13px 20px', textAlign: 'center', fontSize: '10.5px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', width: '110px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {ticketsFiltrados.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'background 0.15s ease' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => abrirModalEdicao(t)}
                  >
                    <td style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', whiteSpace: 'nowrap' }}>
                      {formatarData(t.createdAt)}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: '700', display: 'block' }}>{t.nome}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>{t.hospital}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '600', display: 'block' }}>{t.tipoProduto}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>SN: {t.serial || 'Não informado'}</span>
                      {(() => {
                        const eqVinculado = t.equipamentoId ? equipamentosDisponiveis.find(eq => eq.id === t.equipamentoId) : null;
                        return eqVinculado ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px', padding: '2px 8px', fontSize: '10px', fontWeight: '700', color: 'var(--brand)', background: 'var(--brand-light)', border: '1px solid rgba(0,208,132,0.2)', borderRadius: '6px' }}>
                            🔌 {eqVinculado.nome_produto} {eqVinculado.serial ? `(SN: ${eqVinculado.serial})` : ''}
                          </span>
                        ) : null;
                      })()}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {t.tipoAtendimento ? (
                        <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '600', display: 'block', textTransform: 'capitalize' }}>
                          📞 {t.tipoAtendimento}
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', display: 'block' }}>A definir</span>
                      )}
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                        Cli: {t.cliente || 'Não vinculado'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      {renderStatusBadge(t.status)}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => abrirModalEdicao(t)}
                        style={{ padding: '7px 14px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', background: 'var(--bg-subtle)', border: '1.5px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-light)'; e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      >
                        📝 Atender
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
