import React from 'react';
import { CH, Loader } from '../../shared/Primitives';
import { FileText, Download } from 'lucide-react';
import { LT } from '../../shared/theme';

const Card = ({ children, style }) => (
    <div className="card-lt" style={style}>
        {children}
    </div>
);

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportsTab({ 
    t, cfg, setPage, 
    reportConfig, setReportConfig, handleGenerateReport, loadingReport,
    rt, setRt, selectedReportId, setSelectedReportId, reportData,
    filterReportDept, setFilterReportDept, filterReportSem, setFilterReportSem, filterReportSubject, setFilterReportSubject
}) {
    
        const activeReportObj = {
            attendance: [
                { id: 'attendance_monthly', title: 'Monthly attendance · All departments' },
                { id: 'attendance_shortage', title: 'Subject-wise att. < 75' },
                { id: 'attendance_critical', title: 'Critical absentee list' }
            ],
            marks: [
                { id: 'marks_consolidated', title: 'IA-1 / IA-2 / IA-3 consolidated report' },
                { id: 'marks_toppers', title: 'Toppers list by branch' },
                { id: 'marks_below_average', title: 'Below-average performance report' }
            ],
            risk: [
                { id: 'risk_high', title: 'High-risk list with factors' },
                { id: 'risk_interventions', title: 'Intervention log · Current semester' },
                { id: 'risk_feedback', title: 'Teacher AI feedback log' }
            ],
            compliance: [
                { id: 'compliance_naac', title: 'NAAC continuous assessment' },
                { id: 'compliance_nep', title: 'NEP 2020 outcome report' },
                { id: 'compliance_audit', title: 'Internal audit checklist' }
            ],
        }[rt].find(r => r.id === selectedReportId) || { id: selectedReportId, title: 'Report' };

        // Determine unique departments and semesters present in the reportData for filtering
        const departments = ['All', ...new Set((reportData?.records || [])
            .map(r => r.dept || r.department)
            .filter(Boolean))];

        const semesters = ['All', ...new Set((reportData?.records || [])
            .map(r => r.sem || r.semester?.toString())
            .filter(Boolean))];

        const hasSubjectField = reportData?.records && (reportData.records[0]?.course !== undefined || reportData.records[0]?.course_code !== undefined);

        const subjects = ['All', ...new Set((reportData?.records || [])
            .map(r => r.course || r.course_code)
            .filter(Boolean))];

        const getCellAlignmentStyle = (colId) => {
            const centerAligned = ['sem', 'semester', 'ia1', 'ia2', 'ia3', 'practicals', 'finals', 'score', 'max_score', 'rate', 'present', 'total', 'cgpa', 'credits', 'rank'];
            const noWrapAligned = ['usn', 'course_code', 'course', 'sem', 'semester', 'ia1', 'ia2', 'ia3', 'practicals', 'finals', 'score', 'max_score', 'rate', 'present', 'total', 'cgpa', 'credits', 'rank', 'date'];
            
            return {
                textAlign: centerAligned.includes(colId) ? 'center' : 'left',
                whiteSpace: noWrapAligned.includes(colId) ? 'nowrap' : 'normal'
            };
        };

        // Apply filters
        const filteredRecords = (reportData?.records || []).filter(rec => {
            const rDept = rec.dept || rec.department;
            const rSem = rec.sem || rec.semester;
            const rSubj = rec.course || rec.course_code;

            const matchesDept = filterReportDept === 'All' || rDept === filterReportDept;
            const matchesSem = filterReportSem === 'All' || String(rSem) === String(filterReportSem);
            const matchesSubj = !hasSubjectField || filterReportSubject === 'All' || rSubj === filterReportSubject;

            return matchesDept && matchesSem && matchesSubj;
        });

        const handleDownloadPdfFiltered = () => {
            if (!reportData || !reportData.success) {
                alert('No report data loaded');
                return;
            }
            try {
                const { header } = reportData;
                const doc = new jsPDF();

                // Title & Branding (Premium Layout)
                doc.setFontSize(18);
                doc.setTextColor(24, 28, 36); // #181C24
                doc.text("UNIVERSITY OF MYSORE", 14, 20);

                doc.setFontSize(11);
                doc.setTextColor(112, 120, 132); // #707884
                doc.text("Academic early warning, compliance & student monitoring system", 14, 26);
                doc.text(`Report: ${activeReportObj.title}`, 14, 32);
                doc.text(`Filters - Dept: ${filterReportDept} | Sem: ${filterReportSem}${hasSubjectField ? ` | Subject: ${filterReportSubject}` : ''}`, 14, 38);
                doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 44);

                // Decorative Line
                doc.setLineWidth(0.5);
                doc.setDrawColor(220, 224, 230);
                doc.line(14, 48, 196, 48);

                // autoTable formatting
                const columns = header.map(h => h.title);
                const body = filteredRecords.map(rec => header.map(h => rec[h.id] ?? 'N/A'));

                autoTable(doc, {
                    startY: 54,
                    head: [columns],
                    body: body,
                    theme: 'striped',
                    headStyles: { fillColor: [43, 90, 222] }, // Match premium brand color
                    styles: { fontSize: 8.5, cellPadding: 2.5 },
                    alternateRowStyles: { fillColor: [248, 249, 250] },
                    margin: { horizontal: 14 }
                });

                doc.save(`muse_${selectedReportId}_report_filtered.pdf`);
            } catch (err) {
                console.error(err);
                alert('Failed to generate PDF report');
            }
        };

        return (
            <Card>
                <CH title="Reports / Exports" sub="NAAC / NEP-friendly · Filter and Preview students before PDF download" />
                <div style={{ padding: '0 1.25rem', borderBottom: `1px solid ${t.sep}` }}>
                    <div className="tabs">
                        {['attendance', 'marks', 'risk', 'compliance'].map((tab) => (
                            <div key={tab} className={`tab tab-lt ${rt === tab ? 'on' : ''}`} onClick={() => setRt(tab)}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', padding: '1.25rem' }}>
                    {/* Left Sidebar: Select Report */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', borderRight: `1px solid ${t.sep}`, paddingRight: '1rem' }}>
                        <span style={{ fontSize: '.75rem', fontWeight: 600, color: t.muted, textTransform: 'uppercase', letterSpacing: '.05em' }}>Available Reports</span>
                        {{
                            attendance: [
                                { id: 'attendance_monthly', title: 'Monthly attendance · All departments' },
                                { id: 'attendance_shortage', title: 'Subject-wise att. < 75' },
                                { id: 'attendance_critical', title: 'Critical absentee list' }
                            ],
                            marks: [
                                { id: 'marks_consolidated', title: 'IA-1 / IA-2 / IA-3 consolidated report' },
                                { id: 'marks_toppers', title: 'Toppers list by branch' },
                                { id: 'marks_below_average', title: 'Below-average performance report' }
                            ],
                            risk: [
                                { id: 'risk_high', title: 'High-risk list with factors' },
                                { id: 'risk_interventions', title: 'Intervention log · Current semester' },
                                { id: 'risk_feedback', title: 'Teacher AI feedback log' }
                            ],
                            compliance: [
                                { id: 'compliance_naac', title: 'NAAC continuous assessment' },
                                { id: 'compliance_nep', title: 'NEP 2020 outcome report' },
                                { id: 'compliance_audit', title: 'Internal audit checklist' }
                            ],
                        }[rt].map((rep) => (
                            <div
                                key={rep.id}
                                onClick={() => setSelectedReportId(rep.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '.48rem',
                                    padding: '.68rem .875rem',
                                    borderRadius: 6,
                                    border: `1px solid ${selectedReportId === rep.id ? t.brand : t.border}`,
                                    background: selectedReportId === rep.id ? `${t.brand}10` : t.bg,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <FileText size={13} style={{ color: selectedReportId === rep.id ? t.brand : t.muted, flexShrink: 0 }} />
                                <span style={{ fontSize: '.78rem', color: selectedReportId === rep.id ? t.brand : t.text, fontWeight: selectedReportId === rep.id ? 500 : 400 }}>{rep.title}</span>
                            </div>
                        ))}
                    </div>

                    {/* Right Panel: Filters, Live Display & Action */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', background: t.cardAlt, padding: '1rem', borderRadius: 8, border: `1px solid ${t.border}` }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                {/* Department Filter */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
                                    <span style={{ fontSize: '.7rem', color: t.muted, fontWeight: 500 }}>Department</span>
                                    <select
                                        className="sel sel-lt"
                                        style={{ fontSize: '.78rem', padding: '.35rem .5rem', borderRadius: 6, width: 170 }}
                                        value={filterReportDept}
                                        onChange={(e) => setFilterReportDept(e.target.value)}
                                    >
                                        {departments.map(d => (
                                            <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Semester Filter */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
                                    <span style={{ fontSize: '.7rem', color: t.muted, fontWeight: 500 }}>Semester</span>
                                    <select
                                        className="sel sel-lt"
                                        style={{ fontSize: '.78rem', padding: '.35rem .5rem', borderRadius: 6, width: 120 }}
                                        value={filterReportSem}
                                        onChange={(e) => setFilterReportSem(e.target.value)}
                                    >
                                        {semesters.map(s => (
                                            <option key={s} value={s}>{s === 'All' ? 'All Semesters' : `Semester ${s}`}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Subject Filter */}
                                {hasSubjectField && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
                                        <span style={{ fontSize: '.7rem', color: t.muted, fontWeight: 500 }}>Subject / Course</span>
                                        <select
                                            className="sel sel-lt"
                                            style={{ fontSize: '.78rem', padding: '.35rem .5rem', borderRadius: 6, width: 180 }}
                                            value={filterReportSubject}
                                            onChange={(e) => setFilterReportSubject(e.target.value)}
                                        >
                                            {subjects.map(s => (
                                                <option key={s} value={s}>{s === 'All' ? 'All Subjects' : s}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <button
                                className="btn btn-np"
                                style={{ padding: '.5rem 1rem', fontSize: '.78rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}
                                disabled={!reportData || filteredRecords.length === 0}
                                onClick={handleDownloadPdfFiltered}
                            >
                                <Download size={13} /> Export PDF ({filteredRecords.length})
                            </button>
                        </div>

                        {/* Live Table Preview */}
                        <div style={{ border: `1px solid ${t.border}`, borderRadius: 8, background: t.card, overflow: 'hidden' }}>
                            <div style={{ padding: '.8rem 1rem', borderBottom: `1px solid ${t.sep}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: t.cardAlt }}>
                                <span style={{ fontSize: '.8rem', fontWeight: 600, color: t.text }}>Preview: {activeReportObj.title}</span>
                                <span style={{ fontSize: '.75rem', color: t.muted }}>Showing {filteredRecords.length} records</span>
                            </div>

                            {loadingReport ? (
                                <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}>
                                    <Loader />
                                </div>
                            ) : !reportData || filteredRecords.length === 0 ? (
                                <div style={{ padding: '3rem', textAlign: 'center', color: t.muted, fontSize: '.82rem' }}>
                                    No records found matching the active filters.
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto', maxHeight: '420px' }}>
                                    <table className="tbl tbl-lt" style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                {reportData.header.map(h => (
                                                    <th key={h.id} style={{ textAlign: getCellAlignmentStyle(h.id).textAlign }}>{h.title}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredRecords.map((rec, idx) => (
                                                <tr key={idx}>
                                                    {reportData.header.map(h => (
                                                        <td key={h.id} style={{ textAlign: getCellAlignmentStyle(h.id).textAlign, whiteSpace: getCellAlignmentStyle(h.id).whiteSpace }}>
                                                            {rec[h.id] !== undefined ? String(rec[h.id]) : 'N/A'}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        );
    
}
