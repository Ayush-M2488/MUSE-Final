import React from 'react';
import { AlertTriangle, Save, CheckCircle2, XCircle } from 'lucide-react';
import { CH, Pbar } from '../../shared/Primitives';
import { DK as t } from '../../shared/theme';

export default function AttendanceTab({ 
  courses, ci, attDate, setAttDate, calendarMonth, setCalendarMonth, 
  courseStudents, handleSort, sortField, sortAsc, getSortedStudents, 
  handleMarkAttendance, handleMarkBatchAttendance, handleToggleHoliday, holidayScope, setHolidayScope, 
  selectedHolidayCourses, setSelectedHolidayCourses, dashboardData, renderCourseTabs, studentsLoading 
}) {
  
    const isAll = ci === -1;
    const C = courses[ci] || {};
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const isFutureDate = new Date(attDate) > today;

    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDayIndex = firstDay.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    const daysGrid = [];
    for (let i = startDayIndex - 1; i >= 0; i--) {
        const dateObj = new Date(year, month - 1, prevMonthDays - i);
        daysGrid.push({
            day: prevMonthDays - i,
            isCurrentMonth: false,
            dateStr: `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`
        });
    }
    for (let i = 1; i <= totalDays; i++) {
        daysGrid.push({
            day: i,
            isCurrentMonth: true,
            dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
        });
    }
    const remaining = 42 - daysGrid.length;
    for (let i = 1; i <= remaining; i++) {
        const dateObj = new Date(year, month + 1, i);
        daysGrid.push({
            day: i,
            isCurrentMonth: false,
            dateStr: `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`
        });
    }

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const handlePrevMonth = () => {
        setCalendarMonth(new Date(year, month - 1, 1));
    };
    const handleNextMonth = () => {
        setCalendarMonth(new Date(year, month + 1, 1));
    };

    const handleDateClick = (dateStr) => {
        setAttDate(dateStr);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {renderCourseTabs(true)}
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {/* Calendar Selector Card */}
          <div className="card-dk">
            <CH title="Select Date" sub="Click a date to assign/view attendance" dk />
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="btn btn-gh" onClick={handlePrevMonth} style={{ padding: '0.25rem 0.5rem' }}>&larr;</button>
                <span style={{ fontWeight: 600, color: t.text }}>{monthNames[month]} {year}</span>
                <button className="btn btn-gh" onClick={handleNextMonth} style={{ padding: '0.25rem 0.5rem' }}>&rarr;</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.35rem', textAlign: 'center' }}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} style={{ fontSize: '0.75rem', fontWeight: 600, color: t.muted, paddingBottom: '0.2rem' }}>{day}</div>
                ))}
                {daysGrid.map((cell, idx) => {
                  const isSelected = cell.dateStr === attDate;
                  const isToday = cell.dateStr === new Date().toISOString().split('T')[0];
                  
                  const cellDate = new Date(cell.dateStr);
                  const isSunday = cellDate.getDay() === 0;
                  const matchingHolidays = dashboardData?.holidays?.filter(h => h.date === cell.dateStr) || [];
                  const isHoliday = matchingHolidays.length > 0 && (
                    ci === -1 ? true : matchingHolidays.some(h => !h.course_code || h.course_code === C.code)
                  );

                  let holidayTitle = '';
                  if (isHoliday) {
                    const matched = ci === -1
                      ? matchingHolidays
                      : matchingHolidays.filter(h => !h.course_code || h.course_code === C.code);
                    holidayTitle = matched.map(h => {
                      const scope = h.course_code ? `Holiday for Subject: ${h.course_code}` : 'Holiday for All Subjects';
                      const desc = h.description ? ` (${h.description})` : '';
                      return `${scope}${desc}`;
                    }).join(' | ');
                  }

                  // Calculate if this cell is a past weekday
                  const todayDate = new Date();
                  todayDate.setHours(0, 0, 0, 0);
                  const isPastWeekday = cell.isCurrentMonth && 
                                        !isSunday && 
                                        cellDate.getDay() !== 6 && 
                                        !isHoliday &&
                                        cellDate < todayDate;
                  
                  const hasRecord = !isHoliday && dashboardData?.recordedDays?.some(rd => {
                    if (ci !== -1) {
                      return rd === `${C.code}_${cell.dateStr}`;
                    } else {
                      return rd.endsWith(`_${cell.dateStr}`);
                    }
                  });

                  const isIncomplete = !isHoliday && dashboardData?.incompleteDays?.some(id => {
                    if (ci !== -1) {
                      return id === `${C.code}_${cell.dateStr}`;
                    } else {
                      return id.endsWith(`_${cell.dateStr}`);
                    }
                  });

                  const isPending = isPastWeekday && !hasRecord && !isIncomplete;
                  
                  let bgColor = 'rgba(255,255,255,0.02)';
                  let border = '1px solid rgba(255,255,255,0.05)';
                  let textColor = cell.isCurrentMonth ? t.text : t.muted;
                  
                  if (isSelected) {
                    bgColor = `${t.btnTl || '#3b82f6'}22`;
                    border = `1.5px solid ${t.btnTl || '#3b82f6'}`;
                  } else if (isHoliday) {
                    bgColor = 'rgba(167, 139, 250, 0.08)';
                    border = '1px solid rgba(167, 139, 250, 0.35)';
                  } else if (isPending) {
                    bgColor = 'rgba(234,179,8,0.03)';
                    border = '1px solid rgba(234,179,8,0.15)';
                  } else if (isIncomplete) {
                    bgColor = `${t.rMed}12`;
                    border = `1px solid ${t.rMed}bb`;
                  } else if (hasRecord) {
                    bgColor = `${t.rLow}0c`;
                    border = `1px solid ${t.rLow}44`;
                  } else if (isToday) {
                    border = `1px solid rgba(255,255,255,0.2)`;
                  } else if (isSunday && cell.isCurrentMonth) {
                    textColor = 'rgba(255,255,255,0.2)';
                  }
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => handleDateClick(cell.dateStr)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '40px',
                        borderRadius: '6px',
                        background: bgColor,
                        border: border,
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s',
                        transform: isSelected ? 'scale(1.05)' : 'none',
                        boxShadow: isSelected ? `0 0 10px ${t.btnTl || '#3b82f6'}55` : isPending ? '0 0 6px rgba(234,179,8,0.1)' : isHoliday ? '0 0 6px rgba(167, 139, 250, 0.15)' : 'none'
                      }}
                      title={isHoliday ? `${cell.dateStr}: ${holidayTitle}` : isPending ? `${cell.dateStr}: PENDING RECORD` : isIncomplete ? `${cell.dateStr}: INCOMPLETE` : hasRecord ? `${cell.dateStr}: COMPLETED` : isSunday ? `${cell.dateStr}: SUNDAY` : cell.dateStr}
                    >
                      <span style={{ fontSize: '0.8rem', fontWeight: cell.isCurrentMonth ? 600 : 400, color: textColor }}>
                        {cell.day}
                      </span>
                      {isHoliday ? (
                        <span 
                          style={{ 
                            position: 'absolute', 
                            bottom: '3px', 
                            width: '4px', 
                            height: '4px', 
                            borderRadius: '50%', 
                            background: '#a78bfa',
                            boxShadow: '0 0 4px #a78bfa'
                          }} 
                        />
                      ) : hasRecord && !isSelected && (
                        <span 
                          style={{ 
                            position: 'absolute', 
                            bottom: '3px', 
                            width: '4px', 
                            height: '4px', 
                            borderRadius: '50%', 
                            background: t.rLow 
                          }} 
                        />
                      )}
                      {isIncomplete && !isSelected && (
                        <span 
                          style={{ 
                            position: 'absolute', 
                            bottom: '3px', 
                            width: '4px', 
                            height: '4px', 
                            borderRadius: '50%', 
                            background: t.rMed 
                          }} 
                        />
                      )}
                      {isPending && !isSelected && (
                        <span 
                          style={{ 
                            position: 'absolute', 
                            bottom: '3px', 
                            width: '4px', 
                            height: '4px', 
                            borderRadius: '50%', 
                            border: '1px solid rgba(234,179,8,0.4)',
                            background: 'transparent',
                            boxShadow: '0 0 4px rgba(234,179,8,0.2)'
                          }} 
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: t.muted }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <div>Selected: <span style={{ fontWeight: 600, color: t.text }}>{new Date(attDate).toLocaleDateString()}</span></div>
                  {!(new Date(attDate).getDay() === 0) && (() => {
                    const isSelectionHoliday = holidayScope === 'all'
                      ? dashboardData?.holidays?.some(h => h.date === attDate && h.course_code === null)
                      : (selectedHolidayCourses.length > 0 && selectedHolidayCourses.every(code => 
                          dashboardData?.holidays?.some(h => h.date === attDate && h.course_code === code)
                        ));

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: t.muted, textTransform: 'uppercase', marginRight: '0.2rem' }}>Classes:</span>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.65rem', color: t.text }}>
                            <input 
                              type="checkbox"
                              checked={holidayScope === 'all'}
                              onChange={() => {
                                if (holidayScope === 'all') {
                                  setHolidayScope('');
                                } else {
                                  setHolidayScope('all');
                                }
                              }}
                            />
                            All
                          </label>
                          {holidayScope !== 'all' && courses.map(c => (
                            <label key={c.code} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.65rem', color: t.text }}>
                              <input 
                                type="checkbox"
                                checked={selectedHolidayCourses.includes(c.code)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedHolidayCourses(p => [...p, c.code]);
                                  } else {
                                    setSelectedHolidayCourses(p => p.filter(x => x !== c.code));
                                  }
                                }}
                              />
                              {c.code}
                            </label>
                          ))}
                        </div>
                        <button 
                          onClick={handleToggleHoliday}
                          className="btn"
                          style={{
                            padding: '0.25rem 0.6rem',
                            fontSize: '0.68rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            background: isSelectionHoliday ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                            color: isSelectionHoliday ? '#f87171' : '#facc15',
                            border: isSelectionHoliday ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(234, 179, 8, 0.3)',
                            transition: 'all 0.2s',
                            fontWeight: 600
                          }}
                        >
                          {isSelectionHoliday ? 'Remove Holiday' : 'Declare Holiday'}
                        </button>
                      </div>
                    );
                  })()}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', border: '1px solid rgba(234,179,8,0.5)', background: 'transparent', display: 'inline-block', boxShadow: '0 0 4px rgba(234,179,8,0.3)' }} />
                    <span>Pending</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.rMed }} />
                    <span>Incomplete</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.rLow }} />
                    <span>Recorded</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 4px #a78bfa' }} />
                    <span>Holiday</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Student Grid Attendance Manager Card */}
          <div className="card-dk">
            <CH
              title={isAll ? "Attendance · All Classes" : `Attendance · ${C.name || 'Course'}`}
              sub={isAll ? "All Subjects" : C.code || ''}
              right={<input type="date" className="inp-dk" value={attDate} onChange={e => handleDateClick(e.target.value)} style={{ padding: '0.4rem', fontSize: '0.8rem' }} />}
              dk
            />
            {new Date(attDate).getDay() === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', textAlign: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2.5rem' }}>💤</span>
                <h3 style={{ color: t.text, margin: 0, fontWeight: 600 }}>Sundays are Weekly Offs</h3>
                <p style={{ color: t.muted, margin: 0, maxWidth: '280px', fontSize: '0.85rem' }}>
                  Attendance cannot be declared or recorded on Sundays. Please select a weekday.
                </p>
              </div>
            ) : (dashboardData?.holidays?.some(h => {
                if (h.date !== attDate) return false;
                if (ci !== -1) {
                  return !h.course_code || h.course_code === C.code;
                }
                return !h.course_code;
              })) ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', textAlign: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2.5rem' }}>🎉</span>
                <h3 style={{ color: t.text, margin: 0, fontWeight: 600 }}>Declared Holiday</h3>
                <p style={{ color: t.muted, margin: 0, maxWidth: '280px', fontSize: '0.85rem' }}>
                  This day has been declared as a Holiday. Attendance recording is disabled.
                </p>
              </div>
            ) : isFutureDate ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', textAlign: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2.5rem' }}>📅</span>
                <h3 style={{ color: t.text, margin: 0, fontWeight: 600 }}>Future Date Selected</h3>
                <p style={{ color: t.muted, margin: 0, maxWidth: '280px', fontSize: '0.85rem' }}>
                  Attendance cannot be recorded for future dates. You can, however, declare or remove holidays for this date using the controls on the left.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '0 1.25rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                  <button 
                    className="btn btn-gh" 
                    onClick={() => handleMarkBatchAttendance('present')}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.3rem', 
                      color: t.rLow, padding: '0.4rem 0.6rem', fontSize: '0.75rem' 
                    }}
                  >
                    <CheckCircle2 size={14} /> Mark All Present
                  </button>
                  <button 
                    className="btn btn-gh" 
                    onClick={() => handleMarkBatchAttendance('absent')}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.3rem', 
                      color: t.rHigh, padding: '0.4rem 0.6rem', fontSize: '0.75rem' 
                    }}
                  >
                    <XCircle size={14} /> Mark All Absent
                  </button>
                </div>
                <table className="tbl tbl-dk">
                  <thead>
                    <tr>
                      <th style={{ cursor: 'pointer' }} onClick={() => handleSort('usn')}>USN</th>
                      <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>Student</th>
                      {isAll && <th style={{ cursor: 'pointer' }} onClick={() => handleSort('course_code')}>Subject</th>}
                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('att')}>Cumulative</th>
                    <th>Today</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsLoading ? <tr><td colSpan={isAll ? "5" : "4"}>Loading students...</td></tr> :
                    getSortedStudents(courseStudents).map((s) => (
                      <tr key={`${s.usn}-${s.course_code}`}>
                        <td>{s.usn}</td>
                        <td>{s.name}</td>
                        {isAll && <td><span className="b bL">{s.course_code} ({s.section})</span></td>}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                            <Pbar val={s.att} dk />
                            <span style={{ fontSize: '.75rem', color: s.att < 75 ? t.rHigh : t.muted }}>{s.att}%</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '.38rem' }}>
                            <button
                              className="btn btn-gh"
                              onClick={() => handleMarkAttendance(s.usn, 'present', s.course_code)}
                              style={{ color: s.todayAtt === 'present' ? t.rLow : undefined, background: s.todayAtt === 'present' ? `${t.rLow}22` : undefined }}
                            >P</button>
                            <button
                              className="btn btn-gh"
                              onClick={() => handleMarkAttendance(s.usn, 'absent', s.course_code)}
                              style={{ color: s.todayAtt === 'absent' ? t.rHigh : undefined, background: s.todayAtt === 'absent' ? `${t.rHigh}22` : undefined }}
                            >A</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Declared Holidays Card */}
        <div className="card-dk">
          <CH title="Declared Holidays" sub="List of all holidays applicable to your courses" dk />
          <div style={{ padding: '1.25rem' }}>
            {dashboardData?.holidays?.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="tbl tbl-dk">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Scope</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.holidays.sort((a,b) => new Date(b.date) - new Date(a.date)).map((h, i) => (
                      <tr key={i}>
                        <td style={{ whiteSpace: 'nowrap' }}>{new Date(h.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        <td>{h.course_code ? <span className="b bL">{h.course_code}</span> : <span className="b" style={{ background: 'rgba(167, 139, 250, 0.15)', color: '#a78bfa', border: '1px solid rgba(167, 139, 250, 0.3)' }}>All Subjects</span>}</td>
                        <td style={{ color: t.muted }}>{h.description || 'No description provided'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: t.muted, padding: '2rem' }}>No holidays declared yet.</div>
            )}
          </div>
        </div>
      </div>
    );
  
}
