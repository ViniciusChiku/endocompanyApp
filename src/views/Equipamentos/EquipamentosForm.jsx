import React from 'react';

export default function EquipamentosForm({
  isComum,
  idEditando,
  handleSalvar,
  voltarParaLista,

  // States
  local, setLocal,
  cidade, setCidade,
  estadoLoc, setEstadoLoc,
  fornecedor, setFornecedor,
  produto, setProduto,
  instalacao, setInstalacao,
  simulador, setSimulador,
  serial, setSerial,
  mentorLearn, setMentorLearn,
  inicioContrato, setInicioContrato,
  metodoContrato, setMetodoContrato,
  fimContrato, setFimContrato,
  preventivasAnuais, setPreventivasAnuais,
  statusMentorLearn, setStatusMentorLearn,
  fimMentorLearn, setFimMentorLearn,
  ultimaManutencao, setUltimaManutencao,
  proximaPreventiva, setProximaPreventiva,
  email, setEmail,
  endereco, setEndereco,
  observacoes, setObservacoes,
  statusEquip, setStatusEquip,
  emContrato, setEmContrato,
  frequencia, setFrequencia
}) {
  const [formState, formAction, isPending] = React.useActionState(
    async (prevState, formData) => {
      try {
        const msg = await handleSalvar();
        return { success: true, message: msg, error: null };
      } catch (err) {
        return { success: false, message: null, error: err.message || 'Erro desconhecido ao salvar.' };
      }
    },
    { success: null, message: null, error: null }
  );

  const inputClass = "w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-brand focus:ring-2 focus:ring-brand/10 text-slate-800 dark:text-slate-100 rounded-lg text-sm transition-all outline-none py-2.5 px-4 disabled:opacity-50 disabled:cursor-not-allowed";
  const labelClass = "flex flex-col gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider";
  const sectionTitleClass = "flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-3 mb-5 mt-6 uppercase tracking-wider";
  const sectionGridClass = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-md">
        <h3 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-750 dark:from-white dark:to-slate-300 mt-2 mb-6">
          {isComum ? '🔍 Detalhes do Equipamento' : (idEditando ? '✏️ Editar Equipamento' : '✨ Novo Equipamento')}
        </h3>
        
        {formState.error && (
          <p className="p-3 mb-5 bg-red-500/10 border border-red-500/25 text-red-400 rounded-lg font-semibold text-sm">
            Erro: {formState.error}
          </p>
        )}

        {formState.message && (
          <p className="p-3 mb-5 bg-brand-light border border-brand/20 text-brand rounded-lg font-semibold text-sm">
            {formState.message}
          </p>
        )}
        
        <form action={formAction} className="flex flex-col gap-6">
          
          {/* SEÇÃO 1: CLIENTE E LOCALIZAÇÃO */}
          <div>
            <div className={sectionTitleClass}>
              <span>📍</span> Cliente & Localização
            </div>
            <div className={sectionGridClass}>
              <label className={labelClass}>
                Cliente / Hospital *
                <input disabled={isComum} type="text" value={local} onChange={(e) => setLocal(e.target.value)} required className={inputClass} placeholder="Ex: Hospital Samaritano" />
              </label>
              <label className={labelClass}>
                Email de Contato
                <input disabled={isComum} type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="Ex: engenharia@hospital.com" />
              </label>
              <label className={labelClass}>
                Cidade
                <input disabled={isComum} type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} className={inputClass} placeholder="Ex: São Paulo" />
              </label>
              <label className={labelClass}>
                UF (Estado) *
                <select disabled={isComum} value={estadoLoc} onChange={(e) => setEstadoLoc(e.target.value)} required className={inputClass}>
                  <option value="AC">Acre</option><option value="AL">Alagoas</option><option value="AP">Amapá</option><option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option><option value="CE">Ceará</option><option value="DF">Distrito Federal</option><option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option><option value="MA">Maranhão</option><option value="MT">Mato Grosso</option><option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option><option value="PA">Pará</option><option value="PB">Paraíba</option><option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option><option value="PI">Piauí</option><option value="RJ">Rio de Janeiro</option><option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option><option value="RO">Rondônia</option><option value="RR">Roraima</option><option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option><option value="SE">Sergipe</option><option value="TO">Tocantins</option>
                </select>
              </label>
            </div>
            <label className={labelClass}>
              Endereço Completo
              <input disabled={isComum} type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} className={inputClass} placeholder="Ex: Av. Paulista, 1000, Bloco B, Bairro Bela Vista" />
            </label>
          </div>

          {/* SEÇÃO 2: DADOS DO EQUIPAMENTO */}
          <div>
            <div className={sectionTitleClass}>
              <span>📦</span> Dados do Equipamento
            </div>
            <div className={sectionGridClass}>
              <label className={labelClass}>
                Produto *
                <select disabled={isComum} value={produto} onChange={(e) => setProduto(e.target.value)} required className={inputClass}>
                  <option value="">-- Selecione o Produto --</option>
                  <option value="Exact View">Exact View</option>
                  <option value="Lap Mentor">Lap Mentor</option>
                  <option value="Robotix">Robotix</option>
                  <option value="Robotix + Lap Mentor">Robotix + Lap Mentor</option>
                </select>
              </label>
              <label className={labelClass}>
                Simulador (Texto Livre)
                <input disabled={isComum} type="text" value={simulador} onChange={(e) => setSimulador(e.target.value)} className={inputClass} placeholder="Ex: Versão Lite, Especificações..." />
              </label>
              <label className={labelClass}>
                Número de Série *
                <input disabled={isComum} type="text" value={serial} onChange={(e) => setSerial(e.target.value)} required className={inputClass} placeholder="Nº de Série do Fabricante" />
              </label>
              <label className={labelClass}>
                Fornecedor
                <input disabled={isComum} type="text" value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} className={inputClass} placeholder="Ex: Surgical Science" />
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <label className={labelClass}>
                Status de Operação *
                <select disabled={isComum} value={statusEquip} onChange={(e) => setStatusEquip(e.target.value)} required className={inputClass}>
                  <option value="Equipamento Funcionando">🟢 Equipamento Funcionando</option>
                  <option value="Equipamento de Demonstração">🔵 Equipamento de Demonstração</option>
                  <option value="Backup">⚪ Backup</option>
                  <option value="Em Manutenção">🔴 Em Manutenção</option>
                </select>
              </label>
              <label className={labelClass}>
                Data de Instalação
                <input disabled={isComum} type="date" value={instalacao} onChange={(e) => setInstalacao(e.target.value)} className={inputClass} />
              </label>
            </div>
          </div>

          {/* SEÇÃO 3: CONTRATO DE MANUTENÇÃO */}
          <div>
            <div className={sectionTitleClass}>
              <span>📝</span> Contrato & Prazos
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-4 rounded-xl mb-5 flex items-center gap-3">
              <input disabled={isComum} id="emContratoCheck" type="checkbox" checked={emContrato} onChange={(e) => setEmContrato(e.target.checked)} className="w-5 h-5 rounded border-slate-200 dark:border-slate-800 text-brand bg-slate-50 dark:bg-slate-950 focus:ring-0 cursor-pointer disabled:opacity-50" />
              <label htmlFor="emContratoCheck" className="text-sm font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                Este equipamento está coberto por um Contrato de Manutenção Ativo?
              </label>
            </div>
            {emContrato && (
              <div className={sectionGridClass}>
                <label className={labelClass}>
                  Data Início do Contrato
                  <input disabled={isComum} type="date" value={inicioContrato} onChange={(e) => setInicioContrato(e.target.value)} className={inputClass} />
                </label>
                <label className={labelClass}>
                  Método de Contrato
                  <input disabled={isComum} type="text" value={metodoContrato} onChange={(e) => setMetodoContrato(e.target.value)} className={inputClass} placeholder="Ex: Anual, Comodato..." />
                </label>
                <label className={labelClass}>
                  Data Fim do Contrato
                  <input disabled={isComum} type="date" value={fimContrato} onChange={(e) => setFimContrato(e.target.value)} className={inputClass} />
                </label>
              </div>
            )}
          </div>

          {/* SEÇÃO 4: MENTOR LEARN */}
          <div>
            <div className={sectionTitleClass}>
              <span>💻</span> Licença Mentor Learn
            </div>
            <div className={sectionGridClass}>
              <label className={labelClass}>
                Mentor Learn
                <input disabled={isComum} type="text" value={mentorLearn} onChange={(e) => setMentorLearn(e.target.value)} className={inputClass} placeholder="Ex: Mentor Learning" />
              </label>
              <label className={labelClass}>
                Status Mentor Learn
                <input disabled={isComum} type="text" value={statusMentorLearn} onChange={(e) => setStatusMentorLearn(e.target.value)} className={inputClass} placeholder="Ex: Ativo, Expirado" />
              </label>
              <label className={labelClass}>
                Fim Mentor Learn
                <input disabled={isComum} type="date" value={fimMentorLearn} onChange={(e) => setFimMentorLearn(e.target.value)} className={inputClass} />
              </label>
            </div>
          </div>

          {/* SEÇÃO 5: PREVENTIVAS & OBSERVAÇÕES */}
          <div>
            <div className={sectionTitleClass}>
              <span>🔧</span> Preventivas & Observações
            </div>
            <div className={sectionGridClass}>
              <label className={labelClass}>
                Preventivas Anuais (Qtde)
                <input disabled={isComum} type="number" min="0" value={preventivasAnuais} onChange={(e) => setPreventivasAnuais(e.target.value)} className={inputClass} placeholder="Ex: 2" />
              </label>
              <label className={labelClass}>
                Última Preventiva
                <input disabled={isComum} type="date" value={ultimaManutencao} onChange={(e) => setUltimaManutencao(e.target.value)} className={inputClass} />
              </label>
              <label className={labelClass}>
                Próxima Preventiva
                <input disabled={isComum} type="date" value={proximaPreventiva} onChange={(e) => setProximaPreventiva(e.target.value)} className={inputClass} />
              </label>
            </div>
            <label className={`${labelClass} mt-4`}>
              Observações Gerais
              <textarea disabled={isComum} rows="3" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className={`${inputClass} resize-vertical`} placeholder="Histórico, detalhes adicionais, acessórios..." />
            </label>
          </div>

          {/* BOTÕES LADO A LADO NO RODAPÉ */}
          <div className="flex justify-end gap-3 mt-6">
            <button 
              type="button" 
              onClick={voltarParaLista} 
              className="px-6 py-2.5 font-bold text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg active:scale-95 transition-all duration-150"
            >
              {isComum ? 'Voltar' : 'Cancelar'}
            </button>
            {!isComum && (
              <button 
                type="submit" 
                disabled={isPending} 
                className="px-6 py-2.5 font-bold text-sm text-white bg-brand hover:bg-brand-hover rounded-lg shadow-sm hover:shadow-brand/20 active:scale-95 transition-all duration-150 disabled:opacity-50"
              >
                {isPending ? '⏳ Salvando...' : '💾 Salvar Configurações'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
