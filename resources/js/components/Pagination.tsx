import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from './ui/button';

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
    return (
        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-sm text-slate-600">
            <span>
                Halaman {page} dari {totalPages}
            </span>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} aria-label="Sebelumnya">
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    aria-label="Berikutnya"
                >
                    <ChevronRight className="h-4 w-4" aria-hidden />
                </Button>
            </div>
        </div>
    );
}
