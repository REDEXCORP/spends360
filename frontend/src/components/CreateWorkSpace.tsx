'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { user } from '@/requests';
import { Layers } from 'lucide-react';

export default function CreateWorkSpace() {
    const [workspaceName, setWorkspaceName] = useState('');
    const queryClient = useQueryClient();

    const createWorkspaceMutation = useMutation({
        mutationFn: (name: string) => user.createWorkspace(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        },
    });

    const handleCreate = () => {
        if (!workspaceName.trim()) return;
        createWorkspaceMutation.mutate(workspaceName.trim());
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4">
            <div className="w-full max-w-md flex flex-col items-center gap-6 text-center">
                <div>
                    <h1 className="text-2xl font-bold">Create your Workspace</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        You don't have any workspaces yet. Create one to get started.
                    </p>
                </div>

                <div className="flex flex-col gap-4 w-full">
                    <Input
                        placeholder="e.g. Acme Corp"
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
                        disabled={!workspaceName.trim() || createWorkspaceMutation.isPending}
                        className="h-12 w-full text-base"
                    >
                        {createWorkspaceMutation.isPending ? 'Creating...' : 'Create Workspace'}
                    </Button>
                </div>

            </div>
        </div>
    );
}