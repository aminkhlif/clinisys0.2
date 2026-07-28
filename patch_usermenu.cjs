const fs = require('fs');
let content = fs.readFileSync('src/components/auth/UserMenu.jsx', 'utf8');

content = content.replace("import { useAuth } from '../../context/AuthContext.jsx';", "import { useAuth } from '../../context/AuthContext.jsx';\nimport { useAppTheme } from '../../context/ThemeContext.jsx';");

content = content.replace("function UserMenu({ variant = 'light' }) {", "function UserMenu({ variant: forceVariant }) {");
content = content.replace("const estSombre = variant === 'dark';", "const { mode } = useAppTheme();\n  const estSombre = forceVariant ? forceVariant === 'dark' : mode === 'dark';");

fs.writeFileSync('src/components/auth/UserMenu.jsx', content);
