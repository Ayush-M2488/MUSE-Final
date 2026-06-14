import React from 'react';
import { DK as t } from '../../shared/theme';

export default function AnnouncementsTab({ announcements, C }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
            <div style={{ fontWeight: 600, color: t.text, marginBottom: '.75rem' }}>Class Announcements</div>
            {announcements.length === 0 ? (
                <C style={{ padding: '1.25rem' }}><div style={{ color: t.sub }}>No announcements yet.</div></C>
            ) : (
                announcements.map((a) => (
                    <C key={a.id} style={{ padding: '1rem 1.25rem', borderLeft: `3px solid ${t.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
                            <div style={{ fontWeight: 600, color: t.text }}>{a.title}</div>
                            <div style={{ fontSize: '.7rem', color: t.muted }}>{a.date}</div>
                        </div>
                        <div style={{ fontSize: '.85rem', color: t.sub, marginBottom: '.5rem', whiteSpace: 'pre-wrap' }}>{a.content}</div>
                        <div style={{ fontSize: '.7rem', color: t.muted }}>By {a.author}</div>
                    </C>
                ))
            )}
        </div>
    );
}
