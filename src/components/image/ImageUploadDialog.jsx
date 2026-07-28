// src/components/image/ImageUploadDialog.jsx
import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Typography,
  IconButton, CircularProgress,
} from '@mui/material';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import axiosClient from '../../api/axiosClient.js';

function formaterTaille(octets) {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(1)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
}

function ImageUploadDialog({ ouvert, sousMenuId, onFermer, onSauvegarde }) {
  const [fichier, setFichier] = useState(null);
  const [apercu, setApercu] = useState(null);
  const [description, setDescription] = useState('');
  const [erreur, setErreur] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [survole, setSurvole] = useState(false);

  useEffect(() => {
    if (!fichier) {
      setApercu(null);
      return;
    }
    const url = URL.createObjectURL(fichier);
    setApercu(url);
    return () => URL.revokeObjectURL(url);
  }, [fichier]);

  const reinitialiser = () => {
    setFichier(null);
    setDescription('');
    setErreur('');
  };

  const fermer = () => {
    if (enCours) return;
    reinitialiser();
    onFermer();
  };

  const envoyer = async () => {
    if (!fichier) {
      setErreur('Veuillez sélectionner un fichier');
      return;
    }
    if (!description.trim()) {
      setErreur('La description est obligatoire');
      return;
    }

    const formData = new FormData();
    formData.append('fichier', fichier);
    formData.append('description', description);
    formData.append('sousMenuId', sousMenuId);

    setEnCours(true);
    try {
      await axiosClient.post('/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      reinitialiser();
      onSauvegarde();
    } catch (err) {
      setErreur(err.response?.data?.description || 'Une erreur est survenue');
    } finally {
      setEnCours(false);
    }
  };

  const gererDepot = (e) => {
    e.preventDefault();
    setSurvole(false);
    if (e.dataTransfer.files?.[0]) setFichier(e.dataTransfer.files[0]);
  };

  const retirerFichier = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFichier(null);
  };

  return (
    <Dialog
      open={ouvert}
      onClose={fermer}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        Ajouter une capture
        <IconButton size="small" onClick={fermer} disabled={enCours} sx={{ ml: 2 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          component={fichier ? 'div' : 'label'}
          onDragOver={(e) => { e.preventDefault(); if (!enCours) setSurvole(true); }}
          onDragLeave={() => setSurvole(false)}
          onDrop={(e) => { if (!enCours) gererDepot(e); }}
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            my: 2,
            py: fichier ? 2 : 4,
            px: 2,
            border: '1.5px dashed',
            borderColor: survole ? 'primary.main' : 'slate.200',
            bgcolor: survole ? 'rgba(5, 150, 105, 0.04)' : 'transparent',
            borderRadius: 3,
            cursor: enCours ? 'default' : 'pointer',
            transition: 'all 140ms ease',
            overflow: 'hidden',
            '&:hover': { borderColor: enCours ? 'slate.200' : 'primary.main' },
          }}
        >
          {fichier ? (
            <>
              <IconButton
                size="small"
                onClick={retirerFichier}
                disabled={enCours}
                sx={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  bgcolor: 'rgba(0,0,0,0.55)',
                  color: '#fff',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
              {apercu && (
                <Box
                  component="img"
                  src={apercu}
                  alt="Aperçu"
                  sx={{
                    maxHeight: 180,
                    maxWidth: '100%',
                    borderRadius: 2,
                    objectFit: 'contain',
                  }}
                />
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                <InsertDriveFileOutlinedIcon sx={{ fontSize: 16, color: 'grey.500' }} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {fichier.name} · {formaterTaille(fichier.size)}
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <UploadFileOutlinedIcon sx={{ color: 'grey.500' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                Glissez une image ici, ou cliquez pour parcourir
              </Typography>
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setFichier(e.target.files[0])}
              />
            </>
          )}
        </Box>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={Boolean(erreur)}
          helperText={erreur}
          disabled={enCours}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={fermer} disabled={enCours} color="inherit">Annuler</Button>
        <Button
          variant="contained"
          onClick={envoyer}
          disabled={enCours}
          startIcon={enCours ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ minWidth: 140 }}
        >
          {enCours ? 'Envoi…' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ImageUploadDialog;