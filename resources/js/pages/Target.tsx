import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { AppShell } from '../components/AppShell';
import { DataTable } from '../components/DataTable';
import { ToolbarFilter } from '../components/ToolbarFilter';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { useApi, useMutation } from '../lib/api';

type TargetData = {
    id: number;
    indicator_id: number;
    opd_id: number;
    period_id: number;
    nilai_target_num: number | null;
    nilai_target_text: string | null;
    catatan: string | null;
    indicator?: {
        id: number;
        nama: string;
        indicator_type: string;
        satuan: string;
    };
    opd?: { id: number; nama: string };
    period?: {
        id: number;
        periode: string;
        label: string;
        tahun: number;
    };
};

type OpdData = { id: number; nama: string };
type IndicatorData = {
    id: number;
    nama: string;
    satuan: string;
    indicator_type: string;
    frequency: string;
};
type PeriodData = { id: number; period_key: string; label: string; tahun: number };

export default function TargetPage() {
    const { data: targets, refetch } = useApi<TargetData[]>('/targets', []);
    const { data: opdList } = useApi<OpdData[]>('/opds', []);
    const { data: indikatorList } = useApi<IndicatorData[]>('/indicators', []);
    const { data: periodList } = useApi<PeriodData[]>('/periods', []);
    const { mutate: createTarget } = useMutation<Partial<TargetData>, TargetData>('/targets', 'post');
    const { mutate: updateTarget } = useMutation<Partial<TargetData>, TargetData>('/targets/:id', 'put');
    const { mutate: deleteTarget } = useMutation('/targets/:id', 'delete');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedTarget, setSelectedTarget] = useState<TargetData | null>(null);
    const [form, setForm] = useState({
        indicator_id: 0,
        opd_id: 0,
        period_id: 0,
        nilai_target_num: null as number | null,
        nilai_target_text: '',
        catatan: '',
    });

    const selectedIndicator = indikatorList?.find((i) => i.id === form.indicator_id);
    const isNumeric = selectedIndicator?.indicator_type && ['numeric', 'percent', 'index'].includes(selectedIndicator.indicator_type);

    const handleCreate = async () => {
        if (!form.indicator_id || !form.opd_id || !form.period_id) {
            toast.error('Indikator, OPD, dan Periode wajib diisi');
            return;
        }
        if (!form.nilai_target_num && !form.nilai_target_text) {
            toast.error('Nilai target wajib diisi');
            return;
        }
        try {
            await createTarget(form);
            setForm({
                indicator_id: 0,
                opd_id: 0,
                period_id: 0,
                nilai_target_num: null,
                nilai_target_text: '',
                catatan: '',
            });
            setShowCreateModal(false);
            toast.success('Target berhasil ditambahkan');
            refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || 'Gagal menambahkan target');
        }
    };

    const handleEdit = (target: TargetData) => {
        setSelectedTarget(target);
        setForm({
            indicator_id: target.indicator_id,
            opd_id: target.opd_id,
            period_id: target.period_id,
            nilai_target_num: target.nilai_target_num,
            nilai_target_text: target.nilai_target_text || '',
            catatan: target.catatan || '',
        });
        setShowEditModal(true);
    };

    const handleUpdate = async () => {
        if (!selectedTarget) return;
        if (!form.indicator_id || !form.opd_id || !form.period_id) {
            toast.error('Indikator, OPD, dan Periode wajib diisi');
            return;
        }
        try {
            await updateTarget(form, `/targets/${selectedTarget.id}`);
            setShowEditModal(false);
            setSelectedTarget(null);
            toast.success('Target berhasil diperbarui');
            refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || 'Gagal memperbarui target');
        }
    };

    const handleDelete = (target: TargetData) => {
        setSelectedTarget(target);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedTarget) return;
        try {
            await deleteTarget(undefined, `/targets/${selectedTarget.id}`);
            setShowDeleteModal(false);
            setSelectedTarget(null);
            toast.success('Target berhasil dihapus');
            refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || 'Gagal menghapus target');
        }
    };

    const enriched = (targets || []).map((t) => ({
        ...t,
        indikator: t.indicator?.nama ?? '-',
        opd: t.opd?.nama ?? '-',
        periode: t.period?.label ?? '-',
        nilai_display: t.nilai_target_num ?? t.nilai_target_text ?? '-',
    }));

    return (
        <AppShell title="Target" description="Kelola target capaian" active="target">
            <div className="space-y-4">
                <ToolbarFilter title="Target indikator">
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Tambah Target
                    </Button>
                </ToolbarFilter>

                <DataTable
                    columns={[
                        { key: 'indikator', header: 'Indikator', sortable: true },
                        { key: 'opd', header: 'OPD', sortable: true },
                        { key: 'periode', header: 'Periode', sortable: true },
                        {
                            key: 'nilai_display',
                            header: 'Nilai Target',
                            render: (val, row) => (
                                <div>
                                    <span className="font-semibold">{String(val)}</span>
                                    {row.indicator?.satuan && <span className="ml-1 text-xs text-slate-500">{row.indicator.satuan}</span>}
                                </div>
                            ),
                        },
                        { key: 'catatan', header: 'Catatan' },
                        {
                            key: 'id',
                            header: 'Aksi',
                            render: (_val, row) => (
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => {
                                            const target = targets?.find((t) => t.id === row.id);
                                            if (target) handleEdit(target);
                                        }}
                                    >
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() => {
                                            const target = targets?.find((t) => t.id === row.id);
                                            if (target) handleDelete(target);
                                        }}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            ),
                        },
                    ]}
                    data={enriched}
                />
            </div>

            {/* Create Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Tambah Target Baru</DialogTitle>
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
                                <Label>Nilai Target (Numerik) *</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={form.nilai_target_num ?? ''}
                                    onChange={(e) => setForm({ ...form, nilai_target_num: e.target.value ? Number(e.target.value) : null })}
                                />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>Nilai Target (Teks) *</Label>
                                <Input value={form.nilai_target_text} onChange={(e) => setForm({ ...form, nilai_target_text: e.target.value })} />
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

            {/* Edit Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Target</DialogTitle>
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
                                <Label>Nilai Target (Numerik) *</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={form.nilai_target_num ?? ''}
                                    onChange={(e) => setForm({ ...form, nilai_target_num: e.target.value ? Number(e.target.value) : null })}
                                />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>Nilai Target (Teks) *</Label>
                                <Input value={form.nilai_target_text} onChange={(e) => setForm({ ...form, nilai_target_text: e.target.value })} />
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
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleUpdate}>Perbarui</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>
                            Apakah Anda yakin ingin menghapus target untuk <strong>{selectedTarget?.indicator?.nama}</strong>?
                        </p>
                        <p className="mt-2 text-sm text-slate-600">Tindakan ini tidak dapat dibatalkan.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                            Batal
                        </Button>
                        <Button variant="danger" onClick={confirmDelete}>
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppShell>
    );
}
