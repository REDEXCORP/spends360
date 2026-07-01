import { toast } from 'sonner';

export const toastError = (error: any) => {
    let message = 'An unexpected error occurred';
    if (typeof error === 'string') {
        message = error;
    } else if (error?.response?.data?.message) {
        message = error.response.data.message;
    } else if (error?.response?.data?.error) {
        message = error.response.data.error;
    } else if (error?.message) {
        message = error.message;
    }
    return toast.error(message);
};

export const toastSuccess = (message: string) => toast.success(message);
