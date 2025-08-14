export interface SafeMultisigTransactionsResult {
    safe: string;
    to: string;
    value: string;
    data: string;
    operation: number;
    gasToken: string;
    safeTxGas: string;
    baseGas: string;
    gasPrice: string;
    refundReceiver: string;
    nonce: string;
    executionDate: string | null;
    submissionDate: string;
    modified: string;
    blockNumber: null | number;
    transactionHash: null | string;
    safeTxHash: string;
    proposer: string;
    proposedByDelegate: null;
    executor: string | null;
    isExecuted: boolean;
    isSuccessful: boolean | null;
    ethGasPrice: string | null;
    maxFeePerGas: string | null;
    maxPriorityFeePerGas: string | null;
    gasUsed: number | null;
    fee: string | null;
    origin: string;
    dataDecoded: {
        method: 'fallback';
        parameters: [];
    };
    confirmationsRequired: number;
    confirmations: {
        owner: string;
        submissionDate: string;
        transactionHash: string;
        signature: string;
        signatureType: string;
    }[];
    trusted: boolean;
    signatures: string;
}
