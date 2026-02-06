/// <reference lib="dom" />
import React from 'react';
import { ViewState } from '../types';
import {
    Box,
    Container,
    Typography,
    Button,
    Stack,
    alpha,
    useTheme,
    Grid,
    Divider,
} from '@mui/material';


import {
    PersonAdd,
    Search,
    FilterList,
    ShoppingCart,
    LocalOffer,
    LocalShipping,
    WhatsApp,
    Star,
    Category,
    HistoryEdu,
} from '@mui/icons-material';
import { ThemedLogo } from '../components/ThemedLogo';


interface HowToBuyProps {
    setView: (view: ViewState) => void;
}

interface GuideStep {
    title: string;
    description: string;
    longDescription: string;
    icon: React.ReactNode;
    tip?: string;
}

const HowToBuy: React.FC<HowToBuyProps> = ({ setView }) => {
    const theme = useTheme();

    const steps: GuideStep[] = [
        {
            title: 'Crea tu Cuenta',
            description: 'El primer paso para todo aventurero es inscribir su nombre en los registros de la Forja.',
            longDescription: 'Regístrate en la Forja para acceder a tu inventario personal. Con una cuenta podrás guardar tus artefactos favoritos en la Lista de Deseos, ver el historial de tus pedidos y recibir beneficios exclusivos del gremio. Tu nombre de aventurero aparecerá en todas las crónicas (reseñas) que dejes.',
            icon: <PersonAdd sx={{ fontSize: 32 }} />,
            tip: 'Tener una cuenta acelera el proceso de invocación (checkout) en futuras compras.'
        },
        {
            title: 'Explora el Catálogo',
            description: 'Navega por las estanterías digitales llenas de creaciones únicas.',
            longDescription: 'Navega por nuestra colección de miniaturas épicas. Cada artefacto muestra su tamaño, diseñador, y precio tanto en monedas de oro como en pesos argentinos. Haz clic en cualquier miniatura para ver más detalles, imágenes y elegir la escala perfecta. La calidad es nuestra ley.',
            icon: <Category sx={{ fontSize: 32 }} />,
            tip: 'Puedes ver las miniaturas en 360 grados en algunos de nuestros modelos destacados.'
        },
        {
            title: 'Usa el Buscador',
            description: 'Encuentra rápidamente el artefacto exacto que tu campaña necesita.',
            longDescription: 'Usa nuestro buscador mágico para encontrar miniaturas por nombre, set, o diseñador. El conocimiento es poder, y encontrar lo que buscas es el primer paso hacia la victoria. El buscador te mostrará sugerencias en tiempo real basadas en los archivos de la forja.',
            icon: <Search sx={{ fontSize: 32 }} />,
            tip: 'Búscanos por "Dragon" o "Warrior" para ver la variedad de nuestras forjas.'
        },
        {
            title: 'Filtra por Categorías',
            description: 'Refina tu búsqueda según las necesidades de tu grupo de aventureros.',
            longDescription: 'Usa los filtros del catálogo para separar el trigo de la paja. Filtra por tamaño (desde Small hasta Gargantuan), diseñadores legendarios, tipo de criatura o el arma que portan. Puedes combinar múltiples filtros para encontrar esa quimera con espada que tanto buscas.',
            icon: <FilterList sx={{ fontSize: 32 }} />,
            tip: 'Los filtros se encuentran en la parte superior del catálogo en móviles y a la izquierda en PC.'
        },
        {
            title: 'Agrega al Carrito',
            description: 'Asegura tus hallazgos antes de que otro aventurero se los lleve.',
            longDescription: 'Cuando encuentres un artefacto digno, haz clic en "Añadir al Carrito". Tus elecciones se guardarán de forma segura mientras continúas explorando las profundidades del catálogo. Si no tienes oro suficiente hoy, agrégalo a tu Wishlist para volver por él en tu próxima aventura.',
            icon: <ShoppingCart sx={{ fontSize: 32 }} />,
            tip: 'El carrito guardará tus tesoros incluso si cierras el portal por error.'
        },
        {
            title: 'Revisa tu Carrito',
            description: 'Verifica tu equipo antes de partir hacia la batalla final.',
            longDescription: 'En el carrito podrás ajustar las cantidades de cada miniatura y verificar que todo esté en orden. Si posees un pergamino de descuento (cupón), ¡ahora es el momento de usar su magia! Los cupones de descuento se aplican directamente sobre el total de oro requerido.',
            icon: <LocalOffer sx={{ fontSize: 32 }} />,
            tip: 'Recuerda que si el total supera el límite del reino, ¡podrías obtener envío gratuito!'
        },
        {
            title: 'Carga tus Datos',
            description: 'Dinos dónde debemos enviar los refuerzos para tu campaña.',
            longDescription: 'Ingresa tu información de envío con precisión: nombre completo, dirección del refugio, ciudad, código postal y tu número de contacto. La logística es clave para un buen asedio. Verifica dos veces tu dirección; no querrás que tu dragón termine en el reino equivocado.',
            icon: <LocalShipping sx={{ fontSize: 32 }} />,
            tip: 'Tus datos están protegidos por hechizos de cifrado de alto nivel.'
        },
        {
            title: 'Finaliza en WhatsApp',
            description: 'Sella el pacto con los maestros forjadores de forma directa.',
            longDescription: 'Al confirmar, invocarás un portal directo a WhatsApp con nuestro equipo. Allí coordinaremos el pago (MercadoPago, transferencia) y los detalles del envío para que las piezas lleguen seguras. Estamos en línea durante el día. Si envías tu mensaje de noche, te responderemos al amanecer.',
            icon: <WhatsApp sx={{ fontSize: 32 }} />,
            tip: 'Ten a mano tu número de pedido para una comunicación más fluida.'
        },
        {
            title: 'Review & Descuento',
            description: 'Comparte tu leyenda y recibe tesoros por tu sabiduría.',
            longDescription: 'Tras recibir tu pedido, obtendrás un enlace único para dejar tu opinión. Al escribir tu crónica, recibirás un pergamino de descuento del 15% para tu próxima adquisición en la Forja. Tus crónicas ayudan a otros aventureros a conocer la calidad de nuestro acero (resina).',
            icon: <Star sx={{ fontSize: 32 }} />,
            tip: '¡Sube una foto de tu miniatura pintada para inspirar a otros guerreros!'
        }
    ];

    return (
        <Box sx={{
            bgcolor: 'background.default',
            minHeight: '100vh',

            pb: 10,
            position: 'relative',
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
        }}>
            {/* Banner Superior Heroico */}
            <Box sx={{
                width: '100%',
                height: { xs: 350, md: 850 },
                position: 'relative',
                backgroundImage: 'url(/images/guide/dragon_banner.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '40%',
                    background: `linear-gradient(to top, ${theme.palette.background.default}, transparent)`,
                }
            }}>
                <Box sx={{
                    textAlign: 'center',
                    zIndex: 1,
                    mt: { xs: 5, md: 10 },
                    px: 2,
                }}>
                    <Typography variant="h1" sx={{
                        fontFamily: '"Cinzel", serif',
                        fontSize: { xs: '2.5rem', md: '5rem' },
                        color: 'common.white',
                        fontWeight: 700,
                        letterSpacing: 10,
                        textTransform: 'uppercase',
                        textShadow: '0 0 30px rgba(0,0,0,0.8), 0 0 10px rgba(197, 160, 89, 0.3)',
                        mb: 1,
                        paddingTop: { xs: 15, md: 65 },
                    }}>
                        Guía de Compras
                    </Typography>
                    <Typography variant="h6" sx={{
                        fontFamily: '"Cinzel", serif',
                        color: 'secondary.main',
                        letterSpacing: 4,
                        opacity: 0.9,
                        fontSize: { xs: '0.8rem', md: '1.2rem' }
                    }}>
                        Compendio Oficial del Aventurero
                    </Typography>
                </Box>
            </Box>

            <Container maxWidth="lg" sx={{ mt: 5, position: 'relative' }}>
                {/* Introducción */}
                <Box sx={{ textAlign: 'center', mb: 10, maxWidth: 800, mx: 'auto' }}>
                    <HistoryEdu sx={{ color: 'secondary.main', fontSize: 40, mb: 2 }} />
                    <Typography variant="body1" sx={{
                        fontFamily: '"Newsreader", serif',
                        fontSize: '1.4rem',
                        color: 'text.secondary',
                        lineHeight: 1.6,
                        fontStyle: 'italic'
                    }}>
                        "Desde las sombras de la forja hasta tu mesa de juego, cada miniatura sigue un camino sagrado.
                        Esta guía contiene el conocimiento necesario para completar tu misión y armar tu propio ejército de leyendas."
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 4 }}>
                        <Box sx={{ height: 1, width: 60, bgcolor: alpha(theme.palette.secondary.main, 0.4), mr: 2 }} />
                        <Box sx={{ width: 8, height: 8, bgcolor: 'secondary.main', transform: 'rotate(45deg)' }} />
                        <Box sx={{ height: 1, width: 60, bgcolor: alpha(theme.palette.secondary.main, 0.4), ml: 2 }} />
                    </Box>
                </Box>

                {/* Mapeo en dos columnas estilo Manual de D&D */}
                <Grid container spacing={8} alignItems="flex-start">
                    {/* Columna 1: Pasos 1-5 */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={8}>
                            {steps.slice(0, 5).map((step, index) => (
                                <Box key={index} id={`step-${index}`} sx={{ position: 'relative' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                        <Typography variant="h6" sx={{
                                            fontFamily: '"Cinzel", serif',
                                            color: 'secondary.main',
                                            mr: 2,
                                            opacity: 0.6,
                                            fontWeight: 700,
                                            fontSize: '0.9rem'
                                        }}>
                                            0{index + 1}
                                        </Typography>
                                        <Divider sx={{ flexGrow: 1, borderColor: alpha(theme.palette.secondary.main, 0.1) }} />
                                    </Box>

                                    <Typography variant="h4" sx={{
                                        fontFamily: '"Cinzel", serif',
                                        fontSize: '1.6rem',
                                        color: 'common.white',
                                        fontWeight: 700,
                                        mb: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2
                                    }}>
                                        {React.cloneElement(step.icon as React.ReactElement, { sx: { color: 'secondary.main', fontSize: 24 } } as any)}
                                        {step.title}
                                    </Typography>

                                    <Typography variant="body1" sx={{
                                        fontFamily: '"Newsreader", serif',
                                        fontSize: '1.1rem',
                                        color: 'text.secondary',
                                        lineHeight: 1.5,
                                        fontStyle: 'italic',
                                        mb: 2,
                                        pl: 2,
                                        borderLeft: '2px solid',
                                        borderColor: alpha(theme.palette.secondary.main, 0.2)
                                    }}>
                                        {step.description}
                                    </Typography>

                                    <Typography variant="body1" sx={{
                                        fontFamily: '"Newsreader", serif',
                                        fontSize: '1.05rem',
                                        color: 'text.primary',
                                        lineHeight: 1.6,
                                        textAlign: 'justify',
                                        mb: 2
                                    }}>
                                        {step.longDescription}
                                    </Typography>

                                    {step.tip && (
                                        <Box sx={{
                                            p: 2,
                                            bgcolor: alpha(theme.palette.secondary.main, 0.03),
                                            borderLeft: '3px solid',
                                            borderColor: 'secondary.main',
                                            borderRadius: '0 4px 4px 0'
                                        }}>
                                            <Typography variant="body2" sx={{
                                                fontFamily: '"Newsreader", serif',
                                                fontSize: '0.95rem',
                                                color: 'text.secondary',
                                            }}>
                                                <strong>Sabiduría:</strong> {step.tip}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            ))}
                        </Stack>
                    </Grid>

                    {/* Columna 2: Pasos 6-9 */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={8}>
                            {steps.slice(5).map((step, index) => (
                                <Box key={index + 5} id={`step-${index + 5}`} sx={{ position: 'relative' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                        <Typography variant="h6" sx={{
                                            fontFamily: '"Cinzel", serif',
                                            color: 'secondary.main',
                                            mr: 2,
                                            opacity: 0.6,
                                            fontWeight: 700,
                                            fontSize: '0.9rem'
                                        }}>
                                            0{index + 6}
                                        </Typography>
                                        <Divider sx={{ flexGrow: 1, borderColor: alpha(theme.palette.secondary.main, 0.1) }} />
                                    </Box>

                                    <Typography variant="h4" sx={{
                                        fontFamily: '"Cinzel", serif',
                                        fontSize: '1.6rem',
                                        color: 'common.white',
                                        fontWeight: 700,
                                        mb: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2
                                    }}>
                                        {React.cloneElement(step.icon as React.ReactElement, { sx: { color: 'secondary.main', fontSize: 24 } } as any)}
                                        {step.title}
                                    </Typography>

                                    <Typography variant="body1" sx={{
                                        fontFamily: '"Newsreader", serif',
                                        fontSize: '1.1rem',
                                        color: 'text.secondary',
                                        lineHeight: 1.5,
                                        fontStyle: 'italic',
                                        mb: 2,
                                        pl: 2,
                                        borderLeft: '2px solid',
                                        borderColor: alpha(theme.palette.secondary.main, 0.2)
                                    }}>
                                        {step.description}
                                    </Typography>

                                    <Typography variant="body1" sx={{
                                        fontFamily: '"Newsreader", serif',
                                        fontSize: '1.05rem',
                                        color: 'text.primary',
                                        lineHeight: 1.6,
                                        textAlign: 'justify',
                                        mb: 2
                                    }}>
                                        {step.longDescription}
                                    </Typography>

                                    {step.tip && (
                                        <Box sx={{
                                            p: 2,
                                            bgcolor: alpha(theme.palette.secondary.main, 0.03),
                                            borderLeft: '3px solid',
                                            borderColor: 'secondary.main',
                                            borderRadius: '0 4px 4px 0'
                                        }}>
                                            <Typography variant="body2" sx={{
                                                fontFamily: '"Newsreader", serif',
                                                fontSize: '0.95rem',
                                                color: 'text.secondary',
                                            }}>
                                                <strong>Sabiduría:</strong> {step.tip}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            ))}
                        </Stack>

                        {/* Botones de Acción (Call to Action) */}
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={2}
                            sx={{ mt: 10, mb: { xs: 8, md: 0 } }}
                        >
                            <Button
                                variant="contained"
                                onClick={() => setView(ViewState.CATALOG)}
                                sx={{
                                    bgcolor: 'secondary.main',
                                    color: 'background.default',
                                    fontFamily: '"Cinzel", serif',
                                    px: 4,
                                    py: 1.2,
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    flexGrow: 1,
                                    '&:hover': { bgcolor: 'secondary.light', transform: 'translateY(-3px)' },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Comenzar Aventura
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => setView(ViewState.HOME)}
                                sx={{
                                    color: 'secondary.main',
                                    borderColor: 'secondary.main',
                                    fontFamily: '"Cinzel", serif',
                                    px: 1,
                                    py: 1.2,
                                    fontSize: '0.9rem',
                                    flexGrow: 1,
                                    '&:hover': { borderColor: 'common.white', color: 'common.white', bgcolor: alpha('#fff', 0.05) },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Volver al Atrio
                            </Button>

                        </Stack>
                        {/* Footer Final Refinado (Sin línea divisoria) */}
                        <Box sx={{ mt: { xs: 10, md: 15 }, textAlign: 'center', position: 'relative' }}>


                            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2, mt: -4, opacity: 0.7 }}>
                                <ThemedLogo width={240} />
                            </Box>
                            <Typography sx={{
                                fontFamily: '"Newsreader", serif',
                                fontStyle: 'italic',
                                color: 'text.secondary',
                                maxWidth: 550,
                                mx: 'auto',
                                fontSize: '1.1rem',
                                lineHeight: 1.6,
                                opacity: 0.8,
                            }}>
                                Donde cada alma encuentra su forma en resina pura.<br />
                                Autenticado por el Gremio de Forjadores.
                            </Typography>
                        </Box>
                    </Grid>


                </Grid>




            </Container>
        </Box>
    );
};

export default HowToBuy;
