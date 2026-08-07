// src/api/mockBackend.js
// Mock backend for development

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '../../mockBackendState.json');

let state = {
  modules: [],
  menus: [],
  sousMenus: [],
  images: [],
  utilisateurs: [
    { id: 'u-1', nomUtilisateur: 'admin', email: 'admin@example.com', motDePasse: 'admin123', role: 'ADMIN', compteActif: true, dateCreation: new Date().toISOString(), derniereConnexion: new Date().toISOString(), modulesVisiblesIds: ['mod-1', 'mod-2'] },
    { id: 'u-2', nomUtilisateur: 'utilisateur', email: 'user@example.com', motDePasse: 'user123', role: 'UTILISATEUR', compteActif: true, dateCreation: new Date().toISOString(), derniereConnexion: new Date().toISOString(), modulesVisiblesIds: ['mod-1'] }
  ],
  passwordResetTokens: [],
  journal: [
    { id: 'j-1', timestamp: new Date().toISOString(), action: 'LOGIN', detail: 'admin logged in', userId: 'u-1' }
  ],
  actions: [],
  currentUser: null
};

// Load state from file if exists
if (fs.existsSync(STATE_FILE)) {
  try {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (e) {
    console.error('Error loading state:', e);
  }
}

function saveState() {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function ok(data) {
  return { status: 200, data };
}

function err(message, status = 400) {
  return { status, data: { message } };
}

module.exports = function mockBackend(req, res) {
  const { url, method } = req;
  const body = req.body || {};
  const params = new URLSearchParams(req.url.split('?')[1] || '');

  // --- AUTH ENDPOINTS ---
  if (url === '/auth/login' && method === 'post') {
    const { identifiant, motDePasse } = body;
    const user = state.utilisateurs.find(u => 
      u.nomUtilisateur === identifiant || u.email === identifiant
    );
    if (user && user.motDePasse === motDePasse) {
      user.derniereConnexion = new Date().toISOString();
      state.currentUser = user;
      saveState();
      return ok(user);
    }
    return err('Email, nom d\'utilisateur ou mot de passe incorrect', 401);
  }

  if (url === '/auth/register' && method === 'post') {
    const { nomUtilisateur, email, motDePasse } = body;
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isEmailUnique = (email) => !state.utilisateurs.some(u => u.email === email);
    const isUsernameUnique = (username) => !state.utilisateurs.some(u => u.nomUtilisateur === username);
    
    if (!nomUtilisateur || nomUtilisateur.length < 3) {
      return err('Le nom d\'utilisateur doit contenir au moins 3 caractères', 400);
    }
    if (!email || !isValidEmail(email)) {
      return err('Format d\'email invalide', 400);
    }
    if (!isUsernameUnique(nomUtilisateur)) {
      return err('Ce nom d\'utilisateur est déjà pris', 400);
    }
    if (!isEmailUnique(email)) {
      return err('Cet email est déjà utilisé', 400);
    }
    if (!motDePasse || motDePasse.length < 6) {
      return err('Le mot de passe doit contenir au moins 6 caractères', 400);
    }
    const newUser = {
      id: 'u-' + Date.now(),
      nomUtilisateur,
      email,
      motDePasse,
      role: 'UTILISATEUR',
      compteActif: true,
      dateCreation: new Date().toISOString(),
      derniereConnexion: new Date().toISOString(),
      modulesVisiblesIds: []
    };
    state.utilisateurs.push(newUser);
    state.currentUser = newUser;
    saveState();
    return ok(newUser);
  }

  if (url === '/auth/logout' && method === 'post') {
    state.currentUser = null;
    saveState();
    return ok({ message: 'Déconnecté' });
  }

  if (url === '/auth/me' && method === 'get') {
    if (state.currentUser) {
      return ok(state.currentUser);
    }
    return err('Non authentifié', 401);
  }

  if (url === '/auth/refresh' && method === 'post') {
    if (state.currentUser) {
      return ok(state.currentUser);
    }
    return err('Non authentifié', 401);
  }

  if (url === '/auth/forgot-password' && method === 'post') {
    const { email } = body;
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!email || !isValidEmail(email)) {
      return err('Format d\'email invalide', 400);
    }
    const user = state.utilisateurs.find(u => u.email === email);
    if (!user) {
      return ok({ message: 'Si cet email existe, un lien de réinitialisation sera envoyé' });
    }
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 3600000).toISOString();
    state.passwordResetTokens.push({ token, email, expiresAt });
    saveState();
    console.log('[MOCK EMAIL] To:', email, 'Subject: Réinitialisation du mot de passe', 'Token:', token);
    return ok({ message: 'Si cet email existe, un lien de réinitialisation sera envoyé' });
  }

  if (url === '/auth/reset-password' && method === 'post') {
    const { token, nouveauMotDePasse } = body;
    if (!token || !nouveauMotDePasse || nouveauMotDePasse.length < 6) {
      return err('Données invalides', 400);
    }
    const resetToken = state.passwordResetTokens.find(t => t.token === token);
    if (!resetToken) {
      return err('Token invalide', 400);
    }
    if (new Date(resetToken.expiresAt) < new Date()) {
      return err('Token expiré', 400);
    }
    const user = state.utilisateurs.find(u => u.email === resetToken.email);
    if (!user) {
      return err('Utilisateur non trouvé', 404);
    }
    user.motDePasse = nouveauMotDePasse;
    state.passwordResetTokens = state.passwordResetTokens.filter(t => t.token !== token);
    saveState();
    return ok({ message: 'Mot de passe réinitialisé avec succès' });
  }

  if (url === '/auth/add-email' && method === 'patch') {
    if (!state.currentUser) {
      return err('Non authentifié', 401);
    }
    const { email } = body;
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isEmailUnique = (email) => !state.utilisateurs.some(u => u.email === email);
    if (!email || !isValidEmail(email)) {
      return err('Format d\'email invalide', 400);
    }
    if (!isEmailUnique(email)) {
      return err('Cet email est déjà utilisé', 400);
    }
    const user = state.utilisateurs.find(u => u.id === state.currentUser.id);
    if (user) {
      user.email = email;
      state.currentUser = user;
      saveState();
      return ok(user);
    }
    return err('Utilisateur non trouvé', 404);
  }

  
  // --- ADMIN ENDPOINTS ---
  if (url.startsWith('/admin/')) {
    if (!state.currentUser || state.currentUser.role !== 'ADMIN') {
      return err('Accès refusé', 403);
    }
    
    if (url === '/admin/utilisateurs' && method === 'get') {
      return ok(state.utilisateurs || []);
    }
    
    if (url.match(/^\/admin\/utilisateurs\/[^/]+\/role$/) && method === 'patch') {
      const uId = url.split('/')[3];
      const user = state.utilisateurs.find(u => u.id === uId);
      if (user) {
        user.role = body.role;
        saveState(state);
        return ok(user);
      }
      return err('User not found', 404);
    }
    
    if (url.match(/^\/admin\/utilisateurs\/[^/]+\/statut$/) && method === 'patch') {
      const uId = url.split('/')[3];
      const user = state.utilisateurs.find(u => u.id === uId);
      if (user) {
        user.compteActif = body.compteActif;
        saveState(state);
        return ok(user);
      }
      return err('User not found', 404);
    }
    
    if (url.match(/^\/admin\/utilisateurs\/[^/]+\/modules-visibles$/) && method === 'patch') {
      const uId = url.split('/')[3];
      const user = state.utilisateurs.find(u => u.id === uId);
      if (user) {
        user.modulesVisiblesIds = body.moduleIds || [];
        saveState(state);
        return ok(user);
      }
      return err('User not found', 404);
    }
    
    if (url === '/admin/dashboard/stats' && method === 'get') {
      return ok({
        nombreModules: state.modules.length,
        nombreMenus: state.menus.length,
        nombreSousMenus: state.sousMenus.length,
        nombreImages: state.images.length,
        nombreUtilisateurs: (state.utilisateurs || []).length,
        nombreUtilisateursActifs: (state.utilisateurs || []).filter(u => u.compteActif).length
      });
    }
    
    if (url.startsWith('/admin/journal') && method === 'get') {
      const page = parseInt(params.page || '0', 10);
      const taille = parseInt(params.taille || '20', 10);
      const journal = state.journal || [];
      const content = journal.slice(page * taille, (page + 1) * taille);
      return ok({
        content,
        totalElements: journal.length,
        totalPages: Math.ceil(journal.length / taille),
        number: page
      });
    }
  }

  // --- MODULES ENDPOINTS ---
  if (url === '/modules' && method === 'get') {
    return ok(state.modules);
  }

  if (url.match(/^\/modules\/[^/]+$/) && method === 'put') {
    const id = url.split('/')[2];
    const module = state.modules.find(m => m.id === id);
    if (module) {
      Object.assign(module, body);
      saveState();
      return ok(module);
    }
    return err('Module non trouvé', 404);
  }

  if (url === '/modules' && method === 'post') {
    const newModule = { id: 'mod-' + Date.now(), ...body };
    state.modules.push(newModule);
    saveState();
    return ok(newModule);
  }

  if (url.match(/^\/modules\/[^/]+$/) && method === 'delete') {
    const id = url.split('/')[2];
    state.modules = state.modules.filter(m => m.id !== id);
    saveState();
    return ok({ message: 'Module supprimé' });
  }

  // Default response
  return err('Endpoint non trouvé', 404);
};
