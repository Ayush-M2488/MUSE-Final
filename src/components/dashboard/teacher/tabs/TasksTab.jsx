import React from 'react';
import { DK as t } from '../../shared/theme';
import { Check, Plus, Trash2, CheckCircle } from 'lucide-react';
import { EmptyState } from '../../shared/Primitives';

export default function TasksTab({
  tasksList,
  taskModalOpen,
  setTaskModalOpen,
  taskData,
  setTaskData,
  courses,
  savingTask,
  handleCreateTask,
  toggleTask,
  handleDeleteTask,
  formatTaskDueDate
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 600, color: t.text }}>
          Tasks <span style={{ fontSize: '.78rem', color: t.muted, fontWeight: 400 }}>{tasksList.filter((x) => !x.done).length} pending</span>
        </div>
        <button className="btn btn-tl" onClick={() => setTaskModalOpen(true)} style={{ display: 'flex', gap: '.3rem', alignItems: 'center' }}>
          <Plus size={13} /> Add Task
        </button>
      </div>

      {taskModalOpen && (
        <div className="card-dk" style={{ padding: '1.25rem', borderLeft: `3px solid ${t.rLow}`, marginBottom: '1rem' }}>
          <div style={{ fontWeight: 600, color: t.text, marginBottom: '1rem' }}>Create New Task</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '.8rem' }}>
            <div>
              <div className="mlbl" style={{ color: t.muted, marginBottom: '.3rem' }}>Description</div>
              <input className="inp-dk" value={taskData.text} onChange={e => setTaskData({ ...taskData, text: e.target.value })} placeholder="E.g., Grade midterms" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <div className="mlbl" style={{ color: t.muted, marginBottom: '.3rem' }}>Due Date</div>
                <input className="inp-dk" type="date" value={taskData.due_date} onChange={e => setTaskData({ ...taskData, due_date: e.target.value })} style={{ colorScheme: 'dark' }} />
              </div>
              <div>
                <div className="mlbl" style={{ color: t.muted, marginBottom: '.3rem' }}>Link Course (Optional)</div>
                <select className="inp-dk" value={taskData.courseId} onChange={e => setTaskData({ ...taskData, courseId: e.target.value })}>
                  <option value="">None</option>
                  {courses.map(c => <option key={`${c.code}-${c.section}`} value={`${c.code}-${c.section}`}>{c.code} ({c.section})</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: t.text, cursor: 'pointer', fontSize: '.85rem' }}>
                  <input type="checkbox" checked={taskData.urgent} onChange={e => setTaskData({ ...taskData, urgent: e.target.checked })} style={{ accentColor: t.rHigh }} />
                  Mark as Urgent
                </label>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button className="btn btn-wh" onClick={handleCreateTask} disabled={savingTask}>
              {savingTask ? 'Saving...' : 'Save Task'}
            </button>
            <button className="btn btn-gh" onClick={() => setTaskModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {tasksList.length === 0 && (
          <EmptyState icon={CheckCircle} title="All Caught Up!" sub="You have no pending or completed tasks." />
      )}

      {tasksList.map((task) => (
        <div
          key={task.id}
          className="card-dk"
          style={{
            padding: '.9rem 1rem',
            borderLeft: `3px solid ${task.done ? 'rgba(255,255,255,.08)' : task.urgent ? t.rHigh : t.border}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '.55rem', flex: 1 }}>
            <button
              onClick={() => toggleTask(task.id)}
              style={{
                width: 17, height: 17, borderRadius: 4,
                border: `1.5px solid ${task.done ? t.rLow : 'rgba(255,255,255,.2)'}`,
                background: task.done ? `${t.rLow}22` : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {task.done && <Check size={9} style={{ color: t.rLow }} />}
            </button>
            <div>
              <div style={{ fontSize: '.82rem', color: task.done ? t.muted : t.text, textDecoration: task.done ? 'line-through' : 'none' }}>{task.text}</div>
              <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '.56rem', color: t.muted, marginTop: '.12rem' }}>Due {formatTaskDueDate(task.due)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
            {task.urgent && !task.done && <span className="b bH">Urgent</span>}
            <button className="btn btn-gh" style={{ padding: '.25rem .4rem', color: t.muted }} onClick={() => handleDeleteTask(task.id)} title="Delete Task">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
