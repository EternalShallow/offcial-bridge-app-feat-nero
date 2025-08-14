import { useState } from 'react';

import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog2';
import { useModal } from '@/hooks/use-modal';
import { useReset } from '@/service/hooks/use-bridge-reset';
import { useBridgeSubmitted } from '@/service/stores/bridge.store';
import { useWaitingForBridgeSignature } from '@/service/stores/bridge.store';

import { ConfirmationModalReviewTab } from '../confirmation/tab-1-review';
import { ConfirmationModalStartTab } from '../confirmation/tab-2-start';

export const ConfirmationModal = () => {
    const { t } = useTranslation();
    const { isOpen, close } = useModal('Confirmation');
    const [activeIndex, setActiveIndex] = useState(0);
    const bridgeSubmitted = useBridgeSubmitted();
    const waitingForBridgeSignature = useWaitingForBridgeSignature();
    const reset = useReset();

    const titles = [t('confirmationModal.review'), t('confirmationModal.waitConfirmation')];

    // actions
    const onNext = () => setActiveIndex((i) => i + 1);
    const cancel = () => {
        setActiveIndex(0);
        close();
        reset();
    };

    const tabs = [
        {
            name: 'review',
            component: <ConfirmationModalReviewTab onNext={onNext} />,
        },
        {
            name: 'start',
            component: <ConfirmationModalStartTab />,
        },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={cancel}>
            <DialogContent
                hideCloseButton
                className="border border-bg1"
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                <DialogHeader className="flex flex-row justify-between items-center p-4 pb-3.5 sticky top-0 border-b border-muted">
                    <div className="w-10 h-10 shrink-0">
                        {activeIndex === 0 || bridgeSubmitted || waitingForBridgeSignature ? null : (
                            <button
                                onClick={() => setActiveIndex((a) => a - 1)}
                                className="w-10 h-10 shrink-0 flex items-center justify-center bg-muted rounded-full hover:scale-105 transition-all"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 14 14"
                                    fill="none"
                                    className="w-3.5 h-3.5 fill-foreground"
                                >
                                    <path d="M7 0.677246C6.70724 0.677246 6.41553 0.769919 6.1849 0.984753L0.523395 5.9849C0.246428 6.23133 0 6.55463 0 7.0001C0 7.44556 0.246428 7.76887 0.523395 8.01529L6.1849 13.0154C6.41553 13.2313 6.70829 13.323 7 13.323C7.67715 13.323 8.23108 12.769 8.23108 12.0919C8.23108 11.738 8.09312 11.4147 7.81616 11.1693L4.49361 8.23118H12.7689C13.4461 8.23118 14 7.67725 14 7.0001C14 6.32295 13.4461 5.76902 12.7689 5.76902H4.49255L7.8151 2.83085C8.09207 2.58442 8.23003 2.26217 8.23003 1.90833C8.23003 1.23118 7.67609 0.677246 6.99895 0.677246L7 0.677246Z" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* title */}
                    <DialogTitle>
                        <div className="text-center text-lg font-medium">{titles[activeIndex]}</div>
                    </DialogTitle>

                    {/* tabs */}
                    <div className="absolute bottom-0 left-0 right-0 flex items-center gap-1 justify-center w-full">
                        {tabs.map((tab, index) => (
                            <div
                                key={tab.name}
                                className={clsx(
                                    'w-[50%] h-1 rounded-full',
                                    index === activeIndex ? 'bg-primary-gradient' : 'bg-muted'
                                )}
                            ></div>
                        ))}
                    </div>

                    {/* close btn */}
                    <button
                        className="rounded-full w-10 h-10 shrink-0 flex items-center justify-center bg-muted hover:scale-105 transition-all focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                        onClick={cancel}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            className="fill-foreground w-3.5 h-3.5"
                        >
                            <path d="M0.562404 13.4244C-0.205637 12.6425 -0.187241 11.8653 0.617592 11.0697L4.68315 7.00411L0.617592 2.95695C-0.178043 2.14752 -0.205637 1.37028 0.589998 0.574646C1.38563 -0.220989 2.13528 -0.193394 2.95851 0.616038L7.01027 4.6678L11.062 0.629835C11.8577 -0.179597 12.6349 -0.193394 13.4167 0.574646C14.2124 1.37028 14.1848 2.16132 13.3891 2.97075L9.33738 7.00871L13.3891 11.0329C14.1986 11.8561 14.1986 12.6196 13.4167 13.4152C12.6349 14.197 11.8577 14.1832 11.0482 13.3876L7.01027 9.33583L2.95851 13.4014C2.14907 14.197 1.35804 14.2108 0.562404 13.429V13.4244Z" />
                        </svg>
                        <span className="sr-only">Close</span>
                    </button>
                </DialogHeader>

                <div className="overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={tabs[activeIndex]?.name}
                            initial="initial"
                            animate="enter"
                            exit="exit"
                            transition={{
                                duration: 0.3,
                                ease: 'easeInOut',
                            }}
                            variants={{
                                initial: {
                                    opacity: 0,
                                    y: 10,
                                },
                                enter: {
                                    opacity: 1,
                                    y: 0,
                                    transition: { duration: 0.3, ease: 'easeOut' },
                                },
                                exit: {
                                    opacity: 0,
                                    y: -10,
                                    transition: { duration: 0.2, ease: 'easeIn' },
                                },
                            }}
                            layout
                            className="flex flex-col h-full w-full"
                        >
                            {tabs[activeIndex]?.component}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
};
