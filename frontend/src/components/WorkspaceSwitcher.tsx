'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { user, type WorkspaceSummary } from '@/requests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { IconChevronDown, IconLayersLinked } from '@tabler/icons-react';
import { useAuth } from '@/context/AuthContext';

function getDefaultWorkspace(workspaces: WorkspaceSummary[] = []) {
    return workspaces.find(workspace => workspace.isDefault) ?? workspaces[0];
}

export default function WorkspaceSwitcher() {
    const { profile } = useAuth();
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');

    const workspaces: WorkspaceSummary[] = profile?.workspaces ?? [];
    const activeWorkspace = getDefaultWorkspace(workspaces);
    const activeLabel = activeWorkspace?.name ?? 'Select workspace';
    const activeInitial = activeLabel.charAt(0).toUpperCase();

    const switchMutation = useMutation({
        mutationFn: (workspaceId: number) => user.switchWorkspace(workspaceId),
        onSuccess: () => {
            queryClient.invalidateQueries();
            window.location.reload();
        },
    });

    const createMutation = useMutation({
        mutationFn: (name: string) => user.createWorkspace({ name }),
        onSuccess: () => {
            setIsCreating(false);
            setNewName('');
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        },
    });

    const handleCreate = () => {
        const name = newName.trim();
        if (!name) return;
        createMutation.mutate(name);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-900 outline-none transition-colors hover:bg-neutral-50"
                >
                    <div className="flex min-w-0 items-center gap-2">
                        <div className="flex size-6 shrink-0 items-center justify-center rounded bg-[#492FA6]/10 text-[10px] font-bold text-[#492FA6]">
                            {activeInitial}
                        </div>
                        <span className="truncate">{activeLabel}</span>
                    </div>
                    <IconChevronDown size={16} stroke={1.75} className="shrink-0 text-neutral-400" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[220px]"
                align="start"
                sideOffset={8}
            >
                <DropdownMenuLabel className="text-xs text-neutral-500">Workspaces</DropdownMenuLabel>
                {workspaces.map(workspace => (
                    <DropdownMenuItem
                        key={workspace.id}
                        className={cn(
                            'flex cursor-pointer flex-col items-start gap-1 py-2',
                            workspace.isDefault && 'bg-[#492FA6]/10 text-[#492FA6]'
                        )}
                        onClick={() => switchMutation.mutate(workspace.id)}
                    >
                        <span className="font-medium">{workspace.name}</span>
                        <span className="text-xs text-neutral-500">{workspace.role}</span>
                    </DropdownMenuItem>
                ))}
                {workspaces.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-neutral-500">No workspaces</div>
                ) : null}
                {!isCreating ? (
                    <Button
                        variant="outline"
                        className="mt-1 w-full rounded-md"
                        onClick={e => {
                            e.preventDefault();
                            setIsCreating(true);
                        }}
                    >
                        <IconLayersLinked size={16} stroke={1.75} className="mr-2" />
                        Add workspace
                    </Button>
                ) : (
                    <div className="mt-1 w-full space-y-2 border-t border-neutral-100 pt-3">
                        <Input
                            placeholder="Workspace name"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            className="h-8 text-xs"
                            autoFocus
                            onKeyDown={e => {
                                if (e.key === 'Enter') handleCreate();
                            }}
                            onClick={e => e.preventDefault()}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs"
                                onClick={e => {
                                    e.preventDefault();
                                    setIsCreating(false);
                                    setNewName('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                className="h-8 bg-[#492FA6] text-xs text-white hover:bg-[#492FA6]/90"
                                onClick={e => {
                                    e.preventDefault();
                                    handleCreate();
                                }}
                                disabled={!newName.trim() || createMutation.isPending}
                            >
                                Create
                            </Button>
                        </div>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
