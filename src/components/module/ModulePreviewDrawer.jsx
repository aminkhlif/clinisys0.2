import { Box, Typography, Stack, Button, IconButton, Divider, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';

function formatRelativeDate(isoString) {
  if (!isoString) return null;
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  if (diffH < 24) return `il y a ${diffH}h`;
  if (diffD < 7) return `il y a ${diffD}j`;
  if (diffD < 30) return `il y a ${Math.floor(diffD / 7)} sem`;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function ModulePreviewDrawer({ module, onClose, onNavigate, onEdit, onDelete }) {
  if (!module) return null;

  const nombreMenus = module.menus ? module.menus.length : (module.nombreMenus || 0);
  const estVide = nombreMenus === 0;
  const updatedAtLabel = formatRelativeDate(module.updatedAt || module.creerAu);
  const createdAtLabel = formatRelativeDate(module.creerAu);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: '-0.01em' }}>Aperçu du module</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
        <Stack alignItems="center" spacing={2} sx={{ mb: 4, textAlign: 'center' }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 3,
              bgcolor: estVide ? 'action.disabledBackground' : 'grey.900',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WidgetsOutlinedIcon sx={{ color: estVide ? 'grey.500' : '#FFF', fontSize: 40 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em', color: 'text.primary' }}>
              {module.nom}
            </Typography>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mt: 1 }}>
              <LayersOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {nombreMenus} menu{nombreMenus > 1 ? 's' : ''} configuré{nombreMenus > 1 ? 's' : ''}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>Détails</Typography>

        <Stack spacing={2}>
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Date de création</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>{createdAtLabel || '-'}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Dernière modification</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>{updatedAtLabel || '-'}</Typography>
            </Stack>
          </Box>

          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>Statut</Typography>
            <Stack direction="row" spacing={1}>
              {estVide ? (
                <Chip size="small" label="Vide" sx={{ bgcolor: 'action.hover', color: 'grey.700', fontWeight: 500 }} />
              ) : (
                <Chip size="small" label="Actif" sx={{ bgcolor: 'success.50', color: 'success.700', fontWeight: 500 }} />
              )}
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Stack spacing={1.5}>
          <Button 
            variant="contained" 
            fullWidth 
            onClick={onNavigate}
            endIcon={<ArrowForwardIcon />}
            sx={{ py: 1.2, fontWeight: 600 }}
          >
            Ouvrir et gérer les menus
          </Button>
          <Stack direction="row" spacing={1.5}>
            <Button 
              variant="outlined" 
              fullWidth 
              startIcon={<EditIcon />}
              onClick={() => {
                onClose();
                onEdit();
              }}
            >
              Modifier
            </Button>
            <Button 
              variant="outlined" 
              color="error"
              fullWidth 
              startIcon={<DeleteIcon />}
              onClick={() => {
                onClose();
                onDelete();
              }}
            >
              Supprimer
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

export default ModulePreviewDrawer;
