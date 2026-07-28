// src/api/mockBackend.js

const MOCK_STORAGE_KEY = 'menuflow_mock_data_v1';

const defaultSeedData = {
  currentUser: { id: 'u-1', nomUtilisateur: 'admin', role: 'ADMIN' },
  modules: [
    { id: 'mod-1', nom: 'Dossier Médical', description: 'Gestion des dossiers patients, examens et ordonnances' },
    { id: 'mod-2', nom: 'Plateau Technique', description: 'Imagerie médicale et comptes-rendus' },
  ],
  menus: [
    { id: 'menu-1', nom: 'Fiches Patients', moduleId: 'mod-1' },
    { id: 'menu-2', nom: 'Consultations', moduleId: 'mod-1' },
    { id: 'menu-3', nom: 'Radiologie', moduleId: 'mod-2' },
  ],
  sousMenus: [
    { id: 'sm-1', nom: 'Signalétique Patient', menuId: 'menu-1', videoGenere: false },
    { id: 'sm-2', nom: 'Antécédents & Allers', menuId: 'menu-1', videoGenere: true },
    { id: 'sm-3', nom: 'Examens Biologiques', menuId: 'menu-2', videoGenere: false },
  ],
  images: [
    {
      id: 'img-1',
      nom: 'Dossier_Patient_Accueil.png',
      description: 'Capture écran de la fiche signalétique du patient avec constats vitaux',
      sousMenuId: 'sm-1',
      ordre: 1,
      url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
      typeContenu: 'image/jpeg',
      donneesBase64: '',
    },
    {
      id: 'img-2',
      nom: 'Suivi_Tensionnel.png',
      description: 'Graphique de suivi de la pression artérielle et courbe de température',
      sousMenuId: 'sm-1',
      ordre: 2,
      url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800',
      typeContenu: 'image/jpeg',
      donneesBase64: '',
    },
  ],
  utilisateurs: [
    { id: 'u-1', nomUtilisateur: 'admin', role: 'ADMIN', compteActif: true, dateCreation: new Date().toISOString(), derniereConnexion: new Date().toISOString(), modulesVisiblesIds: ['mod-1', 'mod-2'] },
    { id: 'u-2', nomUtilisateur: 'utilisateur', role: 'UTILISATEUR', compteActif: true, dateCreation: new Date().toISOString(), derniereConnexion: new Date().toISOString(), modulesVisiblesIds: ['mod-1'] }
  ],
  journal: [
    { id: 'j-1', timestamp: new Date().toISOString(), action: 'LOGIN', detail: 'admin logged in', userId: 'u-1' }
  ],
  actions: [
    {
      id: 'act-1',
      imageId: 'img-1',
      type: 'FOCUS',
      x: 15,
      y: 20,
      largeur: 35,
      hauteur: 25,
      couleur: '#FF0000',
      intensite: null,
    },
  ],
};

function loadState() {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(defaultSeedData));
      return { ...defaultSeedData };
    }
    return JSON.parse(raw);
  } catch {
    return { ...defaultSeedData };
  }
}

function saveState(state) {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save state to localStorage', e);
  }
}

