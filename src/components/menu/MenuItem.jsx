// src/components/menu/MenuItem.jsx
import { Box, ListItemButton, ListItemText, IconButton, Collapse, List, Stack, Chip } from '@mui/material';
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
    <Box sx={{ mb: 0.5 }}>
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
        <Stack direction="row" spacing={0.5} className="row-actions" sx={{ transition: 'opacity 120ms ease', alignItems: 'center', flexShrink: 0 }}>
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
        <List component="div" disablePadding dense>
          {sousMenus.map((sousMenu) => (
            <SousMenuItem
              key={sousMenu.id}
              sousMenu={sousMenu}
              selectionne={sousMenuIdActif === String(sousMenu.id)}
              onSelect={() => onSelectSousMenu(sousMenu.id)}
              onEdit={() => onEditSousMenu(sousMenu)}
              onDelete={() => onDeleteSousMenu(sousMenu)}
            />
          ))}
          <ListItemButton
            sx={{
              pl: 3.5,
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
        </List>
      </Collapse>
    </Box>
  );
}

export default MenuItem;