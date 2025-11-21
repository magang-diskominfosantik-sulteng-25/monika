import { Progress } from './ui/progress';

interface ProgressBarProps {
    value: number;
}

export function ProgressBar({ value }: ProgressBarProps) {
    return <Progress value={value} />;
}
