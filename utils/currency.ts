export const formatCurrency = (gp: number): string => {
    const ars = gp * 1000;
    const formattedArs = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(ars);

    return `${formattedArs} (${gp.toFixed(0)} GP)`;
};

export const formatCurrencyDecimal = (gp: number): string => {
    const ars = gp * 1000;
    const formattedArs = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(ars);

    return `${formattedArs} (${gp.toFixed(2)} GP)`;
};
