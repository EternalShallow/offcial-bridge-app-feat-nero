import React from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import {
    IconCheckCircle,
    IconCloseCircle,
    IconExport,
    IconReturnCircle,
    IconSimpleGas,
    IconSpinner,
} from '@/components/icons';
import { OIcon } from '@/components/icons/OIcon';
import { Skeleton } from '@/components/ui/skeleton';
import { useNetworkFeeForGasLimit } from '@/hooks/fees/use-network-fee';
import { transactionLink } from '@/hooks/links/use-explorer-link';
import { TransactionStep } from '@/hooks/rows/common';
import {
    isConfirmedFailedTx,
    isConfirmedSuccessTx,
    isFailedCall,
    isNotSubmittedCall,
    isNotSubmittedSafeTx,
    isSubmittedTx,
} from '@/utils/guards';

const commonAnimationProps = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: 0.2 },
};

const LineItem = ({ step }: { step: TransactionStep }) => {
    const fee = useNetworkFeeForGasLimit(step.chain?.chainId, step.gasLimit);
    if (!step.chain) return null;

    return (
        <div className="flex flex-col">
            <div className="flex justify-between items-center relative">
                <div className="flex items-center gap-1.5">
                    <OIcon type="CHAIN" iconId={step.chain.chainId} className="w-5 h-5 rounded-md" />
                    <div className="flex flex-col justify-center">
                        <span className="text-sm font-heading leading-none">{step.label}</span>
                    </div>
                </div>

                <div className="flex flex-row gap-2 items-center">
                    {/* View Txn */}
                    {step.confirmation &&
                        (isConfirmedFailedTx(step.confirmation) || isConfirmedSuccessTx(step.confirmation)) && (
                            <a
                                href={transactionLink(step.confirmation.transactionHash, step.chain)}
                                target="_blank"
                                className="text-muted-foreground flex gap-1 items-center text-xs group hover:text-foreground"
                            >
                                <span>View</span>
                                <IconExport
                                    className="w-4 h-4"
                                    iconClassName="fill-muted-foreground group-hover:fill-foreground"
                                />
                                {/* <IconArrowUpRight className="w-2 h-2 fill-muted-foreground group-hover:fill-foreground" /> */}
                            </a>
                        )}

                    {/* Gas and fees */}
                    {!!step.gasLimit && !step.confirmation && (
                        <div className="flex gap-1 items-center">
                            <IconSimpleGas className="w-3 h-auto fill-muted-foreground" />
                            {fee.isLoading ? (
                                <Skeleton className="h-4 w-[88px]" />
                            ) : (
                                <>
                                    {/* <span className="text-xs text-muted-foreground leading-none">
                                            {fee.data?.token.formatted}
                                        </span> */}
                                    {fee.data?.fiat?.formatted && (
                                        <span className="text-xs text-muted-foreground leading-none  opacity-50">
                                            {fee.data?.fiat?.formatted}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    <AnimatePresence mode="wait" initial={false}>
                        {step.isExpiredAndReturned ? (
                            <motion.div key="expired-and-returned" {...commonAnimationProps}>
                                <IconReturnCircle className="fill-destructive w-6 h-6" />
                            </motion.div>
                        ) : step.confirmation ? (
                            <>
                                {isConfirmedSuccessTx(step.confirmation) ? (
                                    <motion.div key="confirmed" {...commonAnimationProps}>
                                        <IconCheckCircle className="w-5 h-5 fill-success" />
                                    </motion.div>
                                ) : isConfirmedFailedTx(step.confirmation) || isFailedCall(step.confirmation) ? (
                                    <motion.div key="failed" {...commonAnimationProps}>
                                        <IconCloseCircle className="w-5 h-5 fill-destructive" />
                                    </motion.div>
                                ) : isNotSubmittedCall(step.confirmation) || isNotSubmittedSafeTx(step.confirmation) ? (
                                    <motion.div key="non-clickable-spinner" {...commonAnimationProps}>
                                        <IconSpinner className="h-5 w-5" />
                                    </motion.div>
                                ) : isSubmittedTx(step.confirmation) ? (
                                    <motion.div key="clickable-spinner" {...commonAnimationProps}>
                                        <a
                                            href={transactionLink(step.confirmation.transactionHash, step.chain)}
                                            target="_blank"
                                        >
                                            <IconSpinner className="h-5 w-5" />
                                        </a>
                                    </motion.div>
                                ) : (
                                    <motion.div key="confirmed" {...commonAnimationProps}>
                                        <IconCheckCircle className="w-5 h-5 fill-success" />
                                    </motion.div>
                                )}
                            </>
                        ) : step.isFailed ? (
                            <motion.div key="failed" {...commonAnimationProps}>
                                <IconCloseCircle className="w-5 h-5 fill-destructive" />
                            </motion.div>
                        ) : step.ButtonComponent ? (
                            <motion.div key="button" {...commonAnimationProps}>
                                <step.ButtonComponent />
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export const TransactionLineItem = React.memo(LineItem);
