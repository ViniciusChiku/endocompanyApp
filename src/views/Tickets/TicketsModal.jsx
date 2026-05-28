import React from 'react';

export default function TicketsModal({
  ticketEditando,
  fecharModal,
  formatarData,
  equipamentosDisponiveis,
  ticketSucessoLog,
  buscaEquipamento,
  setBuscaEquipamento,
  dropdownAberto,
  setDropdownAberto,
  editEquipamentoId,
  setEditEquipamentoId,
  editCliente,
  setEditCliente,
  editTipoAtendimento,
  setEditTipoAtendimento,
  editStatus,
  setEditStatus,
  salvando,
  handleSalvarTicket
}) {
  // Filtra os equipamentos disponíveis com base na busca para a vinculação
  const deparaEquipamentosFiltrados = () => {
    return equipamentosDisponiveis.filter((eq) => {
      let termo = buscaEquipamento.toLowerCase().trim();
      
      const eqSelecionado = editEquipamentoId ? equipamentosDisponiveis.find(item => item.id === editEquipamentoId) : null;
      if (eqSelecionado) {
        const descSel = `[${eqSelecionado.tipo_equipamento || 'Sem Tipo'}] ${eqSelecionado.nome_produto} ${eqSelecionado.serial ? `(SN: ${eqSelecionado.serial})` : ''} - ${eqSelecionado.local || 'Sem local'}`.toLowerCase().trim();
        if (termo === descSel) {
          termo = '';
        }
      }
      
      if (!termo) return true;
      const nome = (eq.nome_produto || '').toLowerCase();
      const tipo = (eq.tipo_equipamento || '').toLowerCase();
      const local = (eq.local || '').toLowerCase();
      const serial = (eq.serial || '').toLowerCase();
      return nome.includes(termo) || tipo.includes(termo) || local.includes(termo) || serial.includes(termo);
    });
  };

  const equipamentosFiltradosVincular = deparaEquipamentosFiltrados();

  return (
    <div className="tk-modal-overlay">
      <div className="tk-modal-content app-card">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '20px', fontWeight: 'bold' }}>
            Atendimento de Chamado #{ticketEditando.id.slice(0, 6)}
          </h3>
          <button onClick={fecharModal} className="tk-btn-close-modal">✕</button>
        </div>

        {/* DETALHES ENVIADOS PELO CLIENTE */}
        <div className="tk-info-box">
          <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)', fontSize: '14px', borderBottom: '1px solid var(--border-light)', paddingBottom: '5px' }}>
            Dados da Solicitação
          </h4>
          <div className="tk-info-grid">
            <div>
              <span className="tk-info-label">Solicitante:</span>
              <span className="tk-info-value">{ticketEditando.nome}</span>
            </div>
            {ticketEditando.email && (
              <div>
                <span className="tk-info-label">E-mail de Contato:</span>
                <span className="tk-info-value" style={{ color: 'var(--brand)', fontWeight: 'bold' }}>{ticketEditando.email}</span>
              </div>
            )}
            <div>
              <span className="tk-info-label">Local/Hospital:</span>
              <span className="tk-info-value">{ticketEditando.hospital}</span>
            </div>
            <div>
              <span className="tk-info-label">Data/Hora Abertura:</span>
              <span className="tk-info-value">{formatarData(ticketEditando.createdAt)}</span>
            </div>
            <div>
              <span className="tk-info-label">Produto / Tipo:</span>
              <span className="tk-info-value">{ticketEditando.tipoProduto}</span>
            </div>
            {ticketEditando.serial && (
              <div>
                <span className="tk-info-label">Número de Série:</span>
                <span className="tk-info-value" style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{ticketEditando.serial}</span>
              </div>
            )}
          </div>
          {(() => {
            const eqVinculadoEdit = ticketEditando.equipamentoId ? equipamentosDisponiveis.find(eq => eq.id === ticketEditando.equipamentoId) : null;
            return eqVinculadoEdit ? (
              <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: 'var(--brand-light)', border: '1px solid var(--brand)', borderRadius: '6px' }}>
                <span className="tk-info-label" style={{ color: 'var(--brand)' }}>Equipamento Vinculado (Estoque/Inventário):</span>
                <span className="tk-info-value" style={{ color: 'var(--text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  🟢 {eqVinculadoEdit.nome_produto} {eqVinculadoEdit.serial ? `(Série: ${eqVinculadoEdit.serial})` : ''} - {eqVinculadoEdit.local}
                </span>
              </div>
            ) : null;
          })()}
          {ticketEditando.descricao && (
            <div style={{ marginTop: '15px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
              <span className="tk-info-label">O que está acontecendo (Descrição):</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.5', fontWeight: '500' }}>
                {ticketEditando.descricao}
              </p>
            </div>
          )}
        </div>

        {/* LOG SMTP SIMULADO OU FORMULÁRIO DE PREENCHIMENTO */}
        {ticketSucessoLog ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
            <div className="log-simulado-box" style={{ margin: 0 }}>
              <div className="log-simulado-titulo" style={{ fontSize: '13px', fontWeight: '700', color: '#166534' }}>
                ⚡ Trigger de E-mail de Status em execução...
              </div>
              <ul className="log-simulado-lista" style={{ fontSize: '11px', maxHeight: '250px', overflowY: 'auto' }}>
                <li>[Firestore] Atualização capturada em <code>/tickets/{ticketSucessoLog.id}</code></li>
                <li>[Serviço SMTP] Conectado com sucesso ao servidor SMTP corporativo da Endocompany.</li>
                <li>[Transição de Status] Chamado alterado para o status: <strong>{ticketSucessoLog.status}</strong></li>
                <li>[Notificação Cliente] E-mail de aviso disparado com sucesso para o solicitante: <strong>{ticketSucessoLog.emailCliente}</strong></li>
                <li>[Conteúdo do E-mail]</li>
                <li>  Olá <strong>{ticketSucessoLog.nomeCliente}</strong>,</li>
                <li>  O status do seu chamado para o equipamento "<strong>{ticketSucessoLog.produto}</strong>" foi atualizado para: <strong>{ticketSucessoLog.status}</strong>.</li>
                <li>  Nosso time técnico continuará cuidando da sua solicitação.</li>
                <li>[Status] Conexão SMTP finalizada com segurança.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="button" onClick={fecharModal} className="tk-btn-submit">
                Concluir e Fechar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSalvarTicket} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <label className="tk-label">
              Vincular ao Equipamento Cadastrado (Estoque):
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px', position: 'relative' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input 
                    type="text" 
                    placeholder="🔍 Digite para buscar por tipo ou local..." 
                    value={buscaEquipamento}
                    onFocus={(e) => {
                      setDropdownAberto(true);
                      e.target.select();
                    }}
                    onBlur={() => {
                      // Pequeno delay para garantir clique no dropdown
                      setTimeout(() => setDropdownAberto(false), 200);
                    }}
                    onChange={(e) => {
                      setBuscaEquipamento(e.target.value);
                      setDropdownAberto(true);
                    }}
                    style={{
                      padding: '10px 35px 10px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      fontSize: '13px',
                      width: '100%',
                      backgroundColor: 'var(--bg-app)',
                      color: 'var(--text-primary)',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                  />
                  {editEquipamentoId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditEquipamentoId('');
                        setBuscaEquipamento('');
                      }}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'var(--border-light)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)',
                        fontSize: '10px',
                        fontWeight: 'bold',
                      }}
                      title="Limpar Vinculação"
                    >
                      ✕
                    </button>
                  )}
                </div>
                
                {dropdownAberto && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-lg)',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    zIndex: 9999,
                    marginTop: '4px',
                    padding: '4px',
                    boxSizing: 'border-box'
                  }}>
                    {equipamentosFiltradosVincular.length === 0 ? (
                      <div style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center' }}>
                        Nenhum equipamento correspondente encontrado.
                      </div>
                    ) : (
                      equipamentosFiltradosVincular.map((eq) => {
                        const isSelected = eq.id === editEquipamentoId;
                        return (
                          <div
                            key={eq.id}
                            onMouseDown={() => {
                              setEditEquipamentoId(eq.id);
                              setBuscaEquipamento(`[${eq.tipo_equipamento || 'Sem Tipo'}] ${eq.nome_produto} ${eq.serial ? `(SN: ${eq.serial})` : ''} - ${eq.local || 'Sem local'}`);
                              if (!editCliente) {
                                setEditCliente(eq.local || '');
                              }
                            }}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              backgroundColor: isSelected ? 'var(--brand-light)' : 'transparent',
                              transition: 'background-color 0.15s',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                              borderBottom: '1px solid var(--border-light)',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-app)';
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{
                                fontSize: '10px',
                                fontWeight: '700',
                                color: eq.tipo_equipamento === 'Robotix' ? '#2563eb' : eq.tipo_equipamento === 'Lap Mentor' ? '#7c3aed' : '#059669',
                                backgroundColor: eq.tipo_equipamento === 'Robotix' ? '#dbeafe' : eq.tipo_equipamento === 'Lap Mentor' ? '#f3e8ff' : '#d1fae5',
                                padding: '2px 5px',
                                borderRadius: '4px',
                                textTransform: 'uppercase'
                              }}>
                                {eq.tipo_equipamento || 'Outro'}
                              </span>
                              <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                                {eq.nome_produto}
                              </strong>
                              {eq.serial && (
                                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-app)', padding: '1px 4px', borderRadius: '3px' }}>
                                  SN: {eq.serial}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                              📍 {eq.local || 'Sem local'}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
                {buscaEquipamento && !dropdownAberto && (
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '2px' }}>
                    Filtrado: mostrando {equipamentosFiltradosVincular.length} de {equipamentosDisponiveis.length} equipamentos.
                  </span>
                )}
              </div>
            </label>

            <label className="tk-label">
              Cliente / Razão Social:
              <input 
                type="text" 
                value={editCliente} 
                onChange={(e) => setEditCliente(e.target.value)} 
                placeholder="Nome do cliente/empresa contratante"
                style={{ width: '100%' }}
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <label className="tk-label">
                Tipo de Atendimento:
                <select 
                  value={editTipoAtendimento} 
                  onChange={(e) => setEditTipoAtendimento(e.target.value)}
                  className="tk-select"
                >
                  <option value="telefônico">Telefônico</option>
                  <option value="acesso remoto">Acesso Remoto</option>
                  <option value="presencial corretiva">Presencial Corretiva</option>
                  <option value="presencial preventiva">Presencial Preventiva</option>
                </select>
              </label>

              <label className="tk-label">
                Status do Chamado:
                <select 
                  value={editStatus} 
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="tk-select"
                >
                  <option value="Aberto">Aberto</option>
                  <option value="Em Atendimento">Em Atendimento</option>
                  <option value="Concluído">Concluído</option>
                </select>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
              <button type="button" onClick={fecharModal} className="tk-btn-cancel">
                Cancelar
              </button>
              <button type="submit" disabled={salvando} className="tk-btn-submit">
                {salvando ? 'Salvando...' : 'Salvar Detalhes'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
