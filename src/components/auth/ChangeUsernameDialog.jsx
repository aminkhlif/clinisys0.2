// src/components/auth/ChangeUsernameDialog.jsx
import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Box,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext.jsx';
import Typography from '@mui/material/Typography';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';

function ChangeUsernameDialog({ ouvert, onFermer }) {
  const { changerNomUtilisateur, utilisateur } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [motDePasse, setMotDePasse] = useState('');
  const [nouveauNomUtilisateur, setNouveauNomUtilisateur] = useState('');
  const [erreurs, setErreurs] = useState({});
  const [enCours, setEnCours] = useState(false);

  const reinitialiser = () => {
    setMotDePasse('');
    setNouveauNomUtilisateur('');
    setErreurs({});
  };

  const fermer = () => {
    reinitialiser();
    onFermer();
  };

  const soumettre = async () => {
    const nouvellesErreurs = {};
    if (!motDePasse) {
      nouvellesErreurs.motDePasse = 'Le mot de passe est obligatoire';
    }
    if (nouveauNomUtilisateur.length < 3) {
      nouvellesErreurs.nouveauNomUtilisateur = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    }
    if (nouveauNomUtilisateur.length > 50) {
      nouvellesErreurs.nouveauNomUtilisateur = 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(nouveauNomUtilisateur)) {
      nouvellesErreurs.nouveauNomUtilisateur = 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores';
    }
    if (Object.keys(nouvellesErreurs).length > 0) {
      setErreurs(nouvellesErreurs);
      return;
    }

    setEnCours(true);
    setErreurs({});
    try {
      await changerNomUtilisateur(motDePasse, nouveauNomUtilisateur);
      enqueueSnackbar('Nom d\'utilisateur mis à jour', { variant: 'success' });
      fermer();
    } catch (err) {
      setErreurs({ motDePasse: err.response?.data?.message || 'Une erreur est survenue' });
    } finally {
      setEnCours(false);
    }
  };

  return (
    <Dialog 
      open={ouvert} 
      onClose={fermer} 
      fullWidth 
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
    >
      <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ p: 1, bgcolor: 'primary.50', borderRadius: 2, display: 'flex', color: 'primary.main' }}>
          <PersonOutlinedIcon fontSize="small" />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Nom d'utilisateur</Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pt: 1, pb: 0 }}>
        <Box
          component="form"
          onSubmit={(e) => { e.preventDefault(); soumettre(); }}
        >
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              type="password"
              label="Mot de passe"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              error={Boolean(erreurs.motDePasse)}
              helperText={erreurs.motDePasse}
              autoComplete="current-password"
            />
            <Divider sx={{ my: 0.5, borderStyle: 'dashed' }} />
            <TextField
              fullWidth
              label="Nouveau nom d'utilisateur"
              value={nouveauNomUtilisateur}
              onChange={(e) => setNouveauNomUtilisateur(e.target.value)}
              error={Boolean(erreurs.nouveauNomUtilisateur)}
              helperText={erreurs.nouveauNomUtilisateur}
              autoComplete="username"
              placeholder={utilisateur?.nomUtilisateur}
            />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ pt: 3, pb: 1, px: 3 }}>
        <Button onClick={fermer} disabled={enCours} color="inherit" sx={{ fontWeight: 600 }}>Annuler</Button>
        <Button 
          variant="contained" 
          onClick={soumettre} 
          disabled={enCours}
          startIcon={enCours ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ fontWeight: 600, minWidth: 130, borderRadius: 2 }}
        >
          {enCours ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ChangeUsernameDialog;
