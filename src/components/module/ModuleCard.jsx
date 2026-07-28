// src/components/module/ModuleCard.jsx
import { Card, CardActionArea, Box, Typography, IconButton, Stack, Chip, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

/**
 * Renvoie une couleur d'accentuation selon le nombre de menus.
 * Plus un module a de menus, plus il est "vivant" → teinte plus chaude/contrastée.
 */
function getAccentPalette(nombreMenus) {
  if (!nombreMenus) return { bg: '#F5F5F5', fg: '#737373', label: 'Vide' };
  if (nombreMenus <= 3) return { bg: '#171717', fg: 'background.paper', label: `${nombreMenus} menu${nombreMenus > 1 ? 's' : ''}` };
  if (nombreMenus <= 7) return { bg: '#404040', fg: 'background.paper', label: `${nombreMenus} menus` };
  return { bg: '#0A0A0A', fg: 'background.paper', label: `${nombreMenus} menus` };
}

/**
 * Formate une date ISO en relatif ("il y a 3 jours", "hier", etc.)
 */
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

function ModuleCard({ module, onOuvrir, onEdit, onDelete, misEnAvant = false }) {
  const nombreMenus = module.menus ? module.menus.length : (module.nombreMenus || 0);
  const estVide = nombreMenus === 0;
  const palette = getAccentPalette(nombreMenus);

  // Animation d'entrée pour les cartes nouvellement créées/modifiées
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
        height: 160,
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease',
        ...pulseStyle,
        '&:hover': {
          borderColor: 'grey.400',
          transform: 'translateY(-3px)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
        },
        '&:hover .fleche': { opacity: 1, transform: 'translateX(0)' },
        '& .row-actions': { opacity: 0 },
        '&:hover .row-actions': { opacity: 1 },
      }}
    >
      <CardActionArea
        onClick={onOuvrir}
        sx={{
          p: 2.5,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
        aria-label={`Ouvrir le module ${module.nom}`}
      >
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
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
                transition: 'transform 200ms ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              <WidgetsOutlinedIcon sx={{ color: 'background.paper', fontSize: 20 }} />
            </Box>
          </Tooltip>
          <ChevronRightIcon
            className="fleche"
            sx={{
              color: 'grey.400',
              opacity: 0,
              transform: 'translateX(-4px)',
              transition: 'all 200ms ease',
            }}
          />
        </Stack>

        <Box sx={{ flex: 1, minHeight: 0, mt: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography
            variant="subtitle1"
            title={module.nom}
            sx={{
              mb: 0.75,
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

          <Stack direction="row" alignItems="center" spacing={1}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <LayersOutlinedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
              <Typography
                variant="body2"
                sx={{
                  color: estVide ? 'text.secondary' : 'text.primary',
                  fontWeight: 500,
                  fontSize: '0.78rem',
                }}
              >
                {palette.label}
              </Typography>
            </Stack>

            {estVide && (
              <Chip
                size="small"
                label="Vide"
                variant="outlined"
                sx={{ height: 18, fontSize: '0.6rem', borderColor: 'grey.300', color: 'text.secondary' }}
              />
            )}
          </Stack>

          {/* Timestamp de dernière modification */}
          {updatedAtLabel && (
            <Stack direction="row" alignItems="center" spacing={0.4} sx={{ mt: 0.75 }}>
              <AccessTimeIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.68rem' }}>
                Modifié {updatedAtLabel}
              </Typography>
            </Stack>
          )}
        </Box>
      </CardActionArea>

      {/* Actions contextuelles — visibles au hover */}
      <Stack
        direction="row"
        className="row-actions"
        sx={{ position: 'absolute', top: 10, right: 10, transition: 'opacity 160ms ease' }}
        spacing={0.5}
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
              '&:hover': {
                borderColor: 'grey.400',
                bgcolor: 'background.paper',
              },
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
              '&:hover': {
                borderColor: 'error.main',
                bgcolor: '#FFF5F5',
                color: 'error.main',
              },
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

export default ModuleCard;
