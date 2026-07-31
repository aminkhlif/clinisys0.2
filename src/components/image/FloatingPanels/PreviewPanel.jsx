// src/components/image/FloatingPanels/PreviewPanel.jsx
import { Box, Paper, Stack, Typography, IconButton, Tooltip, Switch, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

export default function PreviewPanel({ visible, onToggle, urlImage, zoom, onZoomChange, onFullscreen, showAnnotations, onToggleAnnotations }) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
    >
      <Paper
        variant="outlined"
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          width: 200,
          borderRadius: 2,
          bgcolor: 'background.paper',
          zIndex: 100,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            cursor: 'move',
            bgcolor: 'action.hover',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <DragIndicatorIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" fontWeight={600}>Aperçu</Typography>
          </Stack>
          <Tooltip title="Fermer" arrow>
            <IconButton size="small" onClick={onToggle} sx={{ p: 0.5 }}>
              <CloseIcon fontSize="small" sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ p: 1 }}>
          <Box
            component="img"
            src={urlImage}
            alt="Aperçu"
            sx={{
              width: '100%',
              height: 100,
              objectFit: 'contain',
              borderRadius: 1,
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
            }}
          />
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Tooltip title="Zoom arrière" arrow>
                <IconButton size="small" onClick={() => onZoomChange?.(-1)} sx={{ p: 0.5 }}>
                  <ZoomOutIcon fontSize="small" sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <Chip
                label={`${Math.round(zoom * 100)}%`}
                size="small"
                sx={{ height: 24, fontSize: '0.7rem', fontWeight: 600 }}
              />
              <Tooltip title="Zoom avant" arrow>
                <IconButton size="small" onClick={() => onZoomChange?.(1)} sx={{ p: 0.5 }}>
                  <ZoomInIcon fontSize="small" sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Stack>
            <Tooltip title="Plein écran" arrow>
              <IconButton size="small" onClick={onFullscreen} sx={{ p: 0.5 }}>
                <FullscreenIcon fontSize="small" sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Annotations</Typography>
            <Switch
              size="small"
              checked={showAnnotations}
              onChange={onToggleAnnotations}
            />
          </Stack>
        </Box>
      </Paper>
    </motion.div>
  );
}
