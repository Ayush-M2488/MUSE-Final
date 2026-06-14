import React from 'react';
import { DK as t } from '../../shared/theme';

export default function NotificationsTab({ d, setD, unread, markRead }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 600, color: t.text }}>
                    Notifications <span style={{ fontSize: '.78rem', color: t.muted, fontWeight: 400 }}>{unread} unread</span>
                </div>
                <button
                    className="btn btn-gh"
                    onClick={() =>
                        setD((p) => ({
                            ...p,
                            notifications: p.notifications.map((n) => ({ ...n, read: true })),
                        }))
                    }
                >
                    Mark all read
                </button>
            </div>

            {d.notifications.map((n) => (
                <div
                    key={n.id}
                    className="card-dk"
                    style={{
                        padding: '1rem 1.25rem',
                        borderLeft: `3px solid ${n.type === 'warn' ? t.rMed : n.type === 'ok' ? t.rLow : n.type === 'alert' ? t.rHigh : 'rgba(255,255,255,.5)'
                            }`,
                        opacity: n.read ? 0.52 : 1,
                        cursor: 'pointer',
                    }}
                    onClick={() => markRead(n.id)}
                >
                    <div style={{ color: t.text }}>{n.text}</div>
                    <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '.56rem', color: t.muted, marginTop: '.2rem' }}>{n.time}</div>
                </div>
            ))}
        </div>
    );
}
