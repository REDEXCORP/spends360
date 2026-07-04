'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { products, type CreateProductBody } from '@/requests';
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
import { IconLoader2, IconPackage, IconPlus } from '@tabler/icons-react';

export default function ProductsPage() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [form, setForm] = useState<CreateProductBody>({
        name: '',
        description: '',
    });

    const { data: productList = [], isLoading } = useQuery({
        queryKey: ['products-list'],
        queryFn: () => products.list(),
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const createMutation = useMutation({
        mutationFn: products.create,
        onSuccess: () => {
            toastSuccess('Product added.');
            queryClient.invalidateQueries({ queryKey: ['products-list'] });
            setForm({ name: '', description: '' });
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
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Products</h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Offerings your team is selling to leads and customers.
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2 bg-[#492FA6] text-white hover:bg-[#492FA6]/90">
                            <IconPlus size={16} stroke={1.75} />
                            Add Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto bg-white sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Add product</DialogTitle>
                            <DialogDescription>
                                Name what your client built and describe what they are selling.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="Reach AI Dialer"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="What this product does, who it is for, and key selling points..."
                                    rows={6}
                                    className="min-h-[140px] resize-y"
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
                                        'Save Product'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center rounded-lg border border-neutral-200 bg-white py-16">
                    <IconLoader2 className="h-5 w-5 animate-spin text-neutral-500" />
                </div>
            ) : productList.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-white px-6 py-16 text-center">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[#492FA6]/10 text-[#492FA6]">
                        <IconPackage size={28} stroke={1.75} />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">No products yet</h3>
                    <p className="mt-1 max-w-sm text-sm text-neutral-500">
                        Add the product your client built and is trying to sell.
                    </p>
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        className="mt-6 bg-[#492FA6] text-white hover:bg-[#492FA6]/90"
                    >
                        Add Product
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {productList.map(product => (
                        <div
                            key={product.id}
                            className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#492FA6]/10 text-[#492FA6]">
                                    <IconPackage size={18} stroke={1.75} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold text-neutral-900">{product.name}</h3>
                                    {product.description ? (
                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-600">
                                            {product.description}
                                        </p>
                                    ) : (
                                        <p className="mt-2 text-sm text-neutral-400">No description</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
