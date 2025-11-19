import { Head } from '@inertiajs/react';
import { useState } from 'react';

import AuditLogPage from './AuditLog';
import CapaianPage from './Capaian';
import Dashboard from './Dashboard';
import IndikatorPage from './Indikator';
import LaporanPage from './Laporan';
import OPDPage from './OPD';
import TargetPage from './Target';
import PeriodPage from './Period';

export default function Welcome() {
    const [active, setActive] = useState<'dashboard' | 'indikator' | 'target' | 'capaian' | 'opd' | 'laporan' | 'audit' | 'periode'>('dashboard');

    const handleNavigate = (href: string) => {
        const map: Record<string, typeof active> = {
            dashboard: 'dashboard',
            indikator: 'indikator',
            periode: 'periode',
            entri: 'target',
            opd: 'opd',
            laporan: 'laporan',
            audit: 'audit',
            target: 'target',
            capaian: 'capaian',
        };
        setActive(map[href] ?? 'dashboard');
    };

    const renderActive = () => {
        switch (active) {
            case 'indikator':
                return <IndikatorPage onNavigate={handleNavigate} />;
            case 'target':
                return <TargetPage onNavigate={handleNavigate} />;
            case 'capaian':
                return <CapaianPage onNavigate={handleNavigate} />;
            case 'opd':
                return <OPDPage onNavigate={handleNavigate} />;
            case 'laporan':
                return <LaporanPage onNavigate={handleNavigate} />;
            case 'audit':
                return <AuditLogPage onNavigate={handleNavigate} />;
            case 'periode':
                return <PeriodPage onNavigate={handleNavigate} />;
            default:
                return <Dashboard onNavigate={handleNavigate} />;
        }
    };

    return (
        <>
            <Head title="Dashboard Monika">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>
            {renderActive()}
        </>
    );
}
