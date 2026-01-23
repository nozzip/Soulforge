import React from 'react';
import { Box, Typography, Stack, alpha, useTheme, Paper, PaperProps } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// Keyframe animations for decorative elements
const pulseGlow = keyframes`
  0%, 100% { opacity: 0.6; filter: brightness(1); }
  50% { opacity: 1; filter: brightness(1.2); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
`;

/**
 * Decorative corners for Paper or Card components
 */
export const DecorativeCorners: React.FC<{ size?: number; thickness?: number; color?: string; offset?: number }> = ({
    size = 16,
    thickness = 2,
    color,
    offset = -8
}) => {
    const theme = useTheme();
    const cornerColor = color || theme.palette.secondary.main;

    const style = {
        position: 'absolute',
        width: size,
        height: size,
        borderColor: cornerColor,
        pointerEvents: 'none',
    };

    return (
        <>
            <Box sx={{ ...style, top: offset, left: offset, borderTop: thickness, borderLeft: thickness }} />
            <Box sx={{ ...style, top: offset, right: offset, borderTop: thickness, borderRight: thickness }} />
            <Box sx={{ ...style, bottom: offset, left: offset, borderBottom: thickness, borderLeft: thickness }} />
            <Box sx={{ ...style, bottom: offset, right: offset, borderBottom: thickness, borderRight: thickness }} />
        </>
    );
};

/**
 * Consistent page/section header with icon and description
 */
interface SectionHeaderProps {
    title: string;
    description?: string;
    icon: React.ReactNode;
    rightElement?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description, icon, rightElement }) => {
    return (
        <Box sx={{
            mb: 6,
            pb: 4,
            borderBottom: 1,
            borderColor: (t) => alpha(t.palette.secondary.main, 0.2),
            display: 'flex',
            alignItems: { md: 'flex-end' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2
        }}>
            <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: (t) => alpha(t.palette.secondary.main, 0.1),
                    border: 1,
                    borderColor: (t) => alpha(t.palette.secondary.main, 0.3),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'secondary.main'
                }}>
                    {React.cloneElement(icon as React.ReactElement<{ sx?: object }>, { sx: { fontSize: 28 } })}
                </Box>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', fontStyle: 'italic', color: 'common.white', mb: 0.5 }}>
                        {title}
                    </Typography>
                    {description && (
                        <Typography variant="caption" sx={{
                            color: (t) => alpha(t.palette.secondary.main, 0.6),
                            textTransform: 'uppercase',
                            letterSpacing: 2,
                            fontWeight: 'bold',
                            display: 'block'
                        }}>
                            {description}
                        </Typography>
                    )}
                </Box>
            </Stack>
            {rightElement && (
                <Box sx={{ mt: { xs: 2, md: 0 } }}>
                    {rightElement}
                </Box>
            )}
        </Box>
    );
};

/**
 * Fancy themed Paper component with custom borders
 */
export const FancyPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    border: `2px solid ${theme.palette.secondary.main}`,
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    boxShadow: `0 0 50px ${alpha(theme.palette.common.black, 0.5)}, 
              inset 0 0 30px ${alpha(theme.palette.common.black, 0.2)}`,
    '&::before': {
        content: '""',
        position: 'absolute',
        inset: -6,
        border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
        borderRadius: theme.shape.borderRadius,
        pointerEvents: 'none',
    }
}));

/**
 * Decorative divider with rune-like flourishes
 */
export const RuneDivider: React.FC<{ variant?: 'horizontal' | 'section'; glowing?: boolean }> = ({
    variant = 'horizontal',
    glowing = false
}) => {
    const theme = useTheme();

    if (variant === 'section') {
        return (
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                py: 4,
                position: 'relative',
            }}>
                <Box sx={{
                    height: 1,
                    width: 100,
                    background: `linear-gradient(to right, transparent, ${theme.palette.secondary.main})`,
                }} />
                <Box sx={{
                    position: 'relative',
                    color: theme.palette.secondary.main,
                    animation: glowing ? `${pulseGlow} 3s ease-in-out infinite` : 'none',
                    '&::before, &::after': {
                        content: '"\\2726"', // Diamond symbol
                        position: 'absolute',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: 8,
                        opacity: 0.5,
                    },
                    '&::before': { left: -16 },
                    '&::after': { right: -16 },
                }}>
                    <Typography sx={{ fontSize: 20, lineHeight: 1 }}>&#9670;</Typography>
                </Box>
                <Box sx={{
                    height: 1,
                    width: 100,
                    background: `linear-gradient(to left, transparent, ${theme.palette.secondary.main})`,
                }} />
            </Box>
        );
    }

    return (
        <Box sx={{
            height: 1,
            width: '100%',
            background: `linear-gradient(to right, transparent, ${alpha(theme.palette.secondary.main, 0.4)} 20%, ${alpha(theme.palette.secondary.main, 0.4)} 80%, transparent)`,
            position: 'relative',
            my: 2,
            '&::before': {
                content: '""',
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 8,
                height: 8,
                bgcolor: theme.palette.secondary.main,
                borderRadius: '50%',
                boxShadow: glowing ? `0 0 10px ${theme.palette.secondary.main}` : 'none',
            },
        }} />
    );
};

