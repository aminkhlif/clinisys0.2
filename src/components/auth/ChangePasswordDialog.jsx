// src/components/auth/ChangePasswordDialog.jsx
import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, IconButton, InputAdornment, Box,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext.jsx';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';


function ChampMotDePasse({ label, value, onChange, error, helperText, onKeyDown, autoFocus, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      autoFocus={autoFocus}
      fullWidth
      type={visible ? 'text' : 'password'}
      label={label}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      error={error}
      helperText={helperText}
      autoComplete={autoComplete}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setVisible((v) => !v)} edge="end" tabIndex={-1}>
                {visible ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

function ChangePasswordDialog({ ouvert, onFermer }) {
  const { changerMotDePasse, utilisateur } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [ancienMotDePasse, setAncienMotDePasse] = useState('');
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [erreurs, setErreurs] = useState({});
  const [enCours, setEnCours] = useState(false);

  const evaluerForce = (mdp) => {
    if (!mdp) return 0;
    let force = 0;
    if (mdp.length >= 8) force += 1;
    if (/[A-Z]/.test(mdp)) force += 1;
    if (/[0-9]/.test(mdp)) force += 1;
    if (/[^A-Za-z0-9]/.test(mdp)) force += 1;
    return force;
  };
  
  const forceMdp = evaluerForce(nouveauMotDePasse);
  const couleursForce = ['error.main', 'error.main', 'warning.main', 'success.main', 'success.main'];
  const labelsForce = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];


  const reinitialiser = () => {
    setAncienMotDePasse('');
    setNouveauMotDePasse('');
    setConfirmation('');
    setErreurs({});
  };

  const fermer = () => {
    reinitialiser();
    onFermer();
  };

  const soumettre = async () => {
    const nouvellesErreurs = {};
    if (!ancienMotDePasse) {
      nouvellesErreurs.ancienMotDePasse = 'Le mot de passe actuel est obligatoire';
    }
    if (nouveauMotDePasse.length < 6) {
      nouvellesErreurs.nouveauMotDePasse = 'Le nouveau mot de passe doit contenir au moins 6 caractères';
    }
    if (confirmation !== nouveauMotDePasse) {
      nouvellesErreurs.confirmation = 'Les mots de passe ne correspondent pas';
    }
    if (Object.keys(nouvellesErreurs).length > 0) {
      setErreurs(nouvellesErreurs);
      return;
    }

    setEnCours(true);
    setErreurs({});
    try {
      await changerMotDePasse(ancienMotDePasse, nouveauMotDePasse);
      enqueueSnackbar('Mot de passe mis à jour', { variant: 'success' });
      fermer();
    } catch (err) {
      setErreurs({ ancienMotDePasse: err.response?.data?.message || 'Une erreur est survenue' });
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
          <LockOutlinedIcon fontSize="small" />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Mot de passe</Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pt: 1, pb: 0 }}>
        <Box
          component="form"
          onSubmit={(e) => { e.preventDefault(); soumettre(); }}
        >
          {/* Champ leurre invisible : Chrome ignore autoComplete="off" dès qu'il détecte un
              mot de passe sur la page, et va chercher un champ "nom d'utilisateur" ailleurs
              dans le DOM (ex: la barre de recherche de la sidebar) pour y coller la valeur
              sauvegardée. Ce champ caché lui donne une cible à remplir à la place. */}
          <input
            type="text"
            name="username"
            autoComplete="username"
            value={utilisateur?.nomUtilisateur || ''}
            readOnly
            tabIndex={-1}
            style={{ position: 'absolute', width: 0, height: 0, opacity: 0, border: 'none', padding: 0 }}
          />
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <ChampMotDePasse
              autoFocus
              autoComplete="current-password"
              label="Mot de passe actuel"
              value={ancienMotDePasse}
              onChange={(e) => setAncienMotDePasse(e.target.value)}
              error={Boolean(erreurs.ancienMotDePasse)}
              helperText={erreurs.ancienMotDePasse}
            />
            <Divider sx={{ my: 0.5, borderStyle: 'dashed' }} />
            <Box>
              <ChampMotDePasse
                autoComplete="new-password"
                label="Nouveau mot de passe"
                value={nouveauMotDePasse}
                onChange={(e) => setNouveauMotDePasse(e.target.value)}
                error={Boolean(erreurs.nouveauMotDePasse)}
                helperText={erreurs.nouveauMotDePasse}
              />
              {nouveauMotDePasse && !erreurs.nouveauMotDePasse && (
                <Stack spacing={0.5} sx={{ mt: 1, px: 1 }}>
                  <Stack direction="row" spacing={0.5} sx={{ height: 4 }}>
                    {[...Array(4)].map((_, i) => (
                      <Box key={i} sx={{ flex: 1, bgcolor: i < forceMdp ? couleursForce[forceMdp] : 'action.disabledBackground', borderRadius: 1, transition: 'all 0.2s' }} />
                    ))}
                  </Stack>
                  <Typography variant="caption" sx={{ color: forceMdp ? couleursForce[forceMdp] : 'text.secondary', fontWeight: 500, textAlign: 'right' }}>
                    {labelsForce[forceMdp]}
                  </Typography>
                </Stack>
              )}
            </Box>
            <ChampMotDePasse
              autoComplete="new-password"
              label="Confirmer le nouveau mot de passe"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && soumettre()}
              error={Boolean(erreurs.confirmation)}
              helperText={erreurs.confirmation}
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

export default ChangePasswordDialog;