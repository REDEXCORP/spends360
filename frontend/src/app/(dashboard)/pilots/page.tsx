'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pilots, type CreatePilotBody, type Pilot } from '@/requests';
import { Badge } from '@/components/ui/badge';
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
import { toastError, toastSuccess } from '@/helpers';
import { cn } from '@/lib/utils';
import {
    IconHeadset,
    IconLoader2,
    IconMail,
    IconNotes,
    IconPlus,
    IconSearch,
    IconUsers,
} from '@tabler/icons-react';

const AVATAR_PALETTES = [
    { bg: 'bg-violet-100', text: 'text-violet-700', ring: 'ring-violet-200' },
    { bg: 'bg-indigo-100', text: 'text-indigo-700', ring: 'ring-indigo-200' },
    { bg: 'bg-sky-100', text: 'text-sky-700', ring: 'ring-sky-200' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200' },
    { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-200' },
    { bg: 'bg-rose-100', text: 'text-rose-700', ring: 'ring-rose-200' },
] as const;

function getAvatarPalette(name: string) {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return AVATAR_PALETTES[hash % AVATAR_PALETTES.length];
}

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

function PilotAvatar({
    name,
    size = 'md',
    className,
}: {
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}) {
    const palette = getAvatarPalette(name);
    const sizeClass =
        size === 'sm'
            ? 'size-9 text-xs'
            : size === 'lg'
              ? 'size-14 text-lg'
              : size === 'xl'
                ? 'size-20 text-2xl'
                : 'size-10 text-sm';

    return (
        <div
            className={cn(
                'flex shrink-0 items-center justify-center rounded-full font-semibold ring-2',
                palette.bg,
                palette.text,
                palette.ring,
                sizeClass,
                className
            )}
        >
            {getInitials(name)}
        </div>
    );
}

function PilotAddDialog({
    open,
    onOpenChange,
    form,
    setForm,
    onSubmit,
    isPending,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: CreatePilotBody;
    setForm: React.Dispatch<React.SetStateAction<CreatePilotBody>>;
    onSubmit: (e: React.FormEvent) => void;
    isPending: boolean;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto bg-white sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add pilot</DialogTitle>
                    <DialogDescription>
                        Add a sales person and their contact details.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="Alex Johnson"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            placeholder="alex@company.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Details</Label>
                        <Textarea
                            id="description"
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Role, territory, notes, or anything useful for assigning leads..."
                            rows={5}
                            className="min-h-[120px] resize-y"
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="bg-[#492FA6] text-white hover:bg-[#492FA6]/90"
                        >
                            {isPending ? (
                                <IconLoader2 size={16} className="animate-spin" />
                            ) : (
                                'Save Pilot'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function PilotListItem({
    pilot,
    active,
    onSelect,
}: {
    pilot: Pilot;
    active: boolean;
    onSelect: () => void;
}) {
    return (
        <li>
            <button
                type="button"
                onClick={onSelect}
                className={cn(
                    'relative flex w-full items-center gap-3 px-4 py-3.5 text-left transition-all',
                    active
                        ? 'bg-[#492FA6]/[0.06] before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-r-full before:bg-[#492FA6]'
                        : 'hover:bg-neutral-50'
                )}
            >
                <PilotAvatar name={pilot.name} size="sm" />
                <div className="min-w-0 flex-1">
                    <p className={cn('truncate font-medium', active ? 'text-[#492FA6]' : 'text-neutral-900')}>
                        {pilot.name}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                        {pilot.email || 'No email on file'}
                    </p>
                </div>
                <IconHeadset
                    size={15}
                    stroke={1.75}
                    className={cn('shrink-0', active ? 'text-[#492FA6]/70' : 'text-neutral-300')}
                />
            </button>
        </li>
    );
}

function PilotDetailPanel({ pilot }: { pilot: Pilot }) {
    const palette = getAvatarPalette(pilot.name);

    return (
        <div className="overflow-hidden rounded border border-neutral-200 bg-white shadow-sm">
            <div className="relative h-28 bg-gradient-to-br from-[#492FA6] via-[#5b3fbd] to-[#7c5fd4]">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.06%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-80" />
            </div>

            <div className="relative px-6 pb-6">
                <div className="-mt-10 mb-4 flex items-end justify-between gap-4">
                    <PilotAvatar
                        name={pilot.name}
                        size="xl"
                        className={cn('border-4 border-white shadow-md', palette.bg, palette.text, palette.ring)}
                    />
                    <Badge
                        variant="outline"
                        className="mb-1 border-[#492FA6]/20 bg-[#492FA6]/5 text-[#492FA6]"
                    >
                        Sales person
                    </Badge>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">{pilot.name}</h2>
                <p className="mt-1 text-sm text-neutral-500">Assigned to leads and outbound calls</p>

                <div className="mt-6 space-y-4">
                    <div className="rounded-lg border border-neutral-100 bg-neutral-50/80 p-4">
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                            <IconMail size={14} stroke={1.75} />
                            Contact
                        </div>
                        {pilot.email ? (
                            <a
                                href={`mailto:${pilot.email}`}
                                className="mt-2 block text-sm font-medium text-[#492FA6] hover:underline"
                            >
                                {pilot.email}
                            </a>
                        ) : (
                            <p className="mt-2 text-sm text-neutral-400">No email added</p>
                        )}
                    </div>

                    <div className="rounded-lg border border-neutral-100 p-4">
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                            <IconNotes size={14} stroke={1.75} />
                            Details
                        </div>
                        {pilot.description ? (
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                                {pilot.description}
                            </p>
                        ) : (
                            <p className="mt-3 text-sm italic text-neutral-400">
                                No details yet. Add notes when creating or editing this pilot.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function PilotsSkeleton() {
    return (
        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded border border-neutral-200 bg-white shadow-sm">
                <div className="border-b border-neutral-100 px-4 py-4">
                    <div className="h-9 animate-pulse rounded-md bg-neutral-100" />
                </div>
                <div className="space-y-1 p-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-3">
                            <div className="size-9 animate-pulse rounded-full bg-neutral-100" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-28 animate-pulse rounded bg-neutral-100" />
                                <div className="h-2.5 w-36 animate-pulse rounded bg-neutral-100" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="h-[420px] animate-pulse rounded border border-neutral-200 bg-neutral-50" />
        </div>
    );
}

export default function PilotsPage() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState<CreatePilotBody>({
        name: '',
        email: '',
        description: '',
    });

    const { data: pilotList = [], isLoading } = useQuery({
        queryKey: ['pilots-list'],
        queryFn: () => pilots.list(),
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const filteredPilots = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return pilotList;

        return pilotList.filter(
            pilot =>
                pilot.name.toLowerCase().includes(query) ||
                pilot.email?.toLowerCase().includes(query) ||
                pilot.description?.toLowerCase().includes(query)
        );
    }, [pilotList, search]);

    const activeId = useMemo(() => {
        if (selectedId && filteredPilots.some(pilot => pilot.id === selectedId)) {
            return selectedId;
        }
        return filteredPilots[0]?.id ?? null;
    }, [filteredPilots, selectedId]);

    const selectedPilot = filteredPilots.find(pilot => pilot.id === activeId);

    const createMutation = useMutation({
        mutationFn: pilots.create,
        onSuccess: pilot => {
            toastSuccess('Pilot added.');
            queryClient.invalidateQueries({ queryKey: ['pilots-list'] });
            setForm({ name: '', email: '', description: '' });
            setIsDialogOpen(false);
            setSelectedId(pilot.id);
            setSearch('');
        },
        onError: error => toastError(error),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name?.trim()) return;

        createMutation.mutate({
            name: form.name.trim(),
            email: form.email?.trim() || undefined,
            description: form.description?.trim() || undefined,
        });
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-bold text-neutral-900">Pilots</h1>
                        {!isLoading && pilotList.length > 0 ? (
                            <Badge
                                variant="outline"
                                className="border-neutral-200 bg-white text-neutral-600"
                            >
                                <IconUsers size={12} stroke={1.75} />
                                {pilotList.length} {pilotList.length === 1 ? 'person' : 'people'}
                            </Badge>
                        ) : null}
                    </div>
                    <p className="mt-1 max-w-xl text-sm text-neutral-500">
                        Your sales team — assign pilots to leads and track who owns each conversation.
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="shrink-0 gap-2 bg-[#492FA6] text-white hover:bg-[#492FA6]/90">
                            <IconPlus size={16} stroke={1.75} />
                            Add Pilot
                        </Button>
                    </DialogTrigger>
                </Dialog>
            </div>

            <PilotAddDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                form={form}
                setForm={setForm}
                onSubmit={handleSubmit}
                isPending={createMutation.isPending}
            />

            {isLoading ? (
                <PilotsSkeleton />
            ) : pilotList.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded border border-dashed border-neutral-200 bg-white px-6 py-20 text-center">
                    <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#492FA6]/15 to-[#492FA6]/5 text-[#492FA6]">
                        <IconHeadset size={32} stroke={1.5} />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">Build your sales team</h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-500">
                        Add pilots to represent your sales persons. Each pilot can be linked to leads
                        and calls so you always know who is handling what.
                    </p>
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        className="mt-8 gap-2 bg-[#492FA6] text-white hover:bg-[#492FA6]/90"
                    >
                        <IconPlus size={16} stroke={1.75} />
                        Add your first pilot
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
                    <div className="flex flex-col overflow-hidden rounded border border-neutral-200 bg-white shadow-sm lg:max-h-[calc(100vh-12rem)]">
                        <div className="border-b border-neutral-100 px-4 py-4">
                            <div className="relative">
                                <IconSearch
                                    size={16}
                                    stroke={1.75}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                                />
                                <Input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search pilots..."
                                    className="h-9 border-neutral-200 bg-neutral-50/50 pl-9 text-sm"
                                />
                            </div>
                            <p className="mt-2 text-xs text-neutral-400">
                                {filteredPilots.length} of {pilotList.length} shown
                            </p>
                        </div>

                        {filteredPilots.length === 0 ? (
                            <div className="px-4 py-10 text-center">
                                <p className="text-sm font-medium text-neutral-700">No matches</p>
                                <p className="mt-1 text-xs text-neutral-500">
                                    Try a different name or email.
                                </p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-neutral-100 overflow-y-auto">
                                {filteredPilots.map(pilot => (
                                    <PilotListItem
                                        key={pilot.id}
                                        pilot={pilot}
                                        active={activeId === pilot.id}
                                        onSelect={() => setSelectedId(pilot.id)}
                                    />
                                ))}
                            </ul>
                        )}
                    </div>

                    {selectedPilot ? (
                        <PilotDetailPanel pilot={selectedPilot} />
                    ) : (
                        <div className="flex min-h-[320px] items-center justify-center rounded border border-dashed border-neutral-200 bg-neutral-50/50 p-8 text-center">
                            <div>
                                <IconHeadset size={28} stroke={1.5} className="mx-auto text-neutral-300" />
                                <p className="mt-3 text-sm font-medium text-neutral-600">
                                    Select a pilot to view details
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
