import { Download, Eye, ExternalLink, Link2, Trash2, Upload } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { api } from '../../../lib/api';
import { AchievementData } from '../types';

export type EvidenceData = {
    id: number;
    file_path: string | null;
    file_size: number | null;
    url_eksternal: string | null;
    deskripsi: string | null;
    download_url?: string | null;
    preview_url?: string | null;
    created_at?: string | null;
};

interface EvidenceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    achievement: AchievementData | null;
    indicatorName: string;
    periodLabel: string;
    targetValue: string | number;
    achievementValue: string | number | null;
}

function formatBytes(size: number | null) {
    if (!size) return '-';

    const units = ['B', 'KB', 'MB', 'GB'];
    let value = size;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }

    const decimals = value >= 10 || unitIndex === 0 ? 0 : 1;
    return `${value.toFixed(decimals)} ${units[unitIndex]}`;
}

export function EvidenceModal({ open, onOpenChange, achievement, indicatorName, periodLabel, targetValue, achievementValue }: EvidenceModalProps) {
    const [evidences, setEvidences] = useState<EvidenceData[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({ file: null as File | null, url_eksternal: '', deskripsi: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadEvidences = useCallback(async () => {
        if (!achievement) return;
        setLoading(true);
        try {
            const res = await api.get(`/achievements/${achievement.id}/evidences`);
            // Handle both direct array and paginated response
            const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
            setEvidences(data);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || 'Gagal memuat evidensi');
        } finally {
            setLoading(false);
        }
    }, [achievement]);

    useEffect(() => {
        if (open && achievement) {
            loadEvidences();
        } else if (!open) {
            setForm({ file: null, url_eksternal: '', deskripsi: '' });
            setEvidences([]);
        }
    }, [open, achievement, loadEvidences]);

    const handleUpload = async () => {
        if (!achievement) return;
        if (!form.file && !form.url_eksternal) {
            toast.error('Unggah file atau isi tautan terlebih dahulu');
            return;
        }
        if (!form.deskripsi) {
            toast.error('Deskripsi wajib diisi');
            return;
        }

        const formData = new FormData();
        if (form.file) formData.append('file', form.file);
        if (form.url_eksternal) formData.append('url_eksternal', form.url_eksternal);
        if (form.deskripsi) formData.append('deskripsi', form.deskripsi);

        setUploading(true);
        try {
            await api.post(`/achievements/${achievement.id}/evidences`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Evidensi berhasil ditambahkan');
            setForm({ file: null, url_eksternal: '', deskripsi: '' });
            if (fileInputRef.current) fileInputRef.current.value = '';
            loadEvidences();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || 'Gagal menambahkan evidensi');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/evidences/${id}`);
            toast.success('Evidensi dihapus');
            setEvidences((prev) => prev.filter((ev) => ev.id !== id));
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || 'Gagal menghapus evidensi');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Evidensi Target & Capaian</DialogTitle>
                    <DialogDescription>Kelola bukti dukung untuk capaian indikator ini.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="grid gap-3 md:grid-cols-2">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase">Indikator</p>
                                <p className="text-sm font-semibold text-slate-900">{indicatorName}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase">Periode</p>
                                <p className="text-sm font-semibold text-slate-900">{periodLabel}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase">Target</p>
                                <p className="text-sm font-semibold text-slate-900">{targetValue || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase">Realisasi</p>
                                <p className="text-sm font-semibold text-slate-900">{achievementValue ?? '-'}</p>
                            </div>
                        </div>
                    </div>

                    {!achievement ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                            Tambahkan capaian terlebih dahulu untuk menyimpan evidensi.
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-4 lg:grid-cols-[2fr_3fr]">
                                <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                                    <h4 className="text-sm font-semibold">Tambah Evidensi</h4>
                                    <div className="space-y-2">
                                        <Label>File</Label>
                                        <Input
                                            type="file"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*"
                                            ref={fileInputRef}
                                            onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tautan</Label>
                                        <div className="relative">
                                            <Link2 className="absolute top-3 left-3 h-4 w-4 text-slate-400" aria-hidden />
                                            <Input
                                                className="pl-10"
                                                placeholder="https://..."
                                                value={form.url_eksternal}
                                                onChange={(e) => setForm({ ...form, url_eksternal: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>
                                            Deskripsi <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            rows={3}
                                            placeholder="Keterangan singkat evidensi"
                                            value={form.deskripsi}
                                            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                                        />
                                    </div>
                                    <button
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                                        onClick={handleUpload}
                                        disabled={uploading}
                                    >
                                        <Upload className="h-4 w-4" />
                                        {uploading ? 'Mengunggah...' : 'Simpan Evidensi'}
                                    </button>
                                </div>

                                <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold">Daftar Evidensi</h4>
                                        {loading && <span className="text-xs text-slate-500">Memuat...</span>}
                                    </div>
                                    {evidences.length === 0 ? (
                                        <p className="text-sm text-slate-500">
                                            {loading ? 'Mengambil data evidensi...' : 'Belum ada evidensi untuk capaian ini.'}
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {evidences.map((evidence) => (
                                                <div
                                                    key={evidence.id}
                                                    className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 md:flex-row md:items-center md:justify-between"
                                                >
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {evidence.deskripsi || evidence.file_path?.split('/').pop() || evidence.url_eksternal}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {evidence.url_eksternal ? 'Tautan eksternal' : 'Berkas'} ·{' '}
                                                            {formatBytes(evidence.file_size)}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {evidence.preview_url && (
                                                            <a
                                                                href={evidence.preview_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                                Preview
                                                            </a>
                                                        )}
                                                        {evidence.download_url && (
                                                            <a
                                                                href={evidence.download_url}
                                                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                                            >
                                                                <Download className="h-4 w-4" />
                                                                Unduh
                                                            </a>
                                                        )}
                                                        {evidence.url_eksternal && (
                                                            <a
                                                                href={evidence.url_eksternal}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                                Buka Tautan
                                                            </a>
                                                        )}
                                                        <button
                                                            className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                                                            onClick={() => handleDelete(evidence.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <button
                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        onClick={() => onOpenChange(false)}
                    >
                        Tutup
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
