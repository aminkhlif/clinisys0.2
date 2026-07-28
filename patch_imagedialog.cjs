const fs = require('fs');

let content = fs.readFileSync('src/components/image/ImageActionsDialog.jsx', 'utf8');

content = content.replace(
  /<Paper variant="outlined" sx=\{\{ borderRadius: 3, overflow: 'hidden', bgcolor: 'background\.paper', mb: 2 \}\}>\n\s*<ImageEditorCanvas/g,
  '<Box sx={{ mb: 2 }}>\n              <ImageEditorCanvas'
);
content = content.replace(
  /<\/ImageEditorCanvas>\n\s*<\/Paper>/g,
  '</ImageEditorCanvas>\n            </Box>'
);

fs.writeFileSync('src/components/image/ImageActionsDialog.jsx', content);
