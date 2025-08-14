import { ChainDto } from '@/service/models/chain.model';

const statelessTransactionLink = (type: 'tx' | 'address', payload: string, chain: ChainDto | undefined | null) => {
    const defaultName = chain?.explorers[0]?.name;
    const defaultUrl = chain?.explorers[0]?.url;

    return {
        name: defaultName,
        link: `${defaultUrl}/${type}/${payload}`,
    };
};

export const useExplorerLink = (type: 'tx' | 'address', payload: string, chain: ChainDto | undefined | null) => {
    return statelessTransactionLink(type, payload, chain);
};

export const transactionLink = (payload: string, chain: ChainDto | undefined | null) => {
    // const preferredExplorer = useSettingsState.getState().preferredExplorer;
    return statelessTransactionLink('tx', payload, chain).link;
};

export const addressLink = (payload: string, chain: ChainDto | undefined) => {
    // const preferredExplorer = useSettingsState.getState().preferredExplorer;
    return statelessTransactionLink('address', payload, chain);
};
