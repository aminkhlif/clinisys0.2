
import { createTheme } from '@mui/material/styles';

export const neutral = {
  0: '#FFFFFF',
  50: '#F8FAFC',
  100: '#F1F5F9',
  200: '#E2E8F0',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1E293B',
  900: '#0F172A',
  950: '#020617',
};

export const brand = {
  main: '#0D9488', // Teal 600
  light: '#14B8A6', // Teal 500
  dark: '#0F766E', // Teal 700
  contrastText: '#FFFFFF',
};

export const getTheme = (mode) => {
  const isLight = mode === 'light';
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: brand.main,
        light: brand.light,
        dark: brand.dark,
        contrastText: brand.contrastText,
      },
      secondary: {
        main: isLight ? neutral[600] : neutral[400],
        light: isLight ? neutral[500] : neutral[300],
        dark: isLight ? neutral[700] : neutral[500],
        contrastText: '#FFFFFF',
      },
      background: {
        default: isLight ? neutral[50] : neutral[900],
        paper: isLight ? neutral[0] : neutral[800],
      },
      text: {
        primary: isLight ? neutral[900] : neutral[50],
        secondary: isLight ? neutral[600] : neutral[300],
        disabled: isLight ? neutral[400] : neutral[500],
      },
      divider: isLight ? neutral[200] : neutral[700],
      success: { main: '#10B981', contrastText: '#FFFFFF' },
      warning: { main: '#F59E0B', contrastText: '#FFFFFF' },
      error: { main: '#EF4444', contrastText: '#FFFFFF' },
      info: { main: '#3B82F6', contrastText: '#FFFFFF' },
      action: {
        hover: isLight ? 'rgba(15, 23, 42, 0.04)' : 'rgba(255, 255, 255, 0.08)',
        selected: isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.16)',
        disabled: isLight ? neutral[300] : neutral[600],
        disabledBackground: isLight ? neutral[100] : neutral[800],
      },
    },
    shape: {
      borderRadius: 10,
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      h1: { fontWeight: 700, fontSize: '2.25rem', letterSpacing: '-0.04em', color: isLight ? neutral[900] : neutral[50] },
      h2: { fontWeight: 700, fontSize: '1.875rem', letterSpacing: '-0.03em', color: isLight ? neutral[900] : neutral[50] },
      h3: { fontWeight: 650, fontSize: '1.5rem', letterSpacing: '-0.02em', color: isLight ? neutral[900] : neutral[50] },
      h4: { fontWeight: 650, fontSize: '1.25rem', letterSpacing: '-0.02em', color: isLight ? neutral[900] : neutral[50] },
      h5: { fontWeight: 600, fontSize: '1.125rem', letterSpacing: '-0.01em', color: isLight ? neutral[900] : neutral[50] },
      h6: { fontWeight: 600, fontSize: '1rem', letterSpacing: '-0.01em', color: isLight ? neutral[900] : neutral[50] },
      subtitle1: { fontWeight: 500, fontSize: '1rem', color: isLight ? neutral[700] : neutral[200] },
      subtitle2: { fontWeight: 500, fontSize: '0.875rem', color: isLight ? neutral[600] : neutral[300] },
      body1: { fontSize: '0.9375rem', color: isLight ? neutral[700] : neutral[200], lineHeight: 1.6 },
      body2: { fontSize: '0.875rem', color: isLight ? neutral[600] : neutral[300], lineHeight: 1.57 },
      button: { textTransform: 'none', fontWeight: 500, letterSpacing: '0.01em' },
      caption: { fontSize: '0.75rem', color: isLight ? neutral[500] : neutral[400], fontWeight: 500 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': { boxSizing: 'border-box' },
          body: { 
            backgroundColor: isLight ? neutral[50] : neutral[900], 
            color: isLight ? neutral[900] : neutral[50],
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
          '::selection': { backgroundColor: brand.light, color: '#fff' },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: isLight ? '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' : '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
            border: `1px solid ${isLight ? neutral[200] : neutral[700]}`,
            transition: 'all 0.2s ease-in-out',
            backgroundColor: isLight ? neutral[0] : neutral[800],
            '&:hover': {
              borderColor: brand.light,
              boxShadow: isLight ? '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)' : '0 10px 15px -3px rgba(0, 0, 0, 0.6)',
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
            fontSize: '0.875rem',
            padding: '8px 16px',
            transition: 'all 0.15s ease',
          },
          containedPrimary: {
            backgroundColor: brand.main,
            color: '#fff',
            '&:hover': {
              backgroundColor: brand.dark,
              boxShadow: isLight ? '0 4px 12px rgba(13, 148, 136, 0.25)' : '0 4px 12px rgba(13, 148, 136, 0.4)',
            },
          },
          outlined: {
            borderColor: isLight ? neutral[300] : neutral[600],
            color: isLight ? neutral[700] : neutral[200],
            backgroundColor: isLight ? neutral[0] : neutral[800],
            '&:hover': { 
               borderColor: brand.main, 
               backgroundColor: isLight ? neutral[50] : neutral[700],
              color: brand.main,
            },
          },
          text: {
            color: isLight ? neutral[600] : neutral[300],
            '&:hover': { backgroundColor: isLight ? neutral[100] : neutral[700], color: isLight ? neutral[900] : neutral[50] },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              backgroundColor: isLight ? neutral[0] : neutral[800],
              transition: 'all 0.15s ease',
              '& fieldset': { borderColor: isLight ? neutral[200] : neutral[600] },
              '&:hover fieldset': { borderColor: isLight ? neutral[300] : neutral[500] },
              '&.Mui-focused fieldset': { 
                 borderColor: brand.main, 
                 borderWidth: '2px',
              },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none', backgroundColor: isLight ? neutral[0] : neutral[800] },
          elevation1: { border: `1px solid ${isLight ? neutral[200] : neutral[700]}`, boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(12px)',
            color: isLight ? neutral[900] : neutral[50],
            boxShadow: 'none',
            borderBottom: `1px solid ${isLight ? neutral[200] : neutral[700]}`,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3,
            backgroundColor: brand.main,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            color: isLight ? neutral[600] : neutral[400],
            '&.Mui-selected': {
              color: brand.main,
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { 
             borderRadius: 16, 
             border: `1px solid ${isLight ? neutral[200] : neutral[700]}`,
            boxShadow: isLight ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
            backgroundColor: isLight ? neutral[0] : neutral[800],
          },
        },
      },
      MuiDivider: {
        styleOverrides: { root: { borderColor: isLight ? neutral[200] : neutral[700] } },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
            fontSize: '0.75rem',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? neutral[50] : neutral[900],
            '& .MuiTableCell-root': {
              color: isLight ? neutral[600] : neutral[300],
              fontWeight: 600,
              borderBottom: `2px solid ${isLight ? neutral[200] : neutral[700]}`,
            }
          }
        }
      }
    },
  });
};

export default getTheme('light'); // default export for backward compatibility where 'theme' was imported directly
