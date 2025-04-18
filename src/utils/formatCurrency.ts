export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return "0đ";

  return amount
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    .concat("₫");
}
