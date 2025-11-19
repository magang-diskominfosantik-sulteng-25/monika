import { UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';

import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface FileDropzoneProps {
    label: string;
    maxFiles?: number;
    onChange?: (files: File[]) => void;
}

export function FileDropzone({ label, maxFiles = 5, onChange }: FileDropzoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<File[]>([]);

    const handleFiles = (next: FileList | null) => {
        if (!next) return;
        const selected = Array.from(next).slice(0, maxFiles);
        setFiles(selected);
        onChange?.(selected);
    };

    return (
        <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-800">{label}</p>
            <div
                className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    handleFiles(e.dataTransfer.files);
                }}
                role="button"
                tabIndex={0}
                aria-label="Unggah berkas"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
                }}
            >
                <UploadCloud className="h-6 w-6 text-blue-600" aria-hidden />
                <div>
                    <p className="text-sm font-semibold text-slate-800">Tarik & lepaskan berkas</p>
                    <p className="text-xs text-slate-500">PDF/JPG/PNG, maks 10MB per berkas, maks {maxFiles} berkas</p>
                </div>
                <Button type="button" variant="secondary" size="sm">
                    Pilih Berkas
                </Button>
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    className="sr-only"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => handleFiles(e.target.files)}
                />
            </div>
            {files.length > 0 && (
                <div className="flex flex-wrap gap-2" aria-live="polite">
                    {files.map((file) => (
                        <Badge key={file.name} variant="info" className="flex items-center gap-2">
                            <span className="truncate text-xs">{file.name}</span>
                            <button
                                className="text-[10px] font-bold"
                                onClick={() => {
                                    const filtered = files.filter((f) => f.name !== file.name);
                                    setFiles(filtered);
                                    onChange?.(filtered);
                                }}
                                aria-label={`Hapus ${file.name}`}
                            >
                                ×
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
