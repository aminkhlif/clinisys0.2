const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // common hardcoded colors
  content = content.replace(/'grey\.50'/g, "'background.paper'");
  content = content.replace(/'grey\.100'/g, "'action.hover'");
  content = content.replace(/'grey\.200'/g, "'action.disabledBackground'");
  content = content.replace(/'#FAFAFA'/g, "'background.default'");
  content = content.replace(/'#FFFFFF'/g, "'background.paper'");
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log('Updated bgcolors in', filePath);
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
