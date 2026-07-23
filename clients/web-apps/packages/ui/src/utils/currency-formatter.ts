import { CurrenciesEnum } from "@avplatform/ui/enums";

export const popularCurrencies: Partial<Record<keyof typeof CurrenciesEnum, string>> = {
  USD: "$", // United States Dollar
  EUR: "€", // Euro
  GBP: "£", // British Pound Sterling
  JPY: "¥", // Japanese Yen
  CHF: "CHF", // Swiss Franc
  CAD: "C$", // Canadian Dollar
  AUD: "A$", // Australian Dollar
  CNY: "¥", // Chinese Yuan
  INR: "₹", // Indian Rupee
  BRL: "R$", // Brazilian Real
  RUB: "₽", // Russian Ruble
  MXN: "MX$", // Mexican Peso
  SGD: "S$", // Singapore Dollar
  HKD: "HK$", // Hong Kong Dollar
  KRW: "₩", // South Korean Won
  ZAR: "R", // South African Rand
  TRY: "₺", // Turkish Lira
  NZD: "NZ$", // New Zealand Dollar
  SEK: "kr", // Swedish Krona
  NOK: "kr", // Norwegian Krone
  DKK: "kr", // Danish Krone
};

export const currencyFormater = (
  price: number,
  currency?: keyof typeof CurrenciesEnum | string | undefined,
) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (isNaN(price)) price = 0;

  if (!currency) return `USD ${formatter.format(price)}`;

  // if (popularCurrencies[currency as keyof typeof CurrenciesEnum]) {
  //   return `${popularCurrencies[currency as keyof typeof CurrenciesEnum]} ${formatter.format(price)}`;
  // } else
  return `${currency} ${formatter.format(price)}`;
};
