import { Filter } from 'lucide-react';
import { ReactNode } from 'react';

import { Button } from './ui/button';
import { Input } from './ui/input';

interface ToolbarFilterProps {
    title: string;
    children?: ReactNode;
    searchPlaceholder?: string;
    onSearch?: (value: string) => void;
}

export function ToolbarFilter({ title, children, searchPlaceholder, onSearch }: ToolbarFilterProps) {
    return (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Filter className="h-4 w-4" aria-hidden />
                <span>{title}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                {searchPlaceholder && (
                    <div className="relative">
                        <Input
                            placeholder={searchPlaceholder}
                            aria-label={searchPlaceholder}
                            className="w-64 pl-9"
                            onChange={(e) => onSearch?.(e.target.value)}
                        />
                        <span className="pointer-events-none absolute top-2.5 left-3 text-slate-400">🔍</span>
                    </div>
                )}
                {children}
                <Button variant="secondary" size="sm" type="button" aria-label="Bersihkan filter">
                    Reset
                </Button>
            </div>
        </div>
    );
}
