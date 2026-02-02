import React from 'react';
import { Box } from '@mui/material';

export const formatCurrencyToText = (gp: number): string => {
    const ars = gp * 1000;
    const formattedArs = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(ars);
    return `${formattedArs} (${gp.toFixed(0)} GP)`;
};

export const formatCurrencyDecimalToText = (gp: number): string => {
    const ars = gp * 1000;
    const formattedArs = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(ars);
    return `${formattedArs} (${gp.toFixed(2)} GP)`;
};

export const formatCurrency = (gp: number): React.ReactNode => {
    const ars = gp * 1000;
    const formattedArs = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(ars);

    return (
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.5 }}>
            {formattedArs}
            <Box component="span" sx={{ fontSize: '0.7em', opacity: 0.6, fontWeight: 'normal', ml: 0.5 }}>
                ({gp.toFixed(0)} GP)
            </Box>
        </Box>
    );
};

export const formatCurrencyDecimal = (gp: number): React.ReactNode => {
    const ars = gp * 1000;
    const formattedArs = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(ars);

    return (
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.5 }}>
            {formattedArs}
            <Box component="span" sx={{ fontSize: '0.7em', opacity: 0.6, fontWeight: 'normal', ml: 0.5 }}>
                ({gp.toFixed(2)} GP)
            </Box>
        </Box>
    );
};

export const formatARS = (gp: number): string => {
    const ars = gp * 1000;
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(ars);
};

export const formatGP = (gp: number, decimals: number = 0): string => {
    return `(${gp.toFixed(decimals)} GP)`;
};
