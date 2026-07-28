const fs = require('fs');
let code = fs.readFileSync('src/api/mockBackend.js', 'utf8');

// Ensure defaultSeedData has users and journal
if (!code.includes('utilisateurs: [')) {
  code = code.replace("actions: [", "utilisateurs: [\n    { id: 'u-1', nomUtilisateur: 'admin', role: 'ADMIN', compteActif: true, dateCreation: new Date().toISOString(), derniereConnexion: new Date().toISOString(), modulesVisiblesIds: ['mod-1', 'mod-2'] },\n    { id: 'u-2', nomUtilisateur: 'utilisateur', role: 'UTILISATEUR', compteActif: true, dateCreation: new Date().toISOString(), derniereConnexion: new Date().toISOString(), modulesVisiblesIds: ['mod-1'] }\n  ],\n  journal: [\n    { id: 'j-1', timestamp: new Date().toISOString(), action: 'LOGIN', detail: 'admin logged in', userId: 'u-1' }\n  ],\n  actions: [");
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

fs.writeFileSync('src/api/mockBackend.js', code);
