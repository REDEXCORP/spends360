'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CircleCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { user } from '@/requests';
import { toastError } from '@/helpers';
import { buildRegisterUrl, needsAccountSetup, type InviteDetails } from '@/helpers/invite';

const panelClassName = 'mx-auto w-full max-w-md p-8 text-center';
const primaryButtonClassName = 'mt-6 h-11 w-full bg-[#492FA6] text-white hover:bg-[#492FA6]/90';

function InvitePanel({ children }: { children: React.ReactNode }) {
    return <div className={panelClassName}>{children}</div>;
}

function InviteSummary({ invite }: { invite: InviteDetails }) {
    return (
        <p className="mt-4 text-sm text-muted-foreground">
            You have been invited to join <strong>{invite.workspaceName}</strong> as a{' '}
            <strong>{invite.role}</strong>.
        </p>
    );
}

export default function InviteAcceptClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [accepted, setAccepted] = useState(false);

    const inviteQuery = useQuery({
        queryKey: ['invite-details', token],
        queryFn: () => user.getInviteDetails(token!),
        enabled: !!token,
        retry: false,
    });

    const acceptMutation = useMutation({
        mutationFn: user.acceptInvite,
        onSuccess: () => setAccepted(true),
        onError: (error: unknown) => toastError(error),
    });

    useEffect(() => {
        if (!accepted) return;
        const timer = setTimeout(() => router.push('/login'), 2000);
        return () => clearTimeout(timer);
    }, [accepted, router]);

    if (!token) {
        return (
            <InvitePanel>
                <p className="mt-4 text-sm text-muted-foreground">Missing invitation token.</p>
            </InvitePanel>
        );
    }

    if (inviteQuery.isLoading) {
        return (
            <InvitePanel>
                <Loader2 className="mx-auto mt-6 h-8 w-8 animate-spin text-[#492FA6]" />
            </InvitePanel>
        );
    }

    if (inviteQuery.isError || !inviteQuery.data) {
        return (
            <InvitePanel>
                <p className="mt-4 text-sm text-muted-foreground">
                    This invitation link is invalid or has expired.
                </p>
            </InvitePanel>
        );
    }

    const invite = inviteQuery.data;

    if (accepted || invite.inviteAccepted) {
        return (
            <InvitePanel>
                <div className="mt-6 flex flex-col items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                        <CircleCheck className="h-10 w-10 text-green-600 dark:text-green-400" strokeWidth={1.75} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        You can now access <strong>{invite.workspaceName}</strong>. Redirecting to sign in...
                    </p>
                    <Link href="/login" className="text-sm text-[#492FA6] hover:underline">
                        Go to sign in
                    </Link>
                </div>
            </InvitePanel>
        );
    }

    if (needsAccountSetup(invite)) {
        return (
            <InvitePanel>
                <InviteSummary invite={invite} />
                <p className="mt-4 text-sm text-muted-foreground">
                    Please create an account with <strong>{invite.email}</strong> before accepting this
                    invitation.
                </p>
                <Button asChild className={primaryButtonClassName}>
                    <Link href={buildRegisterUrl(invite.email)}>Create account</Link>
                </Button>
                <p className="mt-4 text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary hover:underline">
                        Sign in
                    </Link>
                </p>
            </InvitePanel>
        );
    }

    return (
        <InvitePanel>
            <InviteSummary invite={invite} />
            <p className="mt-2 text-sm text-muted-foreground">
                Signed in as <strong>{invite.email}</strong>
            </p>
            <Button
                onClick={() => acceptMutation.mutate(token)}
                disabled={acceptMutation.isPending}
                className={primaryButtonClassName}
            >
                {acceptMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    'Accept invitation'
                )}
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
                Not you?{' '}
                <Link href="/login" className="text-primary hover:underline">
                    Sign in with a different account
                </Link>
            </p>
        </InvitePanel>
    );
}
