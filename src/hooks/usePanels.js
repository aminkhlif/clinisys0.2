// src/hooks/usePanels.js
import { useState, useEffect } from 'react';

const PANELS_DEFAUT = {
  outils: { visible: true, x: 16, y: 80 },
  proprietes: { visible: true, x: 300, y: 80 },
  historique: { visible: false, x: 300, y: 300 },
  calques: { visible: true, x: 16, y: 300 },
  apercu: { visible: false, x: 16, y: 500 },
};

export function usePanels() {
  const [panneaux, setPanneaux] = useState(() => {
    const sauvegarde = localStorage.getItem('panneaux');
    return sauvegarde ? JSON.parse(sauvegarde) : PANELS_DEFAUT;
  });

  useEffect(() => {
    localStorage.setItem('panneaux', JSON.stringify(panneaux));
  }, [panneaux]);

  const togglePanel = (id) => {
    setPanneaux((prev) => ({
      ...prev,
      [id]: { ...prev[id], visible: !prev[id].visible },
    }));
  };

  const movePanel = (id, x, y) => {
    setPanneaux((prev) => ({
      ...prev,
      [id]: { ...prev[id], x, y },
    }));
  };

  const resizePanel = (id, width, height) => {
    setPanneaux((prev) => ({
      ...prev,
      [id]: { ...prev[id], width, height },
    }));
  };

  const resetPanel = (id) => {
    setPanneaux((prev) => ({
      ...prev,
      [id]: { ...PANELS_DEFAUT[id], visible: prev[id].visible },
    }));
  };

  const estVisible = (id) => panneaux[id]?.visible ?? false;

  const getPosition = (id) => ({
    x: panneaux[id]?.x ?? PANELS_DEFAUT[id]?.x ?? 0,
    y: panneaux[id]?.y ?? PANELS_DEFAUT[id]?.y ?? 0,
  });

  return {
    panneaux,
    togglePanel,
    movePanel,
    resizePanel,
    resetPanel,
    estVisible,
    getPosition,
  };
}
