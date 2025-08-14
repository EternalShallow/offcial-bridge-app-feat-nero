import { useEffect } from 'react';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import { match } from 'ts-pattern';

import { getInitiatingTx } from '@/hooks/tx/use-initiating-tx';
import { useLocalTransactions } from '@/hooks/tx/use-local-transactions';
import { useTrackEvent } from '@/hooks/use-track-event';
import { useEvmAddress } from '@/hooks/wallets/use-evm-address';
import { useTransactions } from '@/service/hooks/use-transactions';
import { useSetDisplayTransactions } from '@/service/stores/bridge.store';

import { IconClose, IconSpinner } from '../icons';
import { ActivityRow } from './ActivityRow';

// Animations
const container = {
    hidden: {
        y: '5vh',
        opacity: 0,
        transition: {
            type: 'tween' as const,
            duration: 0.15,
        },
    },
    show: {
        opacity: 1,
        y: '0vh',
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 16,
            staggerChildren: 0.05,
            delayChildren: 0.1,
            // staggerDirection: -1,
        },
    },
} as const;

const item = {
    hidden: { opacity: 0, y: 20, scale: 1 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 12,
        },
    },
} as const;

export const ActivityHome = ({}) => {
    const trackEvent = useTrackEvent();

    const { ref, inView } = useInView({
        threshold: 0.9,
        delay: 300,
    });
    const evmAddress = useEvmAddress();
    const setDisplayTransactions = useSetDisplayTransactions();
    const pendingTransactions = useLocalTransactions();
    const {
        transactions,
        isLoading,
        isFetchingNextPage,
        isError,
        fetchNextPage,
        total: totalTransactions,
    } = useTransactions();
    const { t } = useTranslation();

    // const statusCheck = useStatusCheck();
    // const inProgressCount = useInProgressTxCount();
    // const filtersModal = useModal('ActivityFilter');
    // const resetFilters = useActivityFiltersState.useReset();
    // const activeFilterCount = useActiveFilterCount();
    // const hasFilters = useIsUltra();

    useEffect(() => {
        if (isError) return;
        if (isFetchingNextPage || isLoading) return;
        if (totalTransactions === 0 || totalTransactions === transactions.length) return;
        if (inView) {
            fetchNextPage();
        }
    }, [inView, isError, fetchNextPage, isFetchingNextPage, isLoading, totalTransactions, transactions]);

    return (
        <main
            className="flex items-start justify-center scroll-smooth overflow-y-scroll w-screen h-dvh fixed inset-0 px-2 md:px-0 py-20 md:py-20 z-[25]"
            key="bridgeMain"
            onClick={() => {
                setDisplayTransactions(false);
                trackEvent({ event: 'close-activity' });
                // resetFilters();
            }}
        >
            <motion.button
                initial={{ opacity: 0, scale: 0.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.1 }}
                whileHover={{ scale: 1.1 }}
                key="close-activity-button"
                className={`flex items-center cursor-pointer w-10 h-10 shrink-0 justify-center rounded-full shadow-sm bg-card fixed top-6 right-6 z-10`}
            >
                <IconClose className="fill-foreground w-3.5 h-3.5" />
            </motion.button>
            <motion.div
                variants={container}
                initial={'hidden'}
                animate={'show'}
                exit={'hidden'}
                className="flex flex-col items-center w-full"
            >
                <div className="relative w-full flex justify-center items-center gap-2 px-6 pb-6">
                    <div
                        className={clsx(
                            evmAddress && 'pl-6 pr-3.5',
                            'flex items-center gap-3 bg-card px-6 py-3 rounded-full shadow-sm'
                        )}
                    >
                        <h1 className="text-2xl font-heading leading-none">{t('activity.activity')}</h1>

                        <div className="flex gap-1 items-center">
                            {evmAddress && (
                                <span className="bg-muted rounded-full text-xs text-muted-foreground px-3 py-1 h-6">
                                    {evmAddress.slice(0, 4)}&hellip;
                                    {evmAddress.slice(evmAddress.length - 4)}
                                </span>
                            )}

                            {/* {svmAddress && (
                                <span className="bg-muted rounded-full text-xs text-muted-foreground px-3 py-1 h-6">
                                    {svmAddress.slice(0, 4)}&hellip;
                                    {svmAddress.slice(svmAddress.length - 4)}
                                </span>
                            )} */}
                        </div>
                    </div>

                    {/* {hasFilters && (
                        <Button
                            size={'icon'}
                            className="relative bg-card h-12 w-12 focus-visible:ring-0 focus-visible:ring-offset-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                filtersModal.open();
                            }}
                        >
                            <AnimatePresence>
                                {activeFilterCount > 0 && (
                                    <motion.span
                                        variants={filterItem}
                                        initial="hidden"
                                        animate="show"
                                        exit="hidden"
                                        key="sort-item"
                                        className="absolute top-0 tracking-tighter -right-0 bg-primary text-primary-foreground text-xs leading-none rounded-full px-2 py-1"
                                    >
                                        {activeFilterCount}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            <IconFilter className="w-5 h-5 fill-foreground" />
                        </Button>
                    )} */}
                </div>

                {match({
                    isError,
                    isLoading,
                    evmAddress,
                })
                    .with({ evmAddress: undefined }, () => (
                        <div className="flex px-6 py-3 shadow-sm rounded-full justify-center items-center h-full bg-card">
                            <span className="text-muted-foreground text-sm">{t('activity.connectWallet')}</span>
                        </div>
                    ))
                    .with({ isLoading: true }, () => (
                        <div className="flex px-6 py-3 shadow-sm rounded-full justify-center items-center h-full bg-card">
                            <span className="text-muted-foreground text-sm">
                                <IconSpinner className="h-6 w-6" />
                            </span>
                        </div>
                    ))
                    .with({ isError: true }, () => (
                        <div className="flex px-6 py-3 shadow-sm rounded-full justify-center items-center h-full bg-card">
                            <span className="text-muted-foreground text-sm">{t('activity.error')}…</span>
                        </div>
                    ))
                    // .with({ statusCheck: true }, () => (
                    //     <div className="flex px-6 py-3 shadow-sm rounded-full justify-center items-center h-full bg-card">
                    //         <span className="text-muted-foreground text-sm">{t('activity.error')}.</span>
                    //     </div>
                    // ))
                    .otherwise(() => {
                        if (transactions.length === 0 && pendingTransactions.length === 0) {
                            return (
                                <div className="flex px-6 py-3 shadow-sm rounded-full justify-center items-center h-full bg-card">
                                    <span className="text-muted-foreground text-sm">
                                        {t('activity.noTransactions')}
                                    </span>
                                </div>
                            );
                        }

                        return (
                            <div className="flex flex-col gap-3 lg:gap-4 w-full px-2 max-w-xl">
                                {/* <motion.div
                                    variants={item}
                                    className={
                                        'relative w-full h-full flex flex-col shrink-0 overflow-hidden rounded-3xl shadow-sm'
                                    }
                                >
                                    <FaultProofsWithdrawalsResetBanner />
                                </motion.div> */}

                                {[...pendingTransactions, ...transactions]
                                    .sort((a, b) => {
                                        const aTimestamp = getInitiatingTx(a)?.timestamp || 0;
                                        const bTimestamp = getInitiatingTx(b)?.timestamp || 0;

                                        return bTimestamp - aTimestamp;
                                    })
                                    .map((t) => {
                                        return (
                                            <motion.div
                                                key={`activity-${t.id}`}
                                                variants={item}
                                                // hovers must NOT be a variant or stagger animation fails
                                                whileHover={{ opacity: 1, scale: 1.02 }}
                                                whileTap={{ opacity: 1, scale: 0.98 }}
                                                className={
                                                    'relative w-full h-full flex flex-col shrink-0 overflow-hidden rounded-3xl shadow-sm cursor-pointer'
                                                }
                                            >
                                                <ActivityRow key={t.id} tx={t} />
                                            </motion.div>
                                        );
                                    })}

                                <span ref={ref} />

                                {transactions.length !== totalTransactions && (
                                    <div className="flex justify-center items-center p-3">
                                        <div className="bg-card px-5 py-3 flex gap-1 items-center rounded-full hover:scale-105 transition-all">
                                            {isFetchingNextPage ? (
                                                <>
                                                    <IconSpinner className="w-3 h-3 block text-foreground" />
                                                    <span className="text-sm text-foreground leading-none font-heading">
                                                        {t('loading')}
                                                    </span>
                                                </>
                                            ) : (
                                                // just handling the case where the IntersectionObserver doesn't work
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        fetchNextPage();
                                                    }}
                                                    className="text-sm text-foreground leading-none font-heading"
                                                >
                                                    {t('loadMore')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
            </motion.div>
        </main>
    );
};
