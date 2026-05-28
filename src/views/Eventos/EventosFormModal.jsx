import React from 'react';
import {
  modalOverlayStyle,
  modalContentStyle,
  btnCloseStyle,
  labelStyle,
  dayFormSectionStyle
} from './styles';

export default function EventosFormModal({
  idEditando,
  formTitulo,
  setFormTitulo,
  formLocal,
  setFormLocal,
  formEndereco,
  setFormEndereco,
  formObservacoes,
  setFormObservacoes,
  formDias,
  handleRemoverDia,
  handleAlterarDiaData,
  handleAdicionarHorario,
  handleAlterarHorarioHora,
  handleAlterarHorarioHoraFim,
  handleAlterarHorarioLimite,
  handleRemoverHorario,
  handleAdicionarDia,
  handleFecharCriarModal,
  handleSalvarEvento,
  salvando
}) {
  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle} className="app-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: 'var(--primary)' }}>
            {idEditando ? '✏️ Editar Evento de Demonstração' : '➕ Novo Evento de Demonstração'}
          </h2>
          <button onClick={handleFecharCriarModal} style={btnCloseStyle}>✕</button>
        </div>

        <form onSubmit={handleSalvarEvento} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <label style={labelStyle}>
            Título do Evento *
            <input 
              type="text" 
              value={formTitulo} 
              onChange={(e) => setFormTitulo(e.target.value)} 
              placeholder="Ex: Demonstração e Testes Clínicos de Equipamentos"
              required 
            />
          </label>

          <div style={{ display: 'flex', gap: '15px' }}>
            <label style={{ ...labelStyle, flex: 1 }}>
              Local / Hospital *
              <input 
                type="text" 
                value={formLocal} 
                onChange={(e) => setFormLocal(e.target.value)} 
                placeholder="Ex: Hospital Samaritano"
                required 
              />
            </label>
          </div>

          <label style={labelStyle}>
            Endereço Completo do Local *
            <input 
              type="text" 
              value={formEndereco} 
              onChange={(e) => setFormEndereco(e.target.value)} 
              placeholder="Ex: Rua Conselheiro Brotero, 1486 - Higienópolis, São Paulo - SP"
              required 
            />
          </label>

          <label style={labelStyle}>
            Observações de Acesso / Instruções (Ex: Quem procurar, bloco, etc.)
            <textarea 
              value={formObservacoes} 
              onChange={(e) => setFormObservacoes(e.target.value)} 
              placeholder="Ex: Procurar pela Enf. Chefe Ana no Bloco C da Engenharia Clínica."
              rows="3"
              style={{ fontFamily: 'inherit', resize: 'vertical' }}
            />
          </label>

          {/* LISTA DINÂMICA DE DIAS E SESSOES */}
          <div style={{ marginTop: '10px' }}>
            <strong style={{ fontSize: '15px', color: 'var(--primary)', display: 'block', marginBottom: '10px' }}>
              📅 Cronograma de Sessões e Capacidade:
            </strong>

            {formDias.map((d, dIdx) => (
              <div key={dIdx} style={dayFormSectionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, color: 'var(--brand)', fontSize: '14px' }}>📅 Dia #{dIdx + 1}</h4>
                  <button 
                    type="button" 
                    onClick={() => handleRemoverDia(dIdx)} 
                    className="btn-danger" 
                    style={{ padding: '4px 8px', fontSize: '12px', height: 'auto' }}
                  >
                    🗑️ Remover Dia
                  </button>
                </div>
                
                <label style={{ ...labelStyle, marginBottom: '10px' }}>
                  Data do Dia *
                  <input 
                    type="date" 
                    value={d.data} 
                    onChange={(e) => handleAlterarDiaData(dIdx, e.target.value)} 
                    required 
                  />
                </label>
                
                {/* Horários para o dia correspondente */}
                <div style={{ marginTop: '10px', paddingLeft: '15px', borderLeft: '3px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>🕒 Horários / Turnos Disponíveis:</strong>
                    <button 
                      type="button" 
                      onClick={() => handleAdicionarHorario(dIdx)} 
                      className="btn-outline" 
                      style={{ padding: '4px 8px', fontSize: '11px', height: 'auto' }}
                    >
                      ➕ Adicionar Horário
                    </button>
                  </div>
                  
                  {d.horarios.map((h, hIdx) => (
                    <div key={h.id || hIdx} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ ...labelStyle, flex: 1.2 }}>
                        Início *
                        <input 
                          type="time" 
                          value={h.hora} 
                          onChange={(e) => handleAlterarHorarioHora(dIdx, hIdx, e.target.value)} 
                          required 
                        />
                      </label>
                      <label style={{ ...labelStyle, flex: 1.2 }}>
                        Término *
                        <input 
                          type="time" 
                          value={h.horaFim || ''} 
                          onChange={(e) => handleAlterarHorarioHoraFim(dIdx, hIdx, e.target.value)} 
                          required 
                        />
                      </label>
                      <label style={{ ...labelStyle, flex: 1 }}>
                        Limite *
                        <input 
                          type="number" 
                          value={h.limite} 
                          onChange={(e) => handleAlterarHorarioLimite(dIdx, hIdx, e.target.value)} 
                          min="1" 
                          required 
                        />
                      </label>
                      <button 
                        type="button" 
                        onClick={() => handleRemoverHorario(dIdx, hIdx)}
                        style={{ 
                          marginTop: '22px', 
                          padding: '8px', 
                          backgroundColor: 'var(--danger-light)', 
                          color: 'var(--danger)', 
                          border: '1px solid rgba(239, 68, 68, 0.1)',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        title="Remover Horário"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button 
              type="button" 
              onClick={handleAdicionarDia} 
              className="btn-outline" 
              style={{ width: '100%', padding: '10px', marginTop: '10px', borderStyle: 'dashed', fontWeight: 'bold' }}
            >
              📅 Adicionar Outro Dia ao Evento
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid var(--border-light)', paddingTop: '15px' }}>
            <button type="button" onClick={handleFecharCriarModal} className="btn-outline">
              Cancelar
            </button>
            <button type="submit" className="btn-brand" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
