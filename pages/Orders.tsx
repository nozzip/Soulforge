import React, { useState, useEffect } from 'react';
import { ViewState } from '../types';
import { formatCurrency, formatCurrencyDecimal } from '../utils/currency';
import { supabase } from '../src/supabase';
import { User } from '@supabase/supabase-js';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    Stack,
    Chip,
    Grid,
    alpha,
    useTheme,
    CircularProgress,
    Stepper,
    Step,
    StepLabel,
    StepConnector,
    stepConnectorClasses,
    styled
} from '@mui/material';
import { HistoryEdu, Storefront, FlightTakeoff, ReceiptLong, Description, Handyman, HourglassEmpty, CleaningServices, LocalShipping, Cancel } from '@mui/icons-material';

import { SectionHeader } from '../components/StyledComponents';

// Custom Stepper Connector
const ForgeConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 10,
        left: 'calc(-50% + 16px)',
        right: 'calc(50% + 16px)',
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: theme.palette.secondary.main,
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: theme.palette.secondary.main,
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        borderColor: alpha(theme.palette.grey[800], 0.5),
        borderTopWidth: 2,
        borderRadius: 1,
    },
}));

const orderSteps = ['Recibido', 'En la Forja', 'Limpieza y Curado', 'Enviado'];

const getActiveStep = (status: string): number => {
    if (status === 'Cancelado') return -1;
    const index = orderSteps.indexOf(status);
    return index >= 0 ? index : 0;
};

interface Order {
    id: string;
    created_at: string;
    status: 'Recibido' | 'En la Forja' | 'Limpieza y Curado' | 'Enviado' | 'Cancelado';
    total_ars: number;
    total_gp: number;
    order_items: {
        product_id: string;
        name: string;
        image: string;
        quantity: number;
        price_gp: number;
    }[];
}

interface OrdersProps {
    setView: (view: ViewState) => void;
}

