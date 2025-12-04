import { AxiosError } from 'axios';
import { toast } from 'sonner';

export function handleError(err: unknown, defaultMessage: string = 'Terjadi kesalahan') {
    console.error(err);

    if (err instanceof AxiosError) {
        if (err.response) {
            const { status, data } = err.response;

            // Validation errors (422)
            if (status === 422) {
                const errors = data.errors;
                if (errors) {
                    // Get the first error message
                    const firstKey = Object.keys(errors)[0];
                    const firstMessage = errors[firstKey][0];
                    toast.error(firstMessage);
                    return;
                }
                toast.error(data.message || 'Data yang dikirim tidak valid');
                return;
            }

            // Forbidden (403)
            if (status === 403) {
                toast.error('Anda tidak memiliki akses untuk melakukan aksi ini');
                return;
            }

            // Not Found (404)
            if (status === 404) {
                toast.error('Data tidak ditemukan');
                return;
            }

            // Server Error (500)
            if (status === 500) {
                if (data?.message && data.message.includes('Duplicate entry')) {
                    toast.error('Data tersebut sudah ada di sistem (Duplikat).');
                    return;
                }
                toast.error('Terjadi kesalahan pada server. Silakan coba lagi nanti.');
                return;
            }

            // Other errors
            if (data?.message) {
                if (isSqlError(data.message)) {
                    toast.error('Terjadi kesalahan database. Silakan hubungi administrator.');
                } else {
                    toast.error(data.message);
                }
                return;
            }
        } else if (err.request) {
            // Network error
            toast.error('Gagal terhubung ke server. Periksa koneksi internet Anda.');
            return;
        }
    }

    toast.error(defaultMessage);
}

function isSqlError(message: string): boolean {
    const sqlKeywords = [
        'SQLSTATE',
        'Integrity constraint violation',
        'syntax error',
        'Connection refused',
        'Table',
        'Column',
        'Duplicate entry',
    ];
    return sqlKeywords.some((keyword) => message.includes(keyword));
}
