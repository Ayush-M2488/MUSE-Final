import React from 'react';
import { Plus, Check, Trash2 } from 'lucide-react';
import { DK as t } from '../../shared/theme';
import { assignmentService } from '../../../../services/api';

export default function AssignmentsTab({
    assignments,
    setAssignments,
    assignTab,
    setAssignTab,
    assignModal,
    setAssignModal,
    assignData,
    setAssignData,
    savingAssign,
    setSavingAssign
}) {
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
                type: 'personal',
                audience: 'self'
            };
            if (payload.due_date) {
                payload.due_date = new Date(payload.due_date).toISOString();
            }
            const newA = await assignmentService.create(payload);
            setAssignments([newA, ...assignments]);
            setAssignModal(false);
            setAssignData({ title: '', description: '', due_date: '', priority: 'Medium' });
        } catch(e) {
            alert("Failed to create assignment");
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

    const filteredAssigns = assignments.filter(a => assignTab === 'academic' ? a.audience === 'student' : a.audience === 'self');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', borderBottom: `1px solid ${t.border}`, paddingBottom: '0.2rem' }}>
                    <div 
                        style={{ fontWeight: 600, color: assignTab === 'academic' ? '#fff' : t.muted, cursor: 'pointer', paddingBottom: '0.5rem', borderBottom: assignTab === 'academic' ? `2px solid ${t.rLow}` : 'none' }}
                        onClick={() => setAssignTab('academic')}
                    >
                        Academic Assignments
                    </div>
                    <div 
                        style={{ fontWeight: 600, color: assignTab === 'personal' ? '#fff' : t.muted, cursor: 'pointer', paddingBottom: '0.5rem', borderBottom: assignTab === 'personal' ? `2px solid ${t.rLow}` : 'none' }}
                        onClick={() => setAssignTab('personal')}
                    >
                        Personal Tasks
                    </div>
                </div>
                {assignTab === 'personal' && (
                    <button className="btn btn-tl" onClick={() => setAssignModal(true)} style={{ display: 'flex', gap: '.3rem', alignItems: 'center' }}>
                        <Plus size={13} /> Add Task
                    </button>
                )}
            </div>

            {assignModal && (
                <div className="card-dk" style={{ padding: '1.25rem', borderLeft: `3px solid ${t.rLow}`, marginBottom: '1rem', marginTop: '1rem' }}>
                    <div style={{ fontWeight: 600, color: t.text, marginBottom: '1rem' }}>Create Personal Task</div>
                    <div className="g2">
                        <div style={{ gridColumn: '1 / -1' }}>
                            <div className="mlbl" style={{ color: t.muted, marginBottom: '.3rem' }}>Title</div>
                            <input className="inp-dk" value={assignData.title} onChange={e => setAssignData({ ...assignData, title: e.target.value })} placeholder="E.g., Read chapter 4" />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <div className="mlbl" style={{ color: t.muted, marginBottom: '.3rem' }}>Description</div>
                            <textarea className="inp-dk" style={{ minHeight: 60, resize: 'vertical' }} value={assignData.description} onChange={e => setAssignData({ ...assignData, description: e.target.value })} placeholder="Details..." />
                        </div>
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
                    </div>
                    <div style={{ display: 'flex', gap: '.5rem', marginTop: '1.25rem' }}>
                        <button className="btn btn-wh" onClick={handleCreateAssign} disabled={savingAssign}>{savingAssign ? 'Saving...' : 'Add Task'}</button>
                        <button className="btn btn-gh" onClick={() => setAssignModal(false)}>Cancel</button>
                    </div>
                </div>
            )}

            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                {filteredAssigns.length === 0 ? (
                    <div className="card-dk" style={{ padding: '2rem', textAlign: 'center', color: t.muted, fontSize: '.9rem' }}>
                        No assignments found in this category.
                    </div>
                ) : (
                    filteredAssigns.map((a) => {
                        const isDone = a.status === 'done' || a.status === 'submitted' || a.status === 'graded';
                        return (
                            <div key={a.id} className="card-dk" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '.75rem', opacity: isDone ? 0.6 : 1 }}>
                                <button
                                    style={{
                                        width: 18, height: 18, borderRadius: 4,
                                        border: `1.5px solid ${isDone ? t.rLow : 'rgba(255,255,255,.2)'}`,
                                        background: isDone ? `${t.rLow}22` : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        cursor: a.status === 'graded' ? 'not-allowed' : 'pointer', 
                                        flexShrink: 0,
                                        opacity: a.status === 'graded' ? 0.7 : 1
                                    }}
                                    onClick={() => {
                                        if (a.status === 'graded') {
                                            return alert("This assignment has already been physically confirmed by the teacher and cannot be changed.");
                                        }
                                        handleAssignStatus(a.id, isDone ? 'pending' : (a.audience === 'self' ? 'done' : 'submitted'));
                                    }}
                                >
                                    {isDone && <Check size={12} color={t.rLow} />}
                                </button>
                                <div style={{ flex: 1 }}>
                                    <div style={{ textDecoration: isDone ? 'line-through' : 'none', color: t.text, fontSize: '.95rem', fontWeight: 600 }}>
                                        {a.title}
                                    </div>
                                    {a.description && <div style={{ fontSize: '.75rem', color: t.sub, marginTop: '.2rem' }}>{a.description}</div>}
                                    <div style={{ display: 'flex', gap: '.5rem', marginTop: '.4rem', alignItems: 'center' }}>
                                        {a.course_code && <span className="b bL">{a.course_code}</span>}
                                        <span className={`b ${a.priority === 'High' ? 'bH' : a.priority === 'Low' ? 'bL' : 'bM'}`}>{a.priority} Priority</span>
                                        {a.due_date && <span style={{ fontSize: '.7rem', color: t.muted }}>Due: {new Date(a.due_date).toLocaleString()}</span>}
                                        {renderAttachmentLinks(a.file_name, a.file_data)}
                                        {a.status !== 'pending' && (
                                            <span 
                                                className={`b ${a.status === 'graded' ? 'bGrd' : 'bSub'}`} 
                                                style={{ 
                                                    marginLeft: 'auto',
                                                    background: a.status === 'graded' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                                                    color: a.status === 'graded' ? '#34d399' : '#a78bfa',
                                                    border: a.status === 'graded' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(139, 92, 246, 0.2)',
                                                    fontSize: '0.68rem',
                                                    padding: '0.15rem 0.45rem',
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                {a.status === 'graded' ? 'Confirmed ✓' : 'Submitted (Awaiting Review)'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {assignTab === 'personal' && (
                                    <button className="btn btn-gh" style={{ padding: '.4rem', color: t.rHigh }} onClick={() => handleDeleteAssign(a.id)}>
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
