const inrFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
});

const inrCompactFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
});

/** Format amount in INR (e.g. ₹12,48,000). */
export function formatINR(amount: number): string {
    return inrFormatter.format(amount);
}

/** Compact INR for chart axes (e.g. ₹12.5L). */
export function formatINRCompact(amount: number): string {
    return inrCompactFormatter.format(amount);
}

/** Signed change label (e.g. +12.4% or −8.1%). */
export function formatChange(change: number, decimals = 1): string {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(decimals)}%`;
}
