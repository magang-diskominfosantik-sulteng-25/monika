import { useMemo } from 'react';

import { AppShell } from '../components/AppShell';
import { DataTable } from '../components/DataTable';
import { StatCard } from '../components/StatCard';
import { ProgressBar } from '../components/StatusBar';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { useApi } from '../lib/api';

type AchievementData = {
    id: number;
    capaian: number;
    periode: string;
    target?: { nilai: number; indicator?: { nama: string }; opd?: { singkatan: string } };
    created_at?: string;
};

type IndicatorData = { id: number; nama: string };
type TargetData = { id: number; nilai: number };

const heatmapCells = Array.from({ length: 12 }, (_, idx) => ({
    label: new Date(2026, idx).toLocaleString('id-ID', { month: 'short' }),
    value: Math.round(Math.random() * 100),
}));

export default function Dashboard() {
    const { data: achievements, loading: loadingAchievements } = useApi<AchievementData[]>('/achievements', []);
    const { data: indicators, loading: loadingIndicators } = useApi<IndicatorData[]>('/indicators', []);
    const { data: targets, loading: loadingTargets } = useApi<TargetData[]>('/targets', []);

    const loading = loadingAchievements || loadingIndicators || loadingTargets;

    const recentAchievements = useMemo(
        () =>
            (achievements || [])
                .slice(0, 5) // Take first 5 (assuming API returns sorted or we sort here)
                .map((item) => ({
                    ...item,
                    indikator: item.target?.indicator?.nama ?? '-',
                    opd: item.target?.opd?.singkatan ?? '-',
                    target: item.target?.nilai ?? 0,
                })),
        [achievements],
    );

    const statCards = [
        { title: 'Total Indikator', value: (indicators?.length || 0).toString(), description: 'IKU / IKD / IKK aktif', trend: 'up' as const },
        { title: 'Target aktif', value: (targets?.length || 0).toString(), description: 'Periode berjalan', progress: 68 },
        { title: 'Total Capaian', value: (achievements?.length || 0).toString(), description: 'Data tersimpan', progress: 72 },
        { title: 'OPD Terdaftar', value: '34', description: 'Organisasi Perangkat Daerah', trend: 'up' as const }, // Hardcoded for now or fetch if available
    ];

    return (
        <AppShell title="Dashboard" description="Ringkasan progres indikator kinerja Diskominfo Prov. Sulawesi Tengah" active="dashboard">
            <div className="space-y-6">
                <div className="grid gap-4 lg:grid-cols-4">
                    {loading
                        ? Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} className="h-32 rounded-2xl" />)
                        : statCards.map((card) => <StatCard key={card.title} {...card} />)}
                </div>

                <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">Capaian Terbaru</p>
                                <p className="text-xs text-slate-500">Data kinerja yang baru saja diinput.</p>
                            </div>
                            <Badge variant="outline">Terbaru</Badge>
                        </div>
                        <DataTable
                            columns={[
                                { key: 'indikator', header: 'Indikator', sortable: true },
                                { key: 'opd', header: 'OPD' },
                                { key: 'periode', header: 'Periode', sortable: true },
                                {
                                    key: 'capaian',
                                    header: 'Capaian',
                                    render: (val) => (
                                        <div>
                                            <p className="font-semibold">{val}</p>
                                        </div>
                                    ),
                                },
                            ]}
                            data={recentAchievements}
                        />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">Heatmap capaian</p>
                                <p className="text-xs text-slate-500">Persentase rata-rata per bulan</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            {heatmapCells.map((cell) => (
                                <div key={cell.label} className="flex flex-col gap-1 rounded-xl bg-white p-3 shadow-sm">
                                    <p className="text-xs font-semibold text-slate-500">{cell.label}</p>
                                    <ProgressBar value={cell.value} />
                                    <p className="text-sm font-semibold text-slate-800">{cell.value}%</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
