import { Edit, Plus, Trash2 } from 'lucide-react';
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

type IndicatorData = {
    id: number;
    nama: string;
    jenis: string;
    indicator_type: string;
    satuan: string;
    sumber_data: string | null;
    frequency: string;
    keterangan: string | null;
    version: number;
    aktif: boolean;
};

export default function IndikatorPage({ onNavigate }: PageProps) {
    const { data: indikatorList, refetch } = useApi<IndicatorData[]>('/indicators', []);
    const { mutate: createIndicator } = useMutation<Partial<IndicatorData>, IndicatorData>('/indicators', 'post');
    const { mutate: updateIndicator } = useMutation<Partial<IndicatorData>, IndicatorData>('/indicators/:id', 'put');
    const { mutate: deleteIndicator } = useMutation('/indicators/:id', 'delete');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedIndicator, setSelectedIndicator] = useState<IndicatorData | null>(null);
    const [form, setForm] = useState({
        nama: '',
        jenis: 'IKU' as 'IKU' | 'IKD' | 'IKK',
        indicator_type: 'numeric' as 'numeric' | 'percent' | 'index' | 'text',
        satuan: '',
        sumber_data: '',
        frequency: 'annual' as 'annual' | 'semester' | 'quarter' | 'month',
        keterangan: '',
        version: 1,
        aktif: true,
    });

    const handleCreate = async () => {
        if (!form.nama || !form.satuan) {
            toast.error('Nama dan satuan wajib diisi');
            return;
        }
        try {
            await createIndicator(form);
            setForm({
                nama: '',
                jenis: 'IKU',
                indicator_type: 'numeric',
                satuan: '',
                sumber_data: '',
                frequency: 'annual',
                keterangan: '',
                version: 1,
                aktif: true,
            });
            setShowCreateModal(false);
            toast.success('Indikator berhasil ditambahkan');
            refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || 'Gagal menambahkan indikator');
        }
    };

    const handleEdit = (indicator: IndicatorData) => {
        setSelectedIndicator(indicator);
        setForm({
            nama: indicator.nama,
            jenis: indicator.jenis as 'IKU' | 'IKD' | 'IKK',
            indicator_type: indicator.indicator_type as 'numeric' | 'percent' | 'index' | 'text',
            satuan: indicator.satuan,
            sumber_data: indicator.sumber_data || '',
            frequency: indicator.frequency as 'annual' | 'semester' | 'quarter' | 'month',
            keterangan: indicator.keterangan || '',
            version: indicator.version || 1,
            aktif: indicator.aktif,
        });
        setShowEditModal(true);
    };

    const handleUpdate = async () => {
        if (!selectedIndicator) return;
        if (!form.nama || !form.satuan) {
            toast.error('Nama dan satuan wajib diisi');
            return;
        }
        try {
            await updateIndicator(form, `/indicators/${selectedIndicator.id}`);
            setShowEditModal(false);
            setSelectedIndicator(null);
            toast.success('Indikator berhasil diperbarui');
            refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || 'Gagal memperbarui indikator');
        }
    };

    const handleDelete = (indicator: IndicatorData) => {
        setSelectedIndicator(indicator);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedIndicator) return;
        try {
            await deleteIndicator(undefined, `/indicators/${selectedIndicator.id}`);
            setShowDeleteModal(false);
            setSelectedIndicator(null);
            toast.success('Indikator berhasil dihapus');
            refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || 'Gagal menghapus indikator');
        }
    };

    return (
        <AppShell title="Indikator" description="Kelola IKU/IKD/IKK" active="indikator" onNavigate={onNavigate}>
            <div className="space-y-4">
                <ToolbarFilter title="Filter indikator" searchPlaceholder="Cari indikator">
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Tambah Indikator
                    </Button>
                </ToolbarFilter>
                <DataTable
                    columns={[
                        { key: 'nama', header: 'Nama', sortable: true },
                        { key: 'jenis', header: 'Jenis', sortable: true },
                        { key: 'indicator_type', header: 'Tipe Indikator' },
                        { key: 'satuan', header: 'Satuan' },
                        { key: 'frequency', header: 'Frekuensi' },
                        { key: 'version', header: 'Versi' },
                        {
                            key: 'aktif',
                            header: 'Status',
                            render: (val) => <Badge variant={val ? 'success' : 'muted'}>{val ? 'Aktif' : 'Nonaktif'}</Badge>,
                        },
                        {
                            key: 'id',
                            header: 'Aksi',
                            render: (_val, row) => (
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => {
                                            const indicator = indikatorList?.find((i) => i.id === row.id);
                                            if (indicator) handleEdit(indicator);
                                        }}
                                    >
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() => {
                                            const indicator = indikatorList?.find((i) => i.id === row.id);
                                            if (indicator) handleDelete(indicator);
                                        }}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            ),
                        },
                    ]}
                    data={indikatorList || []}
                    searchKeys={['nama', 'jenis']}
                />
            </div>

            {/* Create Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Tambah Indikator Baru</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Jenis *</Label>
                            <Select value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value as 'IKU' | 'IKD' | 'IKK' })}>
                                <option value="IKU">IKU</option>
                                <option value="IKD">IKD</option>
                                <option value="IKK">IKK</option>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Nama Indikator *</Label>
                            <Input
                                placeholder="Nama lengkap indikator"
                                value={form.nama}
                                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipe Indikator *</Label>
                                <Select
                                    value={form.indicator_type}
                                    onChange={(e) => setForm({ ...form, indicator_type: e.target.value as 'numeric' | 'percent' | 'index' | 'text' })}
                                >
                                    <option value="numeric">Numerik</option>
                                    <option value="percent">Persentase</option>
                                    <option value="index">Indeks</option>
                                    <option value="text">Teks</option>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Satuan *</Label>
                                <Input
                                    placeholder="Misal: orang, %, unit"
                                    value={form.satuan}
                                    onChange={(e) => setForm({ ...form, satuan: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Frekuensi *</Label>
                            <Select
                                value={form.frequency}
                                onChange={(e) => setForm({ ...form, frequency: e.target.value as 'annual' | 'semester' | 'quarter' | 'month' })}
                            >
                                <option value="annual">Tahunan</option>
                                <option value="semester">Semester</option>
                                <option value="quarter">Triwulan</option>
                                <option value="month">Bulanan</option>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Sumber Data</Label>
                            <Input
                                placeholder="Sumber data indikator"
                                value={form.sumber_data}
                                onChange={(e) => setForm({ ...form, sumber_data: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Keterangan</Label>
                            <Textarea
                                placeholder="Keterangan tambahan (opsional)"
                                value={form.keterangan}
                                onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={form.aktif ? '1' : '0'} onChange={(e) => setForm({ ...form, aktif: e.target.value === '1' })}>
                                <option value="1">Aktif</option>
                                <option value="0">Nonaktif</option>
                            </Select>
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
                <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Indikator</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Jenis *</Label>
                            <Select value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value as 'IKU' | 'IKD' | 'IKK' })}>
                                <option value="IKU">IKU</option>
                                <option value="IKD">IKD</option>
                                <option value="IKK">IKK</option>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Nama Indikator *</Label>
                            <Input
                                placeholder="Nama lengkap indikator"
                                value={form.nama}
                                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipe Indikator *</Label>
                                <Select
                                    value={form.indicator_type}
                                    onChange={(e) => setForm({ ...form, indicator_type: e.target.value as 'numeric' | 'percent' | 'index' | 'text' })}
                                >
                                    <option value="numeric">Numerik</option>
                                    <option value="percent">Persentase</option>
                                    <option value="index">Indeks</option>
                                    <option value="text">Teks</option>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Satuan *</Label>
                                <Input
                                    placeholder="Misal: orang, %, unit"
                                    value={form.satuan}
                                    onChange={(e) => setForm({ ...form, satuan: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Frekuensi *</Label>
                            <Select
                                value={form.frequency}
                                onChange={(e) => setForm({ ...form, frequency: e.target.value as 'annual' | 'semester' | 'quarter' | 'month' })}
                            >
                                <option value="annual">Tahunan</option>
                                <option value="semester">Semester</option>
                                <option value="quarter">Triwulan</option>
                                <option value="month">Bulanan</option>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Sumber Data</Label>
                            <Input
                                placeholder="Sumber data indikator"
                                value={form.sumber_data}
                                onChange={(e) => setForm({ ...form, sumber_data: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Keterangan</Label>
                            <Textarea
                                placeholder="Keterangan tambahan (opsional)"
                                value={form.keterangan}
                                onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={form.aktif ? '1' : '0'} onChange={(e) => setForm({ ...form, aktif: e.target.value === '1' })}>
                                <option value="1">Aktif</option>
                                <option value="0">Nonaktif</option>
                            </Select>
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
                            Apakah Anda yakin ingin menghapus indikator <strong>{selectedIndicator?.nama}</strong>?
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
