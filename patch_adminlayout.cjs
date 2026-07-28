const fs = require('fs');

let content = fs.readFileSync('src/components/layout/AdminLayout.jsx', 'utf8');

// Insert imports
content = content.replace(
  "import { AppBar, Box, Toolbar, Typography, Stack, Container } from '@mui/material';",
  "import { AppBar, Box, Toolbar, Typography, Stack, Container, IconButton } from '@mui/material';\nimport DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';\nimport LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';\nimport { useAppTheme } from '../../context/ThemeContext.jsx';"
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

// We also should remove hardcoded values like 'rgba(255, 255, 255, 0.8)' and '#171717' and '#EAEAEA' that might look bad in dark mode.
content = content.replace(
  "bgcolor: 'rgba(255, 255, 255, 0.8)',",
  "bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.8)',"
);
content = content.replace(
  "borderBottom: '1px solid #EAEAEA',",
  "borderBottom: (theme) => `1px solid ${theme.palette.divider}`,"
);
content = content.replace(
  "color: '#171717'",
  "color: 'text.primary'"
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

fs.writeFileSync('src/components/layout/AdminLayout.jsx', content);
