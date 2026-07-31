// src/pages/ImageEditPage.jsx
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, IconButton, Typography, Button, TextField, Stack, Grid, Chip,
  Skeleton, Breadcrumbs, Tooltip, Fade, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  motion, AnimatePresence
} from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import CircleIcon from '@mui/icons-material/Circle';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSnackbar } from 'notistack';
import axiosClient from '../api/axiosClient.js';
import {
  listerActions, creerAction, modifierAction, supprimerAction, validerActions, annulerActions,
} from '../api/actionsClient.js';
import { CONFIG_ACTIONS, LISTE_ACTIONS, ICONE_ACTION } from '../components/image/configActions.js';
import ImageEditorCanvas from '../components/image/ImageEditorCanvas.jsx';
import { dotGridBackgroundSx } from '../theme/backgrounds.js';
import ToolPanel from '../components/image/FloatingPanels/ToolPanel.jsx';
import PropertiesPanel from '../components/image/FloatingPanels/PropertiesPanel.jsx';
import HistoryPanel from '../components/image/FloatingPanels/HistoryPanel.jsx';
import LayersPanel from '../components/image/FloatingPanels/LayersPanel.jsx';
import StatusBar from '../components/image/StatusBar/StatusBar.jsx';
import MainToolbar from '../components/image/Toolbar/MainToolbar.jsx';
import QuickActions from '../components/image/Toolbar/QuickActions.jsx';
import ContextMenu from '../components/image/Toolbar/ContextMenu.jsx';
import { useHistory } from '../hooks/useHistory.js';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts.js';
import { usePanels } from '../hooks/usePanels.js';

const INTENSITE_FLOU_PAR_DEFAUT = 8;
const COULEUR_PAR_DEFAUT = '#FF0000';

function formaterTaille(octets) {
  if (!octets) return '';
  const ko = octets / 1024;
  if (ko < 1024) return `${ko.toFixed(0)} Ko`;
  return `${(ko / 1024).toFixed(1)} Mo`;
}