export async function handleMockRequest(config) {
  const state = loadState();
  const url = (config.url || '').replace(/^https?:\/\/[^/]+/, '').replace(/^\/api/, '');
  const method = (config.method || 'get').toLowerCase();
  const params = config.params || {};
  let body = config.data;

  // Attempt to parse JSON body if string
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      // ignore
    }
  }

  // Utility response helpers
  const ok = (data, status = 200) => ({
    data,
    status,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    config,
  });

  const err = (message, status = 400) => {
    const errorObj = new Error(message);
    errorObj.response = {
      data: { message, description: message },
      status,
      statusText: 'Error',
      headers: {},
      config,
    };
    return Promise.reject(errorObj);
  };

  // Helper for file uploads from FormData
  async function parseFormData(formData) {
    const result = {};
    if (formData instanceof FormData) {
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          result[key] = value;
          result[`${key}_file`] = value;
        } else {
          result[key] = value;
        }
      }
    }
    return result;
  }

  // --- AUTH ENDPOINTS ---
  if (url === '/auth/me' && method === 'get') {
    if (state.currentUser) {
      return ok(state.currentUser);
    }
    return err('Non authentifié', 401);
  }

  if (url === '/auth/login' && method === 'post') {
    const nom = body?.nomUtilisateur || 'admin';
    state.currentUser = { id: 'u-' + Date.now(), nomUtilisateur: nom, role: 'ADMIN' };
    saveState(state);
    return ok(state.currentUser);
  }

  if (url === '/auth/register' && method === 'post') {
    const nom = body?.nomUtilisateur || 'admin';
    state.currentUser = { id: 'u-' + Date.now(), nomUtilisateur: nom, role: 'ADMIN' };
    saveState(state);
    return ok(state.currentUser);
  }

  if (url === '/auth/logout' && method === 'post') {
    state.currentUser = null;
    saveState(state);
    return ok({ message: 'Déconnecté' });
  }

  if (url === '/auth/refresh' && method === 'post') {
    if (state.currentUser) {
      return ok({ message: 'Session rafraîchie' });
    }
    return err('Non authentifié', 401);
  }

  if (url === '/auth/change-password' && method === 'patch') {
    return ok({ message: 'Mot de passe modifié avec succès' });
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
    const term = (params.recherche || '').toLowerCase();
    let res = state.modules;
    if (term) {
      res = res.filter((m) => m.nom.toLowerCase().includes(term));
    }
    return ok(res);
  }

  if (url.match(/^\/modules\/[^/]+$/) && method === 'get') {
    const id = url.split('/')[2];
    const mod = state.modules.find((m) => m.id === id);
    if (mod) return ok(mod);
    return err('Module introuvable', 404);
  }

  if (url === '/modules' && method === 'post') {
    const nom = body?.nom || 'Nouveau Module';
    const newMod = { id: 'mod-' + Date.now(), nom, description: '' };
    state.modules.push(newMod);
    saveState(state);
    return ok(newMod);
  }

  if (url.match(/^\/modules\/[^/]+$/) && method === 'put') {
    const id = url.split('/')[2];
    const index = state.modules.findIndex((m) => m.id === id);
    if (index !== -1) {
      state.modules[index] = { ...state.modules[index], ...body };
      saveState(state);
      return ok(state.modules[index]);
    }
    return err('Module introuvable', 404);
  }

  if (url.match(/^\/modules\/[^/]+$/) && method === 'delete') {
    const id = url.split('/')[2];
    state.modules = state.modules.filter((m) => m.id !== id);
    saveState(state);
    return ok({ message: 'Module supprimé' });
  }

  // --- MENUS ENDPOINTS ---
  if (url === '/menus' && method === 'get') {
    const moduleId = params.moduleId;
    const term = (params.recherche || '').toLowerCase();
    let res = state.menus;
    if (moduleId) {
      res = res.filter((m) => m.moduleId === String(moduleId));
    }
    if (term) {
      res = res.filter((m) => m.nom.toLowerCase().includes(term));
    }
    return ok(res);
  }

  if (url === '/menus' && method === 'post') {
    const newMenu = { id: 'menu-' + Date.now(), nom: body.nom, moduleId: String(body.moduleId) };
    state.menus.push(newMenu);
    saveState(state);
    return ok(newMenu);
  }

  if (url.match(/^\/menus\/[^/]+$/) && method === 'put') {
    const id = url.split('/')[2];
    const index = state.menus.findIndex((m) => m.id === id);
    if (index !== -1) {
      state.menus[index] = { ...state.menus[index], nom: body.nom };
      saveState(state);
      return ok(state.menus[index]);
    }
    return err('Menu introuvable', 404);
  }

  if (url.match(/^\/menus\/[^/]+$/) && method === 'delete') {
    const id = url.split('/')[2];
    state.menus = state.menus.filter((m) => m.id !== id);
    saveState(state);
    return ok({ message: 'Menu supprimé' });
  }

  // --- SOUS-MENUS ENDPOINTS ---
  if (url === '/sous-menus' && method === 'get') {
    const menuId = params.menuId;
    let res = state.sousMenus;
    if (menuId) {
      res = res.filter((sm) => sm.menuId === String(menuId));
    }
    return ok(res);
  }

  if (url.match(/^\/sous-menus\/[^/]+$/) && method === 'get') {
    const id = url.split('/')[2];
    const sm = state.sousMenus.find((item) => item.id === id);
    if (sm) return ok(sm);
    return err('Sous-menu introuvable', 404);
  }

  if (url === '/sous-menus' && method === 'post') {
    const newSm = {
      id: 'sm-' + Date.now(),
      nom: body.nom,
      menuId: String(body.menuId),
      videoGenere: false,
    };
    state.sousMenus.push(newSm);
    saveState(state);
    return ok(newSm);
  }

  if (url.match(/^\/sous-menus\/[^/]+$/) && method === 'put') {
    const id = url.split('/')[2];
    const index = state.sousMenus.findIndex((sm) => sm.id === id);
    if (index !== -1) {
      state.sousMenus[index] = { ...state.sousMenus[index], nom: body.nom };
      saveState(state);
      return ok(state.sousMenus[index]);
    }
    return err('Sous-menu introuvable', 404);
  }

  if (url.match(/^\/sous-menus\/[^/]+$/) && method === 'delete') {
    const id = url.split('/')[2];
    state.sousMenus = state.sousMenus.filter((sm) => sm.id !== id);
    saveState(state);
    return ok({ message: 'Sous-menu supprimé' });
  }

  if (url.match(/^\/sous-menus\/[^/]+\/video$/) && method === 'patch') {
    const id = url.split('/')[2];
    const genere = params.genere === 'true' || params.genere === true;
    const index = state.sousMenus.findIndex((sm) => sm.id === id);
    if (index !== -1) {
      state.sousMenus[index].videoGenere = genere;
      saveState(state);
      return ok(state.sousMenus[index]);
    }
    return err('Sous-menu introuvable', 404);
  }

  // --- IMAGES ENDPOINTS ---
  if (url === '/images' && method === 'get') {
    const sousMenuId = params.sousMenuId;
    let res = state.images;
    if (sousMenuId) {
      res = res.filter((img) => img.sousMenuId === String(sousMenuId));
    }
    res.sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
    return ok(res);
  }

  if (url.match(/^\/images\/[^/]+$/) && method === 'get') {
    const id = url.split('/')[2];
    const img = state.images.find((i) => i.id === id);
    if (img) return ok(img);
    return err('Image introuvable', 404);
  }

  if (url === '/images' && method === 'post') {
    const parsed = await parseFormData(body);
    const file = parsed.fichier_file || parsed.fichier;
    const sousMenuId = parsed.sousMenuId || params.sousMenuId;
    const description = parsed.description || '';

    let urlData = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800';
    let typeContenu = 'image/jpeg';
    let donneesBase64 = '';

    if (file && file instanceof File) {
      typeContenu = file.type || 'image/png';
      urlData = URL.createObjectURL(file);
    }

    const count = state.images.filter((i) => i.sousMenuId === String(sousMenuId)).length;
    const newImg = {
      id: 'img-' + Date.now(),
      nom: file?.name || 'NouvelleCapture.png',
      description,
      sousMenuId: String(sousMenuId),
      ordre: count + 1,
      url: urlData,
      typeContenu,
      donneesBase64,
    };

    state.images.push(newImg);
    saveState(state);
    return ok(newImg);
  }

  if (url.match(/^\/images\/[^/]+\/fichier$/) && method === 'put') {
    const id = url.split('/')[2];
    const index = state.images.findIndex((i) => i.id === id);
    if (index !== -1) {
      const parsed = await parseFormData(body);
      const file = parsed.fichier_file || parsed.fichier;
      if (file && file instanceof File) {
        state.images[index].nom = file.name;
        state.images[index].typeContenu = file.type || 'image/png';
        state.images[index].url = URL.createObjectURL(file);
        saveState(state);
      }
      return ok(state.images[index]);
    }
    return err('Image introuvable', 404);
  }

  if (url.match(/^\/images\/[^/]+\/description$/) && method === 'patch') {
    const id = url.split('/')[2];
    const desc = params.description !== undefined ? params.description : body?.description;
    const index = state.images.findIndex((i) => i.id === id);
    if (index !== -1) {
      state.images[index].description = desc;
      saveState(state);
      return ok(state.images[index]);
    }
    return err('Image introuvable', 404);
  }

  if (url === '/images/reordonner' && method === 'patch') {
    const ids = Array.isArray(body) ? body : body?.ids || [];
    ids.forEach((imgId, idx) => {
      const img = state.images.find((i) => i.id === String(imgId));
      if (img) img.ordre = idx + 1;
    });
    saveState(state);
    return ok({ message: 'Images réordonnées' });
  }

  if (url === '/images' && method === 'delete') {
    const idsToDelete = params.ids ? (Array.isArray(params.ids) ? params.ids : String(params.ids).split(',')) : [];
    state.images = state.images.filter((i) => !idsToDelete.includes(i.id));
    saveState(state);
    return ok({ message: 'Images supprimées' });
  }

  if (url.match(/^\/images\/[^/]+$/) && method === 'delete') {
    const id = url.split('/')[2];
    state.images = state.images.filter((i) => i.id !== id);
    saveState(state);
    return ok({ message: 'Image supprimée' });
  }

  // --- ACTIONS ENDPOINTS ---
  if (url === '/actions' && method === 'get') {
    const imageId = params.imageId;
    let res = state.actions;
    if (imageId) {
      res = res.filter((a) => a.imageId === String(imageId));
    }
    return ok(res);
  }

  if (url === '/actions' && method === 'post') {
    const newAction = {
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      imageId: String(body.imageId),
      type: body.type,
      x: body.x ?? 20,
      y: body.y ?? 20,
      largeur: body.largeur ?? 100,
      hauteur: body.hauteur ?? 80,
      couleur: body.couleur || null,
      intensite: body.intensite || null,
    };
    state.actions.push(newAction);
    saveState(state);
    return ok(newAction);
  }

  if (url.match(/^\/actions\/[^/]+$/) && method === 'put') {
    const id = url.split('/')[2];
    const index = state.actions.findIndex((a) => a.id === id);
    if (index !== -1) {
      state.actions[index] = { ...state.actions[index], ...body };
      saveState(state);
      return ok(state.actions[index]);
    }
    return err('Action introuvable', 404);
  }

  if (url.match(/^\/actions\/[^/]+$/) && method === 'delete') {
    const id = url.split('/')[2];
    state.actions = state.actions.filter((a) => a.id !== id);
    saveState(state);
    return ok({ message: 'Action supprimée' });
  }

  if (url.match(/^\/actions\/images\/[^/]+\/valider$/) && method === 'post') {
    return ok({ message: 'Actions validées' });
  }

  if (url.match(/^\/actions\/images\/[^/]+\/annuler$/) && method === 'delete') {
    const imageId = url.split('/')[3];
    state.actions = state.actions.filter((a) => a.imageId !== imageId);
    saveState(state);
    return ok({ message: 'Actions annulées' });
  }

  return err(`Route introuvable: ${method.toUpperCase()} ${url}`, 404);
}
