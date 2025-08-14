import { AnimatePresence, motion } from 'framer-motion';

import { useSelectedBridgeRoute } from '@/hooks/routes/use-bridge-route';

import { IconSpinner } from '../icons';
import { RouteDetail } from './RouteDetail';

export const RoutePreview = () => {
    const route = useSelectedBridgeRoute();

    return (
        <AnimatePresence mode="wait">
            {route.isLoading && (
                <motion.div
                    key={'loading route quote'}
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className={`flex gap-2 justify-center w-full items-center py-4`}
                >
                    <IconSpinner className="text-muted-foreground w-4 h-4" />
                    <span className="text-xs text-muted-foreground">Loading</span>
                </motion.div>
            )}

            {!route.isLoading && !route.data && <motion.div key={'empty route quote'} exit={{ opacity: 0 }} />}

            {/* TODO: !isRouteQuoteError(route.data.result) */}
            {!route.isLoading && route.data && (
                <motion.div
                    key={'route quote'}
                    exit={{ opacity: 0, scale: 0.98 }}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1, transition: { delay: 0.2 } }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className={`flex flex-col gap-2 relative`}
                >
                    <RouteDetail
                        provider={route.data!.id}
                        quote={route.data!.result}
                        // allowDetailClicks
                        // onRoutesClick={validRoutesCount > 1 ? () => routeSelectorModal.open() : undefined}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// return (
//     <div className="flex items-center gap-2">
//         <div className="flex items-center gap-2">
//             <OIcon type="CHAIN" iconId={toChainId.toString()} size={6} />
//             <span className="text-xs">Native Bridge</span>
//         </div>

//         <Tooltip>
//             <TooltipTrigger asChild>
//                 <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
//                     <span>~2 mins</span>
//                 </div>
//             </TooltipTrigger>
//             <TooltipContent>Time to bridge</TooltipContent>
//         </Tooltip>
//     </div>
// );
