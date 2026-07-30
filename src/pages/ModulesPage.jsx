// src/pages/ModulesPage.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Stack, Typography, Button, TextField, InputAdornment, Grid, Skeleton, ToggleButtonGroup, ToggleButton, Drawer, TablePagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import { useSnackbar } from 'notistack';
import axiosClient from '../api/axiosClient.js';
import ModuleCard from '../components/module/ModuleCard.jsx';
import ModuleListCard from '../components/module/ModuleListCard.jsx';
import ModulePreviewDrawer from '../components/module/ModulePreviewDrawer.jsx';
import ModuleFormDialog from '../components/module/ModuleFormDialog.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import { dotGridBackgroundSx } from '../theme/backgrounds.js';

function ModulesPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [modules, setModules] = useState([]);
  const boutonNouveauModuleRef = useRef(null);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalElements, setTotalElements] = useState(0);

  const [dialogOuvert, setDialogOuvert] = useState(false);
  const [moduleEnEdition, setModuleEnEdition] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [moduleMisEnAvantId, setModuleMisEnAvantId] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [moduleEnApercu, setModuleEnApercu] = useState(null);

  const chargerModules = useCallback(async (termeRecherche = '', currentPage = page, currentRowsPerPage = rowsPerPage) => {
    setChargement(true);
    try {
      const params = {
        page: currentPage,
        taille: currentRowsPerPage,
        recherche: termeRecherche || undefined
      };
      const res = await axiosClient.get('/modules', { params });
      setModules(res.data.content || res.data);
      setTotalElements(res.data.totalElements || res.data.length);
    } catch {
      enqueueSnackbar('Impossible de charger les modules', { variant: 'error' });
    } finally {
      setChargement(false);
    }
  }, [enqueueSnackbar]);

  // Initial load only
  useEffect(() => {
    chargerModules(recherche, page, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-load when pagination or search changes
  useEffect(() => {
    chargerModules(recherche, page, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, recherche]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const ouvrirCreation = () => {
    setModuleEnEdition(null);
    setDialogOuvert(true);
  };

  const ouvrirEdition = (module) => {
    setModuleEnEdition(module);
    setDialogOuvert(true);
  };

  const apresSauvegarde = async (moduleCreeOuModifie) => {
    setDialogOuvert(false);
    await chargerModules(recherche, page, rowsPerPage);
    enqueueSnackbar(moduleEnEdition ? 'Module mis à jour' : 'Module créé', { variant: 'success' });
    setTimeout(() => boutonNouveauModuleRef.current?.blur(), 0);

    // Mise en avant visuelle de la card nouvellement créée / modifiée
    if (moduleCreeOuModifie?.id) {
      setModuleMisEnAvantId(moduleCreeOuModifie.id);
      setTimeout(() => setModuleMisEnAvantId(null), 2200);
    }
  };

  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await axiosClient.delete(`/modules/${confirmation.id}`);
      await chargerModules(recherche, page, rowsPerPage);
      enqueueSnackbar('Module supprimé', { variant: 'success' });
    } catch {
      enqueueSnackbar('La suppression a échoué', { variant: 'error' });
    } finally {
      setSuppressionEnCours(false);
      setConfirmation(null);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        ...dotGridBackgroundSx,
      }}
    >
      {/* Bandeau d'en-tête centralisé via le composant TopBar partagé */}
      <TopBar breadcrumb="Modules" />

      {/* Barre d'outils : recherche + création */}
      <Box
        sx={{
          maxWidth: 1200,
          width: '100%',
          mx: 'auto',
          px: { xs: 2, sm: 4 },
          pt: { xs: 2, sm: 3 },
          pb: 2,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={{ xs: 2, sm: 2 }}
        >
          {/* Section gauche : titre */}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em', color: 'text.primary' }}>Modules</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Gérez et configurez les différents espaces de votre application.
            </Typography>
          </Box>

          {/* Section droite : recherche + bouton création */}
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <TextField
              size="small"
              placeholder="Rechercher un module…"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              name="recherche-modules"
              autoComplete="off"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: recherche ? (
                    <InputAdornment position="end" sx={{ cursor: 'pointer' }}>
                      <Typography
                        variant="caption"
                        onClick={() => setRecherche('')}
                        sx={{ color: 'text.secondary', fontWeight: 500, '&:hover': { color: 'text.primary' } }}
                      >
                        Effacer
                      </Typography>
                    </InputAdornment>
                  ) : null,
                },
              }}
              sx={{ 
                width: { xs: '100%', sm: 260 }, 
                bgcolor: 'background.paper',
                '& .MuiOutlinedInput-root': { borderRadius: 1.5, height: 40 }
              }}
            />
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => {
                if (newMode !== null) setViewMode(newMode);
              }}
              size="small"
              sx={{ height: 40 }}
            >
              <ToggleButton value="grid" aria-label="grid view" sx={{ borderRadius: 1.5 }}>
                <ViewModuleIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view" sx={{ borderRadius: 1.5 }}>
                <ViewListIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={ouvrirCreation}
              ref={boutonNouveauModuleRef}
              id="tour-nouveau-module"
              sx={{ whiteSpace: 'nowrap', height: 40, px: 2.5, borderRadius: 1.5, fontSize: '0.875rem' }}
            >
              Nouveau module
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Contenu principal */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 4 }, pb: { xs: 3, sm: 4 } }}>
        {chargement ? (
          <Grid container spacing={2.5}>
            {[...Array(6)].map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Skeleton
                  variant="rounded"
                  height={160}
                  sx={{
                    borderRadius: 3,
                    animationDelay: `${i * 80}ms`,
                  }}
                />
              </Grid>
            ))}
          </Grid>
        ) : modules.length === 0 ? (
          <Box
            sx={{
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 3,
              py: 10,
              textAlign: 'center',
              bgcolor: 'background.paper',
              px: 4,
            }}
          >
            <Box
              component="svg"
              viewBox="0 0 64 64"
              sx={{ width: 56, height: 56, mx: 'auto', mb: 2 }}
            >
              <circle cx="32" cy="32" r="20" fill="none" stroke="#171717" strokeWidth="8" opacity="0.15" />
              <circle cx="32" cy="32" r="20" fill="none" stroke="#171717" strokeWidth="8" strokeDasharray="32 93" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="2.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="32" cy="32" r="9" fill="#171717">
                <animate attributeName="r" values="9;12;9" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
              </circle>
            </Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 1, color: recherche ? 'text.secondary' : 'text.primary' }}
            >
              {recherche ? 'Aucun résultat' : "Bienvenue dans l'Application"}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: recherche ? 0 : 3, maxWidth: 340, mx: 'auto' }}
            >
              {recherche
                ? 'Essayez avec d\'autres termes de recherche ou vérifiez l\'orthographe.'
                : 'Créez votre premier module pour commencer à organiser vos menus et sous-menus.'}
            </Typography>
            {!recherche && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={ouvrirCreation}
                sx={{ mt: 1 }}
              >
                Créer mon premier module
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={2.5}>
            {modules.map((module, index) => (
              <Grid
                key={module.id}
                size={viewMode === 'list' ? { xs: 12 } : { xs: 12, sm: 6, md: 4 }}
                sx={{
                  animation: 'fadeSlideIn 350ms ease forwards',
                  animationDelay: `${index * 50}ms`,
                  opacity: 0,
                  '@keyframes fadeSlideIn': {
                    '0%': { opacity: 0, transform: 'translateY(8px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                {viewMode === 'list' ? (
                  <ModuleListCard
                    module={module}
                    misEnAvant={moduleMisEnAvantId === module.id}
                    onOuvrir={() => setModuleEnApercu(module)}
                    onEdit={() => ouvrirEdition(module)}
                    onDelete={() => setConfirmation(module)}
                  />
                ) : (
                  <ModuleCard
                    module={module}
                    misEnAvant={moduleMisEnAvantId === module.id}
                    onOuvrir={() => setModuleEnApercu(module)}
                    onEdit={() => ouvrirEdition(module)}
                    onDelete={() => setConfirmation(module)}
                  />
                )}
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* Pagination */}
        {!chargement && modules.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <TablePagination
              component="div"
              count={totalElements}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[12, 20, 48]}
              labelRowsPerPage="Modules par page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`}
            />
          </Box>
        )}
      </Box>

      <Drawer
        anchor="right"
        open={Boolean(moduleEnApercu)}
        onClose={() => setModuleEnApercu(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, p: 0 } }}
      >
        <ModulePreviewDrawer 
          module={moduleEnApercu} 
          onClose={() => setModuleEnApercu(null)}
          onNavigate={() => navigate(`/modules/${moduleEnApercu?.id}`)}
          onEdit={() => ouvrirEdition(moduleEnApercu)}
          onDelete={() => setConfirmation(moduleEnApercu)}
        />
      </Drawer>

      <ModuleFormDialog
        ouvert={dialogOuvert}
        module={moduleEnEdition}
        onFermer={() => setDialogOuvert(false)}
        onSauvegarde={apresSauvegarde}
      />
      <ConfirmDialog
        ouvert={Boolean(confirmation)}
        titre="Supprimer ce module ?"
        message="Ce module et tous ses menus, sous-menus et images seront supprimés définitivement."
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setConfirmation(null)}
        enCours={suppressionEnCours}
      />
</Box>
  );
}

export default ModulesPage;
