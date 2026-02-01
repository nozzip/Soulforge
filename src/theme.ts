import { createTheme, ThemeOptions, alpha } from '@mui/material/styles';

// Extend the palette interface to include custom colors if needed
declare module '@mui/material/styles' {
  interface Palette {
    parchment: Palette['primary'];
    obsidian: Palette['primary'];
    accent: Palette['primary'];
    glow: Palette['primary'];
  }
  interface PaletteOptions {
    parchment?: PaletteOptions['primary'];
    obsidian?: PaletteOptions['primary'];
    accent?: PaletteOptions['primary'];
    glow?: PaletteOptions['primary'];
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

// Fantasy Theme (Default) - D&D Aesthetic
export const fantasyTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#d41111',
      light: '#ff4444',
      dark: '#960018',
      contrastText: '#f2e9d0',
    },
    secondary: {
      main: '#c5a059',
      light: '#e8c978',
      dark: '#9d7a3d',
      contrastText: '#1a0d0d', // Obsidian/Dark Brown for better legibility on gold
    },
    background: {
      default: '#1a0d0d',
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
    glow: {
      main: '#c5a059', // Gold glow for fantasy
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
          borderRadius: 2,
          textTransform: 'uppercase',
          transition: 'all 0.25s ease',
        },
        contained: {
          boxShadow: '0 4px 12px rgba(212, 17, 17, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(212, 17, 17, 0.35), 0 0 20px rgba(197, 160, 89, 0.15)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(197, 160, 89, 0.08)',
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        '@import': "url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap')",
        body: {
          backgroundImage: "url('https://www.transparenttextures.com/patterns/dark-leather.png')",
          backgroundBlendMode: 'overlay',
        },
        '::selection': {
          backgroundColor: '#c5a059',
          color: '#1a0d0d',
        },
        '*::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '*::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(197, 160, 89, 0.3)',
          borderRadius: '4px',
          border: '2px solid transparent',
          backgroundClip: 'content-box',
          '&:hover': {
            backgroundColor: 'rgba(197, 160, 89, 0.6)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            backgroundColor: alpha(theme.palette.background.default, 0.8),
            backdropFilter: 'blur(4px)',
            '& fieldset': {
              borderColor: `rgba(197, 160, 89, 0.3)`,
              borderWidth: 2,
            },
            '&:hover fieldset': {
              borderColor: theme.palette.secondary.main,
              boxShadow: '0 0 10px rgba(197, 160, 89, 0.2)',
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.secondary.main,
              boxShadow: '0 0 15px rgba(197, 160, 89, 0.3)',
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
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3)',
            pointerEvents: 'none',
          },
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: -1,
            borderRadius: 'inherit',
            background: 'linear-gradient(135deg, rgba(197, 160, 89, 0.3), transparent, rgba(197, 160, 89, 0.1))',
            opacity: 0,
            transition: 'opacity 0.4s ease',
            pointerEvents: 'none',
            zIndex: -1,
          },
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 30px rgba(197, 160, 89, 0.15)',
            '&::after': {
              opacity: 1,
            },
          },
        }),
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: `rgba(197, 160, 89, 0.2)`,
          '&::before, &::after': {
            borderColor: 'inherit',
          },
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontFamily: '"Cinzel", serif',
          fontWeight: 600,
          letterSpacing: '0.05em',
          ...(theme.palette.mode === 'dark' && {
            '&.MuiChip-outlinedSecondary': {
              borderColor: alpha(theme.palette.secondary.main, 0.5),
              color: theme.palette.secondary.main,
            },
            '&.MuiChip-filledSecondary': {
              backgroundColor: '#1a0d0d', // Obsidian/Dark Brown background
              color: '#c5a059', // Gold text
              border: '1px solid #c5a059',
              fontWeight: 800,
              letterSpacing: '0.1em',
              '&:hover': {
                backgroundColor: '#2d1b1b',
                color: '#e8c978',
              }
            }
          })
        }),
        filled: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        },
      },
    },
  },
});

// Warhammer Theme (Grimdark) - 40K Aesthetic
export const warhammerTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0ea5e9', // Sky Blue/Plasma
      light: '#38bdf8',
      dark: '#0369a1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#9ca3af', // Steel Grey
      light: '#d1d5db',
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
    glow: {
      main: '#0ea5e9', // Plasma blue glow for Warhammer
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
          transition: 'all 0.25s ease',
        },
        contained: {
          boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(14, 165, 233, 0.4), 0 0 20px rgba(14, 165, 233, 0.2)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(14, 165, 233, 0.08)',
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        '@import': "url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap')",
        body: {
          backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')",
          backgroundBlendMode: 'screen',
        },
        '::selection': {
          backgroundColor: '#0ea5e9',
          color: '#030712',
        },
        '*::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '*::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(14, 165, 233, 0.3)',
          borderRadius: '4px',
          border: '2px solid transparent',
          backgroundClip: 'content-box',
          '&:hover': {
            backgroundColor: 'rgba(14, 165, 233, 0.6)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            backgroundColor: alpha(theme.palette.background.default, 0.8),
            backdropFilter: 'blur(4px)',
            '& fieldset': {
              borderColor: alpha(theme.palette.primary.main, 0.3),
              borderWidth: 2,
            },
            '&:hover fieldset': {
              borderColor: theme.palette.primary.main,
              boxShadow: '0 0 10px rgba(14, 165, 233, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.primary.main,
              boxShadow: '0 0 15px rgba(14, 165, 233, 0.4)',
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
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.4)',
            pointerEvents: 'none',
          },
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: -1,
            borderRadius: 'inherit',
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.3), transparent, rgba(14, 165, 233, 0.1))',
            opacity: 0,
            transition: 'opacity 0.4s ease',
            pointerEvents: 'none',
            zIndex: -1,
          },
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 30px rgba(14, 165, 233, 0.2)',
            '&::after': {
              opacity: 1,
            },
          },
        }),
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: alpha(theme.palette.primary.main, 0.2),
          '&::before, &::after': {
            borderColor: 'inherit',
          },
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: '"Cinzel", serif',
          fontWeight: 600,
          letterSpacing: '0.05em',
        },
        filled: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        },
      },
    },
  },
});
