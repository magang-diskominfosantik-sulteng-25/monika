import { useState } from 'react';

import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';

interface ConfirmDialogProps {
    title: string;
    description?: string;
    confirmLabel?: string;
    variant?: 'primary' | 'danger';
    requireReason?: boolean;
    onConfirm: (reason?: string) => void;
}

export function ConfirmDialog({ title, description, confirmLabel = 'Lanjutkan', variant = 'primary', requireReason, onConfirm }: ConfirmDialogProps) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        onConfirm(reason);
        setOpen(false);
        setReason('');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={variant === 'danger' ? 'danger' : 'primary'} size="sm">
                    {confirmLabel}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                {requireReason && (
                    <div className="mt-2">
                        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Tuliskan alasan" aria-label="Alasan" />
                    </div>
                )}
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>
                        Batal
                    </Button>
                    <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={handleConfirm}>
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
