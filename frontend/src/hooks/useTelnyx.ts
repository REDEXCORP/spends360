import { useState, useEffect, useCallback, useRef } from 'react';
import { TelnyxRTC } from '@telnyx/webrtc';
import { toast } from 'sonner';

export const useTelnyx = (token?: string) => {
    const [client, setClient] = useState<any>(null);
    const [isReady, setIsReady] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [currentCall, setCurrentCall] = useState<any>(null);

    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (!token) return;

        let mounted = true;
        let activeClient: any = null;

        try {
            activeClient = new TelnyxRTC({
                login_token: token,
            });

            activeClient.on('telnyx.ready', () => {
                if (!mounted) return;
                setIsReady(true);
                toast.success('Connected to Telnyx');
            });

            activeClient.on('telnyx.error', (err: any) => {
                if (!mounted) return;
                console.error('Telnyx connection error:', err);
                toast.error('Connection error');
                setIsReady(false);
            });

            activeClient.on('telnyx.notification', (notif: any) => {
                if (!mounted) return;
                if (notif.type === 'callUpdate') {
                    const call = notif.call;
                    setCurrentCall(call);

                    if (call.state === 'hangup' || call.state === 'destroy') {
                        setCurrentCall(null);
                        setIsMuted(false);
                        if (audioRef.current) {
                            audioRef.current.srcObject = null;
                        }
                    }
                }
            });

            activeClient.connect();
            setClient(activeClient);
        } catch (error) {
            console.error('Failed to init Telnyx client:', error);
            if (mounted) {
                toast.error('Failed to initialize Telnyx client');
            }
        }

        return () => {
            mounted = false;
            if (activeClient) {
                try {
                    activeClient.disconnect();
                } catch (e) {
                    console.error('Error disconnecting Telnyx:', e);
                }
            }
        };
    }, [token]);

    useEffect(() => {
        if (!currentCall) return;

        const interval = setInterval(() => {
            if (
                currentCall.remoteStream &&
                audioRef.current &&
                audioRef.current.srcObject !== currentCall.remoteStream
            ) {
                audioRef.current.srcObject = currentCall.remoteStream;
                audioRef.current.play().catch(err => {
                    console.warn('Direct stream play failed:', err);
                });
            }
        }, 100);

        return () => clearInterval(interval);
    }, [currentCall]);

    const handleKeyPress = useCallback((key: string) => {
        setPhoneNumber(prev => prev + key);
    }, []);

    const handleCall = useCallback(() => {
        if (!client || !isReady || !phoneNumber.trim()) {
            toast.error(!phoneNumber.trim() ? 'Enter phone number' : 'Phone not ready');
            return;
        }

        const fullNumber = phoneNumber.trim().startsWith('+') ? phoneNumber.trim() : `+${phoneNumber.trim()}`;

        try {
            client.newCall({
                destinationNumber: fullNumber,
                callerName: '+16198269409',
                callerNumber: '+16198269409',
                audio: true,
                video: false,
            });
            toast.info('Calling...');
        } catch (error) {
            toast.error('Failed to start call');
            console.error(error);
        }
    }, [client, isReady, phoneNumber]);

    const handleHangup = useCallback(() => {
        if (currentCall) {
            try {
                currentCall.hangup();
            } catch (err) {
                console.error(err);
            }
        }
    }, [currentCall]);

    const toggleMute = useCallback(() => {
        if (!currentCall) return;
        try {
            if (isMuted) {
                currentCall.unmuteAudio();
            } else {
                currentCall.muteAudio();
            }
            setIsMuted(!isMuted);
        } catch (err) {
            console.error(err);
        }
    }, [currentCall, isMuted]);

    return {
        isReady,
        phoneNumber,
        setPhoneNumber,
        isMuted,
        currentCall,
        handleKeyPress,
        handleCall,
        handleHangup,
        toggleMute,
        audioRef,
    };
};
