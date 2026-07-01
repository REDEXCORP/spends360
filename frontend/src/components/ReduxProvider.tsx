'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ChildrenProps } from '@/helpers/interfaces';

export const ReduxProvider: React.FC<ChildrenProps> = ({ children }) => {
    return <Provider store={store}>{children}</Provider>;
};
