import { Building2, Download, ExternalLink, Eye, File, FileText, PieChart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import axios from 'axios';
import { AppShell } from '../components/AppShell';
import { DataTable } from '../components/DataTable';
import { ToolbarFilter } from '../components/ToolbarFilter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select } from '../components/ui/select';
import { useApi } from '../lib/api';
import { handleError } from '../lib/handle-error';

type Evidence = {
    id: number;
    description: string;
    file_url: string | null;
    external_url: string | null;
};

type ReportData = {
    opd: string;
    indicator: string;
    period: string;
    satuan: string | null;
    target: number | string;
    realisasi: number | string;
    achievement_rate: number | null;
    evidences: Evidence[];
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
    const [selectedEvidences, setSelectedEvidences] = useState<Evidence[]>([]);
    const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);

    const { data: options } = useApi<ReportOptions>('/reports/options');

    useEffect(() => {
        if (options?.years && options.years.length > 0) {
            const currentYear = Number(filters.tahun);
            if (!options.years.includes(currentYear)) {
                setFilters((prev) => ({ ...prev, tahun: String(options.years[0]) }));
            }
        }
    }, [options, filters.tahun]);

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

    const handleExport = async (format: 'excel' | 'pdf', type: 'detail' | 'summary' = 'detail') => {
        try {
            const response = await axios.get(`/api/v1/reports/export`, {
                params: { format, type, ...filters },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `laporan-${type}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success(`Laporan ${type} ${format === 'excel' ? 'Excel' : 'PDF'} berhasil diunduh`);
        } catch (error: unknown) {
            handleError(error, 'Gagal mengekspor laporan');
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
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => handleExport('pdf', 'summary')}>
                            <PieChart className="mr-2 h-4 w-4" aria-hidden /> Ekspor Ringkasan OPD
                        </Button>
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
                        { key: 'satuan', header: 'Satuan', render: (val) => (val as string) || '-' },
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
                                        {val as number}%
                                    </span>
                                );
                            },
                        },
                        {
                            key: 'evidences',
                            header: 'Evidence',
                            render: (val) => {
                                const evidences = val as Evidence[];
                                if (!evidences || evidences.length === 0) return <span className="text-slate-400">-</span>;
                                return (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedEvidences(evidences);
                                            setIsEvidenceModalOpen(true);
                                        }}
                                    >
                                        <Eye className="mr-1 h-4 w-4" />
                                        Lihat ({evidences.length})
                                    </Button>
                                );
                            },
                        },
                    ]}
                    data={preview}
                />
            </div>

            <Dialog open={isEvidenceModalOpen} onOpenChange={setIsEvidenceModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bukti Dukung (Evidence)</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {selectedEvidences.map((evidence) => (
                            <div key={evidence.id} className="flex items-start gap-3 rounded-lg border p-3">
                                <div className="mt-1">
                                    <FileText className="h-5 w-5 text-slate-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{evidence.description || 'Tanpa deskripsi'}</p>
                                    <div className="mt-2 flex flex-wrap gap-3">
                                        {evidence.external_url && (
                                            <a
                                                href={evidence.external_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                Buka Tautan
                                            </a>
                                        )}
                                        {evidence.file_url && (
                                            <a
                                                href={evidence.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-xs text-orange-600 hover:underline"
                                            >
                                                <File className="h-3 w-3" />
                                                Unduh File
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {selectedEvidences.length === 0 && <p className="text-center text-slate-500">Tidak ada evidence.</p>}
                    </div>
                </DialogContent>
            </Dialog>
        </AppShell>
    );
}
