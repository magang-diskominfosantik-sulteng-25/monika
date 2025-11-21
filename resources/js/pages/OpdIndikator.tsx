import { Edit, ListChecks, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AppShell } from '../components/AppShell';
import { EmptyState } from '../components/EmptyState';
import { ToolbarFilter } from '../components/ToolbarFilter';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import { Textarea } from '../components/ui/textarea';
import { useApi, useMutation } from '../lib/api';
import { IndicatorList } from './OpdIndikator/components/IndicatorList';
import { OpdInfoCard } from './OpdIndikator/components/OpdInfoCard';
import { TargetAchievementTable } from './OpdIndikator/components/TargetAchievementTable';
import { AchievementData, EnrichedData, IndicatorData, OpdData, PeriodData, TargetData } from './OpdIndikator/types';

export default function OpdIndikatorPage() {
    const { data: opdList = [], loading: isLoadingOpd } = useApi<OpdData[]>('/opds', []);
    const { data: indikatorList = [], loading: isLoadingIndikator } = useApi<IndicatorData[]>('/indicators', []);
    const { data: periodList = [] } = useApi<PeriodData[]>('/periods', []);
    const { data: targets = [], refetch: refetchTargets, loading: isLoadingTargets } = useApi<TargetData[]>('/targets', []);
    const { mutate: createTarget } = useMutation<Partial<TargetData>, TargetData>('/targets', 'post');
    const { mutate: updateTarget } = useMutation<Partial<TargetData>, TargetData>('/targets/:id', 'put');
    const { mutate: deleteTarget } = useMutation('/targets/:id', 'delete');
    const { data: achievements = [], refetch: refetchAchievements, loading: isLoadingAchievements } = useApi<AchievementData[]>('/achievements', []);
    const { mutate: createAchievement } = useMutation<Partial<AchievementData>, AchievementData>('/achievements', 'post');
    const { mutate: updateAchievement } = useMutation<Partial<AchievementData>, AchievementData>('/achievements/:id', 'put');
    const { mutate: deleteAchievement } = useMutation('/achievements/:id', 'delete');

    const [selectedOpdId, setSelectedOpdId] = useState<number | null>(null);
    const [selectedIndicatorId, setSelectedIndicatorId] = useState<number | null>(null);
    const [searchIndicator, setSearchIndicator] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAchievementModal, setShowAchievementModal] = useState(false);
    const [showDeleteAchievementModal, setShowDeleteAchievementModal] = useState(false);
    const [selectedTarget, setSelectedTarget] = useState<TargetData | null>(null);
    const [selectedAchievement, setSelectedAchievement] = useState<AchievementData | null>(null);
    const [showActionModal, setShowActionModal] = useState(false);
    const [actionRow, setActionRow] = useState<EnrichedData | null>(null);
    const [form, setForm] = useState({
        indicator_id: 0,
        opd_id: 0,
        period_id: 0,
        nilai_target_num: null as number | null,
        nilai_target_text: '',
        catatan: '',
    });
    const [achievementForm, setAchievementForm] = useState({
        indicator_id: 0,
        opd_id: 0,
        period_id: 0,
        nilai_realisasi_num: null as number | null,
        nilai_realisasi_text: '',
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
        const indicators = indikatorList.filter((ind) => ind.opd_id === selectedOpdId);
        setSelectedIndicatorId(indicators[0]?.id ?? null);
        setAchievementForm((prev) => ({
            ...prev,
            indicator_id: indicators[0]?.id ?? 0,
            opd_id: selectedOpdId ?? 0,
            period_id: 0,
            nilai_realisasi_num: null,
            nilai_realisasi_text: '',
            catatan: '',
        }));
        setSelectedAchievement(null);
        setShowAchievementModal(false);
        setShowDeleteAchievementModal(false);
    }, [indikatorList, selectedOpdId]);

    const selectedOpd = useMemo(() => opdList.find((opd) => opd.id === selectedOpdId) || null, [opdList, selectedOpdId]);

    const opdIndicators = useMemo(
        () =>
            indikatorList
                .filter((ind) => ind.opd_id === selectedOpdId)
                .filter((ind) => ind.nama.toLowerCase().includes(searchIndicator.toLowerCase())),
        [indikatorList, selectedOpdId, searchIndicator],
    );

    const opdTargets = useMemo(() => targets.filter((t) => t.opd_id === selectedOpdId), [targets, selectedOpdId]);

    const opdAchievements = useMemo(
        () => achievements.filter((a) => a.opd_id === selectedOpdId && (!selectedIndicatorId || a.indicator_id === selectedIndicatorId)),
        [achievements, selectedIndicatorId, selectedOpdId],
    );

    const selectedIndicator = opdIndicators.find((i) => i.id === selectedIndicatorId);
    const isNumeric = selectedIndicator?.indicator_type && ['numeric', 'percent', 'index'].includes(selectedIndicator.indicator_type);

    const selectedAchievementIndicator = opdIndicators.find((i) => i.id === achievementForm.indicator_id);
    const isAchievementNumeric =
        selectedAchievementIndicator?.indicator_type && ['numeric', 'percent', 'index'].includes(selectedAchievementIndicator.indicator_type);

    const handleCreate = async () => {
        if (!selectedOpdId) {
            toast.error('Pilih OPD terlebih dahulu');
            return;
        }
        if (!selectedIndicatorId) {
            toast.error('Pilih indikator terlebih dahulu');
            return;
        }
        if (!form.period_id) {
            toast.error('Periode wajib diisi');
            return;
        }
        if (!form.nilai_target_num && !form.nilai_target_text) {
            toast.error('Nilai target wajib diisi');
            return;
        }
        try {
            await createTarget({ ...form, opd_id: selectedOpdId, indicator_id: selectedIndicatorId });
            setForm({
                indicator_id: selectedIndicatorId,
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

    const handleCreateAchievement = async () => {
        if (!selectedOpdId || !selectedIndicatorId) {
            toast.error('Pilih OPD dan indikator terlebih dahulu');
            return;
        }
        if (!achievementForm.period_id) {
            toast.error('Periode wajib diisi');
            return;
        }
        if (!achievementForm.nilai_realisasi_num && !achievementForm.nilai_realisasi_text) {
            toast.error('Nilai realisasi wajib diisi');
            return;
        }
        try {
            await createAchievement({
                ...achievementForm,
                opd_id: selectedOpdId,
                indicator_id: selectedIndicatorId,
            });
            setAchievementForm((prev) => ({
                ...prev,
                period_id: 0,
                nilai_realisasi_num: null,
                nilai_realisasi_text: '',
                catatan: '',
            }));
            setShowAchievementModal(false);
            toast.success('Capaian berhasil ditambahkan');
            refetchAchievements();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || 'Gagal menambahkan capaian');
        }
    };

    const handleEditAchievement = (achievement: AchievementData) => {
        setSelectedAchievement(achievement);
        setAchievementForm({
            indicator_id: achievement.indicator_id,
            opd_id: achievement.opd_id,
            period_id: achievement.period_id,
            nilai_realisasi_num: achievement.nilai_realisasi_num,
            nilai_realisasi_text: achievement.nilai_realisasi_text || '',
            catatan: achievement.catatan || '',
        });
        setShowAchievementModal(true);
    };

    const handleUpdateAchievement = async () => {
        if (!selectedAchievement) return;
        if (!achievementForm.period_id) {
            toast.error('Periode wajib diisi');
            return;
        }
        try {
            await updateAchievement(
                {
                    ...achievementForm,
                    opd_id: selectedOpdId ?? achievementForm.opd_id,
                    indicator_id: selectedIndicatorId ?? achievementForm.indicator_id,
                },
                `/achievements/${selectedAchievement.id}`,
            );
            setShowAchievementModal(false);
            setSelectedAchievement(null);
            toast.success('Capaian berhasil diperbarui');
            refetchAchievements();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || 'Gagal memperbarui capaian');
        }
    };

    const handleDeleteAchievement = (achievement: AchievementData) => {
        setSelectedAchievement(achievement);
        setShowDeleteAchievementModal(true);
    };

    const confirmDeleteAchievement = async () => {
        if (!selectedAchievement) return;
        try {
            await deleteAchievement(undefined, `/achievements/${selectedAchievement.id}`);
            setShowDeleteAchievementModal(false);
            setSelectedAchievement(null);
            toast.success('Capaian berhasil dihapus');
            refetchAchievements();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || 'Gagal menghapus capaian');
        }
    };

    const enriched: EnrichedData[] = opdTargets.map((t) => {
        const achievement = opdAchievements.find((a) => a.indicator_id === t.indicator_id && a.period_id === t.period_id && a.opd_id === t.opd_id);
        return {
            ...t,
            target_id: t.id,
            achievement_id: achievement?.id,
            indikator: t.indicator?.nama ?? '-',
            opd: t.opd?.nama ?? selectedOpd?.nama ?? '-',
            periode: t.period?.label ?? '-',
            nilai_target: t.nilai_target_num ?? t.nilai_target_text ?? '-',
            nilai_realisasi: achievement ? (achievement.nilai_realisasi_num ?? achievement.nilai_realisasi_text) : null,
            achievement_rate: achievement?.achievement_rate ?? null,
        };
    });

    return (
        <AppShell title="Indikator OPD" description="Kelola indikator dan target per OPD" active="opd-indikator">
            <div className="space-y-6">
                <ToolbarFilter title="Pilih OPD">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        {isLoadingOpd ? (
                            <Skeleton className="h-10 w-64" />
                        ) : (
                            <Select value={selectedOpdId ?? 0} onChange={(e) => setSelectedOpdId(Number(e.target.value) || null)}>
                                <option value={0}>Pilih OPD</option>
                                {opdList.map((opd) => (
                                    <option key={opd.id} value={opd.id}>
                                        {opd.nama}
                                    </option>
                                ))}
                            </Select>
                        )}
                    </div>
                </ToolbarFilter>

                {!selectedOpdId ? (
                    <EmptyState
                        title="Pilih OPD"
                        description="Silakan pilih Organisasi Perangkat Daerah (OPD) untuk melihat dan mengelola indikator kinerja."
                    />
                ) : (
                    <div className="space-y-6">
                        <OpdInfoCard selectedOpd={selectedOpd} />

                        <div className="grid gap-6 lg:grid-cols-12">
                            <div className="space-y-4 lg:col-span-4">
                                <IndicatorList
                                    opdIndicators={opdIndicators}
                                    selectedIndicatorId={selectedIndicatorId}
                                    searchIndicator={searchIndicator}
                                    setSearchIndicator={setSearchIndicator}
                                    isLoadingIndikator={isLoadingIndikator}
                                    onSelectIndicator={(ind) => {
                                        setSelectedIndicatorId(ind.id);
                                        setAchievementForm((prev) => ({
                                            ...prev,
                                            indicator_id: ind.id,
                                            opd_id: selectedOpdId ?? 0,
                                            nilai_realisasi_num: null,
                                            nilai_realisasi_text: '',
                                            catatan: '',
                                        }));
                                    }}
                                />
                            </div>

                            <div className="space-y-4 lg:col-span-8">
                                <TargetAchievementTable
                                    isLoadingTargets={isLoadingTargets}
                                    isLoadingAchievements={isLoadingAchievements}
                                    selectedIndicatorId={selectedIndicatorId}
                                    setShowCreateModal={setShowCreateModal}
                                    selectedOpdId={selectedOpdId}
                                    enriched={enriched}
                                    setShowActionModal={setShowActionModal}
                                    setActionRow={setActionRow}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Modal */}
            <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Kelola Data</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <h4 className="leading-none font-medium">Target</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    className="justify-start"
                                    onClick={() => {
                                        const target = opdTargets.find((t) => t.id === actionRow?.target_id);
                                        if (target) {
                                            handleEdit(target);
                                            setShowActionModal(false);
                                        }
                                    }}
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Target
                                </Button>
                                <Button
                                    variant="outline"
                                    className="justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                                    onClick={() => {
                                        const target = opdTargets.find((t) => t.id === actionRow?.target_id);
                                        if (target) {
                                            handleDelete(target);
                                            setShowActionModal(false);
                                        }
                                    }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hapus Target
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="leading-none font-medium">Capaian</h4>
                            {!actionRow?.achievement_id ? (
                                <Button
                                    className="w-full justify-start"
                                    onClick={() => {
                                        if (actionRow) {
                                            setSelectedIndicatorId(actionRow.indicator_id);
                                            setAchievementForm({
                                                indicator_id: actionRow.indicator_id,
                                                opd_id: selectedOpdId ?? 0,
                                                period_id: actionRow.period_id,
                                                nilai_realisasi_num: null,
                                                nilai_realisasi_text: '',
                                                catatan: '',
                                            });
                                            setShowAchievementModal(true);
                                            setShowActionModal(false);
                                        }
                                    }}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Capaian
                                </Button>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        className="justify-start"
                                        onClick={() => {
                                            const achievement = opdAchievements.find((a) => a.id === actionRow?.achievement_id);
                                            if (achievement) {
                                                handleEditAchievement(achievement);
                                                setShowActionModal(false);
                                            }
                                        }}
                                    >
                                        <ListChecks className="mr-2 h-4 w-4" />
                                        Edit Capaian
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                                        onClick={() => {
                                            const achievement = opdAchievements.find((a) => a.id === actionRow?.achievement_id);
                                            if (achievement) {
                                                handleDeleteAchievement(achievement);
                                                setShowActionModal(false);
                                            }
                                        }}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Hapus Capaian
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setShowActionModal(false)}>
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Tambah Target Baru</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Indikator</Label>
                            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                                <p className="font-semibold">{selectedIndicator?.nama || '-'}</p>
                                <p className="text-xs text-slate-500">{selectedIndicator?.satuan || ''}</p>
                            </div>
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
                        <Button onClick={handleCreate} disabled={!selectedOpdId || !selectedIndicatorId}>
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

            {/* Achievement Modal */}
            <Dialog open={showAchievementModal} onOpenChange={setShowAchievementModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Tambah Capaian</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Indikator</Label>
                            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                                <p className="font-semibold">{opdIndicators.find((i) => i.id === achievementForm.indicator_id)?.nama || '-'}</p>
                                <p className="text-xs text-slate-500">
                                    {opdIndicators.find((i) => i.id === achievementForm.indicator_id)?.satuan || ''}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Periode</Label>
                            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                                <p className="font-semibold">{periodList.find((p) => p.id === achievementForm.period_id)?.label || '-'}</p>
                                <p className="text-xs text-slate-500">{periodList.find((p) => p.id === achievementForm.period_id)?.tahun || ''}</p>
                            </div>
                        </div>
                        {isAchievementNumeric ? (
                            <div className="space-y-2">
                                <Label>Nilai Realisasi (Numerik) *</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={achievementForm.nilai_realisasi_num ?? ''}
                                    onChange={(e) =>
                                        setAchievementForm({
                                            ...achievementForm,
                                            nilai_realisasi_num: e.target.value ? Number(e.target.value) : null,
                                            nilai_realisasi_text: '',
                                        })
                                    }
                                />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>Nilai Realisasi (Teks) *</Label>
                                <Input
                                    value={achievementForm.nilai_realisasi_text}
                                    onChange={(e) =>
                                        setAchievementForm({ ...achievementForm, nilai_realisasi_text: e.target.value, nilai_realisasi_num: null })
                                    }
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Catatan</Label>
                            <Textarea
                                placeholder="Catatan tambahan (opsional)"
                                value={achievementForm.catatan}
                                onChange={(e) => setAchievementForm({ ...achievementForm, catatan: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setShowAchievementModal(false)}>
                            Batal
                        </Button>
                        <Button onClick={selectedAchievement ? handleUpdateAchievement : handleCreateAchievement} disabled={!selectedIndicatorId}>
                            {selectedAchievement ? 'Perbarui' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Achievement Modal */}
            <Dialog open={showDeleteAchievementModal} onOpenChange={setShowDeleteAchievementModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus Capaian</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Apakah Anda yakin ingin menghapus capaian ini?</p>
                        <p className="mt-2 text-sm text-slate-600">Tindakan ini tidak dapat dibatalkan.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setShowDeleteAchievementModal(false)}>
                            Batal
                        </Button>
                        <Button variant="danger" onClick={confirmDeleteAchievement}>
                            Hapus
                        </Button>
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
