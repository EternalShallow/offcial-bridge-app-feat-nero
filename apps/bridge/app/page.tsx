'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { Analytics } from './components/Analytics';
import { Bridge } from './components/Bridge';
import { ClientOnly } from './components/ClientOnly';
import { ActivityHome } from './components/activity/ActivityHome';
import { Header } from './components/layout/Header';
import { Modals } from './components/modals';
import { Toaster } from './components/ui/sonner';
import { useInitialise } from './hooks/use-initialise';
import { useDisplayTransactions } from './service/stores/bridge.store';

export default function Home() {
    return (
        <main className="relative w-screen h-screen bg-background overflow-hidden">
            <ClientOnly>
                <Header />
                <Bridge />

                <Modals />
                <Toaster />
                <Analytics />

                {/* Transactions container */}
                <AnimatePresence mode="wait" initial={false}>
                    <TransactionsContainer />
                </AnimatePresence>
            </ClientOnly>
        </main>
    );
}

function TransactionsContainer() {
    useInitialise();
    const displayTransactions = useDisplayTransactions();

    if (!displayTransactions) {
        return null;
    }

    return (
        <>
            <ActivityHome key="transactionItemsContainer" />
            {/* fade background */}
            <motion.div
                initial={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                // transition={{ ease: "easeOut", duration: 1 }}
                className="h-screen w-screen z-10 backdrop-blur-lg fixed inset-0 bg-white/0"
            ></motion.div>
        </>
    );
}
