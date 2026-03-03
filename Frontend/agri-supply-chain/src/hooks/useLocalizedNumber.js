import { useTranslation } from 'react-i18next';

/**
 * Hook to format numbers according to the current language locale.
 * Hindi, Marathi, Punjabi and Gujarati use their respective numerals via Intl.NumberFormat.
 *
 * Usage:
 *   const { formatNumber, formatCurrency } = useLocalizedNumber();
 *   formatNumber(10)       // "10" in English, "१०" in Hindi/Marathi, "੧੦" in Punjabi, "૧૦" in Gujarati
 *   formatCurrency(500)    // "₹500" localized
 */
export function useLocalizedNumber() {
  const { i18n } = useTranslation();

  const localeMap = {
    en: 'en-IN',
    hi: 'hi-IN',
    mr: 'mr-IN',
    pa: 'pa-IN',
    gu: 'gu-IN',
  };

  const locale = localeMap[i18n.language] || 'en-IN';

  const formatNumber = (num) => {
    if (num === null || num === undefined || num === '') return '';
    return new Intl.NumberFormat(locale).format(Number(num));
  };

  const formatCurrency = (num, currency = 'INR') => {
    if (num === null || num === undefined || num === '') return '';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(Number(num));
  };

  const formatCompact = (num) => {
    if (num === null || num === undefined || num === '') return '';
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(Number(num));
  };

  return { formatNumber, formatCurrency, formatCompact, locale };
}

export default useLocalizedNumber;
