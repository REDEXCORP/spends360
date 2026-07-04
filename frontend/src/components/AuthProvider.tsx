'use client';

import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { user } from '@/requests';
import { ChildrenProps } from '@/helpers/interfaces';
import Loading from './Loading';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import { setProfile } from '@/store/slices/profileSlice';
import { useDispatch } from 'react-redux';

export const AuthProvider: React.FC<ChildrenProps> = ({ children }) => {
    const router = useRouter();
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

    if (loading || !profile) return <Loading />;

    dispatch(setProfile(profile));

    return <AuthContext.Provider value={{ profile, loading }}>{children}</AuthContext.Provider>;
};
