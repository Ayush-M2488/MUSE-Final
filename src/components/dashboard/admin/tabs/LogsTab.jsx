import React from 'react';
import { CH, Loader } from '../../shared/Primitives';
import { LT } from '../../shared/theme';

const Card = ({ children, style }) => (
    <div className="card-lt" style={style}>
        {children}
    </div>
);

export default function LogsTab({ t, setPage, auditLogs }) {
    
        return (
            <Card>
                <CH title="System Audit Trail" sub="Real-time global timeline of ML interventions and faculty actions" />
                <div style={{ overflowX: 'auto' }}>
                    <table className="tbl tbl-lt" style={{ minWidth: 600 }}>
                        <thead>
                            <tr><th>Timestamp</th><th>Actor</th><th>Action Type</th><th>Target Entity</th><th>Details / Notes</th></tr>
                        </thead>
                        <tbody>
                            {auditLogs.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', color: t.muted }}>No audit logs found.</td></tr>
                            ) : (
                                auditLogs.map((log) => {
                                    let details = {};
                                    if (typeof log.details === 'string') {
                                        try { details = JSON.parse(log.details); } catch(e) { details = { message: log.details }; }
                                    } else {
                                        details = log.details || {};
                                    }
                                    return (
                                        <tr key={log.id}>
                                            <td style={{ fontSize: '0.8rem', color: t.muted }}>{new Date(log.created_at).toLocaleString()}</td>
                                            <td>
                                                <div style={{ fontWeight: 500 }}>{log.actor_name}</div>
                                                <div style={{ fontSize: '0.65rem', color: t.muted, textTransform: 'uppercase' }}>{log.actor_role}</div>
                                            </td>
                                            <td><span className="b bM">{log.action}</span></td>
                                            <td>{log.entity_type === 'intervention' && details.usn ? `Student: ${details.usn}` : log.entity_type}</td>
                                            <td style={{ fontSize: '0.8rem', maxWidth: '300px', whiteSpace: 'normal' }}>{details.notes || details.action_taken || 'N/A'}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        );

}
