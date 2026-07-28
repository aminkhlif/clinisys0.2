// src/components/image/ImageActionsDialog.jsx
import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Stack, Typography, Grid, Chip,
  IconButton, Tooltip, CircularProgress, Paper,
} from '@mui/material';
import BlurOnOutlinedIcon from '@mui/icons-material/BlurOnOutlined';
import CropSquareOutlinedIcon from '@mui/icons-material/CropSquareOutlined';
import CenterFocusWeakOutlinedIcon from '@mui/icons-material/CenterFocusWeakOutlined';
import AdsClickOutlinedIcon from '@mui/icons-material/AdsClickOutlined';
import NearMeOutlinedIcon from '@mui/icons-material/NearMeOutlined';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { useSnackbar } from 'notistack';
import axiosClient from '../../api/axiosClient.js';
import {
  listerActions, creerAction, modifierAction, supprimerAction, validerActions, annulerActions,
} from '../../api/actionsClient.js';
import { CONFIG_ACTIONS, LISTE_ACTIONS } from './configActions.js';
import ImageEditorCanvas from './ImageEditorCanvas.jsx';

const ICONE_ACTION = {
  FLOU: BlurOnOutlinedIcon,
  RECTANGLE: CropSquareOutlinedIcon,
  FOCUS: CenterFocusWeakOutlinedIcon,
  CURSEUR_STATIQUE: NearMeOutlinedIcon,
  CURSEUR_STATIQUE_BLANC: NearMeOutlinedIcon,
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

function ImageActionsDialog({ image, onFermer, onSauvegarde }) {
  const { enqueueSnackbar } = useSnackbar();
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

  useEffect(() => {
    if (image) {
      setDescription(image.description);
      setNouveauFichier(null);
      setErreur('');
      setActionSelectionneeId(null);
      setCouleurChoisie(COULEUR_PAR_DEFAUT);
      chargerActions();
    }
  }, [image]);

  // Génère et nettoie l'aperçu du nouveau fichier (objectURL révoqué au changement/démontage)
  useEffect(() => {
    if (!nouveauFichier) {
      setApercuNouveauFichier(null);
      return;
    }
    const url = URL.createObjectURL(nouveauFichier);
    setApercuNouveauFichier(url);
    return () => URL.revokeObjectURL(url);
  }, [nouveauFichier]);

  const chargerActions = async () => {
    if (!image) return;
    const data = await listerActions(image.id);
    setActions(data);
  };

  if (!image) return null;

  const urlAffichee = apercuNouveauFichier || `data:${image.typeContenu};base64,${image.donneesBase64}`;

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

  // Changement de couleur en temps réel :
  // - si une annotation compatible est sélectionnée, sa couleur change immédiatement (aperçu + sauvegarde serveur)
  // - sinon, ça définit juste la couleur des prochaines annotations créées
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

  // Un seul bouton "Sauvegarder" : description + fichier + validation des annotations
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

      onSauvegarde();
      enqueueSnackbar('Modifications enregistrées', { variant: 'success' });
    } catch (err) {
      setErreur(err.response?.data?.description || 'Une erreur est survenue');
    } finally {
      setEnCours(false);
    }
  };

  const fermer = () => {
    if (enCours) return;
    onFermer();
  };

  return (
    <Dialog
      open={Boolean(image)}
      onClose={fermer}
      fullWidth
      maxWidth="lg"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        Édition de la capture
        <IconButton size="small" onClick={fermer} disabled={enCours} sx={{ ml: 2 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ mb: 2 }}>
              <ImageEditorCanvas
                urlImage={urlAffichee}
                actions={actions}
                onDeplace={deplacerAction}
                onRedimensionne={redimensionnerAction}
                onSupprime={supprimerUneAction}
                actionSelectionneeId={actionSelectionneeId}
                onSelectionnerAction={setActionSelectionneeId}
              />
            </Box>
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
            <Paper variant="outlined" sx={{ borderRadius: 3, p: 2, mb: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={600}>Annotations</Typography>
                {actions.length > 0 && (
                  <Chip size="small" label={`${actions.length} posée${actions.length > 1 ? 's' : ''}`} sx={{ fontWeight: 600 }} />
                )}
              </Stack>

              <Grid container spacing={1} sx={{ mb: typeNecessiteCouleur ? 2 : 0.5 }}>
                {LISTE_ACTIONS.map((type) => {
                  const Icone = ICONE_ACTION[type];
                  const vientEtreAjoute = dernierTypeAjoute === type;
                  return (
                    <Grid size={6} key={type}>
                      <Tooltip title={`Ajouter : ${CONFIG_ACTIONS[type].label}`} arrow placement="top">
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<Icone fontSize="small" />}
                          onClick={() => ajouterAction(type)}
                          sx={{
                            fontSize: '0.75rem',
                            justifyContent: 'flex-start',
                            textTransform: 'none',
                            borderColor: vientEtreAjoute ? 'primary.main' : 'action.disabledBackground',
                            bgcolor: vientEtreAjoute ? 'primary.50' : 'transparent',
                            transition: 'all 160ms ease',
                            '&:hover': { borderColor: 'grey.500', bgcolor: 'background.paper' },
                          }}
                        >
                          {CONFIG_ACTIONS[type].label}
                        </Button>
                      </Tooltip>
                    </Grid>
                  );
                })}
              </Grid>

              {typeNecessiteCouleur && (
                <Box sx={{ mb: 2, p: 1.5, bgcolor: 'background.paper', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    {selectionAcceptesCouleur ? 'Couleur de l\'annotation sélectionnée' : 'Couleur de la prochaine annotation'}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 1.5 }}>
                    <Box
                      component="input"
                      type="color"
                      value={selectionAcceptesCouleur ? (actionSelectionnee.couleur || COULEUR_PAR_DEFAUT) : couleurChoisie}
                      onChange={(e) => changerCouleur(e.target.value)}
                      sx={{
                        width: 36, height: 28, border: '1px solid', borderColor: 'divider',
                        borderRadius: 1, p: 0, cursor: 'pointer', bgcolor: 'transparent',
                      }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                      {(selectionAcceptesCouleur ? (actionSelectionnee.couleur || COULEUR_PAR_DEFAUT) : couleurChoisie).toUpperCase()}
                    </Typography>
                  </Stack>
                </Box>
              )}

              <Stack direction="row" spacing={1}>
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
            </Paper>

            <Paper variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                Remplacer l'image
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
                  gap: 0.75,
                  py: nouveauFichier ? 1.5 : 2.5,
                  px: 2,
                  border: '1.5px dashed',
                  borderColor: survolFichier ? 'primary.main' : 'action.disabledBackground',
                  bgcolor: survolFichier ? 'primary.50' : 'transparent',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 140ms ease',
                  overflow: 'hidden',
                  '&:hover': { borderColor: 'grey.400' },
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
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <InsertDriveFileOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                        {nouveauFichier.name} · {formaterTaille(nouveauFichier.size)}
                      </Typography>
                    </Stack>
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
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={fermer} disabled={enCours} color="inherit">Fermer</Button>
        <Button
          variant="contained"
          onClick={toutSauvegarder}
          disabled={enCours}
          startIcon={enCours ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ minWidth: 150 }}
        >
          {enCours ? 'Enregistrement…' : 'Sauvegarder'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ImageActionsDialog;