import { currencySymbolMap } from '@/common/consts/token/currency-symbol-map';

// import { useTokenPrice } from "@/hooks/use-prices";
// import { useConfigState } from "@/state/config";
// import { useSettingsState } from "@/state/settings";

// import { useSelectedToken } from "./tokens/use-token";

// export const useFiatAmount = () => {
//   const token = useSelectedToken();
//   const usdPrice = useTokenPrice(token);

//   const rawAmount = parseFloat(useConfigState.useRawAmount()) || 0;
//   const currency = useSettingsState.useCurrency();

//   const fiatAmount = usdPrice
//     ? `${currencySymbolMap[currency]}${(rawAmount * usdPrice).toLocaleString(
//         "en"
//       )}`
//     : undefined;

//   return {
//     rawAmount,
//     fiatAmount,
//   };
// };

export const useFormatFiat = () => {
    // const currency = useSettingsState.useCurrency();

    return (fiat: number) => {
        const currencyData = currencySymbolMap['USD'];

        if (fiat > 0 && fiat < 0.01 && currencyData.subunit) {
            return `${currencyData.symbol}${fiat.toLocaleString('en', { maximumFractionDigits: 4 })}`;
        }

        const formatted = `${currencyData.symbol}${fiat.toLocaleString('en', { maximumFractionDigits: 2 })}`;

        return formatted;
    };
};
