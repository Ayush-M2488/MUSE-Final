import React from 'react';
import { Check, Send } from 'lucide-react';
import { DK as t } from '../../shared/theme';
import { studentService } from '../../../../services/api';

export default function GrievancesTab({
    d,
    grievanceTarget,
    setGrievanceTarget,
    grievanceTeacherSelect,
    setGrievanceTeacherSelect,
    grievance,
    setGrievance,
    sent,
    setSent,
    submittingGrievance,
    setSubmittingGrievance,
    grievancesList,
    setGrievancesList
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
                <div style={{ fontSize: '1.28rem', fontWeight: 700, color: t.text }}>Submit & Manage Grievances</div>
                <div style={{ fontSize: '.78rem', color: t.muted, marginTop: 2 }}>
                    Report issues to your subject teachers or the administration.
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
                {/* Grievance Card */}
                <div className="card-dk" style={{ padding: '1.5rem' }}>
                    <div style={{ fontWeight: 600, color: t.text, marginBottom: '1.25rem' }}>Submit a Grievance</div>

                    <div style={{ marginBottom: '.875rem' }}>
                        <div className="mlbl" style={{ color: t.muted, marginBottom: '.28rem' }}>Send to</div>
                        <select
                            className="inp-dk"
                            value={grievanceTarget}
                            onChange={e => {
                                setGrievanceTarget(e.target.value);
                                setGrievanceTeacherSelect('');
                            }}
                        >
                            <option value="admin">System Administrator</option>
                            <option value="teacher">Course Teacher</option>
                        </select>
                    </div>

                    {grievanceTarget === 'teacher' && (
                        <div style={{ marginBottom: '.875rem' }}>
                            <div className="mlbl" style={{ color: t.muted, marginBottom: '.28rem' }}>Select Course / Teacher</div>
                            <select
                                className="inp-dk"
                                value={grievanceTeacherSelect}
                                onChange={e => setGrievanceTeacherSelect(e.target.value)}
                            >
                                <option value="">-- Select Teacher --</option>
                                {(d?.subjects || [])
                                    .filter(s => s.teacherEmpId && s.teacherEmpId !== 'TBD')
                                    .map(s => (
                                        <option key={s.code} value={`${s.code}|${s.teacherEmpId}`}>
                                            {s.name} ({s.code}) - {s.teacher}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    )}

                    <div style={{ marginBottom: '.875rem' }}>
                        <div className="mlbl" style={{ color: t.muted, marginBottom: '.28rem' }}>Message</div>
                        <textarea
                            className="inp-dk"
                            rows={4}
                            style={{ resize: 'vertical' }}
                            value={grievance}
                            onChange={e => {
                                setGrievance(e.target.value);
                                setSent(false);
                            }}
                            placeholder="Describe your issue or grievance..."
                        />
                    </div>
                    
                    {sent && (
                        <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.8rem', marginBottom: '.875rem' }}>
                            <Check size={12} /> Grievance submitted successfully!
                        </div>
                    )}

                    <button
                        className="btn btn-wh"
                        disabled={submittingGrievance || !grievance.trim() || (grievanceTarget === 'teacher' && !grievanceTeacherSelect)}
                        onClick={async () => {
                            if (!grievance.trim()) return;
                            const payload = {
                                target_type: grievanceTarget,
                                message: grievance
                            };
                            if (grievanceTarget === 'teacher') {
                                const [courseCode, teacherEmpId] = grievanceTeacherSelect.split('|');
                                payload.target_emp_id = teacherEmpId;
                                payload.course_code = courseCode;
                            }
                            setSubmittingGrievance(true);
                            try {
                                await studentService.submitGrievance(payload);
                                setSent(true);
                                setGrievance('');
                                setGrievanceTeacherSelect('');
                                const updated = await studentService.getGrievances();
                                setGrievancesList(updated);
                                setTimeout(() => setSent(false), 4000);
                            } catch (err) {
                                console.error(err);
                                alert(err.response?.data?.error || 'Failed to submit grievance');
                            } finally {
                                setSubmittingGrievance(false);
                            }
                        }}
                    >
                        <Send size={12} /> {submittingGrievance ? 'Submitting...' : 'Submit Grievance'}
                    </button>
                </div>

                {/* Grievance History Card */}
                <div className="card-dk" style={{ padding: '1.5rem' }}>
                    <div style={{ fontWeight: 600, color: t.text, marginBottom: '1.25rem' }}>Grievance History</div>
                    
                    {grievancesList.length === 0 ? (
                        <div style={{ color: t.muted, fontSize: '.85rem', textAlign: 'center', padding: '1rem 0' }}>
                            No grievances submitted yet.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '.25rem' }}>
                            {grievancesList.map(g => (
                                <div key={g.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.08)`, paddingBottom: '0.875rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '.35rem' }}>
                                        <div style={{ fontSize: '.8rem', fontWeight: 600, color: t.text }}>
                                            {g.target_type === 'admin' ? 'System Administrator' : `Teacher: ${g.faculty?.user?.full_name || 'To Be Decided'} (${g.course_code})`}
                                        </div>
                                        <span style={{
                                            fontSize: '.62rem',
                                            fontWeight: 600,
                                            padding: '.12rem .35rem',
                                            borderRadius: '4px',
                                            backgroundColor: g.status === 'resolved' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                                            color: g.status === 'resolved' ? '#10b981' : '#f59e0b',
                                            border: `1px solid ${g.status === 'resolved' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                                        }}>
                                            {g.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '.68rem', color: t.muted, marginBottom: '.5rem' }}>
                                        Submitted: {new Date(g.created_at).toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: '.78rem', color: t.text, backgroundColor: 'rgba(255,255,255,0.02)', padding: '.6rem', borderRadius: '4px', borderLeft: `3px solid rgba(255,255,255,0.2)` }}>
                                        {g.message}
                                    </div>
                                    {g.response && (
                                        <div style={{ marginTop: '.5rem', fontSize: '.78rem', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.02)', padding: '.6rem', borderRadius: '4px', borderLeft: '3px solid #10b981' }}>
                                            <div style={{ fontWeight: 600, fontSize: '.72rem', color: '#10b981', marginBottom: '.15rem' }}>Resolution response:</div>
                                            {g.response}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
