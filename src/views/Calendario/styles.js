export const btnVoltarStyle = { 
  padding: '8px 16px', 
  backgroundColor: '#64748b', 
  color: '#fff', 
  border: 'none', 
  borderRadius: '6px', 
  cursor: 'pointer', 
  fontSize: '14px',
  fontWeight: '700',
  transition: 'all 0.2s ease',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  textDecoration: 'none',
  width: 'fit-content'
};

export const toolbarStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'var(--bg-card)',
  padding: '24px 28px',
  borderRadius: '16px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
  marginBottom: '25px',
  border: '1px solid var(--border-light)',
  width: '100%',
  boxSizing: 'border-box',
  minHeight: '165px'
};

export const controleMesStyle = { 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  gap: '15px', 
  marginBottom: '20px' 
};

export const btnSetaStyle = { 
  padding: '8px 14px', 
  backgroundColor: 'var(--bg-card)', 
  border: '1px solid var(--border-color)', 
  borderRadius: '6px', 
  cursor: 'pointer', 
  fontSize: '14px', 
  fontWeight: 'bold',
  color: 'var(--text-primary)'
};

export const selectHeaderStyle = { 
  padding: '8px 12px', 
  fontSize: '15px', 
  fontWeight: 'bold', 
  borderRadius: '6px', 
  border: '1px solid var(--border-color)', 
  backgroundColor: 'var(--bg-card)', 
  cursor: 'pointer', 
  outline: 'none', 
  color: 'var(--text-primary)' 
};

export const calendarioContainerStyle = { 
  display: 'grid', 
  gridTemplateColumns: 'repeat(7, 1fr)', 
  backgroundColor: 'var(--bg-app)', 
  border: '1px solid var(--border-color)', 
  borderRadius: '8px', 
  overflow: 'hidden', 
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
};

export const cabecalhoDiaSemanaStyle = { 
  padding: '8px 5px', 
  backgroundColor: 'var(--bg-card)', 
  color: 'var(--text-secondary)', 
  textAlign: 'center', 
  fontWeight: 'bold', 
  fontSize: '12px',
  borderBottom: '1px solid var(--border-light)'
};

export const celulaDiaStyle = { 
  height: '100px', 
  padding: '6px', 
  boxSizing: 'border-box', 
  display: 'flex', 
  flexDirection: 'column', 
  justifyContent: 'flex-start', 
  overflow: 'hidden', 
  transition: 'background-color 0.2s', 
  position: 'relative' 
};

export const legendaStyle = { 
  display: 'flex', 
  gap: '15px', 
  marginTop: '15px', 
  justifyContent: 'center', 
  fontSize: '12px', 
  color: 'var(--text-secondary)', 
  backgroundColor: 'var(--bg-card)', 
  padding: '8px', 
  borderRadius: '6px', 
  boxShadow: '0 2px 5px rgba(0,0,0,0.02)', 
  flexWrap: 'wrap',
  border: '1px solid var(--border-light)'
};

export const overlayStyle = { 
  position: 'fixed', 
  top: 0, 
  left: 0, 
  right: 0, 
  bottom: 0, 
  backgroundColor: 'rgba(15, 23, 42, 0.4)', 
  backdropFilter: 'blur(4px)',
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  zIndex: 1000 
};

export const modalStyle = { 
  backgroundColor: 'var(--bg-card)', 
  padding: '25px', 
  borderRadius: '16px', 
  width: '95%', 
  maxWidth: '650px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', 
  border: '1px solid var(--border-light)',
  maxHeight: '90vh', 
  overflowY: 'auto' 
};

export const labelModalStyle = { 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '5px', 
  fontSize: '13px', 
  fontWeight: 'bold', 
  color: 'var(--text-secondary)' 
};

export const inputModalStyle = { 
  padding: '10px', 
  borderRadius: '6px', 
  border: '1px solid var(--border-color)', 
  fontSize: '14px', 
  boxSizing: 'border-box', 
  width: '100%',
  backgroundColor: 'var(--bg-card)',
  color: 'var(--text-primary)'
};

export const btnSalvarModalStyle = { 
  padding: '10px 15px', 
  backgroundColor: 'var(--brand)', 
  color: '#fff', 
  border: 'none', 
  borderRadius: '6px', 
  cursor: 'pointer', 
  fontWeight: 'bold' 
};

export const btnCancelarModalStyle = { 
  padding: '10px 15px', 
  backgroundColor: 'var(--bg-app)', 
  color: 'var(--text-secondary)', 
  border: '1px solid var(--border-light)', 
  borderRadius: '6px', 
  cursor: 'pointer', 
  fontWeight: 'bold' 
};

export const btnExcluirModalStyle = { 
  padding: '10px 15px', 
  backgroundColor: 'var(--danger)', 
  color: '#fff', 
  border: 'none', 
  borderRadius: '6px', 
  cursor: 'pointer', 
  fontWeight: 'bold' 
};
