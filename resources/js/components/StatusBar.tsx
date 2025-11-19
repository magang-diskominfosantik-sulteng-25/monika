import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface ProgressBarProps {
    value: number;
}

export function ProgressBar({ value }: ProgressBarProps) {
    return <Progress value={value} />;
}

interface StatusBadgeProps {
    status: 'draft' | 'valid' | 'locked';
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const map = {
        draft: { label: 'Draft', variant: 'warning' as const },
        valid: { label: 'Tervalidasi', variant: 'success' as const },
        locked: { label: 'Terkunci', variant: 'default' as const },
    };
    const { label, variant } = map[status];
    return <Badge variant={variant}>{label}</Badge>;
}
