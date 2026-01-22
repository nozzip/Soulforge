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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please inscribe your name to continue.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("The email scroll appears malformed.");
      return;
    }

    if (password.length < 6) {
      setError("Your secret rune must be at least 6 characters.");
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
      // Note: If email confirmation is enabled, data.user might be present but session null.
      // But for this demo, we'll assume it works or wait for session.
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
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'common.white', textTransform: 'uppercase', letterSpacing: 3 }}>Join The Guild</Typography>
          <Typography variant="body2" sx={{ color: 'grey.500', fontStyle: 'italic', mt: 1 }}>Begin your legend today.</Typography>
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
              label="Adventurer Name"
              type="text"
              disabled={isLoading}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Galdor the Brave"
            />
            <TextField
              fullWidth
              label="Email Scroll"
              type="email"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="wizard@resinforge.com"
            />
            <TextField
              fullWidth
              label="Secret Rune"
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
                  <span>Forging Profile...</span>
                </Stack>
              ) : (
                "Inscribe Name"
              )}
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'grey.500', fontStyle: 'italic', mb: 1 }}>Already a member?</Typography>
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
            Access Archives
          </Button>
        </Box>
      </FancyPaper>
    </Container>
  );
};

export default Signup;