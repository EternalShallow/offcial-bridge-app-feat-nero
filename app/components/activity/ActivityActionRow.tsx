import { useEffect, useState } from 'react';

import { Transaction } from '@/service/models/transaction.model';
import { formatDurationToNow } from '@/utils/get-period';

import { IconCaretRight, IconSpinner, IconTime } from '../icons';
import { Button } from '../ui/button';
import { isActionStatus, isGeneralStatus, isWaitStatus, useStatus } from './hooks/use-status';

export const useActionRow = (tx: Transaction) => {
    const status = useStatus(tx);
    const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

    useEffect(() => {
        let interval = null;
        if (status && isWaitStatus(status)) {
            const updateTimeRemaining = () => {
                setTimeRemaining(formatDurationToNow(status.timestamp));
            };

            updateTimeRemaining();
            interval = setInterval(updateTimeRemaining, 5_000);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [status]);

    if (!status) {
        return null;
    }

    const ActionDescription = (
        <div className="flex gap-2 items-center rounded-full border border-muted pl-2 pr-3 py-1.5">
            <IconSpinner className="fill-muted-foreground text-muted-foreground w-4 h-4 animate-spin-slow" />
            <span className="text-xs lg:text-sm text-muted-foreground">{status.description}</span>
        </div>
    );

    const ActionButton = isActionStatus(status) ? (
        <Button className="flex gap-1.5 items-center" size="sm">
            <span className="text-xs lg:text-sm text-primary-foreground">{status.button}</span>
            <IconCaretRight className="fill-primary-foreground w-3 h-3" />
        </Button>
    ) : isWaitStatus(status) && status.timestamp > Date.now() ? (
        <Button className="flex gap-1.5 items-center" size="sm">
            <span className="text-xs lg:text-sm text-primary-foreground">~{timeRemaining} to go</span>
            <IconTime className="w-4 h-auto animate-wiggle-waggle" />
        </Button>
    ) : (
        isGeneralStatus(status) && <></>
    );

    return {
        ActionDescription,
        ActionButton,
    };
};
