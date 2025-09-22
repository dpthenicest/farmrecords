import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NGN',
    currencyDisplay: 'code',
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
} 

/**
 * Generates a new invoice number based on the last number in the sequence.
 * The format is INV[YYYY][MM][XXXXX].
 * The sequence (XXXXX) resets to 00001 for a new month or a new year.
 * * @param {string | null} lastInvoiceNumber The number of the last invoice, e.g., "INV20250500043".
 * @returns {string} The newly generated invoice number.
 */
export function generateInvoiceNumber(lastInvoiceNumber: string | undefined): string {
    const today = new Date();
    const currentYear = today.getFullYear().toString();
    // Pad month to two digits (e.g., 5 becomes 05)
    const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');

    // Case 1: No previous invoice exists.
    if (!lastInvoiceNumber) {
        return `INV${currentYear}${currentMonth}00001`;
    }

    // Extract parts from the last invoice number.
    // Assuming the format: INV[YYYY][MM][XXXXX]
    const lastYear = lastInvoiceNumber.substring(3, 7);
    const lastMonth = lastInvoiceNumber.substring(7, 9);
    const lastSequence = lastInvoiceNumber.substring(9, 14);

    // Case 2: It's a new year.
    if (lastYear !== currentYear) {
        return `INV${currentYear}${currentMonth}00001`;
    }

    // Case 3: It's a new month within the same year.
    if (lastMonth !== currentMonth) {
        return `INV${currentYear}${currentMonth}00001`;
    }

    // Case 4: It's the same month and year.
    // We only need to increment the sequence number.
    const nextSequence = parseInt(lastSequence, 10) + 1;
    const paddedSequence = nextSequence.toString().padStart(5, '0');
    
    return `INV${currentYear}${currentMonth}${paddedSequence}`;
}