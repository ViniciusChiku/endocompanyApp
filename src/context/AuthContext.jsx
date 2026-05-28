import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, limit, query } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('Comum');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setUserRole('Comum');
    setUserData(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(true);
        try {
          const docRef = doc(db, 'usuarios', currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserRole(data.role || 'Comum');
            setUserData(data);
          } else {
            // Se o documento ainda não existe (ex: acabou de criar conta e o setDoc ainda está rodando),
            // definimos o role padrão como 'Comum' e aguardamos o handleCadastro concluir o setDoc.
            setUserRole('Comum');
            setUserData(null);
          }
        } catch (error) {
          console.error("Erro ao carregar permissões no AuthContext:", error);
          setUserRole('Comum');
        }
      } else {
        setUser(null);
        setUserRole('Comum');
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userRole,
    userData,
    setUserData,
    setUserRole,
    loading,
    logout: handleLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