function ImageEditPage() {
  const { moduleId, sousMenuId, imageId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [image, setImage] = useState(null);
  const [premierChargement, setPremierChargement] = useState(true);
  const [nomModule, setNomModule] = useState('');
  const [nomSousMenu, setNomSousMenu] = useState('');
  const [description, setDescription] = useState('');
  const [nouveauFichier, setNouveauFichier] = useState(null);
  const [apercuNouveauFichier, setApercuNouveauFichier] = useState(null);
  const [survolFichier, setSurvolFichier] = useState(false);
  const [erreur, setErreur] = useState('');
  const [actions, setActions] = useState([]);
  const [couleurChoisie, setCouleurChoisie] = useState(COULEUR_PAR_DEFAUT);
  const [enCours, setEnCours] = useState(false);
  const [dernierTypeAjoute, setDernierTypeAjoute] = useState(null);
  const [actionSelectionneeId, setActionSelectionneeId] = useState(null);
  const [dimensionsNaturelles, setDimensionsNaturelles] = useState(null);
  const [vientDeSauvegarder, setVientDeSauvegarder] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(null);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [contextMenuAnchor, setContextMenuAnchor] = useState(null);
  const [quickActionsAnchor, setQuickActionsAnchor] = useState(null);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const NIVEAUX_ZOOM = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const { panneaux, togglePanel, estVisible, getPosition, movePanel } = usePanels();
  const { historique, ajouterAction: ajouterHistorique, annuler: annulerHistorique, retablir: retablirHistorique, peutAnnuler, peutRetablir } = useHistory();

  const handlers = {
    'ctrl+z': () => annulerHistorique(),
    'ctrl+y': () => retablirHistorique(),
    'ctrl+shift+z': () => retablirHistorique(),
    'ctrl+s': () => { if (!enCours) toutSauvegarder(); },
    'delete': () => { if (actionSelectionneeId) supprimerUneAction(actionSelectionneeId); },
    'backspace': () => { if (actionSelectionneeId) supprimerUneAction(actionSelectionneeId); },
    'escape': () => { setActionSelectionneeId(null); setContextMenuAnchor(null); setQuickActionsAnchor(null); },
    'h': () => togglePanel('historique'),
    'l': () => togglePanel('calques'),
    'p': () => togglePanel('proprietes'),
    't': () => togglePanel('outils'),
  };

  useKeyboardShortcuts(handlers);

  const chargerImage = async () => {
    try {
      const res = await axiosClient.get(`/images/${imageId}`);
      setImage(res.data);
      setDescription(res.data.description);
    } catch {
      enqueueSnackbar("Impossible de charger l'image", { variant: 'error' });
      retourAuSousMenu();
    } finally {
      setPremierChargement(false);
    }
  };

  const chargerActions = async () => {
    const data = await listerActions(imageId);
    setActions(data);
  };

  const chargerContexte = async () => {
    try {
      const resSousMenu = await axiosClient.get(`/sous-menus/${sousMenuId}`);
      setNomSousMenu(resSousMenu.data.nom);
    } catch {
      // silencieux, contexte uniquement
    }
    try {
      const resModule = await axiosClient.get(`/modules/${moduleId}`);
      setNomModule(resModule.data.nom);
    } catch {
      // silencieux, contexte uniquement
    }
  };

  useEffect(() => {
    chargerImage();
    chargerActions();
    chargerContexte();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageId]);

  // Génère et nettoie l'aperçu du nouveau fichier choisi (remplace le data:URL calculé
  // à chaque rendu par un seul objectURL, révoqué proprement au changement/démontage)
  useEffect(() => {
    if (!nouveauFichier) {
      setApercuNouveauFichier(null);
      return;
    }
    const url = URL.createObjectURL(nouveauFichier);
    setApercuNouveauFichier(url);
    return () => URL.revokeObjectURL(url);
  }, [nouveauFichier]);

  // Avertit l'utilisateur avant de quitter/rafraîchir l'onglet s'il y a des changements non enregistrés
  const modificationsNonSauvegardees = useMemo(() => {
    if (!image) return false;
    return description !== image.description || Boolean(nouveauFichier) || actions.length > 0;
  }, [description, image, nouveauFichier, actions]);

  useEffect(() => {
    const gererAvantFermeture = (e) => {
      if (!modificationsNonSauvegardees) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', gererAvantFermeture);
    return () => window.removeEventListener('beforeunload', gererAvantFermeture);
  }, [modificationsNonSauvegardees]);

  // Raccourci clavier Ctrl/Cmd+S pour sauvegarder sans quitter le clavier
  useEffect(() => {
    const gererRaccourci = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!enCours) toutSauvegarder();
      }
    };
    window.addEventListener('keydown', gererRaccourci);
    return () => window.removeEventListener('keydown', gererRaccourci);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enCours, description, nouveauFichier, actions]);

  const retourAuSousMenu = () => {
    navigate(`/modules/${moduleId}/sous-menus/${sousMenuId}`);
  };

  const demanderFermeture = () => {
    if (modificationsNonSauvegardees) {
      const confirme = window.confirm(
        'Des modifications ne sont pas enregistrées. Voulez-vous vraiment quitter sans les sauvegarder ?'
      );
      if (!confirme) return;
    }
    retourAuSousMenu();
  };

  if (premierChargement || !image) {
    return (
      <Box sx={{ minHeight: '100vh', ...dotGridBackgroundSx }}>
        <Skeleton variant="rectangular" height={64} />
        <Box sx={{ maxWidth: 1300, mx: 'auto', p: { xs: 2, sm: 4 } }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Skeleton variant="rounded" height={420} sx={{ borderRadius: 3 }} />
              <Skeleton variant="text" width="40%" sx={{ mt: 2 }} />
              <Skeleton variant="rounded" height={72} sx={{ mt: 1, borderRadius: 2 }} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Skeleton variant="rounded" height={280} sx={{ borderRadius: 3 }} />
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  }

  const urlAffichee = apercuNouveauFichier || (image.donneesBase64 ? `data:${image.typeContenu};base64,${image.donneesBase64}` : image.url);

  const typeNecessiteCouleur = LISTE_ACTIONS.some((t) => CONFIG_ACTIONS[t].couleur);
  const actionSelectionnee = actions.find((a) => a.id === actionSelectionneeId) || null;
  const selectionAcceptesCouleur = actionSelectionnee && CONFIG_ACTIONS[actionSelectionnee.type]?.couleur;

  const ajouterAction = async (type) => {
    const config = CONFIG_ACTIONS[type];
    const nouvelle = await creerAction({
      type,
      x: 20,
      y: 20,
      largeur: config.largeurDefaut,
      hauteur: config.hauteurDefaut,
      couleur: config.couleur ? couleurChoisie : null,
      intensite: config.intensite ? INTENSITE_FLOU_PAR_DEFAUT : null,
      imageId: image.id,
    });
    setActions((prev) => [...prev, nouvelle]);
    setActionSelectionneeId(nouvelle.id);
    setDernierTypeAjoute(type);
    ajouterHistorique({ label: `Ajout ${config.label}`, timestamp: new Date().toLocaleTimeString() });
    setTimeout(() => setDernierTypeAjoute(null), 900);
  };

  const handleUndo = () => {
    annulerHistorique();
  };

  const handleRedo = () => {
    retablirHistorique();
  };

  const handleCopy = () => {
    if (actionSelectionneeId) {
      const action = actions.find(a => a.id === actionSelectionneeId);
      if (action) {
        navigator.clipboard.writeText(JSON.stringify(action));
        enqueueSnackbar('Annotation copiée', { variant: 'success' });
      }
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const action = JSON.parse(text);
      const nouvelle = await creerAction({
        ...action,
        x: action.x + 20,
        y: action.y + 20,
        imageId: image.id,
      });
      setActions((prev) => [...prev, nouvelle]);
      setActionSelectionneeId(nouvelle.id);
      ajouterHistorique({ label: 'Coller annotation', timestamp: new Date().toLocaleTimeString() });
      enqueueSnackbar('Annotation collée', { variant: 'success' });
    } catch {
      enqueueSnackbar('Impossible de coller', { variant: 'error' });
    }
  };

  const handleDelete = () => {
    if (actionSelectionneeId) {
      supprimerUneAction(actionSelectionneeId);
    }
  };

  const handleZoomIn = () => {
    const indexActuel = NIVEAUX_ZOOM.reduce(
      (plusProche, val, i) => (Math.abs(val - zoom) < Math.abs(NIVEAUX_ZOOM[plusProche] - zoom) ? i : plusProche),
      0,
    );
    const nouvelIndex = Math.min(indexActuel + 1, NIVEAUX_ZOOM.length - 1);
    setZoom(NIVEAUX_ZOOM[nouvelIndex]);
  };
  const handleZoomOut = () => {
    const indexActuel = NIVEAUX_ZOOM.reduce(
      (plusProche, val, i) => (Math.abs(val - zoom) < Math.abs(NIVEAUX_ZOOM[plusProche] - zoom) ? i : plusProche),
      0,
    );
    const nouvelIndex = Math.max(indexActuel - 1, 0);
    setZoom(NIVEAUX_ZOOM[nouvelIndex]);
  };
  const handleFitScreen = () => setZoom(1);

  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenuAnchor({ x: event.clientX, y: event.clientY });
  };

  const handleCloseContextMenu = () => {
    setContextMenuAnchor(null);
  };

  const changerCouleur = (nouvelleCouleur) => {
    setCouleurChoisie(nouvelleCouleur);
    if (selectionAcceptesCouleur) {
      setActions((prev) => prev.map((a) => (a.id === actionSelectionneeId ? { ...a, couleur: nouvelleCouleur } : a)));
      modifierAction(actionSelectionneeId, { ...actionSelectionnee, couleur: nouvelleCouleur });
    }
  };

  const annulerDerniereAction = async () => {
    if (actions.length === 0) return;
    const derniere = actions[actions.length - 1];
    await supprimerAction(derniere.id);
    setActions((prev) => prev.slice(0, -1));
    if (actionSelectionneeId === derniere.id) setActionSelectionneeId(null);
  };

  const deplacerAction = (actionId, x, y, persister) => {
    setActions((prev) => prev.map((a) => (a.id === actionId ? { ...a, x, y } : a)));
    if (persister) {
      const action = actions.find((a) => a.id === actionId);
      modifierAction(actionId, { ...action, x, y });
    }
  };

  const redimensionnerAction = (actionId, largeur, hauteur, persister) => {
    setActions((prev) => prev.map((a) => (a.id === actionId ? { ...a, largeur, hauteur } : a)));
    if (persister) {
      const action = actions.find((a) => a.id === actionId);
      modifierAction(actionId, { ...action, largeur, hauteur });
    }
  };

  const supprimerUneAction = async (actionId) => {
    await supprimerAction(actionId);
    setActions((prev) => prev.filter((a) => a.id !== actionId));
    if (actionSelectionneeId === actionId) setActionSelectionneeId(null);
  };

  const annulerToutesLesActions = async () => {
    await annulerActions(image.id);
    setActions([]);
    setActionSelectionneeId(null);
  };

  const choisirFichier = (fichier) => {
    if (fichier && fichier.type.startsWith('image/')) {
      setNouveauFichier(fichier);
    }
  };

  const retirerNouveauFichier = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setNouveauFichier(null);
  };

  const toutSauvegarder = async () => {
    if (!description.trim()) {
      setErreur('La description est obligatoire');
      return;
    }
    setEnCours(true);
    try {
      if (nouveauFichier) {
        const formData = new FormData();
        formData.append('fichier', nouveauFichier);
        await axiosClient.put(`/images/${image.id}/fichier`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      await axiosClient.patch(`/images/${image.id}/description`, null, { params: { description } });

      let imageMiseAJour = null;
      if (actions.length > 0) {
        imageMiseAJour = await validerActions(image.id);
      }

      enqueueSnackbar('Modifications enregistrées', { variant: 'success' });
      setNouveauFichier(null);
      setActionSelectionneeId(null);
      setVientDeSauvegarder(true);
      setTimeout(() => setVientDeSauvegarder(false), 1600);
      
      // Utiliser l'image mise à jour retournée par validerActions si disponible
      if (imageMiseAJour) {
        setImage(imageMiseAJour);
        await chargerActions();
      } else {
        await chargerImage();
        await chargerActions();
      }
    } catch (err) {
      setErreur(err.response?.data?.message || err.response?.data?.description || 'Une erreur est survenue');
    } finally {
      setEnCours(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', ...dotGridBackgroundSx, pb: 8 }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          top: 0,
          bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(15,23,42,0.8)',
          backdropFilter: 'blur(10px)',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ gap: 1.5 }}>
          <Tooltip title="Retour" arrow>
            <IconButton onClick={demanderFermeture} size="small">
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Breadcrumbs
              separator="›"
              sx={{
                fontSize: '0.7rem',
                '& .MuiBreadcrumbs-separator': { color: 'text.secondary', mx: 0.5 },
                '& .MuiBreadcrumbs-li': { minWidth: 0 },
              }}
            >
              {nomModule && (
                <Typography noWrap sx={{ color: 'text.secondary', fontSize: '0.7rem', maxWidth: 140 }}>
                  {nomModule}
                </Typography>
              )}
              {nomSousMenu && (
                <Typography noWrap sx={{ color: 'text.secondary', fontSize: '0.7rem', maxWidth: 160 }}>
                  {nomSousMenu}
                </Typography>
              )}
            </Breadcrumbs>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Typography variant="subtitle1" fontWeight={600} noWrap>Édition de la capture</Typography>
              <Fade in={modificationsNonSauvegardees}>
                <Tooltip title="Modifications non enregistrées" arrow>
                  <CircleIcon sx={{ fontSize: 7, color: 'warning.main' }} />
                </Tooltip>
              </Fade>
              <Fade in={vientDeSauvegarder}>
                <Stack direction="row" alignItems="center" spacing={0.4}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />
                  <Typography variant="caption" sx={{ color: 'success.main' }}>Enregistré</Typography>
                </Stack>
              </Fade>
            </Stack>
          </Box>

          {/* Main Toolbar in Header */}
          <MainToolbar
            onUndo={() => annulerDerniereAction()}
            onRedo={() => retablirHistorique()}
            canUndo={actions.length > 0}
            canRedo={peutRetablir}
            onSave={toutSauvegarder}
            onDelete={() => actionSelectionneeId && supprimerUneAction(actionSelectionneeId)}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitScreen={handleFitScreen}
            onToggleHistory={() => togglePanel('historique')}
            onToggleLayers={() => togglePanel('calques')}
            onToggleProperties={() => togglePanel('proprietes')}
            onToggleTools={() => togglePanel('outils')}
            onHelp={() => setHelpDialogOpen(true)}
            zoom={zoom}
            activePanels={panneaux}
          />

          {/* Replace Image Button */}
          <Box sx={{ mr: 1 }}>
            <input
              type="file"
              hidden
              id="replace-image-input"
              accept="image/*"
              onChange={(e) => choisirFichier(e.target.files[0])}
            />
            <label htmlFor="replace-image-input">
              <Button
                variant="outlined"
                size="small"
                component="span"
                startIcon={<UploadFileOutlinedIcon fontSize="small" />}
              >
                Remplacer
              </Button>
            </label>
          </Box>

          <Button onClick={demanderFermeture} color="inherit" disabled={enCours}>Fermer</Button>
          <Tooltip title="Ctrl/Cmd + S" arrow>
            <span>
              <Button
                variant="contained"
                onClick={toutSauvegarder}
                disabled={enCours || !modificationsNonSauvegardees}
                sx={{ minWidth: 150 }}
              >
                {enCours ? 'Enregistrement…' : 'Sauvegarder'}
              </Button>
            </span>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Main Canvas Area */}
      <Box sx={{ 
        position: 'relative',
        minHeight: 'calc(100vh - 64px - 32px)',
        pt: 2,
        pb: 8,
      }}>
        <Box sx={{ maxWidth: 1000, mx: 'auto', px: { xs: 2, sm: 4 } }}>
          <ImageEditorCanvas
            urlImage={urlAffichee}
            actions={showAnnotations ? actions : []}
            onDeplace={deplacerAction}
            onRedimensionne={redimensionnerAction}
            onSupprime={supprimerUneAction}
            actionSelectionneeId={actionSelectionneeId}
            onSelectionnerAction={setActionSelectionneeId}
            maxHeight="calc(100vh - 300px)"
            onDimensionsChargees={setDimensionsNaturelles}
            zoom={zoom}
            onZoomChange={setZoom}
            onCursorPosition={setCursorPosition}
          />

          {/* Description Panel - Below Image */}
          <Paper
            variant="outlined"
            sx={{
              mt: 2,
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <Box sx={{ p: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (erreur) setErreur('');
                }}
                error={Boolean(erreur)}
                helperText={erreur}
                disabled={enCours}
              />
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Floating Panels */}
      <ToolPanel
        visible={estVisible('outils')}
        onToggle={() => togglePanel('outils')}
        onAjouterAction={ajouterAction}
        derniereTypeAjoute={dernierTypeAjoute}
        position={getPosition('outils')}
        onMove={(x, y) => movePanel('outils', x, y)}
      />

      <PropertiesPanel
        visible={estVisible('proprietes')}
        onToggle={() => togglePanel('proprietes')}
        actionSelectionnee={actionSelectionnee}
        couleurChoisie={couleurChoisie}
        onChangeCouleur={changerCouleur}
        position={getPosition('proprietes')}
        onMove={(x, y) => movePanel('proprietes', x, y)}
      />

      <HistoryPanel
        visible={estVisible('historique')}
        onToggle={() => togglePanel('historique')}
        historique={historique}
        index={historique.length - 1}
        position={getPosition('historique')}
        onMove={(x, y) => movePanel('historique', x, y)}
      />

      <LayersPanel
        visible={estVisible('calques')}
        onToggle={() => togglePanel('calques')}
        actions={actions}
        actionSelectionneeId={actionSelectionneeId}
        onSelectionnerAction={setActionSelectionneeId}
        onToggleVisibility={(id) => {
          setActions(prev => prev.map(a => a.id === id ? { ...a, visible: a.visible === false ? true : false } : a));
        }}
        onToggleLock={(id) => {
          setActions(prev => prev.map(a => a.id === id ? { ...a, locked: !a.locked } : a));
        }}
        position={getPosition('calques')}
        onMove={(x, y) => movePanel('calques', x, y)}
      />

      {/* Status Bar */}
      <StatusBar
        image={image}
        zoom={zoom}
        dimensions={dimensionsNaturelles}
        actionsCount={actions.length}
        cursorPosition={cursorPosition}
        onShowInfo={() => setHelpDialogOpen(true)}
      />

      {/* Context Menu */}
      <ContextMenu
        anchorPosition={contextMenuAnchor ? { top: contextMenuAnchor.mouseY, left: contextMenuAnchor.mouseX } : null}
        open={Boolean(contextMenuAnchor)}
        onClose={() => setContextMenuAnchor(null)}
        onCopy={() => {}}
        onPaste={() => {}}
        onDelete={() => actionSelectionneeId && supprimerUneAction(actionSelectionneeId)}
        onEdit={() => {}}
        onLock={() => {}}
        onUnlock={() => {}}
        onShow={() => {}}
        onHide={() => {}}
        onBringToFront={() => {}}
        onSendToBack={() => {}}
        onZoomIn={() => setZoom(prev => Math.min(prev + 0.25, 4))}
        onZoomOut={() => setZoom(prev => Math.max(prev - 0.25, 0.25))}
        canPaste={false}
        hasSelection={Boolean(actionSelectionneeId)}
        isLocked={actionSelectionnee?.locked}
        isVisible={actionSelectionnee?.visible !== false}
      />

      {/* Quick Actions Menu */}
      <QuickActions
        anchorEl={quickActionsAnchor}
        open={Boolean(quickActionsAnchor)}
        onClose={() => setQuickActionsAnchor(null)}
        onCopy={() => {}}
        onPaste={() => {}}
        onDelete={() => actionSelectionneeId && supprimerUneAction(actionSelectionneeId)}
        onLock={() => {}}
        onUnlock={() => {}}
        onShow={() => {}}
        onHide={() => {}}
        onBringToFront={() => {}}
        onSendToBack={() => {}}
        canPaste={false}
        isLocked={actionSelectionnee?.locked}
        isVisible={actionSelectionnee?.visible !== false}
      />

      {/* Help Dialog */}
      <Dialog open={helpDialogOpen} onClose={() => setHelpDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Raccourcis clavier</DialogTitle>
        <DialogContent>
          <Stack spacing={1}>
            <Typography variant="caption"><b>Ctrl+Z</b> : Annuler</Typography>
            <Typography variant="caption"><b>Ctrl+Y</b> : Rétablir</Typography>
            <Typography variant="caption"><b>Ctrl+S</b> : Sauvegarder</Typography>
            <Typography variant="caption"><b>Suppr</b> : Supprimer sélection</Typography>
            <Typography variant="caption"><b>Échap</b> : Désélectionner</Typography>
            <Typography variant="caption"><b>H</b> : Toggle Historique</Typography>
            <Typography variant="caption"><b>L</b> : Toggle Calques</Typography>
            <Typography variant="caption"><b>P</b> : Toggle Propriétés</Typography>
            <Typography variant="caption"><b>T</b> : Toggle Outils</Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpDialogOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ImageEditPage;