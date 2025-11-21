import { MoreHorizontal, Plus } from 'lucide-react';
import { DataTable } from '../../../components/DataTable';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { EnrichedData } from '../types';

interface TargetAchievementTableProps {
    isLoadingTargets: boolean;
    isLoadingAchievements: boolean;
    selectedIndicatorId: number | null;
    setShowCreateModal: (val: boolean) => void;
    selectedOpdId: number | null;
    enriched: EnrichedData[];
    setShowActionModal: (val: boolean) => void;
    setActionRow: (row: EnrichedData) => void;
}

export function TargetAchievementTable({
    isLoadingTargets,
    isLoadingAchievements,
    selectedIndicatorId,
    setShowCreateModal,
    selectedOpdId,
    enriched,
    setShowActionModal,
    setActionRow,
}: TargetAchievementTableProps) {
    return (
        <Card className="flex h-full flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                    <CardTitle className="text-base">Target & Capaian</CardTitle>
                    <p className="mt-1 text-sm text-slate-500">
                        {selectedIndicatorId
                            ? 'Menampilkan data untuk indikator terpilih'
                            : 'Menampilkan semua data indikator'}
                    </p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} disabled={!selectedOpdId || !selectedIndicatorId}>
                    <Plus className="mr-2 h-4 w-4" /> Target Baru
                </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                {isLoadingTargets || isLoadingAchievements ? (
                    <div className="space-y-4 p-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : (
                    <div className="p-4">
                        <DataTable
                            columns={[
                                {
                                    key: 'indikator',
                                    header: 'Indikator',
                                    sortable: true,
                                    render: (val) => <span className="text-sm font-medium">{String(val)}</span>,
                                },
                                {
                                    key: 'periode',
                                    header: 'Periode',
                                    sortable: true,
                                    render: (val) => <Badge variant="muted">{String(val)}</Badge>,
                                },
                                {
                                    key: 'nilai_target',
                                    header: 'Target',
                                    render: (val, row) => (
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{String(val)}</span>
                                            {row.indicator?.satuan && (
                                                <span className="text-xs text-slate-500">{row.indicator.satuan}</span>
                                            )}
                                        </div>
                                    ),
                                },
                                {
                                    key: 'nilai_realisasi',
                                    header: 'Realisasi',
                                    render: (val, row) => (
                                        <div className="flex flex-col gap-1">
                                            <div className="font-semibold">{val ? String(val) : '-'}</div>
                                            {row.achievement_rate !== null && (
                                                <div
                                                    className={`text-xs font-medium ${
                                                        (row.achievement_rate || 0) >= 100
                                                            ? 'text-green-600'
                                                            : (row.achievement_rate || 0) >= 80
                                                              ? 'text-blue-600'
                                                              : 'text-orange-600'
                                                    }`}
                                                >
                                                    {row.achievement_rate}%
                                                </div>
                                            )}
                                        </div>
                                    ),
                                },
                                {
                                    key: 'id',
                                    header: 'Aksi',
                                    render: (_val, row) => (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setActionRow(row);
                                                setShowActionModal(true);
                                            }}
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    ),
                                },
                            ]}
                            data={enriched.filter((row) => !selectedIndicatorId || row.indicator_id === selectedIndicatorId)}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
