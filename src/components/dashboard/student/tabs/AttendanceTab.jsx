import React from 'react';
import { DK as t } from '../../shared/theme';
import { CH, Pbar } from '../../shared/Primitives';

export default function AttendanceTab({
    d,
    C,
    calendarMonth,
    setCalendarMonth,
    selectedCalCourse,
    setSelectedCalCourse
}) {
    const filteredHistory = (d.attendanceHistory || []).filter(h => 
        selectedCalCourse === 'All' ? true : h.course_code === selectedCalCourse
    );
    
    const historyMap = {};
    filteredHistory.forEach(h => {
        if (!historyMap[h.date]) {
            historyMap[h.date] = h.status;
        } else if (h.status === 'absent') {
            historyMap[h.date] = 'absent';
        }
    });

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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
            <C>
                <CH title="Subject-wise Attendance" sub="Minimum required 75%" right={<span className="b bM">Overall {d.attendance}%</span>} dk />
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {d.subjects.map((s) => (
                        <div key={s.code}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.28rem' }}>
                                <div>
                                    <span style={{ fontSize: '.82rem', fontWeight: 500, color: t.text }}>{s.name}</span>
                                    <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '.58rem', color: t.muted, marginLeft: '.4rem' }}>{s.code}</span>
                                </div>
                                {s.att < 75 && <span className="b bH">Below threshold</span>}
                            </div>
                            <Pbar val={s.att} dk />
                        </div>
                    ))}
                </div>
            </C>

            <C>
                <CH 
                    title="Attendance Calendar" 
                    sub="Monthly visualization" 
                    right={
                        <select 
                            className="inp-dk" 
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                            value={selectedCalCourse}
                            onChange={e => setSelectedCalCourse(e.target.value)}
                        >
                            <option value="All">All Subjects</option>
                            {d.subjects.map(s => (
                                <option key={s.code} value={s.code}>{s.code}</option>
                            ))}
                        </select>
                    } 
                    dk 
                />
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
                            const status = historyMap[cell.dateStr];
                            const isToday = cell.dateStr === new Date().toISOString().split('T')[0];
                            
                            const cellDate = new Date(cell.dateStr);
                            const isSunday = cellDate.getDay() === 0;
                            const matchingHolidays = (d.holidays || []).filter(h => h.date === cell.dateStr);
                            const isHoliday = matchingHolidays.length > 0 && (
                                selectedCalCourse === 'All' ? true : matchingHolidays.some(h => !h.course_code || h.course_code === selectedCalCourse)
                            );

                            let holidayTitle = '';
                            if (isHoliday) {
                                const matched = selectedCalCourse === 'All'
                                    ? matchingHolidays
                                    : matchingHolidays.filter(h => !h.course_code || h.course_code === selectedCalCourse);
                                holidayTitle = matched.map(h => {
                                    const scope = h.course_code ? `Holiday for Subject: ${h.course_code}` : 'Holiday for All Subjects';
                                    const desc = h.description ? ` (${h.description})` : '';
                                    return `${scope}${desc}`;
                                }).join(' | ');
                            }

                            // Check if this cell is a weekday in the past that does NOT have recorded attendance
                            const todayDate = new Date();
                            todayDate.setHours(0, 0, 0, 0);
                            const isPastWeekday = cell.isCurrentMonth && 
                                                  !isSunday && 
                                                  cellDate.getDay() !== 6 && 
                                                  !isHoliday &&
                                                  cellDate < todayDate;
                            
                            let bgColor = 'rgba(255,255,255,0.02)';
                            let border = '1px solid rgba(255,255,255,0.05)';
                            let textColor = cell.isCurrentMonth ? t.text : t.muted;
                            
                            if (isHoliday) {
                                bgColor = 'rgba(167, 139, 250, 0.08)';
                                border = '1px solid rgba(167, 139, 250, 0.35)';
                            } else if (status === 'present') {
                                bgColor = `${t.rLow}22`;
                                border = `1px solid ${t.rLow}`;
                            } else if (status === 'absent') {
                                bgColor = `${t.rHigh}22`;
                                border = `1px solid ${t.rHigh}`;
                            } else if (status === 'excused') {
                                bgColor = `${t.rMed}22`;
                                border = `1px solid ${t.rMed}`;
                            } else if (isPastWeekday) {
                                bgColor = 'rgba(234,179,8,0.03)';
                                border = '1px solid rgba(234,179,8,0.15)';
                            } else if (isSunday && cell.isCurrentMonth) {
                                textColor = 'rgba(255,255,255,0.2)';
                            }
                            
                            const hasPastGlow = !status && isPastWeekday;
                            
                            if (isToday) {
                                border = `1.5px solid ${t.btnTl || '#3b82f6'}`;
                            }
                            
                            return (
                                <div
                                    key={idx}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '40px',
                                        borderRadius: '6px',
                                        background: bgColor,
                                        border: border,
                                        position: 'relative',
                                        cursor: 'default',
                                        transition: 'all 0.2s',
                                        transform: isToday ? 'scale(1.05)' : 'none',
                                        boxShadow: isToday ? '0 0 10px rgba(59,130,246,0.3)' : hasPastGlow ? '0 0 6px rgba(234,179,8,0.1)' : isHoliday ? '0 0 6px rgba(167, 139, 250, 0.15)' : 'none'
                                    }}
                                    title={isHoliday ? `${cell.dateStr}: ${holidayTitle}` : status ? `${cell.dateStr}: ${status.toUpperCase()}` : isPastWeekday ? `${cell.dateStr}: UNASSIGNED` : isSunday ? `${cell.dateStr}: SUNDAY` : cell.dateStr}
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
                                    ) : status ? (
                                        <span 
                                            style={{ 
                                                position: 'absolute', 
                                                bottom: '3px', 
                                                width: '4px', 
                                                height: '4px', 
                                                borderRadius: '50%', 
                                                background: status === 'present' ? t.rLow : status === 'absent' ? t.rHigh : t.rMed 
                                            }} 
                                        />
                                    ) : isPastWeekday ? (
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
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.rLow }} />
                            <span style={{ color: t.muted }}>Present</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.rHigh }} />
                            <span style={{ color: t.muted }}>Absent</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', border: '1px solid rgba(234,179,8,0.5)', background: 'transparent', display: 'inline-block', boxShadow: '0 0 4px rgba(234,179,8,0.3)' }} />
                            <span style={{ color: t.muted }}>Unassigned / Pending</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 4px #a78bfa' }} />
                            <span style={{ color: t.muted }}>Holiday</span>
                        </div>
                    </div>
                </div>
            </C>
        </div>

        <C>
          <CH title="Declared Holidays" sub="List of all holidays applicable to your courses" dk />
          <div style={{ padding: '1.25rem' }}>
            {d.holidays?.length > 0 ? (
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
                    {d.holidays.sort((a,b) => new Date(b.date) - new Date(a.date)).map((h, i) => (
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
        </C>
        </div>
    );
}
