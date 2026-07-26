'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { spendRequests, user, type RequestPriority } from '@/requests';
import { currencyOptions } from '@/constants/requestTypes';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toastError, toastSuccess } from '@/helpers';
import { IconArrowLeft, IconGripVertical, IconLoader2, IconPlus, IconX } from '@tabler/icons-react';

type WorkspaceMember = {
    id: number;
    email: string;
    role: 'ADMIN' | 'USER';
    inviteAccepted: boolean;
};

const priorityOptions: { value: RequestPriority; label: string }[] = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
];

export default function NewRequestPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { profile } = useAuth();

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [priority, setPriority] = useState<RequestPriority>('MEDIUM');
    const [dueDate, setDueDate] = useState('');
    const [description, setDescription] = useState('');
    const [justification, setJustification] = useState('');
    const [approverIds, setApproverIds] = useState<number[]>([]);
    const [approverToAdd, setApproverToAdd] = useState('');
    const [assigneeId, setAssigneeId] = useState('');

    const { data: members = [] } = useQuery({
        queryKey: ['users-list'],
        queryFn: () => user.list() as Promise<WorkspaceMember[]>,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const activeMembers = useMemo(
        () => members.filter(member => member.inviteAccepted),
        [members]
    );
    const membersById = useMemo(
        () => new Map(activeMembers.map(member => [member.id, member])),
        [activeMembers]
    );
    const availableApprovers = activeMembers.filter(
        member => !approverIds.includes(member.id) && member.id !== profile?.id
    );

    const createMutation = useMutation({
        mutationFn: spendRequests.create,
        onSuccess: () => {
            toastSuccess('Request submitted for approval.');
            queryClient.invalidateQueries({ queryKey: ['my-requests'] });
            queryClient.invalidateQueries({ queryKey: ['my-approvals'] });
            router.push('/my-requests');
        },
        onError: error => toastError(error),
    });

    const addApprover = () => {
        const id = Number(approverToAdd);
        if (!id || approverIds.includes(id)) return;
        setApproverIds(prev => [...prev, id]);
        setApproverToAdd('');
    };

    const removeApprover = (id: number) => {
        setApproverIds(prev => prev.filter(approverId => approverId !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        if (approverIds.length === 0) {
            toastError({ message: 'Add at least one approver.' });
            return;
        }

        createMutation.mutate({
            title: title.trim(),
            amount: amount ? Number(amount) : undefined,
            currency,
            priority,
            dueDate: dueDate || undefined,
            description: description.trim() || undefined,
            justification: justification.trim() || undefined,
            approverIds,
            assigneeId: assigneeId ? Number(assigneeId) : undefined,
        });
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex items-center gap-3">
                <Button asChild variant="ghost" size="icon" className="size-9 shrink-0">
                    <Link href="/my-requests">
                        <IconArrowLeft size={18} stroke={1.75} />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                        New request
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Describe what you need and choose who approves it.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                        Request details
                    </h2>

                    <div className="space-y-2">
                        <Label htmlFor="request-title">Title</Label>
                        <Input
                            id="request-title"
                            placeholder="e.g. Cursor Pro for 6 developers"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="request-amount">Amount</Label>
                            <Input
                                id="request-amount"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Currency</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {currencyOptions.map(option => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select
                                value={priority}
                                onValueChange={value => setPriority(value as RequestPriority)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {priorityOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="request-due-date">Needed by</Label>
                            <Input
                                id="request-due-date"
                                type="date"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="request-description">Description</Label>
                        <Textarea
                            id="request-description"
                            placeholder="What exactly do you need?"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="request-justification">Business justification</Label>
                        <Textarea
                            id="request-justification"
                            placeholder="Why does the company need this?"
                            value={justification}
                            onChange={e => setJustification(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
                    <div>
                        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                            Approval chain
                        </h2>
                        <p className="mt-1 text-xs text-neutral-500">
                            Approvers review in the order you add them. Add as many as you need.
                        </p>
                    </div>

                    {approverIds.length > 0 ? (
                        <ol className="space-y-2">
                            {approverIds.map((approverId, index) => (
                                <li
                                    key={approverId}
                                    className="flex items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800"
                                >
                                    <IconGripVertical
                                        size={16}
                                        stroke={1.75}
                                        className="shrink-0 text-neutral-300"
                                    />
                                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#492FA6]/10 text-xs font-semibold text-[#492FA6]">
                                        {index + 1}
                                    </span>
                                    <span className="min-w-0 flex-1 truncate text-sm text-neutral-900 dark:text-neutral-50">
                                        {membersById.get(approverId)?.email ?? `User #${approverId}`}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-7 shrink-0 text-neutral-400 hover:text-red-600"
                                        onClick={() => removeApprover(approverId)}
                                    >
                                        <IconX size={14} stroke={1.75} />
                                    </Button>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <p className="rounded-lg border border-dashed border-neutral-200 px-3 py-4 text-center text-sm text-neutral-500 dark:border-neutral-800">
                            No approvers yet. Add at least one.
                        </p>
                    )}

                    <div className="flex gap-2">
                        <Select value={approverToAdd} onValueChange={setApproverToAdd}>
                            <SelectTrigger className="w-full flex-1">
                                <SelectValue placeholder="Select a teammate" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableApprovers.length === 0 ? (
                                    <p className="px-3 py-2 text-sm text-neutral-500">
                                        No more teammates to add
                                    </p>
                                ) : (
                                    availableApprovers.map(member => (
                                        <SelectItem key={member.id} value={String(member.id)}>
                                            {member.email}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        <Button
                            type="button"
                            variant="outline"
                            className="shrink-0 gap-1.5"
                            disabled={!approverToAdd}
                            onClick={addApprover}
                        >
                            <IconPlus size={16} stroke={1.75} />
                            Add approver
                        </Button>
                    </div>
                </div>

                <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
                    <div>
                        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                            Assign to
                        </h2>
                        <p className="mt-1 text-xs text-neutral-500">
                            Who takes care of this once it&apos;s approved? Optional.
                        </p>
                    </div>
                    <Select value={assigneeId} onValueChange={setAssigneeId}>
                        <SelectTrigger className="w-full sm:w-[320px]">
                            <SelectValue placeholder="Select a teammate (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                            {activeMembers.map(member => (
                                <SelectItem key={member.id} value={String(member.id)}>
                                    {member.email}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex justify-end gap-3">
                    <Button asChild type="button" variant="outline">
                        <Link href="/my-requests">Cancel</Link>
                    </Button>
                    <Button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="min-w-[150px] bg-[#492FA6] text-white hover:bg-[#492FA6]/90"
                    >
                        {createMutation.isPending ? (
                            <IconLoader2 size={16} stroke={1.75} className="animate-spin" />
                        ) : (
                            'Submit request'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
