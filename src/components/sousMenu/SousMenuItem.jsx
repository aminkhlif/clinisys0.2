// src/components/sousMenu/SousMenuItem.jsx
import { ListItemButton, ListItemText, IconButton, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function SousMenuItem({ sousMenu, selectionne, onSelect, onEdit, onDelete }) {
  return (
      <ListItemButton
      sx={{
        pl: 5,
        borderRadius: 1.5,
        mb: 0.25,
        py: 0.75,
        borderLeft: selectionne ? '3px solid primary.main' : '3px solid transparent',
        color: selectionne ? 'text.primary' : 'text.secondary',
        bgcolor: selectionne ? 'primary.50' : 'transparent',
        transition: 'all 200ms ease',
        '&:hover': {
          bgcolor: selectionne ? 'primary.100' : 'action.hover',
          transform: 'translateX(2px)',
        },
        '&.Mui-selected': {
          bgcolor: 'primary.50',
          '&:hover': { bgcolor: 'primary.100' },
        },
        '& .row-actions': { opacity: 0 },
        '&:hover .row-actions': { opacity: 1 },
      }}
      selected={selectionne}
      onClick={onSelect}
    >
      <ListItemText
        primary={sousMenu.nom}
        slotProps={{ primary: { sx: { fontSize: '0.825rem', fontWeight: selectionne ? 600 : 500 } } }}
      />
      <Stack direction="row" className="row-actions" sx={{ transition: 'opacity 120ms ease' }}>
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          sx={{
            color: 'text.secondary',
            '&:hover': { color: 'primary.main', bgcolor: 'action.hover' },
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          sx={{
            color: 'text.secondary',
            '&:hover': { color: 'error.main', bgcolor: 'rgba(239,68,68,0.08)' },
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>
    </ListItemButton>
  );
}

export default SousMenuItem;