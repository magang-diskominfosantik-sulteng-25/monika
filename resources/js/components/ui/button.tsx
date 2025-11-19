import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 disabled:pointer-events-none gap-2',
    {
        variants: {
            variant: {
                primary:
                    'bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:outline-blue-500',
                secondary:
                    'bg-slate-900/5 text-slate-900 ring-1 ring-slate-200 hover:bg-slate-100 focus-visible:outline-blue-500',
                ghost: 'hover:bg-slate-100 text-slate-700 focus-visible:outline-blue-500',
                danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-500',
                outline:
                    'border border-slate-300 text-slate-900 hover:bg-slate-50 focus-visible:outline-blue-500',
            },
            size: {
                sm: 'h-9 px-3',
                md: 'h-10 px-4',
                lg: 'h-11 px-5 text-base',
                icon: 'h-10 w-10 p-0',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    },
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(buttonVariants({ variant, size }), className)}
                {...props}
            />
        );
    },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
