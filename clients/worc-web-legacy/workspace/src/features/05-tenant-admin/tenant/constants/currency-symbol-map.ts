// Define a mapping of currency codes to symbols
export const currencySymbols: Record<string, string> = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
};

// Helper function to format a number based on currency code
export const formatCurrency = (
  amount: number,
  currencyCode: string,
): string => {
  // Use the currency code to determine the locale
  const locale = getLocaleForCurrency(currencyCode);

  // Format the number with locale and currency
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
};

// Helper function to map currency code to a locale
const getLocaleForCurrency = (currencyCode: string): string => {
  // You can add more specific locales if needed
  const currencyLocaleMap: Record<string, string> = {
    USD: "en-US",
    INR: "en-IN",
    EUR: "de-DE",
    GBP: "en-GB",
  };

  return currencyLocaleMap[currencyCode] || "en-US"; // Default to 'en-US' if not found
};
