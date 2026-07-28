const fs = require('fs');
const path = require('path');

function getReplacementSvgContent(color) {
  return `
              <g transform="translate(16 16)">
                <g>
                  <animateTransform attributeName="transform" type="scale" values="1;1.15;1" dur="1.5s" repeatCount="indefinite" />
                  <path d="M-3 -11 H3 V-3 H11 V3 H3 V11 H-3 V3 H-11 V-3 H-3 Z" fill="${color}" opacity="0.15" />
                  <path d="M-8 0 L-4 0 L-2 -3 L1 5 L3.5 -2 L5 0 L8 0" fill="none" stroke="${color}" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </g>
              <circle cx="16" cy="16" r="14" fill="none" stroke="${color}" strokeWidth="1.5" strokeDasharray="20 10 5 10" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="10s" repeatCount="indefinite" />
              </circle>
            `;
}

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // The regex will look for <Box component="svg" ...> ... </Box>
  // We need to match the attributes, and then replace its content.
  // Or even simpler, match the 3 circles and replace them.
  
  // Let's use a regex that matches the 3 circles
  const circleRegex = /<circle cx="16" cy="16" r="10" fill="none" stroke="([^"]+)"[\s\S]*?<\/circle>[\s]*<\/Box>/g;
  
  let newContent = content.replace(circleRegex, (match, color) => {
    return getReplacementSvgContent(color) + '</Box>';
  });

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log('Updated', filePath);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      replaceInFile(fullPath);
    }
  }
}

walk('src');
