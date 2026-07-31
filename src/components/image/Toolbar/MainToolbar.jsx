// src/components/image/Toolbar/MainToolbar.jsx
import { Box, Stack, Tooltip, IconButton, Divider, Typography, Chip, Badge } from '@mui/material';
import { motion } from 'framer-motion';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import HistoryIcon from '@mui/icons-material/History';
import LayersIcon from '@mui/icons-material/Layers';
import TuneIcon from '@mui/icons-material/Tune';
import BuildIcon from '@mui/icons-material/Build';
import HelpIcon from '@mui/icons-material/Help';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';

export default function MainToolbar({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSave,
  onDelete,
  onZoomIn,
  onZoomOut,
  onFitScreen,
  onToggleHistory,
  onToggleLayers,
  onToggleProperties,
  onToggleTools,
  onHelp,
  zoom = 1,
  activePanels = {},
}) {
  const toolbarGroups = [
    {
      items: [
        { icon: UndoIcon, tooltip: 'Annuler (Ctrl+Z)', onClick: onUndo, disabled: !canUndo, badge: canUndo },
        { icon: RedoIcon, tooltip: 'Rétablir (Ctrl+Y)', onClick: onRedo, disabled: !canRedo, badge: canRedo },
      ],
    },
    {
      items: [
        { icon: SaveIcon, tooltip: 'Sauvegarder (Ctrl+S)', onClick: onSave, color: 'success' },
        { icon: DeleteIcon, tooltip: 'Supprimer (Suppr)', onClick: onDelete, color: 'error' },
      ],
    },
    {
      items: [
        { icon: ZoomOutIcon, tooltip: 'Zoom arrière (Ctrl+-)', onClick: onZoomOut },
        { icon: ZoomInIcon, tooltip: 'Zoom avant (Ctrl++)', onClick: onZoomIn },
        { icon: FitScreenIcon, tooltip: 'Fit to screen (F)', onClick: onFitScreen },
      ],
    },
    {
      items: [
        { icon: HistoryIcon, tooltip: 'Historique (H)', onClick: onToggleHistory, active: activePanels.historique },
        { icon: LayersIcon, tooltip: 'Calques (L)', onClick: onToggleLayers, active: activePanels.calques },
        { icon: TuneIcon, tooltip: 'Propriétés (P)', onClick: onToggleProperties, active: activePanels.proprietes },
        { icon: BuildIcon, tooltip: 'Outils (T)', onClick: onToggleTools, active: activePanels.outils },
      ],
    },
    {
      items: [
        { icon: HelpIcon, tooltip: 'Aide (?)', onClick: onHelp },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1.5,
          py: 0.75,
          bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(30,30,30,0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)',
        }}
      >
        {toolbarGroups.map((group, groupIndex) => (
          <Stack key={groupIndex} direction="row" spacing={0.5} alignItems="center">
            {group.items.map((item, itemIndex) => (
              <Tooltip key={itemIndex} title={item.tooltip} arrow placement="bottom">
                <span>
                  <Badge
                    color={item.color || 'primary'}
                    variant="dot"
                    invisible={!item.active}
                    sx={{
                      '& .MuiBadge-dot': {
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                      },
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={item.onClick}
                      disabled={item.disabled}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.5,
                        bgcolor: item.active ? 'primary.50' : 'transparent',
                        color: item.active ? 'primary.main' : 'text.secondary',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: item.active ? '1px solid' : '1px solid transparent',
                        borderColor: item.active ? 'primary.main' : 'transparent',
                        '&:hover:not(:disabled)': {
                          bgcolor: item.color ? `${item.color}.10` : 'primary.50',
                          color: item.color ? `${item.color}.main` : 'primary.main',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        },
                        '&:active:not(:disabled)': {
                          transform: 'translateY(0) scale(0.95)',
                        },
                        '&:disabled': {
                          opacity: 0.4,
                        },
                      }}
                    >
                      <item.icon fontSize="small" />
                    </IconButton>
                  </Badge>
                </span>
              </Tooltip>
            ))}
            {groupIndex < toolbarGroups.length - 1 && (
              <Divider orientation="vertical" flexItem sx={{ height: 20, mx: 0.75, borderColor: 'divider' }} />
            )}
          </Stack>
        ))}
        
        {/* Zoom Level Indicator */}
        <Divider orientation="vertical" flexItem sx={{ height: 20, mx: 0.75, borderColor: 'divider' }} />
        <Chip
          label={`${Math.round(zoom * 100)}%`}
          size="small"
          sx={{
            height: 24,
            fontSize: '0.7rem',
            fontWeight: 600,
            bgcolor: 'action.hover',
            color: 'text.secondary',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              bgcolor: 'action.selected',
            },
          }}
          onClick={onFitScreen}
        />
      </Box>
    </motion.div>
  );
}