const Orders: React.FC<OrdersProps> = ({ setView }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);

            if (session?.user) {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*, order_items(*)')
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching orders:', error);
                } else {
                    setOrders(data as Order[]);
                }
            }
            setLoading(false);
        };

        fetchOrders();
    }, []);

    const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
        switch (status) {
            case 'Enviado': return 'success';
            case 'En la Forja': return 'warning';
            case 'Limpieza y Curado': return 'info';
            case 'Recibido': return 'default';
            case 'Cancelado': return 'error';
            default: return 'default';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Enviado': return <LocalShipping sx={{ fontSize: '1rem !important' }} />;
            case 'En la Forja': return <Handyman sx={{ fontSize: '1rem !important' }} />;
            case 'Limpieza y Curado': return <CleaningServices sx={{ fontSize: '1rem !important' }} />;
            case 'Recibido': return <HourglassEmpty sx={{ fontSize: '1rem !important' }} />;
            case 'Cancelado': return <Cancel sx={{ fontSize: '1rem !important' }} />;
            default: return undefined;
        }
    };

    const getStatusDescription = (status: string): string => {
        switch (status) {
            case 'Recibido': return 'Tu pedido ha sido recibido y está en cola para ser procesado.';
            case 'En la Forja': return 'Tu miniatura está siendo impresa en nuestra forja de resina.';
            case 'Limpieza y Curado': return 'La pieza está siendo curada con luz UV y limpiada de soportes.';
            case 'Enviado': return 'Tu paquete está en camino hacia tu fortaleza.';
            case 'Cancelado': return 'Este pedido ha sido cancelado.';
            default: return '';
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <SectionHeader
                title="Libro de Adquisiciones"
                description="Tus pactos y embarques previos"
                icon={<HistoryEdu />}
                rightElement={
                    <Button variant="outlined" color="secondary" onClick={() => setView(ViewState.CATALOG)} startIcon={<Storefront />} sx={{ borderColor: (t) => alpha(t.palette.secondary.main, 0.3), '&:hover': { bgcolor: (t) => alpha(t.palette.secondary.main, 0.2) } }}>
                        Continuar Navegando
                    </Button>
                }
            />

            <Stack spacing={4}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress color="secondary" />
                    </Box>
                ) : !user ? (
                    <Paper sx={{ textAlign: 'center', py: 10, bgcolor: (t) => alpha(t.palette.background.paper, 0.5), border: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.1), borderRadius: 2 }}>
                        <HistoryEdu sx={{ fontSize: 64, color: 'grey.700', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'grey.300', mb: 1 }}>Cerrado a Extraños</Typography>
                        <Typography variant="body2" sx={{ color: 'grey.500', fontStyle: 'italic', mb: 3 }}>Debes inscribir tu alma o identificarte para ver tus pergaminos de adquisición.</Typography>
                        <Button variant="contained" color="primary" onClick={() => setView(ViewState.LOGIN)}>
                            Identificarse
                        </Button>
                    </Paper>
                ) : orders.length === 0 ? (
                    <Paper sx={{ textAlign: 'center', py: 10, bgcolor: (t) => alpha(t.palette.background.paper, 0.5), border: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.1), borderRadius: 2 }}>
                        <ReceiptLong sx={{ fontSize: 64, color: 'grey.700', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'grey.300', mb: 1 }}>El Libro está Vacío</Typography>
                        <Typography variant="body2" sx={{ color: 'grey.500', fontStyle: 'italic' }}>Aún no has realizado ninguna requisición a la forja.</Typography>
                    </Paper>
                ) : (
                    orders.map(order => (
                        <Paper key={order.id} sx={{ bgcolor: 'background.paper', border: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.2), borderRadius: 2, overflow: 'hidden', boxShadow: 6 }}>
                            {/* Order Header */}
                            <Box sx={{ bgcolor: (t) => alpha(t.palette.common.black, 0.2), p: { xs: 2, md: 3 }, borderBottom: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.1) }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid size={{ xs: 12, md: 8 }}>
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 4 }}>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: 'grey.500', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 'bold', display: 'block' }}>Pacto</Typography>
                                                <Typography variant="body2" sx={{ color: 'common.white', fontFamily: 'monospace' }}>#{order.id.slice(0, 8)}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: 'grey.500', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 'bold', display: 'block' }}>Fecha</Typography>
                                                <Typography variant="body2" sx={{ color: 'common.white' }}>{new Date(order.created_at).toLocaleDateString()}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: 'grey.500', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 'bold', display: 'block' }}>Tributo</Typography>
                                                <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>{formatCurrencyDecimal(order.total_gp)}</Typography>
                                            </Box>
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
                                            <Chip
                                                icon={getStatusIcon(order.status)}
                                                label={order.status}
                                                color={getStatusColor(order.status)}
                                                size="small"
                                                sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}
                                            />
                                            <Typography variant="caption" sx={{ color: 'grey.500', fontStyle: 'italic', maxWidth: 200, textAlign: { xs: 'left', md: 'right' } }}>
                                                {getStatusDescription(order.status)}
                                            </Typography>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Order Progress */}
                            {order.status !== 'Cancelado' && (
                                <Box sx={{ px: { xs: 2, md: 4 }, py: 3, bgcolor: (t) => alpha(t.palette.common.black, 0.1) }}>
                                    <Stepper 
                                        activeStep={getActiveStep(order.status)} 
                                        alternativeLabel 
                                        connector={<ForgeConnector />}
                                    >
                                        {orderSteps.map((label, index) => (
                                            <Step key={label} completed={index <= getActiveStep(order.status)}>
                                                <StepLabel
                                                    StepIconProps={{
                                                        sx: {
                                                            color: index <= getActiveStep(order.status) ? 'secondary.main' : 'grey.700',
                                                            '&.Mui-active': { color: 'secondary.main' },
                                                            '&.Mui-completed': { color: 'secondary.main' },
                                                        }
                                                    }}
                                                >
                                                    <Typography 
                                                        variant="caption" 
                                                        sx={{ 
                                                            color: index <= getActiveStep(order.status) ? 'secondary.main' : 'grey.600',
                                                            fontWeight: index === getActiveStep(order.status) ? 'bold' : 'normal',
                                                            fontSize: '0.65rem',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: 1
                                                        }}
                                                    >
                                                        {label}
                                                    </Typography>
                                                </StepLabel>
                                            </Step>
                                        ))}
                                    </Stepper>
                                </Box>
                            )}

                            {/* Order Items */}
                            <Box sx={{ p: { xs: 2, md: 3 } }}>
                                <Stack spacing={3}>
                                    {order.order_items.map((item, idx) => (
                                        <Stack key={idx} direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                                            <Box sx={{ width: 80, height: 80, bgcolor: (t) => alpha(t.palette.common.black, 0.4), borderRadius: 1, border: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.1), overflow: 'hidden', flexShrink: 0 }}>
                                                <Box component="img" src={item.image} alt={item.name} sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'common.white' }}>{item.name}</Typography>
                                                <Typography variant="caption" sx={{ color: 'grey.500', fontStyle: 'italic' }}>Cant: {item.quantity}</Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{ color: 'grey.400', display: { xs: 'none', md: 'block' } }}>{formatCurrency(item.price_gp)} c/u</Typography>
                                            <Button size="small" onClick={() => setView(ViewState.CATALOG)} sx={{ color: 'secondary.main', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.65rem', '&:hover': { color: 'common.white' } }}>
                                                Navegar Forja
                                            </Button>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Box>

                            {/* Order Footer */}
                            <Box sx={{ bgcolor: (t) => alpha(t.palette.common.black, 0.4), px: 3, py: 1.5, borderTop: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.05), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" sx={{ color: 'grey.600', fontStyle: 'italic' }}>Mercader: Gremio ResinForge</Typography>
                                <Button size="small" startIcon={<Description />} sx={{ color: 'grey.500', fontSize: '0.65rem', '&:hover': { color: 'common.white' } }}>
                                    Descargar Pergamino
                                </Button>
                            </Box>
                        </Paper>
                    ))
                )}
            </Stack>
        </Container>
    );
};

export default Orders;