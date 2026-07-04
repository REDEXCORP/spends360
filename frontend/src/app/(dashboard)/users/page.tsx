'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { user } from '@/requests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toastError, toastSuccess } from '@/helpers';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
    IconCircleCheck,
    IconClock,
    IconLoader2,
    IconMail,
    IconPlus,
    IconShield,
    IconTrash,
    IconUsers,
    IconUser,
} from '@tabler/icons-react';

type WorkspaceMember = {
    id: number;
    email: string;
    role: 'ADMIN' | 'USER';
    inviteAccepted: boolean;
    joinedAt?: string | null;
    createdAt?: string | null;
};

function getMemberInitials(email: string) {
    const localPart = email.split('@')[0] ?? '';
    const letters = localPart.replace(/[^a-zA-Z0-9]/g, '');
    if (letters.length >= 2) return letters.slice(0, 2).toUpperCase();
    if (letters.length === 1) return letters.toUpperCase();
    return (email[0] ?? 'U').toUpperCase();
}

function formatJoinedDate(member: WorkspaceMember) {
    const dateValue = member.joinedAt ?? member.createdAt;
    if (!dateValue) return '—';

    return new Date(dateValue).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatRole(role: WorkspaceMember['role']) {
    return role === 'ADMIN' ? 'Admin' : 'User';
}

export default function UsersPage() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<WorkspaceMember | null>(null);
    const [emailInput, setEmailInput] = useState('');
    const [roleInput, setRoleInput] = useState<'ADMIN' | 'USER'>('USER');

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['users-list'],
        queryFn: () => user.list() as Promise<WorkspaceMember[]>,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const createUserMutation = useMutation({
        mutationFn: user.create,
        onSuccess: () => {
            toastSuccess('Invitation sent. They must accept the invite to join this workspace.');
            queryClient.invalidateQueries({ queryKey: ['users-list'] });
            setEmailInput('');
            setRoleInput('USER');
            setIsDialogOpen(false);
        },
        onError: error => toastError(error),
    });

    const removeMemberMutation = useMutation({
        mutationFn: user.remove,
        onSuccess: () => {
            toastSuccess('Member removed from this workspace.');
            queryClient.invalidateQueries({ queryKey: ['users-list'] });
            setMemberToRemove(null);
        },
        onError: error => toastError(error),
    });

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailInput) return;
        createUserMutation.mutate({
            email: emailInput,
            role: roleInput,
        });
    };

    const inviteDialog = (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button className="shrink-0 gap-2 bg-[#492FA6] text-white hover:bg-[#492FA6]/90">
                    <IconPlus size={16} stroke={1.75} />
                    Invite member
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto bg-white sm:max-w-md dark:bg-zinc-950">
                <DialogHeader>
                    <DialogTitle>Invite member</DialogTitle>
                    <DialogDescription>
                        Send an email invitation to add someone to this workspace.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateUser} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <div className="relative">
                            <Input
                                id="email"
                                type="email"
                                placeholder="colleague@company.com"
                                value={emailInput}
                                onChange={e => setEmailInput(e.target.value)}
                                className="h-11 pl-10"
                                required
                            />
                            <IconMail
                                size={16}
                                stroke={1.75}
                                className="absolute left-3.5 top-3.5 text-muted-foreground"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Role</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRoleInput('USER')}
                                className={cn(
                                    'flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all',
                                    roleInput === 'USER'
                                        ? 'border-[#492FA6] bg-[#492FA6]/10 text-[#492FA6]'
                                        : 'border-border hover:bg-muted'
                                )}
                            >
                                <IconUser size={16} stroke={1.75} />
                                User
                            </button>
                            <button
                                type="button"
                                onClick={() => setRoleInput('ADMIN')}
                                className={cn(
                                    'flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all',
                                    roleInput === 'ADMIN'
                                        ? 'border-[#492FA6] bg-[#492FA6]/10 text-[#492FA6]'
                                        : 'border-border hover:bg-muted'
                                )}
                            >
                                <IconShield size={16} stroke={1.75} />
                                Admin
                            </button>
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createUserMutation.isPending}
                            className="min-w-[120px] bg-[#492FA6] text-white hover:bg-[#492FA6]/90"
                        >
                            {createUserMutation.isPending ? (
                                <IconLoader2 size={16} stroke={1.75} className="animate-spin" />
                            ) : (
                                'Send invite'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Team</h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        {isLoading
                            ? 'Loading workspace members...'
                            : `${users.length} member${users.length === 1 ? '' : 's'} in this workspace`}
                    </p>
                </div>
                {inviteDialog}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center rounded border border-neutral-200 bg-white py-16 dark:border-neutral-800 dark:bg-neutral-950">
                    <IconLoader2 className="h-5 w-5 animate-spin text-neutral-500" />
                </div>
            ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded border border-dashed border-neutral-200 bg-white px-6 py-16 text-center dark:border-neutral-800 dark:bg-neutral-950">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#492FA6]/10 text-[#492FA6]">
                        <IconUsers size={28} stroke={1.75} />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">No members yet</h3>
                    <p className="mt-1 max-w-md text-sm text-neutral-500">
                        Invite teammates to collaborate in this workspace.
                    </p>
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        className="mt-6 gap-2 bg-[#492FA6] text-white hover:bg-[#492FA6]/90"
                    >
                        <IconPlus size={16} stroke={1.75} />
                        Invite your first member
                    </Button>
                </div>
            ) : (
                <div className="overflow-hidden rounded border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-neutral-50/80 hover:bg-neutral-50/80 dark:bg-neutral-900/50">
                                    <TableHead className="px-6">Member</TableHead>
                                    <TableHead className="px-6">Role</TableHead>
                                    <TableHead className="px-6">Status</TableHead>
                                    <TableHead className="px-6">Joined</TableHead>
                                    <TableHead className="px-6 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map(member => {
                                    return (
                                        <TableRow key={member.id}>
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-10 shrink-0 items-center justify-center rounded bg-[#492FA6]/10 text-sm font-semibold text-[#492FA6]">
                                                        {getMemberInitials(member.email)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-50">
                                                            {member.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium',
                                                        member.role === 'ADMIN'
                                                            ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300'
                                                            : 'border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300'
                                                    )}
                                                >
                                                    {member.role === 'ADMIN' ? (
                                                        <IconShield size={12} stroke={1.75} />
                                                    ) : (
                                                        <IconUser size={12} stroke={1.75} />
                                                    )}
                                                    {formatRole(member.role)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium',
                                                        member.inviteAccepted
                                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                            : 'border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400'
                                                    )}
                                                >
                                                    {member.inviteAccepted ? (
                                                        <IconCircleCheck size={12} stroke={1.75} />
                                                    ) : (
                                                        <IconClock size={12} stroke={1.75} />
                                                    )}
                                                    {member.inviteAccepted ? 'Active' : 'Pending'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-sm text-neutral-500">
                                                {formatJoinedDate(member)}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                                                    onClick={() => setMemberToRemove(member)}
                                                >
                                                    <IconTrash size={14} stroke={1.75} />
                                                    Remove
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            <AlertDialog open={!!memberToRemove} onOpenChange={open => !open && setMemberToRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove member?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {memberToRemove
                                ? `${memberToRemove.email} will lose access to this workspace. You can invite them again later.`
                                : ''}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={removeMemberMutation.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700"
                            disabled={removeMemberMutation.isPending}
                            onClick={() => {
                                if (memberToRemove) {
                                    removeMemberMutation.mutate(memberToRemove.id);
                                }
                            }}
                        >
                            {removeMemberMutation.isPending ? (
                                <IconLoader2 size={16} stroke={1.75} className="animate-spin" />
                            ) : (
                                'Remove member'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
