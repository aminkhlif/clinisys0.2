// src/components/image/Toolbar/ContextMenu.jsx
import { Box, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FlipToFrontIcon from '@mui/icons-material/FlipToFront';
import FlipToBackIcon from '@mui/icons-material/FlipToBack';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

export default function ContextMenu({
  anchorPosition,
  open,
  onClose,
  onCopy,
  onPaste,
  onDelete,
  onEdit,
  onLock,
  onUnlock,
  onShow,
  onHide,
  onBringToFront,
  onSendToBack,
  onZoomIn,
  onZoomOut,
  canPaste,
  hasSelection,
  isLocked,
  isVisible,
}) {
  const handleAction = (action) => {
    action();
    onClose();
  };

  return (
    <Menu
      anchorPosition={anchorPosition}
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      PaperProps={{
        sx: {
          minWidth: 220,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        },
      }}
      TransitionProps={{
        component: motion.div,
        variants: {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 },
        },
        initial: 'initial',
        animate: 'animate',
        exit: 'exit',
        transition: { duration: 0.15 },
      }}
    >
      {hasSelection && (
        <>
          <MenuItem onClick={() => handleAction(onCopy)}>
            <ListItemIcon>
              <ContentCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Copier</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleAction(onPaste)} disabled={!canPaste}>
            <ListItemIcon>
              <ContentPasteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Coller</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleAction(onEdit)}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Modifier</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleAction(onDelete)}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Supprimer</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleAction(isLocked ? onUnlock : onLock)}>
            <ListItemIcon>
              {isLocked ? <LockOpenIcon fontSize="small" /> : <LockIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText>{isLocked ? 'Déverrouiller' : 'Verrouiller'}</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleAction(isVisible ? onHide : onShow)}>
            <ListItemIcon>
              {isVisible ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText>{isVisible ? 'Masquer' : 'Afficher'}</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleAction(onBringToFront)}>
            <ListItemIcon>
              <FlipToFrontIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Avant-plan</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleAction(onSendToBack)}>
            <ListItemIcon>
              <FlipToBackIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Arrière-plan</ListItemText>
          </MenuItem>
          <Divider />
        </>
      )}
      <MenuItem onClick={() => handleAction(onZoomIn)}>
        <ListItemIcon>
          <ZoomInIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Zoom avant</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => handleAction(onZoomOut)}>
        <ListItemIcon>
          <ZoomOutIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Zoom arrière</ListItemText>
      </MenuItem>
    </Menu>
  );
}
