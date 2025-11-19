export const indikatorList = [
    {
        id: 1,
        jenis: 'IKU',
        nama: 'Persentase keterbukaan data publik',
        satuan: '%',
        tipe: 'percent',
        frequency: 'quarter',
        versi: '2025.1',
        aktif: true,
    },
    {
        id: 2,
        jenis: 'IKD',
        nama: 'Jumlah layanan digital terintegrasi',
        satuan: 'Layanan',
        tipe: 'numeric',
        frequency: 'semester',
        versi: '2025.1',
        aktif: true,
    },
    {
        id: 3,
        jenis: 'IKK',
        nama: 'Nilai indeks SPBE',
        satuan: 'Indeks',
        tipe: 'index',
        frequency: 'annual',
        versi: '2024.2',
        aktif: false,
    },
];

export const opdList = [
    { id: 10, nama: 'Dinas Komunikasi & Informatika', singkatan: 'Diskominfo', aktif: true },
    { id: 11, nama: 'Dinas Pendidikan & Kebudayaan', singkatan: 'Disdikbud', aktif: true },
    { id: 12, nama: 'Dinas Kesehatan', singkatan: 'Dinkes', aktif: false },
];

export const targetList = [
    {
        id: 100,
        opdId: 10,
        indikatorId: 1,
        periode: '2026-Q1',
        nilai: 75,
        tipe: 'percent',
    },
    {
        id: 101,
        opdId: 10,
        indikatorId: 2,
        periode: '2026-S1',
        nilai: 8,
        tipe: 'numeric',
    },
];

export const capaianList = [
    {
        id: 500,
        targetId: 100,
        indikatorId: 1,
        periode: '2026-Q1',
        capaian: 62,
        tipe: 'percent',
        status: 'draft',
        evidence: 1,
    },
    {
        id: 501,
        targetId: 101,
        indikatorId: 2,
        periode: '2026-S1',
        capaian: 6,
        tipe: 'numeric',
        status: 'valid',
        evidence: 2,
    },
];

export const auditLogs = [
    {
        id: 900,
        waktu: '2024-10-01 09:00',
        pengguna: 'Operator',
        aksi: 'Validasi',
        entitas: 'Capaian',
        entitasId: 500,
        alasan: '-',
    },
    {
        id: 901,
        waktu: '2024-10-05 14:12',
        pengguna: 'Operator',
        aksi: 'Buka Kunci',
        entitas: 'Capaian',
        entitasId: 501,
        alasan: 'Perlu revisi dokumen',
    },
];
