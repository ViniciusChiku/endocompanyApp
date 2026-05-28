// Estilos dinâmicos e estáticos compartilhados para o módulo de Eventos de Demonstração

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

export const filterContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '15px',
  marginBottom: '25px',
  flexWrap: 'wrap'
};

export const inputBuscaStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  fontSize: '15px',
  backgroundColor: 'var(--bg-card)',
  color: 'var(--text-primary)'
};

export const toggleBtnStyle = {
  padding: '10px 16px',
  fontSize: '14px',
  fontWeight: '600',
  border: 'none',
  borderRadius: '0',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

export const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: '20px'
};

export const cardEventStyle = {
  display: 'flex',
  flexDirection: 'column',
  padding: '20px',
  backgroundColor: 'var(--bg-card)',
  borderRadius: '12px',
  border: '1px solid var(--border-light)',
  height: '100%',
  justifyContent: 'space-between'
};

export const cardHeaderStyle = {
  display: 'flex',
  gap: '15px',
  alignItems: 'flex-start',
  marginBottom: '10px'
};

export const cardTitleStyle = {
  fontSize: '16px',
  fontWeight: '700',
  color: 'var(--brand)',
  margin: 0,
  lineHeight: '1.3'
};

export const cardBodyStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

export const obsSnippetStyle = {
  backgroundColor: 'var(--bg-app)',
  padding: '10px',
  borderRadius: '6px',
  fontSize: '12px',
  color: 'var(--text-secondary)',
  border: '1px solid var(--border-light)',
  marginTop: '8px'
};

export const cardDayGroupStyle = {
  backgroundColor: 'var(--bg-app)',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid var(--border-light)',
  marginTop: '5px'
};

export const cardSlotRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  borderBottom: '1px dashed var(--border-color)',
  paddingBottom: '6px',
  marginBottom: '4px'
};

export const cardSlotBtnStyle = {
  padding: '4px 10px',
  fontSize: '11px',
  fontWeight: 'bold',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  minWidth: '70px',
  height: '26px'
};

export const progressBgStyle = {
  backgroundColor: 'var(--border-light)',
  borderRadius: '9999px',
  height: '6px',
  overflow: 'hidden',
  width: '100%'
};

export const progressFillStyle = {
  height: '100%',
  borderRadius: '9999px',
  transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
};

export const cardFooterStyle = {
  borderTop: '1px solid var(--border-light)',
  paddingTop: '15px',
  marginTop: '15px'
};

/* CALENDAR STYLES */
export const calendarHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px'
};

export const navBtnStyle = {
  padding: '8px 14px',
  fontSize: '13px',
  fontWeight: 'bold',
  backgroundColor: 'var(--bg-app)',
  color: 'var(--text-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '6px'
};

export const calendarDaysRowStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '8px',
  textAlign: 'center',
  marginBottom: '8px'
};

export const calendarDayHeaderStyle = {
  fontSize: '12px',
  fontWeight: '700',
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  padding: '6px 0'
};

export const calendarGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '8px'
};

export const emptyCellStyle = {
  backgroundColor: 'var(--bg-app)',
  borderRadius: '8px',
  minHeight: '100px',
  border: '1px dashed var(--border-light)'
};

export const dayCellStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border-light)',
  borderRadius: '8px',
  minHeight: '100px',
  padding: '8px',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  transition: 'border-color 0.2s ease'
};

export const dayNumberStyle = {
  fontSize: '13px',
  fontWeight: '700',
  color: 'var(--text-secondary)',
  alignSelf: 'flex-end',
  marginBottom: '6px'
};

export const dayEventContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  flex: 1,
  overflowY: 'auto'
};

export const calendarEventBadgeStyle = {
  padding: '4px 6px',
  borderRadius: '4px',
  fontSize: '11px',
  fontWeight: '500',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  cursor: 'pointer',
  transition: 'transform 0.1s ease',
  marginBottom: '2px'
};

/* MODAL STYLES */
export const modalOverlayStyle = {
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
  zIndex: 999,
  padding: '20px',
  overflowY: 'auto'
};

export const modalContentStyle = {
  backgroundColor: 'var(--bg-card)',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '650px',
  padding: '30px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  animation: 'fadeIn 0.3s ease-out',
  maxHeight: '90vh',
  overflowY: 'auto',
  border: '1px solid var(--border-light)'
};

export const btnCloseStyle = {
  background: 'var(--bg-app)',
  border: 'none',
  fontSize: '16px',
  color: 'var(--text-secondary)',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontWeight: 'bold'
};

export const labelStyle = { 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '6px', 
  fontSize: '14px', 
  fontWeight: '600', 
  color: 'var(--text-secondary)' 
};

/* DETAILS BOX STYLES */
export const detailBoxStyle = {
  backgroundColor: 'var(--bg-app)',
  padding: '20px',
  borderRadius: '10px',
  border: '1px solid var(--border-light)',
  display: 'flex',
  flexDirection: 'column',
  gap: '15px'
};

export const detailRowStyle = {
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-start'
};

export const detailLabelStyle = {
  margin: 0,
  fontSize: '12px',
  fontWeight: 'bold',
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.02em'
};

export const detailValueStyle = {
  margin: '2px 0 0 0',
  fontSize: '14px',
  color: 'var(--text-primary)',
  lineHeight: '1.4'
};

export const detailSessionRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '15px',
  backgroundColor: 'var(--bg-card)',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid var(--border-color)'
};

/* SUBSCRIBERS STYLES */
export const subscriberListContainerStyle = {
  backgroundColor: 'var(--bg-app)',
  border: '1px solid var(--border-light)',
  borderRadius: '8px',
  padding: '15px',
  maxHeight: '320px',
  overflowY: 'auto',
  flex: 1
};

export const subscriberRowStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border-light)',
  borderRadius: '6px',
  padding: '10px 12px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '10px'
};

export const subscriberEmailStyle = {
  margin: 0,
  fontSize: '13px',
  fontWeight: '600',
  color: 'var(--brand)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};

export const badgeRoleStyle = {
  fontSize: '11px',
  fontWeight: 'bold',
  padding: '2px 8px',
  borderRadius: '9999px',
  marginTop: '4px',
  display: 'inline-block'
};

export const actionBtnStyle = {
  border: 'none',
  width: '28px',
  height: '28px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '13px',
  transition: 'all 0.1s ease'
};

export const dayFormSectionStyle = {
  backgroundColor: 'var(--bg-app)',
  padding: '15px',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  marginBottom: '15px',
  animation: 'fadeIn 0.2s ease-out'
};
