import React from 'react';
import { useTheme, Box } from '@mui/material';

interface ThemedLogoProps {
  width?: number | string;
  height?: number | string;
}

export const ThemedLogo: React.FC<ThemedLogoProps> = ({
  width = 200,
  height,
}) => {
  const theme = useTheme();

  // Determine which logo to use based on theme
  const isWarhammer = theme.palette.primary.main === '#0ea5e9';
  const logoSrc = isWarhammer
    ? '/images/guide/logo-warhammer.svg'
    : '/images/guide/logo-fantasy.svg';

  // Theme-based glow color
  const glowColor = isWarhammer
    ? 'rgba(14, 165, 233, 0.35)'
    : 'rgba(197, 160, 89, 0.35)';

  return (
    <Box
      component="img"
      src={logoSrc}
      alt="ResinForge Logo"
      sx={{
        width: width,
        height: height || 'auto',
        display: 'block',
        filter: `drop-shadow(0 4px 12px ${glowColor})`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'scale(1.03)',
          filter: `drop-shadow(0 6px 16px ${glowColor})`,
        },
      }}
    />
  );
};
