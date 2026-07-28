const fs = require('fs');
let content = fs.readFileSync('src/components/image/ImageEditorCanvas.jsx', 'utf8');
content = content.replace(
  "maxHeight: typeof maxHeight === 'number' ? maxHeight : 'auto',",
  "maxHeight: typeof maxHeight === 'number' ? maxHeight : maxHeight,"
);
fs.writeFileSync('src/components/image/ImageEditorCanvas.jsx', content);
