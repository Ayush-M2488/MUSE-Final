import React, { useState, useEffect } from 'react';
import {
    BarChart2,
    Check,
    Cpu,
    Edit2,
    FileText,
    Plus,
    Save,
    Trash2,
    UserPlus,
    Users,
    X,
    AlertTriangle,
    XCircle,
    CheckCircle,
    Download,
    Upload,
    Activity,
    Search
} from 'lucide-react';
import { CH, KPI, Loader, CT } from '../shared/Primitives';
import EditUserTab from './EditUserTab';
import ViewUserTab from './ViewUserTab';
import { LT } from '../shared/theme';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { interventionService, adminService, adminExtendedService } from '../../../services/api';
import UserManagementTab from './UserManagementTab';
import AdminAnalyticsTab from './AdminAnalyticsTab';
import SystemSettingsTab from './SystemSettingsTab'; // NEW: Imported adminService
import AcademicDataTab from './tabs/AcademicDataTab';
import ReportsTab from './tabs/ReportsTab';
import CoursesTab from './tabs/CoursesTab';
import FeesTab from './tabs/FeesTab';
import GrievancesTab from './tabs/GrievancesTab';
import LogsTab from './tabs/LogsTab';
import RiskTab from './tabs/RiskTab';

const Card = ({ children, style }) => (
    <div className="card-lt" style={style}>
        {children}
    </div>
);

