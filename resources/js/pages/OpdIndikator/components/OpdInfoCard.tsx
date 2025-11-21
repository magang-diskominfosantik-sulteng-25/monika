import { Phone, UserRound } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { OpdData } from '../types';

interface OpdInfoCardProps {
    selectedOpd: OpdData | null;
}

export function OpdInfoCard({ selectedOpd }: OpdInfoCardProps) {
    return (
        <Card className="bg-slate-50/50">
            <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-slate-900">{selectedOpd?.nama}</h3>
                        <div className="flex items-center gap-2">
                            <Badge variant={selectedOpd?.aktif ? 'success' : 'muted'}>
                                {selectedOpd?.aktif ? 'Aktif' : 'Nonaktif'}
                            </Badge>
                            <span className="text-sm text-slate-500">{selectedOpd?.singkatan}</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">
                            <UserRound className="h-4 w-4 text-slate-400" />
                            <span className="font-medium">{selectedOpd?.kontak_nama || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <span className="font-medium">{selectedOpd?.kontak_hp || '-'}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
