'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { IconLogout } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/requests';

export default function UserMenu() {
    const { profile } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    const displayName = profile?.email?.split('@')[0] || 'User';
    const initial = (profile?.email || 'U').charAt(0).toUpperCase();

    const logoutMutation = useMutation({
        mutationFn: () => auth.logout(),
        onSuccess: () => {
            queryClient.clear();
            router.push('/login');
        },
    });

    return (
        <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50/80 px-3 py-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#492FA6]/15 text-xs font-semibold text-[#492FA6]">
                {initial}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-900">{displayName}</p>
                <p className="truncate text-[11px] text-neutral-500">{profile?.email}</p>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-neutral-500 hover:text-red-600"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                title="Logout"
            >
                <IconLogout size={16} stroke={1.75} />
            </Button>
        </div>
    );
}
