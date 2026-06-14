import React from 'react';
import { CH, Loader } from '../../shared/Primitives';
import { DK as t } from '../../shared/theme';

export default function MarksTab({
  ci,
  setCi,
  courses,
  C,
  savingMarks,
  handleSaveMarks,
  studentsLoading,
  courseStudents,
  handleMarkChange,
  renderCourseTabs
}) {
  if (ci === -1) {
    // Force select a course for marks
    setCi(0);
    return <Loader dk />;
  }

  return (
    <div>
      {renderCourseTabs(false)}
      <div className="card-dk">
        <CH 
          title="Enter IA Marks" 
          sub={C?.name || 'Course'} 
          right={
            <button 
              className="btn btn-tl" 
              onClick={handleSaveMarks} 
              disabled={savingMarks}
            >
              {savingMarks ? 'Saving...' : 'Save Marks'}
            </button>
          } 
          dk 
        />
        <table className="tbl tbl-dk">
          <thead>
            <tr>
              <th>USN</th>
              <th>Student</th>
              <th>IA-1</th>
              <th>IA-2</th>
              <th>IA-3</th>
              <th>Avg IA</th>
              <th>Practical</th>
              <th>Internal Total</th>
              <th>Final Exam</th>
              <th>Overall (100)</th>
            </tr>
          </thead>
          <tbody>
            {studentsLoading ? (
              <tr><td colSpan="10">Loading students...</td></tr>
            ) : (
              courseStudents.map((s) => {
                const avgIa = Math.round(((Number(s.ia1)||0) + (Number(s.ia2)||0) + (Number(s.ia3)||0))/3);
                const internalTotal = avgIa + (Number(s.practical)||0);
                const overallTotal = internalTotal + Math.round((Number(s.finalExam)||0)/2);
                return (
                  <tr key={s.usn}>
                    <td>{s.usn}</td>
                    <td>{s.name}</td>
                    <td>
                      <input type="number" min="0" max="30" className="inp-dk" style={{ width: 60, padding: '0.2rem' }} value={s.ia1 || ''} onChange={(e) => handleMarkChange(s.usn, 'ia1', e.target.value)} />
                    </td>
                    <td>
                      <input type="number" min="0" max="30" className="inp-dk" style={{ width: 60, padding: '0.2rem' }} value={s.ia2 || ''} onChange={(e) => handleMarkChange(s.usn, 'ia2', e.target.value)} />
                    </td>
                    <td>
                      <input type="number" min="0" max="30" className="inp-dk" style={{ width: 60, padding: '0.2rem' }} value={s.ia3 || ''} onChange={(e) => handleMarkChange(s.usn, 'ia3', e.target.value)} />
                    </td>
                    <td>
                      <span className="b bL">{avgIa}/30</span>
                    </td>
                    <td>
                      <input type="number" min="0" max="20" className="inp-dk" style={{ width: 60, padding: '0.2rem' }} value={s.practical || ''} onChange={(e) => handleMarkChange(s.usn, 'practical', e.target.value)} />
                    </td>
                    <td>
                      <span className="b bM">{internalTotal}/50</span>
                    </td>
                    <td>
                      <input type="number" min="0" max="100" className="inp-dk" style={{ width: 60, padding: '0.2rem' }} value={s.finalExam || ''} onChange={(e) => handleMarkChange(s.usn, 'finalExam', e.target.value)} />
                    </td>
                    <td>
                      <span className="b bH">{overallTotal}/100</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
