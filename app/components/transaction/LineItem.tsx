import { memo } from 'react';

import { ActivityStep, isWaitStep, isWrapStep } from '@/hooks/rows/common';
import { Transaction } from '@/service/models/transaction.model';

import { TransactionLineItem } from './TransactionLineItem';
import { WaitLineItem, useTimer } from './WaitLineItem';
import { WrapLineItem } from './WrapLineItem';

export { useTimer };

export const LineItem = memo((props: { step: ActivityStep; tx?: Transaction }) => {
    const Row = () => {
        if (isWaitStep(props.step)) {
            return <WaitLineItem {...props} step={props.step} />;
        }
        if (isWrapStep(props.step)) {
            return <WrapLineItem {...props} step={props.step} />;
        }
        return <TransactionLineItem {...props} step={props.step} />;
    };

    return <div className="px-3.5 py-4 bg-bg1">{Row()}</div>;
});

LineItem.displayName = 'LineItem';
