import { Link, usePage } from '@inertiajs/react';
import { LogOut, Menu, UploadCloud, X } from 'lucide-react';
import { useState } from 'react';

import { cn } from '../lib/utils';

type NavItem = { label: string; href: string; key: string };

const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', key: 'dashboard' },
    { label: 'Indikator', href: '/indikator', key: 'indikator' },
    { label: 'Integrasi OPD', href: '/opd-indikator', key: 'opd-indikator' },
    { label: 'Laporan', href: '/laporan', key: 'laporan' },
    { label: 'Periode', href: '/period', key: 'period' },
    { label: 'OPD', href: '/opd', key: 'opd' },
    { label: 'Kelola Akun', href: '/users', key: 'users' },
    { label: 'Audit Log', href: '/audit-log', key: 'audit-log' },
];

interface AppShellProps {
    children: React.ReactNode;
    title: string;
    description?: string;
    active: string;
}

export function AppShell({ children, title, description, active }: AppShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { url, props } = usePage<{ auth: { user: { name: string; email: string } } }>();
    const normalizedUrl = url.split('?')[0];
    const user = props.auth.user;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            <div className="mx-auto min-h-full px-4 py-6 lg:grid lg:grid-cols-[280px_1fr] lg:items-start lg:gap-6 lg:px-12">
                <aside
                    className={cn(
                        'fixed inset-y-0 left-0 z-50 w-72 bg-white transition-transform duration-300 ease-in-out lg:sticky lg:top-6 lg:z-auto lg:block lg:h-[calc(100vh-3rem)] lg:w-auto lg:rounded-3xl lg:border lg:border-slate-200 lg:shadow-sm lg:transition-none',
                        sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0',
                    )}
                >
                    <div className="flex h-full flex-col">
                        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
                            <img src="/logo-pemprov-sulteng.png" alt="Monika Logo" className="h-12 w-12" />
                            <div>
                                <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">Monika</p>
                                <p className="text-sm font-medium text-slate-800">Monitoring Indikator & Capaian</p>
                            </div>
                            <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 lg:overflow-visible">
                            <nav className="space-y-1">
                                {navItems.map((item) => {
                                    const isActive = active === item.key || normalizedUrl === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                'flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-500',
                                                isActive && 'bg-blue-50 text-blue-700 shadow-inner',
                                            )}
                                        >
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                        <div className="m-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white">
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
                        <div className="border-t border-slate-200 p-4">
                            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                                <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-700" aria-hidden />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                                </div>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="shrink-0 rounded-full p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                                    title="Keluar"
                                >
                                    <LogOut className="h-4 w-4" aria-hidden />
                                </Link>
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
                        <div className="flex items-center gap-3 self-start">{/* User profile moved to sidebar */}</div>
                    </header>
                    <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-7">{children}</div>
                </main>
            </div>
        </div>
    );
}
