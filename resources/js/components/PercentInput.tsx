import { Input } from './ui/input';
import { Label } from './ui/label';

interface PercentInputProps {
    label: string;
    value: number | '';
    onChange: (value: number | '') => void;
}

export function PercentInput({ label, value, onChange }: PercentInputProps) {
    return (
        <div className="space-y-1">
            {label && <Label>{label}</Label>}
            <div className="relative">
                <Input
                    type="number"
                    inputMode="decimal"
                    value={value}
                    onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
                    min={0}
                    max={100}
                    step={0.01}
                    aria-label={label}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-500">%</span>
            </div>
        </div>
    );
}
