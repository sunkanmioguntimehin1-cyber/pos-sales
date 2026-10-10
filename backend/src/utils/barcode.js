/**
 * Generates a scannable EAN-13 barcode value: 12 random digits plus the
 * standard EAN/UPC check digit. The 12 data digits make collisions
 * practically impossible for in-store use.
 */
export function generateBarcode() {
  let body = '';
  for (let i = 0; i < 12; i += 1) {
    body += String(Math.floor(Math.random() * 10));
  }
  return `${body}${ean13CheckDigit(body)}`;
}

/**
 * Computes the EAN-13 check digit for a 12-digit body (odd positions 3x,
 * even positions 1x, checksum to next multiple of 10).
 */
export function ean13CheckDigit(body) {
  let sum = 0;
  for (let i = 0; i < body.length; i += 1) {
    const digit = Number(body[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  return (10 - (sum % 10)) % 10;
}

/** True when the value is a valid 13-digit EAN-13 barcode. */
export function isEan13(value) {
  if (!/^\d{13}$/.test(value || '')) return false;
  return Number(value[12]) === ean13CheckDigit(value.slice(0, 12));
}