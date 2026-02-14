export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
    }).format(amount);
};

export const formatCurrencyDecimal = formatCurrency;
