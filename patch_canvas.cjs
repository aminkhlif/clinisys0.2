const fs = require('fs');

let content = fs.readFileSync('src/components/image/ImageEditorCanvas.jsx', 'utf8');

// Use custom scrollbars and fix overflow
content = content.replace(
  "overflow: 'auto',",
  `overflow: zoom > 1 ? 'auto' : 'hidden',
          '&::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: (theme) => theme.palette.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: (theme) => theme.palette.mode === 'light' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
          },`
);

// Fix height calculation
content = content.replace(
  "maxHeight: typeof maxHeight === 'number' ? maxHeight + 2 : maxHeight,",
  "maxHeight: typeof maxHeight === 'number' ? maxHeight : 'auto',"
);

// Remove the checkerboard background
content = content.replace(
  /backgroundImage: `[\s\S]*?`,\n\s*backgroundSize: '16px 16px',\n\s*backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',/m,
  ""
);

// Make the background color softer
content = content.replace(
  /bgcolor: 'background\.paper',/g,
  "bgcolor: (theme) => theme.palette.mode === 'light' ? '#FAFAFA' : '#111111',"
);

// Change `largeurDisponible` calculation to avoid rounding scrollbars
content = content.replace(
  "setLargeurDisponible(conteneurRef.current.clientWidth);",
  "setLargeurDisponible(conteneurRef.current.clientWidth - 1);" // -1 to avoid subpixel scrollbar triggers
);

fs.writeFileSync('src/components/image/ImageEditorCanvas.jsx', content);
