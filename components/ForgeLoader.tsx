import React from 'react';
import { Box, Typography, keyframes, alpha } from '@mui/material';

// Keyframes for hammer animation
const hammerSwing = keyframes`
  0%, 100% {
    transform: rotate(-30deg);
  }
  50% {
    transform: rotate(30deg);
  }
`;

const sparkle = keyframes`
  0%, 100% {
    opacity: 0;
    transform: scale(0) translateY(0);
  }
  50% {
    opacity: 1;
    transform: scale(1) translateY(-20px);
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 10px rgba(197, 160, 89, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(197, 160, 89, 0.8), 0 0 60px rgba(197, 160, 89, 0.4);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
`;

interface ForgeLoaderProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const ForgeLoader: React.FC<ForgeLoaderProps> = ({ 
  message = 'Forjando artefactos...', 
  size = 'medium' 
}) => {
  const sizeConfig = {
    small: { anvil: 40, hammer: 30, container: 80 },
    medium: { anvil: 60, hammer: 45, container: 120 },
    large: { anvil: 80, hammer: 60, container: 160 }
  };

  const config = sizeConfig[size];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
      }}
    >
      {/* Forge Animation Container */}
      <Box
        sx={{
          position: 'relative',
          width: config.container,
          height: config.container,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
        {/* Hammer */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transformOrigin: 'bottom center',
            animation: `${hammerSwing} 0.6s ease-in-out infinite`,
            zIndex: 2,
          }}
        >
          {/* Hammer Head */}
          <Box
            sx={{
              width: config.hammer * 0.8,
              height: config.hammer * 0.4,
              bgcolor: '#4A4A4A',
              borderRadius: 1,
              position: 'relative',
              left: -config.hammer * 0.4,
              boxShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80%',
                height: '60%',
                bgcolor: '#5D5D5D',
                borderRadius: 0.5,
              }
            }}
          />
          {/* Hammer Handle */}
          <Box
            sx={{
              width: config.hammer * 0.15,
              height: config.hammer * 1.2,
              bgcolor: '#8B4513',
              borderRadius: 0.5,
              margin: '0 auto',
              boxShadow: '1px 1px 2px rgba(0,0,0,0.3)',
            }}
          />
        </Box>

        {/* Sparks */}
        {[...Array(3)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              bottom: config.anvil * 0.6,
              left: `${40 + i * 10}%`,
              width: 6,
              height: 6,
              bgcolor: 'secondary.main',
              borderRadius: '50%',
              animation: `${sparkle} 0.6s ease-out infinite`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}

        {/* Anvil */}
        <Box
          sx={{
            width: config.anvil,
            height: config.anvil * 0.5,
            position: 'relative',
            animation: `${glow} 0.6s ease-in-out infinite`,
            borderRadius: 1,
          }}
        >
          {/* Anvil Top */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '120%',
              height: '30%',
              bgcolor: '#3D3D3D',
              borderRadius: '4px 4px 0 0',
              boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.3)',
            }}
          />
          {/* Anvil Body */}
          <Box
            sx={{
              position: 'absolute',
              top: '30%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              height: '40%',
              bgcolor: '#2D2D2D',
            }}
          />
          {/* Anvil Base */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80%',
              height: '30%',
              bgcolor: '#1D1D1D',
              borderRadius: '0 0 2px 2px',
            }}
          />
          {/* Hot Metal on Anvil */}
          <Box
            sx={{
              position: 'absolute',
              top: '-10%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '40%',
              height: '20%',
              bgcolor: '#FF6B35',
              borderRadius: 1,
              animation: `${pulse} 0.3s ease-in-out infinite`,
              boxShadow: '0 0 10px #FF6B35, 0 0 20px rgba(255, 107, 53, 0.5)',
            }}
          />
        </Box>
      </Box>

      {/* Loading Text */}
      <Typography
        variant="body2"
        sx={{
          mt: 3,
          color: 'secondary.main',
          fontStyle: 'italic',
          letterSpacing: 2,
          textTransform: 'uppercase',
          animation: `${pulse} 1.5s ease-in-out infinite`,
        }}
      >
        {message}
      </Typography>

      {/* Decorative dots */}
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 6,
              height: 6,
              bgcolor: 'secondary.main',
              borderRadius: '50%',
              opacity: 0.3,
              animation: `${pulse} 1s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ForgeLoader;
