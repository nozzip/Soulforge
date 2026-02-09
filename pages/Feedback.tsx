import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Rating,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Stack,
  Divider,
  alpha,
  Collapse,
  useTheme,
} from "@mui/material";
import {
  Star,
  ContentCopy,
  AutoAwesome,
  Lock,
  ArrowForward,
  PersonAdd,
} from "@mui/icons-material";
import { supabase } from "../src/supabase";
import { ViewState } from "../types";
import { User } from "@supabase/supabase-js";
import { FancyPaper, DecorativeCorners } from "../components/StyledComponents";

interface FeedbackProps {
  setView: (view: ViewState) => void;
  user: User | null;
  onLogin: (user: User) => void;
}

const Feedback: React.FC<FeedbackProps> = ({ setView, user, onLogin }) => {
  const theme = useTheme();
  const [token, setToken] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth State
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmailAuth] = useState("");
  const [password, setPasswordAuth] = useState("");
  const [username, setUsername] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [rating, setRating] = useState<number | null>(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success State
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Extract token from URL manually since we don't have a router hook
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");

    if (!tokenParam) {
      setIsValidating(false);
      setError("Enlace inválido. No se encontró el sello de autenticidad.");
      return;
    }

    setToken(tokenParam);
    validateToken(tokenParam);
  }, []);

  // Pre-fill name from user if available
  useEffect(() => {
    if (user && !name) {
      // Try to get display name or email prefix
      const displayName =
        user.user_metadata?.username || user.email?.split("@")[0] || "";
      setName(displayName);
    }
  }, [user, name]);

  const validateToken = async (t: string) => {
    try {
      const { data, error } = await supabase.rpc("verify_feedback_token", {
        input_token: t,
      });

      if (error) throw error;

      if (data === true) {
        setIsValidToken(true);
      } else {
        setError("Este pergamino ya ha sido usado o ha expirado.");
      }
    } catch (err: any) {
      console.error("Error validating token:", err);
      setError("Error al verificar el sello mágico.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    let loginEmail = email;

    // Check if input is username (no @ symbol)
    if (!email.includes("@")) {
      const { data: emailData, error: rpcError } = await supabase.rpc(
        "get_email_from_username",
        { input_username: email.trim() },
      );

      if (rpcError || !emailData) {
        setAuthError("Usuario no encontrado.");
        setAuthLoading(false);
        return;
      }
      loginEmail = emailData;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (error) {
      setAuthError(error.message);
    } else if (data.user) {
      onLogin(data.user);
    }
    setAuthLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: username || email.split("@")[0] },
      },
    });

    if (error) {
      setAuthError(error.message);
    } else if (data.user) {
      onLogin(data.user);
    }
    setAuthLoading(false);
  };

  const handleSubmit = async () => {
    if (!token || !rating || !name) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.rpc(
        "submit_review_and_get_coupon",
        {
          input_token: token,
          review_name: name,
          review_rating: rating,
          review_comment: comment,
        },
      );

      if (error) throw error;

      setCouponCode(data); // The RPC returns the new coupon code
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setError(err.message || "Error al inscribir la reseña.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (couponCode) {
      navigator.clipboard.writeText(couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isValidating) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
        <CircularProgress color="secondary" />
        <Typography sx={{ mt: 2, color: "text.secondary" }}>
          Verificando sello de autenticidad...
        </Typography>
      </Container>
    );
  }

  if (couponCode) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper
          elevation={4}
          sx={{
            p: 6,
            textAlign: "center",
            border: 2,
            borderColor: "secondary.main",
            bgcolor: "background.paper",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              bgcolor: "secondary.main",
            }}
          />
          <AutoAwesome sx={{ fontSize: 60, color: "secondary.main", mb: 2 }} />
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              fontStyle: "italic",
              mb: 2,
              color: "common.white",
            }}
          >
            ¡Honor a ti, Héroe!
          </Typography>
          <Typography sx={{ color: "grey.400", mb: 4 }}>
            Tu crónica ha sido inscrita en los archivos. Como agradecimiento, te
            otorgamos este tesoro para tu próxima aventura.
          </Typography>

          <Box
            sx={{
              bgcolor: "rgba(0,0,0,0.3)",
              p: 3,
              borderRadius: 2,
              border: "1px dashed",
              borderColor: "grey.700",
              mb: 4,
            }}
          >
            <Typography variant="overline" color="text.secondary">
              Tu Código de Recompensa
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                mt: 1,
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: "bold",
                  color: "primary.main",
                  letterSpacing: 2,
                }}
              >
                {couponCode}
              </Typography>
              <Tooltip title={copied ? "¡Copiado!" : "Copiar"}>
                <IconButton
                  onClick={copyToClipboard}
                  sx={{ color: "common.white" }}
                >
                  <ContentCopy />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1 }}
            >
              Válido por 6 meses. Un solo uso. 15% de descuento.
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => setView(ViewState.CATALOG)}
            fullWidth
          >
            Volver a la Tienda
          </Button>
        </Paper>
      </Container>
    );
  }

  if (error || !isValidToken) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
        <Paper
          sx={{
            p: 4,
            bgcolor: "background.paper",
            border: 1,
            borderColor: "error.main",
          }}
        >
          <Lock sx={{ fontSize: 50, color: "error.main", mb: 2 }} />
          <Typography variant="h5" color="error" gutterBottom fontWeight="bold">
            Acceso Denegado
          </Typography>
          <Typography color="text.secondary" paragraph>
            {error || "El token provisto no es válido."}
          </Typography>
          <Button variant="outlined" onClick={() => setView(ViewState.HOME)}>
            Volver al Inicio
          </Button>
        </Paper>
      </Container>
    );
  }

  // If token is valid but user is not authenticated, show login/signup
  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <FancyPaper sx={{ width: "100%" }}>
          <DecorativeCorners />

          <Box sx={{ textAlign: "center", mb: 4 }}>
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
              {authMode === "login" ? (
                <Lock sx={{ fontSize: 28 }} />
              ) : (
                <PersonAdd sx={{ fontSize: 28 }} />
              )}
            </Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", color: "common.white", mb: 1 }}
            >
              {authMode === "login"
                ? "Identifícate para Continuar"
                : "Crea tu Cuenta"}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "grey.500", fontStyle: "italic" }}
            >
              Tu reseña te espera. Solo necesitamos saber quién eres.
            </Typography>
          </Box>

          <Collapse in={!!authError}>
            <Alert
              severity="error"
              sx={{
                mb: 3,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: "error.main",
                border: 1,
                borderColor: "error.main",
              }}
            >
              {authError}
            </Alert>
          </Collapse>

          <Box
            component="form"
            onSubmit={authMode === "login" ? handleLogin : handleSignup}
          >
            <Stack spacing={3}>
              {authMode === "signup" && (
                <TextField
                  fullWidth
                  label="Nombre de Usuario"
                  type="text"
                  disabled={authLoading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="HéroeEpico42"
                />
              )}
              <TextField
                fullWidth
                label={authMode === "login" ? "Email o Usuario" : "Email"}
                type={authMode === "login" ? "text" : "email"}
                required
                disabled={authLoading}
                value={email}
                onChange={(e) => setEmailAuth(e.target.value)}
                placeholder={
                  authMode === "login" ? "mago@soulforge.com" : "tu@email.com"
                }
              />
              <TextField
                fullWidth
                label="Contraseña"
                type="password"
                required
                disabled={authLoading}
                value={password}
                onChange={(e) => setPasswordAuth(e.target.value)}
                placeholder="••••••••"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={authLoading}
                size="large"
                sx={{ py: 2, fontWeight: "bold" }}
              >
                {authLoading ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={20} color="inherit" />
                    <span>Procesando...</span>
                  </Stack>
                ) : authMode === "login" ? (
                  "Entrar"
                ) : (
                  "Crear Cuenta"
                )}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="body2"
              sx={{ color: "grey.500", fontStyle: "italic", mb: 1 }}
            >
              {authMode === "login"
                ? "¿No tienes cuenta?"
                : "¿Ya tienes cuenta?"}
            </Typography>
            <Button
              onClick={() =>
                setAuthMode(authMode === "login" ? "signup" : "login")
              }
              disabled={authLoading}
              endIcon={<ArrowForward sx={{ transition: "transform 0.2s" }} />}
              sx={{
                color: "secondary.main",
                fontWeight: "bold",
                "&:hover .MuiSvgIcon-root": { transform: "translateX(4px)" },
              }}
            >
              {authMode === "login" ? "Crear una cuenta" : "Iniciar sesión"}
            </Button>
          </Box>
        </FancyPaper>
      </Container>
    );
  }

  // User is authenticated and token is valid - show review form
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper
        sx={{
          p: 4,
          bgcolor: "background.paper",
          border: 1,
          borderColor: "rgba(197, 160, 89, 0.3)",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            fontStyle: "italic",
            mb: 1,
            textAlign: "center",
            color: "common.white",
          }}
        >
          Inscribe tu Crónica
        </Typography>
        <Typography
          variant="body2"
          sx={{ textAlign: "center", color: "grey.500", mb: 4 }}
        >
          Comparte tu experiencia con los artefactos de Soulforge.
        </Typography>

        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <TextField
            label="Tu Nombre (o Alias)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            variant="outlined"
          />

          <Box sx={{ textAlign: "center" }}>
            <Typography component="legend" color="text.secondary">
              Calificación
            </Typography>
            <Rating
              name="simple-controlled"
              value={rating}
              onChange={(event, newValue) => setRating(newValue)}
              size="large"
              emptyIcon={<Star style={{ opacity: 0.55 }} fontSize="inherit" />}
            />
          </Box>

          <TextField
            label="Tu Opinión"
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            placeholder="¿Cómo fue la calidad de la impresión? ¿El empaquetado estaba seguro?"
            required
          />

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSubmit}
            disabled={isSubmitting || !name || !rating}
            sx={{ mt: 2, py: 1.5, fontSize: "1.1rem", fontWeight: "bold" }}
          >
            {isSubmitting
              ? "Inscribiendo..."
              : "Enviar Reseña y Obtener Recompensa"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Feedback;
