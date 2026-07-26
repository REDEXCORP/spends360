'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { spendRequests, type SpendRequest } from '@/requests';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toastError, toastSuccess } from '@/helpers';
import { cn } from '@/lib/utils';
import { IconLoader2, IconMessagePlus, IconSend } from '@tabler/icons-react';

function formatWhen(value: string | null | undefined) {
    if (!value) return '';
    return new Date(value).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function initials(email: string) {
    const local = email.split('@')[0] ?? 'U';
    return local.slice(0, 2).toUpperCase();
}

export default function RequestComments({ request }: { request: SpendRequest }) {
    const { profile } = useAuth();
    const queryClient = useQueryClient();
    const [body, setBody] = useState('');

    const commentMutation = useMutation({
        mutationFn: spendRequests.addComment,
        onSuccess: () => {
            toastSuccess('Comment added.');
            setBody('');
            queryClient.invalidateQueries({ queryKey: ['request-detail', request.id] });
            queryClient.invalidateQueries({ queryKey: ['my-approvals'] });
            queryClient.invalidateQueries({ queryKey: ['my-requests'] });
        },
        onError: error => toastError(error),
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!body.trim()) return;
        commentMutation.mutate({ requestId: request.id, body: body.trim() });
    };

    return (
        <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="mb-4 flex items-center gap-2">
                <IconMessagePlus size={16} stroke={1.75} className="text-[#492FA6]" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                    Comments
                </h3>
            </div>

            <div className="space-y-4">
                {(request.comments ?? []).length === 0 ? (
                    <p className="rounded-lg border border-dashed border-neutral-200 px-3 py-6 text-center text-sm text-neutral-500 dark:border-neutral-800">
                        No comments yet. Start the conversation.
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {(request.comments ?? []).map(comment => {
                            const mine = comment.authorId === profile?.id;
                            return (
                                <li
                                    key={comment.id}
                                    className={cn(
                                        'rounded-lg border px-3 py-3',
                                        mine
                                            ? 'border-[#492FA6]/20 bg-[#492FA6]/5'
                                            : 'border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900'
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#492FA6]/10 text-xs font-semibold text-[#492FA6]">
                                            {initials(comment.authorEmail)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                                                    {comment.authorEmail}
                                                </p>
                                                <span className="text-xs text-neutral-400">
                                                    {formatWhen(comment.createdAt)}
                                                </span>
                                            </div>
                                            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                                                {comment.body}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <Textarea
                        value={body}
                        onChange={event => setBody(event.target.value)}
                        placeholder="Write a comment for the requester or approvers..."
                        className="min-h-24"
                    />
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={!body.trim() || commentMutation.isPending}
                            className="gap-2 bg-[#492FA6] text-white hover:bg-[#492FA6]/90"
                        >
                            {commentMutation.isPending ? (
                                <IconLoader2 size={16} stroke={1.75} className="animate-spin" />
                            ) : (
                                <IconSend size={16} stroke={1.75} />
                            )}
                            Post comment
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
