// src/components/auth/AddEmailDialog.jsx
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSnackbar } from 'notistack';

function AddEmailDialog({ ouvert, onFermer }) {
  const { ajouterEmail } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [email, setEmail] = useState('');
  const [erreur, setErreur] = useState('');
  const [enCours, setEnCours] = useState(false);

  const sauvegarder = async () => {
    if (!email.trim()) {
      setErreur('L\'email est obligatoire');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErreur('Format d\'email invalide');
      return;
    }
    setEnCours(true);
    setErreur('');
    try {
      await ajouterEmail(email.trim());
      enqueueSnackbar('Email ajouté avec succès', { variant: 'success' });
      onFermer();
    } catch (err) {
      setErreur(err.response?.data?.message || err.response?.data?.email || 'Une erreur est survenue');
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
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, flexDirection: 'row' }}>
        Ajouter mon email
        <Button onClick={onFermer} disabled={enCours} sx={{ minWidth: 32, p: 0.5 }}>
          <CloseIcon fontSize="small" />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <TextField
          autoFocus
          fullWidth
          margin="dense"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={Boolean(erreur)}
          helperText={erreur}
          disabled={enCours}
          autoComplete="email"
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
          {enCours ? 'Ajout…' : 'Ajouter'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddEmailDialog;
