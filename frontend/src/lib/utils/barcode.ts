/**
 * Mirrors the backend generator so the Add Product form can build an EAN-13
 * barcode client-side (12 random digits + EAN/UPC check digit).
 */
export function generateBarcode(): string {
  let body = '';
  for (let i = 0; i < 12; i += 1) {
    body += String(Math.floor(Math.random() * 10));
  }
  return `${body}${ean13CheckDigit(body)}`;
}

export function ean13CheckDigit(body: string): number {
  let sum = 0;
  for (let i = 0; i < body.length; i += 1) {
    const digit = Number(body[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  return (10 - (sum % 10)) % 10;
}

export function isEan13(value: string | undefined | null): boolean {
  if (!value || !/^\d{13}$/.test(value)) return false;
  return Number(value[12]) === ean13CheckDigit(value.slice(0, 12));
}