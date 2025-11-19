import { Edit, Info, ListChecks, Phone, Plus, Trash2, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AppShell } from '../components/AppShell';
import { DataTable } from '../components/DataTable';
import { ToolbarFilter } from '../components/ToolbarFilter';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
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

type OpdData = {
    id: number;
    nama: string;
    singkatan: string;
    kontak_nama?: string;
    kontak_hp?: string;
    aktif: boolean;
};

type IndicatorData = {
    id: number;
    nama: string;
    satuan: string;
    indicator_type: string;
    frequency: string;
    opd_id: number | null;
};

type PeriodData = { id: number; period_key: string; label: string; tahun: number };

export default function OpdIndikatorPage() {
    const { data: opdList = [] } = useApi<OpdData[]>('/opds', []);
    const { data: indikatorList = [] } = useApi<IndicatorData[]>('/indicators', []);
    const { data: periodList = [] } = useApi<PeriodData[]>('/periods', []);
    const { data: targets = [], refetch: refetchTargets } = useApi<TargetData[]>('/targets', []);
    const { mutate: createTarget } = useMutation<Partial<TargetData>, TargetData>('/targets', 'post');
    const { mutate: updateTarget } = useMutation<Partial<TargetData>, TargetData>('/targets/:id', 'put');
    const { mutate: deleteTarget } = useMutation('/targets/:id', 'delete');

    const [selectedOpdId, setSelectedOpdId] = useState<number | null>(null);
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

    useEffect(() => {
        if (!selectedOpdId && opdList.length > 0) {
            setSelectedOpdId(opdList[0].id);
        }
    }, [opdList, selectedOpdId]);

    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            opd_id: selectedOpdId ?? 0,
            indicator_id: 0,
            nilai_target_num: null,
            nilai_target_text: '',
            catatan: '',
        }));
        setSelectedTarget(null);
        setShowEditModal(false);
        setShowCreateModal(false);
        setShowDeleteModal(false);
    }, [selectedOpdId]);

    const selectedOpd = useMemo(() => opdList.find((opd) => opd.id === selectedOpdId) || null, [opdList, selectedOpdId]);

    const opdIndicators = useMemo(
        () => indikatorList.filter((ind) => ind.opd_id === selectedOpdId),
        [indikatorList, selectedOpdId],
    );

    const opdTargets = useMemo(
        () => targets.filter((t) => t.opd_id === selectedOpdId),
        [targets, selectedOpdId],
    );

    const selectedIndicator = opdIndicators.find((i) => i.id === form.indicator_id);
    const isNumeric = selectedIndicator?.indicator_type && ['numeric', 'percent', 'index'].includes(selectedIndicator.indicator_type);

    const handleCreate = async () => {
        if (!selectedOpdId) {
            toast.error('Pilih OPD terlebih dahulu');
            return;
        }
        if (!form.indicator_id || !form.period_id) {
            toast.error('Indikator dan Periode wajib diisi');
            return;
        }
        if (!form.nilai_target_num && !form.nilai_target_text) {
            toast.error('Nilai target wajib diisi');
            return;
        }
        try {
            await createTarget({ ...form, opd_id: selectedOpdId });
            setForm({
                indicator_id: 0,
                opd_id: selectedOpdId,
                period_id: 0,
                nilai_target_num: null,
                nilai_target_text: '',
                catatan: '',
            });
            setShowCreateModal(false);
            toast.success('Target berhasil ditambahkan');
            refetchTargets();
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
        if (!form.indicator_id || !form.period_id) {
            toast.error('Indikator dan Periode wajib diisi');
            return;
        }
        try {
            await updateTarget({ ...form, opd_id: selectedOpdId ?? form.opd_id }, `/targets/${selectedTarget.id}`);
            setShowEditModal(false);
            setSelectedTarget(null);
            toast.success('Target berhasil diperbarui');
            refetchTargets();
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
            refetchTargets();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || 'Gagal menghapus target');
        }
    };

    const enriched = opdTargets.map((t) => ({
        ...t,
        indikator: t.indicator?.nama ?? '-',
        opd: t.opd?.nama ?? selectedOpd?.nama ?? '-',
        periode: t.period?.label ?? '-',
        nilai_display: t.nilai_target_num ?? t.nilai_target_text ?? '-',
    }));

    return (
        <AppShell title="Indikator OPD" description="Kelola indikator dan target per OPD" active="opd-indikator">
            <div className="space-y-4">
                <ToolbarFilter title="Pilih OPD">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        <Select
                            value={selectedOpdId ?? 0}
                            onChange={(e) => setSelectedOpdId(Number(e.target.value) || null)}
                        >
                            <option value={0}>Pilih OPD</option>
                            {opdList.map((opd) => (
                                <option key={opd.id} value={opd.id}>
                                    {opd.nama}
                                </option>
                            ))}
                        </Select>
                        <Button onClick={() => setShowCreateModal(true)} disabled={!selectedOpdId}>
                            <Plus className="mr-2 h-4 w-4" /> Tambah Target
                        </Button>
                    </div>
                </ToolbarFilter>

                {selectedOpd ? (
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="md:col-span-2">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-lg">Detail OPD</CardTitle>
                                <Info className="h-4 w-4 text-slate-500" />
                            </CardHeader>
                            <CardContent className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs uppercase text-slate-500">Nama OPD</p>
                                    <p className="text-base font-semibold">{selectedOpd.nama}</p>
                                    <Badge className="mt-1" variant={selectedOpd.aktif ? 'success' : 'muted'}>
                                        {selectedOpd.aktif ? 'Aktif' : 'Nonaktif'}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-xs uppercase text-slate-500">PIC</p>
                                    <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                                        <UserRound className="h-4 w-4" />
                                        {selectedOpd.kontak_nama || '-'}
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                                        <Phone className="h-4 w-4" />
                                        {selectedOpd.kontak_hp || '-'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-lg">Indikator ({opdIndicators.length})</CardTitle>
                                <ListChecks className="h-4 w-4 text-slate-500" />
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {opdIndicators.length > 0 ? (
                                    opdIndicators.map((ind) => (
                                        <div key={ind.id} className="rounded-md border border-slate-200 p-2">
                                            <p className="text-sm font-semibold">{ind.nama}</p>
                                            <p className="text-xs text-slate-500">{ind.satuan}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500">Belum ada indikator untuk OPD ini.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-6 text-center text-sm text-slate-600">
                            Pilih OPD untuk melihat detail dan indikator terkait.
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Target Indikator OPD</h2>
                        <Button onClick={() => setShowCreateModal(true)} disabled={!selectedOpdId}>
                            <Plus className="mr-2 h-4 w-4" /> Tambah Target
                        </Button>
                    </div>
                    <DataTable
                        columns={[
                            { key: 'indikator', header: 'Indikator', sortable: true },
                            { key: 'periode', header: 'Periode', sortable: true },
                            {
                                key: 'nilai_display',
                                header: 'Nilai Target',
                                render: (val, row) => (
                                    <div>
                                        <span className="font-semibold">{String(val)}</span>
                                        {row.indicator?.satuan && (
                                            <span className="ml-1 text-xs text-slate-500">{row.indicator.satuan}</span>
                                        )}
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
                                                const target = opdTargets.find((t) => t.id === row.id);
                                                if (target) handleEdit(target);
                                            }}
                                        >
                                            <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => {
                                                const target = opdTargets.find((t) => t.id === row.id);
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
                            <Select
                                value={form.indicator_id}
                                onChange={(e) => setForm({ ...form, indicator_id: Number(e.target.value) })}
                                disabled={!selectedOpdId}
                            >
                                <option value="0">Pilih Indikator</option>
                                {opdIndicators.map((ind) => (
                                    <option key={ind.id} value={ind.id}>
                                        {ind.nama} ({ind.satuan})
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Periode *</Label>
                            <Select value={form.period_id} onChange={(e) => setForm({ ...form, period_id: Number(e.target.value) })}>
                                <option value="0">Pilih Periode</option>
                                {periodList.map((period) => (
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
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            nilai_target_num: e.target.value ? Number(e.target.value) : null,
                                            nilai_target_text: '',
                                        })
                                    }
                                />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>Nilai Target (Teks) *</Label>
                                <Input
                                    value={form.nilai_target_text}
                                    onChange={(e) => setForm({ ...form, nilai_target_text: e.target.value, nilai_target_num: null })}
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
                        <Button onClick={handleCreate} disabled={!selectedOpdId}>
                            Simpan
                        </Button>
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
                            <Select
                                value={form.indicator_id}
                                onChange={(e) => setForm({ ...form, indicator_id: Number(e.target.value) })}
                                disabled={!selectedOpdId}
                            >
                                <option value="0">Pilih Indikator</option>
                                {opdIndicators.map((ind) => (
                                    <option key={ind.id} value={ind.id}>
                                        {ind.nama} ({ind.satuan})
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Periode *</Label>
                            <Select value={form.period_id} onChange={(e) => setForm({ ...form, period_id: Number(e.target.value) })}>
                                <option value="0">Pilih Periode</option>
                                {periodList.map((period) => (
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
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            nilai_target_num: e.target.value ? Number(e.target.value) : null,
                                            nilai_target_text: '',
                                        })
                                    }
                                />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>Nilai Target (Teks) *</Label>
                                <Input
                                    value={form.nilai_target_text}
                                    onChange={(e) => setForm({ ...form, nilai_target_text: e.target.value, nilai_target_num: null })}
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
