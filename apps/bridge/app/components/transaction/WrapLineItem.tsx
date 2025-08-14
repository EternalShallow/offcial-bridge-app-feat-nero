import React from 'react';

import { useTranslation } from 'react-i18next';

import { DEFAULT_WRAP_URL } from '@/common/consts/global';
import { IconExport, IconWrapToken } from '@/components/icons';
import { OIcon } from '@/components/icons/OIcon';
import { useExplorerLink } from '@/hooks/links/use-explorer-link';
import { WrapStep } from '@/hooks/rows/common';
import { useBridgedToken, useWrappedToken } from '@/hooks/tokens/use-token';

const LineItem = ({ step }: { step: WrapStep }) => {
    const { t } = useTranslation();
    const getWrappedToken = useWrappedToken();
    const getBridgedToken = useBridgedToken();
    const { label, chain, data } = step;
    const bridgedToken = getBridgedToken(+chain.chainId, data.bridgeTokenAddress);
    const wrappedToken = getWrappedToken(+chain.chainId, data.wrapTokenAddress);

    const bridgedLink = useExplorerLink('address', bridgedToken?.address || '', chain)?.link;
    const wrappedLink = useExplorerLink('address', wrappedToken?.address || '', chain)?.link;

    // log('【WrapLineItem】', data, bridgedToken, wrappedToken);

    if (!chain?.chainId || !wrappedToken || !bridgedToken) {
        return null;
    }

    return (
        <div className="rounded-2xl flex flex-col gap-2">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <IconWrapToken className="w-4 h-4" />
                    <span className="text-xs font-heading">{label}</span>
                </div>
                <a
                    href={chain.links?.wrapUrl || DEFAULT_WRAP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:underline"
                >
                    {t('transaction.whyIsThis', 'Why is this being done?')}
                </a>
            </div>
            <div className="flex items-center justify-between gap-4 w-full relative">
                <a
                    href={bridgedLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center min-w-[80px] group z-10"
                >
                    <OIcon type="BRIDGE_TOKEN" iconId={bridgedToken?.symbol} size={7} />
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                            {bridgedToken?.symbol || '--'}
                        </span>
                        <IconExport
                            className="w-3 h-3"
                            iconClassName="fill-muted-foreground group-hover:fill-foreground transition-colors"
                        />
                    </div>
                </a>
                <div className="wrap-arrow-zone">
                    <div className="wrap-arrow-line left">
                        <span className="wrap-arrow-head">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M6 10H16M16 10L13.5 7.5M16 10L13.5 12.5"
                                    stroke="#6b7280"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>
                    </div>
                    <div className="wrap-arrow-line right">
                        <span className="wrap-arrow-head">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M6 10H16M16 10L13.5 7.5M16 10L13.5 12.5"
                                    stroke="#6b7280"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>
                    </div>
                    <div className="wrap-arrow-dot" />
                </div>
                <div className="flex flex-col items-center z-10 ">
                    <a
                        href={chain.links?.wrapUrl || DEFAULT_WRAP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center text-xs text-muted-foreground hover:text-foreground transition-colors gap-1"
                    >
                        <IconWrapToken className="w-6 h-6" />
                        {t('transaction.wrap', 'Wrap')}
                    </a>
                </div>
                <a
                    href={wrappedLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center min-w-[80px] group z-10"
                >
                    <OIcon type="TOKEN" iconId={wrappedToken?.symbol} size={7} />
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                            {wrappedToken?.symbol || '--'}
                        </span>
                        <IconExport
                            className="w-3 h-3"
                            iconClassName="fill-muted-foreground group-hover:fill-foreground transition-colors"
                        />
                    </div>
                </a>
                <style jsx>{`
                    .wrap-arrow-zone {
                        position: absolute;
                        left: 80px;
                        right: 80px;
                        top: 50%;
                        height: 0;
                        z-index: 1;
                        pointer-events: none;
                    }
                    .wrap-arrow-line {
                        position: absolute;
                        top: 0;
                        height: 0;
                        border-top: 2px dashed #6b7280;
                        width: calc(50% - 44px);
                        display: flex;
                        align-items: center;
                    }
                    .wrap-arrow-line.left {
                        left: 0px;
                        justify-content: flex-end;
                    }
                    .wrap-arrow-line.right {
                        right: 10px;
                        justify-content: flex-start;
                    }
                    .wrap-arrow-head {
                        position: absolute;
                        top: -11px;
                        right: -18px;
                        width: 20px;
                        height: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    // .wrap-arrow-dot {
                    //     position: absolute;
                    //     top: -5px;
                    //     left: 0;
                    //     width: 12px;
                    //     height: 12px;
                    //     border-radius: 50%;
                    //     background: linear-gradient(90deg, #a5b4fc 0%, #818cf8 100%);
                    //     box-shadow: 0 0 8px 2px #a5b4fc99;
                    //     animation: wrap-arrow-dot-move 3s linear infinite;
                    // }
                    // @keyframes wrap-arrow-dot-move {
                    //     0% {
                    //         left: -10px;
                    //         opacity: 0;
                    //     }
                    //     5% {
                    //         opacity: 1;
                    //     }
                    //     35% {
                    //         left: calc(50% - 22px);
                    //         opacity: 1;
                    //     }
                    //     50% {
                    //         left: calc(50%);
                    //         opacity: 0;
                    //     }
                    //     95% {
                    //         left: calc(100% - 12px);
                    //         opacity: 1;
                    //     }
                    //     100% {
                    //         left: calc(100%);
                    //         opacity: 0;
                    //     }
                    // }
                `}</style>
            </div>
        </div>
    );
};

export const WrapLineItem = React.memo(LineItem);
