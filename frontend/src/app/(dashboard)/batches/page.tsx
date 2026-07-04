'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { batches, type CreateBatchBody } from '@/requests';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/components/ui/tag-input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toastError, toastSuccess } from '@/helpers';
import { IconFolderPlus, IconLayersLinked, IconLoader2, IconPlus } from '@tabler/icons-react';

export default function BatchesPage() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [form, setForm] = useState<CreateBatchBody>({
        name: '',
        description: '',
        tags: [],
    });

    const { data: batchList = [], isLoading } = useQuery({
        queryKey: ['batches-list'],
        queryFn: () => batches.list(),
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const createMutation = useMutation({
        mutationFn: batches.create,
        onSuccess: () => {
            toastSuccess('Batch created.');
            queryClient.invalidateQueries({ queryKey: ['batches-list'] });
            setForm({ name: '', description: '', tags: [] });
            setIsDialogOpen(false);
        },
        onError: error => toastError(error),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name?.trim()) return;

        createMutation.mutate({
            name: form.name.trim(),
            description: form.description?.trim() || undefined,
            tags: form.tags?.length ? form.tags : undefined,
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-bold text-neutral-900">Batches</h1>
                        {!isLoading && batchList.length > 0 ? (
                            <Badge variant="outline" className="border-neutral-200 text-neutral-600">
                                {batchList.length}
                            </Badge>
                        ) : null}
                    </div>
                    <p className="mt-1 text-sm text-neutral-500">
                        Group prospects into named batches with tags before assigning leads.
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="shrink-0 gap-2 bg-[#492FA6] text-white hover:bg-[#492FA6]/90">
                            <IconPlus size={16} stroke={1.75} />
                            Create Batch
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto bg-white sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Create batch</DialogTitle>
                            <DialogDescription>
                                Name a lead group and add tags to organize your outreach.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="batch-name">Batch name *</Label>
                                <Input
                                    id="batch-name"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="Q2 Enterprise Outreach"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="batch-description">Description</Label>
                                <Textarea
                                    id="batch-description"
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Who is in this batch, campaign goal, or notes for your team..."
                                    rows={4}
                                    className="min-h-[100px] resize-y"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Tags</Label>
                                <TagInput
                                    value={form.tags ?? []}
                                    onChange={tags => setForm(f => ({ ...f, tags }))}
                                    placeholder="Type a tag and press Enter"
                                />
                                <p className="text-xs text-neutral-500">
                                    Press Enter or comma to add a tag. Backspace removes the last tag.
                                </p>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="bg-[#492FA6] text-white hover:bg-[#492FA6]/90"
                                >
                                    {createMutation.isPending ? (
                                        <IconLoader2 size={16} className="animate-spin" />
                                    ) : (
                                        'Create Batch'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center rounded-xl border border-neutral-200 bg-white py-16">
                    <IconLoader2 className="h-5 w-5 animate-spin text-neutral-500" />
                </div>
            ) : batchList.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-white px-6 py-16 text-center">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#492FA6]/10 text-[#492FA6]">
                        <IconFolderPlus size={28} stroke={1.75} />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">No batches yet</h3>
                    <p className="mt-1 max-w-md text-sm text-neutral-500">
                        Create a batch to group leads before assigning products and pilots.
                    </p>
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        className="mt-6 gap-2 bg-[#492FA6] text-white hover:bg-[#492FA6]/90"
                    >
                        <IconPlus size={16} stroke={1.75} />
                        Create your first batch
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {batchList.map(batch => (
                        <div
                            key={batch.id}
                            className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate font-semibold text-neutral-900">{batch.name}</h3>
                                    {batch.description ? (
                                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-600">
                                            {batch.description}
                                        </p>
                                    ) : (
                                        <p className="mt-2 text-sm text-neutral-400">No description</p>
                                    )}
                                </div>
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#492FA6]/10 text-[#492FA6]">
                                    <IconLayersLinked size={18} stroke={1.75} />
                                </div>
                            </div>

                            {batch.tags.length > 0 ? (
                                <div className="mt-4 flex flex-wrap gap-1.5">
                                    {batch.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="inline-flex rounded-md border border-[#492FA6]/15 bg-[#492FA6]/5 px-2 py-0.5 text-xs font-medium text-[#492FA6]"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-4 text-xs text-neutral-400">No tags</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
