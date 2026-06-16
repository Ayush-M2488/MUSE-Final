import React, { useMemo, useState, useEffect } from 'react';
import {
    AlertTriangle,
    Award,
    Check,
    CheckCircle,
    ClipboardList,
    Download,
    FileText,
    MessageSquare,
    Save,
    Send,
    Shield,
    TrendingDown,
    TrendingUp,
    Plus,
    Trash2,
    Paperclip,
    X
} from 'lucide-react';
import {
    BarChart,
    Bar,
    ResponsiveContainer,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';
// import { STUDENT_DATA } from '../data/mockData';
import { CH, CT, KPI, Loader, Pbar } from '../shared/Primitives';
import { DK } from '../shared/theme';
import { studentService, mlService, assignmentService, authService } from '../../../services/api';
import { generateMarksheetPDF, generateAttendancePDF, generateFeeReceiptPDF } from '../../../utils/pdfGenerator';
import { socket, connectSocket, disconnectSocket } from '../../../services/socket';

import MentorTab from './tabs/MentorTab';
import TimetableTab from './tabs/TimetableTab';
import AssignmentsTab from './tabs/AssignmentsTab';
import AttendanceTab from './tabs/AttendanceTab';
import MarksTab from './tabs/MarksTab';
import FeesTab from './tabs/FeesTab';
import NotificationsTab from './tabs/NotificationsTab';
import AnnouncementsTab from './tabs/AnnouncementsTab';
import DownloadsTab from './tabs/DownloadsTab';
import SettingsTab from './tabs/SettingsTab';
import GrievancesTab from './tabs/GrievancesTab';
import AiInsightsTab from './tabs/AiInsightsTab';
const darkBadge = (status) =>
(
    {
        pending: 'bPend',
        submitted: 'bSub',
        graded: 'bGrd',
        high: 'bH',
        medium: 'bM',
        Medium: 'bM',
        low: 'bL',
        High: 'bH',
        Low: 'bL',
    }[status] || 'bSub'
);

export default function StudentDashboard({ page, setPage }) {
    const [d, setD] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [profileName, setProfileName] = useState('');
    const [profileEmail, setProfileEmail] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    const [filter, setFilter] = useState('All');
    const [grievance, setGrievance] = useState('');
    const [sent, setSent] = useState(false);
    const [grievanceTarget, setGrievanceTarget] = useState('admin');
    const [grievanceTeacherSelect, setGrievanceTeacherSelect] = useState('');
    const [grievancesList, setGrievancesList] = useState([]);
    const [submittingGrievance, setSubmittingGrievance] = useState(false);
    const t = DK;
    const [riskData, setRiskData] = useState([]);
    const [calendarMonth, setCalendarMonth] = useState(() => new Date());
    const [selectedCalCourse, setSelectedCalCourse] = useState('All');

    // Assignments State
    const [assignments, setAssignments] = useState([]);
    const [assignTab, setAssignTab] = useState('academic'); // 'academic' or 'personal'
    const [assignModal, setAssignModal] = useState(false);
    const [assignData, setAssignData] = useState({ title: '', description: '', due_date: '', priority: 'Medium' });
    const [savingAssign, setSavingAssign] = useState(false);

    // Mentorship State
    const [mentorData, setMentorData] = useState(null);
    const [mentorMessages, setMentorMessages] = useState([]);
    const [mentorNewMessage, setMentorNewMessage] = useState('');
    const [mentorNewFile, setMentorNewFile] = useState(null);
    const [loadingMentor, setLoadingMentor] = useState(false);
    const mentorMessagesEndRef = React.useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await studentService.getDashboardData();
                const risk = await mlService.getStudentRisk();
                setD(data);
                setRiskData(risk);
                
                const assigns = await assignmentService.getAll();
                setAssignments(assigns);

                try {
                    const grievances = await studentService.getGrievances();
                    setGrievancesList(grievances);
                } catch (gErr) {
                    console.error("Failed to fetch grievances:", gErr);
                }
                
                setProfileName(data.name || '');
                setProfileEmail(data.email || '');
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch dashboard:", err);
                setError("Failed to load dashboard data. Please try logging in again.");
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (page === 'mentor' && d) {
            const fetchMentorData = async () => {
                try {
                    const data = await studentService.getMentorship();
                    setMentorData(data.mentor);
                    setMentorMessages(data.messages);
                    
                    if (data.mentor && d.user_id) {
                        connectSocket(d.user_id);
                        socket.on('receive_message', (newMsg) => {
                            setMentorMessages(prev => {
                                if (prev.find(m => m.id === newMsg.id)) return prev;
                                return [...prev, newMsg];
                            });
                        });
                    }
                } catch (err) {
                    console.error("Failed to fetch mentorship data", err);
                }
            };
            if (!mentorData) setLoadingMentor(true);
            fetchMentorData().finally(() => setLoadingMentor(false));
        }
        return () => { 
            socket.off('receive_message');
            disconnectSocket();
        };
    }, [page, d]);

    useEffect(() => {
        if (mentorMessagesEndRef.current) {
            mentorMessagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [mentorMessages]);

    const handleUpdateProfile = async () => {
        setSavingProfile(true);
        try {
            await authService.updateProfile({ name: profileName, email: profileEmail });
            alert("Profile updated successfully!");
        } catch (err) {
            alert("Failed to update profile.");
        } finally {
            setSavingProfile(false);
        }
    };

    const announcements = useMemo(() => {
        if (!d) return [];
        return d.announcements || [];
    }, [d]);

    const markRead = async (id) => {
        setD((p) => ({
            ...p,
            notifications: p.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        }));
        try {
            await studentService.markNotificationRead(id);
        } catch (e) {
            console.error("Failed to mark notification as read in backend:", e);
        }
    };

    const C = ({ children, style }) => (
        <div className="card-dk" style={style}>
            {children}
        </div>
    );

    if (loading) return <Loader dk />;
    if (error) return <div style={{ color: t.rHigh, padding: '2rem' }}>{error}</div>;
    if (!d) return null;

    const unread = d.notifications.filter((n) => !n.read).length;

    if (page === 'mentor') {
        if (loadingMentor) return <Loader dk />;

        const sendMsg = async () => {
            if (!mentorNewMessage.trim() && !mentorNewFile) return;
            try {
                const newMsg = await studentService.sendMentorshipMessage(mentorNewMessage, mentorNewFile);
                setMentorMessages(prev => {
                    if (prev.find(m => m.id === newMsg.id)) return prev;
                    return [...prev, newMsg];
                });
                setMentorNewMessage("");
                setMentorNewFile(null);
            } catch (err) {
                alert('Failed to send message');
            }
        };

        return (
            <MentorTab 
                loadingMentor={loadingMentor}
                mentorData={mentorData}
                mentorMessages={mentorMessages}
                mentorNewMessage={mentorNewMessage}
                setMentorNewMessage={setMentorNewMessage}
                mentorNewFile={mentorNewFile}
                setMentorNewFile={setMentorNewFile}
                sendMsg={sendMsg}
                mentorMessagesEndRef={mentorMessagesEndRef}
            />
        );
    }

    if (page === 'timetable') return <TimetableTab d={d} C={C} />;

    if (page === 'assignments') {
        return (
            <AssignmentsTab 
                assignments={assignments}
                setAssignments={setAssignments}
                assignTab={assignTab}
                setAssignTab={setAssignTab}
                assignModal={assignModal}
                setAssignModal={setAssignModal}
                assignData={assignData}
                setAssignData={setAssignData}
                savingAssign={savingAssign}
                setSavingAssign={setSavingAssign}
            />
        );
    }

    if (page === 'attendance') {
        return (
            <AttendanceTab 
                d={d}
                C={C}
                calendarMonth={calendarMonth}
                setCalendarMonth={setCalendarMonth}
                selectedCalCourse={selectedCalCourse}
                setSelectedCalCourse={setSelectedCalCourse}
            />
        );
    }

    if (page === 'marks') return <MarksTab d={d} C={C} />;
    if (page === 'fees') return <FeesTab d={d} C={C} />;
    if (page === 'notifications') return <NotificationsTab d={d} setD={setD} unread={unread} markRead={markRead} />;
    if (page === 'announcements') return <AnnouncementsTab announcements={announcements} C={C} />;
    if (page === 'downloads') return <DownloadsTab d={d} />;
    if (page === 'ai_insights') return <AiInsightsTab />;
    if (page === 'settings') {
        return (
            <SettingsTab 
                d={d}
                profileName={profileName}
                setProfileName={setProfileName}
                profileEmail={profileEmail}
                setProfileEmail={setProfileEmail}
                savingProfile={savingProfile}
                handleUpdateProfile={handleUpdateProfile}
            />
        );
    }

    if (page === 'grievances') {
        return (
            <GrievancesTab 
                d={d}
                grievanceTarget={grievanceTarget}
                setGrievanceTarget={setGrievanceTarget}
                grievanceTeacherSelect={grievanceTeacherSelect}
                setGrievanceTeacherSelect={setGrievanceTeacherSelect}
                grievance={grievance}
                setGrievance={setGrievance}
                sent={sent}
                setSent={setSent}
                submittingGrievance={submittingGrievance}
                setSubmittingGrievance={setSubmittingGrievance}
                grievancesList={grievancesList}
                setGrievancesList={setGrievancesList}
            />
        );
    }

    
    // --- COMPUTED DATA FOR MAIN DASHBOARD ---
    const subjects = d.subjects || [];
    const overallAttendance = subjects.length > 0 
        ? Math.round(subjects.reduce((sum, s) => sum + (s.att || 0), 0) / subjects.length) 
        : (d.attendance || 0);

    const currentSGPA = d.cgpa || '-';
    // Only calculate trend for subjects where both IA1 and IA2 have been recorded (not null)
    const iaTrend = subjects.reduce((sum, s) => sum + ((s.ia1 !== null && s.ia2 !== null) ? (s.ia2 - s.ia1) : 0), 0);
    const sgpaTrendText = iaTrend > 0 ? 'Trending up based on IAs' : iaTrend < 0 ? 'Slight decline in IAs' : 'Latest synced record';
    const sgpaTrendUp = iaTrend > 0;

    const pendingAssigns = assignments.filter(a => a.status === 'pending' || !a.status);
    const highPriorityPending = pendingAssigns.filter(a => a.priority === 'High');
    // Only flag as declining if both IA1 and IA2 are recorded and IA2 < IA1
    const decliningIAs = subjects.filter(s => s.ia1 !== null && s.ia2 !== null && s.ia2 < s.ia1);
    let standing = 'Good Standing';
    let standingColor = t.rLow;
    let standingDesc = 'On track across all metrics.';

    if (overallAttendance < 65 || highPriorityPending.length >= 2 || decliningIAs.length >= 2) {
        standing = 'At Risk';
        standingColor = t.rHigh;
        standingDesc = 'Immediate action required on attendance or academics.';
    } else if (overallAttendance < 75 || highPriorityPending.length >= 1 || decliningIAs.length >= 1) {
        standing = 'Watchlist';
        standingColor = t.rMed;
        standingDesc = 'Some areas need attention to avoid risk.';
    }

    const dynamicFactors = [];
    const dynamicRecs = [];

    subjects.filter(s => (s.att || 0) < 75).forEach(s => {
        dynamicFactors.push({ label: `Attendance ${s.code || s.name}`, val: s.att || 0, col: t.rHigh });
        dynamicRecs.push(`Improve attendance in ${s.name} to meet 75% criteria.`);
    });

    decliningIAs.forEach(s => {
        const declineAmt = ((s.ia1 || 0) - (s.ia2 || 0));
        const val = Math.min(100, declineAmt * 10); 
        dynamicFactors.push({ label: `IA Decline ${s.code || s.name}`, val, rawText: `-${declineAmt} pts`, col: t.rMed });
        dynamicRecs.push(`Review material for ${s.name} to improve next assessment.`);
    });

    if (pendingAssigns.length > 0) {
        dynamicFactors.push({ label: 'Pending Assignments', val: Math.min(100, pendingAssigns.length * 20), rawText: pendingAssigns.length, col: t.rMed });
        dynamicRecs.push(`Complete ${pendingAssigns.length} pending assignment(s) soon.`);
    }

    if (unread > 0) {
        dynamicFactors.push({ label: 'Unread Notifications', val: Math.min(100, unread * 10), rawText: unread, col: t.rLow });
    }

    if (dynamicRecs.length === 0) {
        dynamicRecs.push('Keep up the good work! All metrics are stable.');
    }

    const sortedSubjectsByAtt = [...subjects].sort((a, b) => (a.att || 0) - (b.att || 0));

    const dynamicMarks = subjects.map(s => ({
        subject: s.code || s.name,
        ia1: s.ia1 || 0,
        ia2: s.ia2 || 0,
        ia3: s.ia3 || 0
    }));

    const recentAnnouncements = announcements.slice(0, 3);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                    <div style={{ fontSize: '1.28rem', fontWeight: 700, color: t.text }}>Welcome back, {d.name.split(' ')[0]}</div>
                    <div style={{ fontSize: '.78rem', color: t.muted, marginTop: 2 }}>
                        {d.program} · {d.semester}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '.45rem' }}>
                    <button className="btn btn-gh" onClick={() => setPage('announcements')}>
                        <MessageSquare size={13} />
                        Announcements
                    </button>
                    <button className="btn btn-wh" onClick={() => setPage('fees')}>
                        <Shield size={13} />
                        Fees
                    </button>
                </div>
            </div>

            <div className="g4">
                <KPI label="Attendance" value={`${overallAttendance}%`} delta="Calculated average" up={overallAttendance >= 75} icon={CheckCircle} accent={overallAttendance < 75 ? t.rHigh : t.rLow} dk />
                <KPI label="SGPA" value={currentSGPA} delta={sgpaTrendText} up={sgpaTrendUp} icon={Award} accent="rgba(255,255,255,.8)" dk />
                <KPI label="Notifications" value={unread} delta="unread alerts" up={null} icon={MessageSquare} accent={t.rMed} dk />
                <KPI label="Fees Status" value={d.fees} delta="Current semester" up={d.fees === 'Clear'} icon={Shield} accent={d.fees === 'Clear' ? t.rLow : t.rHigh} dk />
            </div>

            {/* Computed AI Academic Standing Summary */}
            <C style={{ padding: '1.25rem', borderLeft: `4px solid ${standingColor}` }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: t.text, marginBottom: '0.5rem' }}>
                    Computed Academic Standing: {standing}
                </div>
                <div style={{ fontSize: '0.9rem', color: t.muted }}>
                    {standingDesc}
                </div>
            </C>

            <div className="g2">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <C style={{ padding: '1.25rem' }}>
                        <div className="mlbl" style={{ color: t.muted, marginBottom: '.875rem' }}>Student Profile</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: t.text }}>{d.name}</div>
                        <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '.6rem', color: t.muted, marginTop: 2 }}>
                            {d.usn} · {d.program}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.45rem', marginTop: '1rem' }}>
                            {[
                                ['Semester', d.semester],
                                ['Mentor', d.mentor],
                                ['Email', d.email],
                                ['Phone', d.phone],
                            ].map(([l, v]) => (
                                <div
                                    key={l}
                                    style={{
                                        background: 'rgba(255,255,255,.04)',
                                        padding: '.42rem .58rem',
                                        borderRadius: 6,
                                        border: '1px solid rgba(255,255,255,.06)',
                                    }}
                                >
                                    <div className="mlbl" style={{ color: t.muted, fontSize: '.48rem' }}>{l}</div>
                                    <div style={{ fontSize: '.73rem', color: t.text, marginTop: '.1rem' }}>{v}</div>
                                </div>
                            ))}
                        </div>
                    </C>

                    <C style={{ padding: '1.25rem' }}>
                        <div className="mlbl" style={{ color: t.muted, marginBottom: '.875rem' }}>My Courses & Instructors</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                            {subjects.map((sub, idx) => (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', padding: '.65rem .75rem', background: 'rgba(255,255,255,.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '.84rem', color: t.text }}>{sub.name}</div>
                                            <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '.58rem', color: t.muted, marginTop: 2 }}>{sub.code} · {sub.credits || 4} Credits</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '.76rem', color: t.rLow, fontWeight: 600 }}>{sub.teacher || 'To Be Declared'}</div>
                                            <div style={{ fontSize: '.6rem', color: t.muted, marginTop: 2 }}>Instructor</div>
                                        </div>
                                    </div>
                                    {sub.consultation_hours && sub.consultation_hours.length > 0 && (
                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '.4rem', marginTop: '.2rem' }}>
                                            <div style={{ fontSize: '.58rem', color: t.muted, textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace', marginBottom: '.25rem' }}>Consultation Slots:</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem' }}>
                                                {sub.consultation_hours.map((sh, sidx) => (
                                                    <span key={sidx} style={{ fontSize: '.65rem', background: 'rgba(255,255,255,0.04)', padding: '.15rem .35rem', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', color: t.text }}>
                                                        {sh.day}: {sh.start} - {sh.end}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {subjects.length === 0 && (
                                <div style={{ fontSize: '.8rem', color: t.muted, textAlign: 'center', padding: '1rem' }}>No courses assigned.</div>
                            )}
                        </div>
                    </C>

                    <C style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.875rem' }}>
                            <div className="mlbl" style={{ color: t.muted }}>Recent Announcements</div>
                            <button className="btn btn-gh" style={{ fontSize: '.7rem', padding: '0.2rem 0.5rem' }} onClick={() => setPage('announcements')}>View All</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
                            {recentAnnouncements.length === 0 ? (
                                <div style={{ fontSize: '.8rem', color: t.sub }}>No recent announcements.</div>
                            ) : (
                                recentAnnouncements.map((a, i) => (
                                    <div key={i} style={{ padding: '.75rem', background: 'rgba(255,255,255,.04)', borderRadius: 6, border: '1px solid rgba(255,255,255,.06)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.2rem' }}>
                                            <div style={{ fontWeight: 600, fontSize: '.85rem', color: t.text }}>{a.title}</div>
                                            <div style={{ fontSize: '.65rem', color: t.muted }}>{a.date}</div>
                                        </div>
                                        <div style={{ fontSize: '.75rem', color: t.sub, marginBottom: '.4rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {a.content}
                                        </div>
                                        <div style={{ fontSize: '.65rem', color: t.muted }}>By {a.author || 'Faculty'}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </C>
                </div>

                <C style={{ padding: '1.25rem', borderLeft: `2px solid ${standingColor}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.875rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                            <AlertTriangle size={14} style={{ color: standingColor }} />
                            <span style={{ fontWeight: 600, color: t.text, fontSize: '.88rem' }}>AI Performance Insight</span>
                        </div>
                        <span className={`b ${standing === 'Good Standing' ? 'bL' : standing === 'At Risk' ? 'bH' : 'bM'}`}>{standing}</span>
                    </div>

                    <div style={{ fontSize: '.79rem', color: t.sub, marginBottom: '.875rem', lineHeight: 1.6 }}>
                        {dynamicFactors.length > 0 
                            ? `Identified ${dynamicFactors.length} active factor(s) impacting your academic trajectory.` 
                            : 'No significant risk factors identified at this time.'}
                    </div>

                    {dynamicFactors.map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.55rem', marginBottom: '.48rem' }}>
                            <div style={{ fontSize: '.7rem', color: t.sub, minWidth: 140 }}>{f.label}</div>
                            <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
                                <div style={{ height: '100%', borderRadius: 2, background: f.col, width: `${f.val}%` }} />
                            </div>
                            <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '.58rem', color: f.col, minWidth: 40, textAlign: 'right' }}>
                                {f.rawText !== undefined ? f.rawText : `${f.val}%`}
                            </div>
                        </div>
                    ))}

                    <div className="mlbl" style={{ color: t.muted, marginTop: '.75rem', marginBottom: '.35rem' }}>Recommendations</div>
                    {dynamicRecs.map((s, i) => (
                        <div key={i} style={{ display: 'flex', gap: '.32rem', alignItems: 'flex-start', fontSize: '.74rem', color: t.sub, marginBottom: '.22rem' }}>
                            <span>
                                <TrendingUp size={10} style={{ color: 'rgba(255,255,255,.5)' }} />
                            </span>
                            <span>{s}</span>
                        </div>
                    ))}
                </C>
            </div>

            <div className="g2">
                <C>
                    <CH title="Attendance Overview" sub="By subject · Min 75" right={<button className="btn btn-gh" style={{ fontSize: '.7rem' }} onClick={() => setPage('attendance')}>View All</button>} dk />
                    <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                        {sortedSubjectsByAtt.slice(0, 5).map((s) => (
                            <div key={s.code}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.22rem' }}>
                                    <span style={{ fontSize: '.78rem', color: t.text }}>{s.name}</span>
                                    {(s.att || 0) < 75 && <span className="b bH" style={{ fontSize: '.55rem' }}>Low</span>}
                                </div>
                                <Pbar val={s.att || 0} dk />
                            </div>
                        ))}
                    </div>
                </C>

                <C>
                    <CH title="IA Scores" sub="Subject-wise IA-1, IA-2 & IA-3" dk />
                    <div style={{ padding: '.75rem .25rem .5rem' }}>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={dynamicMarks} barSize={12}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="subject"
                                    tick={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fill: t.muted }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis domain={[0, 25]} tick={{ fontSize: 10, fill: t.muted }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CT />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                                <Legend iconSize={8} wrapperStyle={{ fontSize: '.68rem', color: t.sub }} />
                                <Bar dataKey="ia1" name="IA-1" fill={DK.chart[0]} radius={[3, 3, 0, 0]} />
                                <Bar dataKey="ia2" name="IA-2" fill={DK.chart[1]} radius={[3, 3, 0, 0]} />
                                <Bar dataKey="ia3" name="IA-3" fill={DK.chart[2] || '#F59E0B'} radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </C>
            </div>
        </div>
    );
}
