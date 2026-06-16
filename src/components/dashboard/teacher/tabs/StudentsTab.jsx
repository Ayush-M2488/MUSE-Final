import React from 'react';
import { CH, Pbar } from '../../shared/Primitives';
import { DK as t } from '../../shared/theme';
import { Send, CheckCircle, Users } from 'lucide-react';
import { EmptyState } from '../../shared/Primitives';

export default function StudentsTab({
  ci,
  C,
  courseStudents,
  studentsLoading,
  renderCourseTabs,
  handleSort,
  getDerivedStudents,
  interactModalUsn,
  setInteractModalUsn,
  interactMessage,
  setInteractMessage,
  interactType,
  setInteractType,
  interactSuccess,
  setInteractSuccess,
  savingInteractMessage,
  handleSendDirectMessage
}) {
  const isAll = ci === -1;
  const [healthModalStudent, setHealthModalStudent] = React.useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {renderCourseTabs(true)}
      <div className="card-dk">
        <CH title="Manage Students" sub={isAll ? `${courseStudents.length} total enrollments` : `${C?.student_count || 0} students enrolled`} dk />
        <table className="tbl tbl-dk">
          <thead>
            <tr>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('usn')}>USN</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>Name</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('program')}>Program & Sem</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('course_code')}>Subject Context</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('att')}>Attendance</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('health_score')}>Health Score</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('cgpa')}>SGPA</th>
              <th>Interaction</th>
            </tr>
          </thead>
          <tbody>
            {studentsLoading ? <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>Loading students...</td></tr> :
              getDerivedStudents().length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: 0 }}>
                    <EmptyState icon={Users} title="Empty Roster" sub="No students are currently mapped to this view." />
                  </td>
                </tr>
              ) :
              getDerivedStudents().map((s) => (
                <tr key={s.usn}>
                  <td>{s.usn}</td>
                  <td>{s.name}</td>
                  <td>
                    <div>{s.program || 'Program Unset'}</div>
                    <div style={{ fontSize: '.72rem', color: t.muted }}>Semester {s.semester || '-'}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap' }}>
                      {s.assignedSubjects?.length > 0 ? s.assignedSubjects.map(sub => (
                         <span key={sub} className="b bL">{sub}</span>
                      )) : <span className="b">Unassigned</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                      <Pbar val={s.att} dk />
                      <span style={{ fontSize: '.75rem', color: s.att < 75 ? t.rHigh : t.muted }}>{s.att}%</span>
                    </div>
                  </td>
                  <td>
                    <span 
                      style={{ fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', color: s.health_score >= 75 ? t.rLow : s.health_score >= 50 ? t.gold : t.rHigh }}
                      onClick={() => setHealthModalStudent(s)}
                      title="Click to see breakdown"
                    >
                      {s.health_score || 0}/100
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500, color: s.cgpa > 0 ? (s.cgpa >= 8 ? t.rLow : s.cgpa < 6 ? t.rHigh : t.text) : t.muted }}>
                      {s.cgpa > 0 ? s.cgpa.toFixed(2) : '-'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-wh"
                      onClick={() => {
                        setInteractModalUsn(s.usn);
                        setInteractMessage('');
                        setInteractSuccess(false);
                        setInteractType('Personal Guidance');
                      }}
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Send size={11} /> Interact
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {interactModalUsn && (
        <div className="card-dk" style={{ padding: '1.5rem', borderLeft: `3px solid ${t.rLow}`, marginTop: '1.5rem' }}>
          <div style={{ fontWeight: 600, color: t.text, marginBottom: '1rem' }}>
            Interact with {getDerivedStudents().find(s => s.usn === interactModalUsn)?.name || interactModalUsn}
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div className="mlbl" style={{ color: t.muted, marginBottom: '.3rem' }}>Interaction Category</div>
                <select className="inp-dk" style={{ width: '100%' }} value={interactType} onChange={(e) => setInteractType(e.target.value)}>
                  <option value="Personal Guidance">🌟 Personal Guidance & Feedback</option>
                  <option value="Attendance Alert">⚠️ Attendance Warning</option>
                  <option value="Assignment Pending">📝 Assignment Submission Reminder</option>
                  <option value="One-on-One Session">🤝 Request Progress Catch-up Meeting</option>
                </select>
              </div>
              <div>
                <div className="mlbl" style={{ color: t.muted, marginBottom: '.3rem' }}>Predefined Quick Templates</div>
                <select 
                  className="inp-dk" 
                  style={{ width: '100%' }} 
                  onChange={(e) => {
                    if (e.target.value) {
                      setInteractMessage(e.target.value);
                    }
                  }}
                >
                  <option value="">-- Choose a Quick template --</option>
                  <option value="Outstanding performance in recent classes! Keep up the brilliant momentum.">Encouragement Template</option>
                  <option value="Your attendance has dropped close to the critical 75% threshold. Please ensure regular attendance to avoid academic blockages.">Attendance Alert Template</option>
                  <option value="You have outstanding assignments in this course. Please submit them by this weekend to ensure proper evaluation.">Pending Work Template</option>
                  <option value="Let's schedule a brief one-on-one session to clear your doubts and review your academic progress.">One-on-One Session Template</option>
                </select>
              </div>
            </div>

            <div>
              <div className="mlbl" style={{ color: t.muted, marginBottom: '.3rem' }}>Interaction Message</div>
              <textarea 
                className="inp-dk" 
                rows={4} 
                style={{ resize: 'vertical', width: '100%' }}
                value={interactMessage} 
                onChange={(e) => setInteractMessage(e.target.value)} 
                placeholder="Write your advice, recommendation or reminder..."
              />
            </div>

            {interactSuccess && (
              <div style={{ color: t.rLow, display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.85rem' }}>
                <CheckCircle size={14} /> Message sent directly to the student dashboard!
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-tl" onClick={handleSendDirectMessage} disabled={savingInteractMessage || interactSuccess}>
                {savingInteractMessage ? 'Sending...' : 'Send Guidance Notification'}
              </button>
              <button className="btn btn-gh" onClick={() => setInteractModalUsn(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {healthModalStudent && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.82)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={(e) => e.target === e.currentTarget && setHealthModalStudent(null)}
        >
          <div className="modal-dk" style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, width: '100%', maxWidth: 500 }}>
            <div style={{ padding: '1.1rem 1.25rem', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ fontWeight: 600, color: t.text }}>Academic Health Score</div>
                    <div style={{ fontSize: '.75rem', color: t.muted }}>{healthModalStudent.name} ({healthModalStudent.usn})</div>
                </div>
                <button onClick={() => setHealthModalStudent(null)} style={{ background: 'none', border: 'none', color: t.muted, cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: t.cardAlt, borderRadius: '10px', border: `1px solid ${t.border}` }}>
                    <div>
                        <div style={{ fontSize: '.78rem', color: t.muted, fontWeight: 500 }}>COMPOSITE SCORE</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: healthModalStudent.health_score >= 75 ? t.teal : healthModalStudent.health_score >= 50 ? t.gold : t.rHigh }}>
                            {healthModalStudent.health_score}/100
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '.78rem', color: t.muted, fontWeight: 500, marginBottom: '4px' }}>STATUS</div>
                        <span className={`b ${healthModalStudent.health_score >= 75 ? 'lL' : healthModalStudent.health_score >= 50 ? 'lM' : 'lH'}`}>
                            {healthModalStudent.health_score >= 75 ? 'Healthy' : healthModalStudent.health_score >= 50 ? 'At Risk' : 'Critical'}
                        </span>
                    </div>
                </div>

                <div>
                    <h4 style={{ fontSize: '.85rem', fontWeight: 600, color: t.text, marginBottom: '.35rem' }}>How is this calculated?</h4>
                    <p style={{ fontSize: '.8rem', color: t.sub, lineHeight: '1.45', background: t.cardAlt, padding: '.75rem', borderRadius: 8, border: `1px solid ${t.border}`, margin: 0 }}>
                        The Academic Health Score is a unified metric (0-100) combining three key pillars: 
                        <br/><br/>
                        <b>1. Attendance (50% Weight)</b>: Current standing is {healthModalStudent.att}%.<br/>
                        <b>2. Academics (50% Weight)</b>: Based on internal assessment and practical marks.<br/>
                        <b>3. AI Risk Multiplier</b>: If the AI Engine flags the student as Medium Risk, the raw score is penalized by 20% (x0.8). If High Risk, it is penalized by 40% (x0.6).
                        <br/><br/>
                        <i>Student AI Status: {healthModalStudent.risk} Risk</i>
                    </p>
                </div>
            </div>

            <div style={{ padding: '1rem 1.25rem', borderTop: `1px solid ${t.border}`, display: 'flex', justifyContent: 'flex-end', background: t.cardAlt, borderBottomLeftRadius: 14, borderBottomRightRadius: 14 }}>
                <button className="btn btn-np" onClick={() => setHealthModalStudent(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
