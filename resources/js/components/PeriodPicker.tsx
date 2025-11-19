import { useMemo } from 'react';

import { Select } from './ui/select';

interface PeriodPickerProps {
    frequency: 'annual' | 'semester' | 'quarter' | 'month';
    value: string;
    onChange: (value: string) => void;
}

export function PeriodPicker({ frequency, value, onChange }: PeriodPickerProps) {
    const options = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: 5 }, (_, idx) => currentYear - 1 + idx);
        switch (frequency) {
            case 'semester':
                return years.flatMap((year) => [
                    { key: `${year}-S1`, label: `Semester 1 ${year}` },
                    { key: `${year}-S2`, label: `Semester 2 ${year}` },
                ]);
            case 'quarter':
                return years.flatMap((year) => ['Q1', 'Q2', 'Q3', 'Q4'].map((q) => ({ key: `${year}-${q}`, label: `${q} ${year}` })));
            case 'month':
                return years.flatMap((year) =>
                    Array.from({ length: 12 }, (_, idx) => idx + 1).map((month) => ({
                        key: `${year}-${String(month).padStart(2, '0')}`,
                        label: `${new Date(year, month - 1).toLocaleString('id-ID', { month: 'long' })} ${year}`,
                    })),
                );
            default:
                return years.map((year) => ({ key: `${year}`, label: `${year}` }));
        }
    }, [frequency]);

    return (
        <label className="text-sm font-medium text-slate-700">
            <span className="mb-1 block">Periode</span>
            <Select value={value} onChange={(e) => onChange(e.target.value)} aria-label="Pilih periode">
                {options.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                        {opt.label}
                    </option>
                ))}
            </Select>
        </label>
    );
}
