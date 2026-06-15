import React from 'react';
import { CH } from '../../shared/Primitives';
import { DK as t } from '../../shared/theme';

export default function RiskTab({
  C,
  rf,
  setRf,
  courseStudents,
  predictions,
  studentsLoading,
  runningAI,
  handleRunAI,
  renderCourseTabs,
  interModalUsn,
  setInterModalUsn,
  interAction,
  setInterAction,
  interNotes,
  setInterNotes,
  savingIntervention,
  handleLogIntervention
}) {
  const riskData = courseStudents.map(s => {
    const p = predictions.find(pred => pred.usn === s.usn);
    return {
      ...s,
      risk: p ? p.risk_level : 'Unknown',
      factors: p ? p.factors : [],
      explanation: p ? p.explanation_text : 'Run AI Analysis to view factors'
    };
  });
  const filteredRisk = riskData.filter((s) => (rf === 'All' ? true : s.risk === rf));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem' }}>
        {renderCourseTabs()}
        <div style={{ display: 'flex', gap: '.35rem' }}>
          {['All', 'High', 'Medium', 'Low'].map((f) => (
            <button key={f} onClick={() => setRf(f)} className={`btn ${rf === f ? 'btn-wh' : 'btn-gh'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="card-dk" style={{ overflowX: 'auto' }}>
        <CH
          title={`Risk · ${C?.code || ''}`}
          sub="XAI-based · Accept or flag AI predictions"
          right={
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-gh" onClick={() => handleRunAI()} disabled={runningAI}>
                {runningAI ? 'Analyzing...' : 'Analyze Current'}
              </button>
              <button className="btn btn-tl" onClick={() => handleRunAI('all')} disabled={runningAI}>
                {runningAI ? 'Analyzing All...' : 'Analyze ALL Subjects'}
              </button>
            </div>
          }
          dk
        />
        <table className="tbl tbl-dk" style={{ minWidth: 950 }}>
          <thead>
            <tr>
              <th>Student</th>
              <th>Att. (%)</th>
              <th>IA-1</th>
              <th>IA-2</th>
              <th>IA-3</th>
              <th>Risk</th>
              <th>AI Explanation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {studentsLoading ? <tr><td colSpan="6">Loading...</td></tr> :
              filteredRisk.map((s) => (
                <tr key={s.usn}>
                  <td>{s.name}</td>
                  <td>{s.att !== undefined ? `${s.att}%` : 'N/A'}</td>
                  <td>{s.ia1 !== '' && s.ia1 !== null ? `${s.ia1}/30` : '-'}</td>
                  <td>{s.ia2 !== '' && s.ia2 !== null ? `${s.ia2}/30` : '-'}</td>
                  <td>{s.ia3 !== '' && s.ia3 !== null ? `${s.ia3}/30` : '-'}</td>
                  <td><span className={`b ${s.risk === 'High' ? 'bH' : s.risk === 'Medium' ? 'bM' : s.risk === 'Low' ? 'bL' : ''}`}>{s.risk}</span></td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: t.text, marginBottom: '0.3rem' }}>{s.explanation}</div>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {s.factors.length > 0 ? s.factors.map((f, i) => (
                        <div key={i} title={f.impact} style={{
                          fontSize: '0.65rem',
                          padding: '0.1rem 0.3rem',
                          borderRadius: '3px',
                          background: f.shap > 0 ? `${t.rHigh}33` : `${t.rLow}33`,
                          color: f.shap > 0 ? t.rHigh : t.rLow,
                          border: `1px solid ${f.shap > 0 ? t.rHigh : t.rLow}`
                        }}>
                          {f.feature} ({f.shap > 0 ? '+' : ''}{f.shap.toFixed(2)})
                        </div>
                      )) : <div style={{ fontSize: '0.7rem', color: t.muted }}>No SHAP factors</div>}
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button
                      className="btn btn-wh"
                      onClick={() => setInterModalUsn(s.usn)}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                    >
                      Log Action
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* NEW: Intervention Form (Shows only when a student is selected) */}
      {interModalUsn && (
        <div className="card-dk" style={{ padding: '1.5rem', borderLeft: `3px solid ${t.rMed}` }}>
          <div style={{ fontWeight: 600, color: t.text, marginBottom: '1rem' }}>
            Log Intervention for {courseStudents.find(s => s.usn === interModalUsn)?.name || interModalUsn}
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <div>
              <div className="mlbl" style={{ color: t.muted, marginBottom: '.3rem' }}>Action Taken</div>
              <select className="inp-dk" value={interAction} onChange={(e) => setInterAction(e.target.value)}>
                <option value="Meeting Scheduled">Meeting Scheduled</option>
                <option value="Email Sent">Email Sent</option>
                <option value="Warning Issued">Warning Issued</option>
                <option value="Extra Class Recommended">Extra Class Recommended</option>
              </select>
            </div>
            <div>
              <div className="mlbl" style={{ color: t.muted, marginBottom: '.3rem' }}>Notes / Details</div>
              <textarea className="inp-dk" rows={3} value={interNotes} onChange={(e) => setInterNotes(e.target.value)} placeholder="E.g., Student has been struggling with concepts..."></textarea>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-tl" onClick={handleLogIntervention} disabled={savingIntervention}>
                {savingIntervention ? 'Saving...' : 'Save & Log Audit'}
              </button>
              <button className="btn btn-gh" onClick={() => setInterModalUsn(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
