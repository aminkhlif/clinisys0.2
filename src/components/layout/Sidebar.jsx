// src/components/layout/Sidebar.jsx
import { useEffect, useRef, useState } from 'react';
import {
  Box, TextField, InputAdornment, List, Button, Stack, Typography, Skeleton, IconButton, Tooltip, Fade,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useVirtualizer } from '@tanstack/react-virtual';
import axiosClient from '../../api/axiosClient.js';
import MenuFormDialog from '../menu/MenuFormDialog.jsx';
import SousMenuFormDialog from '../sousMenu/SousMenuFormDialog.jsx';
import MenuItem from '../menu/MenuItem.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';

function Sidebar() {
  const { enqueueSnackbar } = useSnackbar();
  const { moduleId, sousMenuId } = useParams();
  const navigate = useNavigate();

  const [confirmation, setConfirmation] = useState(null);
  const [menus, setMenus] = useState([]);
  const [chargementMenus, setChargementMenus] = useState(true);
  const [sousMenusParMenu, setSousMenusParMenu] = useState({});
  const [menusOuverts, setMenusOuverts] = useState({});
  const [recherche, setRecherche] = useState('');
  const [module, setModule] = useState(null);
  const boutonNouveauMenuRef = useRef(null);
  const parentRef = useRef(null);

  const [dialogMenuOuvert, setDialogMenuOuvert] = useState(false);
  const [menuEnEdition, setMenuEnEdition] = useState(null);

  const [dialogSousMenuOuvert, setDialogSousMenuOuvert] = useState(false);
  const [sousMenuEnEdition, setSousMenuEnEdition] = useState(null);
  const [menuParentPourAjout, setMenuParentPourAjout] = useState(null);

  const chargerModule = async () => {
    if (!moduleId) return;
    try {
      const res = await axiosClient.get(`/modules/${moduleId}`);
      setModule(res.data);
    } catch {
      // Silently fail if module can't be loaded
    }
  };

  const chargerMenus = async (termeRecherche = '') => {
    try {
      const params = { moduleId, ...(termeRecherche ? { recherche: termeRecherche } : {}) };
      const res = await axiosClient.get('/menus', { params });
      setMenus(res.data);
    } catch {
      enqueueSnackbar('Impossible de charger les menus', { variant: 'error' });
    } finally {
      setChargementMenus(false);
    }
  };

  const chargerSousMenus = async (menuId) => {
    try {
      const res = await axiosClient.get('/sous-menus', { params: { menuId } });
      setSousMenusParMenu((prev) => ({ ...prev, [menuId]: res.data }));
    } catch {
      enqueueSnackbar('Impossible de charger les sous-menus', { variant: 'error' });
    }
  };

  useEffect(() => {
    setChargementMenus(true);
    setMenusOuverts({});
    setSousMenusParMenu({});
    chargerModule();
    chargerMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  useEffect(() => {
    const delai = setTimeout(() => {
      chargerMenus(recherche);
    }, 300);
    return () => clearTimeout(delai);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recherche]);

  const basculerMenu = (menuId) => {
    const estOuvert = !menusOuverts[menuId];
    setMenusOuverts((prev) => ({ ...prev, [menuId]: estOuvert }));
    if (estOuvert && !sousMenusParMenu[menuId]) {
      chargerSousMenus(menuId);
    }
  };

  const confirmerSuppression = async () => {
    try {
      if (confirmation.type === 'menu') {
        await axiosClient.delete(`/menus/${confirmation.cible.id}`);
        chargerMenus(recherche);
        enqueueSnackbar('Menu supprimé', { variant: 'success' });
      } else if (confirmation.type === 'sousMenu') {
        const sousMenu = confirmation.cible;
        await axiosClient.delete(`/sous-menus/${sousMenu.id}`);
        chargerSousMenus(sousMenu.menuId);
        if (sousMenuId === String(sousMenu.id)) {
          navigate(`/modules/${moduleId}`);
        }
        enqueueSnackbar('Sous-menu supprimé', { variant: 'success' });
      }
    } catch {
      enqueueSnackbar('La suppression a échoué', { variant: 'error' });
    } finally {
      setConfirmation(null);
    }
  };

  const ouvrirCreationMenu = () => {
    setMenuEnEdition(null);
    setDialogMenuOuvert(true);
  };

  const ouvrirEditionMenu = (menu) => {
    setMenuEnEdition(menu);
    setDialogMenuOuvert(true);
  };

  const demanderSuppressionMenu = (menu) => {
    setConfirmation({ type: 'menu', cible: menu });
  };

  const ouvrirCreationSousMenu = (menuId) => {
    setSousMenuEnEdition(null);
    setMenuParentPourAjout(menuId);
    setDialogSousMenuOuvert(true);
  };

  const ouvrirEditionSousMenu = (sousMenu) => {
    setSousMenuEnEdition(sousMenu);
    setMenuParentPourAjout(sousMenu.menuId);
    setDialogSousMenuOuvert(true);
  };

  const demanderSuppressionSousMenu = (sousMenu) => {
    setConfirmation({ type: 'sousMenu', cible: sousMenu });
  };

  const apresSauvegardeMenu = () => {
    setDialogMenuOuvert(false);
    chargerMenus(recherche);
    enqueueSnackbar(menuEnEdition ? 'Menu mis à jour' : 'Menu créé', { variant: 'success' });
    // Le Dialog MUI restaure le focus sur le bouton déclencheur APRÈS sa fermeture ;
    // un blur() immédiat serait donc écrasé. On le déclenche après coup (setTimeout 0),
    // une fois que cette restauration de focus a eu lieu.
    setTimeout(() => boutonNouveauMenuRef.current?.blur(), 0);
  };

  const apresSauvegardeSousMenu = () => {
    setDialogSousMenuOuvert(false);
    chargerSousMenus(menuParentPourAjout);
    enqueueSnackbar(sousMenuEnEdition ? 'Sous-menu mis à jour' : 'Sous-menu créé', { variant: 'success' });
    setTimeout(() => document.activeElement?.blur(), 0);
  };

  // Virtual row virtualizer for menus with dynamic sizing
  // Only use virtualization when there are many menus (>50) to handle variable heights better
  const shouldVirtualize = menus.length > 50;
  const rowVirtualizer = useVirtualizer({
    count: menus.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => {
      // Estimate larger size to account for expanded menus
      return 150; // Conservative estimate for potentially expanded menus
    },
    overscan: 15,
    enabled: shouldVirtualize,
  });

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Module Header */}
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 2, px: 0.5, mb: 1 }}>
          <Tooltip title="Retour aux modules" arrow>
            <IconButton
              size="small"
              onClick={() => navigate('/')}
              sx={{
                color: 'text.secondary',
                transition: 'color 0.15s, background-color 0.15s',
                '&:hover': { color: 'text.primary', bgcolor: 'action.hover' },
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box component="svg" viewBox="0 0 32 32" sx={{ width: 24, height: 24 }}>
              
                <g transform="translate(16 16)">
                  <g>
                    <animateTransform attributeName="transform" type="scale" values="1;1.15;1" dur="1.5s" repeatCount="indefinite" />
                    <path d="M-3 -11 H3 V-3 H11 V3 H3 V11 H-3 V3 H-11 V-3 H-3 Z" fill="#000000" opacity="0.15" />
                    <path d="M-8 0 L-4 0 L-2 -3 L1 5 L3.5 -2 L5 0 L8 0" fill="none" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </g>
                <circle cx="16" cy="16" r="14" fill="none" stroke="#000000" strokeWidth="1.5" strokeDasharray="20 10 5 10" strokeLinecap="round">
                  <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="10s" repeatCount="indefinite" />
                </circle>
              </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Application
            </Typography>
          </Stack>
        </Stack>
        
        {/* Module Name */}
        {module && (
          <Box sx={{ px: 0.5 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                color: 'text.primary',
                fontSize: '1.1rem',
                lineHeight: 1.3,
                mb: 0.5
              }}
            >
              {module.nom}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {menus.length} menu{menus.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        )}
      </Box>

      <TextField
        sx={{
          mb: 1.5,
          '& .MuiOutlinedInput-root': {
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderRadius: 1.5,
            fontSize: '0.875rem',
            transition: 'all 0.15s',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          },
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'text.disabled' },
          '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
        }}
        size="small"
        placeholder="Rechercher un menu…"
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        name="recherche-menus"
        autoComplete="off"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: recherche ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setRecherche('')}
                  sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
        fullWidth
      />

      <Button
        startIcon={<AddIcon />}
        variant="contained"
        fullWidth
        onClick={ouvrirCreationMenu}
        ref={boutonNouveauMenuRef}
        id="tour-nouveau-menu"
        sx={{
          mb: 2,
        }}
      >
        Nouveau menu
      </Button>

      <Box
        ref={parentRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          mx: -1,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'action.disabledBackground',
            borderRadius: 3,
          },
          '&::-webkit-scrollbar-thumb:hover': { bgcolor: 'action.disabled' },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        }}
      >
        {chargementMenus ? (
          <Stack spacing={1} sx={{ px: 1 }}>
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={36}
                sx={{ borderRadius: 1.5 }}
              />
            ))}
          </Stack>
        ) : menus.length === 0 ? (
          <Fade in>
            <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
              <SearchIcon sx={{ fontSize: 24, color: 'text.disabled', mb: 1 }} />
              <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                {recherche ? 'Aucun menu ne correspond' : 'Aucun menu pour le moment'}
              </Typography>
              {recherche && (
                <Button
                  size="small"
                  onClick={() => setRecherche('')}
                  sx={{ mt: 1, color: 'text.secondary', textTransform: 'none' }}
                >
                  Effacer la recherche
                </Button>
              )}
            </Box>
          </Fade>
        ) : shouldVirtualize ? (
          <Box
            sx={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const menu = menus[virtualRow.index];
              return (
                <Box
                  key={menu.id}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <MenuItem
                    menu={menu}
                    ouvert={Boolean(menusOuverts[menu.id])}
                    sousMenus={sousMenusParMenu[menu.id] || []}
                    sousMenuIdActif={sousMenuId}
                    onToggle={() => basculerMenu(menu.id)}
                    onEdit={ouvrirEditionMenu}
                    onDelete={demanderSuppressionMenu}
                    onAjouterSousMenu={ouvrirCreationSousMenu}
                    onEditSousMenu={ouvrirEditionSousMenu}
                    onDeleteSousMenu={demanderSuppressionSousMenu}
                    onSelectSousMenu={(id) => navigate(`/modules/${moduleId}/sous-menus/${id}`)}
                  />
                </Box>
              );
            })}
          </Box>
        ) : (
          <List dense sx={{ px: 1 }}>
            {menus.map((menu) => (
              <MenuItem
                key={menu.id}
                menu={menu}
                ouvert={Boolean(menusOuverts[menu.id])}
                sousMenus={sousMenusParMenu[menu.id] || []}
                sousMenuIdActif={sousMenuId}
                onToggle={() => basculerMenu(menu.id)}
                onEdit={ouvrirEditionMenu}
                onDelete={demanderSuppressionMenu}
                onAjouterSousMenu={ouvrirCreationSousMenu}
                onEditSousMenu={ouvrirEditionSousMenu}
                onDeleteSousMenu={demanderSuppressionSousMenu}
                onSelectSousMenu={(id) => navigate(`/modules/${moduleId}/sous-menus/${id}`)}
              />
            ))}
          </List>
        )}
      </Box>

      <MenuFormDialog
        ouvert={dialogMenuOuvert}
        menu={menuEnEdition}
        moduleId={moduleId}
        onFermer={() => setDialogMenuOuvert(false)}
        onSauvegarde={apresSauvegardeMenu}
      />

      <SousMenuFormDialog
        ouvert={dialogSousMenuOuvert}
        sousMenu={sousMenuEnEdition}
        menuId={menuParentPourAjout}
        onFermer={() => setDialogSousMenuOuvert(false)}
        onSauvegarde={apresSauvegardeSousMenu}
      />
      <ConfirmDialog
        ouvert={Boolean(confirmation)}
        titre={confirmation?.type === 'menu' ? 'Supprimer ce menu ?' : 'Supprimer ce sous-menu ?'}
        message={
          confirmation?.type === 'menu'
            ? 'Ce menu et tous ses sous-menus seront supprimés définitivement.'
            : 'Ce sous-menu et toutes ses images seront supprimés définitivement.'
        }
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setConfirmation(null)}
      />
</Box>
  );
}

export default Sidebar;