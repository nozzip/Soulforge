import React from 'react';
import { Box, Typography, Stack, alpha, useTheme, Paper, PaperProps } from '@mui/material';
import { styled } from '@mui/material/styles';

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
                    {React.cloneElement(icon as React.ReactElement, { sx: { fontSize: 28 } })}
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
