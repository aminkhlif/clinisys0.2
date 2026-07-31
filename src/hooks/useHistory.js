// src/hooks/useHistory.js
import { useState, useCallback } from 'react';

const HISTOIRE_MAX = 50;

export function useHistory() {
  const [historique, setHistorique] = useState([]);
  const [index, setIndex] = useState(-1);

  const ajouterAction = useCallback((action) => {
    setHistorique((prev) => {
      const nouveauHistorique = [...prev.slice(0, index + 1), action];
      if (nouveauHistorique.length > HISTOIRE_MAX) {
        nouveauHistorique.shift();
      }
      return nouveauHistorique;
    });
    setIndex((prev) => Math.min(prev + 1, HISTOIRE_MAX - 1));
  }, [index]);

  const annuler = useCallback(() => {
    if (index > 0) {
      setIndex((prev) => prev - 1);
      return historique[index - 1];
    }
    return null;
  }, [index, historique]);

  const retablir = useCallback(() => {
    if (index < historique.length - 1) {
      setIndex((prev) => prev + 1);
      return historique[index + 1];
    }
    return null;
  }, [index, historique]);

  const peutAnnuler = index > 0;
  const peutRetablir = index < historique.length - 1;

  const reinitialiser = useCallback(() => {
    setHistorique([]);
    setIndex(-1);
  }, []);

  return {
    historique,
    index,
    ajouterAction,
    annuler,
    retablir,
    peutAnnuler,
    peutRetablir,
    reinitialiser,
  };
}
