'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settings } from '@/requests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toastError, toastSuccess } from '@/helpers';
import { IconLoader2, IconPlus } from '@tabler/icons-react';
import CountryPhoneRow from '@/components/settings/CountryPhoneRow';
import {
    entriesToPhoneRecords,
    phoneRecordsToEntries,
    type PhoneEntry,
} from '@/constants/telnyxRegions';
import Loading from '../Loading';

function newPhoneEntry(country = 'us', number = ''): PhoneEntry {
    return { id: crypto.randomUUID(), country, number };
}

export default function TelnyxConfigSection() {
    const queryClient = useQueryClient();
    const [apiKey, setApiKey] = useState('');
    const [connectionId, setConnectionId] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [publicKey, setPublicKey] = useState('');
    const [smsEntries, setSmsEntries] = useState<PhoneEntry[]>([newPhoneEntry()]);
    const [callerIdEntries, setCallerIdEntries] = useState<PhoneEntry[]>([newPhoneEntry()]);

    const { data: telnyxConfig, isLoading } = useQuery({
        queryKey: ['telnyx-config'],
        queryFn: () => settings.getTelnyxConfig(),
        retry: 1,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (!telnyxConfig?.configured) return;

        setConnectionId(telnyxConfig.connectionId ?? '');
        setUsername(telnyxConfig.username ?? '');

        const sms = phoneRecordsToEntries(telnyxConfig.smsNumbers);
        setSmsEntries(sms.length > 0 ? sms : [newPhoneEntry()]);

        const callerIds = phoneRecordsToEntries(telnyxConfig.callerIds);
        setCallerIdEntries(callerIds.length > 0 ? callerIds : [newPhoneEntry()]);
    }, [telnyxConfig]);

    const saveMutation = useMutation({
        mutationFn: settings.saveTelnyxConfig,
        onSuccess: () => {
            toastSuccess('Telnyx configuration saved.');
            queryClient.invalidateQueries({ queryKey: ['telnyx-config'] });
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            setApiKey('');
            setPassword('');
            setPublicKey('');
        },
        onError: error => toastError(error),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const needsSecrets = !telnyxConfig?.configured;
        if (needsSecrets && (!apiKey || !password || !publicKey)) {
            toastError(new Error('API key, password, and public key are required for first-time setup.'));
            return;
        }

        const smsNumbers = entriesToPhoneRecords(smsEntries);
        const callerIds = entriesToPhoneRecords(callerIdEntries);

        if (!connectionId || !username || smsNumbers.length === 0) {
            toastError(new Error('Connection ID, username, and at least one SMS number are required.'));
            return;
        }

        const primarySms = smsNumbers[0];

        saveMutation.mutate({
            apiKey: apiKey || 'unchanged',
            connectionId,
            username,
            password: password || 'unchanged',
            publicKey: publicKey || 'unchanged',
            smsNumbers,
            callerIds:
                callerIds.length > 0
                    ? callerIds
                    : [{ ...primarySms, number: primarySms.number }],
        });
    };

    const addSmsEntry = () => setSmsEntries(prev => [...prev, newPhoneEntry()]);
    const updateSmsEntry = (id: string, patch: Partial<PhoneEntry>) => {
        setSmsEntries(prev => prev.map(entry => (entry.id === id ? { ...entry, ...patch } : entry)));
    };
    const removeSmsEntry = (id: string) => {
        setSmsEntries(prev => (prev.length === 1 ? prev : prev.filter(entry => entry.id !== id)));
    };

    const addCallerId = () => setCallerIdEntries(prev => [...prev, newPhoneEntry()]);
    const updateCallerId = (id: string, patch: Partial<PhoneEntry>) => {
        setCallerIdEntries(prev => prev.map(entry => (entry.id === id ? { ...entry, ...patch } : entry)));
    };
    const removeCallerId = (id: string) => {
        setCallerIdEntries(prev => (prev.length === 1 ? prev : prev.filter(entry => entry.id !== id)));
    };

    if (isLoading) {
        return null;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-semibold text-neutral-900">API & Connection</h3>
                    <p className="mt-0.5 text-sm text-neutral-500">Telnyx API credentials and SIP connection.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="apiKey">API Key</Label>
                        <Input
                            id="apiKey"
                            type="password"
                            placeholder={telnyxConfig?.hasApiKey ? 'Saved (enter to replace)' : 'KEY...'}
                            value={apiKey}
                            onChange={e => setApiKey(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="connectionId">Connection ID</Label>
                        <Input
                            id="connectionId"
                            value={connectionId}
                            onChange={e => setConnectionId(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="publicKey">Webhook Public Key</Label>
                        <Input
                            id="publicKey"
                            type="password"
                            placeholder={telnyxConfig?.hasPublicKey ? 'Saved (enter to replace)' : 'Public key'}
                            value={publicKey}
                            onChange={e => setPublicKey(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="username">SIP Username</Label>
                        <Input
                            id="username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">SIP Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder={telnyxConfig?.hasPassword ? 'Saved (enter to replace)' : 'Password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-2">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900">SMS</h3>
                        <p className="mt-0.5 text-sm text-neutral-500">
                            Outbound SMS sender numbers by country. Add multiple numbers per region.
                        </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={addSmsEntry}>
                        <IconPlus size={16} stroke={1.75} />
                        Add number
                    </Button>
                </div>

                <div className="space-y-3">
                    {smsEntries.map(entry => (
                        <CountryPhoneRow
                            key={entry.id}
                            country={entry.country}
                            number={entry.number}
                            onCountryChange={country => updateSmsEntry(entry.id, { country })}
                            onNumberChange={number => updateSmsEntry(entry.id, { number })}
                            onRemove={() => removeSmsEntry(entry.id)}
                            showRemove={smsEntries.length > 1}
                        />
                    ))}
                </div>
            </div>

            <div className="space-y-4 pt-2">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900">Caller IDs</h3>
                        <p className="mt-0.5 text-sm text-neutral-500">
                            Outbound caller ID numbers per country. Add multiple numbers per region.
                        </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={addCallerId}>
                        <IconPlus size={16} stroke={1.75} />
                        Add number
                    </Button>
                </div>

                <div className="space-y-3">
                    {callerIdEntries.map(entry => (
                        <CountryPhoneRow
                            key={entry.id}
                            country={entry.country}
                            number={entry.number}
                            onCountryChange={country => updateCallerId(entry.id, { country })}
                            onNumberChange={number => updateCallerId(entry.id, { number })}
                            onRemove={() => removeCallerId(entry.id)}
                            showRemove={callerIdEntries.length > 1}
                        />
                    ))}
                </div>
            </div>

            <div className="flex justify-end border-t border-neutral-100 pt-4">
                <Button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="bg-[#492FA6] hover:bg-[#492FA6]/90 text-white"
                >
                    {saveMutation.isPending
                        ? 'Saving...'
                        : telnyxConfig?.configured
                          ? 'Update Telnyx'
                          : 'Save Telnyx'}
                </Button>
            </div>
        </form>
    );
}
