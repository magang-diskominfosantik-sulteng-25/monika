import { Search } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Skeleton } from '../../../components/ui/skeleton';
import { IndicatorData } from '../types';

interface IndicatorListProps {
    opdIndicators: IndicatorData[];
    selectedIndicatorId: number | null;
    searchIndicator: string;
    setSearchIndicator: (val: string) => void;
    isLoadingIndikator: boolean;
    onSelectIndicator: (indicator: IndicatorData) => void;
}

export function IndicatorList({
    opdIndicators,
    selectedIndicatorId,
    searchIndicator,
    setSearchIndicator,
    isLoadingIndikator,
    onSelectIndicator,
}: IndicatorListProps) {
    return (
        <Card className="flex h-full flex-col">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Daftar Indikator</CardTitle>
                    <Badge variant="muted">{opdIndicators.length}</Badge>
                </div>
                <div className="relative mt-2">
                    <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Cari indikator..."
                        className="pl-9"
                        value={searchIndicator}
                        onChange={(e) => setSearchIndicator(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent className="max-h-[600px] flex-1 overflow-y-auto pt-2">
                {isLoadingIndikator ? (
                    <div className="space-y-2 p-2">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                        ))}
                    </div>
                ) : opdIndicators.length > 0 ? (
                    <div className="space-y-1">
                        {opdIndicators.map((ind) => (
                            <button
                                key={ind.id}
                                onClick={() => onSelectIndicator(ind)}
                                className={`w-full rounded-lg border p-3 text-left transition-all hover:shadow-sm ${
                                    selectedIndicatorId === ind.id
                                        ? 'border-primary bg-primary/5 ring-primary ring-1'
                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <p className="line-clamp-2 text-sm font-medium">{ind.nama}</p>
                                    {selectedIndicatorId === ind.id && (
                                        <div className="bg-primary mt-1.5 h-2 w-2 shrink-0 rounded-full" />
                                    )}
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                                    <Badge
                                        variant={
                                            ind.jenis === 'IKU'
                                                ? 'default'
                                                : ind.jenis === 'IKD'
                                                  ? 'success'
                                                  : ind.jenis === 'IKK'
                                                    ? 'warning'
                                                    : 'muted'
                                        }
                                        className="h-5 px-1.5 py-0 text-[10px]"
                                    >
                                        {ind.jenis}
                                    </Badge>
                                    <Badge variant="muted" className="h-5 px-1.5 py-0 text-[10px]">
                                        {ind.satuan}
                                    </Badge>
                                    <span className="capitalize">{ind.frequency}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="py-8 text-center text-sm text-slate-500">
                        {searchIndicator ? 'Tidak ada indikator yang cocok' : 'Belum ada indikator'}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
