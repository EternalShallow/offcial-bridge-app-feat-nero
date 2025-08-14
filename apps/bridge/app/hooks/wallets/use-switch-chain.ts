import { Chain } from 'viem';
import { useWalletClient } from 'wagmi';

// import { ChainDto } from '@/service/models/chain.model';

function cleanUrl(url: string) {
    if (!url.includes('publicnode.com')) {
        return url;
    }

    return url.lastIndexOf('/') > url.indexOf('.com') ? url.substring(0, url.lastIndexOf('/')) : url;
}

export const useSwitchChain = () => {
    const wallet = useWalletClient();

    return async (chain: Chain) => {
        try {
            await wallet.data?.switchChain(chain);
            await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (e: any) {
            if (e.message.includes('Unrecognized chain ID') || e.message.includes('Chain Id not supported')) {
                const nativeCurrency = { ...chain.nativeCurrency };
                // MetaMask doesn't like native currency symbols of length 1
                if (nativeCurrency.symbol.length === 1) {
                    nativeCurrency.symbol = `${nativeCurrency.symbol}.`;
                }
                // MetaMask doesn't like non 18 decimal
                nativeCurrency.decimals = 18;

                const chain_ = { ...chain, nativeCurrency } as Chain;
                chain_.rpcUrls.default.http = chain_.rpcUrls.default.http.map(cleanUrl);

                try {
                    await wallet.data?.addChain({ chain: chain_ });
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    await wallet.data?.switchChain(chain_);
                    await new Promise((resolve) => setTimeout(resolve, 500));
                } catch {}
            }
        }
    };
};
