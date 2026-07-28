// src/components/common/ConfirmDialog.jsx
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

function ConfirmDialog({ ouvert, titre, message, onConfirmer, onAnnuler, enCours = false }) {
  return (
    <Dialog open={ouvert} onClose={onAnnuler} maxWidth="xs" fullWidth>
      <DialogTitle>{titre}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onAnnuler} disabled={enCours} variant="outlined" color="inherit">
          Annuler
        </Button>
        <Button variant="contained" onClick={onConfirmer} disabled={enCours} color="error" disableElevation>
          {enCours ? 'En cours…' : 'Confirmer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;