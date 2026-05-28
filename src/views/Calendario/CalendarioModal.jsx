import React from 'react';
import {
  overlayStyle,
  modalStyle,
  labelModalStyle,
  inputModalStyle,
  btnSalvarModalStyle,
  btnCancelarModalStyle,
  btnExcluirModalStyle
} from './styles';

export default function CalendarioModal({
  userRole,
  idEditando, setIdEditando,
  equipamentosSelecionados, setEquipamentosSelecionados,
  nomeLegado, setNomeLegado,
  arquivosPdf, setArquivosPdf,
  formStatus, setFormStatus,
  formData, setFormData,
  formDataFim, setFormDataFim,
  salvando,
  subindoPdf,
  buscaEquipModal, setBuscaEquipModal,
  equipamentosVisiveisNoModal,
  handleSalvarModal,
  handleExcluirModal,
  handleToggleEquipamento,
  atualizarDataEquipamento,
  setModalAberto
}) {
  const isComum = userRole === 'Comum';

  return (
    <div style={overlayStyle}>
      <div style={{...modalStyle, maxWidth: '650px'}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
            {isComum ? '🔍 Detalhes da Visita (Leitura)' : (idEditando ? '✏️ Detalhes da Visita' : '📅 Novo Agendamento')}
          </h3>
          {!isComum && idEditando && (
            <button 
              type="button" 
              onClick={() => { 
                setIdEditando(null); 
                setEquipamentosSelecionados([]); 
                setNomeLegado(''); 
                setArquivosPdf({}); 
                setFormStatus('Agendado'); 
              }} 
              style={{ 
                padding: '6px 12px', 
                backgroundColor: 'var(--bg-app)', 
                color: 'var(--brand)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '4px', 
                cursor: 'pointer', 
                fontSize: '12px', 
                fontWeight: 'bold' 
              }}
            >
              ➕ Criar Novo Agendamento
            </button>
          )}
        </div>            
        <form onSubmit={handleSalvarModal} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <label style={{...labelModalStyle, flex: 1, minWidth: '120px'}}>Data Inicial: 
              <input 
                disabled={isComum} 
                type="date" 
                value={formData} 
                onChange={(e) => { 
                  const nd = e.target.value; 
                  setFormData(nd); 
                  setFormDataFim(nd); 
                  setEquipamentosSelecionados(prev => prev.map(eq => ({...eq, dataInicial: nd, dataFinal: nd}))); 
                }} 
                required 
                style={inputModalStyle} 
              />
            </label>
            <label style={{...labelModalStyle, flex: 1, minWidth: '120px'}}>Data Final: 
              <input 
                disabled={isComum} 
                type="date" 
                value={formDataFim} 
                onChange={(e) => setFormDataFim(e.target.value)} 
                min={formData} 
                required 
                style={inputModalStyle} 
              />
            </label>
          </div>

          {idEditando && equipamentosSelecionados.length === 0 && nomeLegado && (
            <div style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)', padding: '10px', borderRadius: '4px', fontSize: '13px', border: '1px solid var(--warning)', marginBottom: '15px' }}>
              <strong>Aviso:</strong> Agendamento automático antigo ("{nomeLegado}"). Vincule o equipamento abaixo.
            </div>
          )}

          {equipamentosSelecionados.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '40vh', overflowY: 'auto', paddingRight: '5px', marginBottom: '10px' }}>
              {equipamentosSelecionados.map((eq) => {
                if (idEditando) {
                  return (
                    <div key={eq.id} style={{ border: eq.concluido ? '1px solid var(--brand)' : '1px solid var(--border-light)', borderRadius: '8px', padding: '15px', backgroundColor: eq.concluido ? 'var(--brand-light)' : 'var(--bg-app)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <strong style={{ fontSize: '15px', color: 'var(--brand)', display: 'block' }}>🏥 {eq.local || 'Local não informado'}</strong>
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginTop: '3px' }}><strong>{eq.nome_produto}</strong> (Serial: {eq.serial})</span>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', cursor: isComum ? 'default' : 'pointer', fontSize: '14px', color: eq.concluido ? 'var(--success)' : 'var(--text-secondary)', backgroundColor: eq.concluido ? 'var(--success-light)' : 'var(--bg-card)', padding: '5px 10px', borderRadius: '20px', border: '1px solid var(--border-light)' }}>
                          <input disabled={isComum} type="checkbox" checked={eq.concluido || false} onChange={(e) => atualizarDataEquipamento(eq.id, 'concluido', e.target.checked)} style={{ width: '16px', height: '16px' }} />
                          Concluída
                        </label>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginBottom: eq.concluido ? '15px' : '0' }}>
                        <label style={{...labelModalStyle, flex: 1, fontSize: '11px'}}>Início: <input disabled={isComum} type="date" value={eq.dataInicial || ''} onChange={(e) => atualizarDataEquipamento(eq.id, 'dataInicial', e.target.value)} style={{...inputModalStyle, padding: '6px', fontSize: '12px'}} /></label>
                        <label style={{...labelModalStyle, flex: 1, fontSize: '11px'}}>Fim: <input disabled={isComum} type="date" value={eq.dataFinal || ''} onChange={(e) => atualizarDataEquipamento(eq.id, 'dataFinal', e.target.value)} min={eq.dataInicial} style={{...inputModalStyle, padding: '6px', fontSize: '12px'}} /></label>
                      </div>

                      {eq.concluido && (
                        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px dashed var(--brand)', padding: '10px', borderRadius: '6px' }}>
                          <strong style={{ fontSize: '12px', color: 'var(--brand)', display: 'block', marginBottom: '5px' }}>📄 Relatório (PDF):</strong>
                          {eq.pdfUrl && <div style={{ fontSize: '12px', marginBottom: '5px' }}>✅ <a href={eq.pdfUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--brand)', fontWeight: 'bold' }}>Visualizar PDF</a></div>}
                          {!isComum && (
                            <input type="file" accept=".pdf" onChange={(e) => setArquivosPdf(prev => ({...prev, [eq.id]: e.target.files[0]}))} style={{ fontSize: '11px', width: '100%', color: 'var(--text-primary)' }} />
                          )}
                        </div>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div key={eq.id} style={{ border: '1px solid var(--border-light)', borderRadius: '8px', padding: '12px 15px', backgroundColor: 'var(--bg-app)', position: 'relative' }}>
                      <button 
                        type="button" 
                        onClick={() => handleToggleEquipamento(eq, false)}
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          border: 'none',
                          background: 'none',
                          color: 'var(--danger)',
                          fontSize: '16px',
                          cursor: 'pointer',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          transition: 'all 0.2s'
                        }}
                        title="Remover este equipamento"
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--danger-light)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        ✕
                      </button>
                      
                      <div style={{ marginBottom: '8px', paddingRight: '25px' }}>
                        <strong style={{ fontSize: '14px', color: 'var(--text-primary)', display: 'block' }}>🏥 {eq.local || 'Local não informado'}</strong>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>{eq.nome_produto} (Serial: {eq.serial})</span>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <label style={{...labelModalStyle, flex: 1, fontSize: '11px'}}>Início: 
                          <input type="date" value={eq.dataInicial || ''} onChange={(e) => atualizarDataEquipamento(eq.id, 'dataInicial', e.target.value)} style={{...inputModalStyle, padding: '6px', fontSize: '12px'}} />
                        </label>
                        <label style={{...labelModalStyle, flex: 1, fontSize: '11px'}}>Fim: 
                          <input type="date" value={eq.dataFinal || ''} onChange={(e) => atualizarDataEquipamento(eq.id, 'dataFinal', e.target.value)} min={eq.dataInicial || formData} style={{...inputModalStyle, padding: '6px', fontSize: '12px'}} />
                        </label>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}

          {!isComum && (
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px', backgroundColor: 'var(--bg-app)' }}>
              <label style={{...labelModalStyle, marginBottom: '0px', color: 'var(--brand)', gap: '8px'}}>
                <span>{idEditando ? '➕ Vincular adicionais ou ajustar selecionados:' : '🔗 Vincular Equipamentos à nova visita:'}</span>
                <input 
                  type="text" 
                  placeholder="🔍 Pesquisar por hospital, produto ou serial..." 
                  value={buscaEquipModal} 
                  onChange={(e) => setBuscaEquipModal(e.target.value)} 
                  style={{ ...inputModalStyle, borderColor: 'var(--border-color)' }} 
                />
              </label>

              {buscaEquipModal.trim() !== '' && (
                <div style={{ 
                  maxHeight: '180px', 
                  overflowY: 'auto', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '6px', 
                  backgroundColor: 'var(--bg-card)',
                  marginTop: '12px',
                  boxShadow: 'var(--shadow-md)'
                }}>
                  {equipamentosVisiveisNoModal.length === 0 ? (
                    <div style={{ padding: '15px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
                      Nenhum equipamento correspondente encontrado.
                    </div>
                  ) : (
                    equipamentosVisiveisNoModal.map(eq => {
                      const equipSelecionado = equipamentosSelecionados.find(item => item.id === eq.id);
                      const isChecked = !!equipSelecionado;
                      return (
                        <div key={eq.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <label style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', cursor: 'pointer', backgroundColor: isChecked ? 'var(--brand-light)' : 'transparent', transition: 'background-color 0.2s' }}>
                            <input type="checkbox" checked={isChecked} onChange={(e) => handleToggleEquipamento(eq, e.target.checked)} style={{ marginRight: '10px', width: '16px', height: '16px', cursor: 'pointer' }} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{eq.nome_produto}</strong>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>📍 {eq.local} (Serial: {eq.serial})</span>
                            </div>
                          </label>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '10px' }}>
            {!isComum && idEditando && (
              <button type="button" onClick={handleExcluirModal} style={btnExcluirModalStyle} disabled={salvando || subindoPdf}>
                🗑️ Excluir
              </button>
            )}
            <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
              <button type="button" onClick={() => setModalAberto(false)} style={btnCancelarModalStyle} disabled={salvando || subindoPdf}>
                {isComum ? 'Fechar' : 'Cancelar'}
              </button>
              {!isComum && (
                <button type="submit" disabled={salvando || subindoPdf} style={btnSalvarModalStyle}>
                  {subindoPdf ? 'Enviando PDFs...' : (salvando ? 'Salvando...' : 'Salvar Alterações')}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
