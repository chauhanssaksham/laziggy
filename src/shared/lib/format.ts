/**
 * Format a price from lowest denomination (cents/paise) to a currency display string.
 * @param price - Price in lowest denomination (e.g., 550 for $5.50)
 * @param currency - ISO 4217 currency code (e.g., "USD", "EUR", "INR")
 */
export function formatPrice(
    price: number | undefined,
    currency: string
): string | null {
    if (price === undefined) return null;
    if (!Number.isFinite(price)) throw new Error(`Invalid price value: ${price}`);
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
    }).format(price / 100);
}
