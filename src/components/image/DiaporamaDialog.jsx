// src/components/image/DiaporamaDialog.jsx
import { useEffect, useState, useRef } from 'react';
import { Dialog, Box, IconButton, Typography, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

const DUREE_PAR_IMAGE_MS = 3000;
const PAS_MS = 30;

function DiaporamaDialog({ ouvert, images, onFermer }) {
  const [indexActuel, setIndexActuel] = useState(0);
  const [enLecture, setEnLecture] = useState(true);
  const [progression, setProgression] = useState(0);
  const nombreImages = images.length;
  const nombreImagesRef = useRef(nombreImages);
  nombreImagesRef.current = nombreImages;

  useEffect(() => {
    if (!ouvert) return;
    setIndexActuel(0);
    setEnLecture(true);
    setProgression(0);
  }, [ouvert]);

  // Un seul minuteur stable, jamais recréé au changement d'image (évite le saut de 2 images)
  useEffect(() => {
    if (!ouvert || nombreImages === 0 || !enLecture) return undefined;

    const intervalle = setInterval(() => {
      setProgression((prev) => {
        const suivante = prev + (PAS_MS / DUREE_PAR_IMAGE_MS) * 100;
        if (suivante >= 100) {
          setIndexActuel((i) => (i + 1) % nombreImagesRef.current);
          return 0;
        }
        return suivante;
      });
    }, PAS_MS);

    return () => clearInterval(intervalle);
  }, [ouvert, nombreImages, enLecture]);

  const precedent = () => {
    setProgression(0);
    setIndexActuel((prev) => (prev - 1 + nombreImages) % nombreImages);
  };
  const suivant = () => {
    setProgression(0);
    setIndexActuel((prev) => (prev + 1) % nombreImages);
  };

  useEffect(() => {
    if (!ouvert) return undefined;
    const gererClavier = (e) => {
      if (e.key === 'ArrowLeft') precedent();
      else if (e.key === 'ArrowRight') suivant();
      else if (e.key === ' ') { e.preventDefault(); setEnLecture((p) => !p); }
      else if (e.key === 'Escape') onFermer();
    };
    window.addEventListener('keydown', gererClavier);
    return () => window.removeEventListener('keydown', gererClavier);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ouvert, nombreImages]);

  if (!ouvert || nombreImages === 0) return null;

  const imageActuelle = images[indexActuel];
  const urlImage = imageActuelle.donneesBase64 ? `data:${imageActuelle.typeContenu};base64,${imageActuelle.donneesBase64}` : imageActuelle.url;

  return (
    <Dialog open={ouvert} onClose={onFermer} fullScreen>
      <Box sx={{ position: 'relative', height: '100vh', bgcolor: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Barre de progression segmentée */}
        <Stack direction="row" spacing={0.75} sx={{ position: 'absolute', top: 24, left: 32, right: 32, zIndex: 2 }}>
          {images.map((img, i) => (
            <Box key={img.id} sx={{ flex: 1, height: 3, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' }}>
              <Box
                sx={{
                  height: '100%',
                  bgcolor: 'background.paper',
                  width: i < indexActuel ? '100%' : i === indexActuel ? `${progression}%` : '0%',
                  transition: i === indexActuel ? 'width 30ms linear' : 'none',
                }}
              />
            </Box>
          ))}
        </Stack>

        <IconButton
          onClick={onFermer}
          sx={{ position: 'absolute', top: 40, right: 28, zIndex: 2, color: 'background.paper', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
        >
          <CloseIcon />
        </IconButton>

        <IconButton
          onClick={precedent}
          sx={{ position: 'absolute', left: 24, zIndex: 2, color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'background.paper', bgcolor: 'rgba(255,255,255,0.1)' } }}
        >
          <ChevronLeftIcon fontSize="large" />
        </IconButton>
        <IconButton
          onClick={suivant}
          sx={{ position: 'absolute', right: 24, zIndex: 2, color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'background.paper', bgcolor: 'rgba(255,255,255,0.1)' } }}
        >
          <ChevronRightIcon fontSize="large" />
        </IconButton>

        {/* Zone image, laisse une marge nette avant le bandeau de description */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: '6%',
            pt: '6%',
            pb: '16%',
          }}
        >
          <Box
            key={imageActuelle.id}
            component="img"
            src={urlImage}
            alt={imageActuelle.nom}
            sx={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: 2,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              animation: 'fadeInSlide 320ms ease',
              '@keyframes fadeInSlide': {
                from: { opacity: 0, transform: 'scale(0.985)' },
                to: { opacity: 1, transform: 'scale(1)' },
              },
            }}
          />
        </Box>

        {/* Bandeau inférieur avec dégradé, nettement séparé de l'image */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            pt: 6,
            pb: 3.5,
            background: 'linear-gradient(to top, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.75) 55%, transparent 100%)',
          }}
        >
          <Stack spacing={2} alignItems="center">
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: '0.9rem',
                px: 4,
                maxWidth: 720,
                textAlign: 'center',
                lineHeight: 1.6,
              }}
            >
              {imageActuelle.description}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton
                onClick={() => setEnLecture((p) => !p)}
                size="small"
                sx={{ color: 'background.paper', bgcolor: 'rgba(255,255,255,0.12)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
              >
                {enLecture ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
              </IconButton>
              <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.02em' }}>
                {indexActuel + 1} / {nombreImages}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Dialog>
  );
}

export default DiaporamaDialog;