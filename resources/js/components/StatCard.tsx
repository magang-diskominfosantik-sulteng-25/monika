import { TrendingDown, TrendingUp } from 'lucide-react';

import { ProgressBar } from './StatusBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface StatCardProps {
    title: string;
    value: string;
    description?: string;
    trend?: 'up' | 'down';
    progress?: number;
}

export function StatCard({ title, value, description, trend, progress }: StatCardProps) {
    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm text-slate-500">
                    <span>{title}</span>
                    {trend === 'up' && <TrendingUp className="h-4 w-4 text-emerald-600" aria-hidden />}
                    {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" aria-hidden />}
                </CardTitle>
                <CardDescription className="text-2xl font-semibold text-slate-900">{value}</CardDescription>
            </CardHeader>
            {description && <CardContent className="text-sm text-slate-600">{description}</CardContent>}
            {progress !== undefined && (
                <CardContent className="pt-0">
                    <ProgressBar value={progress} />
                </CardContent>
            )}
        </Card>
    );
}
