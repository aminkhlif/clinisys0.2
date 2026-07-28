// src/components/image/ActionOverlay.jsx
import { useRef, useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { CONFIG_ACTIONS } from './configActions.js';

const SEUIL_DEPLACEMENT_PX = 3;

function ActionOverlay({ action, echelle, limites, selectionnee, onSelect, onDeplace, onRedimensionne, onSupprime }) {
  const dragRef = useRef(null);
  const config = CONFIG_ACTIONS[action.type];
  // "enMouvement" ne devient vrai qu'après un vrai déplacement (pas sur un simple clic de sélection)
  const [enMouvement, setEnMouvement] = useState(false);
  const [survolee, setSurvolee] = useState(false);

  const gererDebutDrag = (e) => {
    e.stopPropagation();
    onSelect();
    const xDepart = e.clientX;
    const yDepart = e.clientY;
    const xInitial = action.x;
    const yInitial = action.y;
    const xMax = Math.max(0, limites.largeur - action.largeur);
    const yMax = Math.max(0, limites.hauteur - action.hauteur);
    let aBouge = false;

    const gererMouvement = (moveEvent) => {
      const ecartX = moveEvent.clientX - xDepart;
      const ecartY = moveEvent.clientY - yDepart;
      if (!aBouge && (Math.abs(ecartX) > SEUIL_DEPLACEMENT_PX || Math.abs(ecartY) > SEUIL_DEPLACEMENT_PX)) {
        aBouge = true;
        setEnMouvement(true);
      }
      if (!aBouge) return;

      const deltaX = ecartX / echelle;
      const deltaY = ecartY / echelle;
      const nouveauX = Math.min(Math.max(0, Math.round(xInitial + deltaX)), xMax);
      const nouveauY = Math.min(Math.max(0, Math.round(yInitial + deltaY)), yMax);
      onDeplace(action.id, nouveauX, nouveauY, false);
    };

    const gererFin = (upEvent) => {
      if (aBouge) {
        const deltaX = (upEvent.clientX - xDepart) / echelle;
        const deltaY = (upEvent.clientY - yDepart) / echelle;
        const nouveauX = Math.min(Math.max(0, Math.round(xInitial + deltaX)), xMax);
        const nouveauY = Math.min(Math.max(0, Math.round(yInitial + deltaY)), yMax);
        onDeplace(action.id, nouveauX, nouveauY, true);
      }
      setEnMouvement(false);
      document.removeEventListener('mousemove', gererMouvement);
      document.removeEventListener('mouseup', gererFin);
    };

    document.addEventListener('mousemove', gererMouvement);
    document.addEventListener('mouseup', gererFin);
  };

  const gererDebutResize = (e) => {
    e.stopPropagation();
    const xDepart = e.clientX;
    const yDepart = e.clientY;
    const largeurInitiale = action.largeur;
    const hauteurInitiale = action.hauteur;
    const largeurMax = limites.largeur - action.x;
    const hauteurMax = limites.hauteur - action.y;
    setEnMouvement(true);

    const gererMouvement = (moveEvent) => {
      const deltaX = (moveEvent.clientX - xDepart) / echelle;
      const deltaY = (moveEvent.clientY - yDepart) / echelle;
      const nouvelleLargeur = Math.min(Math.max(10, Math.round(largeurInitiale + deltaX)), largeurMax);
      const nouvelleHauteur = Math.min(Math.max(10, Math.round(hauteurInitiale + deltaY)), hauteurMax);
      onRedimensionne(action.id, nouvelleLargeur, nouvelleHauteur, false);
    };

    const gererFin = (upEvent) => {
      const deltaX = (upEvent.clientX - xDepart) / echelle;
      const deltaY = (upEvent.clientY - yDepart) / echelle;
      const nouvelleLargeur = Math.min(Math.max(10, Math.round(largeurInitiale + deltaX)), largeurMax);
      const nouvelleHauteur = Math.min(Math.max(10, Math.round(hauteurInitiale + deltaY)), hauteurMax);
      onRedimensionne(action.id, nouvelleLargeur, nouvelleHauteur, true);
      setEnMouvement(false);
      document.removeEventListener('mousemove', gererMouvement);
      document.removeEventListener('mouseup', gererFin);
    };

    document.addEventListener('mousemove', gererMouvement);
    document.addEventListener('mouseup', gererFin);
  };

  const couleurFond = config.couleur
    ? (action.couleur || config.couleurDefaut)
    : config.couleurAffichage;

  const estCurseur = action.type.startsWith('CURSEUR');
  const estRectangleOuFocus = action.type === 'RECTANGLE' || action.type === 'FOCUS';
  const estFlou = action.type === 'FLOU';

  // Convertit une couleur hex en rgba pour un remplissage translucide (jamais de bloc opaque)
  const versRgbaLeger = (hex, alpha) => {
    if (!hex || !hex.startsWith('#')) return `rgba(59,130,246,${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  // Seul le flou (backdrop-filter, coûteux) est simplifié pendant un vrai déplacement.
  // Rectangle / Focus / Curseur gardent EXACTEMENT le même rendu, qu'on clique ou qu'on déplace :
  // ça évite tout effet de "disparition" au clic.
  return (
    <Box
      ref={dragRef}
      onMouseDown={gererDebutDrag}
      onMouseEnter={() => setSurvolee(true)}
      onMouseLeave={() => setSurvolee(false)}
      sx={{
        position: 'absolute',
        left: action.x * echelle,
        top: action.y * echelle,
        width: action.largeur * echelle,
        height: action.hauteur * echelle,
        border: selectionnee
          ? '2px dashed #000000'
          : `1.5px solid ${estRectangleOuFocus ? couleurFond : 'rgba(0,0,0,0.25)'}`,
        backgroundColor: estFlou
          ? 'rgba(255,255,255,0.05)'
          : estRectangleOuFocus
            ? versRgbaLeger(couleurFond, 0.14)
            : 'transparent',
        backdropFilter: estFlou && !enMouvement ? `blur(${action.intensite || 8}px)` : 'none',
        WebkitBackdropFilter: estFlou && !enMouvement ? `blur(${action.intensite || 8}px)` : 'none',
        borderRadius: estCurseur ? '50%' : 2,
        cursor: 'move',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        willChange: 'left, top, width, height',
        boxShadow: selectionnee
          ? '0 0 0 4px rgba(18,18,18,0.08)'
          : survolee
            ? '0 0 0 3px rgba(18,18,18,0.05)'
            : 'none',
        // La transition ne s'applique jamais pendant un drag/resize (sinon effet de "retard"
        // visible au relâchement) ; elle n'anime que le survol/la sélection au repos.
        transition: enMouvement ? 'none' : 'box-shadow 120ms ease, border-color 120ms ease',
      }}
    >
      {estCurseur && (
        <Box
          sx={{
            width: '60%',
            height: '60%',
            backgroundColor: couleurFond,
            clipPath: 'polygon(0 0, 0 80%, 30% 60%, 45% 100%, 65% 90%, 45% 55%, 80% 55%)',
            filter: selectionnee || survolee ? 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))' : 'none',
          }}
        />
      )}

      {selectionnee && (
        <>
          <Tooltip title="Supprimer" arrow>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onSupprime(action.id); }}
              sx={{
                position: 'absolute',
                top: -16,
                right: -16,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                width: 24,
                height: 24,
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                transition: 'background-color 120ms ease, transform 120ms ease',
                '&:hover': { bgcolor: '#fee2e2', transform: 'scale(1.08)' },
              }}
            >
              <CloseIcon sx={{ fontSize: 14, color: 'grey.900' }} />
            </IconButton>
          </Tooltip>
          <Box
            onMouseDown={gererDebutResize}
            sx={{
              position: 'absolute',
              bottom: -6,
              right: -6,
              width: 14,
              height: 14,
              bgcolor: '#000000',
              border: '2px solid white',
              borderRadius: '50%',
              cursor: 'nwse-resize',
              boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
              transition: 'transform 120ms ease',
              '&:hover': { transform: 'scale(1.2)' },
            }}
          />
        </>
      )}
    </Box>
  );
}

export default ActionOverlay;