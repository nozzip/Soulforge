/// <reference lib="dom" />
import React, { useEffect, useRef, useState } from 'react';
import { ViewState } from '../types';
import { Box, Typography, Button, Container, Grid, Paper, IconButton } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { ChevronLeft, ChevronRight, MenuBook, AutoAwesome, Straighten, Science, Hub } from '@mui/icons-material';

interface HomeProps {
  setView: (view: ViewState) => void;
}

const HERO_SLIDES = [
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOt5aQZidteyosgKEH6adeFrjY70HvrEfGe899g00U3xAIYG56c8fgeqBKxO8l7H88pIM9fvKCjOFj31ZRGXSNJMm0amjBByouYk2tQS9cJlO5tRXVypnfYTl4GOedXMMTeHteiT4YEek0yhThUIU-I3adq46F_jGdWXWA81N4fXwHAGu-qCKql3q3IOj_6RX7xJ3VDGhUy-IG7TOmabJh_2bG_B3XyQLiG6dKr1cd6iFYDBbZoCfADZlGEJy_eQT0j1kbKsuRM9c",
    subtitle: "2024 Legacy Series",
    title: "Bring Your ",
    titleHighlight: "Legend",
    titleSuffix: " to Life",
    description: "High-quality resin prints inspired by the latest sourcebooks. Precision engineering meets mythical artistry.",
    cta: "Enter the Forge"
  },
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAk61FuYDjWAsNtu247-7UQnKD10MRF9FJclnImLSqjn4IV_svngmRGCH5VwHKU4F08LykO4cLSTZjd7PuG9JIqbAISQ8nYCiKO-jK3rG3FEzPVpdOES5vtmUXNCm8gvJ8Rgu_FRc_G4TCYlUMy4NcNsDAj_WUMdNcZZMwWi216xu4wMg54xqhfj3aiFvnT6MQGPfVSpQIT2qPrSJc-rcpRtaEmdk7-ZP_6pl9muFYAhogMHTm1eN1z3FgfVSDNejNMKnVe_KwTVGw",
    subtitle: "From the Deep Void",
    title: "Unleash the ",
    titleHighlight: "Horror",
    titleSuffix: " Within",
    description: "Gargantuan aberrations sculpted with maddening detail. Perfect for your next TPK.",
    cta: "View Monsters"
  },
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOoJ1jIOn4jPLgzNAvKwwkCQE2_iPHMNTRmJnKwTVe1s16Y3IsWqDCLNtw58ig-nCjvDy9n0viSYpTjKSLiE0rVLs2R08qTyRGA9JmI5Jnt1qJYFJFLndBNbemc8FMbL7eNtue4wI5brNfS4WCKcSI55sF40XAguH8xExwk6LL0xnzivEaNUiUCKQgnyl5zuT-bylNbyOoz--wt1re7DbF7JMqODxHf2_ymsFXG8tWfQW1mFrD7L17j3w_G4V3nuEinQqugO-5iSo",
    subtitle: "Grimdark Future",
    title: "Deploy the ",
    titleHighlight: "Iron Legions",
    titleSuffix: "",
    description: "Squad-based bundles and heavy support units ready for the eternal war.",
    cta: "Equip Your Army"
  }
];

// Helper styles
const HeroGradient = 'linear-gradient(to top, rgba(34, 16, 16, 0.9) 0%, rgba(34, 16, 16, 0.2) 60%, rgba(34, 16, 16, 0.1) 100%)';
const CollectionGradient = 'linear-gradient(0deg, rgba(34, 16, 16, 0.95) 0%, rgba(34, 16, 16, 0.1) 50%)';

