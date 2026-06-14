import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, Download, X } from 'lucide-react';
import { CH, KPI, Loader } from '../../shared/Primitives';
import { DK as t } from '../../shared/theme';
import { teacherService } from '../../../../services/api';

export default function HodHubTab() {
  const [hodData, setHodData] = useState(null);
  const [hodStudents, setHodStudents] = useState([]);
  const [loadingHod, setLoadingHod] = useState(false);
  const [hodFacultyModal, setHodFacultyModal] = useState(false);
  const [hodFacultyDetails, setHodFacultyDetails] = useState(null);
  const [hodLoadingFaculty, setHodLoadingFaculty] = useState(false);
  const [hodSortConfig, setHodSortConfig] = useState({ key: 'usn', direction: 'asc' });

  useEffect(() => {
    const fetchHod = async () => {
        setLoadingHod(true);
        try {
            const [hub, studs] = await Promise.all([
                teacherService.getDepartmentHub(),
                teacherService.getDepartmentStudents()
            ]);
            setHodData(hub);
            setHodStudents(studs);
        } catch (err) {
            console.error("Failed to fetch HOD data", err);
        } finally {
            setLoadingHod(false);
        }
    };
    fetchHod();
  }, []);

  const handleViewFaculty = async (emp_id) => {
    setHodFacultyModal(true);
    setHodLoadingFaculty(true);
    try {
        const details = await teacherService.getDepartmentFacultyDetails(emp_id);
        setHodFacultyDetails(details);
    } catch (err) {
        console.error("Failed to load faculty details", err);
    } finally {
        setHodLoadingFaculty(false);
    }
  };

  const handleExportCSV = () => {
    if (!hodData || hodStudents.length === 0) return;
    const header = "USN,Name,Semester,SGPA,AI Classification\n";
    const mapRisk = (r) => r === 'High' ? 'Critical Intervention' : r === 'Medium' ? 'Needs Attention' : r === 'Low' ? 'On Track' : r;
    const rows = hodStudents.map(s => `"${s.usn}","${s.name}",${s.semester},${s.cgpa},"${mapRisk(s.risk)}"`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(header + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `Department_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

    if (loadingHod) return <Loader dk />;
    if (!hodData) return <div style={{ color: t.muted }}>No HOD data available.</div>;

    const { analytics, workload } = hodData;
    const sortedWorkload = [...workload].sort((a,b) => b.courses - a.courses);

    const handleHodSort = (key) => {
        let direction = 'asc';
        if (hodSortConfig.key === key && hodSortConfig.direction === 'asc') direction = 'desc';
        setHodSortConfig({ key, direction });
    };

    const riskLevels = { 'High': 3, 'Medium': 2, 'Low': 1 };
    
    const sortedHodStudents = [...hodStudents].sort((a, b) => {
        let aVal = a[hodSortConfig.key];
        let bVal = b[hodSortConfig.key];

        if (hodSortConfig.key === 'risk') {
            aVal = riskLevels[a.risk] || 0;
            bVal = riskLevels[b.risk] || 0;
        } else if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = (bVal || '').toLowerCase();
        }

        if (aVal < bVal) return hodSortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return hodSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    return (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <KPI label="Total Department Students" value={analytics.totalStudents} dk icon={Users} />
          <KPI label="Total Faculty" value={analytics.totalFaculty} dk icon={Users} />
          <KPI label="High Risk Students" value={analytics.riskHigh} dk accent={t.rHigh} icon={AlertTriangle} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {/* Department Students Table */}
          <div className="card-dk" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '.9rem', fontWeight: 600, color: '#fff', margin: 0 }}>Department Students</h3>
                <button className="btn btn-nt" style={{ padding: '.25rem .5rem', fontSize: '.75rem' }} onClick={handleExportCSV}>
                    <Download size={13} style={{ marginRight: 4 }} /> Export CSV
                </button>
            </div>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                <table className="tbl tbl-dk">
                    <thead>
                        <tr>
                            <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleHodSort('usn')}>USN {hodSortConfig.key === 'usn' ? (hodSortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                            <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleHodSort('name')}>Name {hodSortConfig.key === 'name' ? (hodSortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                            <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleHodSort('semester')}>Sem {hodSortConfig.key === 'semester' ? (hodSortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                            <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleHodSort('risk')}>Risk {hodSortConfig.key === 'risk' ? (hodSortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                            <th>Mentor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedHodStudents.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', color: t.muted }}>No students found in department.</td></tr>
                        ) : (
                            sortedHodStudents.map(s => (
                                <tr key={s.usn}>
                                    <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.usn}</td>
                                    <td>{s.name}</td>
                                    <td>{s.semester}</td>
                                    <td>
                                        <span className="b bM" style={{ 
                                            background: s.risk === 'High' ? `${t.rHigh}1a` : s.risk === 'Medium' ? `${t.rMed}1a` : `${t.rLow}1a`,
                                            color: s.risk === 'High' ? t.rHigh : s.risk === 'Medium' ? t.rMed : t.rLow,
                                            borderColor: s.risk === 'High' ? `${t.rHigh}44` : s.risk === 'Medium' ? `${t.rMed}44` : `${t.rLow}44`
                                        }}>{s.risk}</span>
                                    </td>
                                    <td>
                                        <select
                                            className="inp-dk"
                                            style={{ width: 140, padding: '.3rem .5rem', fontSize: '.75rem', cursor: 'pointer' }}
                                            value={s.mentor_emp_id || ""}
                                            onChange={async (e) => {
                                                const empId = e.target.value;
                                                try {
                                                    await teacherService.assignMentor(s.usn, empId);
                                                    alert('Mentor assigned successfully!');
                                                    const studs = await teacherService.getDepartmentStudents();
                                                    setHodStudents(studs);
                                                } catch (err) {
                                                    alert('Failed to assign mentor');
                                                }
                                            }}
                                        >
                                            <option value="" disabled>Unassigned</option>
                                            {hodData.workload.map(f => (
                                                <option key={f.emp_id} value={f.emp_id}>{f.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
          </div>

          {/* Faculty Workload Table */}
          <div className="card-dk" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                <h3 style={{ fontSize: '.9rem', fontWeight: 600, color: '#fff', margin: 0 }}>Faculty Workload Overview</h3>
            </div>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                <table className="tbl tbl-dk">
                    <thead>
                        <tr><th>Name</th><th>Emp ID</th><th>Courses Assigned</th></tr>
                    </thead>
                    <tbody>
                        {sortedWorkload.map(f => (
                            <tr key={f.emp_id} onClick={() => handleViewFaculty(f.emp_id)} style={{ cursor: 'pointer' }} className="hover-row">
                                <td>
                                    {f.name} {f.is_hod && <span style={{ fontSize: '.6rem', background: t.btnTl, padding: '2px 4px', borderRadius: 4, marginLeft: 4 }}>HOD</span>}
                                </td>
                                <td style={{ fontFamily: 'JetBrains Mono, monospace', color: t.muted }}>{f.emp_id}</td>
                                <td style={{ fontWeight: 600 }}>{f.courses}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        </div>
      </div>

      {hodFacultyModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card-dk" style={{ width: '100%', maxWidth: 600, padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            {hodLoadingFaculty || !hodFacultyDetails ? (
              <Loader dk />
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: t.text, margin: 0 }}>{hodFacultyDetails.name}</h3>
                    <div style={{ fontSize: '.78rem', color: t.muted, marginTop: 2 }}>{hodFacultyDetails.designation} • {hodFacultyDetails.emp_id}</div>
                  </div>
                  <button className="btn btn-gh" onClick={() => setHodFacultyModal(false)}><X size={15} /></button>
                </div>

                <div style={{ fontWeight: 600, color: t.text, marginBottom: '.75rem', fontSize: '.9rem' }}>Assigned Courses ({hodFacultyDetails.courses.length})</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                  {hodFacultyDetails.courses.length === 0 ? (
                    <div style={{ color: t.muted, fontSize: '.8rem' }}>No courses assigned to this faculty member.</div>
                  ) : (
                    hodFacultyDetails.courses.map(c => (
                      <div key={c.course_code} style={{ padding: '1rem', borderRadius: 8, border: `1px solid ${t.border}`, background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '.9rem', fontWeight: 600, color: t.text }}>{c.course_name}</div>
                          <div style={{ fontSize: '.75rem', color: t.muted, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>{c.course_code}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '1.25rem', textAlign: 'center' }}>
                          <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: t.text }}>{c.total_students}</div>
                            <div style={{ fontSize: '.65rem', color: t.muted, textTransform: 'uppercase' }}>Students</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: c.avg_attendance < 75 ? t.rHigh : t.teal }}>{c.avg_attendance.toFixed(1)}%</div>
                            <div style={{ fontSize: '.65rem', color: t.muted, textTransform: 'uppercase' }}>Avg Att</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: c.high_risk > 0 ? t.rHigh : t.muted }}>{c.high_risk}</div>
                            <div style={{ fontSize: '.65rem', color: t.muted, textTransform: 'uppercase' }}>High Risk</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
