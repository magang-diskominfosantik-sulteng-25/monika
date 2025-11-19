import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
    {
        variants: {
            variant: {
                default: 'bg-slate-900 text-white ring-slate-900/10',
                muted: 'bg-slate-100 text-slate-700 ring-slate-200',
                success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
                warning: 'bg-amber-50 text-amber-700 ring-amber-200',
                danger: 'bg-red-50 text-red-700 ring-red-200',
                info: 'bg-blue-50 text-blue-700 ring-blue-200',
            },
        },
        defaultVariants: { variant: 'default' },
    },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
