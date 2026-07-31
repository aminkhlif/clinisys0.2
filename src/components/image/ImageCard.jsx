// src/components/image/ImageCard.jsx
import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Card, CardMedia, CardContent, CardActions, Checkbox, Typography, IconButton, Box,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';

function ImageCard({ image, selectionnee, onBasculerSelection, onOuvrirDetail, onOuvrirActions }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id });
  const [imageErreur, setImageErreur] = useState(false);
  const [useThumbnail, setUseThumbnail] = useState(true);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    cursor: 'grab',
  };

  const urlImage = image.donneesBase64 
    ? `data:${image.typeContenu};base64,${image.donneesBase64}`
    : image.url;
  const urlThumbnail = image.id ? `/api/images/${image.id}/thumbnail` : urlImage;
  const urlDisplay = useThumbnail && image.id ? urlThumbnail : urlImage;
  const aDesDonnees = Boolean(urlImage);

  const handleImageError = () => {
    if (useThumbnail && image.id) {
      setUseThumbnail(false); // Fallback to original image
    } else {
      setImageErreur(true);
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        borderRadius: 2,
        outline: selectionnee ? '2px solid #059669' : 'none',
        outlineOffset: -1,
        transition: 'all 0.2s ease',
        '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ position: 'relative', height: 160, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Checkbox
          checked={selectionnee}
          onClick={(e) => { e.stopPropagation(); onBasculerSelection(); }}
          onPointerDown={(e) => e.stopPropagation()}
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            bgcolor: 'rgba(255,255,255,0.9)',
            borderRadius: 1,
            p: 0.5,
            zIndex: 2,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
          }}
        />
        {aDesDonnees && !imageErreur ? (
          <CardMedia
            component="img"
            height="160"
            image={urlDisplay}
            alt={image.nom}
            onError={handleImageError}
            loading="lazy"
            sx={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        ) : (
          <Box sx={{ textAlign: 'center', color: 'grey.400' }}>
            <BrokenImageOutlinedIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
            <Typography variant="caption" display="block" sx={{ fontWeight: 500 }}>Image indisponible</Typography>
          </Box>
        )}
      </Box>
      <CardContent sx={{ py: 1.5, px: 2, flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2" noWrap sx={{ color: 'text.primary', fontWeight: 600, width: '100%' }}>
          {image.nom}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', px: 1, pb: 1, pt: 0, borderTop: '1px solid', borderColor: 'divider' }} onPointerDown={(e) => e.stopPropagation()}>
        <IconButton size="small" onClick={onOuvrirDetail} sx={{ '&:hover': { bgcolor: 'primary.50', color: 'primary.main' } }}>
          <VisibilityOutlinedIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={onOuvrirActions} sx={{ '&:hover': { bgcolor: 'primary.50', color: 'primary.main' } }}>
          <TuneOutlinedIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
}

export default ImageCard;