// Keyframes
const sparkleAnim = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
`;

const logoFade = keyframes`
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.3; }
`;

// Helper component for scroll animations
const ScrollReveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number; // Delay in ms
  direction?: 'up' | 'left' | 'right';
}> = ({ children, delay = 0, direction = 'up' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect(); // Animate once
      }
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const getTransform = () => {
    if (isVisible) return 'none';
    switch (direction) {
      case 'left': return 'translateX(-48px)';
      case 'right': return 'translateX(48px)';
      case 'up':
      default: return 'translateY(48px)';
    }
  };

  return (
    <Box
      ref={ref}
      sx={{
        transition: 'all 1s ease-out',
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </Box>
  );
};

const Home: React.FC<HomeProps> = ({ setView }) => {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    setHeroLoaded(true);
  }, []);

  // Auto-rotate slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  return (
    <Box sx={{ pb: 8 }}>
      {/* Hero Section */}
      <Box sx={{ px: { xs: 2, lg: 10 }, py: 6 }}>
        <Container maxWidth="xl" disableGutters>
          <Box sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3,
            border: '4px solid', // Strengthened border
            borderColor: 'secondary.main', // Gold border
            minHeight: '560px',
            bgcolor: 'common.black',
            boxShadow: '0 0 20px rgba(197, 160, 89, 0.3)'
          }}>

            {/* Slides Carousel */}
            {HERO_SLIDES.map((slide, idx) => (
              <Box
                key={idx}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transition: 'opacity 1s ease-in-out',
                  opacity: idx === currentSlide ? 1 : 0,
                  zIndex: idx === currentSlide ? 1 : 0,
                  backgroundImage: `${HeroGradient}, url("${slide.image}")`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  p: { xs: 4, lg: 8 }
                }}
              >
                {/* Animated Logo Overlay */}
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 0,
                  pointerEvents: 'none',
                  opacity: 0.2,
                  animation: `${logoFade} 4s ease-in-out infinite`
                }}>
                  {/* Logo Placeholder - simplified as a large icon or text */}
                  <Hub sx={{ fontSize: 400, color: 'secondary.main', opacity: 0.2 }} />
                </Box>

                <Box sx={{
                  maxWidth: 'md',
                  position: 'relative',
                  zIndex: 10,
                  transition: 'all 1s ease-out',
                  transitionDelay: '300ms',
                  opacity: heroLoaded && idx === currentSlide ? 1 : 0,
                  transform: heroLoaded && idx === currentSlide ? 'translateY(0)' : 'translateY(48px)'
                }}>
                  <Typography variant="h6" sx={{ fontStyle: 'italic', color: 'secondary.main', mb: 1 }}>
                    {slide.subtitle}
                  </Typography>
                  <Typography variant="h2" sx={{ fontWeight: 900, color: 'common.white', mb: 3, textShadow: '0 4px 6px rgba(0,0,0,0.5)' }}>
                    {slide.title}<Typography component="span" variant="inherit" color="primary" sx={{ fontStyle: 'italic' }}>{slide.titleHighlight}</Typography>{slide.titleSuffix}
                  </Typography>
                  <Typography variant="h5" sx={{ color: 'grey.300', mb: 5, maxWidth: 600 }}>
                    {slide.description}
                  </Typography>
                  <Button
                    onClick={() => setView(ViewState.CATALOG)}
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{
                      px: 4, py: 2,
                      fontWeight: 'bold',
                      letterSpacing: 2,
                      position: 'relative',
                      border: '1px solid',
                      borderColor: 'primary.light'
                    }}
                  >
                    {slide.cta}
                  </Button>
                </Box>
              </Box>
            ))}

            {/* Navigation Controls */}
            <Box sx={{ position: 'absolute', bottom: 32, right: 32, zIndex: 30, display: 'flex', gap: 2 }}>
              <IconButton onClick={prevSlide} sx={{ border: 1, borderColor: 'rgba(197, 160, 89, 0.3)', bgcolor: 'rgba(0,0,0,0.4)', color: 'secondary.main', '&:hover': { bgcolor: 'secondary.main', color: 'common.black' } }}>
                <ChevronLeft />
              </IconButton>
              <IconButton onClick={nextSlide} sx={{ border: 1, borderColor: 'rgba(197, 160, 89, 0.3)', bgcolor: 'rgba(0,0,0,0.4)', color: 'secondary.main', '&:hover': { bgcolor: 'secondary.main', color: 'common.black' } }}>
                <ChevronRight />
              </IconButton>
            </Box>

            {/* Pagination Indicators */}
            <Box sx={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 30, display: 'flex', gap: 1 }}>
              {HERO_SLIDES.map((_, idx) => (
                <Box
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  sx={{
                    height: 6,
                    borderRadius: 4,
                    cursor: 'pointer',
                    transition: 'all 0.5s',
                    width: idx === currentSlide ? 32 : 8,
                    bgcolor: idx === currentSlide ? 'secondary.main' : 'rgba(255,255,255,0.3)',
                    boxShadow: idx === currentSlide ? '0 0 10px #c5a059' : 'none',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.6)' }
                  }}
                />
              ))}
            </Box>

          </Box>
        </Container>
      </Box>

      {/* Decorative Divider */}
      <ScrollReveal className="flex items-center justify-center gap-4 py-8 opacity-40">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, py: 4, opacity: 0.6 }}>
          <Box sx={{ height: 1, width: 96, background: 'linear-gradient(to right, transparent, #c5a059)' }} />
          <MenuBook sx={{ color: 'secondary.main' }} />
          <Box sx={{ height: 1, width: 96, background: 'linear-gradient(to left, transparent, #c5a059)' }} />
        </Box>
      </ScrollReveal>

      {/* Featured Collections */}
      <Box sx={{ px: { xs: 2, lg: 10 }, py: 6 }}>
        <Container maxWidth="xl">
          <ScrollReveal>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 5, pb: 2, borderBottom: 1, borderColor: 'rgba(197, 160, 89, 0.1)' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'secondary.main', letterSpacing: '0.2em', fontWeight: 'bold', mb: 1 }}>CURATED VAULTS</Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'common.white' }}>Featured Collections</Typography>
              </Box>
              <Button onClick={() => setView(ViewState.CATALOG)} sx={{ color: 'secondary.main', letterSpacing: 2, fontWeight: 'bold' }}>
                View Catalog
              </Button>
            </Box>
          </ScrollReveal>

          <Grid container spacing={4}>
            {[
              { title: "Fantasy Heroes", sub: "Dwarves, Elves, and the Defenders of Light.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3o4U20eQujlqlLivp6dfCAP5GGzSX_QIVGCsZjAW44J4Cn5dH3fh--dQTkyhXBkrF8FhFqEkEYr9RQT-DUD067sGwueG54R6I2D9AWpl0SZeHcNNNBlpw-hJcGf44E_evb6KJAvH1iUIbN3XlyqFqu1eAkxpckNTqSho97MfodGIWlijVtftnohk4UDHDDFQLMabvPPyGlPuNecTztgQfAeFoes10LMhaiBmRzvnS1bSmrAv4HZDh04MXIr9oLJX0zf3HFw_Us5E" },
              { title: "Sci-Fi Warriors", sub: "Mechanical terrors and stellar voyagers.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOoJ1jIOn4jPLgzNAvKwwkCQE2_iPHMNTRmJnKwTVe1s16Y3IsWqDCLNtw58ig-nCjvDy9n0viSYpTjKSLiE0rVLs2R08qTyRGA9JmI5Jnt1qJYFJFLndBNbemc8FMbL7eNtue4wI5brNfS4WCKcSI55sF40XAguH8xExwk6LL0xnzivEaNUiUCKQgnyl5zuT-bylNbyOoz--wt1re7DbF7JMqODxHf2_ymsFXG8tWfQW1mFrD7L17j3w_G4V3nuEinQqugO-5iSo" },
              { title: "Monster Manual", sub: "Abominations, Beasts, and the Great Dragons.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAk61FuYDjWAsNtu247-7UQnKD10MRF9FJclnImLSqjn4IV_svngmRGCH5VwHKU4F08LykO4cLSTZjd7PuG9JIqbAISQ8nYCiKO-jK3rG3FEzPVpdOES5vtmUXNCm8gvJ8Rgu_FRc_G4TCYlUMy4NcNsDAj_WUMdNcZZMwWi216xu4wMg54xqhfj3aiFvnT6MQGPfVSpQIT2qPrSJc-rcpRtaEmdk7-ZP_6pl9muFYAhogMHTm1eN1z3FgfVSDNejNMKnVe_KwTVGw" }
            ].map((col, idx) => (
              <Grid key={idx} size={{ xs: 12, md: 4 }}>
                <ScrollReveal delay={idx * 200}>
                  <Box
                    onClick={() => setView(ViewState.CATALOG)}
                    sx={{
                      position: 'relative',
                      aspectRatio: '4/5',
                      borderRadius: 2,
                      border: 2,
                      borderColor: 'secondary.main',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      '&:hover .bg-image': { transform: 'scale(1.1)' },
                      '&:hover .col-sub': { opacity: 1, transform: 'translateY(0)' }
                    }}
                  >
                    <Box
                      className="bg-image"
                      sx={{
                        position: 'absolute', inset: 0,
                        backgroundImage: `${CollectionGradient}, url("${col.img}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transition: 'transform 0.7s',
                      }}
                    />
                    <Box sx={{ position: 'absolute', inset: 0, p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'common.white', fontStyle: 'italic', mb: 1 }}>{col.title}</Typography>
                      <Typography className="col-sub" variant="body2" sx={{ color: 'grey.400', transition: 'all 0.3s', opacity: 0, transform: 'translateY(16px)' }}>
                        {col.sub}
                      </Typography>
                    </Box>
                    {/* Corner Accents */}
                    <Box sx={{ position: 'absolute', top: -10, left: -10, color: 'secondary.main', bgcolor: 'background.default', p: 1, borderRadius: 1 }}>✦</Box>
                    <Box sx={{ position: 'absolute', bottom: -10, right: -10, color: 'secondary.main', bgcolor: 'background.default', p: 1, borderRadius: 1 }}>✦</Box>
                  </Box>
                </ScrollReveal>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Rift Chronicles Section */}
      <Box sx={{ position: 'relative', py: 12, px: { xs: 2, lg: 10 }, overflow: 'hidden', bgcolor: 'background.default', borderTop: 1, borderColor: 'rgba(197, 160, 89, 0.2)' }}>
        {/* Background Effects */}
        <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, #2e1065, #1a0b2e, #000000)', opacity: 0.6, zIndex: 0 }} />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <ScrollReveal>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, color: 'secondary.main', opacity: 0.6, mb: 2 }}>
                <Box sx={{ width: 48, height: 1, bgcolor: 'secondary.main' }} />
                <AutoAwesome fontSize="small" sx={{ animation: `${sparkleAnim} 2s infinite ease-in-out` }} />
                <Box sx={{ width: 48, height: 1, bgcolor: 'secondary.main' }} />
              </Box>
              <Typography variant="h2" sx={{
                fontWeight: 'bold', mb: 2,
                background: 'linear-gradient(to right, #c5a059, #ffffff, #c5a059)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                The Rift Chronicles
              </Typography>
              <Typography variant="h6" sx={{ fontStyle: 'italic', color: 'grey.300', maxWidth: 'md', mx: 'auto' }}>
                "The forges have opened a gateway to strange, distant realities. Behold heroes of graphite and ink, spirits of animation, and titans of the silver screen."
              </Typography>
            </Box>
          </ScrollReveal>

          <Grid container spacing={4}>
            {[
              { title: "Spirit & Steel", sub: "From magical girls to shonen warriors.", tag: "Eastern Realms", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAk61FuYDjWAsNtu247-7UQnKD10MRF9FJclnImLSqjn4IV_svngmRGCH5VwHKU4F08LykO4cLSTZjd7PuG9JIqbAISQ8nYCiKO-jK3rG3FEzPVpdOES5vtmUXNCm8gvJ8Rgu_FRc_G4TCYlUMy4NcNsDAj_WUMdNcZZMwWi216xu4wMg54xqhfj3aiFvnT6MQGPfVSpQIT2qPrSJc-rcpRtaEmdk7-ZP_6pl9muFYAhogMHTm1eN1z3FgfVSDNejNMKnVe_KwTVGw" },
              { title: "Capes & Cowls", sub: "The gods of ink and paper.", tag: "Modern Myths", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOoJ1jIOn4jPLgzNAvKwwkCQE2_iPHMNTRmJnKwTVe1s16Y3IsWqDCLNtw58ig-nCjvDy9n0viSYpTjKSLiE0rVLs2R08qTyRGA9JmI5Jnt1qJYFJFLndBNbemc8FMbL7eNtue4wI5brNfS4WCKcSI55sF40XAguH8xExwk6LL0xnzivEaNUiUCKQgnyl5zuT-bylNbyOoz--wt1re7DbF7JMqODxHf2_ymsFXG8tWfQW1mFrD7L17j3w_G4V3nuEinQqugO-5iSo" },
              { title: "Cinema Titans", sub: "Kaiju, Aliens, and legends.", tag: "Silver Screen", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAk61FuYDjWAsNtu247-7UQnKD10MRF9FJclnImLSqjn4IV_svngmRGCH5VwHKU4F08LykO4cLSTZjd7PuG9JIqbAISQ8nYCiKO-jK3rG3FEzPVpdOES5vtmUXNCm8gvJ8Rgu_FRc_G4TCYlUMy4NcNsDAj_WUMdNcZZMwWi216xu4wMg54xqhfj3aiFvnT6MQGPfVSpQIT2qPrSJc-rcpRtaEmdk7-ZP_6pl9muFYAhogMHTm1eN1z3FgfVSDNejNMKnVe_KwTVGw" }
            ].map((item, idx) => (
              <Grid key={idx} size={{ xs: 12, md: 4 }}>
                <ScrollReveal delay={idx * 150}>
                  <Box
                    onClick={() => setView(ViewState.CATALOG)}
                    sx={{
                      position: 'relative',
                      height: 500,
                      borderRadius: '200px 200px 0 0', // Archway shape
                      overflow: 'hidden',
                      border: 2,
                      borderColor: 'rgba(197, 160, 89, 0.3)',
                      bgcolor: 'common.black',
                      cursor: 'pointer',
                      '&:hover': { borderColor: 'secondary.main', boxShadow: '0 0 30px rgba(197,160,89,0.2)' },
                      '&:hover .bg-img': { transform: 'scale(1.1)', opacity: 1 },
                      '&:hover .content-sub': { opacity: 1, transform: 'translateY(0)' }
                    }}
                  >
                    <Box className="bg-img" sx={{ position: 'absolute', inset: 0, backgroundImage: `url("${item.img}")`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.6, transition: 'all 0.7s' }} />
                    <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #000 0%, transparent 60%)' }} />

                    <Box sx={{ position: 'absolute', inset: 0, p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', textAlign: 'center' }}>
                      <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 'bold', letterSpacing: 3, mb: 1 }}>{item.tag}</Typography>
                      <Typography variant="h4" sx={{ color: 'common.white', fontStyle: 'italic', fontWeight: 'bold', mb: 2 }}>{item.title}</Typography>
                      <Typography className="content-sub" variant="body2" sx={{ color: 'grey.400', opacity: 0, transform: 'translateY(10px)', transition: 'all 0.5s' }}>{item.sub}</Typography>
                    </Box>
                  </Box>
                </ScrollReveal>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Promotions Section */}
      <Box sx={{ py: 12, px: { xs: 2, lg: 10 }, bgcolor: 'background.paper', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: 400, height: 400, bgcolor: 'primary.dark', filter: 'blur(100px)', borderRadius: '50%', opacity: 0.2 }} />
        <Box sx={{ position: 'absolute', top: 0, right: 0, width: 400, height: 400, bgcolor: 'secondary.dark', filter: 'blur(100px)', borderRadius: '50%', opacity: 0.2 }} />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={8} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <ScrollReveal direction="left">
                <Paper sx={{ p: 6, bgcolor: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)', border: 1, borderColor: 'primary.main' }}>
                  <Hub sx={{ fontSize: 60, color: 'primary.main', opacity: 0.5, mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'common.white', fontStyle: 'italic', mb: 2 }}>Multiverse Scale</Typography>
                  <Typography sx={{ color: 'grey.400', mb: 4 }}>
                    Whether it's 28mm heroic fantasy or 1/6 scale busts, our resin adapts to every reality. Pre-supported for the laws of physics in any dimension.
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'rgba(197, 160, 89, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 1, borderColor: 'secondary.main' }}>
                      <Straighten sx={{ color: 'secondary.main', fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: 'common.white', fontWeight: 'bold' }}>TRUE-SCALE ACCURACY</Typography>
                      <Typography variant="caption" sx={{ color: 'grey.500' }}>Consistent proportions across all lines.</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 1, borderColor: 'primary.main' }}>
                      <Science sx={{ color: 'primary.main', fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: 'common.white', fontWeight: 'bold' }}>VOID-CURED RESIN</Typography>
                      <Typography variant="caption" sx={{ color: 'grey.500' }}>Impact resistant and ready for paint.</Typography>
                    </Box>
                  </Box>
                </Paper>
              </ScrollReveal>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ScrollReveal direction="right">
                <Box sx={{ textAlign: 'center', pl: { md: 8 } }}>
                  <Typography variant="h2" sx={{ fontWeight: 900, mb: 3, textShadow: '0 0 20px rgba(197,160,89,0.5)' }}>
                    <Typography component="span" variant="inherit" sx={{ background: 'linear-gradient(to right, #c084fc, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Limited</Typography> Edition Drops
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'grey.400', mb: 6, fontStyle: 'italic' }}>
                    "We pull artifacts from the ether before the portal closes. Once a mold breaks, the connection is severed forever."
                  </Typography>
                  <Button onClick={() => setView(ViewState.CATALOG)} variant="outlined" color="secondary" size="large" sx={{ px: 5, py: 1.5, letterSpacing: 3, fontWeight: 'bold' }}>
                    ACCESS THE VAULT
                  </Button>
                </Box>
              </ScrollReveal>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;