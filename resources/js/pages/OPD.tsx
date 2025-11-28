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

type OpdData = {
    id: number;
    nama: string;
    singkatan: string;
    kontak_nama?: string;
    kontak_hp?: string;
    aktif: boolean;
};

export default function OPDPage() {
    const { data: opd, refetch } = useApi<OpdData[]>('/opds', []);
    const { mutate: createOpd } = useMutation<Partial<OpdData>, OpdData>('/opds', 'post');
    const { mutate: updateOpd } = useMutation<Partial<OpdData>, OpdData>('/opds/:id', 'put');
    const { mutate: deleteOpd } = useMutation('/opds/:id', 'delete');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedOpd, setSelectedOpd] = useState<OpdData | null>(null);
    const [form, setForm] = useState({ nama: '', singkatan: '', kontak_nama: '', kontak_hp: '', aktif: true });

    const addOpd = async () => {
        if (!form.nama || !form.singkatan) {
            toast.error('Nama dan singkatan wajib diisi');
            return;
        }
        try {
            await createOpd(form);
            setForm({ nama: '', singkatan: '', kontak_nama: '', kontak_hp: '', aktif: true });
            setShowCreateModal(false);
            toast.success('OPD berhasil ditambahkan');
            refetch();
        } catch (error: unknown) {
            handleError(error, 'Gagal menambahkan OPD');
        }
    };

    const handleEdit = (opdItem: OpdData) => {
        setSelectedOpd(opdItem);
        setForm({
            nama: opdItem.nama,
            singkatan: opdItem.singkatan,
            kontak_nama: opdItem.kontak_nama || '',
            kontak_hp: opdItem.kontak_hp || '',
            aktif: opdItem.aktif,
        });
        setShowEditModal(true);
    };

    const handleUpdate = async () => {
        if (!selectedOpd || !form.nama || !form.singkatan) {
            toast.error('Nama dan singkatan wajib diisi');
            return;
        }
        try {
            await updateOpd(form, `/opds/${selectedOpd.id}`);
            setShowEditModal(false);
            setSelectedOpd(null);
            toast.success('OPD berhasil diperbarui');
            refetch();
        } catch (error: unknown) {
            handleError(error, 'Gagal memperbarui OPD');
        }
    };

    const handleDelete = (opdItem: OpdData) => {
        setSelectedOpd(opdItem);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedOpd) return;
        try {
            await deleteOpd(undefined, `/opds/${selectedOpd.id}`);
            setShowDeleteModal(false);
            setSelectedOpd(null);
            toast.success('OPD berhasil dihapus');
            refetch();
        } catch (error: unknown) {
            handleError(error, 'Gagal menghapus OPD');
        }
    };

    return (
        <AppShell title="OPD" description="Kelola instansi" active="opd">
            <div className="space-y-4">
                <ToolbarFilter title="Daftar OPD">
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Tambah OPD
                    </Button>
                </ToolbarFilter>

                <DataTable
                    columns={[
                        { key: 'nama', header: 'Nama', sortable: true },
                        { key: 'singkatan', header: 'Singkatan' },
                        { key: 'kontak_nama', header: 'PIC' },
                        { key: 'kontak_hp', header: 'No. HP' },
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
                                    <Button size="sm" variant="secondary" onClick={() => handleEdit(row as OpdData)}>
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(row as OpdData)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            ),
                        },
                    ]}
                    data={opd || []}
                />
            </div>

            {/* Create Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah OPD Baru</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nama OPD *</Label>
                            <Input placeholder="Nama OPD" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Singkatan *</Label>
                            <Input placeholder="Singkatan" value={form.singkatan} onChange={(e) => setForm({ ...form, singkatan: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Nama PIC</Label>
                            <Input
                                placeholder="Nama PIC (Opsional)"
                                value={form.kontak_nama}
                                onChange={(e) => setForm({ ...form, kontak_nama: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>No. HP PIC</Label>
                            <Input
                                placeholder="No. HP PIC (Opsional)"
                                value={form.kontak_hp}
                                onChange={(e) => setForm({ ...form, kontak_hp: e.target.value })}
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
                        <Button onClick={addOpd}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit OPD</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nama OPD *</Label>
                            <Input placeholder="Nama OPD" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Singkatan *</Label>
                            <Input placeholder="Singkatan" value={form.singkatan} onChange={(e) => setForm({ ...form, singkatan: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Nama PIC</Label>
                            <Input
                                placeholder="Nama PIC (Opsional)"
                                value={form.kontak_nama}
                                onChange={(e) => setForm({ ...form, kontak_nama: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>No. HP PIC</Label>
                            <Input
                                placeholder="No. HP PIC (Opsional)"
                                value={form.kontak_hp}
                                onChange={(e) => setForm({ ...form, kontak_hp: e.target.value })}
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
                            Apakah Anda yakin ingin menghapus OPD <strong>{selectedOpd?.nama}</strong>?
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
