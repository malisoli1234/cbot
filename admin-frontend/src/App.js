import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Records from './pages/Records';
import Sites from './pages/Sites';
import Settings from './pages/Settings';

// Enhanced Coolors Palette Theme with Production Features
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#40916c',
      light: '#52b788',
      dark: '#2d6a4f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#74c69d',
      light: '#95d5b2',
      dark: '#52b788',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
      gradient: 'linear-gradient(135deg, #d8f3dc 0%, #b7e4c7 50%, #95d5b2 100%)',
    },
    text: {
      primary: '#081c15',
      secondary: '#1b4332',
      disabled: '#64748b',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Tahoma", "Geneva", "Verdana", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      background: 'linear-gradient(135deg, #40916c, #52b788)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      color: '#081c15',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#1b4332',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#1b4332',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      color: '#1b4332',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      color: '#1b4332',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#1b4332',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#64748b',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 4px 20px rgba(45, 106, 79, 0.08), 0 2px 8px rgba(45, 106, 79, 0.06)',
          border: '1px solid rgba(149, 213, 178, 0.2)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.95)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #40916c, #52b788, #74c69d)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 20px 40px rgba(45, 106, 79, 0.15), 0 8px 16px rgba(45, 106, 79, 0.1)',
            '&::before': {
              opacity: 1,
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          fontSize: '0.875rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            transition: 'left 0.5s ease',
          },
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 16px rgba(64, 145, 108, 0.3)',
            '&::before': {
              left: '100%',
            },
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #40916c, #52b788)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #2d6a4f, #40916c)',
          },
        },
        outlined: {
          borderColor: '#40916c',
          color: '#40916c',
          '&:hover': {
            background: 'rgba(64, 145, 108, 0.1)',
            borderColor: '#2d6a4f',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 600,
          fontSize: '0.75rem',
          height: '28px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.3s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#52b788',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#40916c',
                borderWidth: 2,
              },
            },
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase': {
            '&.Mui-checked': {
              color: '#40916c',
              '& + .MuiSwitch-track': {
                backgroundColor: '#52b788',
              },
            },
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          '& .MuiSlider-thumb': {
            backgroundColor: '#40916c',
            '&:hover': {
              boxShadow: '0 0 0 8px rgba(64, 145, 108, 0.16)',
            },
          },
          '& .MuiSlider-track': {
            backgroundColor: '#52b788',
          },
          '& .MuiSlider-rail': {
            backgroundColor: '#e2e8f0',
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: 'rgba(64, 145, 108, 0.05)',
            fontWeight: 700,
            color: '#1b4332',
            borderBottom: '2px solid #e2e8f0',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #f1f5f9',
          padding: '16px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 20px rgba(45, 106, 79, 0.08)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #081c15 0%, #1b4332 100%)',
          borderRight: 'none',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
  // Production optimizations
  unstable_strictMode: true,
  unstable_sx: true,
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #d8f3dc 0%, #b7e4c7 50%, #95d5b2 100%)',
        backgroundAttachment: 'fixed',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          pointerEvents: 'none',
          zIndex: -1,
        },
      }}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/records" element={<Records />} />
              <Route path="/sites" element={<Sites />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </Router>
      </Box>
    </ThemeProvider>
  );
}

export default App;