export default function AdminDashboard({ page, setPage }) {
    const [rt, setRt] = useState('attendance');
    const [modal, setModal] = useState(false);
    const [bulkModal, setBulkModal] = useState(false);
    const [csvRows, setCsvRows] = useState([]);
    const [bulkImporting, setBulkImporting] = useState(false);
    const [bulkFeedback, setBulkFeedback] = useState(null);
    const [cfg, setCfg] = useState({});
    const [configTab, setConfigTab] = useState('academic'); // 'academic', 'ai', 'smtp', 'sso', 'system'
    const [cfgSaved, setCfgSaved] = useState(false);
    const [users, setUsers] = useState([]);
    const [editUserObj, setEditUserObj] = useState(null);
    const [viewUserObj, setViewUserObj] = useState(null);
    const [nu, setNu] = useState({
        name: '',
        email: '',
        role: 'Student',
        dept: 'AI & ML',
        status: 'active',
        semester: '1',
        subjects: [],
        identifier: '',
        phone: '',
    });
    const [allCourses, setAllCourses] = useState([]);
    const [userFilters, setUserFilters] = useState({ role: 'All', dept: 'All', sem: 'All', subject: '' });
    const [courseFilters, setCourseFilters] = useState({ dept: 'All', sem: 'All', search: '' });
    // --- COMBINED DATA STATE ---
    const [auditLogs, setAuditLogs] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [dataLoading, setDataLoading] = useState(true);

    const [backupList, setBackupList] = useState([
        { name: 'backup_daily_2026-06-03.sql', size: '18.4 MB', type: 'Scheduled', date: '2026-06-03 02:00 AM', status: 'Completed' },
        { name: 'backup_manual_2026-06-02.sql', size: '18.2 MB', type: 'Manual', date: '2026-06-02 04:12 PM', status: 'Completed' },
        { name: 'backup_daily_2026-06-01.sql', size: '18.1 MB', type: 'Scheduled', date: '2026-06-01 02:00 AM', status: 'Completed' }
    ]);
    const [backingUp, setBackingUp] = useState(false);

    const [hodModal, setHodModal] = useState(null); // { dept: 'AI & ML', teachers: [] }

    // Grievance Portal States
    const [grievancesList, setGrievancesList] = useState([]);
    const [loadingGrievances, setLoadingGrievances] = useState(false);
    const [selectedGrievance, setSelectedGrievance] = useState(null);
    const [responseText, setResponseText] = useState('');
    const [submittingResponse, setSubmittingResponse] = useState(false);

    // Fee Management States
    const [feeSortKey, setFeeSortKey] = useState('usn');
    const [feeSortOrder, setFeeSortOrder] = useState('asc');
    const [feeDeptFilter, setFeeDeptFilter] = useState('All');
    const [feeSemFilter, setFeeSemFilter] = useState('All');
    const [feeSearchQuery, setFeeSearchQuery] = useState('');

    const handleAssignHod = async (dept, emp_id) => {
        try {
            const res = await adminExtendedService.assignHod(dept, emp_id);
            if (res.success) {
                setHodModal(null);
                const freshUsers = await adminService.getUsers(1, 1000);
                setUsers(freshUsers.users || freshUsers || []);
            }
        } catch (error) {
            console.error('Failed to assign HOD:', error);
            alert('Failed to assign HOD. See console.');
        }
    };

    const handleTriggerBackup = async () => {
        setBackingUp(true);
        try {
            const res = await adminService.triggerBackup();
            if (res.success && res.backup) {
                setBackupList((prev) => [res.backup, ...prev]);
                alert('Instant database backup archive compiled and saved successfully!');
            }
        } catch (error) {
            console.error('Backup trigger error:', error);
            alert('Failed to trigger database backup compilation.');
        } finally {
            setBackingUp(false);
        }
    };

    const handleDeleteBackup = async (filename) => {
        if (!window.confirm(`Are you sure you want to permanently delete the backup archive: ${filename}?`)) {
            return;
        }
        try {
            const res = await adminService.deleteBackup(filename);
            if (res.success) {
                setBackupList((prev) => prev.filter((b) => b.name !== filename));
                alert('Backup archive deleted successfully!');
            }
        } catch (error) {
            console.error('Delete backup error:', error);
            alert('Failed to delete the selected backup archive.');
        }
    };

    const handleDownloadBackup = async (filename) => {
        try {
            const blob = await adminService.downloadBackup(filename);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Download backup error:', error);
            alert('Failed to download the selected backup archive.');
        }
    };

    useEffect(() => {
        if (page === 'system') {
            const fetchBackups = async () => {
                try {
                    const data = await adminService.getBackups();
                    setBackupList(data || []);
                } catch (error) {
                    console.error('Failed to load backup archives:', error);
                }
            };
            fetchBackups();
        }
    }, [page]);

    // Fetch admin grievances
    useEffect(() => {
        if (page === 'grievances') {
            const fetchGrievances = async () => {
                setLoadingGrievances(true);
                try {
                    const list = await adminService.getGrievances();
                    setGrievancesList(list);
                } catch (error) {
                    console.error('Failed to load admin grievances:', error);
                } finally {
                    setLoadingGrievances(false);
                }
            };
            fetchGrievances();
        }
    }, [page]);

    const handleCsvFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setBulkFeedback(null);
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
            if (lines.length <= 1) return alert("Empty or invalid CSV file.");
            
            const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase().replace(/[^a-z0-9]/g, ''));
            const parsed = [];
            
            for (let i = 1; i < lines.length; i++) {
                const row = lines[i];
                let values = [];
                let insideQuote = false;
                let currentVal = '';
                
                for (let c = 0; c < row.length; c++) {
                    const char = row[c];
                    if (char === '"') {
                        insideQuote = !insideQuote;
                    } else if (char === ',' && !insideQuote) {
                        values.push(currentVal.trim().replace(/^["']|["']$/g, ''));
                        currentVal = '';
                    } else {
                        currentVal += char;
                    }
                }
                values.push(currentVal.trim().replace(/^["']|["']$/g, ''));
                
                if (values.length < headers.length) continue;
                
                const rowObj = {};
                headers.forEach((h, idx) => {
                    rowObj[h] = values[idx] || '';
                });
                parsed.push(rowObj);
            }
            
            const normalized = parsed.map(p => ({
                name: p.name || p.fullname || '',
                email: p.email || '',
                role: p.role || 'Student',
                dept: p.department || p.dept || 'AI & ML',
                semester: p.semester || p.sem || '1',
                usn: p.usn || p.usnoremployeeid || '',
                emp_id: p.empid || p.employeeid || p.usnoremployeeid || '',
                designation: p.designation || 'Faculty',
                subjects: p.subjectsorcourses || p.subjects || p.courses || '',
                phone: p.phone || p.phonenumber || ''
            }));
            
            setCsvRows(normalized);
        };
        reader.readAsText(file);
    };

    const downloadTemplate = () => {
        const headers = "Name,Email,Role,Department,Semester,USN_or_EmployeeID,Phone,Subjects_or_Courses\n";
        const sampleRows = "John Doe,john.doe@muse.ac.in,Student,AI & ML,5,21AM045,+919876543210,\nJane Smith,jane.smith@muse.ac.in,Faculty,Biomedical,5,FAC-082,+919876543211,\"BM501,BM502,BM503\"\n";
        const blob = new Blob([headers + sampleRows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'muse_bulk_user_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const submitBulkUsers = async () => {
        if (csvRows.length === 0) return;
        setBulkImporting(true);
        setBulkFeedback(null);
        try {
            const res = await adminService.createUsersBulk(csvRows);
            setBulkFeedback({
                success: true,
                message: `Imported: ${res.imported}, Skipped: ${res.skipped}`,
                errors: res.errors || []
            });
            const freshUsers = await adminService.getUsers(1, 1000);
            setUsers(freshUsers.users || freshUsers || []);
            setCsvRows([]);
        } catch (err) {
            setBulkFeedback({
                success: false,
                message: 'Failed to process bulk import.'
            });
        } finally {
            setBulkImporting(false);
        }
    };
    
    // Academic Management
    const [fees, setFees] = useState([]);

    const [timetables, setTimetables] = useState([]);
    
    // Risk Management States
    const [riskRoster, setRiskRoster] = useState([]);
    const [riskLoading, setRiskLoading] = useState(false);

    // Reports Specific States
    const [selectedReportId, setSelectedReportId] = useState('attendance_monthly');
    const [reportData, setReportData] = useState(null);
    const [loadingReport, setLoadingReport] = useState(false);
    const [filterReportDept, setFilterReportDept] = useState('All');
    const [filterReportSem, setFilterReportSem] = useState('All');
    const [filterReportSubject, setFilterReportSubject] = useState('All');

    useEffect(() => {
        if (page !== 'reports') return;
        const fetchReportData = async () => {
            setLoadingReport(true);
            try {
                const data = await adminExtendedService.getReportData(selectedReportId);
                setReportData(data);
                setFilterReportSubject('All');
            } catch (err) {
                console.error(err);
                setReportData(null);
            } finally {
                setLoadingReport(false);
            }
        };
        fetchReportData();
    }, [selectedReportId, page]);

    useEffect(() => {
        const reportTabsMapping = {
            attendance: 'attendance_monthly',
            marks: 'marks_consolidated',
            risk: 'risk_high',
            compliance: 'compliance_naac'
        };
        if (reportTabsMapping[rt]) {
            setSelectedReportId(reportTabsMapping[rt]);
        }
    }, [rt]);

    const t = LT;

    // --- FETCH BOTH LOGS AND ANALYTICS AND USERS AND CONFIG ---
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // Fetch in parallel for speed
                const [logsReq, statsReq, usersReq, cfgReq, feesReq, ttReq, coursesReq] = await Promise.allSettled([
                    interventionService.getAdminAuditLogs(),
                    adminService.getAnalytics(),
                    adminService.getUsers(1, 1000),
                    adminService.getConfig(),
                    adminExtendedService.getFees(),
                    adminExtendedService.getTimetables(),
                    adminService.getCourses(1, 1000)
                ]);

                if (logsReq.status === 'fulfilled') setAuditLogs(logsReq.value);
                if (statsReq.status === 'fulfilled' && statsReq.value.success) {
                    setAnalytics(statsReq.value.data);
                }
                if (usersReq.status === 'fulfilled') setUsers(usersReq.value.users || usersReq.value || []);
                if (cfgReq.status === 'fulfilled') setCfg(cfgReq.value);
                if (feesReq.status === 'fulfilled') setFees(feesReq.value || []);
                if (ttReq.status === 'fulfilled') setTimetables(ttReq.value || []);
                if (coursesReq.status === 'fulfilled') setAllCourses(coursesReq.value.courses || coursesReq.value || []);

            } catch (err) {
                console.error("Dashboard data load error:", err);
            } finally {
                setDataLoading(false);
            }
        };
        fetchAllData();
    }, []);

    // Fetch Risk Roster Lazy-loading
    useEffect(() => {
        if (page === 'risk') {
            const fetchRiskRoster = async () => {
                setRiskLoading(true);
                try {
                    const res = await adminService.getRiskRoster();
                    if (res.success) {
                        setRiskRoster(res.roster || []);
                    }
                } catch (error) {
                    console.error('Error fetching risk roster:', error);
                } finally {
                    setRiskLoading(false);
                }
            };
            fetchRiskRoster();
        }
    }, [page]);


    const handleUpdateInterventionStatus = async (interventionId, newStatus) => {
        try {
            const res = await interventionService.updateInterventionStatus(interventionId, newStatus);
            if (res.success) {
                setRiskRoster(prev => prev.map(student => {
                    const hasIntervention = student.interventions.some(i => i.id === interventionId);
                    if (hasIntervention) {
                        return {
                            ...student,
                            interventions: student.interventions.map(i => i.id === interventionId ? { ...i, status: newStatus } : i)
                        };
                    }
                    return student;
                }));
            }
        } catch (error) {
            console.error('Error updating intervention status:', error);
            alert('Failed to update intervention status');
        }
    };


    const addUser = async () => {
        if (!nu.name.trim() || !nu.email.trim() || (['Student', 'Faculty'].includes(nu.role) && !nu.identifier?.trim())) {
            alert('Please fill in all required fields (Name, Email, and USN/EmpID)');
            return;
        }

        if (nu.role === 'Student' && !/^[A-Z0-9]{5,15}$/i.test(nu.identifier.trim())) {
            alert('Invalid USN format. Please enter a valid 5-15 character alphanumeric USN.');
            return;
        }

        if (nu.role === 'Faculty' && !/^[A-Z0-9-]{3,15}$/i.test(nu.identifier.trim())) {
            alert('Invalid Employee ID format. Please enter a valid Employee ID.');
            return;
        }

        try {
            await adminService.createUser(nu);
            const freshUsers = await adminService.getUsers(1, 1000);
            setUsers(freshUsers.users || freshUsers || []);
            setModal(false);
            setNu({ name: '', email: '', role: 'Student', dept: 'AI & ML', status: 'active', semester: '1', subjects: [], identifier: '', phone: '' });
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to create user');
        }
    };

    const delUser = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await adminService.deleteUser(id);
            setUsers((p) => p.filter((u) => u.id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete user");
        }
    };

    const openEditUser = (u) => {
        setEditUserObj(u);
        setPage('edit_user');
    };

    const openViewUser = (u) => {
        setViewUserObj(u);
        setPage('view_user');
    };

    const handleToggleFee = async (id, newStatus) => {
        try {
            const currentFee = fees.find((f) => f.id === id);
            const updatedAmountPaid = newStatus === 'Clear' ? currentFee.amount_due : 0;
            const res = await adminExtendedService.updateFee(id, {
                status: newStatus,
                amount_paid: updatedAmountPaid
            });
            if (res.success) {
                setFees((prev) => prev.map((f) => f.id === id ? res.fee : f));
            }
        } catch (error) {
            console.error(error);
            alert("Failed to update fee status");
        }
    };


    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await adminService.updateUserStatus(id, newStatus);
            setUsers((p) => p.map((u) => u.id === id ? { ...u, status: newStatus } : u));
        } catch (err) {
            alert('Failed to update user status');
        }
    };

    const filteredUsers = users.filter(u => {
        if (userFilters.role !== 'All' && u.role.toLowerCase() !== userFilters.role.toLowerCase()) return false;
        if (userFilters.dept !== 'All' && u.dept !== userFilters.dept) return false;
        if (u.role === 'student' && userFilters.sem !== 'All' && u.semester !== parseInt(userFilters.sem)) return false;
        if (u.role === 'teacher' && userFilters.subject.trim() !== '') {
            if (!u.subjects || !u.subjects.some(s => s.toLowerCase().includes(userFilters.subject.toLowerCase()))) return false;
        }
        return true;
    });


    if (dataLoading) return <Loader dk={false} />;

    const kpis = analytics ? [
        { label: 'Total Students', value: analytics.kpis.totalStudents.value, delta: analytics.kpis.totalStudents.delta, up: analytics.kpis.totalStudents.up, icon: Users },
        { label: 'Avg Attendance', value: `${analytics.kpis.avgAttendance.value}%`, delta: analytics.kpis.avgAttendance.delta, up: analytics.kpis.avgAttendance.up, icon: Check },
        { label: 'Critical Risk', value: analytics.kpis.highRisk.value, delta: analytics.kpis.highRisk.delta, up: analytics.kpis.highRisk.up, icon: AlertTriangle },
        { label: 'Total Interventions', value: analytics.kpis.interventions.value, delta: analytics.kpis.interventions.delta, up: analytics.kpis.interventions.up, icon: FileText }
    ] : [];


    const riskColors = { 'Low': t.teal, 'Medium': t.gold, 'High': t.rHigh };
    const riskDist = analytics?.riskDist.map(r => ({ name: r.name, value: parseInt(r.value), color: riskColors[r.name] || t.sep })) || [];
    const deptRisk = analytics?.deptRisk || [];
    const attTrend = analytics?.attTrend || [];

    if (page === 'academic') {
        return <AcademicDataTab 
            t={t} cfg={cfg} setPage={setPage} users={users}
            hodModal={hodModal} setHodModal={setHodModal} handleAssignHod={handleAssignHod}
            timetables={timetables}
        />;
    }

    if (page === 'fees') {
        return <FeesTab t={t} setPage={setPage} fees={fees} setFees={setFees} cfg={cfg} setCfg={setCfg} />;
    }

    if (page === 'risk') {
        return <RiskTab 
            t={t} setPage={setPage}
            riskLoading={riskLoading} riskRoster={riskRoster} handleUpdateInterventionStatus={handleUpdateInterventionStatus}
        />;
    }

    if (page === 'users')
        return (
            <UserManagementTab
                modal={modal} setModal={setModal} bulkModal={bulkModal} setBulkModal={setBulkModal}
                csvRows={csvRows} setCsvRows={setCsvRows} bulkImporting={bulkImporting}
                bulkFeedback={bulkFeedback} nu={nu} setNu={setNu} userFilters={userFilters}
                setUserFilters={setUserFilters} filteredUsers={filteredUsers} allCourses={allCourses}
                addUser={addUser} delUser={delUser} toggleStatus={toggleStatus}
                handleCsvFile={handleCsvFile} downloadTemplate={downloadTemplate}
                submitBulkUsers={submitBulkUsers} openEditUser={openEditUser} openViewUser={openViewUser} t={t}
            />
        );

    if (page === 'view_user')
        return (
            <ViewUserTab 
                user={viewUserObj} 
                setPage={setPage} 
                t={t} 
            />
        );

    if (page === 'edit_user')
        return (
            <EditUserTab 
                user={editUserObj} 
                setPage={setPage} 
                setUsers={setUsers} 
                t={t} 
            />
        );

    if (page === 'config')
        return (
            <SystemSettingsTab
                cfg={cfg} setCfg={setCfg} configTab={configTab} setConfigTab={setConfigTab}
                cfgSaved={cfgSaved} setCfgSaved={setCfgSaved} backupList={backupList}
                backingUp={backingUp} handleTriggerBackup={handleTriggerBackup}
                handleDownloadBackup={handleDownloadBackup} handleDeleteBackup={handleDeleteBackup} t={t}
            />
        );

    if (page === 'reports') {
        return <ReportsTab 
            t={t} cfg={cfg} setPage={setPage}
            loadingReport={loadingReport}
            rt={rt} setRt={setRt} selectedReportId={selectedReportId} setSelectedReportId={setSelectedReportId} reportData={reportData}
            filterReportDept={filterReportDept} setFilterReportDept={setFilterReportDept} filterReportSem={filterReportSem} setFilterReportSem={setFilterReportSem} filterReportSubject={filterReportSubject} setFilterReportSubject={setFilterReportSubject}
        />;
    }

    if (page === 'logs') {
        return <LogsTab 
            t={t} setPage={setPage}
            auditLogs={auditLogs}
        />;
    }

    if (page === 'courses') {
        return <CoursesTab 
            t={t} setPage={setPage}
            allCourses={allCourses} setAllCourses={setAllCourses}
            users={users}
        />;
    }

    if (page === 'risk') page = 'home';

    // --- NEW: DYNAMIC DATA FOR HOME & ANALYTICS ---
    const totalStudents = users.filter(u => u.role === 'student').length;
    const totalFaculty = users.filter(u => u.role === 'teacher').length;
    const sToFRatio = totalFaculty > 0 ? `1 : ${Math.round(totalStudents / totalFaculty)}` : 'N/A';
    const activeDepts = new Set(users.map(u => u.dept)).size;
    
    const roleDist = [
        { name: 'Students', value: totalStudents, fill: t.teal },
        { name: 'Faculty', value: totalFaculty, fill: t.purple },
        { name: 'Admins', value: users.filter(u => u.role === 'admin').length, fill: t.gold }
    ].filter(d => d.value > 0);

    const deptCapacityMap = {};
    users.filter(u => u.role === 'student').forEach(u => {
        deptCapacityMap[u.dept] = (deptCapacityMap[u.dept] || 0) + 1;
    });
    const deptCapacity = Object.entries(deptCapacityMap).map(([dept, count]) => ({ dept, students: count }));
    // ----------------------------------------------

    if (page === 'grievances') {
        return <GrievancesTab 
            t={t} setPage={setPage}
            grievancesList={grievancesList} setGrievancesList={setGrievancesList} loadingGrievances={loadingGrievances}
            selectedGrievance={selectedGrievance} setSelectedGrievance={setSelectedGrievance}
            responseText={responseText} setResponseText={setResponseText}
            submittingResponse={submittingResponse} setSubmittingResponse={setSubmittingResponse}
        />;
    }

    if (page === 'analytics')
        return (
            <AdminAnalyticsTab
                roleDist={roleDist} deptCapacity={deptCapacity} riskDist={riskDist}
                deptRisk={deptRisk} attTrend={attTrend} t={t}
            />
        );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <div style={{ fontSize: '1.28rem', fontWeight: 700, color: t.text }}>Institution Overview</div>
                    <div style={{ fontSize: '.78rem', color: t.muted, marginTop: 2 }}>AY {cfg?.ay || '2024-25'} · Semester 5 · Live PostgreSQL Data Connected</div>
                </div>

                <div style={{ display: 'flex', gap: '.45rem' }}>
                    <button className="btn btn-nt" onClick={() => setPage('reports')}><BarChart2 size={13} />Reports</button>
                    <button className="btn btn-np" onClick={() => setPage('users')}><Users size={13} />Manage Users</button>
                </div>
            </div>

            <div className="g4">
                {kpis.map((k, i) => (
                    <KPI key={k.label} label={k.label} value={k.value} delta={k.delta} up={k.up} icon={k.icon} accent={k.label.includes('Risk') ? t.rHigh : [t.teal, t.gold, t.purple][i % 3] || t.teal} dk={false} />
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <KPI label="Student : Faculty" value={sToFRatio} icon={Users} accent={t.teal} dk={false} />
                <KPI label="Active Depts" value={activeDepts} icon={Activity} accent={t.purple} dk={false} />
                <KPI label="Total Courses" value={allCourses.length} icon={FileText} accent={t.gold} dk={false} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <Card>
                        <CH title="Recent Users" sub="Latest registrations" right={<button className="btn btn-np" onClick={() => setPage('users')}><Plus size={12} />Add User</button>} />
                        <table className="tbl tbl-lt">
                            <thead><tr><th>Name</th><th>Role</th><th>Department</th><th>Status</th><th>Last Active</th></tr></thead>
                            <tbody>
                                {users.slice(0,4).map((u) => (
                                    <tr key={u.id}>
                                        <td>{u.name}</td><td>{u.role}</td><td>{u.dept}</td>
                                        <td><span className={`b ${u.status === 'active' ? 'lAc' : 'lIn'}`}>{u.status}</span></td>
                                        <td>{u.last}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>

                    <Card>
                        <CH title="System Alerts & Activity" sub="Live feed from audit logs" right={<button className="btn btn-ng" onClick={() => setPage('logs')} style={{ padding: '.2rem .5rem', fontSize: '.7rem' }}>View All</button>} />
                        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                            {auditLogs.slice(0, 4).map(log => {
                                let details = {};
                                if (typeof log.details === 'string') {
                                    try { details = JSON.parse(log.details); } catch(e) { details = { message: log.details }; }
                                } else {
                                    details = log.details || {};
                                }
                                return (
                                    <div key={log.id} style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-start', paddingBottom: '.75rem', borderBottom: `1px solid ${t.sep}` }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: log.action.includes('Intervention') ? t.rHigh : t.teal, marginTop: 4 }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '.78rem', fontWeight: 600, color: t.text }}>{log.action}</div>
                                            <div style={{ fontSize: '.72rem', color: t.muted, marginTop: 2 }}>{log.actor_name} ({log.actor_role}) • {details.usn ? `Student: ${details.usn}` : log.entity_type}</div>
                                        </div>
                                        <div style={{ fontSize: '.68rem', color: t.muted }}>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                );
                            })}
                            {auditLogs.length === 0 && <div style={{ fontSize: '.75rem', color: t.muted }}>No system alerts.</div>}
                        </div>
                    </Card>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <Card>
                        <CH title="AI Governance" sub="Real Time Metadata" right={<Cpu size={12} style={{ color: t.muted }} />} />
                        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                            {[
                                ['Engine', 'MUSE Local Flask'],
                                ['Active Model', analytics?.activeModel || 'Loading...'],
                                ['Data Status', 'Live Postgres'],
                                ['Total Logs', auditLogs.length],
                            ].map(([l, v]) => (
                                <div key={l} style={{ padding: '.5rem .65rem', background: t.bg, borderRadius: 5, border: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="mlbl" style={{ color: t.muted, fontSize: '.65rem' }}>{l}</div>
                                    <div style={{ fontSize: '.75rem', fontWeight: 700, color: t.text }}>{v}</div>
                                </div>
                            ))}
                        </div>
                    </Card>
                    
                    <Card>
                        <CH title="Quick Actions" sub="Administrative tools" />
                        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                            <button className="btn btn-ng" style={{ justifyContent: 'center' }} onClick={() => setPage('users')}><Users size={14} /> Manage All Users</button>
                            <button className="btn btn-ng" style={{ justifyContent: 'center' }} onClick={() => setPage('config')}><Save size={14} /> System Configuration</button>
                            <button className="btn btn-ng" style={{ justifyContent: 'center' }} onClick={() => setPage('reports')}><BarChart2 size={14} /> Generate Reports</button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}