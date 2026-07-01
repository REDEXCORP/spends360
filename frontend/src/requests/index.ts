import { apiRequestV1 } from './services';
import { RegisterFormValues, UserSchema, VerifyOtpFormValues } from '@/helpers/types';

export const auth = {
    login: (user: UserSchema) => apiRequestV1.post('/auth/login', user),
    register: (user: RegisterFormValues) => apiRequestV1.post('/auth/register', user),
    verifyOtp: (data: VerifyOtpFormValues) => apiRequestV1.post('/auth/verify-otp', data),
};

export const user = {
    profile: () => apiRequestV1.get('/user/profile'),
    updateDefaultWorkspace: (workspaceId: string | number) => apiRequestV1.put(`/user/workspace/${workspaceId}`, {}),
    createWorkspace: (name: string) => apiRequestV1.post('/user/workspace', { name }),
};
