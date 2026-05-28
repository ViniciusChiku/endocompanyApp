import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

// LINK: GeoJSON super estável mantido pela fundação "Code for America"
const geoUrl = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson";

// Coordenadas aproximadas [longitude, latitude] dos centros de cada estado brasileiro
const UF_CENTROIDS = {
  AC: [-70.0, -9.0],
  AL: [-36.2, -9.6],
  AM: [-64.5, -4.0],
  AP: [-51.5, 1.4],
  BA: [-41.5, -12.5],
  CE: [-39.5, -5.2],
  DF: [-47.9, -15.8],
  ES: [-40.3, -19.5],
  GO: [-49.5, -16.0],
  MA: [-45.0, -5.5],
  MG: [-44.5, -18.5],
  MS: [-54.5, -20.2],
  MT: [-56.0, -13.0],
  PA: [-52.5, -4.5],
  PB: [-36.5, -7.2],
  PE: [-37.5, -8.3],
  PI: [-42.5, -7.5],
  PR: [-51.5, -24.8],
  RJ: [-42.8, -22.3],
  RN: [-36.8, -5.8],
  RO: [-62.5, -11.0],
  RR: [-61.3, 2.0],
  RS: [-53.8, -30.0],
  SC: [-50.5, -27.2],
  SE: [-37.1, -10.6],
  SP: [-48.5, -22.3],
  TO: [-48.0, -10.0]
};

// Definição das Regiões do Brasil
const REGIOES = [
  {
    nome: "Sudeste",
    ufs: ["SP", "RJ", "MG", "ES"],
    nomeUfs: { SP: "São Paulo", RJ: "Rio de Janeiro", MG: "Minas Gerais", ES: "Espírito Santo" }
  },
  {
    nome: "Sul",
    ufs: ["PR", "SC", "RS"],
    nomeUfs: { PR: "Paraná", SC: "Santa Catarina", RS: "Rio Grande do Sul" }
  },
  {
    nome: "Centro-Oeste",
    ufs: ["DF", "GO", "MT", "MS"],
    nomeUfs: { DF: "Distrito Federal", GO: "Goiás", MT: "Mato Grosso", MS: "Mato Grosso do Sul" }
  },
  {
    nome: "Nordeste",
    ufs: ["BA", "CE", "PE", "MA", "PB", "RN", "AL", "SE", "PI"],
    nomeUfs: { BA: "Bahia", CE: "Ceará", PE: "Pernambuco", MA: "Maranhão", PB: "Paraíba", RN: "Rio Grande do Norte", AL: "Alagoas", SE: "Sergipe", PI: "Piauí" }
  },
  {
    nome: "Norte",
    ufs: ["AM", "PA", "TO", "RO", "AC", "AP", "RR"],
    nomeUfs: { AM: "Amazonas", PA: "Pará", TO: "Tocantins", RO: "Rondônia", AC: "Acre", AP: "Amapá", RR: "Roraima" }
  }
];

// Configurações de projeção (zoom e centralização) para cada região do Brasil
const REGION_PROJECTIONS = {
  default: {
    scale: 770,
    center: [-54, -15]
  },
  "Sudeste": {
    scale: 1700,
    center: [-45.5, -19.5]
  },
  "Sul": {
    scale: 2200,
    center: [-52.0, -27.5]
  },
  "Centro-Oeste": {
    scale: 1300,
    center: [-53.0, -16.0]
  },
  "Nordeste": {
    scale: 1400,
    center: [-41.5, -9.0]
  },
  "Norte": {
    scale: 1050,
    center: [-60.0, -4.0]
  }
};

