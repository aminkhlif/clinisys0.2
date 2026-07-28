// src/components/sousMenu/SousMenuFormDialog.jsx
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axiosClient from '../../api/axiosClient.js';

function SousMenuFormDialog({ ouvert, sousMenu, menuId, onFermer, onSauvegarde }) {
  const [nom, setNom] = useState('');
  const [erreur, setErreur] = useState('');
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    setNom(sousMenu ? sousMenu.nom : '');
    setErreur('');
  }, [sousMenu, ouvert]);

  const sauvegarder = async () => {
    if (!nom.trim()) {
      setErreur('Le nom est obligatoire');
      return;
    }
    setEnCours(true);
    try {
      if (sousMenu) {
        await axiosClient.put(`/sous-menus/${sousMenu.id}`, { nom, menuId });
      } else {
        await axiosClient.post('/sous-menus', { nom, menuId });
      }
      onSauvegarde();
    } catch (err) {
      setErreur(err.response?.data?.nom || 'Une erreur est survenue');
    } finally {
      setEnCours(false);
    }
  };

  return (
    <Dialog
      open={ouvert}
      onClose={enCours ? undefined : onFermer}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: 3, p: 0.5 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        {sousMenu ? 'Modifier le sous-menu' : 'Nouveau sous-menu'}
        <IconButton size="small" onClick={onFermer} disabled={enCours} sx={{ ml: 2 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <TextField
          autoFocus
          fullWidth
          margin="dense"
          label="Nom du sous-menu"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sauvegarder()}
          error={Boolean(erreur)}
          helperText={erreur}
          disabled={enCours}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onFermer} disabled={enCours} color="inherit">
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={sauvegarder}
          disabled={enCours}
          startIcon={enCours ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ minWidth: 140 }}
        >
          {enCours ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SousMenuFormDialog;