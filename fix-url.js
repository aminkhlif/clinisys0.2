const fs = require('fs');
let code = fs.readFileSync('src/pages/ImageEditPage.jsx', 'utf8');

const oldStr = 'const urlAffichee = apercuNouveauFichier || `data:${image.typeContenu};base64,${image.donneesBase64}`;';
const newStr = 'const urlAffichee = apercuNouveauFichier || (image.donneesBase64 ? `data:${image.typeContenu};base64,${image.donneesBase64}` : image.url);';

code = code.replace(oldStr, newStr);
fs.writeFileSync('src/pages/ImageEditPage.jsx', code);
