export type AchievementData = {
    id: number;
    indicator_id: number;
    opd_id: number;
    period_id: number;
    nilai_realisasi_num: number | null;
    nilai_realisasi_text: string | null;
    catatan: string | null;
    target_value: number | null;
    achievement_rate: number | null;
    indicator?: {
        id: number;
        nama: string;
        indicator_type: string;
        satuan: string;
    };
    opd?: { id: number; nama: string };
    period?: {
        id: number;
        label: string;
        period_key: string;
        tahun: number;
    };
};

export type TargetData = {
    id: number;
    indicator_id: number;
    opd_id: number;
    period_id: number;
    nilai_target_num: number | null;
    nilai_target_text: string | null;
    catatan: string | null;
    indicator?: {
        id: number;
        nama: string;
        indicator_type: string;
        satuan: string;
    };
    opd?: { id: number; nama: string };
    period?: {
        id: number;
        periode: string;
        label: string;
        tahun: number;
    };
};

export type OpdData = {
    id: number;
    nama: string;
    singkatan: string;
    kontak_nama?: string;
    kontak_hp?: string;
    aktif: boolean;
};

export type IndicatorData = {
    id: number;
    nama: string;
    satuan: string;
    indicator_type: string;
    frequency: string;
    jenis: string;
    opd_id: number | null;
};

export type PeriodData = { id: number; period_key: string; label: string; tahun: number };

export type EnrichedData = Omit<TargetData, 'opd'> & {
    target_id: number;
    achievement_id?: number;
    indikator: string;
    opd: string;
    periode: string;
    nilai_target: string | number;
    nilai_realisasi: string | number | null;
    achievement_rate: number | null;
};
