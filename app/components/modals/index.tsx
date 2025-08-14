import { ConfirmationModal } from './ConfirmationModal';
import { RouteSelectModal } from './RouteSelectModal';
import { TokenSelectModal } from './TokenSelectModal';
import { TransactionDetailsModal } from './TransactionDetailsModal';

// import { ActivityModal } from './ActivityModal';

export const Modals = () => {
    return (
        <>
            <ConfirmationModal />
            <RouteSelectModal />
            <TokenSelectModal />
            <TransactionDetailsModal />
            {/* <ActivityModal /> */}
        </>
    );
};
