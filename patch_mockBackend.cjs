const fs = require('fs');
let code = fs.readFileSync('src/api/mockBackend.js', 'utf8');

// Ensure defaultSeedData has users and journal with email field
if (!code.includes('utilisateurs: [')) {
  code = code.replace("actions: [", "utilisateurs: [\n    { id: 'u-1', nomUtilisateur: 'admin', email: 'admin@example.com', role: 'ADMIN', compteActif: true, dateCreation: new Date().toISOString(), derniereConnexion: new Date().toISOString(), modulesVisiblesIds: ['mod-1', 'mod-2'] },\n    { id: 'u-2', nomUtilisateur: 'utilisateur', email: 'user@example.com', role: 'UTILISATEUR', compteActif: true, dateCreation: new Date().toISOString(), derniereConnexion: new Date().toISOString(), modulesVisiblesIds: ['mod-1'] }\n  ],\n  passwordResetTokens: [],\n  journal: [\n    { id: 'j-1', timestamp: new Date().toISOString(), action: 'LOGIN', detail: 'admin logged in', userId: 'u-1' }\n  ],\n  actions: [");
}

// Update existing users to have email field if missing
if (code.includes('utilisateurs: [') && !code.includes('email:')) {
  code = code.replace(
    /{ id: 'u-1', nomUtilisateur: 'admin', role: 'ADMIN'/g,
    "{ id: 'u-1', nomUtilisateur: 'admin', email: 'admin@example.com', role: 'ADMIN'"
  );
  code = code.replace(
    /{ id: 'u-2', nomUtilisateur: 'utilisateur', role: 'UTILISATEUR'/g,
    "{ id: 'u-2', nomUtilisateur: 'utilisateur', email: 'user@example.com', role: 'UTILISATEUR'"
  );
}

// Add passwordResetTokens if missing
if (!code.includes('passwordResetTokens: []')) {
  code = code.replace('utilisateurs: [', 'passwordResetTokens: [],\n  utilisateurs: [');
}

// Ensure auth methods return the right format and admin methods are present
const adminBlock = `
  // --- ADMIN ENDPOINTS ---
  if (url.startsWith('/admin/')) {
    if (!state.currentUser || state.currentUser.role !== 'ADMIN') {
      return err('Accès refusé', 403);
    }
    
    if (url === '/admin/utilisateurs' && method === 'get') {
      return ok(state.utilisateurs || []);
    }
    
    if (url.match(/^\\/admin\\/utilisateurs\\/[^/]+\\/role$/) && method === 'patch') {
      const uId = url.split('/')[3];
      const user = state.utilisateurs.find(u => u.id === uId);
      if (user) {
        user.role = body.role;
        saveState(state);
        return ok(user);
      }
      return err('User not found', 404);
    }
    
    if (url.match(/^\\/admin\\/utilisateurs\\/[^/]+\\/statut$/) && method === 'patch') {
      const uId = url.split('/')[3];
      const user = state.utilisateurs.find(u => u.id === uId);
      if (user) {
        user.compteActif = body.compteActif;
        saveState(state);
        return ok(user);
      }
      return err('User not found', 404);
    }
    
    if (url.match(/^\\/admin\\/utilisateurs\\/[^/]+\\/modules-visibles$/) && method === 'patch') {
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
`;

if (!code.includes('// --- ADMIN ENDPOINTS ---')) {
  code = code.replace('// --- MODULES ENDPOINTS ---', adminBlock + '\n  // --- MODULES ENDPOINTS ---');
}

// Add email authentication endpoints
const authBlock = `
  // --- EMAIL AUTH ENDPOINTS ---
  
  // Helper functions
  const isValidEmail = (email) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
  const isEmailUnique = (email) => !state.utilisateurs.some(u => u.email === email);
  const isUsernameUnique = (username) => !state.utilisateurs.some(u => u.nomUtilisateur === username);
  const generateResetToken = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  // Update login to accept email or username
  if (url === '/auth/login' && method === 'post') {
    const { identifiant, motDePasse } = body;
    const user = state.utilisateurs.find(u => 
      u.nomUtilisateur === identifiant || u.email === identifiant
    );
    if (user && user.motDePasse === motDePasse) {
      user.derniereConnexion = new Date().toISOString();
      saveState(state);
      return ok(user);
    }
    return err('Email, nom d\\'utilisateur ou mot de passe incorrect', 401);
  }
  
  // Update register to accept email
  if (url === '/auth/register' && method === 'post') {
    const { nomUtilisateur, email, motDePasse } = body;
    if (!nomUtilisateur || nomUtilisateur.length < 3) {
      return err('Le nom d\\'utilisateur doit contenir au moins 3 caractères', 400);
    }
    if (!email || !isValidEmail(email)) {
      return err('Format d\\'email invalide', 400);
    }
    if (!isUsernameUnique(nomUtilisateur)) {
      return err('Ce nom d\\'utilisateur est déjà pris', 400);
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
    saveState(state);
    return ok(newUser);
  }
  
  // Forgot password
  if (url === '/auth/forgot-password' && method === 'post') {
    const { email } = body;
    if (!email || !isValidEmail(email)) {
      return err('Format d\\'email invalide', 400);
    }
    const user = state.utilisateurs.find(u => u.email === email);
    if (!user) {
      // For security, don't reveal if email exists
      return ok({ message: 'Si cet email existe, un lien de réinitialisation sera envoyé' });
    }
    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour
    state.passwordResetTokens.push({ token, email, expiresAt });
    saveState(state);
    console.log('[MOCK EMAIL] To:', email, 'Subject: Réinitialisation du mot de passe', 'Token:', token);
    return ok({ message: 'Si cet email existe, un lien de réinitialisation sera envoyé' });
  }
  
  // Reset password
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
    saveState(state);
    return ok({ message: 'Mot de passe réinitialisé avec succès' });
  }
  
  // Add email for existing user
  if (url === '/auth/add-email' && method === 'patch') {
    if (!state.currentUser) {
      return err('Non authentifié', 401);
    }
    const { email } = body;
    if (!email || !isValidEmail(email)) {
      return err('Format d\\'email invalide', 400);
    }
    if (!isEmailUnique(email)) {
      return err('Cet email est déjà utilisé', 400);
    }
    const user = state.utilisateurs.find(u => u.id === state.currentUser.id);
    if (user) {
      user.email = email;
      saveState(state);
      return ok(user);
    }
    return err('Utilisateur non trouvé', 404);
  }
`;

if (!code.includes('// --- EMAIL AUTH ENDPOINTS ---')) {
  code = code.replace('// --- MODULES ENDPOINTS ---', authBlock + '\n  // --- MODULES ENDPOINTS ---');
}

fs.writeFileSync('src/api/mockBackend.js', code);
