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
import { useApi, useMutation } from '../lib/api';
import { handleError } from '../lib/handle-error';

type PeriodData = {
    id: number;
    frequency: string;
    tahun: number;
    quarter: number | null;
    month: number | null;
    period_key: string;
    label: string;
    start_date: string;
    end_date: string;
};

export default function PeriodPage() {
    const { data: periodList, refetch } = useApi<PeriodData[]>('/periods', []);
    const { mutate: createPeriod } = useMutation<Partial<PeriodData>, PeriodData>('/periods', 'post');
    const { mutate: updatePeriod } = useMutation<Partial<PeriodData>, PeriodData>('/periods/:id', 'put');
    const { mutate: deletePeriod } = useMutation('/periods/:id', 'delete');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodData | null>(null);
    const [form, setForm] = useState({
        frequency: 'annual' as 'annual' | 'semester' | 'quarter' | 'month',
        tahun: new Date().getFullYear(),
        quarter: null as number | null,
        month: null as number | null,
        start_date: '',
        end_date: '',
    });

    const handleCreate = async () => {
        if (!form.tahun || !form.start_date || !form.end_date) {
            toast.error('Tahun, tanggal mulai, dan tanggal selesai wajib diisi');
            return;
        }

        // Validasi quarter untuk frequency semester/quarter
        if ((form.frequency === 'quarter' || form.frequency === 'semester') && !form.quarter) {
            toast.error('Triwulan/Semester wajib diisi untuk frekuensi triwulan/semester');
            return;
        }

        // Validasi month untuk frequency month
        if (form.frequency === 'month' && !form.month) {
            toast.error('Bulan wajib diisi untuk frekuensi bulanan');
            return;
        }

        try {
            await createPeriod(form);
            setForm({
                frequency: 'annual',
                tahun: new Date().getFullYear(),
                quarter: null,
                month: null,
                start_date: '',
                end_date: '',
            });
            setShowCreateModal(false);
            toast.success('Periode berhasil ditambahkan');
            refetch();
        } catch (error: unknown) {
            handleError(error, 'Gagal menambahkan periode');
        }
    };

    const handleEdit = (period: PeriodData) => {
        setSelectedPeriod(period);
        setForm({
            frequency: period.frequency as 'annual' | 'semester' | 'quarter' | 'month',
            tahun: period.tahun,
            quarter: period.quarter,
            month: period.month,
            start_date: period.start_date,
            end_date: period.end_date,
        });
        setShowEditModal(true);
    };

    const handleUpdate = async () => {
        if (!selectedPeriod) return;
        if (!form.tahun || !form.start_date || !form.end_date) {
            toast.error('Tahun, tanggal mulai, dan tanggal selesai wajib diisi');
            return;
        }

        try {
            await updatePeriod(form, `/periods/${selectedPeriod.id}`);
            setShowEditModal(false);
            setSelectedPeriod(null);
            toast.success('Periode berhasil diperbarui');
            refetch();
        } catch (error: unknown) {
            handleError(error, 'Gagal memperbarui periode');
        }
    };

    const handleDelete = (period: PeriodData) => {
        setSelectedPeriod(period);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedPeriod) return;
        try {
            await deletePeriod(undefined, `/periods/${selectedPeriod.id}`);
            setShowDeleteModal(false);
            setSelectedPeriod(null);
            toast.success('Periode berhasil dihapus');
            refetch();
        } catch (error: unknown) {
            handleError(error, 'Gagal menghapus periode');
        }
    };

    const getFrequencyBadge = (frequency: string) => {
        switch (frequency) {
            case 'annual':
                return <Badge variant="info">Tahunan</Badge>;
            case 'semester':
                return <Badge variant="success">Semester</Badge>;
            case 'quarter':
                return <Badge>Triwulan</Badge>;
            case 'month':
                return <Badge variant="warning">Bulanan</Badge>;
            default:
                return <Badge variant="muted">{frequency}</Badge>;
        }
    };

    return (
        <AppShell title="Periode" description="Daftar periode pelaporan" active="period">
            <div className="space-y-4">
                <ToolbarFilter title="Daftar Indikator">
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Tambah Periode
                    </Button>
                </ToolbarFilter>
                <DataTable
                    columns={[
                        { key: 'period_key', header: 'Kode Periode', sortable: true },
                        { key: 'label', header: 'Label', sortable: true },
                        { key: 'tahun', header: 'Tahun', sortable: true },
                        {
                            key: 'frequency',
                            header: 'Frekuensi',
                            render: (val) => getFrequencyBadge(val as string),
                        },
                        { key: 'start_date', header: 'Tanggal Mulai' },
                        { key: 'end_date', header: 'Tanggal Selesai' },
                        {
                            key: 'id' as keyof PeriodData,
                            header: 'Aksi',
                            render: (_val, row) => {
                                const period = periodList?.find((p) => p.id === (row as PeriodData).id);
                                if (!period) return null;
                                return (
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(period)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleDelete(period)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                );
                            },
                        },
                    ]}
                    data={periodList || []}
                />
            </div>

            {/* Create Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Periode</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="frequency">Frekuensi *</Label>
                            <Select
                                id="frequency"
                                value={form.frequency}
                                onChange={(e) => {
                                    const freq = e.target.value as 'annual' | 'semester' | 'quarter' | 'month';
                                    setForm({ ...form, frequency: freq, quarter: null, month: null });
                                }}
                            >
                                <option value="annual">Tahunan</option>
                                <option value="semester">Semesteran</option>
                                <option value="quarter">Triwulan</option>
                                <option value="month">Bulanan</option>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="tahun">Tahun *</Label>
                            <Input
                                id="tahun"
                                type="number"
                                value={form.tahun}
                                onChange={(e) => setForm({ ...form, tahun: parseInt(e.target.value) })}
                            />
                        </div>
                        {form.frequency === 'quarter' && (
                            <div>
                                <Label htmlFor="quarter">Triwulan *</Label>
                                <Select
                                    id="quarter"
                                    value={form.quarter?.toString() || ''}
                                    onChange={(e) => setForm({ ...form, quarter: parseInt(e.target.value) })}
                                >
                                    <option value="">Pilih Triwulan</option>
                                    <option value="1">Q1</option>
                                    <option value="2">Q2</option>
                                    <option value="3">Q3</option>
                                    <option value="4">Q4</option>
                                </Select>
                            </div>
                        )}
                        {form.frequency === 'semester' && (
                            <div>
                                <Label htmlFor="semester">Semester *</Label>
                                <Select
                                    id="semester"
                                    value={form.quarter?.toString() || ''}
                                    onChange={(e) => setForm({ ...form, quarter: parseInt(e.target.value) })}
                                >
                                    <option value="">Pilih Semester</option>
                                    <option value="1">Semester 1</option>
                                    <option value="2">Semester 2</option>
                                </Select>
                            </div>
                        )}
                        {form.frequency === 'month' && (
                            <div>
                                <Label htmlFor="month">Bulan *</Label>
                                <Select
                                    id="month"
                                    value={form.month?.toString() || ''}
                                    onChange={(e) => setForm({ ...form, month: parseInt(e.target.value) })}
                                >
                                    <option value="">Pilih Bulan</option>
                                    <option value="1">Januari</option>
                                    <option value="2">Februari</option>
                                    <option value="3">Maret</option>
                                    <option value="4">April</option>
                                    <option value="5">Mei</option>
                                    <option value="6">Juni</option>
                                    <option value="7">Juli</option>
                                    <option value="8">Agustus</option>
                                    <option value="9">September</option>
                                    <option value="10">Oktober</option>
                                    <option value="11">November</option>
                                    <option value="12">Desember</option>
                                </Select>
                            </div>
                        )}
                        <div>
                            <Label htmlFor="start_date">Tanggal Mulai *</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={form.start_date}
                                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="end_date">Tanggal Selesai *</Label>
                            <Input id="end_date" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleCreate}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Periode</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-frequency">Frekuensi *</Label>
                            <Select
                                id="edit-frequency"
                                value={form.frequency}
                                onChange={(e) => {
                                    const freq = e.target.value as 'annual' | 'semester' | 'quarter' | 'month';
                                    setForm({ ...form, frequency: freq, quarter: null, month: null });
                                }}
                            >
                                <option value="annual">Tahunan</option>
                                <option value="semester">Semesteran</option>
                                <option value="quarter">Triwulan</option>
                                <option value="month">Bulanan</option>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-tahun">Tahun *</Label>
                            <Input
                                id="edit-tahun"
                                type="number"
                                value={form.tahun}
                                onChange={(e) => setForm({ ...form, tahun: parseInt(e.target.value) })}
                            />
                        </div>
                        {form.frequency === 'quarter' && (
                            <div>
                                <Label htmlFor="edit-quarter">Triwulan *</Label>
                                <Select
                                    id="edit-quarter"
                                    value={form.quarter?.toString() || ''}
                                    onChange={(e) => setForm({ ...form, quarter: parseInt(e.target.value) })}
                                >
                                    <option value="">Pilih Triwulan</option>
                                    <option value="1">Q1</option>
                                    <option value="2">Q2</option>
                                    <option value="3">Q3</option>
                                    <option value="4">Q4</option>
                                </Select>
                            </div>
                        )}
                        {form.frequency === 'semester' && (
                            <div>
                                <Label htmlFor="edit-semester">Semester *</Label>
                                <Select
                                    id="edit-semester"
                                    value={form.quarter?.toString() || ''}
                                    onChange={(e) => setForm({ ...form, quarter: parseInt(e.target.value) })}
                                >
                                    <option value="">Pilih Semester</option>
                                    <option value="1">Semester 1</option>
                                    <option value="2">Semester 2</option>
                                </Select>
                            </div>
                        )}
                        {form.frequency === 'month' && (
                            <div>
                                <Label htmlFor="edit-month">Bulan *</Label>
                                <Select
                                    id="edit-month"
                                    value={form.month?.toString() || ''}
                                    onChange={(e) => setForm({ ...form, month: parseInt(e.target.value) })}
                                >
                                    <option value="">Pilih Bulan</option>
                                    <option value="1">Januari</option>
                                    <option value="2">Februari</option>
                                    <option value="3">Maret</option>
                                    <option value="4">April</option>
                                    <option value="5">Mei</option>
                                    <option value="6">Juni</option>
                                    <option value="7">Juli</option>
                                    <option value="8">Agustus</option>
                                    <option value="9">September</option>
                                    <option value="10">Oktober</option>
                                    <option value="11">November</option>
                                    <option value="12">Desember</option>
                                </Select>
                            </div>
                        )}
                        <div>
                            <Label htmlFor="edit-start_date">Tanggal Mulai *</Label>
                            <Input
                                id="edit-start_date"
                                type="date"
                                value={form.start_date}
                                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-end_date">Tanggal Selesai *</Label>
                            <Input
                                id="edit-end_date"
                                type="date"
                                value={form.end_date}
                                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditModal(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleUpdate}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Periode</DialogTitle>
                    </DialogHeader>
                    <p>
                        Apakah Anda yakin ingin menghapus periode <strong>{selectedPeriod?.label}</strong>?
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
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
