// src/components/image/FloatingPanels/ToolPanel.jsx
import { Box, Paper, Stack, Tooltip, IconButton, Typography, Collapse } from '@mui/material';
import { motion } from 'framer-motion';
import BlurOnOutlinedIcon from '@mui/icons-material/BlurOnOutlined';
import CropSquareOutlinedIcon from '@mui/icons-material/CropSquareOutlined';
import CenterFocusWeakOutlinedIcon from '@mui/icons-material/CenterFocusWeakOutlined';
import NearMeOutlinedIcon from '@mui/icons-material/NearMeOutlined';
import AdsClickOutlinedIcon from '@mui/icons-material/AdsClickOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { ICONE_ACTION, LISTE_ACTIONS, CONFIG_ACTIONS } from '../../image/configActions.js';
import { useState, useRef } from 'react';

export default function ToolPanel({ visible, onToggle, onAjouterAction, derniereTypeAjoute, position, onMove }) {
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
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
          height: 'auto',
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
            justifyContent: 'center',
            p: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            cursor: 'grab',
            bgcolor: 'action.hover',
            '&:active': { cursor: 'grabbing' },
          }}
        >
          <DragIndicatorIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', p: 2, gap: 2, justifyContent: 'center' }}>
          {LISTE_ACTIONS.map((type) => {
            const Icone = ICONE_ACTION[type];
            const vientEtreAjoute = derniereTypeAjoute === type;
            return (
              <Tooltip key={type} title={CONFIG_ACTIONS[type].label} arrow placement="top">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <IconButton
                    size="small"
                    onClick={() => onAjouterAction(type)}
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      bgcolor: vientEtreAjoute ? 'primary.50' : 'transparent',
                      color: vientEtreAjoute ? 'primary.main' : 'text.secondary',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'primary.50',
                        color: 'primary.main',
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    <Icone sx={{ fontSize: 32 }} />
                  </IconButton>
                  <Typography variant="caption" sx={{ fontSize: 12, mt: 1, color: 'text.secondary', textAlign: 'center', fontWeight: 500 }}>
                    {CONFIG_ACTIONS[type].label}
                  </Typography>
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      </Paper>
    </motion.div>
  );
}
