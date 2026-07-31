// src/components/image/ImageEditorCanvas.jsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, IconButton, Stack, Tooltip, CircularProgress, Typography, Button } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import ActionOverlay from './ActionOverlay.jsx';

const NIVEAUX_ZOOM = [0.5, 0.75, 1, 1.25, 1.5, 2];

function ImageEditorCanvas({
  urlImage, actions, onDeplace, onRedimensionne, onSupprime,
  actionSelectionneeId, onSelectionnerAction, maxHeight = 420, onDimensionsChargees,
  zoom = 1, onZoomChange, onCursorPosition,
}) {
  const imgRef = useRef(null);
  const conteneurRef = useRef(null);
  const [dimensionsNaturelles, setDimensionsNaturelles] = useState({ largeur: 0, hauteur: 0 });
  const [largeurDisponible, setLargeurDisponible] = useState(0);
  const [chargementImage, setChargementImage] = useState(true);
  const [erreurChargement, setErreurChargement] = useState(false);
  const [cleReessai, setCleReessai] = useState(0);

  // Largeur réellement disponible pour le canvas (recalculée au montage et au resize)
  useEffect(() => {
    const recalculerLargeur = () => {
      if (conteneurRef.current) {
        setLargeurDisponible(conteneurRef.current.clientWidth);
      }
    };
    recalculerLargeur();
    window.addEventListener('resize', recalculerLargeur);
    return () => window.removeEventListener('resize', recalculerLargeur);
  }, []);

  useEffect(() => {
    setChargementImage(true);
    setErreurChargement(false);

    // Filet de sécurité : si "load" ne se déclenche jamais pour une raison quelconque
    // (image déjà en cache décodée par le navigateur, cas limite), on ne laisse jamais
    // le spinner tourner indéfiniment.
    const delaiSecurite = setTimeout(() => setChargementImage(false), 4000);
    return () => clearTimeout(delaiSecurite);
  }, [urlImage, cleReessai]);

  const gererErreurImage = useCallback(() => {
    setChargementImage(false);
    setErreurChargement(true);
  }, []);

  const gererChargementImage = useCallback((e) => {
    const dims = {
      largeur: e.target.naturalWidth,
      hauteur: e.target.naturalHeight,
    };
    setDimensionsNaturelles(dims);
    setChargementImage(false);
    onDimensionsChargees?.(dims);
  }, [onDimensionsChargees]);

  const reessayer = () => {
    setCleReessai((c) => c + 1);
  };

  // Échelle réelle et unique source de vérité pour positionner les annotations :
  // "ajusté" (zoom=1) = l'image occupe toute la largeur disponible, plafonnée par maxHeight.
  // Le zoom multiplie ensuite cette base — jamais de distorsion, jamais de désalignement.
  const echelleAjustee = dimensionsNaturelles.largeur > 0
    ? Math.min(
        largeurDisponible / dimensionsNaturelles.largeur,
        typeof maxHeight === 'number' ? maxHeight / dimensionsNaturelles.hauteur : Infinity,
      )
    : 1;
  const echelle = echelleAjustee * zoom;

  const largeurAffichee = dimensionsNaturelles.largeur * echelle;
  const hauteurAffichee = dimensionsNaturelles.hauteur * echelle;

  const zoomer = (sens) => {
    if (onZoomChange) {
      const indexActuel = NIVEAUX_ZOOM.reduce(
        (plusProche, val, i) => (Math.abs(val - zoom) < Math.abs(NIVEAUX_ZOOM[plusProche] - zoom) ? i : plusProche),
        0,
      );
      const nouvelIndex = Math.min(Math.max(indexActuel + sens, 0), NIVEAUX_ZOOM.length - 1);
      onZoomChange(NIVEAUX_ZOOM[nouvelIndex]);
    }
  };

  // Suppression au clavier de l'annotation sélectionnée (Suppr / Retour arrière),
  // désélection avec Échap.
  useEffect(() => {
    const gererClavier = (e) => {
      const cible = e.target;
      const estDansUnChamp = cible.tagName === 'INPUT' || cible.tagName === 'TEXTAREA';
      if (estDansUnChamp) return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && actionSelectionneeId) {
        e.preventDefault();
        onSupprime(actionSelectionneeId);
      } else if (e.key === 'Escape') {
        onSelectionnerAction(null);
      }
    };
    window.addEventListener('keydown', gererClavier);
    return () => window.removeEventListener('keydown', gererClavier);
  }, [actionSelectionneeId, onSupprime, onSelectionnerAction]);

  const zoomMin = zoom <= NIVEAUX_ZOOM[0];
  const zoomMax = zoom >= NIVEAUX_ZOOM[NIVEAUX_ZOOM.length - 1];
  const zoomAjuste = zoom === 1;

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {actions.length > 0 && !chargementImage && !erreurChargement
            ? 'Glissez pour déplacer · Suppr pour effacer'
            : ''}
        </Typography>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.25}
          sx={{
            bgcolor: 'action.hover',
            borderRadius: 2,
            p: 0.25,
          }}
        >
          <Tooltip title="Zoom arrière" arrow>
            <span>
              <IconButton size="small" onClick={() => zoomer(-1)} disabled={zoomMin}>
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Box
            component="button"
            onClick={() => onZoomChange?.(1)}
            sx={{
              border: 'none', bgcolor: 'transparent', cursor: 'pointer', fontSize: '0.75rem',
              color: zoomAjuste ? 'text.secondary' : 'text.primary',
              fontWeight: 700, minWidth: 44, fontFamily: 'inherit',
              transition: 'color 120ms ease',
              '&:hover': { color: 'text.primary' },
            }}
          >
            {Math.round(zoom * 100)}%
          </Box>
          <Tooltip title="Zoom avant" arrow>
            <span>
              <IconButton size="small" onClick={() => zoomer(1)} disabled={zoomMax}>
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Ajuster au cadre" arrow>
            <span>
              <IconButton size="small" onClick={() => onZoomChange?.(1)} disabled={zoomAjuste}>
                <ZoomOutMapIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      <Box
        ref={conteneurRef}
        sx={{
          position: 'relative',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: (theme) => theme.palette.mode === 'light' ? '#FAFAFA' : '#111111',
          overflow: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: (theme) => theme.palette.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: (theme) => theme.palette.mode === 'light' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
          },
          minHeight: chargementImage && !dimensionsNaturelles.largeur ? 240 : 'auto',
          maxHeight: typeof maxHeight === 'number' ? maxHeight : maxHeight,
          transition: 'border-color 140ms ease',
        }}
        onMouseDown={(e) => { if (e.target === e.currentTarget) onSelectionnerAction(null); }}
        onDragStart={(e) => e.preventDefault()}
        onMouseMove={(e) => {
          if (onCursorPosition && conteneurRef.current) {
            const rect = conteneurRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / echelle;
            const y = (e.clientY - rect.top) / echelle;
            onCursorPosition({ x, y });
          }
        }}
      >
        {chargementImage && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 2,
              width: 28,
              height: 28,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.92)',
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <CircularProgress size={14} thickness={5} sx={{ color: 'grey.500' }} />
          </Box>
        )}
        {erreurChargement && !chargementImage && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
            <Box sx={{ textAlign: 'center' }}>
              <BrokenImageOutlinedIcon sx={{ fontSize: 32, color: 'grey.400', mb: 1 }} />
              <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', mb: 1.5 }}>
                Impossible d'afficher cette image
              </Typography>
              <Button
                size="small"
                startIcon={<RefreshOutlinedIcon fontSize="small" />}
                onClick={reessayer}
                sx={{ textTransform: 'none' }}
              >
                Réessayer
              </Button>
            </Box>
          </Box>
        )}
        <Box
          sx={{
            position: 'relative',
            width: largeurAffichee || '100%',
            height: hauteurAffichee || 'auto',
            mx: 'auto',
            display: erreurChargement ? 'none' : 'block',
            opacity: chargementImage ? 0 : 1,
            transition: 'opacity 200ms ease',
          }}
        >
          <Box
            component="img"
            ref={imgRef}
            src={urlImage}
            alt="édition"
            onLoad={gererChargementImage}
            onError={gererErreurImage}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            sx={{
              width: '100%',
              height: '100%',
              display: 'block',
              userSelect: 'none',
              WebkitUserDrag: 'none',
              pointerEvents: 'none',
            }}
          />
          {actions.filter(action => action.visible !== false).map((action) => (
            <ActionOverlay
              key={action.id}
              action={action}
              echelle={echelle}
              limites={dimensionsNaturelles}
              selectionnee={actionSelectionneeId === action.id}
              onSelect={() => onSelectionnerAction(action.id)}
              onDeplace={onDeplace}
              onRedimensionne={onRedimensionne}
              onSupprime={onSupprime}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default ImageEditorCanvas;