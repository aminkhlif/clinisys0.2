import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from '../theme/theme.js';

const ThemeContext = createContext({
  mode: 'light',
  toggleTheme: () => {},
});

export const useAppTheme = () => useContext(ThemeContext);

export function AppThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('appTheme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('appTheme', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
