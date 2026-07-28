const fs = require('fs');

let content = fs.readFileSync('src/main.jsx', 'utf8');

content = content.replace(
  "import { ThemeProvider, CssBaseline } from '@mui/material';",
  "import { BrowserRouter } from 'react-router-dom';"
);
content = content.replace(
  "import { BrowserRouter } from 'react-router-dom';",
  "" // already added above, actually wait, just replace the imports properly
);

content = `
// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { AppThemeProvider } from './context/ThemeContext.jsx';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppThemeProvider>
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SnackbarProvider>
    </AppThemeProvider>
  </React.StrictMode>
);
`;

fs.writeFileSync('src/main.jsx', content.trim() + '\n');
