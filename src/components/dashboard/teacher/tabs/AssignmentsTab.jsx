import React, { useState, useEffect } from 'react';
import { Check, CheckCircle, ClipboardList, Edit2, Plus, Bell, Download, X, Paperclip, FileText, AlertTriangle, Send, Trash2, Users } from 'lucide-react';
import { CH, Loader, Pbar } from '../../shared/Primitives';
import { DK as t } from '../../shared/theme';
import { assignmentService } from '../../../../services/api';

export default function AssignmentsTab({ dashboardData }) {
  const courses = dashboardData?.courses || [];
  const [assignments, setAssignments] = useState([]);
  const [assignTab, setAssignTab] = useState('student');
  const [assignModal, setAssignModal] = useState(false);
  const [assignData, setAssignData] = useState({ title: '', description: '', due_date: '', priority: 'Medium', course_code: '', file_name: '', file_data: '' });
  const [savingAssign, setSavingAssign] = useState(false);
  const [expandedAssignId, setExpandedAssignId] = useState(null);
  const [submissionsRoster, setSubmissionsRoster] = useState([]);
  const [loadingRosterId, setLoadingRosterId] = useState(null);
  const [remindingAllId, setRemindingAllId] = useState(null);
  const [remindedStudents, setRemindedStudents] = useState({});
  const [syncingStudentUsn, setSyncingStudentUsn] = useState(null);

  useEffect(() => {
    const fetchAssigns = async () => {
        try {
            const assigns = await assignmentService.getAll();
            setAssignments(assigns);
        } catch (err) {
            console.error("Failed to fetch assignments", err);
        }
    };
    fetchAssigns();
  }, []);


  
      const getUploadedFilesList = (fileDataStr) => {
        if (!fileDataStr) return [];
        if (typeof fileDataStr === 'string' && fileDataStr.startsWith('[')) {
          try {
            return JSON.parse(fileDataStr);
          } catch(e) {
            return [];
          }
        }
        return [{ name: assignData.file_name || 'Attachment', data: fileDataStr }];
      };

      const renderAttachmentLinks = (fileName, fileData) => {
        if (!fileData) return null;
        let files = [];
        if (typeof fileData === 'string' && fileData.startsWith('[')) {
          try {
            files = JSON.parse(fileData);
          } catch (e) {
            files = [];
          }
        } else {
          files = [{ name: fileName || 'Details', data: fileData }];
        }
        
        return files.map((file, idx) => (
          <a 
            key={idx}
            href={file.data} 
            download={file.name}
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.7rem',
              color: '#a78bfa',
              textDecoration: 'none',
              background: 'rgba(167, 139, 250, 0.08)',
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              border: '1px solid rgba(167, 139, 250, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginLeft: '0.5rem'
            }}
          >
            📎 Details ({file.name})
          </a>
        ));
      };

      const handleCreateAssign = async () => {
        if (!assignData.title) return alert("Title is required");
        setSavingAssign(true);
        try {
           const payload = {
             ...assignData,
             type: assignTab,
             audience: assignTab
           };
           if (payload.due_date) {
               payload.due_date = new Date(payload.due_date).toISOString();
           }
           const newA = await assignmentService.create(payload);
           setAssignments([newA, ...assignments]);
           setAssignModal(false);
           setAssignData({ title: '', description: '', due_date: '', priority: 'Medium', course_code: '', file_name: '', file_data: '' });
        } catch(e) {
           console.error("Assignment creation error:", e);
           alert("Failed to create assignment: " + (e.response?.data?.error || e.message));
        } finally {
           setSavingAssign(false);
        }
      };

      const handleAssignStatus = async (id, status) => {
        try {
           await assignmentService.updateStatus(id, status);
           setAssignments(assignments.map(a => a.id === id ? { ...a, status } : a));
        } catch(e) {}
      };

      const handleDeleteAssign = async (id) => {
        try {
           await assignmentService.delete(id);
           setAssignments(assignments.filter(a => a.id !== id));
        } catch(e) {}
      };

      const toggleSubmissionsRoster = async (assignmentId) => {
        if (expandedAssignId === assignmentId) {
          setExpandedAssignId(null);
          setSubmissionsRoster([]);
          return;
        }
        setExpandedAssignId(assignmentId);
        setLoadingRosterId(assignmentId);
        try {
          const roster = await assignmentService.getSubmissions(assignmentId);
          setSubmissionsRoster(roster);
        } catch (e) {
          console.error("Failed to load submissions roster:", e);
        } finally {
          setLoadingRosterId(null);
        }
      };

      const toggleSubmissionCheckbox = async (assignmentId, studentUsn, currentStatus) => {
        const newStatus = currentStatus === 'graded' ? 'pending' : 'graded';
        setSyncingStudentUsn(studentUsn);
        try {
          const updated = await assignmentService.updateStudentSubmission(assignmentId, studentUsn, newStatus);
          setSubmissionsRoster(prev => prev.map(item => 
            item.usn === studentUsn ? { ...item, status: updated.status, submission_id: updated.id } : item
          ));
        } catch (e) {
          console.error("Failed to toggle student submission checkbox:", e);
          alert("Failed to update student submission status");
        } finally {
          setSyncingStudentUsn(null);
        }
      };

      const sendStudentReminder = async (assignmentId, studentUsn) => {
        try {
          await assignmentService.sendReminder(assignmentId, studentUsn);
          setRemindedStudents(prev => ({ ...prev, [studentUsn]: true }));
        } catch (e) {
          console.error("Failed to send individual reminder:", e);
          alert("Failed to send reminder");
        }
      };

      const sendAllReminders = async (assignmentId) => {
        setRemindingAllId(assignmentId);
        try {
          const res = await assignmentService.sendReminder(assignmentId);
          // Mark all pending students currently in roster as reminded
          const pendingUsns = submissionsRoster.filter(s => s.status === 'pending').map(s => s.usn);
          const updatedReminded = { ...remindedStudents };
          pendingUsns.forEach(usn => {
            updatedReminded[usn] = true;
          });
          setRemindedStudents(updatedReminded);
          alert(`Successfully sent reminders to ${res.remindedCount || pendingUsns.length} pending students!`);
        } catch (e) {
          console.error("Failed to send all reminders:", e);
          alert("Failed to send reminders");
        } finally {
          setRemindingAllId(null);
        }
      };

      const filteredAssigns = assignments.filter(a => a.audience === assignTab);

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', borderBottom: `1px solid ${t.border}`, paddingBottom: '0.2rem' }}>
              <div 
                style={{ fontWeight: 600, color: assignTab === 'student' ? '#fff' : t.muted, cursor: 'pointer', paddingBottom: '0.5rem', borderBottom: assignTab === 'student' ? `2px solid ${t.rLow}` : 'none' }}
                onClick={() => setAssignTab('student')}
              >
                Student Assignments
              </div>
              <div 
                style={{ fontWeight: 600, color: assignTab === 'self' ? '#fff' : t.muted, cursor: 'pointer', paddingBottom: '0.5rem', borderBottom: assignTab === 'self' ? `2px solid ${t.rLow}` : 'none' }}
                onClick={() => setAssignTab('self')}
              >
                Self Assignments
              </div>
            </div>
            <button className="btn btn-tl" onClick={() => setAssignModal(true)} style={{ display: 'flex', gap: '.3rem', alignItems: 'center' }}>
              <Plus size={13} /> Add Assignment
            </button>
          </div>

          {assignModal && (
            <div className="card-dk" style={{ padding: '1.25rem', borderLeft: `3px solid ${t.rLow}`, marginBottom: '1rem', marginTop: '1rem' }}>
              <div style={{ fontWeight: 600, color: t.text, marginBottom: '1rem' }}>Create New {assignTab === 'student' ? 'Student' : 'Self'} Assignment</div>
              <div className="g2">
                <div style={{ gridColumn: '1 / -1' }}>
                  <div className="mlbl" style={{ color: t.muted, marginBottom: '.3rem' }}>Title</div>
                  <input className="inp-dk" value={assignData.title} onChange={e => setAssignData({ ...assignData, title: e.target.value })} placeholder="E.g., Chapter 5 Exercises" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div className="mlbl" style={{ color: t.muted, marginBottom: '.3rem' }}>Description</div>
                  <textarea className="inp-dk" style={{ minHeight: 60, resize: 'vertical' }} value={assignData.description} onChange={e => setAssignData({ ...assignData, description: e.target.value })} placeholder="Details..." />
                </div>
                {assignTab === 'student' && (
                  <div>
                    <div className="mlbl" style={{ color: t.muted, marginBottom: '.3rem' }}>Course</div>
                    <select className="inp-dk" value={assignData.course_code} onChange={e => setAssignData({ ...assignData, course_code: e.target.value })}>
                      <option value="">Select Course</option>
                      {courses.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <div className="mlbl" style={{ color: t.muted, marginBottom: '.3rem' }}>Due Date</div>
                  <input className="inp-dk" type="datetime-local" value={assignData.due_date} onChange={e => setAssignData({ ...assignData, due_date: e.target.value })} />
                </div>
                <div>
                  <div className="mlbl" style={{ color: t.muted, marginBottom: '.3rem' }}>Priority</div>
                  <select className="inp-dk" value={assignData.priority} onChange={e => setAssignData({ ...assignData, priority: e.target.value })}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                {assignTab === 'student' && (
                  <div style={{ gridColumn: '1 / -1', marginTop: '0.4rem' }}>
                    <div className="mlbl" style={{ color: t.muted, marginBottom: '.3rem' }}>Assignment Details File(s) (Optional)</div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input 
                          type="file" 
                          id="assign-file-input"
                          style={{ display: 'none' }}
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            if (files.length === 0) return;
                            
                            let loadedFiles = [];
                            let count = 0;
                            
                            files.forEach((file) => {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                loadedFiles.push({
                                  name: file.name,
                                  data: event.target.result
                                });
                                count++;
                                if (count === files.length) {
                                  let currentList = [];
                                  if (assignData.file_data && assignData.file_data.startsWith('[')) {
                                    try {
                                      currentList = JSON.parse(assignData.file_data);
                                    } catch (err) {}
                                  } else if (assignData.file_data) {
                                    currentList = [{ name: assignData.file_name || 'Attachment', data: assignData.file_data }];
                                  }
                                  
                                  const newList = [...currentList, ...loadedFiles];
                                  setAssignData({
                                    ...assignData,
                                    file_name: newList.length === 1 ? newList[0].name : 'multiple',
                                    file_data: JSON.stringify(newList)
                                  });
                                }
                              };
                              reader.readAsDataURL(file);
                            });
                          }} 
                        />
                        <button 
                          className="btn btn-gh" 
                          type="button"
                          onClick={() => document.getElementById('assign-file-input').click()}
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem' }}
                        >
                          📎 Choose File(s)
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%' }}>
                        {getUploadedFilesList(assignData.file_data).length > 0 ? (
                          getUploadedFilesList(assignData.file_data).map((file, fIdx) => (
                            <div key={fIdx} style={{ fontSize: '0.72rem', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.03)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)', maxWidth: 'max-content' }}>
                              <span>Attached: <strong>{file.name}</strong></span>
                              <span 
                                style={{ cursor: 'pointer', color: t.rHigh, fontWeight: 'bold', padding: '0 0.2rem', fontSize: '0.8rem' }} 
                                onClick={() => {
                                  const list = getUploadedFilesList(assignData.file_data);
                                  const updated = list.filter((_, idx) => idx !== fIdx);
                                  setAssignData({
                                    ...assignData,
                                    file_name: updated.length === 1 ? updated[0].name : updated.length > 1 ? 'multiple' : '',
                                    file_data: updated.length > 0 ? JSON.stringify(updated) : ''
                                  });
                                }}
                                title="Remove attachment"
                              >
                                ✕
                              </span>
                            </div>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: t.muted }}>No files selected</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '.5rem', marginTop: '1.25rem' }}>
                <button className="btn btn-wh" onClick={handleCreateAssign} disabled={savingAssign}>{savingAssign ? 'Saving...' : 'Add Assignment'}</button>
                <button className="btn btn-gh" onClick={() => setAssignModal(false)}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
            {filteredAssigns.length === 0 ? (
              <div className="card-dk" style={{ padding: '2rem', textAlign: 'center', color: t.muted, fontSize: '.9rem' }}>
                No assignments found.
              </div>
            ) : (
              filteredAssigns.map((a) => (
                <div key={a.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div className="card-dk" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '.75rem', opacity: a.status === 'done' ? 0.6 : 1 }}>
                    {assignTab === 'self' && (
                      <button
                        style={{
                          width: 18, height: 18, borderRadius: 4,
                          border: `1.5px solid ${a.status === 'done' ? t.rLow : 'rgba(255,255,255,.2)'}`,
                          background: a.status === 'done' ? `${t.rLow}22` : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0
                        }}
                        onClick={() => handleAssignStatus(a.id, a.status === 'done' ? 'pending' : 'done')}
                      >
                        {a.status === 'done' && <Check size={12} color={t.rLow} />}
                      </button>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ textDecoration: a.status === 'done' ? 'line-through' : 'none', color: t.text, fontSize: '.95rem', fontWeight: 600 }}>
                        {a.title}
                      </div>
                      {a.description && <div style={{ fontSize: '.75rem', color: t.sub, marginTop: '.2rem' }}>{a.description}</div>}
                      <div style={{ display: 'flex', gap: '.5rem', marginTop: '.4rem', alignItems: 'center' }}>
                        {a.course_code && <span className="b bL">{a.course_code}</span>}
                        <span className={`b ${a.priority === 'High' ? 'bH' : a.priority === 'Low' ? 'bL' : 'bM'}`}>{a.priority} Priority</span>
                        {a.due_date && <span style={{ fontSize: '.7rem', color: t.muted }}>Due: {new Date(a.due_date).toLocaleString()}</span>}
                        {renderAttachmentLinks(a.file_name, a.file_data)}
                      </div>
                    </div>
                    {assignTab === 'student' && (
                      <button 
                        className="btn btn-gh" 
                        style={{ 
                          padding: '.35rem .75rem', 
                          color: expandedAssignId === a.id ? '#fff' : '#a78bfa',
                          background: expandedAssignId === a.id ? 'rgba(167, 139, 250, 0.15)' : 'transparent',
                          borderColor: 'rgba(167, 139, 250, 0.2)',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          borderRadius: '6px'
                        }} 
                        onClick={() => toggleSubmissionsRoster(a.id)}
                      >
                        <Users size={12} />
                        Submissions
                      </button>
                    )}
                    <button className="btn btn-gh" style={{ padding: '.4rem', color: t.rHigh }} onClick={() => handleDeleteAssign(a.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {expandedAssignId === a.id && (
                    <div 
                      className="card-dk" 
                      style={{ 
                        padding: '1.25rem', 
                        borderLeft: `3px solid #a78bfa`, 
                        marginLeft: '1.5rem', 
                        background: 'rgba(30, 27, 75, 0.15)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}
                    >
                      {loadingRosterId === a.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', color: t.muted, gap: '0.5rem', fontSize: '0.85rem' }}>
                          <div className="spinner" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#a78bfa', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                          <span>Loading student submissions...</span>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                            <div style={{ fontSize: '0.8rem', color: t.muted }}>
                              Class roster for course <strong style={{ color: '#fff' }}>{a.course_code}</strong> · Total: <strong>{submissionsRoster.length}</strong> students
                            </div>
                            <button
                              className="btn btn-gh"
                              style={{
                                fontSize: '0.72rem',
                                padding: '0.3rem 0.6rem',
                                color: '#a78bfa',
                                borderColor: 'rgba(167, 139, 250, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                              disabled={remindingAllId === a.id || submissionsRoster.filter(s => s.status === 'pending').length === 0}
                              onClick={() => sendAllReminders(a.id)}
                            >
                              <Bell size={11} />
                              {remindingAllId === a.id ? 'Sending...' : 'Remind All Pending'}
                            </button>
                          </div>

                          {submissionsRoster.length === 0 ? (
                            <div style={{ fontSize: '0.78rem', color: t.muted, padding: '0.5rem 0' }}>No students enrolled in this course section.</div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              {submissionsRoster.map(s => {
                                const isPending = s.status === 'pending';
                                const isSyncing = syncingStudentUsn === s.usn;
                                const isReminded = remindedStudents[s.usn];
                                
                                return (
                                  <div 
                                    key={s.usn} 
                                    style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'space-between', 
                                      padding: '0.5rem 0.75rem', 
                                      background: 'rgba(255,255,255,0.02)', 
                                      borderRadius: '6px', 
                                      border: '1px solid rgba(255,255,255,0.03)',
                                      gap: '1rem'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                      <input 
                                        type="checkbox"
                                        style={{ 
                                          width: 15, 
                                          height: 15, 
                                          accentColor: '#a78bfa', 
                                          cursor: isSyncing ? 'not-allowed' : 'pointer',
                                          opacity: isSyncing ? 0.5 : 1
                                        }}
                                        checked={s.status === 'graded'}
                                        disabled={isSyncing}
                                        onChange={() => toggleSubmissionCheckbox(a.id, s.usn, s.status)}
                                      />
                                      
                                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: t.text }}>{s.full_name}</span>
                                        <span style={{ fontSize: '0.68rem', color: t.muted }}>{s.usn} · BE {s.program}</span>
                                      </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                      <span 
                                        style={{ 
                                          fontSize: '0.65rem', 
                                          padding: '0.2rem 0.5rem', 
                                          borderRadius: '4px',
                                          fontWeight: 600,
                                          background: s.status === 'graded' ? 'rgba(16, 185, 129, 0.15)' : s.status === 'submitted' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                          color: s.status === 'graded' ? '#34d399' : s.status === 'submitted' ? '#a78bfa' : '#fbbf24',
                                          border: s.status === 'graded' ? '1px solid rgba(16, 185, 129, 0.2)' : s.status === 'submitted' ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)'
                                        }}
                                      >
                                        {s.status === 'graded' ? 'VERIFIED ✓' : s.status === 'submitted' ? 'SUBMITTED BY STUDENT' : 'PENDING'}
                                      </span>

                                      {isPending && (
                                        <button
                                          className="btn btn-gh"
                                          style={{
                                            fontSize: '0.65rem',
                                            padding: '0.2rem 0.45rem',
                                            color: isReminded ? '#10b981' : '#f59e0b',
                                            borderColor: isReminded ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.15rem'
                                          }}
                                          disabled={isReminded}
                                          onClick={() => sendStudentReminder(a.id, s.usn)}
                                        >
                                          {isReminded ? <Check size={10} /> : <Bell size={10} />}
                                          {isReminded ? 'Reminded' : 'Remind'}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      );
    
}
