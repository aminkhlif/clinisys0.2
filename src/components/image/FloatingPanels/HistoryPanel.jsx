// src/components/image/FloatingPanels/HistoryPanel.jsx
import { Box, Paper, Stack, Typography, IconButton, Tooltip, List, ListItem, ListItemText } from '@mui/material';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useState, useRef } from 'react';

export default function HistoryPanel({ visible, onToggle, historique, index, position, onMove }) {
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
            <Typography variant="subtitle2" fontWeight={600}>Historique</Typography>
          </Stack>
          <Tooltip title="Fermer" arrow>
            <IconButton size="small" onClick={onToggle}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ maxHeight: 220, overflow: 'auto' }}>
          <List dense>
            {historique.map((action, i) => (
              <ListItem
                key={i}
                selected={i === index}
                sx={{
                  cursor: 'pointer',
                  '&.Mui-selected': { bgcolor: 'primary.50' },
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ListItemText
                  primary={action.label || `Action ${i + 1}`}
                  secondary={action.timestamp}
                  primaryTypographyProps={{ variant: 'caption', fontWeight: i === index ? 600 : 'normal' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
            {historique.length === 0 && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Aucune action dans l'historique
                </Typography>
              </Box>
            )}
          </List>
        </Box>
      </Paper>
    </motion.div>
  );
}
