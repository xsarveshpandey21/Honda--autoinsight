export type CurrencyMode = 'INR' | 'USD';

const USD_TO_INR_RATE = 83.5;

/**
 * Formats a monetary amount into Indian Rupees (₹) or US Dollars ($)
 */
export function formatCurrency(
  amountUSD: number | null | undefined,
  currency: CurrencyMode = 'INR',
  compact: boolean = false
): string {
  if (amountUSD === null || amountUSD === undefined || isNaN(amountUSD)) {
    return 'N/A';
  }

  if (currency === 'USD') {
    if (compact) {
      if (amountUSD >= 1000000) return `$${(amountUSD / 1000000).toFixed(2)}M`;
      if (amountUSD >= 1000) return `$${(amountUSD / 1000).toFixed(1)}k`;
    }
    return `$${Math.round(amountUSD).toLocaleString('en-US')}`;
  }

  // Indian Rupees (₹) mode
  const amountINR = amountUSD * USD_TO_INR_RATE;
  if (compact) {
    if (amountINR >= 10000000) {
      return `₹${(amountINR / 10000000).toFixed(2)} Cr`;
    }
    if (amountINR >= 100000) {
      return `₹${(amountINR / 100000).toFixed(2)} Lakhs`;
    }
  }

  // en-IN formatting gives Indian comma placement (e.g. ₹20,75,000)
  return `₹${Math.round(amountINR).toLocaleString('en-IN')}`;
}

export function convertUSDToINR(amountUSD: number | null | undefined): number {
  if (!amountUSD) return 0;
  return amountUSD * USD_TO_INR_RATE;
}