// Cores premium e mais visíveis por região
const REGIAO_COLORS = {
  "Sudeste": {
    base: "#3b82f6", // Royal Blue
    light: "#bfdbfe", // Tailwind Blue 200
    medium: "#3b82f6", // Tailwind Blue 500
    dark: "#1d4ed8", // Tailwind Blue 700
    border: "#2563eb"
  },
  "Sul": {
    base: "#8b5cf6", // Indigo/Purple
    light: "#ddd6fe", // Tailwind Purple 200
    medium: "#8b5cf6", // Tailwind Purple 500
    dark: "#6d28d9", // Tailwind Purple 700
    border: "#7c3aed"
  },
  "Centro-Oeste": {
    base: "#0d9488", // Teal
    light: "#99f6e4", // Tailwind Teal 200
    medium: "#0d9488", // Tailwind Teal 600
    dark: "#115e59", // Tailwind Teal 800
    border: "#0f766e"
  },
  "Nordeste": {
    base: "#ea580c", // Vibrant Orange
    light: "#fed7aa", // Tailwind Orange 200
    medium: "#f97316", // Tailwind Orange 500
    dark: "#c2410c", // Tailwind Orange 700
    border: "#ea580c"
  },
  "Norte": {
    base: "#16a34a", // Forest Green
    light: "#bbf7d0", // Tailwind Green 200
    medium: "#22c55e", // Tailwind Green 500
    dark: "#15803d", // Tailwind Green 700
    border: "#16a34a"
  }
};

