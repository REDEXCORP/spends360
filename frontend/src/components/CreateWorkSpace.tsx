'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { user } from '@/requests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconLayersLinked } from '@tabler/icons-react';

export default function CreateWorkSpace() {
    const [workspaceName, setWorkspaceName] = useState('');
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (name: string) => user.createWorkspace({ name }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        },
    });

    const handleCreate = () => {
        const name = workspaceName.trim();
        if (!name) return;
        createMutation.mutate(name);
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4">
            <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-[#492FA6]/10 text-[#492FA6]">
                    <IconLayersLinked size={32} stroke={1.5} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Create your workspace</h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        You don&apos;t have a workspace yet. Create one to get started.
                    </p>
                </div>

                <div className="flex w-full flex-col gap-4">
                    <Input
                        placeholder="e.g. Acme Sales Team"
                        value={workspaceName}
                        onChange={e => setWorkspaceName(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') handleCreate();
                        }}
                        autoFocus
                        className="h-12 text-center text-lg"
                    />

                    <Button
                        onClick={handleCreate}
                        disabled={!workspaceName.trim() || createMutation.isPending}
                        className="h-12 w-full bg-[#492FA6] text-base text-white hover:bg-[#492FA6]/90"
                    >
                        {createMutation.isPending ? 'Creating...' : 'Create workspace'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
