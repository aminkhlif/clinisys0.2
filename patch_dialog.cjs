const fs = require('fs');
let code = fs.readFileSync('src/components/auth/ChangePasswordDialog.jsx', 'utf8');

const importsToAdd = `
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
`;

// Add imports
code = code.replace(/import { useAuth } from '..\/..\/context\/AuthContext.jsx';/, "import { useAuth } from '../../context/AuthContext.jsx';" + importsToAdd);

// Add strength indicator function and state inside the component
const strengthIndicator = `
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
`;

code = code.replace(/const \[enCours, setEnCours\] = useState\(false\);/, "const [enCours, setEnCours] = useState(false);\n" + strengthIndicator);

// Dialog styling
const oldDialogBegin = `<Dialog open={ouvert} onClose={fermer} fullWidth maxWidth="xs">
      <DialogTitle>Changer mon mot de passe</DialogTitle>`;
const newDialogBegin = `<Dialog 
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
      </DialogTitle>`;

code = code.replace(oldDialogBegin, newDialogBegin);

// Content layout
const oldStack = `<Stack spacing={2} sx={{ mt: 0.5 }}>`;
const newStack = `<Stack spacing={2.5} sx={{ mt: 1 }}>`;
code = code.replace(oldStack, newStack);

// Strength indicator UI
const oldNouveauMdp = `<ChampMotDePasse
              autoComplete="new-password"
              label="Nouveau mot de passe"
              value={nouveauMotDePasse}
              onChange={(e) => setNouveauMotDePasse(e.target.value)}
              error={Boolean(erreurs.nouveauMotDePasse)}
              helperText={erreurs.nouveauMotDePasse}
            />`;

const newNouveauMdp = `<Box>
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
                      <Box key={i} sx={{ flex: 1, bgcolor: i < forceMdp ? couleursForce[forceMdp] : 'grey.200', borderRadius: 1, transition: 'all 0.2s' }} />
                    ))}
                  </Stack>
                  <Typography variant="caption" sx={{ color: forceMdp ? couleursForce[forceMdp] : 'text.secondary', fontWeight: 500, textAlign: 'right' }}>
                    {labelsForce[forceMdp]}
                  </Typography>
                </Stack>
              )}
            </Box>`;

code = code.replace(oldNouveauMdp, newNouveauMdp);

// Add divider between ancient and new password
code = code.replace(`<ChampMotDePasse
              autoFocus
              autoComplete="current-password"
              label="Mot de passe actuel"
              value={ancienMotDePasse}
              onChange={(e) => setAncienMotDePasse(e.target.value)}
              error={Boolean(erreurs.ancienMotDePasse)}
              helperText={erreurs.ancienMotDePasse}
            />`, `<ChampMotDePasse
              autoFocus
              autoComplete="current-password"
              label="Mot de passe actuel"
              value={ancienMotDePasse}
              onChange={(e) => setAncienMotDePasse(e.target.value)}
              error={Boolean(erreurs.ancienMotDePasse)}
              helperText={erreurs.ancienMotDePasse}
            />\n            <Divider sx={{ my: 0.5, borderStyle: 'dashed' }} />`);

// Buttons
const oldActions = `<DialogActions>
        <Button onClick={fermer} disabled={enCours}>Annuler</Button>
        <Button variant="contained" onClick={soumettre} disabled={enCours}>
          {enCours ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </DialogActions>`;

const newActions = `<DialogActions sx={{ pt: 3, pb: 1, px: 3 }}>
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
      </DialogActions>`;
code = code.replace(oldActions, newActions);

// Content padding
code = code.replace(`<DialogContent>`, `<DialogContent sx={{ px: 3, pt: 1, pb: 0 }}>`);

fs.writeFileSync('src/components/auth/ChangePasswordDialog.jsx', code);
