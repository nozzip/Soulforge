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
  Alert,
  Collapse,
  alpha,
  useTheme
} from '@mui/material';
import { HistoryEdu, Error as ErrorIcon } from '@mui/icons-material';
import { DecorativeCorners, FancyPaper } from '../components/StyledComponents';
import { supabase } from '../src/supabase';
import { User } from '@supabase/supabase-js';

interface SignupProps {
  setView: (view: ViewState) => void;
  onLogin: (user: User) => void;
}

const Signup: React.FC<SignupProps> = ({ setView, onLogin }) => {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Regex: solo letras (incluyendo acentos), números y guiones bajos. Sin espacios ni símbolos raros.
  const validNameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9_]+$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Por favor, inscribe tu nombre para continuar.");
      return;
    }

    if (!validNameRegex.test(name)) {
      setError("El nombre solo puede contener letras, números y guiones bajos. Sin espacios ni símbolos especiales.");
      return;
    }

    if (name.length < 3 || name.length > 20) {
      setError("El nombre debe tener entre 3 y 20 caracteres.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("El pergamino de email parece estar mal escrito.");
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError("Tu runa secreta debe tener al menos 8 caracteres.");
      return;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      setError("Tu runa secreta debe contener mayúsculas, minúsculas, números y caracteres especiales.");
      return;
    }

    setIsLoading(true);

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (signupError) {
      setError(signupError.message);
      setIsLoading(false);
    } else if (data.user) {
      // Create user profile with username
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: data.user.id,
          username: name
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Continue anyway, profile can be created later
      }

      onLogin(data.user);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
      <FancyPaper sx={{ width: '100%', maxWidth: 400 }}>
        <DecorativeCorners />

        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', bgcolor: (t) => alpha(t.palette.secondary.main, 0.1), border: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.3), mb: 2, color: 'secondary.main' }}>
            <HistoryEdu sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'common.white', textTransform: 'uppercase', letterSpacing: 3 }}>Únete al Gremio</Typography>
          <Typography variant="body2" sx={{ color: 'grey.500', fontStyle: 'italic', mt: 1 }}>Comienza tu leyenda hoy.</Typography>
        </Box>

        <Collapse in={!!error}>
          <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 3, bgcolor: (t) => alpha(t.palette.error.main, 0.1), border: 1, borderColor: 'error.main' }}>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        </Collapse>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Nombre del Aventurero"
              type="text"
              disabled={isLoading}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="GaldorElValiente"
              helperText="Solo letras, números y guiones bajos. Sin espacios (3-20 caracteres)."
              inputProps={{ maxLength: 20 }}
            />
            <TextField
              fullWidth
              label="Pergamino de Email"
              type="email"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mago@resinforge.com"
            />
            <TextField
              fullWidth
              label="Runa Secreta"
              type="password"
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="secondary"
              disabled={isLoading}
              size="large"
              sx={{
                py: 2,
                fontWeight: 'bold',
                letterSpacing: 3,
                boxShadow: (t) => `0 0 20px ${alpha(t.palette.secondary.main, 0.2)}`,
                '&:hover': { transform: 'scale(1.02)', bgcolor: 'common.white', color: 'background.default' },
                '&:active': { transform: 'scale(0.98)' }
              }}
            >
              {isLoading ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={20} color="inherit" />
                  <span>Forjando Perfil...</span>
                </Stack>
              ) : (
                "Inscribir Nombre"
              )}
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'grey.500', fontStyle: 'italic', mb: 1 }}>¿Ya eres miembro?</Typography>
          <Button
            onClick={() => !isLoading && setView(ViewState.LOGIN)}
            disabled={isLoading}
            sx={{
              color: 'primary.main',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: 2,
              fontSize: '0.7rem',
              '&:hover': { color: 'common.white' }
            }}
          >
            Acceder a los Archivos
          </Button>
        </Box>
      </FancyPaper>
    </Container>
  );
};

export default Signup;