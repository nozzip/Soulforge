import React from 'react';
import { Fab, Tooltip, useTheme, alpha } from '@mui/material';
import { WhatsApp as WhatsAppIcon } from '@mui/icons-material';

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ phoneNumber, message = '' }) => {
  const theme = useTheme();

  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}${message ? `?text=${encodedMessage}` : ''}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Tooltip title="Contactar al Gremio vía WhatsApp" placement="left" arrow>
      <Fab
        color="primary"
        aria-label="whatsapp"
        onClick={handleClick}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: '#25D366',
          color: 'white',
          boxShadow: `0 4px 20px ${alpha('#25D366', 0.4)}`,
          border: 2,
          borderColor: theme.palette.secondary.main,
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: '#128C7E',
            transform: 'scale(1.1) translateY(-4px)',
            boxShadow: `0 8px 30px ${alpha('#25D366', 0.6)}, 0 0 20px ${alpha(theme.palette.secondary.main, 0.3)}`,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.3)}, transparent)`,
            opacity: 0,
            transition: 'opacity 0.3s ease',
            zIndex: -1,
          },
          '&:hover::before': {
            opacity: 1,
          },
        }}
      >
        <WhatsAppIcon sx={{ fontSize: 32 }} />
      </Fab>
    </Tooltip>
  );
};

export default WhatsAppButton;
