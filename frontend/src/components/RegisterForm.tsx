'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RegisterFormValues } from '@/helpers/types';
import { registerSchema } from '@/helpers/validation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/requests';
import { toastError } from '@/helpers';
import AuthFormHeader from '@/components/AuthFormHeader';

const inputClassName =
    'h-11 border-gray-300 bg-white transition-colors focus:border-primary dark:border-border dark:bg-background';

export default function RegisterForm() {
    const [emailSent, setEmailSent] = useState(false);
    const [sentEmail, setSentEmail] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const registerMutation = useMutation({
        mutationFn: auth.register,
        onSuccess: data => {
            setSentEmail(data.email);
            setSuccessMessage(
                data.message ??
                    'We sent a verification link to your email. Click the link within 10 minutes to finish creating your account.'
            );
            setEmailSent(true);
        },
        onError: (error: unknown) => toastError(error),
    });

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    if (emailSent) {
        return (
            <div className="mx-auto w-full max-w-md p-8">
                <p className="mt-4 text-sm text-muted-foreground">
                    {successMessage} Sent to <strong>{sentEmail}</strong>.
                </p>
                <p className="mt-6 text-center text-sm text-muted-foreground">
                    Already verified?{' '}
                    <Link href="/login" className="text-primary hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-md p-8">
            <AuthFormHeader title="Create your account" />

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(data =>
                        registerMutation.mutate({
                            email: data.email,
                            password: data.password,
                        })
                    )}
                    className="space-y-5"
                >
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-normal text-foreground">Email address</FormLabel>
                                <FormControl>
                                    <Input placeholder="Email address" className={inputClassName} {...field} />
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
                                        className={inputClassName}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-normal text-foreground">
                                    Confirm password
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="Password"
                                        className={inputClassName}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={registerMutation.isPending}
                        className="h-11 w-full bg-[#492FA6] text-white hover:bg-[#492FA6]/90 transition-all duration-300"
                    >
                        {registerMutation.isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            'Send verification email'
                        )}
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
