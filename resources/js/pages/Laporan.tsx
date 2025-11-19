import { Download } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import axios from 'axios';
import { AppShell } from '../components/AppShell';
import { DataTable } from '../components/DataTable';
import { ToolbarFilter } from '../components/ToolbarFilter';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';
import { useApi } from '../lib/api';

type ReportData = {
    opd: string;
    indicator: string;
    period: string;
    status: string;
    target: number | string;
    realisasi: number | string;
    achievement_rate: number | null;
};

type SummaryResponse = {
    filters: Record<string, unknown>;
    counts: { total: number; draft: number; valid: number; locked: number };
    by_opd: Array<{ opd: { id: number; nama: string }; total: number; locked: number }>;
    by_indicator_type: Record<string, number>;
    recent: Array<{ id: number; opd: string; indicator: string; period: string; status: string; updated_at: string }>;
    rows: ReportData[];
};

type OpdData = { id: number; nama: string; singkatan: string };

export default function LaporanPage() {
    const [filters, setFilters] = useState({ tahun: '2026', jenis: 'Semua', opd: 'Semua', status: 'Semua' });
    const { data: summaryData } = useApi<SummaryResponse>('/reports/summary');
    const { data: opdList } = useApi<OpdData[]>('/opds', []);

    const preview = summaryData?.rows || [];

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
        <AppShell title="Laporan" description="Bangun dan ekspor laporan" active="laporan">
            <div className="space-y-4">
                <ToolbarFilter title="Builder laporan">
                    <Select value={filters.tahun} onChange={(e) => setFilters({ ...filters, tahun: e.target.value })}>
                        <option>2026</option>
                        <option>2025</option>
                    </Select>
                    <Select value={filters.jenis} onChange={(e) => setFilters({ ...filters, jenis: e.target.value })}>
                        <option>Semua</option>
                        <option>IKU</option>
                        <option>IKD</option>
                        <option>IKK</option>
                    </Select>
                    <Select value={filters.opd} onChange={(e) => setFilters({ ...filters, opd: e.target.value })}>
                        <option>Semua</option>
                        {(opdList || []).map((opd) => (
                            <option key={opd.id}>{opd.singkatan}</option>
                        ))}
                    </Select>
                    <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                        <option>Semua</option>
                        <option>Draft</option>
                        <option>Tervalidasi</option>
                        <option>Terkunci</option>
                    </Select>
                </ToolbarFilter>
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => handleExport('excel')}>
                        <Download className="mr-2 h-4 w-4" aria-hidden /> Ekspor Excel
                    </Button>
                    <Button onClick={() => handleExport('pdf')}>
                        <Download className="mr-2 h-4 w-4" aria-hidden /> Ekspor PDF
                    </Button>
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
                            render: (val) => (val !== null ? `${val}%` : '-'),
                        },
                        { key: 'status', header: 'Status' },
                    ]}
                    data={preview}
                />
            </div>
        </AppShell>
    );
}
