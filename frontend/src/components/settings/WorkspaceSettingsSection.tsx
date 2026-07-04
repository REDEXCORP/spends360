'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { user, type WorkspaceSummary } from '@/requests';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toastError, toastSuccess } from '@/helpers';
import { IconLoader2, IconTrash } from '@tabler/icons-react';

function getActiveWorkspace(workspaces: WorkspaceSummary[] = []) {
    return workspaces.find(workspace => workspace.isDefault) ?? workspaces[0];
}

export default function WorkspaceSettingsSection() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { profile } = useAuth();
    const workspaces: WorkspaceSummary[] = profile?.workspaces ?? [];
    const activeWorkspace = getActiveWorkspace(workspaces);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmName, setConfirmName] = useState('');

    const deleteMutation = useMutation({
        mutationFn: user.deleteWorkspace,
        onSuccess: () => {
            toastSuccess('Workspace deleted.');
            setConfirmOpen(false);
            setConfirmName('');
            queryClient.invalidateQueries();
            router.push('/settings');
            window.location.reload();
        },
        onError: error => toastError(error),
    });

    if (!activeWorkspace) {
        return <p className="text-sm text-neutral-500">No active workspace found.</p>;
    }

    const canDelete = confirmName.trim() === activeWorkspace.name;

    return (
        <div className="space-y-8">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Current workspace</p>
                <p className="mt-1 text-base font-semibold text-neutral-900">{activeWorkspace.name}</p>
                <p className="mt-1 text-sm text-neutral-500">
                    Plan: {activeWorkspace.plan ?? 'FREE'} · Role: {activeWorkspace.role === 'ADMIN' ? 'Admin' : 'User'}
                </p>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50/40 p-5">
                <h3 className="text-sm font-semibold text-red-900">Danger zone</h3>
                <p className="mt-2 max-w-2xl text-sm text-red-800/80">
                    Deleting this workspace permanently removes all members, leads, calls, and settings tied
                    to it. This action cannot be undone.
                </p>
                <Button
                    type="button"
                    variant="outline"
                    className="mt-4 border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800"
                    onClick={() => setConfirmOpen(true)}
                >
                    <IconTrash size={16} stroke={1.75} className="mr-2" />
                    Delete workspace
                </Button>
            </div>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <strong>{activeWorkspace.name}</strong> and all of its
                            data. Type the workspace name below to confirm.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-2 py-2">
                        <Label htmlFor="confirm-workspace-name">Workspace name</Label>
                        <Input
                            id="confirm-workspace-name"
                            value={confirmName}
                            onChange={e => setConfirmName(e.target.value)}
                            placeholder={activeWorkspace.name}
                            autoComplete="off"
                        />
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
                        <Button
                            type="button"
                            disabled={!canDelete || deleteMutation.isPending}
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={() => deleteMutation.mutate(activeWorkspace.id)}
                        >
                            {deleteMutation.isPending ? (
                                <IconLoader2 size={16} stroke={1.75} className="animate-spin" />
                            ) : (
                                'Delete workspace'
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
