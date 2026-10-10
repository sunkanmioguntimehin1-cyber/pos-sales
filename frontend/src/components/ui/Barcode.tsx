'use client';
import { useEffect, useId, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { isEan13 } from '@/lib/utils/barcode';

interface BarcodeProps {
  value: string;
  height?: number;
  width?: number;
  className?: string;
  displayValue?: boolean;
}

/**
 * Renders `value` as a scannable barcode. EAN-13 when the value is a valid
 * 13-digit code, otherwise falls back to Code 128 so any barcode text still
 * renders. Invalid or empty values render nothing.
 */
export function Barcode({ value, height = 40, width = 1, className, displayValue = false }: BarcodeProps) {
  const ref = useRef<SVGSVGElement>(null);
  const id = useId();

  useEffect(() => {
    const node = ref.current;
    if (!node || !value) return;
    const format = isEan13(value) ? 'EAN13' : 'CODE128';
    try {
      JsBarcode(node, value, { format, width, height, displayValue, margin: 0 });
    } catch {
      // Leave the node empty on unrenderable values.
    }
  }, [value, height, width, displayValue]);

  return value ? <svg ref={ref} id={`barcode-${id}`} className={className} /> : null;
}