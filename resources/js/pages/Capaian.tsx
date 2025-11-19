import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { AppShell } from '../components/AppShell';
import { DataTable } from '../components/DataTable';
import { ToolbarFilter } from '../components/ToolbarFilter';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { useApi, useMutation } from '../lib/api';

type PageProps = { onNavigate?: (href: string) => void };

type AchievementData = {
    id: number;
    indicator_id: number;
    opd_id: number;
    period_id: number;
    nilai_realisasi_num: number | null;
    nilai_realisasi_text: string | null;
    catatan: string | null;
    status: 'draft' | 'validated' | 'locked';
    target_value: number | null;
    achievement_rate: number | null;
    indicator?: {
        id: number;
        nama: string;
        indicator_type: string;
        satuan: string;
    };
    opd?: { id: number; nama: string };
    period?: {
        id: number;
        label: string;
        period_key: string;
        tahun: number;
    };
};

type OpdData = { id: number; nama: string };
type IndicatorData = {
    id: number;
    nama: string;
    satuan: string;
    indicator_type: string;
};
type PeriodData = { id: number; period_key: string; label: string; tahun: number };

export default function CapaianPage({ onNavigate }: PageProps) {
    const { data: achievements, refetch } = useApi<AchievementData[]>('/achievements', []);
    const { data: opdList } = useApi<OpdData[]>('/opds', []);
    const { data: indikatorList } = useApi<IndicatorData[]>('/indicators', []);
    const { data: periodList } = useApi<PeriodData[]>('/periods', []);

    const { mutate: createAchievement } = useMutation<Partial<AchievementData>, AchievementData>('/achievements', 'post');
    const { mutate: validateAchievement } = useMutation('/achievements/:id/validate', 'patch');
    const { mutate: lockAchievement } = useMutation('/achievements/:id/lock', 'patch');
    const { mutate: unlockAchievement } = useMutation('/achievements/:id/unlock', 'patch');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [selectedAchievement, setSelectedAchievement] = useState<AchievementData | null>(null);
    const [unlockReason, setUnlockReason] = useState('');
    const [form, setForm] = useState({
        indicator_id: 0,
        opd_id: 0,
        period_id: 0,
        nilai_realisasi_num: null as number | null,
        nilai_realisasi_text: '',
        catatan: '',
    });

    const selectedIndicator = indikatorList?.find((i) => i.id === form.indicator_id);
    const isNumeric = selectedIndicator?.indicator_type && ['numeric', 'percent', 'index'].includes(selectedIndicator.indicator_type);

    const handleCreate = async () => {
        if (!form.indicator_id || !form.opd_id || !form.period_id) {
            toast.error('Indikator, OPD, dan Periode wajib diisi');
            return;
        }
        if (!form.nilai_realisasi_num && !form.nilai_realisasi_text) {
            toast.error('Nilai realisasi wajib diisi');
            return;
        }
        try {
            await createAchievement(form);
            setForm({
                indicator_id: 0,
                opd_id: 0,
                period_id: 0,
                nilai_realisasi_num: null,
                nilai_realisasi_text: '',
                catatan: '',
            });
            setShowCreateModal(false);
            toast.success('Capaian berhasil ditambahkan');
            refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || 'Gagal menambahkan capaian');
        }
    };

    const handleValidate = async (achievement: AchievementData) => {
        try {
            await validateAchievement(undefined, `/achievements/${achievement.id}/validate`);
            toast.success('Capaian berhasil divalidasi');
            refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || 'Gagal memvalidasi capaian');
        }
    };

    const handleLock = async (achievement: AchievementData) => {
        try {
            await lockAchievement(undefined, `/achievements/${achievement.id}/lock`);
            toast.success('Capaian berhasil dikunci');
            refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || 'Gagal mengunci capaian');
        }
    };

    const handleUnlockRequest = (achievement: AchievementData) => {
        setSelectedAchievement(achievement);
        setShowUnlockModal(true);
    };

    const handleUnlock = async () => {
        if (!selectedAchievement) return;
        if (!unlockReason.trim()) {
            toast.error('Alasan wajib diisi');
            return;
        }
        try {
            await unlockAchievement({ reason: unlockReason }, `/achievements/${selectedAchievement.id}/unlock`);
            setShowUnlockModal(false);
            setSelectedAchievement(null);
            setUnlockReason('');
            toast.success('Capaian berhasil dibuka');
            refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || 'Gagal membuka kunci capaian');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <Badge variant="muted">Draft</Badge>;
            case 'validated':
                return <Badge variant="success">Tervalidasi</Badge>;
            case 'locked':
                return <Badge variant="danger">Terkunci</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const enriched = (achievements || []).map((a) => ({
        ...a,
        indikator: a.indicator?.nama ?? '-',
        opd: a.opd?.nama ?? '-',
        periode: a.period?.label ?? '-',
        nilai_display: a.nilai_realisasi_num ?? a.nilai_realisasi_text ?? '-',
    }));

    return (
        <AppShell title="Capaian" description="Input capaian dan kelola evidensi" active="entri" onNavigate={onNavigate}>
            <div className="space-y-4">
                <ToolbarFilter title="Daftar capaian" searchPlaceholder="Cari capaian">
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Tambah Capaian
                    </Button>
                </ToolbarFilter>

                <DataTable
                    columns={[
                        { key: 'indikator', header: 'Indikator', sortable: true },
                        { key: 'opd', header: 'OPD', sortable: true },
                        { key: 'periode', header: 'Periode', sortable: true },
                        {
                            key: 'nilai_display',
                            header: 'Nilai Realisasi',
                            render: (val, row) => (
                                <div>
                                    <div className="font-semibold">{String(val)}</div>
                                    {row.indicator?.satuan && <div className="text-xs text-slate-500">{row.indicator.satuan}</div>}
                                    {row.achievement_rate && (
                                        <Badge variant="info" className="mt-1">
                                            {row.achievement_rate}% dari target
                                        </Badge>
                                    )}
                                </div>
                            ),
                        },
                        {
                            key: 'status',
                            header: 'Status',
                            render: (val, row) => (
                                <div className="space-y-2">
                                    {getStatusBadge(val as string)}
                                    <div className="flex flex-wrap gap-1">
                                        {val === 'draft' && (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => {
                                                    const achievement = achievements?.find((a) => a.id === row.id);
                                                    if (achievement) handleValidate(achievement);
                                                }}
                                            >
                                                Validasi
                                            </Button>
                                        )}
                                        {val === 'validated' && (
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => {
                                                    const achievement = achievements?.find((a) => a.id === row.id);
                                                    if (achievement) handleLock(achievement);
                                                }}
                                            >
                                                Kunci
                                            </Button>
                                        )}
                                        {val === 'locked' && (
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    const achievement = achievements?.find((a) => a.id === row.id);
                                                    if (achievement) handleUnlockRequest(achievement);
                                                }}
                                            >
                                                Buka Kunci
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ),
                        },
                        { key: 'catatan', header: 'Catatan' },
                    ]}
                    data={enriched}
                    searchKeys={['indikator', 'opd', 'periode']}
                />
            </div>

            {/* Create Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Tambah Capaian Baru</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Indikator *</Label>
                            <Select value={form.indicator_id} onChange={(e) => setForm({ ...form, indicator_id: Number(e.target.value) })}>
                                <option value="0">Pilih Indikator</option>
                                {(indikatorList || []).map((ind) => (
                                    <option key={ind.id} value={ind.id}>
                                        {ind.nama} ({ind.satuan})
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>OPD *</Label>
                            <Select value={form.opd_id} onChange={(e) => setForm({ ...form, opd_id: Number(e.target.value) })}>
                                <option value="0">Pilih OPD</option>
                                {(opdList || []).map((opd) => (
                                    <option key={opd.id} value={opd.id}>
                                        {opd.nama}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Periode *</Label>
                            <Select value={form.period_id} onChange={(e) => setForm({ ...form, period_id: Number(e.target.value) })}>
                                <option value="0">Pilih Periode</option>
                                {(periodList || []).map((period) => (
                                    <option key={period.id} value={period.id}>
                                        {period.label} ({period.tahun})
                                    </option>
                                ))}
                            </Select>
                        </div>
                        {isNumeric ? (
                            <div className="space-y-2">
                                <Label>Nilai Realisasi (Numerik) *</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={form.nilai_realisasi_num ?? ''}
                                    onChange={(e) => setForm({ ...form, nilai_realisasi_num: e.target.value ? Number(e.target.value) : null })}
                                />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>Nilai Realisasi (Teks) *</Label>
                                <Input
                                    value={form.nilai_realisasi_text}
                                    onChange={(e) => setForm({ ...form, nilai_realisasi_text: e.target.value })}
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Catatan</Label>
                            <Textarea
                                placeholder="Catatan tambahan (opsional)"
                                value={form.catatan}
                                onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleCreate}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Unlock Modal */}
            <Dialog open={showUnlockModal} onOpenChange={setShowUnlockModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Buka Kunci Capaian</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p>Apakah Anda yakin ingin membuka kunci capaian ini?</p>
                        <div className="space-y-2">
                            <Label>Alasan *</Label>
                            <Textarea
                                placeholder="Masukkan alasan pembukaan kunci"
                                value={unlockReason}
                                onChange={(e) => setUnlockReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setShowUnlockModal(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleUnlock}>Buka Kunci</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppShell>
    );
}
