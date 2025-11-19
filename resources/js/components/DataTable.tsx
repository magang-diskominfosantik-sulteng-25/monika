import { ArrowDownUp } from 'lucide-react';
import { ReactNode, useMemo, useState } from 'react';

import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

export interface Column<T extends Record<string, unknown>> {
    key: keyof T;
    header: string;
    sortable?: boolean;
    render?: (value: T[keyof T], row: T) => ReactNode;
}

interface DataTableProps<T extends Record<string, unknown>> {
    columns: Column<T>[];
    data: T[];
    searchKeys?: (keyof T)[];
    toolbar?: React.ReactNode;
    pageSize?: number;
}

export function DataTable<T extends Record<string, unknown>>({ columns, data, searchKeys = [], pageSize = 8 }: DataTableProps<T>) {
    const [search] = useState('');
    const [sortKey, setSortKey] = useState<keyof T | null>(null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        const searchLower = search.toLowerCase();
        let items = [...data];
        if (searchLower && searchKeys.length) {
            items = items.filter((row) =>
                searchKeys.some((key) =>
                    String(row[key] ?? '')
                        .toLowerCase()
                        .includes(searchLower),
                ),
            );
        }
        if (sortKey) {
            items.sort((a, b) => {
                const aVal = a[sortKey];
                const bVal = b[sortKey];
                if (aVal === bVal) return 0;
                return (aVal > bVal ? 1 : -1) * (sortDir === 'asc' ? 1 : -1);
            });
        }
        return items;
    }, [data, search, searchKeys, sortDir, sortKey]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((col) => (
                            <TableHead key={String(col.key)} className="text-xs font-semibold text-slate-500 uppercase">
                                <button
                                    className="flex items-center gap-1"
                                    onClick={() => {
                                        if (!col.sortable) return;
                                        if (sortKey === col.key) {
                                            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                                        } else {
                                            setSortKey(col.key);
                                            setSortDir('asc');
                                        }
                                    }}
                                    aria-label={col.header}
                                >
                                    {col.header}
                                    {col.sortable && <ArrowDownUp className="h-3.5 w-3.5" aria-hidden />}
                                </button>
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paged.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={columns.length}>
                                <EmptyState title="Belum ada data" description="Tambahkan entri untuk mulai memantau." />
                            </TableCell>
                        </TableRow>
                    ) : (
                        paged.map((row, idx) => (
                            <TableRow key={idx} className="hover:bg-slate-50">
                                {columns.map((col) => (
                                    <TableCell key={String(col.key)} className="align-middle">
                                        {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
    );
}
