import { useMemo } from 'react';

import { AppShell } from '../components/AppShell';
import { DataTable } from '../components/DataTable';
import { StatCard } from '../components/StatCard';
import { ProgressBar } from '../components/StatusBar';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { useApi } from '../lib/api';

type ReportRow = {
    opd: string;
    indicator: string;
    period: string;
    target: number | string;
    realisasi: number | string;
    achievement_rate: number | null;
};

type SummaryResponse = {
    filters: Record<string, unknown>;
    counts: { total: number };
    by_opd: Array<{ opd: { id: number; nama: string }; total: number }>;
    by_indicator_type: Record<string, number>;
    recent: Array<{ id: number; opd: string; indicator: string; period: string; updated_at: string }>;
    rows: ReportRow[];
};

export default function Dashboard() {
    const { data: summary, loading } = useApi<SummaryResponse>('/reports/summary');

    const recentAchievements = useMemo(
        () =>
            (summary?.recent || []).slice(0, 5).map((item) => ({
                indikator: item.indicator,
                opd: item.opd,
                period: item.period,
                updated_at: item.updated_at ? new Date(item.updated_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-',
            })),
        [summary?.recent],
    );

    const completionStats = useMemo(() => {
        const rows = summary?.rows || [];
        const completed = rows.filter((row) => row.achievement_rate !== null);
        const average =
            completed.length > 0
                ? Number((completed.reduce((sum, row) => sum + (row.achievement_rate ?? 0), 0) / completed.length).toFixed(1))
                : 0;

        return {
            completed: completed.length,
            average,
        };
    }, [summary?.rows]);

    const totalTargets = summary?.counts.total ?? 0;
    const indicatorTotals = Object.values(summary?.by_indicator_type || {}).reduce((sum, value) => sum + value, 0);
    const opdParticipation = summary?.by_opd?.length ?? 0;

    const statCards = [
        { title: 'Total Target Kinerja', value: totalTargets.toString(), description: 'Seluruh target yang tercatat', trend: 'up' as const },
        { title: 'Target dengan Capaian', value: completionStats.completed.toString(), description: 'Memiliki data realisasi', progress: totalTargets ? Math.round((completionStats.completed / totalTargets) * 100) : 0 },
        { title: 'Rata-rata Capaian', value: `${completionStats.average}%`, description: 'Rerata terhadap target', progress: Math.min(100, completionStats.average) },
        { title: 'Partisipasi OPD', value: opdParticipation.toString(), description: 'OPD yang menyetor data', trend: 'up' as const },
    ];

    const indicatorTypeDistribution = useMemo(() => {
        const entries = Object.entries(summary?.by_indicator_type || {});
        return entries.map(([type, count]) => ({
            type,
            count,
            percent: indicatorTotals ? Math.round((count / indicatorTotals) * 100) : 0,
        }));
    }, [summary?.by_indicator_type, indicatorTotals]);

    const opdContribution = useMemo(() => {
        const items = summary?.by_opd || [];
        const base = totalTargets || Math.max(...items.map((item) => item.total), 1);
        return items
            .sort((a, b) => b.total - a.total)
            .slice(0, 6)
            .map((item) => ({
                name: item.opd.nama,
                total: item.total,
                percent: Math.round((item.total / base) * 100),
            }));
    }, [summary?.by_opd, totalTargets]);

    return (
        <AppShell title="Dashboard" description="Ringkasan progres indikator kinerja Diskominfo Prov. Sulawesi Tengah" active="dashboard">
            <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {loading
                        ? Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} className="h-32 rounded-2xl" />)
                        : statCards.map((card) => <StatCard key={card.title} {...card} />)}
                </div>

                <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
                    <div className="min-w-0 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">Capaian Terbaru</p>
                                <p className="text-xs text-slate-500">Data kinerja yang baru saja diinput.</p>
                            </div>
                            <Badge variant="info">Terbaru</Badge>
                        </div>
                        {loading ? (
                            <Skeleton className="h-[360px] w-full rounded-2xl" />
                        ) : (
                            <DataTable
                                columns={[
                                    { key: 'indikator', header: 'Indikator', sortable: true },
                                    { key: 'opd', header: 'OPD', sortable: true },
                                    { key: 'period', header: 'Periode', sortable: true },
                                    { key: 'updated_at', header: 'Diperbarui' },
                                ]}
                                data={recentAchievements}
                            />
                        )}
                    </div>
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm text-slate-700">Komposisi Jenis Indikator</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {loading ? (
                                    <Skeleton className="h-40 w-full rounded-2xl" />
                                ) : indicatorTypeDistribution.length === 0 ? (
                                    <p className="text-sm text-slate-500">Belum ada data indikator.</p>
                                ) : (
                                    indicatorTypeDistribution.map((item) => (
                                        <div key={item.type} className="space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-600">{item.type}</span>
                                                <span className="font-semibold text-slate-900">{item.count}</span>
                                            </div>
                                            <ProgressBar value={item.percent} />
                                            <p className="text-xs text-slate-500">
                                                {item.percent}% dari {indicatorTotals} indikator
                                            </p>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm text-slate-700">Kontribusi OPD</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {loading ? (
                                    <Skeleton className="h-40 w-full rounded-2xl" />
                                ) : opdContribution.length === 0 ? (
                                    <p className="text-sm text-slate-500">Belum ada data capaian OPD.</p>
                                ) : (
                                    opdContribution.map((item) => (
                                        <div key={item.name} className="space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <div>
                                                    <p className="font-semibold text-slate-800">{item.name}</p>
                                                    <p className="text-xs text-slate-500">{item.total} target</p>
                                                </div>
                                                <span className="text-sm font-semibold text-slate-800">{item.percent}%</span>
                                            </div>
                                            <ProgressBar value={item.percent} />
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
