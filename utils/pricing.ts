export const calculateDynamicPrice = (
  size: string,
  grade: string,
  creatureType: string = "",
): number => {
  // Caso especial Estatuas
  if (creatureType.toLowerCase().includes("statue")) {
    return 69;
  }

  const baseCosts: Record<string, number> = {
    Small: 1,
    Medium: 1.25,
    Large: 1.5,
    Huge: 2,
    Gargantuan: 4,
  };

  const gradeMultipliers: Record<string, number> = {
    C: 1.5, // Común
    R: 2.5, // Raro
    L: 4, // Legendario
  };

  const overhead = 1.25;
  const earnings = 1.35;
  const vat = 1.21;

  const baseCost = baseCosts[size] || 0;
  const gradeMult = gradeMultipliers[grade] || 1;

  if (baseCost === 0) return 0;

  const finalPrice = Math.round(
    baseCost * gradeMult * overhead * earnings * vat,
  );
  return finalPrice;
};
