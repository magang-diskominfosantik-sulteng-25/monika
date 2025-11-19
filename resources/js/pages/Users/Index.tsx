import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { AppShell } from '../../components/AppShell';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

type User = {
    id: number;
    name: string;
    email: string;
    created_at: string;
};

type Props = {
    users: User[];
};

export default function UsersIndex({ users }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/users', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        editForm.put(`/users/${selectedUser.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedUser(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (user: User) => {
        if (confirm(`Apakah Anda yakin ingin menghapus akun ${user.name}?`)) {
            router.delete(`/users/${user.id}`);
        }
    };

    const openEditDialog = (user: User) => {
        setSelectedUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
        });
        setIsEditOpen(true);
    };

    return (
        <>
            <Head title="Kelola Akun" />
            <AppShell title="Kelola Akun" description="Manajemen akun operator sistem" active="users">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">Total {users.length} akun terdaftar</p>
                        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Tambah Akun
                        </Button>
                    </div>

                    <DataTable
                        columns={[
                            {
                                key: 'name',
                                header: 'Nama',
                                sortable: true,
                                render: (value) => <span className="font-medium">{String(value)}</span>,
                            },
                            {
                                key: 'email',
                                header: 'Email',
                                sortable: true,
                            },
                            {
                                key: 'created_at',
                                header: 'Dibuat',
                                sortable: true,
                                render: (value) => new Date(String(value)).toLocaleDateString('id-ID'),
                            },
                            {
                                key: 'id',
                                header: 'Aksi',
                                render: (_, row) => (
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={() => openEditDialog(row as User)} className="gap-2">
                                            <Pencil className="h-3 w-3" />
                                            Edit
                                        </Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(row as User)} className="gap-2">
                                            <Trash2 className="h-3 w-3" />
                                            Hapus
                                        </Button>
                                    </div>
                                ),
                            },
                        ]}
                        data={users}
                        pageSize={10}
                    />
                </div>
            </AppShell>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Akun Baru</DialogTitle>
                        <DialogDescription>Buat akun operator baru untuk mengakses sistem</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-name">Nama</Label>
                            <Input
                                id="create-name"
                                value={createForm.data.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => createForm.setData('name', e.target.value)}
                                placeholder="Nama lengkap"
                                required
                            />
                            {createForm.errors.name && <p className="text-sm text-red-600">{createForm.errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-email">Email</Label>
                            <Input
                                id="create-email"
                                type="email"
                                value={createForm.data.email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => createForm.setData('email', e.target.value)}
                                placeholder="email@example.com"
                                required
                            />
                            {createForm.errors.email && <p className="text-sm text-red-600">{createForm.errors.email}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-password">Password</Label>
                            <Input
                                id="create-password"
                                type="password"
                                value={createForm.data.password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => createForm.setData('password', e.target.value)}
                                placeholder="Minimal 8 karakter"
                                required
                            />
                            {createForm.errors.password && <p className="text-sm text-red-600">{createForm.errors.password}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-password-confirmation">Konfirmasi Password</Label>
                            <Input
                                id="create-password-confirmation"
                                type="password"
                                value={createForm.data.password_confirmation}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => createForm.setData('password_confirmation', e.target.value)}
                                placeholder="Ketik ulang password"
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                {createForm.processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Akun</DialogTitle>
                        <DialogDescription>Perbarui informasi akun operator</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nama</Label>
                            <Input
                                id="edit-name"
                                value={editForm.data.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => editForm.setData('name', e.target.value)}
                                placeholder="Nama lengkap"
                                required
                            />
                            {editForm.errors.name && <p className="text-sm text-red-600">{editForm.errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={editForm.data.email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => editForm.setData('email', e.target.value)}
                                placeholder="email@example.com"
                                required
                            />
                            {editForm.errors.email && <p className="text-sm text-red-600">{editForm.errors.email}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-password">Password Baru (opsional)</Label>
                            <Input
                                id="edit-password"
                                type="password"
                                value={editForm.data.password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => editForm.setData('password', e.target.value)}
                                placeholder="Kosongkan jika tidak ingin mengubah"
                            />
                            {editForm.errors.password && <p className="text-sm text-red-600">{editForm.errors.password}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-password-confirmation">Konfirmasi Password Baru</Label>
                            <Input
                                id="edit-password-confirmation"
                                type="password"
                                value={editForm.data.password_confirmation}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => editForm.setData('password_confirmation', e.target.value)}
                                placeholder="Ketik ulang password baru"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
