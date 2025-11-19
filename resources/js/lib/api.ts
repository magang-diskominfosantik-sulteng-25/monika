import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react';

export type PaginatedResponse<T> = {
    data: T[];
    links?: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta?: {
        current_page: number;
        from: number;
        last_page: number;
        per_page: number;
        to: number;
        total: number;
    };
};

const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
});

// Intercept requests to add CSRF token
api.interceptors.request.use((config) => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) {
        config.headers['X-CSRF-TOKEN'] = token;
    }
    return config;
});

// Intercept response to handle CSRF token mismatch
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // If CSRF token mismatch (419), reload page to get fresh token
        if (error.response?.status === 419) {
            alert('Sesi Anda telah berakhir. Halaman akan dimuat ulang.');
            window.location.reload();
            return Promise.reject(new Error('Session expired'));
        }
        return Promise.reject(error);
    }
);

export function useApi<T>(path: string, initial?: T) {
    const [data, setData] = useState<T | undefined>(initial);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        api.get<T | PaginatedResponse<T extends Array<infer U> ? U : never>>(path)
            .then((res) => {
                if (!active) return;
                // If response is paginated Laravel resource, extract data array
                const responseData = res.data as unknown;
                if (
                    responseData &&
                    typeof responseData === 'object' &&
                    'data' in responseData &&
                    Array.isArray((responseData as { data: unknown }).data)
                ) {
                    setData((responseData as { data: unknown }).data as T);
                } else {
                    setData(res.data as T);
                }
            })
            .catch((err: AxiosError) => {
                if (!active) return;
                setError(err.message);
            })
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, [path]);

    const refetch = () => {
        return api.get<T | PaginatedResponse<T extends Array<infer U> ? U : never>>(path).then((res) => {
            const responseData = res.data as unknown;
            if (
                responseData &&
                typeof responseData === 'object' &&
                'data' in responseData &&
                Array.isArray((responseData as { data: unknown }).data)
            ) {
                setData((responseData as { data: unknown }).data as T);
            } else {
                setData(res.data as T);
            }
        });
    };

    return { data, loading, error, refetch } as const;
}

export function useMutation<TPayload, TResult>(basePath: string, method: 'post' | 'put' | 'patch' | 'delete' = 'post') {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mutate = async (payload?: TPayload, dynamicPath?: string) => {
        setLoading(true);
        setError(null);
        try {
            const url = dynamicPath || basePath;
            const response = await api.request<TResult>({ url, method, data: payload });
            return response.data;
        } catch (err) {
            const axiosErr = err as AxiosError;
            setError(axiosErr.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { mutate, loading, error } as const;
}
