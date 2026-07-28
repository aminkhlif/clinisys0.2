// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axiosClient, { definirGestionnaireEchecAuth } from '../api/axiosClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargementInitial, setChargementInitial] = useState(true);

  const chargerUtilisateurCourant = useCallback(async () => {
    try {
      const res = await axiosClient.get('/auth/me');
      setUtilisateur(res.data);
    } catch {
      setUtilisateur(null);
    } finally {
      setChargementInitial(false);
    }
  }, []);

  useEffect(() => {
    chargerUtilisateurCourant();
    // Si le refresh token lui-même est expiré (ex: après 7 jours d'inactivité),
    // axiosClient appelle ce callback pour vider la session côté front.
    definirGestionnaireEchecAuth(() => setUtilisateur(null));
  }, [chargerUtilisateurCourant]);

  const connecter = async (nomUtilisateur, motDePasse) => {
    const res = await axiosClient.post('/auth/login', { nomUtilisateur, motDePasse });
    setUtilisateur(res.data);
    return res.data;
  };

  const inscrire = async (nomUtilisateur, motDePasse) => {
    const res = await axiosClient.post('/auth/register', { nomUtilisateur, motDePasse });
    setUtilisateur(res.data);
    return res.data;
  };

  const deconnecter = async () => {
    try {
      await axiosClient.post('/auth/logout');
    } finally {
      setUtilisateur(null);
    }
  };

  const changerMotDePasse = async (ancienMotDePasse, nouveauMotDePasse) => {
    await axiosClient.patch('/auth/change-password', { ancienMotDePasse, nouveauMotDePasse });
  };

  return (
    <AuthContext.Provider
      value={{
        utilisateur,
        estAuthentifie: Boolean(utilisateur),
        estAdmin: utilisateur?.role === 'ADMIN',
        chargementInitial,
        connecter,
        inscrire,
        deconnecter,
        changerMotDePasse,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexte = useContext(AuthContext);
  if (!contexte) {
    throw new Error('useAuth doit être utilisé à l\'intérieur de <AuthProvider>');
  }
  return contexte;
}