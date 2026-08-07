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

  const connecter = async (identifiant, motDePasse) => {
    const res = await axiosClient.post('/auth/login', { identifiant, motDePasse });
    setUtilisateur(res.data);
    return res.data;
  };

  const inscrire = async (nomUtilisateur, email, motDePasse) => {
    const res = await axiosClient.post('/auth/register', { nomUtilisateur, email, motDePasse });
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

  const changerNomUtilisateur = async (motDePasse, nouveauNomUtilisateur) => {
    const res = await axiosClient.patch('/auth/change-username', { motDePasse, nouveauNomUtilisateur });
    setUtilisateur(res.data);
    return res.data;
  };

  const demanderResetMotDePasse = async (email) => {
    await axiosClient.post('/auth/forgot-password', { email });
  };

  const reinitialiserMotDePasse = async (token, nouveauMotDePasse) => {
    await axiosClient.post('/auth/reset-password', { token, nouveauMotDePasse });
  };

  const ajouterEmail = async (email) => {
    const res = await axiosClient.patch('/auth/add-email', { email });
    setUtilisateur(res.data);
    return res.data;
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
        changerNomUtilisateur,
        demanderResetMotDePasse,
        reinitialiserMotDePasse,
        ajouterEmail,
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