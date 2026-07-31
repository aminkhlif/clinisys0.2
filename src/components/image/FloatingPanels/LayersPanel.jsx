// src/components/image/FloatingPanels/LayersPanel.jsx
import { Box, Paper, Stack, Typography, IconButton, Tooltip, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { ICONE_ACTION } from '../../image/configActions.js';
import { useState, useRef } from 'react';

export default function LayersPanel({ visible, onToggle, actions, actionSelectionneeId, onSelectionnerAction, onToggleVisibility, onToggleLock, position, onMove }) {
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const startPosRef = useRef({ x: 0, y: 0 });

  if (!visible) return null;

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
          maxHeight: 300,
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
            <Typography variant="subtitle2" fontWeight={600}>Calques</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              ({actions.length})
            </Typography>
          </Stack>
          <Tooltip title="Fermer" arrow>
            <IconButton size="small" onClick={onToggle}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ maxHeight: 220, overflow: 'auto' }}>
          <List dense>
            {[...actions].reverse().map((action, i) => {
              const Icone = ICONE_ACTION[action.type];
              const isSelected = action.id === actionSelectionneeId;
              return (
                <ListItemButton
                  key={action.id}
                  selected={isSelected}
                  onClick={() => onSelectionnerAction(action.id)}
                  sx={{
                    py: 1,
                    '&.Mui-selected': { bgcolor: 'primary.50' },
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
                    <Icone sx={{ fontSize: 18, color: isSelected ? 'primary.main' : 'text.secondary' }} />
                    <ListItemText
                      primary={`Annotation ${actions.length - i}`}
                      secondary={action.type}
                      primaryTypographyProps={{ variant: 'caption', fontWeight: isSelected ? 600 : 'normal' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </Stack>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Visibilité" arrow>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleVisibility?.(action.id);
                        }}
                      >
                        {action.visible !== false ? (
                          <VisibilityIcon fontSize="small" sx={{ fontSize: 16 }} />
                        ) : (
                          <VisibilityOffIcon fontSize="small" sx={{ fontSize: 16 }} />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Verrouiller" arrow>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLock?.(action.id);
                        }}
                      >
                        {action.locked ? (
                          <LockIcon fontSize="small" sx={{ fontSize: 16 }} />
                        ) : (
                          <LockOpenIcon fontSize="small" sx={{ fontSize: 16 }} />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </ListItemButton>
              );
            })}
            {actions.length === 0 && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Aucune annotation
                </Typography>
              </Box>
            )}
          </List>
        </Box>
      </Paper>
    </motion.div>
  );
}
