// src/components/layout/TopBar.jsx
// Bandeau d'en-tête UNIQUE, partagé par ModulesPage et MainLayout.
// Toute la logique de logo / fil d'ariane / menu utilisateur vit ici et
// UNIQUEMENT ici : il n'y a donc plus qu'un seul endroit à corriger si un
// jour l'alignement pose à nouveau problème.
import { Box, Breadcrumbs, Typography, IconButton } from '@mui/material';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useAppTheme } from '../../context/ThemeContext.jsx';
import UserMenu from '../auth/UserMenu.jsx';

function Logo({ size = 26 }) {
  return (
    <Box component="svg" viewBox="0 0 32 32" sx={{ width: size, height: size, flexShrink: 0 }}>
      
              <g transform="translate(16 16)">
                <g>
                  <animateTransform attributeName="transform" type="scale" values="1;1.15;1" dur="1.5s" repeatCount="indefinite" />
                  <path d="M-3 -11 H3 V-3 H11 V3 H3 V11 H-3 V3 H-11 V-3 H-3 Z" fill="currentColor" opacity="0.15" />
                  <path d="M-8 0 L-4 0 L-2 -3 L1 5 L3.5 -2 L5 0 L8 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </g>
              <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 10 5 10" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="10s" repeatCount="indefinite" />
              </circle>
            </Box>
  );
}

/**
 * @param {string}  breadcrumb   Libellé affiché après "APPLICATION ›" (optionnel)
 * @param {boolean} fixed        true = position fixed (utilisé au-dessus d'une sidebar, ex: MainLayout)
 *                                false = position sticky (utilisé seul, ex: ModulesPage)
 * @param {number}  drawerOffset Largeur de la sidebar en px, seulement utile si fixed=true
 */
function TopBar({ breadcrumb, fixed = false, drawerOffset = 0 }) {
  return (
    <Box
      sx={{
        position: fixed ? 'fixed' : 'sticky',
        top: 0,
        left: fixed ? { xs: 0, md: drawerOffset } : 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        // Flex natif et explicite : pas de Stack imbriqué, pas d'ambiguïté
        // sur la largeur -> garantit que justify-content s'applique bien.
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        boxSizing: 'border-box',
        width: fixed ? { xs: '100%', md: `calc(100% - ${drawerOffset}px)` } : '100%',
        minHeight: 64,
        px: { xs: 2, sm: 4 },
        bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(255,255,255,0.92)' : 'rgba(15,23,42,0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Côté gauche : logo + fil d'ariane. flex:1 + minWidth:0 permet au
          texte de se tronquer proprement au lieu de pousser le menu
          utilisateur hors de l'écran. */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flex: '1 1 auto',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <Logo />
        <Breadcrumbs
          separator="›"
          sx={{
            fontSize: '0.85rem',
            minWidth: 0,
            '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' },
            '& .MuiBreadcrumbs-separator': { color: 'text.secondary', flexShrink: 0 },
          }}
        >
          <Typography sx={{ fontWeight: 700, letterSpacing: '0.03em', fontSize: '0.85rem', flexShrink: 0 }}>
            APPLICATION
          </Typography>
          {breadcrumb && (
            <Typography
              sx={{
                color: 'text.secondary',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {breadcrumb}
            </Typography>
          )}
        </Breadcrumbs>
      </Box>

      {/* Côté droit : jamais compressé, toujours collé au bord droit. */}
      <Box sx={{ flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ThemeToggle />
          <UserMenu  />
        </Box>
      </Box>
    </Box>
  );
}

export default TopBar;

function ThemeToggle() {
  const { mode, toggleTheme } = useAppTheme();
  return (
    <IconButton onClick={toggleTheme} color="inherit" sx={{ ml: 1 }}>
      {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
    </IconButton>
  );
}
