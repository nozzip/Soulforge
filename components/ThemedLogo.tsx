import React from 'react';
import { useTheme, Box } from '@mui/material';

interface ThemedLogoProps {
  width?: number | string;
  height?: number | string;
}

export const ThemedLogo: React.FC<ThemedLogoProps> = ({ width = 200, height }) => {
  const theme = useTheme();
  
  return (
    <Box
      component="img"
      src="/images/guide/logo.svg"
      alt="ResinForge Logo"
      sx={{
        width: width,
        height: height || 'auto',
        display: 'block',
        filter: `
          brightness(1.3)
          contrast(1.2)
          saturate(1.1)
          drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3))
          drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2))
        `,
        position: 'relative',
        transition: 'transform 0.3s ease',
        '&:hover': {
          transform: 'scale(1.02)',
        },
      }}
    />
  );
};
