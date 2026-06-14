import React from 'react';
import { DK as t } from '../../shared/theme';
import { Send, Check } from 'lucide-react';

export default function AnnouncementsTab({
  dashboardData,
  annoTarget,
  setAnnoTarget,
  annoSent,
  setAnnoSent,
  anno,
  setAnno,
  handleSendAnnouncement
}) {
  return (
    <div className="card-dk" style={{ padding: '1.5rem', maxWidth: 510 }}>
      <div style={{ fontWeight: 600, color: t.text, marginBottom: '1.25rem' }}>Send Announcement</div>
      
      <div className="mlbl" style={{ color: t.muted, marginBottom: '.28rem' }}>Target Audience</div>
      <select 
        className="inp-dk" 
        style={{ marginBottom: '1rem', width: '100%' }}
        value={annoTarget} 
        onChange={(e) => {
          setAnnoTarget(e.target.value);
          setAnnoSent(false);
        }}
      >
        <option value="All">All Classes under my jurisdiction</option>
        {dashboardData?.profile?.is_hod && (
          <option value="Department_Broadcast">Entire Department (HOD Broadcast)</option>
        )}
        {dashboardData?.courses?.map(c => (
          <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
        ))}
      </select>

      <div className="mlbl" style={{ color: t.muted, marginBottom: '.28rem' }}>Message</div>
      <textarea
        className="inp-dk"
        rows={5}
        style={{ resize: 'vertical' }}
        value={anno}
        onChange={(e) => {
          setAnno(e.target.value);
          setAnnoSent(false);
        }}
      />
      {annoSent && (
        <div style={{ color: t.rLow, display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.8rem', marginTop: '.5rem' }}>
          <Check size={12} /> Sent!
        </div>
      )}
      <button
        className="btn btn-wh"
        style={{ marginTop: '.75rem' }}
        onClick={handleSendAnnouncement}
      >
        <Send size={12} /> Send
      </button>
    </div>
  );
}
