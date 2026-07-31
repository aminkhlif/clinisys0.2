// src/components/image/StatusBar/StatusBar.jsx
import { Box, Stack, Typography, Chip, Tooltip, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import LayersIcon from '@mui/icons-material/Layers';
import InfoIcon from '@mui/icons-material/Info';

export default function StatusBar({ image, zoom, dimensions, actionsCount, cursorPosition, onShowInfo }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 32,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          zIndex: 1000,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          {image && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <ImageOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {image.nom}
              </Typography>
              {dimensions && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  · {dimensions.largeur}×{dimensions.hauteur}px
                </Typography>
              )}
            </Stack>
          )}
          <Divider orientation="vertical" flexItem sx={{ height: 16 }} />
          <Stack direction="row" alignItems="center" spacing={1}>
            <LayersIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {actionsCount} annotation{actionsCount > 1 ? 's' : ''}
            </Typography>
          </Stack>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          {cursorPosition && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              X: {Math.round(cursorPosition.x)} · Y: {Math.round(cursorPosition.y)}
            </Typography>
          )}
          <Divider orientation="vertical" flexItem sx={{ height: 16 }} />
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <ZoomInIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {Math.round(zoom * 100)}%
            </Typography>
          </Stack>
          <Tooltip title="Informations" arrow>
            <Box
              sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onClick={onShowInfo}
            >
              <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            </Box>
          </Tooltip>
        </Stack>
      </Box>
    </motion.div>
  );
}
