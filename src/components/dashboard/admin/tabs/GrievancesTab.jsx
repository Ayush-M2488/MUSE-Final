import React from 'react';
import { CH, Loader } from '../../shared/Primitives';
import { CheckCircle, AlertTriangle, Check } from 'lucide-react';
import { LT } from '../../shared/theme';
import { adminService } from '../../../../services/api';

const Card = ({ children, style }) => (
    <div className="card-lt" style={style}>
        {children}
    </div>
);

export default function GrievancesTab({ 
    t, setPage, grievancesList, setGrievancesList, loadingGrievances, 
    selectedGrievance, setSelectedGrievance, responseText, setResponseText,
    submittingResponse, setSubmittingResponse
}) {
    
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '1.28rem', fontWeight: 700, color: t.text }}>System Grievances</div>
                        <div style={{ fontSize: '.78rem', color: t.muted, marginTop: 2 }}>
                            Review and respond to administrative complaints and feedback directed to the System Administration.
                        </div>
                    </div>
                </div>

                <Card style={{ padding: '1.5rem' }}>
                    <div style={{ fontWeight: 600, color: t.text, marginBottom: '1.25rem' }}>Administrator Grievances Portal</div>

                    {loadingGrievances ? (
                        <Loader />
                    ) : grievancesList.length === 0 ? (
                        <div style={{ color: t.muted, fontSize: '.85rem', textAlign: 'center', padding: '2rem 0' }}>
                            No grievances submitted to the administration yet.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {grievancesList.map(g => (
                                <div key={g.id} style={{ borderBottom: `1px solid ${t.sep || '#F2F4F7'}`, paddingBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '.5rem' }}>
                                        <div>
                                            <div style={{ fontSize: '.85rem', fontWeight: 600, color: t.text }}>
                                                {g.student?.user?.full_name} ({g.student_usn})
                                            </div>
                                            <div style={{ fontSize: '.7rem', color: t.muted, marginTop: 2 }}>
                                                Department: <strong style={{ color: t.text }}>{g.student?.department} · Semester {g.student?.semester}</strong>
                                            </div>
                                        </div>
                                        <span style={{
                                            fontSize: '.65rem',
                                            fontWeight: 600,
                                            padding: '.15rem .45rem',
                                            borderRadius: '4px',
                                            backgroundColor: g.status === 'resolved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            color: g.status === 'resolved' ? '#10b981' : '#f59e0b',
                                            border: `1px solid ${g.status === 'resolved' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`
                                        }}>
                                            {g.status.toUpperCase()}
                                        </span>
                                    </div>

                                    <div style={{ fontSize: '.68rem', color: t.muted, marginBottom: '.6rem' }}>
                                        Received: {new Date(g.created_at).toLocaleString()}
                                    </div>

                                    <div style={{ fontSize: '.8rem', color: t.text, backgroundColor: 'rgba(0, 0, 0, 0.02)', padding: '.75rem', borderRadius: '6px', borderLeft: `3px solid rgba(0, 0, 0, 0.15)` }}>
                                        {g.message}
                                    </div>

                                    {g.response ? (
                                        <div style={{ marginTop: '.75rem', fontSize: '.8rem', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.02)', padding: '.75rem', borderRadius: '6px', borderLeft: '3px solid #10b981' }}>
                                            <div style={{ fontWeight: 600, fontSize: '.72rem', color: '#10b981', marginBottom: '.2rem' }}>Administration Response:</div>
                                            {g.response}
                                        </div>
                                    ) : (
                                        <div style={{ marginTop: '.75rem' }}>
                                            {selectedGrievance === g.id ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginTop: '.5rem', maxWidth: '500px' }}>
                                                    <textarea
                                                        className="inp-dk"
                                                        style={{ background: '#fff', border: '1px solid #D0D5DD', color: '#101828' }}
                                                        rows={3}
                                                        value={responseText}
                                                        onChange={e => setResponseText(e.target.value)}
                                                        placeholder="Type your administrative response..."
                                                    />
                                                    <div style={{ display: 'flex', gap: '.5rem' }}>
                                                        <button
                                                            className="btn btn-np"
                                                            style={{ padding: '.35rem .75rem', fontSize: '.75rem' }}
                                                            disabled={submittingResponse || !responseText.trim()}
                                                            onClick={async () => {
                                                                setSubmittingResponse(true);
                                                                try {
                                                                    await adminService.respondToGrievance(g.id, responseText);
                                                                    setResponseText('');
                                                                    setSelectedGrievance(null);
                                                                    const updated = await adminService.getGrievances();
                                                                    setGrievancesList(updated);
                                                                } catch (err) {
                                                                    console.error(err);
                                                                    alert('Failed to save response.');
                                                                } finally {
                                                                    setSubmittingResponse(false);
                                                                }
                                                            }}
                                                        >
                                                            {submittingResponse ? 'Submitting...' : 'Submit Response'}
                                                        </button>
                                                        <button
                                                            className="btn btn-ng"
                                                            style={{ padding: '.35rem .75rem', fontSize: '.75rem' }}
                                                            onClick={() => {
                                                                setSelectedGrievance(null);
                                                                setResponseText('');
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    className="btn btn-np"
                                                    style={{ padding: '.35rem .75rem', fontSize: '.75rem' }}
                                                    onClick={() => {
                                                        setSelectedGrievance(g.id);
                                                        setResponseText('');
                                                    }}
                                                >
                                                    Respond
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        );
    
}
