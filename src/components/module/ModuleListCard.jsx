import { Card, CardActionArea, Box, Typography, IconButton, Stack, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function getAccentPalette(nombreMenus) {
  if (!nombreMenus) return { bg: '#F5F5F5', fg: '#737373', label: 'Vide' };
  if (nombreMenus <= 3) return { bg: '#171717', fg: 'background.paper', label: `${nombreMenus} menu${nombreMenus > 1 ? 's' : ''}` };
  if (nombreMenus <= 7) return { bg: '#404040', fg: 'background.paper', label: `${nombreMenus} menus` };
  return { bg: '#0A0A0A', fg: 'background.paper', label: `${nombreMenus} menus` };
}

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

function ModuleListCard({ module, onOuvrir, onEdit, onDelete, misEnAvant = false }) {
  const nombreMenus = module.menus ? module.menus.length : (module.nombreMenus || 0);
  const estVide = nombreMenus === 0;
  const palette = getAccentPalette(nombreMenus);
  
  const pulseStyle = misEnAvant
    ? {
        animation: 'cardPulse 1.8s ease-out',
        borderColor: '#171717',
        boxShadow: '0 0 0 3px rgba(23,23,23,0.18)',
        '@keyframes cardPulse': {
          '0%': { boxShadow: '0 0 0 0 rgba(23,23,23,0.3)' },
          '70%': { boxShadow: '0 0 0 8px rgba(23,23,23,0)' },
          '100%': { boxShadow: 'none' },
        },
      }
    : {};

  const updatedAtLabel = formatRelativeDate(module.updatedAt || module.creerAu);

  return (
    <Card
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        transition: 'border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease',
        ...pulseStyle,
        '&:hover': {
          borderColor: 'grey.400',
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
        },
        '&:hover .fleche': { opacity: 1, transform: 'translateX(0)' },
        '& .row-actions': { opacity: 0 },
        '&:hover .row-actions': { opacity: 1 },
      }}
    >
      <CardActionArea
        onClick={onOuvrir}
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
        }}
        aria-label={`Ouvrir le module ${module.nom}`}
      >
        <Tooltip title={estVide ? 'Aucun menu' : `${nombreMenus} menu${nombreMenus > 1 ? 's' : ''} configuré${nombreMenus > 1 ? 's' : ''}`}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2.5,
              bgcolor: palette.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              mr: 2,
              transition: 'transform 200ms ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            <WidgetsOutlinedIcon sx={{ color: 'background.paper', fontSize: 20 }} />
          </Box>
        </Tooltip>

        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1, minWidth: 0, pr: 2 }}>
            <Typography
              variant="subtitle1"
              title={module.nom}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: estVide ? 'text.secondary' : 'text.primary',
                fontWeight: 600,
                letterSpacing: '-0.01em',
              }}
            >
              {module.nom}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 0.5 }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <LayersOutlinedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ color: estVide ? 'text.secondary' : 'text.primary', fontWeight: 500, fontSize: '0.78rem' }}>
                  {palette.label}
                </Typography>
              </Stack>
              {updatedAtLabel && (
                <Stack direction="row" alignItems="center" spacing={0.4}>
                  <AccessTimeIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.68rem' }}>
                    Modifié {updatedAtLabel}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>
          <ChevronRightIcon
            className="fleche"
            sx={{ color: 'grey.400', opacity: 0, transform: 'translateX(-4px)', transition: 'all 200ms ease', mr: 8 }}
          />
        </Box>
      </CardActionArea>

      {/* Actions contextuelles — visibles au hover */}
      <Stack
        direction="row"
        className="row-actions"
        sx={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 16, transition: 'opacity 160ms ease', zIndex: 1 }}
        spacing={1}
      >
        <Tooltip title="Modifier le module">
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              '&:hover': { borderColor: 'grey.400', bgcolor: 'background.paper' },
            }}
            aria-label="Modifier le module"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Supprimer le module">
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              color: 'error.main',
              '&:hover': { borderColor: 'error.main', bgcolor: '#FFF5F5', color: 'error.main' },
            }}
            aria-label="Supprimer le module"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Card>
  );
}

export default ModuleListCard;
