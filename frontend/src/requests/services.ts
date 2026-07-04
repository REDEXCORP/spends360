import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const responseBody = (response: AxiosResponse) => response.data;

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    withCredentials: true,
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => config,
    (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => Promise.reject(error)
);

export const apiRequestV1 = {
    get: (url: string) => api.get(`/api${url}`).then(responseBody),
    post: (url: string, body: unknown) => api.post(`/api${url}`, body).then(responseBody),
    put: (url: string, body: unknown) => api.put(`/api${url}`, body).then(responseBody),
    patch: (url: string, body: unknown) => api.patch(`/api${url}`, body).then(responseBody),
    del: (url: string) => api.delete(`/api${url}`).then(responseBody),
};
