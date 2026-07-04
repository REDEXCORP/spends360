'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    IconBackspace,
    IconMicrophone,
    IconMicrophoneOff,
    IconPhone,
    IconPhoneOff,
} from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCallbacks } from '@telnyx/react-client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useTelnyxReady } from '@/hooks/useTelnyxReady';
import { TELNYX_REGIONS as ALL_REGIONS } from '@/constants/telnyxRegions';

const TERMINAL_CALL_STATES = new Set(['hangup', 'destroy', 'purge', 'done']);

function isTerminalCallState(state?: string): boolean {
    return Boolean(state && TERMINAL_CALL_STATES.has(state));
}

function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForCallRemoval(client: any, callId: string, maxMs = 3000) {
    const start = Date.now();
    while (client.calls?.[callId] && Date.now() - start < maxMs) {
        await wait(100);
    }
}

function resetCallState(
    setCurrentCall: (call: null) => void,
    setIsMuted: (muted: boolean) => void,
    isOutboundRef: { current: boolean },
    activeCallIdRef: { current: string | null }
) {
    isOutboundRef.current = false;
    activeCallIdRef.current = null;
    setCurrentCall(null);
    setIsMuted(false);
}

function isInboundCall(call: any): boolean {
    return call?.direction === 'inbound' || call?.callDirection === 'inbound';
}

function CallAudio({ call, client }: { call: any; client: any }) {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (!call) return;

        const attachStream = () => {
            const sdkCall = client?.calls?.[call.id] ?? call;
            const stream = sdkCall?.remoteStream;
            const audio = audioRef.current;
            if (!stream || !audio) return;

            if (audio.srcObject !== stream) {
                audio.srcObject = stream;
            }

            if (audio.paused) {
                audio.play().catch(() => undefined);
            }
        };

        attachStream();
        const interval = setInterval(attachStream, 250);
        return () => {
            clearInterval(interval);
            if (audioRef.current) {
                audioRef.current.srcObject = null;
            }
        };
    }, [call, call?.id, call?.state, client]);

    return (
        <audio
            ref={audioRef}
            autoPlay
            playsInline
            className="hidden"
        />
    );
}

function SignalBars({ isReady }: { isReady: boolean }) {
    const barHeights = [6, 9, 12, 15];
    const activeBars = isReady ? 4 : 1;

    return (
        <div
            className="flex items-end gap-[3px]"
            title={isReady ? 'Connected' : 'Connecting...'}
            aria-label={isReady ? 'Connected' : 'Connecting'}
        >
            {barHeights.map((height, index) => (
                <span
                    key={height}
                    className={`w-[3px] rounded-sm transition-colors duration-300 ${
                        index < activeBars
                            ? isReady
                                ? 'bg-green-500'
                                : 'bg-amber-400 animate-pulse'
                            : 'bg-slate-200'
                    }`}
                    style={{ height }}
                />
            ))}
        </div>
    );
}

