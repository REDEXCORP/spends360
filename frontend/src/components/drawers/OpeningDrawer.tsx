'use client';

import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { jobs } from '@/requests';
import { jobSchema } from '@/helpers/validation';

interface OpeningDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    opening?: any | null;
    onSaveSuccess?: () => void;
}

export function OpeningDrawer({ open, onOpenChange, opening, onSaveSuccess }: OpeningDrawerProps) {
    const queryClient = useQueryClient();
    const isEditing = !!opening;

    const form = useForm<z.input<typeof jobSchema>>({
        resolver: zodResolver(jobSchema),
        values:
            isEditing && opening
                ? {
                      title: opening.title || '',
                      department: opening.role || 'engineering',
                      type: opening.type ? opening.type.replace('_', '-').toLowerCase() : 'full-time',
                      location: opening.location || '',
                      description: opening.description || '',
                      experienceMin: opening.experienceMin ?? '',
                      experienceMax: opening.experienceMax ?? '',
                      ctcMin: opening.ctcMin ?? '',
                      ctcMax: opening.ctcMax ?? '',
                      keySkills: opening.keySkills || '',
                  }
                : {
                      title: '',
                      department: 'engineering',
                      type: 'full-time',
                      location: '',
                      description: '',
                      experienceMin: '',
                      experienceMax: '',
                      ctcMin: '',
                      ctcMax: '',
                      keySkills: '',
                  },
    });

    const handleGenerate = () => {
        form.setValue('description', '<p>AI Generated summary placeholder...</p>', { shouldValidate: true });
    };

    const createJobMutation = useMutation({
        mutationFn: jobs.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            onOpenChange(false);
            if (onSaveSuccess) onSaveSuccess();
        },
        onError: error => {
            console.error('Failed to create job', error);
        },
    });

    const updateJobMutation = useMutation({
        mutationFn: (data: any) => jobs.update(opening.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            queryClient.invalidateQueries({ queryKey: ['job', opening.id] });
            onOpenChange(false);
            if (onSaveSuccess) onSaveSuccess();
        },
        onError: error => {
            console.error('Failed to update job', error);
        },
    });

    const onSubmit = (values: z.input<typeof jobSchema>) => {
        const payload = {
            title: values.title,
            subject: values.title,
            role: values.department,
            type: (values.type || 'full-time').toUpperCase().replace('-', '_'),
            workMode: 'REMOTE',
            description: values.description,
            location: values.location,
            experienceMin: values.experienceMin === '' ? null : Number(values.experienceMin),
            experienceMax: values.experienceMax === '' ? null : Number(values.experienceMax),
            ctcMin: values.ctcMin === '' ? null : Number(values.ctcMin),
            ctcMax: values.ctcMax === '' ? null : Number(values.ctcMax),
            keySkills: values.keySkills,
        };

        if (isEditing) {
            updateJobMutation.mutate(payload);
        } else {
            createJobMutation.mutate(payload);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col w-full sm:max-w-xl p-0 bg-background border-l shadow-2xl overflow-hidden">
                <SheetHeader className="px-6 py-4 border-b relative overflow-hidden bg-muted/30">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
                    <SheetTitle>{isEditing ? 'Edit Job Opening' : 'Create Job Opening'}</SheetTitle>
                    <SheetDescription>
                        {isEditing
                            ? 'Update the details for this role.'
                            : 'Fill in the details to post a new job opening.'}
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form
                        id="opening-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex-1 px-6 overflow-y-auto"
                    >
                        <div className="py-6 space-y-8">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium leading-none mb-1">Basic Information</h3>
                                    <p className="text-sm text-muted-foreground">The core details of the role.</p>
                                </div>

                                <div className="grid gap-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Job Title <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Senior Frontend Engineer" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="department"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Department <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Department" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="engineering">Engineering</SelectItem>
                                                        <SelectItem value="design">Design</SelectItem>
                                                        <SelectItem value="marketing">Marketing</SelectItem>
                                                        <SelectItem value="sales">Sales</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Employment Type</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Job Type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="full-time">Full-time</SelectItem>
                                                            <SelectItem value="part-time">Part-time</SelectItem>
                                                            <SelectItem value="contract">Contract</SelectItem>
                                                            <SelectItem value="freelance">Freelance</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="experienceMin"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Min Exp (Yrs)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                placeholder="e.g. 2"
                                                                {...field}
                                                                value={field.value as string | number | undefined}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="experienceMax"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Max Exp (Yrs)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                placeholder="e.g. 5"
                                                                {...field}
                                                                value={field.value as string | number | undefined}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="ctcMin"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Min CTC (LPA)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            placeholder="e.g. 10"
                                                            {...field}
                                                            value={field.value as string | number | undefined}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="ctcMax"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Max CTC (LPA)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            placeholder="e.g. 20"
                                                            {...field}
                                                            value={field.value as string | number | undefined}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="location"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Location</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Remote, New York" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="keySkills"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Key Skills</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. React, Node.js, Postgres" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <h3 className="text-sm font-medium leading-none mb-1">Job Description</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Detail the responsibilities and requirements.
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        className="gap-2 bg-primary/10 text-primary hover:bg-primary/20 h-8"
                                        onClick={handleGenerate}
                                    >
                                        <Sparkles className="h-3.5 w-3.5" />
                                        AI Generate
                                    </Button>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div className="prose-sm max-w-none">
                                                    <QuillEditor value={field.value} onChange={field.onChange} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </form>
                </Form>

                <SheetFooter className="px-6 py-4 border-t bg-muted/10 shrink-0 flex-row justify-end space-x-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="opening-form"
                        className="gap-2"
                        disabled={createJobMutation.isPending || updateJobMutation.isPending}
                    >
                        <Check className="h-4 w-4" />
                        {isEditing ? 'Update Opening' : 'Publish Opening'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

function QuillEditor({ value, onChange }: { value: string; onChange: (val: string) => void }) {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);

    useEffect(() => {
        if (editorRef.current && !quillRef.current) {
            quillRef.current = new Quill(editorRef.current, {
                theme: 'snow',
                placeholder: 'Describe the role, responsibilities, and ideal candidate...',
                modules: {
                    toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['link'],
                        ['clean'],
                    ],
                },
            });

            if (value) {
                quillRef.current.root.innerHTML = value;
            }

            quillRef.current.on('text-change', () => {
                const html = quillRef.current?.root.innerHTML || '';
                onChange(html === '<p><br></p>' ? '' : html);
            });
        }
    }, [onChange]);

    useEffect(() => {
        if (quillRef.current && value === '') {
            if (quillRef.current.root.innerHTML !== '<p><br></p>') {
                quillRef.current.root.innerHTML = '';
            }
        }
    }, [value]);

    return (
        <div className="border rounded-md overflow-hidden flex flex-col">
            <div
                ref={editorRef}
                className="bg-background [&_.ql-editor]:min-h-[250px] [&_.ql-editor]:text-base [&_.ql-toolbar]:border-none [&_.ql-container]:border-none [&_.ql-toolbar]:bg-muted/30"
            />
        </div>
    );
}
