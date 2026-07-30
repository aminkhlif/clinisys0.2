// src/api/axiosClient.js
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let onEchecAuthentification = () => {};
export const definirGestionnaireEchecAuth = (callback) => {
  onEchecAuthentification = callback;
};

let rafraichissementEnCours = null;

const estRequeteAuth = (url = '') =>
  url.includes('/auth/login') ||
  url.includes('/auth/register') ||
  url.includes('/auth/refresh') ||
  url.includes('/auth/logout');

axiosClient.interceptors.response.use(
  (reponse) => reponse,
  async (erreur) => {
    const requeteOriginale = erreur.config;

    const estUnAccessTokenExpire =
      erreur.response?.status === 401 &&
      requeteOriginale &&
      !requeteOriginale._dejaRetente &&
      !estRequeteAuth(requeteOriginale.url);

    if (estUnAccessTokenExpire) {
      requeteOriginale._dejaRetente = true;
      try {
        if (!rafraichissementEnCours) {
          rafraichissementEnCours = axiosClient.post('/auth/refresh').finally(() => {
            rafraichissementEnCours = null;
          });
        }
        await rafraichissementEnCours;
        return axiosClient(requeteOriginale);
      } catch {
        onEchecAuthentification();
        return Promise.reject(erreur);
      }
    }

    if (erreur.response?.status === 401 && estRequeteAuth(requeteOriginale?.url)) {
      return Promise.reject(erreur);
    }

    if (erreur.response?.status === 403 && requeteOriginale?.url?.includes('/admin')) {
      enqueueSnackbar("Accès refusé. Droits d'administration requis.", { variant: 'error' });
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/';
      }
      return Promise.reject(erreur);
    }

    const message =
      erreur.response?.data?.message ||
      Object.values(erreur.response?.data || {})[0] ||
      'Une erreur est survenue';
    enqueueSnackbar(message, { variant: 'error' });
    return Promise.reject(erreur);
  }
);

export default axiosClient;