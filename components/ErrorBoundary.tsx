import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { BugReport as BugIcon, Refresh as RefreshIcon } from '@mui/icons-material';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <Container maxWidth="md">
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '60vh',
                            textAlign: 'center',
                            gap: 3,
                        }}
                    >
                        <BugIcon sx={{ fontSize: 80, color: 'error.main', opacity: 0.5 }} />
                        <Typography variant="h4" sx={{ fontFamily: 'Cinzel, serif', color: 'secondary.main' }}>
                            Falla en el Sistema de Adivinación
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Parece que un gremlin ha interferido con el pergamino. Los bibliotecarios ya han sido notificados.
                        </Typography>
                        {this.state.error && (
                            <Box
                                sx={{
                                    p: 2,
                                    bgcolor: 'rgba(255,0,0,0.05)',
                                    border: '1px solid rgba(255,0,0,0.1)',
                                    borderRadius: 1,
                                    maxWidth: '100%',
                                    overflow: 'auto'
                                }}
                            >
                                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'error.main' }}>
                                    {this.state.error.toString()}
                                </Typography>
                            </Box>
                        )}
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<RefreshIcon />}
                            onClick={() => window.location.reload()}
                            sx={{ mt: 2 }}
                        >
                            Reiniciar el Portal
                        </Button>
                    </Box>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
