import { Building2, Download, FileText, PieChart } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import axios from 'axios';
import { AppShell } from '../components/AppShell';
import { DataTable } from '../components/DataTable';
import { ToolbarFilter } from '../components/ToolbarFilter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select } from '../components/ui/select';
import { useApi } from '../lib/api';

type ReportData = {
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
    rows: ReportData[];
};

type OpdData = { id: number; nama: string; singkatan: string };

type ReportOptions = {
    years: number[];
    types: string[];
};

export default function LaporanPage() {
    const [filters, setFilters] = useState({ tahun: '2025', jenis: 'Semua', opd: 'Semua' });

    const { data: options } = useApi<ReportOptions>('/reports/options');

    // Construct query string for filters
    const queryString = new URLSearchParams(
        Object.entries(filters).reduce(
            (acc, [key, value]) => {
                if (value !== 'Semua') acc[key] = value;
                return acc;
            },
            {} as Record<string, string>,
        ),
    ).toString();

    const { data: summaryData } = useApi<SummaryResponse>(`/reports/summary?${queryString}`);
    const { data: opdList } = useApi<OpdData[]>('/opds', []);

    const preview = summaryData?.rows || [];
    const counts = summaryData?.counts || { total: 0 };
    const byType = summaryData?.by_indicator_type || {};

    const handleExport = async (format: 'excel' | 'pdf') => {
        try {
            const response = await axios.get(`/api/v1/reports/export`, {
                params: { format, ...filters },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `laporan.${format === 'excel' ? 'xlsx' : 'pdf'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success(`Laporan ${format === 'excel' ? 'Excel' : 'PDF'} berhasil diunduh`);
        } catch {
            toast.error('Gagal mengekspor laporan');
        }
    };

    return (
        <AppShell title="Laporan" description="Bangun dan ekspor laporan kinerja" active="laporan">
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Laporan</CardTitle>
                            <FileText className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{counts.total}</div>
                            <p className="text-xs text-slate-500">Data kinerja tercatat</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Partisipasi OPD</CardTitle>
                            <Building2 className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summaryData?.by_opd?.length || 0}</div>
                            <p className="text-xs text-slate-500">OPD berkontribusi</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Jenis Indikator</CardTitle>
                            <PieChart className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4 text-sm">
                                <div className="flex flex-col">
                                    <span className="font-bold">{byType['IKU'] || 0}</span>
                                    <span className="text-xs text-slate-500">IKU</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold">{byType['IKD'] || 0}</span>
                                    <span className="text-xs text-slate-500">IKD</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold">{byType['IKK'] || 0}</span>
                                    <span className="text-xs text-slate-500">IKK</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <ToolbarFilter title="Filter Laporan">
                        <Select value={filters.tahun} onChange={(e) => setFilters({ ...filters, tahun: e.target.value })}>
                            {(options?.years || [2025]).map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </Select>
                        <Select value={filters.jenis} onChange={(e) => setFilters({ ...filters, jenis: e.target.value })}>
                            <option>Semua</option>
                            {(options?.types || ['IKU', 'IKD', 'IKK']).map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </Select>
                        <Select value={filters.opd} onChange={(e) => setFilters({ ...filters, opd: e.target.value })}>
                            <option>Semua</option>
                            {(opdList || []).map((opd) => (
                                <option key={opd.id} value={opd.singkatan}>
                                    {opd.singkatan}
                                </option>
                            ))}
                        </Select>
                    </ToolbarFilter>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => handleExport('excel')}>
                            <Download className="mr-2 h-4 w-4" aria-hidden /> Ekspor Excel
                        </Button>
                        <Button onClick={() => handleExport('pdf')}>
                            <Download className="mr-2 h-4 w-4" aria-hidden /> Ekspor PDF
                        </Button>
                    </div>
                </div>

                <DataTable
                    columns={[
                        { key: 'indicator', header: 'Indikator', sortable: true },
                        { key: 'opd', header: 'OPD', sortable: true },
                        { key: 'period', header: 'Periode' },
                        { key: 'target', header: 'Target' },
                        { key: 'realisasi', header: 'Realisasi' },
                        {
                            key: 'achievement_rate',
                            header: 'Capaian %',
                            render: (val) => {
                                if (val === null) return '-';
                                const numVal = Number(val);
                                return (
                                    <span className={numVal >= 100 ? 'font-bold text-green-600' : numVal >= 80 ? 'text-blue-600' : 'text-red-600'}>
                                        {val}%
                                    </span>
                                );
                            },
                        },
                    ]}
                    data={preview}
                />
            </div>
        </AppShell>
    );
}
