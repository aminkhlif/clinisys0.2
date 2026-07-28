// src/pages/SousMenuPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Stack, Typography, Button, TextField, InputAdornment, Chip, Skeleton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import MovieCreationOutlinedIcon from '@mui/icons-material/MovieCreationOutlined';
import { useSnackbar } from 'notistack';
import axiosClient from '../api/axiosClient.js';
import ImageGrid from '../components/image/ImageGrid.jsx';
import ImageUploadDialog from '../components/image/ImageUploadDialog.jsx';
import ImageDetailDialog from '../components/image/ImageDetailDialog.jsx';
import DiaporamaDialog from '../components/image/DiaporamaDialog.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';

function SousMenuPage() {
  const { moduleId, sousMenuId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [sousMenu, setSousMenu] = useState(null);
  const [images, setImages] = useState([]);
  const [chargementImages, setChargementImages] = useState(true);
  const [selectionnees, setSelectionnees] = useState([]);
  const [recherche, setRecherche] = useState('');

  const [dialogUploadOuvert, setDialogUploadOuvert] = useState(false);
  const [imageDetail, setImageDetail] = useState(null);
  const [diaporamaOuvert, setDiaporamaOuvert] = useState(false);
  const [confirmationSuppression, setConfirmationSuppression] = useState(false);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);

  const chargerSousMenu = async () => {
    const res = await axiosClient.get(`/sous-menus/${sousMenuId}`);
    setSousMenu(res.data);
  };

  const chargerImages = async (termeRecherche = '') => {
    setChargementImages(true);
    try {
      const params = termeRecherche ? { sousMenuId, description: termeRecherche } : { sousMenuId };
      const res = await axiosClient.get('/images', { params });
      setImages(res.data);
    } finally {
      setChargementImages(false);
    }
  };

  useEffect(() => {
    if (!sousMenuId) return;
    setSelectionnees([]);
    setRecherche('');
    chargerSousMenu();
    chargerImages();
  }, [sousMenuId]);

  useEffect(() => {
    const delai = setTimeout(() => {
      chargerImages(recherche);
    }, 300);
    return () => clearTimeout(delai);
  }, [recherche]);

  const confirmerSuppressionSelectionnees = async () => {
    setSuppressionEnCours(true);
    try {
      await axiosClient.delete('/images', { params: { ids: selectionnees }, paramsSerializer: { indexes: null } });
      setSelectionnees([]);
      enqueueSnackbar(`${selectionnees.length} image(s) supprimée(s)`, { variant: 'success' });
      chargerImages(recherche);
    } catch {
      enqueueSnackbar('La suppression a échoué', { variant: 'error' });
    } finally {
      setSuppressionEnCours(false);
      setConfirmationSuppression(false);
    }
  };

  const genererVideo = async () => {
    try {
      await axiosClient.patch(`/sous-menus/${sousMenuId}/video`, null, { params: { genere: true } });
      setSousMenu(prev => ({ ...prev, videoGeneree: true }));
      enqueueSnackbar('Vidéo générée', { variant: 'success' });
      chargerSousMenu();
    } catch {
      enqueueSnackbar('La génération a échoué', { variant: 'error' });
    }
  };

  const devaliderVideo = async () => {
    try {
      await axiosClient.patch(`/sous-menus/${sousMenuId}/video`, null, { params: { genere: false } });
      setSousMenu(prev => ({ ...prev, videoGeneree: false }));
      enqueueSnackbar('Vidéo dévalidée', { variant: 'success' });
      chargerSousMenu();
    } catch {
      enqueueSnackbar("L'opération a échoué", { variant: 'error' });
    }
  };

  if (!sousMenu) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>
        <Skeleton variant="text" width={240} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={44} width={350} sx={{ mb: 3 }} />
        <Stack direction="row" flexWrap="wrap" gap={2}>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="rounded" width={200} height={180} />
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>
      {/* En-tête de la page */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 1, color: 'text.primary' }}>
            {sousMenu.nom}
          </Typography>
          <Chip
            size="small"
            label={sousMenu.videoGeneree ? 'Vidéo générée' : 'Vidéo non générée'}
            color={sousMenu.videoGeneree ? 'success' : 'default'}
            sx={{
              fontWeight: 500,
              fontSize: '0.75rem',
              bgcolor: sousMenu.videoGeneree ? 'success.50' : 'action.hover',
              color: sousMenu.videoGeneree ? 'success.700' : 'text.secondary',
              border: '1px solid',
              borderColor: sousMenu.videoGeneree ? 'success.200' : 'divider',
            }}
          />
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            startIcon={<PlayArrowIcon />}
            variant="outlined"
            onClick={() => setDiaporamaOuvert(true)}
            disabled={images.length === 0}
            sx={{ bgcolor: 'background.paper', height: 40 }}
          >
            Aperçu
          </Button>
          {sousMenu.videoGeneree ? (
            <Button variant="outlined" color="error" onClick={devaliderVideo} sx={{ bgcolor: 'background.paper', height: 40 }}>
              Dévalider la vidéo
            </Button>
          ) : (
            <Button
              startIcon={<MovieCreationOutlinedIcon />}
              variant="contained"
              onClick={genererVideo}
              disabled={images.length === 0}
              sx={{ height: 40 }}
            >
              Générer la vidéo
            </Button>
          )}
        </Stack>
      </Box>

      {/* Barre d'outils (Filtres & Actions) */}
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', md: 'center' }, 
        gap: 2, 
        bgcolor: 'background.paper', 
        p: 2, 
        borderRadius: 2, 
        border: '1px solid', 
        borderColor: 'divider' 
      }}>
        <TextField
          size="small"
          placeholder="Rechercher une capture…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: { xs: '100%', md: 320 }, '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
        />
        <Stack direction="row" spacing={1.5}>
          {selectionnees.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => setConfirmationSuppression(true)}
              sx={{ height: 40, px: 3 }}
            >
              Supprimer ({selectionnees.length})
            </Button>
          )}
          <Button
            startIcon={<AddPhotoAlternateIcon />}
            variant="contained"
            color="primary"
            onClick={() => setDialogUploadOuvert(true)}
            id="tour-ajouter-capture"
            sx={{ height: 40, px: 3 }}
          >
            Ajouter une capture
          </Button>
        </Stack>
      </Box>

      {/* Contenu principal */}
      {chargementImages ? (
        <Stack direction="row" flexWrap="wrap" gap={2}>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="rounded" width={200} height={180} />
          ))}
        </Stack>
      ) : images.length === 0 ? (
        <Box
          sx={{
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 3,
            py: 8,
            textAlign: 'center',
          }}
        >
          <Typography sx={{ color: 'text.secondary' }}>
            {recherche ? 'Aucune image ne correspond à cette recherche' : 'Aucune capture pour le moment'}
          </Typography>
        </Box>
      ) : (
        <ImageGrid
          images={images}
          selectionnees={selectionnees}
          onChangerSelection={setSelectionnees}
          onReordonne={setImages}
          onOuvrirDetail={setImageDetail}
          onOuvrirActions={(img) => navigate(`/modules/${moduleId}/sous-menus/${sousMenuId}/images/${img.id}`)}
        />
      )}

      <ImageUploadDialog
        ouvert={dialogUploadOuvert}
        sousMenuId={sousMenuId}
        onFermer={() => setDialogUploadOuvert(false)}
        onSauvegarde={() => {
          setDialogUploadOuvert(false);
          chargerImages(recherche);
          enqueueSnackbar('Capture ajoutée', { variant: 'success' });
        }}
      />

      <ImageDetailDialog
        image={imageDetail}
        onFermer={() => setImageDetail(null)}
        onModifie={() => chargerImages(recherche)}
        onOuvrirActions={(img) => {
          setImageDetail(null);
          navigate(`/modules/${moduleId}/sous-menus/${sousMenuId}/images/${img.id}`);
        }}
      />

      <DiaporamaDialog
        ouvert={diaporamaOuvert}
        images={images}
        onFermer={() => setDiaporamaOuvert(false)}
      />
      <ConfirmDialog
        ouvert={confirmationSuppression}
        titre="Supprimer les images sélectionnées ?"
        message={`${selectionnees.length} image(s) seront supprimées définitivement.`}
        onConfirmer={confirmerSuppressionSelectionnees}
        onAnnuler={() => setConfirmationSuppression(false)}
        enCours={suppressionEnCours}
      />
</Box>
  );
}

export default SousMenuPage;