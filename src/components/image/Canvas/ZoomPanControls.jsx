// src/components/image/Canvas/ZoomPanControls.jsx
import { Box, Stack, Tooltip, IconButton, Typography, Button } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';

const NIVEAUX_ZOOM = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];

export default function ZoomPanControls({ zoom, onZoomChange, onFit, onFitWidth, onFitHeight }) {
  const zoomer = (sens) => {
    const indexActuel = NIVEAUX_ZOOM.reduce(
      (plusProche, val, i) => (Math.abs(val - zoom) < Math.abs(NIVEAUX_ZOOM[plusProche] - zoom) ? i : plusProche),
      0,
    );
    const nouvelIndex = Math.min(Math.max(indexActuel + sens, 0), NIVEAUX_ZOOM.length - 1);
    onZoomChange(NIVEAUX_ZOOM[nouvelIndex]);
  };

  const zoomMin = zoom <= NIVEAUX_ZOOM[0];
  const zoomMax = zoom >= NIVEAUX_ZOOM[NIVEAUX_ZOOM.length - 1];
  const zoomAjuste = zoom === 1;

  return (
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
      <Tooltip title="Zoom arrière (Ctrl+-)" arrow>
        <span>
          <IconButton size="small" onClick={() => zoomer(-1)} disabled={zoomMin}>
            <ZoomOutIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Box
        component="button"
        onClick={() => onZoomChange(1)}
        sx={{
          border: 'none',
          bgcolor: 'transparent',
          cursor: 'pointer',
          fontSize: '0.75rem',
          color: zoomAjuste ? 'text.secondary' : 'text.primary',
          fontWeight: 700,
          minWidth: 44,
          fontFamily: 'inherit',
          transition: 'color 120ms ease',
          '&:hover': { color: 'text.primary' },
        }}
      >
        {Math.round(zoom * 100)}%
      </Box>
      <Tooltip title="Zoom avant (Ctrl++)" arrow>
        <span>
          <IconButton size="small" onClick={() => zoomer(1)} disabled={zoomMax}>
            <ZoomInIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Ajuster au cadre (Ctrl+0)" arrow>
        <span>
          <IconButton size="small" onClick={onFit} disabled={zoomAjuste}>
            <ZoomOutMapIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Ajuster à la largeur" arrow>
        <span>
          <IconButton size="small" onClick={onFitWidth}>
            <CenterFocusStrongIcon fontSize="small" sx={{ transform: 'rotate(-90deg)' }} />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Ajuster à la hauteur" arrow>
        <span>
          <IconButton size="small" onClick={onFitHeight}>
            <CenterFocusStrongIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}