export default function MapaBrasil({ contagemEstados, estadoSelecionado, onClickEstado, listaEquipamentos, onCliqueEquipamento }) {
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
  const [regiaoAtiva, setRegiaoAtiva] = useState(null); // Região filtrada/selecionada com zoom
  const [hoveredRegiao, setHoveredRegiao] = useState(null); // Região sob hover
  const [hoveredUf, setHoveredUf] = useState(null); // Estado sob hover
  
  // Modificado para iniciar todas as regiões FECHADAS por padrão, conforme solicitado
  const [regioesExpandidas, setRegioesExpandidas] = useState({
    "Sudeste": false,
    "Sul": false,
    "Centro-Oeste": false,
    "Nordeste": false,
    "Norte": false
  });

  const handleMouseMove = (e, uf, contagem, nome) => {
    setTooltip({
      show: true,
      text: `${nome} (${uf}): ${contagem} equipamento${contagem !== 1 ? 's' : ''}`,
      x: e.clientX + 15,
      y: e.clientY + 15
    });
    setHoveredUf(uf);
  };

  const handleMouseLeave = () => {
    setTooltip({ ...tooltip, show: false });
    setHoveredUf(null);
  };

  const toggleRegiao = (nomeRegiao) => {
    setRegioesExpandidas(prev => ({
      ...prev,
      [nomeRegiao]: !prev[nomeRegiao]
    }));
  };

  const handleRegiaoClick = (nomeRegiao) => {
    const novoAtivo = regiaoAtiva === nomeRegiao ? null : nomeRegiao;
    
    // Alterna a região ativa no mapa (que dispara o zoom e centralização)
    setRegiaoAtiva(novoAtivo);

    // Ajusta a expansão da legenda: abre apenas a selecionada e recolhe as outras.
    // Se o filtro foi limpo, recolhe todas para manter a interface organizada.
    setRegioesExpandidas({
      "Sudeste": novoAtivo === "Sudeste",
      "Sul": novoAtivo === "Sul",
      "Centro-Oeste": novoAtivo === "Centro-Oeste",
      "Nordeste": novoAtivo === "Nordeste",
      "Norte": novoAtivo === "Norte"
    });
  };

  const limparFiltros = () => {
    setRegiaoAtiva(null);
    onClickEstado(null);
    setRegioesExpandidas({
      "Sudeste": false,
      "Sul": false,
      "Centro-Oeste": false,
      "Nordeste": false,
      "Norte": false
    });
  };

  const handleStateClick = (uf) => {
    const isAlreadySelected = estadoSelecionado === uf;
    const novoEstado = isAlreadySelected ? null : uf;
    
    if (novoEstado) {
      const regiaoPai = REGIOES.find(r => r.ufs.includes(uf));
      if (regiaoPai) {
        setRegioesExpandidas(prev => ({
          ...prev,
          [regiaoPai.nome]: true
        }));
        setRegiaoAtiva(regiaoPai.nome);
      }
    }
    
    if (onClickEstado) {
      onClickEstado(novoEstado);
    }
  };

  const obterContagemRegiao = (reg) => {
    return reg.ufs.reduce((total, uf) => total + (contagemEstados[uf] || 0), 0);
  };

  const totalGeralEquipamentos = Object.values(contagemEstados).reduce((a, b) => a + b, 0);

  // Obtém a configuração de zoom e posição com base na região ativa selecionada
  const projConfig = REGION_PROJECTIONS[regiaoAtiva] || REGION_PROJECTIONS.default;

  return (
    <div style={{ 
      display: 'flex', 
      gap: '24px', 
      flexWrap: 'wrap', 
      padding: '24px', 
      backgroundColor: 'var(--bg-card)', 
      borderRadius: '16px', 
      border: '1px solid var(--border-light)', 
      position: 'relative',
      boxShadow: 'var(--shadow-lg)'
    }}>
      
      {/* BALÃO DE INFORMAÇÃO (TOOLTIP) */}
      {tooltip.show && (
        <div style={{
          position: 'fixed',
          top: tooltip.y,
          left: tooltip.x,
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(8px)',
          color: '#ffffff',
          padding: '10px 14px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '500',
          pointerEvents: 'none',
          zIndex: 1000,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255,255,255,0.12)',
          transition: 'all 0.1s ease-out'
        }}>
          {tooltip.text}
        </div>
      )}

      {/* COLUNA 1: MAPA DE CALOR INTERATIVO */}
      <div style={{ 
        flex: '1.6', 
        minWidth: '320px', 
        position: 'relative', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: 'var(--bg-app)',
        borderRadius: '12px',
        padding: '10px',
        border: '1px solid var(--border-light)'
      }}>
        {/* Filtros ativos e reset */}
        {(regiaoAtiva || estadoSelecionado) && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            display: 'flex',
            gap: '8px',
            zIndex: 10
          }}>
            <button 
              onClick={limparFiltros}
              style={{
                padding: '6px 12px',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-app)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              🔄 Restaurar Visualização Completa
            </button>
          </div>
        )}

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: projConfig.scale,
            center: projConfig.center
          }}
          width={800}
          height={600}
          style={{ 
            width: "100%", 
            maxWidth: "600px", 
            height: "auto",
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)" // Efeito suave de transição ao dar zoom
          }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies && geographies.length > 0 ? (
                geographies.map((geo) => {
                  const uf = geo.properties.sigla; 
                  const nome = geo.properties.name;

                  const contagem = contagemEstados[uf] || 0;
                  const selecionado = estadoSelecionado === uf;

                  // Determina a região e as cores associadas
                  const regiaoPai = REGIOES.find(r => r.ufs.includes(uf));
                  const nomeRegiao = regiaoPai ? regiaoPai.nome : "";
                  const coresReg = REGIAO_COLORS[nomeRegiao] || { base: '#cbd5e1', light: '#e2e8f0', medium: '#94a3b8', dark: '#475569', border: '#cbd5e1' };

                  // Lógica de Cores do Mapa de Calor baseada na Região do Estado
                  let corFundo = '#f1f5f9'; 
                  if (contagem > 0) {
                    if (contagem > 15) corFundo = coresReg.dark;
                    else if (contagem > 5) corFundo = coresReg.medium;
                    else corFundo = coresReg.light;
                  }

                  if (selecionado) {
                    corFundo = '#fbbf24'; // Destaque em Amarelo Ouro/Amber
                  }

                  // Opacidade e efeito de foco
                  const existeFiltroRegiao = regiaoAtiva !== null || hoveredRegiao !== null;
                  const pertenceAFiltro = (regiaoAtiva === null || regiaoAtiva === nomeRegiao) && 
                                         (hoveredRegiao === null || hoveredRegiao === nomeRegiao);
                  
                  let opacity = 1;
                  if (existeFiltroRegiao && !pertenceAFiltro) {
                    opacity = 0.25; // Esmaece estados fora do foco regional
                  }

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleStateClick(uf)}
                      onMouseMove={(e) => handleMouseMove(e, uf, contagem, nome)}
                      onMouseLeave={handleMouseLeave}
                      style={{
                        default: {
                          fill: corFundo,
                          stroke: selecionado ? "#d97706" : (contagem > 0 ? coresReg.border : "#cbd5e1"),
                          strokeWidth: selecionado ? 2.5 : 1.1,
                          opacity: opacity,
                          outline: "none",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        },
                        hover: {
                          fill: selecionado ? '#f59e0b' : (contagem > 0 ? coresReg.medium : coresReg.light),
                          stroke: "#0f172a",
                          strokeWidth: 1.6,
                          opacity: 1,
                          outline: "none",
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        },
                        pressed: {
                          fill: "#d97706",
                          outline: "none"
                        }
                      }}
                    />
                  );
                })
              ) : (
                <text
                  x="400"
                  y="300"
                  textAnchor="middle"
                  style={{
                    fontFamily: "var(--font-sans), Inter, sans-serif",
                    fill: "var(--text-secondary)",
                    fontSize: "18px",
                    fontWeight: "600"
                  }}
                >
                  Carregando mapa interativo...
                </text>
              )
            }
          </Geographies>

          {/* RENDERIZAÇÃO DOS NOMES DOS ESTADOS DENTRO DO MAPA */}
          {Object.keys(UF_CENTROIDS).map(uf => {
            const coords = UF_CENTROIDS[uf];
            const contagem = contagemEstados[uf] || 0;
            const selecionado = estadoSelecionado === uf;

            const regiaoPai = REGIOES.find(r => r.ufs.includes(uf));
            const nomeRegiao = regiaoPai ? regiaoPai.nome : "";
            const nomeCompleto = regiaoPai ? regiaoPai.nomeUfs[uf] : uf;

            const isRegiaoAtiva = regiaoAtiva === nomeRegiao;
            const isRegiaoHovered = hoveredRegiao === nomeRegiao;
            
            const existeFiltroRegiao = regiaoAtiva !== null || hoveredRegiao !== null;
            const pertenceAFiltro = (regiaoAtiva === null || isRegiaoAtiva) && 
                                   (hoveredRegiao === null || isRegiaoHovered);

            // Esmaece a legenda do estado caso não pertença ao filtro regional ativo
            const opacityTexto = (existeFiltroRegiao && !pertenceAFiltro) ? 0.2 : 1;

            // Determina se a cor de fundo do estado é muito escura para usar texto claro
            const fundoEscuro = contagem > 5 && pertenceAFiltro && !selecionado;
            const corTexto = fundoEscuro ? "#ffffff" : "#0f172a";
            const corSubtexto = fundoEscuro ? "rgba(255,255,255,0.85)" : "#475569";

            // Mostrar nome completo baseando-se no tamanho do estado ou relevância de foco
            const GRANDES_ESTADOS = ["AM", "PA", "MT", "MS", "MG", "BA", "RS", "GO", "MA", "PI", "TO", "RO", "AC", "AP", "RR"];
            const mostrarNomeCompleto = (selecionado || hoveredUf === uf || isRegiaoAtiva || isRegiaoHovered || GRANDES_ESTADOS.includes(uf)) && !["DF"].includes(uf);

            return (
              <Marker key={uf} coordinates={coords}>
                <g style={{ 
                  pointerEvents: "none", 
                  opacity: opacityTexto, 
                  transition: "all 0.3s ease" 
                }}>
                  {/* Sigla do Estado (ex: SP) */}
                  <text
                    textAnchor="middle"
                    y={mostrarNomeCompleto ? -4 : 4}
                    style={{
                      fontFamily: "var(--font-sans), Inter, sans-serif",
                      fontSize: selecionado ? "12px" : "10px",
                      fontWeight: "800",
                      fill: corTexto,
                      textShadow: selecionado 
                        ? "0px 1.5px 2.5px rgba(255,255,255,0.9)" 
                        : (fundoEscuro ? "0px 1.5px 2px rgba(0,0,0,0.8)" : "0px 1px 1px rgba(255,255,255,0.9)")
                    }}
                  >
                    {uf}
                  </text>
                  
                  {/* Nome Completo do Estado (ex: São Paulo) */}
                  {mostrarNomeCompleto && (
                    <text
                      textAnchor="middle"
                      y={7}
                      style={{
                        fontFamily: "var(--font-sans), Inter, sans-serif",
                        fontSize: "6.5px",
                        fontWeight: "600",
                        fill: corSubtexto,
                        textShadow: fundoEscuro ? "0px 1.5px 2px rgba(0,0,0,0.7)" : "0px 1px 1px rgba(255,255,255,0.9)"
                      }}
                    >
                      {nomeCompleto}
                    </text>
                  )}
                </g>
              </Marker>
            );
          })}
        </ComposableMap>
      </div>

      {/* COLUNA 2: LEGENDA REGIONAL INTERATIVA E PREMIUM */}
      <div style={{ 
        flex: '1', 
        minWidth: '280px', 
        backgroundColor: 'var(--bg-card)', 
        borderRadius: '12px', 
        border: '1px solid var(--border-light)', 
        padding: '20px',
        maxHeight: '580px',
        overflowY: 'auto',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.01)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid var(--border-light)', paddingBottom: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🗺️ Legenda & Regiões
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold', backgroundColor: 'var(--bg-app)', padding: '2px 8px', borderRadius: '10px' }}>
            {totalGeralEquipamentos} eq. total
          </span>
        </div>

        {/* Instrução visual */}
        <p style={{ margin: '0 0 16px 0', fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          💡 Clique em uma região para focar nela ou clique em um estado para ver e editar seus equipamentos aqui na legenda!
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {REGIOES.map(reg => {
            const expandido = regioesExpandidas[reg.nome];
            const ativo = regiaoAtiva === reg.nome;
            const totalRegiao = obterContagemRegiao(reg);
            const coresReg = REGIAO_COLORS[reg.nome];

            return (
              <div 
                key={reg.nome} 
                style={{ 
                  border: ativo ? `2px solid ${coresReg.base}` : '1px solid var(--border-light)', 
                  borderRadius: '10px', 
                  overflow: 'hidden',
                  boxShadow: ativo ? `0 4px 12px ${coresReg.light}` : 'none',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={() => setHoveredRegiao(reg.nome)}
                onMouseLeave={() => setHoveredRegiao(null)}
              >
                {/* Cabeçalho da Região */}
                <div 
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    backgroundColor: ativo ? coresReg.light : 'var(--bg-card)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    borderLeft: `4px solid ${coresReg.base}`,
                    transition: 'all 0.2s'
                  }}
                  onClick={() => handleRegiaoClick(reg.nome)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Previne ativar/desativar filtro de zoom no clique do chevron simples
                        toggleRegiao(reg.nome);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '11px',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--bg-app)'
                      }}
                    >
                      {expandido ? '▼' : '▶'}
                    </button>
                    <strong style={{ 
                      fontSize: '13px', 
                      color: ativo ? coresReg.dark : 'var(--text-primary)', 
                      fontWeight: ativo ? '700' : '600'
                    }}>
                      {reg.nome}
                    </strong>
                  </div>
                  
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: '700', 
                    backgroundColor: totalRegiao > 0 ? coresReg.light : 'var(--bg-app)', 
                    color: totalRegiao > 0 ? coresReg.dark : 'var(--text-secondary)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: totalRegiao > 0 ? `1px solid ${coresReg.medium}` : '1px solid transparent'
                  }}>
                    {totalRegiao} eq
                  </span>
                </div>

                {/* Lista de Estados da Região */}
                {expandido && (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '2px', 
                    padding: '8px', 
                    backgroundColor: 'var(--bg-card)',
                    borderTop: '1px solid var(--border-light)'
                  }}>
                    {reg.ufs.map(uf => {
                      const contagem = contagemEstados[uf] || 0;
                      const selecionado = estadoSelecionado === uf;
                      const eqDoEstado = listaEquipamentos ? listaEquipamentos.filter(eq => (eq.estado || 'SP') === uf) : [];

                      return (
                        <div key={uf} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {/* Linha Clickable do Estado */}
                          <div
                            onClick={() => handleStateClick(uf)} // Clique no estado ativo retira a seleção
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              backgroundColor: selecionado ? 'var(--brand-light)' : 'transparent',
                              border: selecionado ? '1px solid var(--brand)' : '1px solid transparent',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (!selecionado) e.currentTarget.style.backgroundColor = 'var(--bg-app)';
                            }}
                            onMouseLeave={(e) => {
                              if (!selecionado) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <span style={{ 
                              fontSize: '12px', 
                              color: selecionado ? 'var(--brand)' : 'var(--text-primary)', 
                              fontWeight: selecionado ? '700' : '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <span style={{
                                display: 'inline-block',
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: contagem > 0 ? coresReg.base : '#cbd5e1'
                              }} />
                              {reg.nomeUfs[uf]} ({uf})
                            </span>
                            <span style={{ 
                              fontSize: '11px', 
                              fontWeight: '600',
                              color: contagem > 0 ? coresReg.dark : 'var(--text-secondary)',
                              backgroundColor: contagem > 0 ? `${coresReg.light}aa` : 'transparent',
                              padding: '1px 6px',
                              borderRadius: '4px'
                            }}>
                              {contagem} eq
                            </span>
                          </div>

                          {/* Lista Interna de Equipamentos na própria Legenda Lateral, conforme solicitado */}
                          {selecionado && (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              padding: '10px',
                              backgroundColor: 'var(--bg-app)',
                              borderRadius: '8px',
                              marginTop: '2px',
                              marginBottom: '6px',
                              border: '1px solid var(--border-light)',
                              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
                              animation: 'fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}>
                              <div style={{ 
                                fontSize: '10px', 
                                fontWeight: '700', 
                                color: 'var(--text-secondary)', 
                                borderBottom: '1px solid var(--border-light)', 
                                paddingBottom: '4px',
                                display: 'flex',
                                justifyContent: 'space-between'
                              }}>
                                <span>📦 EQUIPAMENTOS ({eqDoEstado.length})</span>
                                <span style={{ fontSize: '9px', fontWeight: '500', color: 'var(--text-secondary)' }}>* Clique para editar</span>
                              </div>
                              
                              {eqDoEstado.length === 0 ? (
                                <div style={{ 
                                  fontSize: '10.5px', 
                                  color: 'var(--text-secondary)', 
                                  fontStyle: 'italic', 
                                  textAlign: 'center', 
                                  padding: '10px 0' 
                                }}>
                                  Nenhum equipamento neste estado.
                                </div>
                              ) : (
                                eqDoEstado.map(eq => {
                                  // Cores de status correspondentes
                                  const status = eq.status_equipamento || 'Equipamento Funcionando';
                                  let bgStatus = '#d4edda';
                                  let txStatus = '#155724';
                                  if (status === 'Em Manutenção') {
                                    bgStatus = '#f8d7da';
                                    txStatus = '#721c24';
                                  } else if (status === 'Equipamento de Demonstração') {
                                    bgStatus = '#cce5ff';
                                    txStatus = '#004085';
                                  } else if (status === 'Backup') {
                                    bgStatus = '#e2e3e5';
                                    txStatus = '#383d41';
                                  }

                                  return (
                                    <div 
                                      key={eq.id} 
                                      onClick={(e) => {
                                        e.stopPropagation(); // Evita deselecionar o estado
                                        onCliqueEquipamento && onCliqueEquipamento(eq);
                                      }}
                                      style={{ 
                                        fontSize: '11px', 
                                        color: 'var(--text-primary)', 
                                        lineHeight: '1.4', 
                                        backgroundColor: 'var(--bg-card)',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border-light)',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                                        cursor: onCliqueEquipamento ? 'pointer' : 'default',
                                        transition: 'all 0.2s ease'
                                      }}
                                      onMouseEnter={(e) => {
                                        if (onCliqueEquipamento) {
                                          e.currentTarget.style.borderColor = coresReg.base;
                                          e.currentTarget.style.backgroundColor = coresReg.light;
                                          e.currentTarget.style.transform = 'translateY(-1px)';
                                          e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.04)';
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (onCliqueEquipamento) {
                                          e.currentTarget.style.borderColor = 'var(--border-light)';
                                          e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                                          e.currentTarget.style.transform = 'translateY(0)';
                                          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)';
                                        }
                                      }}
                                    >
                                      <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px' }}>
                                        {eq.nome_produto}
                                      </div>
                                      <div style={{ color: 'var(--text-secondary)', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                        🏥 {eq.local}
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px', paddingTop: '4px', borderTop: '1px dashed var(--border-light)' }}>
                                        <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                          SN: {eq.serial}
                                        </span>
                                        <span style={{ 
                                          fontSize: '8.5px', 
                                          fontWeight: '700', 
                                          backgroundColor: bgStatus, 
                                          color: txStatus, 
                                          padding: '1px 6px', 
                                          borderRadius: '4px',
                                          textTransform: 'uppercase'
                                        }}>
                                          {status.replace('Equipamento ', '')}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}