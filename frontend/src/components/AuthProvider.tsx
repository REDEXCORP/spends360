'use client';

import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { user } from '@/requests';
import { ChildrenProps } from '@/helpers/interfaces';
import Loading from './Loading';
import CreateWorkSpace from './CreateWorkSpace';
import { useRouter, usePathname } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import { setProfile } from '@/store/slices/profileSlice';
import { useDispatch } from 'react-redux';

export const AuthProvider: React.FC<ChildrenProps> = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useDispatch();
    const {
        data: profile,
        isLoading: loading,
        error,
    } = useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => user.profile(),
        retry: 1,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (!loading && error) router.push('/login');
    }, [loading, error, router]);

    useEffect(() => {
        if (loading || !profile?.workspaces?.length) return;

        const needsSubscription = profile.subscriptionStatus !== 'active';
        if (needsSubscription && pathname !== '/subscribe') {
            router.replace('/subscribe');
        }
        if (!needsSubscription && pathname === '/subscribe') {
            router.replace('/');
        }
    }, [loading, profile, pathname, router]);

    if (loading || !profile) return <Loading />;

    if (!profile.workspaces?.length) return <CreateWorkSpace />;

    dispatch(setProfile(profile));

    if (profile.subscriptionStatus !== 'active' && pathname !== '/subscribe') {
        return <Loading />;
    }

    return <AuthContext.Provider value={{ profile, loading }}>{children}</AuthContext.Provider>;
};
