const fs = require('fs');

let content = fs.readFileSync('src/components/layout/TopBar.jsx', 'utf8');

// Insert imports
content = content.replace(
  "import { Box, Breadcrumbs, Typography } from '@mui/material';",
  "import { Box, Breadcrumbs, Typography, IconButton } from '@mui/material';\nimport DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';\nimport LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';\nimport { useAppTheme } from '../../context/ThemeContext.jsx';"
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

// Add ThemeToggle component
content += `

function ThemeToggle() {
  const { mode, toggleTheme } = useAppTheme();
  return (
    <IconButton onClick={toggleTheme} color="inherit" sx={{ ml: 1 }}>
      {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
    </IconButton>
  );
}
`;

fs.writeFileSync('src/components/layout/TopBar.jsx', content);
