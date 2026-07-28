// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Link, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext.jsx';
import { dotGridBackgroundSx, dotGridBackgroundDarkSx } from '../theme/backgrounds';

function RegisterPage() {
  const { inscrire } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme?.palette?.mode === 'dark';

  const [nomUtilisateur, setNomUtilisateur] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('');
  const [erreurs, setErreurs] = useState({});
  const [enCours, setEnCours] = useState(false);

  const soumettre = async (e) => {
    e.preventDefault();
    const nouvellesErreurs = {};
    if (nomUtilisateur.trim().length < 3) nouvellesErreurs.nomUtilisateur = "Le nom d'utilisateur doit contenir au moins 3 caractères";
    if (motDePasse.length < 6) nouvellesErreurs.motDePasse = 'Le mot de passe doit contenir au moins 6 caractères';
    if (confirmationMotDePasse !== motDePasse) nouvellesErreurs.confirmation = 'Les mots de passe ne correspondent pas';
    if (Object.keys(nouvellesErreurs).length > 0) { setErreurs(nouvellesErreurs); return; }

    setEnCours(true);
    setErreurs({});
    try {
      await inscrire(nomUtilisateur.trim(), motDePasse);
      navigate('/', { replace: true });
    } catch (err) {
      setErreurs({ nomUtilisateur: err.response?.data?.nomUtilisateur || 'Une erreur est survenue' });
    } finally {
      setEnCours(false);
    }
  };

  const pageBackground = {
    ...(!isDark ? dotGridBackgroundSx : dotGridBackgroundDarkSx),
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 2,
    position: 'relative',
    // pseudo-élément via sx pour renforcer la "touche black" (ligne fine sous la bande)
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 6,
      left: 0,
      width: '100%',
      height: 1,
      background: 'rgba(0,0,0,0.06)',
      pointerEvents: 'none',
    },
  };

  return (
    <Box sx={pageBackground}>
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 380,
          p: 4,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Stack alignItems="center" spacing={1.5} sx={{ mb: 3.5 }}>
          <Box component="svg" viewBox="0 0 32 32" sx={{ width: 40, height: 40 }}>
            
              <g transform="translate(16 16)">
                <g>
                  <animateTransform attributeName="transform" type="scale" values="1;1.15;1" dur="1.5s" repeatCount="indefinite" />
                  <path d="M-3 -11 H3 V-3 H11 V3 H3 V11 H-3 V3 H-11 V-3 H-3 Z" fill="#000000" opacity="0.15" />
                  <path d="M-8 0 L-4 0 L-2 -3 L1 5 L3.5 -2 L5 0 L8 0" fill="none" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </g>
              <circle cx="16" cy="16" r="14" fill="none" stroke="#000000" strokeWidth="1.5" strokeDasharray="20 10 5 10" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="10s" repeatCount="indefinite" />
              </circle>
            </Box>

          <Typography variant="h5">Créer un compte</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Rejoignez l'Application en quelques secondes
          </Typography>
        </Stack>

        <Box component="form" onSubmit={soumettre} noValidate>
          <Stack spacing={2}>
            <TextField
              label="Nom d'utilisateur"
              value={nomUtilisateur}
              onChange={(e) => setNomUtilisateur(e.target.value)}
              error={Boolean(erreurs.nomUtilisateur)}
              helperText={erreurs.nomUtilisateur}
              autoFocus
              fullWidth
            />
            <TextField
              label="Mot de passe"
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              error={Boolean(erreurs.motDePasse)}
              helperText={erreurs.motDePasse}
              fullWidth
            />
            <TextField
              label="Confirmer le mot de passe"
              type="password"
              value={confirmationMotDePasse}
              onChange={(e) => setConfirmationMotDePasse(e.target.value)}
              error={Boolean(erreurs.confirmation)}
              helperText={erreurs.confirmation}
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={enCours}
              sx={{ py: 1.2 }}
            >
              {enCours ? 'Création…' : 'Créer mon compte'}
            </Button>
          </Stack>
        </Box>

        <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mt: 3 }}>
          Déjà un compte ?{' '}
          <Link component={RouterLink} to="/login" sx={{ color: 'primary.main', fontWeight: 600 }}>
            Se connecter
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}

export default RegisterPage;
