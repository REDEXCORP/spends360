import { useContext, useEffect, useState } from 'react';
import { TelnyxRTCContext, useCallbacks } from '@telnyx/react-client';

export function useTelnyxReady() {
    const client = useContext(TelnyxRTCContext);
    const [isReady, setIsReady] = useState(() => Boolean(client?.connected));

    useEffect(() => {
        setIsReady(Boolean(client?.connected));
    }, [client]);

    useCallbacks({
        onReady: () => setIsReady(true),
        onError: () => setIsReady(false),
        onSocketError: () => setIsReady(false),
        onSocketClose: () => setIsReady(false),
    });

    return { client, isReady };
}
