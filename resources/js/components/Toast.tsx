import { useEffect } from 'react';

interface ToastProps {
    message: string;
    onClose: () => void;
    duration?: number;
}

export function Toast({ message, onClose, duration = 2500 }: ToastProps) {
    useEffect(() => {
        const id = setTimeout(onClose, duration);
        return () => clearTimeout(id);
    }, [duration, onClose]);

    return <div className="fixed right-6 bottom-6 z-50 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg">{message}</div>;
}
