import React from 'react';
import { ViewState } from '../types';
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
    useTheme
} from '@mui/material';
import { HistoryEdu, Storefront, FlightTakeoff, ReceiptLong, Description } from '@mui/icons-material';

import { SectionHeader } from '../components/StyledComponents';

interface Order {
    id: string;
    date: string;
    status: 'Delivered' | 'Processing' | 'Shipped' | 'Cancelled';
    total: number;
    tracking?: string;
    items: {
        id: number;
        name: string;
        image: string;
        quantity: number;
        price: number;
        variant?: string;
    }[];
}

const MOCK_ORDERS: Order[] = [
    {
        id: "ORD-9921-AF",
        date: "Oct 12, 2024",
        status: "Processing",
        total: 142.50,
        items: [
            { id: 1, name: "Ancient Red Dragon", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOt5aQZidteyosgKEH6adeFrjY70HvrEfGe899g00U3xAIYG56c8fgeqBKxO8l7H88pIM9fvKCjOFj31ZRGXSNJMm0amjBByouYk2tQS9cJlO5tRXVypnfYTl4GOedXMMTeHteiT4YEek0yhThUIU-I3adq46F_jGdWXWA81N4fXwHAGu-qCKql3q3IOj_6RX7xJ3VDGhUy-IG7TOmabJh_2bG_B3XyQLiG6dKr1cd6iFYDBbZoCfADZlGEJy_eQT0j1kbKsuRM9c", quantity: 1, price: 85.00, variant: "Gargantuan" },
            { id: 2, name: "Dwarven Forge Lord", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOt5aQZidteyosgKEH6adeFrjY70HvrEfGe899g00U3xAIYG56c8fgeqBKxO8l7H88pIM9fvKCjOFj31ZRGXSNJMm0amjBByouYk2tQS9cJlO5tRXVypnfYTl4GOedXMMTeHteiT4YEek0yhThUIU-I3adq46F_jGdWXWA81N4fXwHAGu-qCKql3q3IOj_6RX7xJ3VDGhUy-IG7TOmabJh_2bG_B3XyQLiG6dKr1cd6iFYDBbZoCfADZlGEJy_eQT0j1kbKsuRM9c", quantity: 2, price: 14.00, variant: "Medium" }
        ]
    },
    {
        id: "ORD-8820-XB",
        date: "Sep 28, 2024",
        status: "Delivered",
        total: 42.00,
        tracking: "GRF-882910-EX",
        items: [
            { id: 3, name: "The Eye Tyrant", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAk61FuYDjWAsNtu247-7UQnKD10MRF9FJclnImLSqjn4IV_svngmRGCH5VwHKU4F08LykO4cLSTZjd7PuG9JIqbAISQ8nYCiKO-jK3rG3FEzPVpdOES5vtmUXNCm8gvJ8Rgu_FRc_G4TCYlUMy4NcNsDAj_WUMdNcZZMwWi216xu4wMg54xqhfj3aiFvnT6MQGPfVSpQIT2qPrSJc-rcpRtaEmdk7-ZP_6pl9muFYAhogMHTm1eN1z3FgfVSDNejNMKnVe_KwTVGw", quantity: 1, price: 42.00, variant: "Large" }
        ]
    }
];

interface OrdersProps {
    setView: (view: ViewState) => void;
}

const Orders: React.FC<OrdersProps> = ({ setView }) => {
    const theme = useTheme();

    const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
        switch (status) {
            case 'Delivered': return 'success';
            case 'Processing': return 'warning';
            case 'Cancelled': return 'error';
            default: return 'default';
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <SectionHeader
                title="Ledger of Acquisitions"
                description="Your previous pacts and shipments"
                icon={<HistoryEdu />}
                rightElement={
                    <Button variant="outlined" color="secondary" onClick={() => setView(ViewState.CATALOG)} startIcon={<Storefront />} sx={{ borderColor: (t) => alpha(t.palette.secondary.main, 0.3), '&:hover': { bgcolor: (t) => alpha(t.palette.secondary.main, 0.2) } }}>
                        Continue Browsing
                    </Button>
                }
            />

            <Stack spacing={4}>
                {MOCK_ORDERS.length === 0 ? (
                    <Paper sx={{ textAlign: 'center', py: 10, bgcolor: (t) => alpha(t.palette.background.paper, 0.5), border: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.1), borderRadius: 2 }}>
                        <ReceiptLong sx={{ fontSize: 64, color: 'grey.700', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'grey.300', mb: 1 }}>The Ledger is Empty</Typography>
                        <Typography variant="body2" sx={{ color: 'grey.500', fontStyle: 'italic' }}>You have made no requisitions from the forge yet.</Typography>
                    </Paper>
                ) : (
                    MOCK_ORDERS.map(order => (
                        <Paper key={order.id} sx={{ bgcolor: 'background.paper', border: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.2), borderRadius: 2, overflow: 'hidden', boxShadow: 6 }}>
                            {/* Order Header */}
                            <Box sx={{ bgcolor: (t) => alpha(t.palette.common.black, 0.2), p: { xs: 2, md: 3 }, borderBottom: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.1) }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid size={{ xs: 12, md: 8 }}>
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 4 }}>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: 'grey.500', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 'bold', display: 'block' }}>Order ID</Typography>
                                                <Typography variant="body2" sx={{ color: 'common.white', fontFamily: 'monospace' }}>{order.id}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: 'grey.500', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 'bold', display: 'block' }}>Date Inscribed</Typography>
                                                <Typography variant="body2" sx={{ color: 'common.white' }}>{order.date}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: 'grey.500', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 'bold', display: 'block' }}>Total Tribute</Typography>
                                                <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>{order.total.toFixed(2)} GP</Typography>
                                            </Box>
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <Stack direction="row" spacing={2} alignItems="center" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                                            <Chip label={order.status} color={getStatusColor(order.status)} size="small" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }} />
                                            {order.tracking && (
                                                <Button size="small" startIcon={<FlightTakeoff />} sx={{ color: 'primary.main', fontSize: '0.7rem', '&:hover': { color: 'common.white' } }}>
                                                    Track Shipment
                                                </Button>
                                            )}
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Order Items */}
                            <Box sx={{ p: { xs: 2, md: 3 } }}>
                                <Stack spacing={3}>
                                    {order.items.map((item, idx) => (
                                        <Stack key={idx} direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                                            <Box sx={{ width: 80, height: 80, bgcolor: (t) => alpha(t.palette.common.black, 0.4), borderRadius: 1, border: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.1), overflow: 'hidden', flexShrink: 0 }}>
                                                <Box component="img" src={item.image} alt={item.name} sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'common.white' }}>{item.name}</Typography>
                                                <Typography variant="caption" sx={{ color: 'grey.500', fontStyle: 'italic' }}>{item.variant && `${item.variant} • `}Qty: {item.quantity}</Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{ color: 'grey.400', display: { xs: 'none', md: 'block' } }}>{item.price.toFixed(0)} GP each</Typography>
                                            <Button size="small" onClick={() => setView(ViewState.CATALOG)} sx={{ color: 'secondary.main', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.65rem', '&:hover': { color: 'common.white' } }}>
                                                Purchase Again
                                            </Button>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Box>

                            {/* Order Footer */}
                            <Box sx={{ bgcolor: (t) => alpha(t.palette.common.black, 0.4), px: 3, py: 1.5, borderTop: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.05), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" sx={{ color: 'grey.600', fontStyle: 'italic' }}>Merchant: ResinForge Guild</Typography>
                                <Button size="small" startIcon={<Description />} sx={{ color: 'grey.500', fontSize: '0.65rem', '&:hover': { color: 'common.white' } }}>
                                    Download Scroll
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