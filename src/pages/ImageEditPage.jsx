// src/pages/ImageEditPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, IconButton, Typography, Button, TextField, Stack, Grid, Chip,
  Skeleton, Breadcrumbs, Tooltip, Fade, Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BlurOnOutlinedIcon from '@mui/icons-material/BlurOnOutlined';
import CropSquareOutlinedIcon from '@mui/icons-material/CropSquareOutlined';
import CenterFocusWeakOutlinedIcon from '@mui/icons-material/CenterFocusWeakOutlined';
import AdsClickOutlinedIcon from '@mui/icons-material/AdsClickOutlined';
import NearMeOutlinedIcon from '@mui/icons-material/NearMeOutlined';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import CircleIcon from '@mui/icons-material/Circle';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import { useSnackbar } from 'notistack';
import axiosClient from '../api/axiosClient.js';
import {
  listerActions, creerAction, modifierAction, supprimerAction, validerActions, annulerActions,
} from '../api/actionsClient.js';
import { CONFIG_ACTIONS, LISTE_ACTIONS } from '../components/image/configActions.js';
import ImageEditorCanvas from '../components/image/ImageEditorCanvas.jsx';
import { dotGridBackgroundSx } from '../theme/backgrounds.js';

const ICONE_ACTION = {
  FLOU: BlurOnOutlinedIcon,
  RECTANGLE: CropSquareOutlinedIcon,
  FOCUS: CenterFocusWeakOutlinedIcon,
  CURSEUR_STATIQUE: NearMeOutlinedIcon,
  CURSEUR_CLICK: AdsClickOutlinedIcon,
};

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
    setTimeout(() => setDernierTypeAjoute(null), 900);
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

      if (actions.length > 0) {
        await validerActions(image.id);
      }

      enqueueSnackbar('Modifications enregistrées', { variant: 'success' });
      setNouveauFichier(null);
      setActionSelectionneeId(null);
      setVientDeSauvegarder(true);
      setTimeout(() => setVientDeSauvegarder(false), 1600);
      await chargerImage();
      await chargerActions();
    } catch (err) {
      setErreur(err.response?.data?.description || 'Une erreur est survenue');
    } finally {
      setEnCours(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', ...dotGridBackgroundSx }}>
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
                  <CheckCircleOutlineIcon sx={{ fontSize: 14, color: 'success.main' }} />
                  <Typography variant="caption" sx={{ color: 'success.main' }}>Enregistré</Typography>
                </Stack>
              </Fade>
            </Stack>
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

      <Box sx={{ maxWidth: 1300, mx: 'auto', p: { xs: 2, sm: 4 } }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ mb: 1.5 }}>
              <ImageEditorCanvas
                urlImage={urlAffichee}
                actions={actions}
                onDeplace={deplacerAction}
                onRedimensionne={redimensionnerAction}
                onSupprime={supprimerUneAction}
                actionSelectionneeId={actionSelectionneeId}
                onSelectionnerAction={setActionSelectionneeId}
                maxHeight="calc(100vh - 320px)"
                onDimensionsChargees={setDimensionsNaturelles}
              />
            </Box>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <ImageOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {image.nom}
                  {dimensionsNaturelles && ` · ${dimensionsNaturelles.largeur}×${dimensionsNaturelles.hauteur}px`}
                </Typography>
              </Stack>
              {nouveauFichier && (
                <Chip
                  size="small"
                  icon={<InsertDriveFileOutlinedIcon sx={{ fontSize: 14 }} />}
                  label={`Nouveau fichier · ${formaterTaille(nouveauFichier.size)}`}
                  onDelete={(e) => retirerNouveauFichier(e)}
                  sx={{ fontSize: '0.7rem' }}
                />
              )}
            </Stack>

            <TextField
              fullWidth
              multiline
              rows={2}
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
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ position: { md: 'sticky' }, top: { md: 88 } }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: 2, mb: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight={600}>Annotations</Typography>
                  {actions.length > 0 && (
                    <Chip
                      size="small"
                      label={`${actions.length} posée${actions.length > 1 ? 's' : ''}`}
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </Stack>

                <Grid container spacing={1.5} sx={{ mb: typeNecessiteCouleur ? 2.5 : 1 }}>
                  {LISTE_ACTIONS.map((type) => {
                    const Icone = ICONE_ACTION[type];
                    const vientEtreAjoute = dernierTypeAjoute === type;
                    return (
                      <Grid size={{ xs: 6, sm: 4, md: 6, lg: 4 }} key={type}>
                        <Tooltip title={`Ajouter : ${CONFIG_ACTIONS[type].label}`} arrow placement="top">
                          <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => ajouterAction(type)}
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              py: 1.5,
                              px: 1,
                              height: 76,
                              borderColor: vientEtreAjoute ? 'primary.main' : 'divider',
                              bgcolor: vientEtreAjoute ? 'primary.50' : 'background.paper',
                              color: vientEtreAjoute ? 'primary.main' : 'text.secondary',
                              transition: 'all 0.2s ease',
                              '&:hover': { 
                                borderColor: 'primary.main', 
                                bgcolor: 'primary.50',
                                color: 'primary.main',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                              },
                            }}
                          >
                            <Icone sx={{ fontSize: 26, mb: 0.5 }} />
                            <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600, lineHeight: 1.1, textAlign: 'center' }}>
                              {CONFIG_ACTIONS[type].label}
                            </Typography>
                          </Button>
                        </Tooltip>
                      </Grid>
                    );
                  })}
                </Grid>

                {typeNecessiteCouleur && (() => {
                  const PRESET_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#000000', 'background.paper'];
                  return (
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1.5 }}>
                        {selectionAcceptesCouleur ? "Couleur de l'annotation sélectionnée" : 'Couleur de la prochaine annotation'}
                      </Typography>
                      <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
                        {PRESET_COLORS.map(c => {
                          const isSelected = (selectionAcceptesCouleur ? (actionSelectionnee.couleur || COULEUR_PAR_DEFAUT) : couleurChoisie).toUpperCase() === c;
                          return (
                            <Box
                              key={c}
                              onClick={() => changerCouleur(c)}
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                bgcolor: c,
                                cursor: 'pointer',
                                border: '2px solid',
                                borderColor: isSelected ? 'primary.main' : (c === 'background.paper' ? 'grey.300' : 'transparent'),
                                boxShadow: isSelected ? '0 0 0 2px rgba(59,130,246,0.2)' : '0 1px 3px rgba(0,0,0,0.1)',
                                transition: 'transform 0.1s, border-color 0.1s',
                                position: 'relative',
                                '&:hover': { transform: 'scale(1.15)' },
                                '&::after': isSelected ? {
                                  content: '""', position: 'absolute', top: '50%', left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  width: 8, height: 8, borderRadius: '50%',
                                  bgcolor: c === 'background.paper' ? 'primary.main' : 'background.paper'
                                } : {}
                              }}
                            />
                          );
                        })}
                        <Box
                          component="input"
                          type="color"
                          value={selectionAcceptesCouleur ? (actionSelectionnee.couleur || COULEUR_PAR_DEFAUT) : couleurChoisie}
                          onChange={(e) => changerCouleur(e.target.value)}
                          sx={{
                            ml: 'auto', width: 28, height: 28, border: '1px solid', borderColor: 'divider',
                            borderRadius: 1, p: 0, cursor: 'pointer', bgcolor: 'transparent',
                            '&::-webkit-color-swatch-wrapper': { p: 0 },
                            '&::-webkit-color-swatch': { border: 'none', borderRadius: 0.5 },
                          }}
                        />
                      </Stack>
                    </Box>
                  );
                })()}

                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <Button
                    fullWidth
                    size="small"
                    color="inherit"
                    startIcon={<UndoOutlinedIcon fontSize="small" />}
                    onClick={annulerDerniereAction}
                    disabled={actions.length === 0}
                    sx={{ textTransform: 'none' }}
                  >
                    Dernière
                  </Button>
                  <Button
                    fullWidth
                    size="small"
                    color="inherit"
                    startIcon={<DeleteSweepOutlinedIcon fontSize="small" />}
                    onClick={annulerToutesLesActions}
                    disabled={actions.length === 0}
                    sx={{ textTransform: 'none' }}
                  >
                    Tout annuler
                  </Button>
                </Stack>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Sélectionnez une annotation, puis <b>Suppr</b> pour l'effacer ou <b>Échap</b> pour désélectionner.
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                  Remplacer la capture
                </Typography>
                <Box
                  component={nouveauFichier ? 'div' : 'label'}
                  onDragOver={(e) => { e.preventDefault(); setSurvolFichier(true); }}
                  onDragLeave={() => setSurvolFichier(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setSurvolFichier(false);
                    choisirFichier(e.dataTransfer.files?.[0]);
                  }}
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.5,
                    py: nouveauFichier ? 2 : 4,
                    px: 2,
                    border: '2px dashed',
                    borderColor: survolFichier ? 'primary.main' : 'grey.300',
                    bgcolor: survolFichier ? 'primary.50' : 'background.paper',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    overflow: 'hidden',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' },
                  }}
                >
                  {nouveauFichier ? (
                    <>
                      <IconButton
                        size="small"
                        onClick={retirerNouveauFichier}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(0,0,0,0.55)',
                          color: '#fff',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                      {apercuNouveauFichier && (
                        <Box
                          component="img"
                          src={apercuNouveauFichier}
                          alt="Aperçu"
                          sx={{ maxHeight: 90, maxWidth: '100%', borderRadius: 1, objectFit: 'contain' }}
                        />
                      )}
                      <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                        {nouveauFichier.name} · {formaterTaille(nouveauFichier.size)}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <UploadFileOutlinedIcon sx={{ color: 'grey.500', fontSize: 20 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                        Glissez une image, ou cliquez pour parcourir
                      </Typography>
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => choisirFichier(e.target.files[0])}
                      />
                    </>
                  )}
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default ImageEditPage;