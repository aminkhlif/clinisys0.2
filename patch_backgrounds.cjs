const fs = require('fs');

const content = `
export const dotGridBackgroundSx = {
  backgroundColor: 'background.default',
  backgroundImage: (theme) => theme.palette.mode === 'light' 
    ? 'radial-gradient(circle, #EAEAEA 1px, transparent 1px)' 
    : 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
  backgroundSize: '24px 24px',
  backgroundPosition: '-12px -12px',
};

export const dotGridBackgroundDarkSx = {
  backgroundColor: '#0A0A0A',
  backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
  backgroundSize: '24px 24px',
  backgroundPosition: '-12px -12px',
};
`;

fs.writeFileSync('src/theme/backgrounds.js', content);
