export const pricewithDiscount = (price, dis = 0) => {
  const p = Number(price);
  const d = Number(dis);

  if (isNaN(p) || p <= 0) return 0;  // Pas de prix valide → 0
  if (isNaN(d) || d <= 0) return p;  // Pas de discount → prix normal

  const discountAmount = Math.ceil((p * d) / 100);
  const actualPrice = p - discountAmount;

  return actualPrice > 0 ? actualPrice : 0;  // Pas de prix négatif
}
