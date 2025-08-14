const ONE_MINUTE = 60;
const ONE_HOUR = 60 * 60;
const ONE_DAY = 60 * 60 * 24;
const TWO_DAYS = ONE_DAY * 2;

export type Period =
    | { period: 'days'; value: number }
    | { period: 'hours'; value: number }
    | { period: 'mins'; value: number }
    | { period: 'secs'; value: number }
    | null;

export const getPeriod = (seconds: number): Period => {
    // log('getPeriod', seconds, seconds / ONE_DAY);

    if (seconds >= TWO_DAYS) {
        return {
            period: 'days',
            value: Math.floor(seconds / ONE_DAY),
        };
    }
    if (seconds >= ONE_HOUR) {
        return {
            period: 'hours',
            value: Math.floor(seconds / ONE_HOUR),
        };
    }
    if (seconds >= ONE_MINUTE) {
        return {
            period: 'mins',
            value: Math.floor(Math.max(seconds / ONE_MINUTE, 1)),
        };
    }

    return {
        period: 'secs',
        value: Math.floor(seconds),
    };
};

export const formatDuration = (start: number, end: number): string | null => {
    const durationInSeconds = Math.floor((end - start) / 1000);

    // log('formatDuration', start, end, durationInSeconds / ONE_DAY);
    if (durationInSeconds < 0) {
        return null;
    }

    if (durationInSeconds >= TWO_DAYS) {
        const days = Math.floor(durationInSeconds / ONE_DAY);
        return `${days} day${days > 1 ? 's' : ''}`;
    }

    if (durationInSeconds >= ONE_HOUR) {
        const hours = Math.floor(durationInSeconds / ONE_HOUR);
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    }

    if (durationInSeconds >= ONE_MINUTE) {
        const minutes = Math.floor(durationInSeconds / ONE_MINUTE);
        return `${minutes} min${minutes > 1 ? 's' : ''}`;
    }

    return `${durationInSeconds} sec${durationInSeconds !== 1 ? 's' : ''}`;
};

export const formatDurationToNow = (end: number): string | null => {
    return formatDuration(Date.now(), end);
};
