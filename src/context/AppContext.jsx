import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Estado que gerencia qual tela está ativa no painel principal
  const [telaAtual, setTelaAtual] = useState('painel');

  // Histórico de navegação virtual (botão voltar do navegador)
  useEffect(() => {
    // Configura o estado inicial se não houver
    if (!window.history.state) {
      window.history.replaceState({ screen: 'painel' }, '');
    }
  }, []);

  // Monitora mudanças na tela atual para atualizar o histórico virtual
  const handleSetTelaAtual = (tela) => {
    setTelaAtual(tela);
    const currentHistState = window.history.state;
    if (!currentHistState || currentHistState.screen !== tela) {
      window.history.pushState({ screen: tela }, '');
    }
  };

  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.screen) {
        setTelaAtual(event.state.screen);
      } else {
        setTelaAtual('painel');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const voltarPainel = () => {
    handleSetTelaAtual('painel');
  };

  const value = {
    telaAtual,
    setTelaAtual: handleSetTelaAtual,
    voltarPainel
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
}
