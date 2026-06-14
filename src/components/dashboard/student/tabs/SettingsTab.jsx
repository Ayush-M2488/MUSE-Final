import React from 'react';
import { DK as t } from '../../shared/theme';
import { Save } from 'lucide-react';
import ChangePasswordSection from '../../shared/ChangePasswordSection';

export default function SettingsTab({
    d,
    profileName,
    setProfileName,
    profileEmail,
    setProfileEmail,
    savingProfile,
    handleUpdateProfile
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
            {/* Account Settings Card */}
            <div className="card-dk" style={{ padding: '1.5rem', maxWidth: 480, flex: '1 1 400px' }}>
                <div style={{ fontWeight: 600, color: t.text, marginBottom: '1.25rem' }}>Account Settings</div>

                <div style={{ marginBottom: '.875rem' }}>
                    <div className="mlbl" style={{ color: t.muted, marginBottom: '.28rem' }}>Full Name</div>
                    <input className="inp-dk" value={profileName} onChange={e => setProfileName(e.target.value)} />
                </div>
                <div style={{ marginBottom: '.875rem' }}>
                    <div className="mlbl" style={{ color: t.muted, marginBottom: '.28rem' }}>Email</div>
                    <input className="inp-dk" type="email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} />
                </div>
                <div style={{ marginBottom: '.875rem' }}>
                    <div className="mlbl" style={{ color: t.muted, marginBottom: '.28rem' }}>Phone</div>
                    <input className="inp-dk" defaultValue={d?.phone || ''} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
                <div style={{ marginBottom: '.875rem' }}>
                    <div className="mlbl" style={{ color: t.muted, marginBottom: '.28rem' }}>USN</div>
                    <input className="inp-dk" defaultValue={d?.usn || ''} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
                <div style={{ marginBottom: '.875rem' }}>
                    <div className="mlbl" style={{ color: t.muted, marginBottom: '.28rem' }}>Program</div>
                    <input className="inp-dk" defaultValue={d?.program || ''} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>

                <button className="btn btn-wh" onClick={handleUpdateProfile} disabled={savingProfile}>
                    <Save size={12} /> {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
            
            <div style={{ flex: '1 1 400px' }}>
                <ChangePasswordSection />
            </div>
        </div>
    );
}
