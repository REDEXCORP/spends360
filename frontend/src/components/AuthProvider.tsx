'use client';

import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { user } from '@/requests';
import { ChildrenProps } from '@/helpers/interfaces';
import Loading from './Loading';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import CreateWorkSpace from './CreateWorkSpace';

export const AuthProvider: React.FC<ChildrenProps> = ({ children }) => {
    const router = useRouter();
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
    }, [error]);

    if (loading || !profile) return <Loading />;

    if (profile.workspaces.length === 0) return <CreateWorkSpace />;

    return <AuthContext.Provider value={{ profile, loading }}>{children}</AuthContext.Provider>;
};
