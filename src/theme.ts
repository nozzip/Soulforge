import { createTheme, ThemeOptions, alpha } from '@mui/material/styles';

// Extend the palette interface to include custom colors if needed
declare module '@mui/material/styles' {
  interface Palette {
    parchment: Palette['primary'];
    obsidian: Palette['primary'];
    accent: Palette['primary'];
  }
  interface PaletteOptions {
    parchment?: PaletteOptions['primary'];
    obsidian?: PaletteOptions['primary'];
    accent?: PaletteOptions['primary'];
  }
}

// Common Typography
const typography = {
  fontFamily: '"Newsreader", "Cinzel", serif',
  h1: { fontFamily: '"Cinzel", serif', fontWeight: 700 },
  h2: { fontFamily: '"Cinzel", serif', fontWeight: 700 },
  h3: { fontFamily: '"Cinzel", serif', fontWeight: 700 },
  h4: { fontFamily: '"Cinzel", serif', fontWeight: 700 },
  h5: { fontFamily: '"Cinzel", serif', fontWeight: 700 },
  h6: { fontFamily: '"Cinzel", serif', fontWeight: 700 },
  button: { fontFamily: '"Cinzel", serif', fontWeight: 700, letterSpacing: '0.1em' },
};

// Fantasy Theme (Default)
export const fantasyTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#d41111',
      dark: '#960018',
      contrastText: '#f2e9d0',
    },
    secondary: {
      main: '#c5a059',
      dark: '#9d7a3d',
      contrastText: '#221010',
    },
    background: {
      default: '#221010',
      paper: '#2d1b1b',
    },
    text: {
      primary: '#f2e9d0',
      secondary: '#c5a059',
    },
    accent: {
      main: '#c5a059', // Gold
    },
    parchment: {
      main: '#2d1b1b',
    },
  },
  typography: {
    ...typography,
    fontFamily: '"Newsreader", serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: 'uppercase',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: "url('https://www.transparenttextures.com/patterns/dark-leather.png')",
          backgroundBlendMode: 'overlay',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            backgroundColor: theme.palette.background.default,
            '& fieldset': {
              borderColor: `rgba(197, 160, 89, 0.3)`,
            },
            '&:hover fieldset': {
              borderColor: theme.palette.secondary.main,
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.secondary.main,
            },
          },
          '& .MuiInputLabel-root': {
            color: theme.palette.secondary.main,
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            letterSpacing: '2px',
            fontWeight: 'bold',
          },
          '& .MuiInputBase-input': {
            color: theme.palette.common.white,
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        }),
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: `rgba(197, 160, 89, 0.2)`,
        }),
      },
    },
  },
});

// Warhammer Theme (Grimdark)
export const warhammerTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0ea5e9', // Sky Blue/Plasma
      dark: '#0369a1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#9ca3af', // Steel Grey
      dark: '#4b5563',
      contrastText: '#ffffff',
    },
    background: {
      default: '#030712', // Void Black
      paper: '#111827', // Dark Slate
    },
    text: {
      primary: '#f2e9d0',
      secondary: '#9ca3af', // Steel Grey
    },
    accent: {
      main: '#9ca3af',
    },
  },
  typography: {
    ...typography,
    fontFamily: '"Cinzel", serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          textTransform: 'uppercase',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')",
          backgroundBlendMode: 'screen',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            backgroundColor: theme.palette.background.default,
            '& fieldset': {
              borderColor: alpha(theme.palette.primary.main, 0.3),
            },
            '&:hover fieldset': {
              borderColor: theme.palette.primary.main,
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.primary.main,
            },
          },
          '& .MuiInputLabel-root': {
            color: theme.palette.primary.main,
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            letterSpacing: '2px',
            fontWeight: 'bold',
          },
          '& .MuiInputBase-input': {
            color: theme.palette.common.white,
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        }),
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: alpha(theme.palette.primary.main, 0.2),
        }),
      },
    },
  },
});
