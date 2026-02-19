/// <reference lib="dom" />
import React, { useState } from "react";
import { ViewState } from "../types";
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
  useTheme,
} from "@mui/material";
import { HistoryEdu, Error as ErrorIcon, Google } from "@mui/icons-material";
import { DecorativeCorners, FancyPaper } from "../components/StyledComponents";
import { supabase } from "../src/supabase";
import { User } from "@supabase/supabase-js";
import { DEFAULT_AVATAR_URL } from "../constants";

interface SignupProps {
  setView: (view: ViewState) => void;
  onLogin: (user: User) => void;
}

const Signup: React.FC<SignupProps> = ({ setView, onLogin }) => {
  const theme = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Regex: solo letras (incluyendo acentos), números y guiones bajos. Sin espacios ni símbolos raros.
  const validNameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9_]+$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Simplified validation
    if (!name.trim()) {
      setError("Por favor, inscribe tu nombre para continuar.");
      return;
    }

    if (!validNameRegex.test(name)) {
      setError(
        "El nombre solo puede contener letras, números y guiones bajos (sin espacios).",
      );
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

    if (!password) {
      setError("Debes inscribir una runa secreta.");
      return;
    }

    setIsLoading(true);

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          username: name,
          avatar_url: DEFAULT_AVATAR_URL,
        },
      },
    });

    if (signupError) {
      setError(signupError.message);
      setIsLoading(false);
    } else if (data.user) {
      // If we have a session, it's an auto-login (email confirmation disabled in Supabase)
      if (data.session) {
        onLogin(data.user);
        return;
      }

      // If no session, wait for confirmation, but show a SUCCESS message, not an error
      setSignupSuccess(true);
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (authError) {
      setError(authError.message);
    }
  };

  const [signupSuccess, setSignupSuccess] = useState(false);

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
      }}
    >
      <FancyPaper sx={{ width: "100%", maxWidth: 400 }}>
        <DecorativeCorners />

        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: "50%",
              bgcolor: (t) => alpha(t.palette.secondary.main, 0.1),
              border: 1,
              borderColor: (t) => alpha(t.palette.secondary.main, 0.3),
              mb: 2,
              color: "secondary.main",
            }}
          >
            <HistoryEdu sx={{ fontSize: 28 }} />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "common.white",
              textTransform: "uppercase",
              letterSpacing: 3,
            }}
          >
            Únete al Gremio
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "grey.500", fontStyle: "italic", mt: 1 }}
          >
            Comienza tu leyenda hoy.
          </Typography>
        </Box>

        <Collapse in={!!error}>
          <Alert
            severity="error"
            icon={<ErrorIcon />}
            sx={{
              mb: 3,
              bgcolor: (t) => alpha(t.palette.error.main, 0.1),
              border: 1,
              borderColor: "error.main",
            }}
          >
            <Typography variant="body2">{error}</Typography>
          </Alert>
        </Collapse>

        <Collapse in={signupSuccess}>
          <Paper
            sx={{
              mb: 3,
              p: 2,
              bgcolor: (t) => alpha(t.palette.secondary.main, 0.1),
              border: 2,
              borderColor: "secondary.main",
              borderRadius: 2,
              textAlign: "center",
              boxShadow: (t) =>
                `0 0 20px ${alpha(t.palette.secondary.main, 0.2)}`,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                color: "secondary.main",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: 1,
                mb: 0.5,
              }}
            >
              ¡Nombre Inscripto con Éxito!
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "grey.300", fontStyle: "italic" }}
            >
              Por favor, verifica tu correo electrónico para confirmar tu
              entrada al reino.
            </Typography>
          </Paper>
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
              placeholder="mago@soulforge.com"
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
                fontWeight: "bold",
                letterSpacing: 3,
                boxShadow: (t) =>
                  `0 0 20px ${alpha(t.palette.secondary.main, 0.2)}`,
                "&:hover": {
                  transform: "scale(1.02)",
                  bgcolor: "common.white",
                  color: "background.default",
                },
                "&:active": { transform: "scale(0.98)" },
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

        <Divider sx={{ my: 4 }}>
          <Typography
            variant="caption"
            sx={{
              color: "grey.600",
              px: 1,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            o utiliza magia externa
          </Typography>
        </Divider>

        <Button
          fullWidth
          variant="outlined"
          onClick={handleGoogleSignup}
          disabled={isLoading}
          startIcon={<Google />}
          sx={{
            py: 1.5,
            borderColor: (t) => alpha(t.palette.secondary.main, 0.3),
            color: "common.white",
            fontWeight: "bold",
            letterSpacing: 1,
            "&:hover": {
              borderColor: "secondary.main",
              bgcolor: (t) => alpha(t.palette.secondary.main, 0.05),
            },
          }}
        >
          Continuar con Google
        </Button>

        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography
            variant="body2"
            sx={{ color: "grey.500", fontStyle: "italic", mb: 1 }}
          >
            ¿Ya eres miembro?
          </Typography>
          <Button
            onClick={() => !isLoading && setView(ViewState.LOGIN)}
            disabled={isLoading}
            sx={{
              color: "primary.main",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: 2,
              fontSize: "0.7rem",
              "&:hover": { color: "common.white" },
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
