import { GoogleAnalytics } from '@next/third-parties/google';

import { useClientState } from '@/service/hooks/use-state-client';

export function Analytics() {
    const { thirdParty } = useClientState();

    // useEffect(() => {
    //   if (thirdParty?.googleAnalytics?.gId) {
    //     import("posthog-js").then(({ posthog }) =>
    //       posthog.init(thirdParty.googleAnalytics.gId, {
    //         api_host: thirdParty.googleAnalytics.gId,
    //         person_profiles: "always",
    //         loaded: (posthog) => {
    //           if (isDev) posthog.debug();
    //         },
    //       })
    //     );
    //   }

    //   if (thirdParty?.sentry?.dsn) {
    //     import("@sentry/react").then((module) => {
    //       module.init({
    //         dsn: thirdParty.sentry.dsn,
    //         integrations: [],
    //       });
    //     });
    //   }
    // }, []);

    return (
        <>
            {typeof window !== 'undefined' && thirdParty?.googleAnalytics?.gId && (
                <GoogleAnalytics gaId={thirdParty.googleAnalytics.gId} />
            )}
        </>
    );
}
