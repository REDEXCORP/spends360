'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leads, type CreateLeadBody } from '@/requests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { toastError, toastSuccess } from '@/helpers';
import { cn } from '@/lib/utils';
import { IconAddressBook, IconLoader2, IconPlus } from '@tabler/icons-react';

export default function LeadsPage() {
    const queryClient = useQueryClient();
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [form, setForm] = useState<CreateLeadBody>({
        name: '',
        phone: '',
        email: '',
        source: '',
        about: '',
    });

    const { data: leadList = [], isLoading } = useQuery({
        queryKey: ['leads-list'],
        queryFn: () => leads.list(),
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const createMutation = useMutation({
        mutationFn: leads.create,
        onSuccess: lead => {
            toastSuccess('Lead added.');
            queryClient.invalidateQueries({ queryKey: ['leads-list'] });
            setForm({ name: '', phone: '', email: '', source: '', about: '' });
            setIsDialogOpen(false);
            setSelectedId(lead.id);
        },
        onError: error => toastError(error),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name?.trim() || !form.phone?.trim()) return;

        createMutation.mutate({
            name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email?.trim() || undefined,
            source: form.source?.trim() || undefined,
            about: form.about?.trim() || undefined,
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Leads</h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Prospects your team is reaching out to.
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="shrink-0 gap-2 bg-[#492FA6] text-white hover:bg-[#492FA6]/90">
                            <IconPlus size={16} stroke={1.75} />
                            Add Lead
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto bg-white sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Add lead</DialogTitle>
                            <DialogDescription>
                                Add a prospect with contact details and optional notes.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="lead-name">Name *</Label>
                                <Input
                                    id="lead-name"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="Robert Chen"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lead-phone">Phone *</Label>
                                <Input
                                    id="lead-phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                    placeholder="9893215423"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lead-email">Email</Label>
                                <Input
                                    id="lead-email"
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="robert@company.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lead-source">Source</Label>
                                <Input
                                    id="lead-source"
                                    value={form.source}
                                    onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                                    placeholder="Website, Referral, LinkedIn..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lead-about">About</Label>
                                <Textarea
                                    id="lead-about"
                                    value={form.about}
                                    onChange={e => setForm(f => ({ ...f, about: e.target.value }))}
                                    placeholder="Notes about this prospect, context, or talking points..."
                                    rows={4}
                                    className="min-h-[100px] resize-y"
                                />
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
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
                                        'Save Lead'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center rounded border border-neutral-200 bg-white py-16">
                    <IconLoader2 className="h-5 w-5 animate-spin text-neutral-500" />
                </div>
            ) : leadList.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded border border-dashed border-neutral-200 bg-white px-6 py-16 text-center">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#492FA6]/10 text-[#492FA6]">
                        <IconAddressBook size={28} stroke={1.75} />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">No leads yet</h3>
                    <p className="mt-1 max-w-md text-sm text-neutral-500">
                        Add prospects to start tracking outreach and follow-ups.
                    </p>
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        className="mt-6 gap-2 bg-[#492FA6] text-white hover:bg-[#492FA6]/90"
                    >
                        <IconPlus size={16} stroke={1.75} />
                        Add your first lead
                    </Button>
                </div>
            ) : (
                <div className="overflow-hidden rounded border border-neutral-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-neutral-50/80 hover:bg-neutral-50/80">
                                    <TableHead className="px-6">Name</TableHead>
                                    <TableHead className="px-6">Phone</TableHead>
                                    <TableHead className="px-6">Email</TableHead>
                                    <TableHead className="px-6">Source</TableHead>
                                    <TableHead className="px-6">About</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leadList.map(lead => {
                                    const active = selectedId === lead.id;

                                    return (
                                        <TableRow
                                            key={lead.id}
                                            onClick={() => setSelectedId(lead.id)}
                                            className={cn(
                                                'cursor-pointer transition-colors',
                                                active ? 'bg-[#492FA6]/5' : 'hover:bg-neutral-50'
                                            )}
                                        >
                                            <TableCell className="px-6 py-4 font-medium text-neutral-900">
                                                {lead.name}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-sm text-neutral-700">
                                                {lead.phone}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-sm text-neutral-700">
                                                {lead.email || '—'}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-sm text-neutral-500">
                                                {lead.source || '—'}
                                            </TableCell>
                                            <TableCell className="max-w-xs px-6 py-4 text-sm text-neutral-600">
                                                {lead.about ? (
                                                    <span className="line-clamp-2">{lead.about}</span>
                                                ) : (
                                                    '—'
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
}
