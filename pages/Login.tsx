/// <reference lib="dom" />
import React, { useState } from 'react';
import { ViewState } from '../types';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Divider,
  CircularProgress,
  alpha,
  useTheme
} from '@mui/material';
import { Lock, ArrowForward, Google } from '@mui/icons-material';
import { DecorativeCorners, FancyPaper } from '../components/StyledComponents';
import { supabase } from '../src/supabase';
import { User } from '@supabase/supabase-js';
import { Alert, Collapse } from '@mui/material';

interface LoginProps {
  setView: (view: ViewState) => void;
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ setView, onLogin }) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else if (data.user) {
      onLogin(data.user);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    });
    if (error) setError(error.message);
    setIsLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
      <FancyPaper sx={{ width: '100%', maxWidth: 400 }}>
        <DecorativeCorners />

        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', bgcolor: (t) => alpha(t.palette.secondary.main, 0.1), border: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.3), mb: 2, color: 'secondary.main' }}>
            <Lock sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'common.white', textTransform: 'uppercase', letterSpacing: 3 }}>Identifícate</Typography>
          <Typography variant="body2" sx={{ color: 'grey.500', fontStyle: 'italic', mt: 1 }}>Accede a los archivos de forma segura.</Typography>
        </Box>

        <Collapse in={!!error}>
          <Alert severity="error" sx={{ mb: 3, bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', border: 1, borderColor: 'error.main' }}>
            {error}
          </Alert>
        </Collapse>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Pergamino de Email"
              type="email"
              required
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mago@resinforge.com"
            />
            <TextField
              fullWidth
              label="Runa Secreta"
              type="password"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={isLoading}
              size="large"
              sx={{
                py: 2,
                fontWeight: 'bold',
                letterSpacing: 3,
                border: 1,
                borderColor: (t) => alpha(t.palette.secondary.main, 0.2),
                boxShadow: (t) => `0 0 20px ${alpha(t.palette.primary.main, 0.3)}`,
                '&:hover': { transform: 'scale(1.02)' },
                '&:active': { transform: 'scale(0.98)' }
              }}
            >
              {isLoading ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={20} color="inherit" />
                  <span>Descifrando...</span>
                </Stack>
              ) : (
                "Entrar al Reino"
              )}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              disabled={isLoading}
              onClick={handleGoogleLogin}
              startIcon={<Google />}
              sx={{
                py: 1.5,
                fontWeight: 'bold',
                letterSpacing: 1,
                borderColor: alpha(theme.palette.secondary.main, 0.3),
                '&:hover': { borderColor: 'secondary.main', bgcolor: alpha(theme.palette.secondary.main, 0.05) }
              }}
            >
              Conectar con Google
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'grey.500', fontStyle: 'italic', mb: 1 }}>¿Eres nuevo en la forja?</Typography>
          <Button
            onClick={() => !isLoading && setView(ViewState.SIGNUP)}
            disabled={isLoading}
            endIcon={<ArrowForward sx={{ transition: 'transform 0.2s' }} />}
            sx={{
              color: 'secondary.main',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: 2,
              fontSize: '0.7rem',
              '&:hover': { color: 'common.white' },
              '&:hover .MuiSvgIcon-root': { transform: 'translateX(4px)' }
            }}
          >
            Inscribir Nuevo Nombre
          </Button>
        </Box>
      </FancyPaper>
    </Container>
  );
};

export default Login;