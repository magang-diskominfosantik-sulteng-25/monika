import { Input } from './ui/input';
import { Label } from './ui/label';

interface NumberInputProps {
    label: string;
    value: number | '';
    onChange: (value: number | '') => void;
    min?: number;
    max?: number;
    step?: number;
}

export function NumberInput({ label, value, onChange, min, max, step = 1 }: NumberInputProps) {
    return (
        <div className="space-y-1">
            {label && <Label>{label}</Label>}
            <Input
                type="number"
                inputMode="decimal"
                value={value}
                onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
                min={min}
                max={max}
                step={step}
                aria-label={label}
            />
        </div>
    );
}
