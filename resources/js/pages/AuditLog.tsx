import { AppShell } from '../components/AppShell';
import { DataTable } from '../components/DataTable';
import { Badge } from '../components/ui/badge';
import { useApi } from '../lib/api';

type AuditLogData = {
    id: number;
    user_id: number;
    action: string;
    entity: string;
    entity_id: number;
    before: unknown;
    after: unknown;
    reason: string | null;
    created_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
};

export default function AuditLogPage() {
    const { data: auditLogs } = useApi<AuditLogData[]>('/audit-logs', []);

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'create':
                return <Badge variant="success">Create</Badge>;
            case 'update':
                return <Badge variant="info">Update</Badge>;
            case 'delete':
                return <Badge variant="danger">Delete</Badge>;
            default:
                return <Badge variant="muted">{action}</Badge>;
        }
    };

    return (
        <AppShell title="Audit Log" description="Jejak aktivitas sistem" active="audit-log">
            <div className="space-y-4">
                <DataTable
                    columns={[
                        {
                            key: 'created_at',
                            header: 'Waktu',
                            sortable: true,
                            render: (val) => new Date(val as string).toLocaleString('id-ID'),
                        },
                        {
                            key: 'user',
                            header: 'Pengguna',
                            render: (_val, row) => row.user?.name || '-',
                        },
                        {
                            key: 'action',
                            header: 'Aksi',
                            render: (val) => getActionBadge(val as string),
                        },
                        { key: 'entity', header: 'Entitas' },
                        { key: 'entity_id', header: 'ID Entitas' },
                    ]}
                    data={auditLogs || []}
                />
            </div>
        </AppShell>
    );
}
