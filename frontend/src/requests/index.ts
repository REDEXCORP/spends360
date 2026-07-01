import { apiRequestV1 } from './services';
import { UserSchema } from '@/helpers/types';

export const auth = {
    login: (user: UserSchema) => apiRequestV1.post('/auth/login', user),
    register: (user: UserSchema) => apiRequestV1.post('/auth/register', user),
};

export const user = {
    profile: () => apiRequestV1.get('/user/profile'),
    updateDefaultWorkspace: (workspaceId: string | number) => apiRequestV1.put(`/user/workspace/${workspaceId}`, {}),
    createWorkspace: (name: string) => apiRequestV1.post('/user/workspace', { name }),
};
