const fs = require('fs');

let content = fs.readFileSync('src/components/layout/MainLayout.jsx', 'utf8');

// Insert imports
content = content.replace(
  "import { AppBar, Box, Drawer, Toolbar, Typography, Stack } from '@mui/material';",
  "import { AppBar, Box, Drawer, Toolbar, Typography, Stack, IconButton } from '@mui/material';\nimport DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';\nimport LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';\nimport { useAppTheme } from '../../context/ThemeContext.jsx';"
);

// Replace UserMenu part
content = content.replace(
  "<UserMenu variant=\"light\" />",
  `
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ThemeToggle />
            <UserMenu variant="light" />
          </Box>
  `.trim()
);

// Replace hardcoded light colors
content = content.replace(
  "bgcolor: 'rgba(255, 255, 255, 0.8)'",
  "bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.8)'"
);
content = content.replace(
  /borderBottom: '1px solid #EAEAEA'/g,
  "borderBottom: (theme) => `1px solid ${theme.palette.divider}`"
);
content = content.replace(
  /borderRight: '1px solid #EAEAEA'/g,
  "borderRight: (theme) => `1px solid ${theme.palette.divider}`"
);
content = content.replace(
  "color: '#171717'",
  "color: 'text.primary'"
);
content = content.replace(
  "color: '#171717'",
  "color: 'text.primary'"
);

content = content.replace(
  /fill="#000000"/g,
  'fill="currentColor"'
);
content = content.replace(
  /stroke="#000000"/g,
  'stroke="currentColor"'
);

// Add ThemeToggle component
content += `

function ThemeToggle() {
  const { mode, toggleTheme } = useAppTheme();
  return (
    <IconButton onClick={toggleTheme} color="inherit" sx={{ ml: 1, color: 'text.primary' }}>
      {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
    </IconButton>
  );
}
`;

fs.writeFileSync('src/components/layout/MainLayout.jsx', content);