export default function DialerPage() {
    const { profile } = useAuth();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+1');
    const [region, setRegion] = useState('us');
    const [isMuted, setIsMuted] = useState(false);
    const [currentCall, setCurrentCall] = useState<any>(null);
    const { client, isReady } = useTelnyxReady();
    const [selectedCallerId, setSelectedCallerId] = useState<string>('');
    const isOutboundRef = useRef(false);
    const activeCallIdRef = useRef<string | null>(null);

    const callerIdsConfig = useMemo(() => {
        return (profile?.callerIds as Record<string, string[]>) ?? {};
    }, [profile?.callerIds]);

    const availableRegions = useMemo(() => {
        return ALL_REGIONS.filter(r => callerIdsConfig[r.value]?.length > 0);
    }, [callerIdsConfig]);

    useEffect(() => {
        if (availableRegions.length > 0 && !availableRegions.find(r => r.value === region)) {
            setRegion(availableRegions[0].value);
            setCountryCode(availableRegions[0].code);
        }
    }, [availableRegions, region]);

    const availableCallerIds = useMemo(() => {
        return callerIdsConfig[region] || [];
    }, [callerIdsConfig, region]);

    useEffect(() => {
        if (availableCallerIds.length > 0) {
            setSelectedCallerId(availableCallerIds[0]);
        } else {
            setSelectedCallerId('');
        }
    }, [availableCallerIds]);

    const activeCall =
        currentCall && !isTerminalCallState(currentCall.state) ? currentCall : null;
    const isInboundActive = activeCall ? isInboundCall(activeCall) : false;

    useEffect(() => {
        if (!client) return;

        const handleNotification = (notif: any) => {
            if (notif.type !== 'callUpdate') return;

            const call = notif.call;

            if (activeCallIdRef.current && call.id !== activeCallIdRef.current) {
                return;
            }

            if (isTerminalCallState(call.state)) {
                resetCallState(setCurrentCall, setIsMuted, isOutboundRef, activeCallIdRef);
                toast.dismiss();
                if (call.cause && call.cause !== 'NORMAL_CLEARING') {
                    toast.error(`Call failed: ${call.cause}`);
                }
                return;
            }

            if (!activeCallIdRef.current) {
                activeCallIdRef.current = call.id;
            }

            const sdkCall = client.calls?.[call.id] ?? call;
            setCurrentCall(sdkCall);

            if (call.state === 'ringing' && (isInboundCall(call) || !isOutboundRef.current)) {
                isOutboundRef.current = false;
                activeCallIdRef.current = call.id;
                toast('Incoming Call', {
                    description: `Call from ${call.remoteCallerName || call.remoteCallerNumber || 'Unknown Caller'}`,
                    duration: 30000,
                    action: {
                        label: 'Answer',
                        onClick: () => call.answer(),
                    },
                    cancel: {
                        label: 'Decline',
                        onClick: () => call.hangup(),
                    },
                });
            }

            if (call.state === 'active') {
                toast.dismiss();
                if (isInboundCall(call)) {
                    toast.success('Call connected');
                }
            }
        };

        client.on('telnyx.notification', handleNotification);
        return () => {
            client.off('telnyx.notification', handleNotification);
        };
    }, [client]);

    useCallbacks({
        onError: (err: any) => {
            toast.error('Connection error: ' + (err?.message || 'Unknown error'));
        },
        onSocketError: (err: any) => {
            toast.error('Socket error: ' + (err?.message || 'Connection lost'));
        },
    });

    const dialpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#', '+'];

    const handleKeyPress = (key: string) => {
        setPhoneNumber(prev => prev + key);
    };

    const handleCall = useCallback(async () => {
        if (!client || !isReady) {
            toast.error('Phone is not ready yet. Please wait.');
            return;
        }

        if (!selectedCallerId) {
            toast.error('No caller ID configured for this workspace');
            return;
        }

        const digits = phoneNumber.replace(/\D/g, '');
        if (!digits) {
            toast.error('Please enter a phone number');
            return;
        }

        const countryDigits = countryCode.replace(/\D/g, '');
        const fullNumber = `+${countryDigits}${digits}`;

        try {
            if (currentCall && !isTerminalCallState(currentCall.state)) {
                try {
                    await currentCall.hangup();
                } catch {
                    // ignore hangup errors while cleaning up before a new call
                }
                await waitForCallRemoval(client, currentCall.id);
            }

            resetCallState(setCurrentCall, setIsMuted, isOutboundRef, activeCallIdRef);

            isOutboundRef.current = true;
            const call = client.newCall({
                destinationNumber: fullNumber,
                callerName: selectedCallerId,
                callerNumber: selectedCallerId,
                audio: true,
                video: false,
            });

            activeCallIdRef.current = call.id;
            setCurrentCall(call);
            toast.info('Initiating call...');
        } catch (err: any) {
            resetCallState(setCurrentCall, setIsMuted, isOutboundRef, activeCallIdRef);
            toast.error('Failed to start call: ' + (err?.message || 'Unknown error'));
        }
    }, [client, isReady, countryCode, phoneNumber, selectedCallerId, currentCall]);

    const handleHangup = useCallback(async () => {
        const callToEnd = activeCall ?? currentCall;
        if (!callToEnd || isTerminalCallState(callToEnd.state)) return;

        try {
            await callToEnd.hangup();
            if (client) await waitForCallRemoval(client, callToEnd.id);
        } catch (err: any) {
            toast.error('Failed to end call: ' + (err?.message || 'Unknown error'));
        } finally {
            resetCallState(setCurrentCall, setIsMuted, isOutboundRef, activeCallIdRef);
            toast.dismiss();
        }
    }, [activeCall, currentCall, client]);

    const handleAnswer = useCallback(() => {
        if (activeCall) {
            activeCall.answer();
        }
    }, [activeCall]);

    const toggleMute = useCallback(() => {
        if (!activeCall) return;

        if (isMuted) {
            activeCall.unmuteAudio();
        } else {
            activeCall.muteAudio();
        }
        setIsMuted(!isMuted);
    }, [activeCall, isMuted]);

    return (
        <div className="-m-4 flex h-[calc(100vh-3.5rem)] max-h-[calc(100vh-3.5rem)] min-h-0 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
            {activeCall && <CallAudio call={activeCall} client={client} />}

            <div className="flex w-full shrink-0 flex-col bg-white md:h-full md:w-[400px] md:overflow-hidden md:border-r border-slate-200 shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-10">
                <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 px-4 md:px-6">
                    <h1 className="text-base font-semibold text-neutral-900">Dialpad</h1>
                    <SignalBars isReady={isReady} />
                </header>

                <div className="p-4 md:flex-1 md:min-h-0 md:overflow-y-auto md:p-6">
                <div className="mb-4">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                        Region
                    </label>
                    <Select
                        value={region}
                        onValueChange={val => {
                            setRegion(val);
                            const codes: Record<string, string> = {
                                us: '+1',
                                ca: '+1',
                                gb: '+44',
                                au: '+61',
                                in: '+91',
                            };
                            setCountryCode(codes[val] || '+1');
                        }}
                        disabled={availableRegions.length === 0}
                    >
                        <SelectTrigger className="w-full bg-white border rounded-lg px-4 text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm h-11">
                            <SelectValue placeholder={availableRegions.length > 0 ? 'Select Region' : 'No regions configured'} />
                        </SelectTrigger>
                        <SelectContent>
                            {availableRegions.map(r => (
                                <SelectItem key={r.value} value={r.value}>
                                    <div className="flex items-center gap-2 font-medium">
                                        <span className="text-lg leading-none">{r.flag}</span> {r.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="mb-4">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                        Call From (Caller ID)
                    </label>
                    <Select
                        value={selectedCallerId}
                        onValueChange={setSelectedCallerId}
                        disabled={availableCallerIds.length === 0}
                    >
                        <SelectTrigger className="w-full bg-white border rounded-lg px-4 text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm h-11">
                            <SelectValue placeholder={availableCallerIds.length > 0 ? 'Select Number' : 'No numbers available'} />
                        </SelectTrigger>
                        <SelectContent>
                            {availableCallerIds.map((number: string) => (
                                <SelectItem key={number} value={number}>
                                    <div className="flex items-center gap-2 font-medium">
                                        {number}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="mb-5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                        Phone Number
                    </label>
                    <div className="flex gap-2">
                        <Input
                            value={countryCode}
                            onChange={e => setCountryCode(e.target.value)}
                            className="w-20 border-slate-200 text-center text-sm font-medium text-slate-700 shrink-0 h-11"
                            disabled={!!activeCall}
                        />
                        <div className="relative flex-1">
                            <Input
                                value={phoneNumber}
                                onChange={e => setPhoneNumber(e.target.value)}
                                placeholder="Enter number..."
                                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 h-11 text-base font-medium pr-10"
                                disabled={!!activeCall}
                            />
                            {phoneNumber && !activeCall && (
                                <button
                                    onClick={() => setPhoneNumber(prev => prev.slice(0, -1))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <IconBackspace size={20} stroke={1.75} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                    {dialpadKeys.map(key => (
                        <button
                            key={key}
                            disabled={!!activeCall}
                            onClick={() => handleKeyPress(key)}
                            className={`h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded text-xl font-normal flex items-center justify-center active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${key === '+' ? 'col-start-2' : ''}`}
                        >
                            {key}
                        </button>
                    ))}
                </div>

                <div className="pt-4 flex flex-col items-center gap-4 pb-2">
                    <div className="flex items-center gap-6">
                        {activeCall ? (
                            <>
                                <button
                                    onClick={toggleMute}
                                    className={`h-14 w-14 rounded-full border flex items-center justify-center transition-all active:scale-95 ${isMuted ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {isMuted ? (
                                        <IconMicrophoneOff size={20} stroke={1.75} />
                                    ) : (
                                        <IconMicrophone size={20} stroke={1.75} />
                                    )}
                                </button>

                                {activeCall.state === 'ringing' && isInboundActive ? (
                                    <>
                                        <button
                                            onClick={handleAnswer}
                                            className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-500 flex items-center justify-center text-white shadow-[0_4px_14px_rgba(22,163,74,0.3)] transition-all active:scale-95 animate-bounce"
                                        >
                                            <IconPhone size={24} stroke={1.75} />
                                        </button>
                                        <button
                                            onClick={handleHangup}
                                            className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white shadow-[0_4px_14px_rgba(220,38,38,0.3)] transition-all active:scale-95"
                                        >
                                            <IconPhoneOff size={24} stroke={1.75} />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleHangup}
                                        className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white shadow-[0_4px_14px_rgba(220,38,38,0.3)] transition-all active:scale-95 animate-pulse"
                                    >
                                        <IconPhoneOff size={24} stroke={1.75} />
                                    </button>
                                )}
                            </>
                        ) : (
                            <button
                                onClick={handleCall}
                                disabled={!isReady || !selectedCallerId}
                                className={`h-14 w-14 rounded-full flex items-center justify-center text-white shadow-[0_4px_14px_rgba(22,163,74,0.3)] transition-all active:scale-95 ${isReady && selectedCallerId ? 'bg-green-600 hover:bg-green-500' : 'bg-slate-300 cursor-not-allowed'}`}
                            >
                                <IconPhone size={24} stroke={1.75} />
                            </button>
                        )}
                    </div>
                </div>
                </div>
            </div>

            <div className="hidden min-h-0 flex-1 flex-col md:flex">
                <div className="flex h-full items-center justify-center">
                    <p className="text-slate-500 text-lg">Coming soon...</p>
                </div>
            </div>
        </div>
    );
}
