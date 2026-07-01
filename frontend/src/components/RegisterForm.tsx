'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoginFormValues } from '@/helpers/types';
import { loginSchema } from '@/helpers/validation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/requests';
import { toastError } from '@/helpers';
import { useDispatch } from 'react-redux';
import { setProfile } from '@/store/slices/profileSlice';

export default function RegisterForm() {
    const router = useRouter();

    const dispatch = useDispatch();

    const loginMutation = useMutation({
        mutationFn: auth.register,
        onSuccess: (data: any) => {
            dispatch(setProfile(data.user));
            router.push('/');
        },
        onError: (error: any) => toastError(error),
    });

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    return (
        <div className="w-full max-w-md mx-auto p-8">
            <div className="mb-8">
                <Link href="/" className="flex items-center mb-8">
                    <div className="flex items-center gap-2">
                        <Image src="/logo.svg" alt="Logo" width={40} height={36} className="w-10 h-9 object-contain" />
                        <span className="font-bold text-2xl hidden sm:block text-foreground">Spends360</span>
                    </div>
                </Link>
                <h2 className="text-2xl font-semibold text-foreground">Create your account</h2>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(data => loginMutation.mutate(data))} className="space-y-5">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-normal text-foreground">Email address</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Email address"
                                        className="h-11 bg-white dark:bg-background border-gray-300 dark:border-border focus:border-primary transition-colors"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-normal text-foreground">Password</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="Password"
                                        className="h-11 bg-white dark:bg-background border-gray-300 dark:border-border focus:border-primary transition-colors"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={loginMutation.isPending}
                        className="w-full h-11 bg-primary hover:bg-primary/90 transition-all duration-300"
                    >
                        {loginMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create'}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline">
                            Log In
                        </Link>
                    </div>
                </form>
            </Form>
        </div>
    );
}
