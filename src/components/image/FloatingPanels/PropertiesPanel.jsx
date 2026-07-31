// src/components/image/FloatingPanels/PropertiesPanel.jsx
import { Box, Paper, Stack, Typography, IconButton, Tooltip, Grid, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { CONFIG_ACTIONS } from '../../image/configActions.js';
import { useState, useRef } from 'react';

const PRESET_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#000000'];

export default function PropertiesPanel({ visible, onToggle, actionSelectionnee, couleurChoisie, onChangeCouleur, position, onMove }) {
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const startPosRef = useRef({ x: 0, y: 0 });

  if (!visible || !actionSelectionnee) return null;

  const config = CONFIG_ACTIONS[actionSelectionnee.type];
  const accepteCouleur = config?.couleur;

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    startPosRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - startPosRef.current.x;
    const newY = e.clientY - startPosRef.current.y;
    onMove(newX, newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <Paper
        variant="outlined"
        sx={{
          position: 'absolute',
          left: position.x,
          top: position.y,
          width: 280,
          borderRadius: 2,
          bgcolor: 'background.paper',
          zIndex: isDragging ? 200 : 100,
          boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.1)',
          cursor: isDragging ? 'grabbing' : 'default',
        }}
      >
        <Box
          ref={dragRef}
          onMouseDown={handleMouseDown}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            cursor: 'grab',
            bgcolor: 'action.hover',
            '&:active': { cursor: 'grabbing' },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <DragIndicatorIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="subtitle2" fontWeight={600}>Propriétés</Typography>
          </Stack>
          <Tooltip title="Fermer" arrow>
            <IconButton size="small" onClick={onToggle}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ p: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1.5 }}>
            Type: {config?.label || actionSelectionnee.type}
          </Typography>
          
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
            Position: X: {Math.round(actionSelectionnee.x)}, Y: {Math.round(actionSelectionnee.y)}
          </Typography>
          
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
            Taille: {Math.round(actionSelectionnee.largeur)} × {Math.round(actionSelectionnee.hauteur)}
          </Typography>

          {accepteCouleur && (
            <>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1.5 }}>
                Couleur
              </Typography>
              <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                {PRESET_COLORS.map((c) => {
                  const isSelected = (actionSelectionnee.couleur || couleurChoisie).toUpperCase() === c;
                  return (
                    <Box
                      key={c}
                      onClick={() => onChangeCouleur(c)}
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: c,
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: isSelected ? 'primary.main' : 'transparent',
                        boxShadow: isSelected ? '0 0 0 2px rgba(59,130,246,0.2)' : '0 1px 3px rgba(0,0,0,0.1)',
                        transition: 'transform 0.1s, border-color 0.1s',
                        '&:hover': { transform: 'scale(1.15)' },
                      }}
                    />
                  );
                })}
                <Box
                  component="input"
                  type="color"
                  value={actionSelectionnee.couleur || couleurChoisie}
                  onChange={(e) => onChangeCouleur(e.target.value)}
                  sx={{
                    ml: 'auto',
                    width: 28,
                    height: 28,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 0,
                    cursor: 'pointer',
                    bgcolor: 'transparent',
                    '&::-webkit-color-swatch-wrapper': { p: 0 },
                    '&::-webkit-color-swatch': { border: 'none', borderRadius: 0.5 },
                  }}
                />
              </Stack>
            </>
          )}

          {actionSelectionnee.intensite && (
            <>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1.5 }}>
                Intensité: {actionSelectionnee.intensite}
              </Typography>
            </>
          )}
        </Box>
      </Paper>
    </motion.div>
  );
}
