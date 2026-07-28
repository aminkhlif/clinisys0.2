const fs = require('fs');

let content = fs.readFileSync('src/pages/ImageEditPage.jsx', 'utf8');

// Replace the Paper wrapper around ImageEditorCanvas
content = content.replace(
  /<Paper\n\s*variant="outlined"\n\s*sx=\{\{ borderRadius: 3, overflow: 'hidden', bgcolor: 'background\.paper', mb: 1\.5 \}\}\n\s*>/g,
  '<Box sx={{ mb: 1.5 }}>'
);
content = content.replace(
  /<\/ImageEditorCanvas>\n\s*<\/Paper>/g,
  '</ImageEditorCanvas>\n            </Box>'
);

fs.writeFileSync('src/pages/ImageEditPage.jsx', content);
