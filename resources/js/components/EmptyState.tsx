interface EmptyStateProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl">📊</div>
            <p className="text-base font-semibold text-slate-800">{title}</p>
            {description && <p className="max-w-md text-sm text-slate-500">{description}</p>}
            {action}
        </div>
    );
}
