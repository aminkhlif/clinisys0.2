// src/components/image/configActions.js
import BlurOnOutlinedIcon from '@mui/icons-material/BlurOnOutlined';
import CropSquareOutlinedIcon from '@mui/icons-material/CropSquareOutlined';
import CenterFocusWeakOutlinedIcon from '@mui/icons-material/CenterFocusWeakOutlined';
import NearMeOutlinedIcon from '@mui/icons-material/NearMeOutlined';
import AdsClickOutlinedIcon from '@mui/icons-material/AdsClickOutlined';

export const ICONE_ACTION = {
  FLOU: BlurOnOutlinedIcon,
  RECTANGLE: CropSquareOutlinedIcon,
  FOCUS: CenterFocusWeakOutlinedIcon,
  CURSEUR_STATIQUE: NearMeOutlinedIcon,
  CURSEUR_CLICK: AdsClickOutlinedIcon,
};

export const CONFIG_ACTIONS = {
  FLOU: { label: 'Flou', largeurDefaut: 100, hauteurDefaut: 100, couleur: false, intensite: true, couleurAffichage: 'rgba(59,130,246,0.35)' },
  RECTANGLE: { label: 'Rectangle', largeurDefaut: 120, hauteurDefaut: 80, couleur: true, intensite: false, couleurDefaut: '#FF0000' },
  FOCUS: { label: 'Focus', largeurDefaut: 150, hauteurDefaut: 100, couleur: false, intensite: false, couleurAffichage: 'rgba(0,0,0,0.4)' },
  CURSEUR_STATIQUE: { label: 'Curseur statique', largeurDefaut: 40, hauteurDefaut: 40, couleur: true, intensite: false, couleurDefaut: '#FF0000' },
  CURSEUR_CLICK: { label: 'Curseur click', largeurDefaut: 40, hauteurDefaut: 40, couleur: true, intensite: false, couleurDefaut: '#FF0000' },
};

export const LISTE_ACTIONS = Object.keys(CONFIG_ACTIONS);