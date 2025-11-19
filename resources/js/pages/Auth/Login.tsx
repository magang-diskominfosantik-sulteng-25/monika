import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type LoginFormState = {
    identifier: string;
    password: string;
    remember: boolean;
};

export default function Login() {
    const { data, setData, post, processing, errors, clearErrors, setError } = useForm<LoginFormState>({
        identifier: '',
        password: '',
        remember: false,
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        clearErrors();
        setSubmitted(true);

        let hasError = false;
        if (!data.identifier.trim()) {
            setError('identifier', 'Username atau email wajib diisi.');
            hasError = true;
        }
        if (!data.password.trim()) {
            setError('password', 'Password wajib diisi.');
            hasError = true;
        }

        if (hasError) return;

        post('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            <Head title="Masuk" />

            <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-between px-6 py-12 lg:px-12">
                <div className="hidden max-w-xl lg:block">
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Monika</p>
                    <h1 className="mt-3 text-4xl font-bold text-slate-900">Monitoring Indikator & Capaian</h1>
                    <p className="mt-4 text-lg text-slate-600">
                        Masuk untuk mengelola indikator, target, capaian, dan laporan dengan aman melalui antarmuka terintegrasi.
                    </p>
                </div>

                <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur">
                    <div className="flex items-center gap-3">
                            <img src="/logo-pemprov-sulteng.png" alt="Monika Logo" className="h-12 w-12" />
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Monika</p>
                            <p className="text-sm font-medium text-slate-800">Monitoring Indikator & Capaian</p>
                        </div>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-1">
                            <label htmlFor="identifier" className="text-sm font-semibold text-slate-800">
                                Email
                            </label>
                            <input
                                id="identifier"
                                type="text"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                placeholder="operator@diskominfo.go.id"
                                value={data.identifier}
                                onChange={(e) => setData('identifier', e.target.value)}
                                autoComplete="username"
                            />
                            {(submitted && !data.identifier.trim()) || errors.identifier ? (
                                <p className="text-sm text-red-600">{errors.identifier || 'Masukkan email.'}</p>
                            ) : null}
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="password" className="text-sm font-semibold text-slate-800">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                placeholder="••••••••"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                autoComplete="current-password"
                            />
                            {(submitted && !data.password.trim()) || errors.password ? (
                                <p className="text-sm text-red-600">{errors.password || 'Masukkan password.'}</p>
                            ) : null}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 font-medium text-slate-700">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                Ingat saya
                            </label>
                            <span className="text-slate-400">Akses internal Diskominfo</span>
                        </div>

                        <button
                            type="submit"
                            className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                            disabled={processing}
                        >
                            {processing ? 'Memproses...' : 'Masuk'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-xs text-slate-400">
                        <span>Butuh akun? Hubungi admin untuk registrasi pengguna.</span>
                        <div className="mt-2">&copy; {new Date().getFullYear()} Diskominfo Prov. Sulawesi Tengah</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
