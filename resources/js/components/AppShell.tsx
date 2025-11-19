import { Menu, ShieldCheck, UploadCloud } from 'lucide-react';
import { useState } from 'react';

import { cn } from '../lib/utils';

const navItems = [
    { label: 'Dashboard', href: 'dashboard' },
    { label: 'Indikator', href: 'indikator' },
    { label: 'Periode', href: 'periode' },
    { label: 'Entri Data', href: 'entri' },
    { label: 'OPD', href: 'opd' },
    { label: 'Laporan', href: 'laporan' },
    { label: 'Audit Log', href: 'audit' },
];

interface AppShellProps {
    children: React.ReactNode;
    title: string;
    description?: string;
    active: string;
    onNavigate?: (href: string) => void;
}

export function AppShell({ children, title, description, active, onNavigate }: AppShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <div className="mx-auto flex min-h-full gap-6 px-6 py-6 lg:grid lg:grid-cols-[280px_1fr] lg:items-start lg:px-12">
                <aside
                    className={cn(
                        'h-full rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-200 lg:sticky lg:top-6 lg:h-auto lg:self-start',
                        sidebarOpen ? 'block' : 'hidden',
                        'lg:block',
                    )}
                >
                    <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">Monika</p>
                            <p className="text-sm font-medium text-slate-800">Monitoring Indikator & Capaian</p>
                        </div>
                    </div>
                    <div className="p-4">
                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <button
                                    key={item.href}
                                    className={cn(
                                        'flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-500',
                                        active === item.href && 'bg-blue-50 text-blue-700 shadow-inner',
                                    )}
                                    onClick={() => onNavigate?.(item.href)}
                                >
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>
                        <div className="mt-6 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs tracking-wide uppercase">Operator</p>
                                    <p className="text-lg font-semibold">Diskominfo Sulteng</p>
                                    <p className="mt-1 text-sm text-blue-100">Kelola IKU/IKD/IKK secara terpadu.</p>
                                </div>
                                <div className="rounded-xl bg-white/15 p-2">
                                    <UploadCloud className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
                <main className="flex flex-col gap-4 lg:gap-6">
                    <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                <button
                                    className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-blue-700 ring-1 ring-blue-100"
                                    onClick={() => setSidebarOpen((open) => !open)}
                                >
                                    <Menu className="mr-2 h-4 w-4" aria-hidden />
                                    Menu
                                </button>
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-slate-900 lg:text-3xl">{title}</h1>
                                {description && <p className="text-sm text-slate-600">{description}</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 self-start">
                            <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm lg:flex">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700" aria-hidden />
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Operator</p>
                                    <p className="text-xs text-slate-500">Diskominfo Prov. Sulteng</p>
                                </div>
                            </div>
                        </div>
                    </header>
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-7">{children}</div>
                </main>
            </div>
        </div>
    );
}