/**
 * Glowing accent border for containers
 */
export const GlowBorder: React.FC<{ children: React.ReactNode; intensity?: 'low' | 'medium' | 'high'; color?: 'primary' | 'secondary' }> = ({
    children,
    intensity = 'medium',
    color = 'secondary'
}) => {
    const theme = useTheme();
    const glowColor = color === 'primary' ? theme.palette.primary.main : theme.palette.secondary.main;
    const glowIntensity = { low: 0.1, medium: 0.2, high: 0.35 }[intensity];

    return (
        <Box sx={{
            position: 'relative',
            '&::before': {
                content: '""',
                position: 'absolute',
                inset: -2,
                borderRadius: 'inherit',
                background: `linear-gradient(135deg, ${alpha(glowColor, glowIntensity)}, transparent, ${alpha(glowColor, glowIntensity * 0.5)})`,
                zIndex: -1,
                filter: `blur(${intensity === 'high' ? 8 : 4}px)`,
            },
            '&::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                borderRadius: 'inherit',
                border: `1px solid ${alpha(glowColor, 0.3)}`,
                pointerEvents: 'none',
            },
        }}>
            {children}
        </Box>
    );
};

/**
 * Animated corner flourishes for fantasy theme
 */
export const CornerFlourish: React.FC<{ position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'; animated?: boolean }> = ({
    position,
    animated = false
}) => {
    const theme = useTheme();
    const isTop = position.includes('top');
    const isLeft = position.includes('left');

    return (
        <Box sx={{
            position: 'absolute',
            [isTop ? 'top' : 'bottom']: -4,
            [isLeft ? 'left' : 'right']: -4,
            width: 24,
            height: 24,
            color: theme.palette.secondary.main,
            transform: `rotate(${isTop && isLeft ? 0 : isTop && !isLeft ? 90 : !isTop && isLeft ? -90 : 180}deg)`,
            animation: animated ? `${pulseGlow} 4s ease-in-out infinite` : 'none',
            pointerEvents: 'none',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 4,
                left: 4,
                width: 16,
                height: 2,
                bgcolor: 'currentColor',
            },
            '&::after': {
                content: '""',
                position: 'absolute',
                top: 4,
                left: 4,
                width: 2,
                height: 16,
                bgcolor: 'currentColor',
            },
        }}>
            <Box sx={{
                position: 'absolute',
                top: 2,
                left: 2,
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: 'currentColor',
            }} />
        </Box>
    );
};

/**
 * Themed card wrapper with all decorative elements
 */
export const ThemedCard: React.FC<{
    children: React.ReactNode;
    variant?: 'default' | 'featured' | 'subtle';
    glowing?: boolean;
}> = ({ children, variant = 'default', glowing = false }) => {
    const theme = useTheme();

    return (
        <Box sx={{
            position: 'relative',
            bgcolor: theme.palette.background.paper,
            border: variant === 'featured' ? 2 : 1,
            borderColor: variant === 'featured' ? theme.palette.secondary.main : alpha(theme.palette.secondary.main, 0.3),
            borderRadius: 1,
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: glowing
                ? `0 8px 32px ${alpha(theme.palette.common.black, 0.4)}, 0 0 20px ${alpha(theme.palette.secondary.main, 0.15)}`
                : `0 4px 20px ${alpha(theme.palette.common.black, 0.3)}`,
            '&:hover': {
                transform: 'translateY(-4px)',
                borderColor: theme.palette.secondary.main,
                boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.5)}, 0 0 30px ${alpha(theme.palette.secondary.main, 0.2)}`,
            },
            '&::before': variant === 'featured' ? {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)}, transparent 50%)`,
                pointerEvents: 'none',
            } : {},
        }}>
            {variant === 'featured' && (
                <>
                    <CornerFlourish position="top-left" animated={glowing} />
                    <CornerFlourish position="top-right" animated={glowing} />
                    <CornerFlourish position="bottom-left" animated={glowing} />
                    <CornerFlourish position="bottom-right" animated={glowing} />
                </>
            )}
            {children}
        </Box>
    );
};

/**
 * Shimmer text effect for headings
 */
export const ShimmerText = styled(Typography)(({ theme }) => ({
    background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.common.white}, ${theme.palette.secondary.main})`,
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: `${shimmer} 3s linear infinite`,
}));
