import React from 'react';
import { DK as t } from '../../shared/theme';
import { Save } from 'lucide-react';
import ChangePasswordSection from '../../shared/ChangePasswordSection';

export default function SettingsTab({
  profile,
  courses,
  dashboardData,
  profileName,
  setProfileName,
  profileEmail,
  setProfileEmail,
  savingProfile,
  handleUpdateProfile,
  customThresholds,
  setCustomThresholds,
  emailOnHighRisk,
  setEmailOnHighRisk,
  autoNotifyAbsentee,
  setAutoNotifyAbsentee,
  consultationSlots,
  setConsultationSlots,
  removeSlot,
  newSlotDay,
  setNewSlotDay,
  newSlotStart,
  setNewSlotStart,
  newSlotEnd,
  setNewSlotEnd
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
      {/* Column 1: Personal Details */}
      <div className="card-dk" style={{ padding: '1.5rem' }}>
        <div style={{ fontWeight: 600, color: t.text, marginBottom: '1.25rem' }}>Account & Profile Details</div>

        <div style={{ marginBottom: '.875rem' }}>
          <div className="mlbl" style={{ color: t.muted, marginBottom: '.28rem' }}>Full Name</div>
          <input className="inp-dk" value={profileName} onChange={e => setProfileName(e.target.value)} />
        </div>
        <div style={{ marginBottom: '.875rem' }}>
          <div className="mlbl" style={{ color: t.muted, marginBottom: '.28rem' }}>Email</div>
          <input className="inp-dk" type="email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} />
        </div>
        <div style={{ marginBottom: '.875rem' }}>
          <div className="mlbl" style={{ color: t.muted, marginBottom: '.28rem' }}>Employee ID</div>
          <input className="inp-dk" defaultValue={profile?.emp_id || ''} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
        </div>
        <div style={{ marginBottom: '.875rem' }}>
          <div className="mlbl" style={{ color: t.muted, marginBottom: '.28rem' }}>Department</div>
          <input className="inp-dk" defaultValue={profile?.department || ''} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
        </div>

        <button className="btn btn-wh" style={{ marginTop: '.5rem' }} onClick={handleUpdateProfile} disabled={savingProfile}>
          <Save size={12} /> {savingProfile ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Column 2: Classroom & Consultation Preferences */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Custom Attendance Thresholds */}
        <div className="card-dk" style={{ padding: '1.5rem' }}>
          <div style={{ fontWeight: 600, color: t.text, marginBottom: '.4rem' }}>Subject Attendance Requirements</div>
          <p style={{ fontSize: '.75rem', color: t.muted, marginBottom: '1rem', marginTop: 0 }}>
            Set custom attendance percentage alerts per class. Defaults to {dashboardData?.globalConfig?.minAtt || 75}%.
          </p>

          {courses.length === 0 ? (
            <div style={{ fontSize: '.8rem', color: t.muted }}>No courses assigned.</div>
          ) : (
            courses.map(c => {
              const val = customThresholds[c.code] !== undefined ? customThresholds[c.code] : 75;
              return (
                <div key={`${c.code}-${c.section}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.65rem' }}>
                  <span style={{ fontSize: '.78rem', color: t.text, fontWeight: 500 }}>{c.code} ({c.section}) <span style={{ color: t.muted, fontWeight: 400 }}>· {c.name}</span></span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                    <input
                      type="number"
                      min="50"
                      max="95"
                      className="inp-dk"
                      style={{ width: '60px', padding: '.25rem .4rem', fontSize: '.78rem', textAlign: 'center' }}
                      value={val}
                      onChange={(e) => setCustomThresholds(p => ({ ...p, [c.code]: parseInt(e.target.value) || 75 }))}
                    />
                    <span style={{ fontSize: '.8rem', color: t.muted }}>%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Notification & Alerts Prefs */}
        <div className="card-dk" style={{ padding: '1.5rem' }}>
          <div style={{ fontWeight: 600, color: t.text, marginBottom: '1rem' }}>Notification Preferences</div>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.6rem', marginBottom: '.75rem' }}>
            <input
              type="checkbox"
              id="emailRisk"
              checked={emailOnHighRisk}
              onChange={(e) => setEmailOnHighRisk(e.target.checked)}
              style={{ marginTop: '3px', cursor: 'pointer' }}
            />
            <label htmlFor="emailRisk" style={{ fontSize: '.8rem', color: t.text, cursor: 'pointer', lineHeight: 1.3 }}>
              <strong>Risk alerts</strong><br />
              <span style={{ color: t.muted, fontSize: '.72rem' }}>Email me directly when the AI flags a student as "High Risk"</span>
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.6rem' }}>
            <input
              type="checkbox"
              id="autoNudge"
              checked={autoNotifyAbsentee}
              onChange={(e) => setAutoNotifyAbsentee(e.target.checked)}
              style={{ marginTop: '3px', cursor: 'pointer' }}
            />
            <label htmlFor="autoNudge" style={{ fontSize: '.8rem', color: t.text, cursor: 'pointer', lineHeight: 1.3 }}>
              <strong>Auto absentee warning nudges</strong><br />
              <span style={{ color: t.muted, fontSize: '.72rem' }}>Automatically message students when they fall below threshold</span>
            </label>
          </div>
        </div>

        {/* Consultation Slots */}
        <div className="card-dk" style={{ padding: '1.5rem' }}>
          <div style={{ fontWeight: 600, color: t.text, marginBottom: '.4rem' }}>Office & Consultation Hours</div>
          <p style={{ fontSize: '.75rem', color: t.muted, marginBottom: '1rem', marginTop: 0 }}>
            Set available slots for students to book counseling and query clearances.
          </p>

          {/* Slots List */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginBottom: '1rem' }}>
            {consultationSlots.length === 0 ? (
              <span style={{ fontSize: '.78rem', color: t.muted, fontStyle: 'italic' }}>No consultation slots configured.</span>
            ) : (
              consultationSlots.map((slot, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '.3rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '6px',
                    padding: '.25rem .5rem',
                    fontSize: '.75rem',
                    color: t.text
                  }}
                >
                  <span>{slot.day}: {slot.start} - {slot.end}</span>
                  <button
                    onClick={() => removeSlot(idx)}
                    style={{ background: 'none', border: 'none', color: t.rHigh, cursor: 'pointer', fontSize: '.85rem', padding: 0 }}
                    title="Delete slot"
                  >&times;</button>
                </div>
              ))
            )}
          </div>

          {/* Add Slot Control */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '.45rem', alignItems: 'end' }}>
            <div>
              <div className="mlbl" style={{ color: t.muted, fontSize: '.7rem', marginBottom: '.15rem' }}>Weekday</div>
              <select className="inp-dk" style={{ padding: '.3rem', fontSize: '.78rem', width: '100%', height: '36px' }} value={newSlotDay} onChange={(e) => setNewSlotDay(e.target.value)}>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="mlbl" style={{ color: t.muted, fontSize: '.7rem', marginBottom: '.15rem' }}>Start Time</div>
              <input type="time" className="inp-dk" style={{ padding: '.3rem', fontSize: '.78rem' }} value={newSlotStart} onChange={(e) => setNewSlotStart(e.target.value)} />
            </div>
            <div>
              <div className="mlbl" style={{ color: t.muted, fontSize: '.7rem', marginBottom: '.15rem' }}>End Time</div>
              <input type="time" className="inp-dk" style={{ padding: '.3rem', fontSize: '.78rem' }} value={newSlotEnd} onChange={(e) => setNewSlotEnd(e.target.value)} />
            </div>
            <button
              type="button"
              className="btn btn-tl"
              style={{ padding: '.35rem .6rem' }}
              onClick={() => {
                if (!newSlotStart || !newSlotEnd) return alert('Select start and end times');
                const slot = { day: newSlotDay, start: newSlotStart, end: newSlotEnd };
                setConsultationSlots(prev => [...prev, slot]);
              }}
            >Add</button>
          </div>
        </div>

      </div>
      <ChangePasswordSection />
    </div>
  );
}
