// src/components/menu/MenuItem.jsx
import { Box, ListItemButton, ListItemText, IconButton, Collapse, List, Stack, Chip, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SousMenuItem from '../sousMenu/SousMenuItem.jsx';

function MenuItem({
  menu,
  ouvert,
  sousMenus,
  sousMenuIdActif,
  onToggle,
  onEdit,
  onDelete,
  onAjouterSousMenu,
  onEditSousMenu,
  onDeleteSousMenu,
  onSelectSousMenu,
}) {
  const sousMenusCount = sousMenus.length;
  const totalImages = sousMenus.reduce((sum, sm) => sum + (sm.nombreImages || 0), 0);

  return (
    <Box 
      sx={{ 
        mb: 0.5,
        ...(ouvert && {
          bgcolor: 'rgba(0, 0, 0, 0.02)',
          borderRadius: 1.5,
          borderLeft: '2px solid primary.main',
          pl: 0.5,
        })
      }}
    >
      <ListItemButton
        onClick={onToggle}
        sx={{
          color: 'text.primary',
          borderRadius: 1.5,
          py: 1,
          bgcolor: ouvert ? 'action.selected' : 'transparent',
          '&:hover': { bgcolor: 'action.hover' },
          '& .row-actions': { opacity: 0 },
          '&:hover .row-actions': { opacity: 1 },
        }}
      >
        <ListItemText
          primary={menu.nom}
          sx={{ flex: 1, minWidth: 0 }}
          slotProps={{ primary: { sx: { fontWeight: 500, fontSize: '0.875rem' } } }}
        />
        <Stack direction="row" spacing={0.5} className="row-actions" sx={{ transition: 'opacity 120ms ease', alignItems: 'center', flexShrink: 0, display: 'flex' }}>
          {sousMenusCount > 0 && (
            <Chip
              label={sousMenusCount}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                fontWeight: 600,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            />
          )}
          {totalImages > 0 && (
            <Chip
              label={totalImages}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                fontWeight: 600,
                bgcolor: 'action.selected',
                color: 'text.primary',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            />
          )}
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onEdit(menu); }}
            sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'action.hover' } }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onDelete(menu); }}
            sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: 'rgba(239,68,68,0.08)' } }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
        <ExpandMoreIcon
          fontSize="small"
          sx={{
            color: 'text.disabled',
            transform: ouvert ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 160ms ease',
            ml: 0.5,
            flexShrink: 0,
          }}
        />
      </ListItemButton>

      <Collapse in={ouvert} timeout={{ enter: 300, exit: 200 }} unmountOnExit>
        <Box sx={{ position: 'relative' }}>
          {/* Vertical connection line */}
          <Box
            sx={{
              position: 'absolute',
              left: 12,
              top: 0,
              bottom: 0,
              width: '1px',
              bgcolor: 'text.primary',
              opacity: 0.4,
              zIndex: 0,
            }}
          />
          <List component="div" disablePadding dense>
            {sousMenus.map((sousMenu, index) => (
              <Box key={sousMenu.id} sx={{ position: 'relative' }}>
                {/* Horizontal connector line for each submenu */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    width: 8,
                    height: '1px',
                    bgcolor: 'text.primary',
                    opacity: 0.4,
                    zIndex: 0,
                  }}
                />
                <SousMenuItem
                  sousMenu={sousMenu}
                  selectionne={sousMenuIdActif === String(sousMenu.id)}
                  onSelect={() => onSelectSousMenu(sousMenu.id)}
                  onEdit={() => onEditSousMenu(sousMenu)}
                  onDelete={() => onDeleteSousMenu(sousMenu)}
                />
              </Box>
            ))}
            <Box sx={{ position: 'relative' }}>
              <Box
                sx={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  width: 8,
                  height: '1px',
                  bgcolor: 'text.primary',
                  opacity: 0.4,
                  zIndex: 0,
                }}
              />
              <ListItemButton
                sx={{
                  pl: 5,
                  borderRadius: 1.5,
                  color: 'text.secondary',
                  transition: 'all 200ms ease',
                  '&:hover': { 
                    color: 'primary.main', 
                    bgcolor: 'action.hover',
                    transform: 'translateX(2px)'
                  },
                }}
                onClick={() => onAjouterSousMenu(menu.id)}
              >
                <AddIcon fontSize="small" sx={{ mr: 1 }} />
                <ListItemText
                  primary="Nouveau sous-menu"
                  slotProps={{ primary: { sx: { fontSize: '0.8rem' } } }}
                />
              </ListItemButton>
            </Box>
          </List>
        </Box>
      </Collapse>
    </Box>
  );
}

export default MenuItem;