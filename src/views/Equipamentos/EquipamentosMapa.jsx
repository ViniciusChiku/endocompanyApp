import React from 'react';
import MapaBrasil from '../MapaBrasil';

export default function EquipamentosMapa({
  filtroTipo, setFiltroTipo,
  filtroStatus, setFiltroStatus,
  estadoSelecionadoMapa, setEstadoSelecionadoMapa,
  contagemEstados,
  listaFiltrada,
  prepararEdicao
}) {
  return (
    <div className="animate-fadeIn">
      {/* BARRA DE FILTROS */}
      <div className="flex flex-col sm:flex-row gap-4 items-center p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl mb-6 shadow-sm">
        <select 
          value={filtroTipo} 
          onChange={(e) => setFiltroTipo(e.target.value)} 
          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-brand text-slate-800 dark:text-slate-100 px-4 py-2.5 rounded-lg text-sm outline-none cursor-pointer transition-all w-full sm:w-52"
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
          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-brand text-slate-800 dark:text-slate-100 px-4 py-2.5 rounded-lg text-sm outline-none cursor-pointer transition-all w-full sm:w-52"
        >
          <option value="">Status (Todos)</option>
          <option value="Equipamento Funcionando">🟢 Funcionando</option>
          <option value="Equipamento de Demonstração">🔵 Demonstração</option>
          <option value="Backup">⚪ Backup</option>
          <option value="Em Manutenção">🔴 Em Manutenção</option>
        </select>
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 sm:ml-auto">
          {estadoSelecionadoMapa ? `📍 Mostrando simuladores de ${estadoSelecionadoMapa}.` : '🗺️ Selecione um estado no mapa abaixo para filtrar.'}
        </span>
      </div>

      {/* MAPA INTERATIVO */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md">
        <MapaBrasil 
          contagemEstados={contagemEstados} 
          estadoSelecionado={estadoSelecionadoMapa} 
          onClickEstado={setEstadoSelecionadoMapa} 
          listaEquipamentos={listaFiltrada}
          onCliqueEquipamento={prepararEdicao}
        />
      </div>
    </div>
  );
}
