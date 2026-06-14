import React from 'react';
import { DK as t } from '../../shared/theme';
import { Send } from 'lucide-react';
import { Loader } from '../../shared/Primitives';
import { teacherService } from '../../../../services/api';

export default function GrievancesTab({
  loadingGrievances,
  grievancesList,
  setGrievancesList,
  selectedGrievance,
  setSelectedGrievance,
  responseText,
  setResponseText,
  submittingResponse,
  setSubmittingResponse
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '1.28rem', fontWeight: 700, color: t.text }}>Student Grievances</div>
          <div style={{ fontSize: '.78rem', color: t.muted, marginTop: 2 }}>
            Review and respond to academic complaints and feedback.
          </div>
        </div>
      </div>

      <div className="card-dk" style={{ padding: '1.5rem' }}>
        <div style={{ fontWeight: 600, color: t.text, marginBottom: '1.25rem' }}>Grievances Portal</div>

        {loadingGrievances ? (
          <Loader />
        ) : grievancesList.length === 0 ? (
          <div style={{ color: t.muted, fontSize: '.85rem', textAlign: 'center', padding: '2rem 0' }}>
            No grievances submitted to you yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {grievancesList.map(g => (
              <div key={g.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.08)`, paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '.5rem' }}>
                  <div>
                    <div style={{ fontSize: '.85rem', fontWeight: 600, color: t.text }}>
                      {g.student?.user?.full_name} ({g.student_usn})
                    </div>
                    <div style={{ fontSize: '.7rem', color: t.muted, marginTop: 2 }}>
                      Course: <strong style={{ color: '#fff' }}>{g.course?.course_name} ({g.course_code})</strong>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '.65rem',
                    fontWeight: 600,
                    padding: '.15rem .45rem',
                    borderRadius: '4px',
                    backgroundColor: g.status === 'resolved' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                    color: g.status === 'resolved' ? '#10b981' : '#f59e0b',
                    border: `1px solid ${g.status === 'resolved' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                  }}>
                    {g.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ fontSize: '.68rem', color: t.muted, marginBottom: '.6rem' }}>
                  Received: {new Date(g.created_at).toLocaleString()}
                </div>

                <div style={{ fontSize: '.78rem', color: t.text, backgroundColor: 'rgba(255,255,255,0.02)', padding: '.75rem', borderRadius: '6px', borderLeft: `3px solid rgba(255,255,255,0.2)` }}>
                  {g.message}
                </div>

                {g.response ? (
                  <div style={{ marginTop: '.75rem', fontSize: '.78rem', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.02)', padding: '.75rem', borderRadius: '6px', borderLeft: '3px solid #10b981' }}>
                    <div style={{ fontWeight: 600, fontSize: '.72rem', color: '#10b981', marginBottom: '.2rem' }}>Your Resolution:</div>
                    {g.response}
                  </div>
                ) : (
                  <div style={{ marginTop: '.75rem' }}>
                    {selectedGrievance === g.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginTop: '.5rem', maxWidth: '500px' }}>
                        <textarea
                          className="inp-dk"
                          rows={3}
                          value={responseText}
                          onChange={e => setResponseText(e.target.value)}
                          placeholder="Type your resolution response..."
                        />
                        <div style={{ display: 'flex', gap: '.5rem' }}>
                          <button
                            className="btn btn-wh"
                            style={{ padding: '.35rem .75rem', fontSize: '.75rem' }}
                            disabled={submittingResponse || !responseText.trim()}
                            onClick={async () => {
                              setSubmittingResponse(true);
                              try {
                                await teacherService.respondToGrievance(g.id, responseText);
                                setResponseText('');
                                setSelectedGrievance(null);
                                const updated = await teacherService.getGrievances();
                                setGrievancesList(updated);
                              } catch (err) {
                                console.error(err);
                                alert('Failed to save response.');
                              } finally {
                                setSubmittingResponse(false);
                              }
                            }}
                          >
                            {submittingResponse ? 'Submitting...' : 'Submit Resolution'}
                          </button>
                          <button
                            className="btn btn-tl"
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
                        className="btn btn-wh"
                        style={{ padding: '.35rem .75rem', fontSize: '.75rem' }}
                        onClick={() => {
                          setSelectedGrievance(g.id);
                          setResponseText('');
                        }}
                      >
                        <Send size={11} /> Respond
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
