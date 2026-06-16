import React, { useMemo, useState, useEffect } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  CheckCircle,
  ClipboardList,
  Edit2,
  AlertTriangle,
  Users
} from 'lucide-react';
import { CH, KPI, CT, Loader } from '../shared/Primitives';
import { DK } from '../shared/theme';
import { authService, teacherService, mlService, interventionService } from '../../../services/api';
import { socket, connectSocket, disconnectSocket } from '../../../services/socket';
import AssignmentsTab from './tabs/AssignmentsTab';
import AttendanceTab from './tabs/AttendanceTab';
import HodHubTab from './tabs/HodHubTab';
import MenteesTab from './tabs/MenteesTab';
import MarksTab from './tabs/MarksTab';
import RiskTab from './tabs/RiskTab';
import StudentsTab from './tabs/StudentsTab';
import AnnouncementsTab from './tabs/AnnouncementsTab';
import TasksTab from './tabs/TasksTab';
import GrievancesTab from './tabs/GrievancesTab';
import SettingsTab from './tabs/SettingsTab';
import TeacherTimetableTab from './tabs/TeacherTimetableTab';
import AiDiagnosticsTab from './tabs/AiDiagnosticsTab';

export default function TeacherDashboard({ page, setPage }) {
  // --- STATE ---
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [ci, setCi] = useState(0); // Course Index
  const [rf, setRf] = useState('All'); // Risk Filter
  const [anno, setAnno] = useState('');
  const [annoTarget, setAnnoTarget] = useState('All');
  const [annoSent, setAnnoSent] = useState(false);
  const [interModalUsn, setInterModalUsn] = useState(null);
  const [interAction, setInterAction] = useState('Meeting Scheduled');
  const [interNotes, setInterNotes] = useState('');

  // Grievance Portal States
  const [grievancesList, setGrievancesList] = useState([]);
  const [loadingGrievances, setLoadingGrievances] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [savingIntervention, setSavingIntervention] = useState(false);
  const [interactModalUsn, setInteractModalUsn] = useState(null);
  const [interactMessage, setInteractMessage] = useState('');
  const [interactType, setInteractType] = useState('Personal Guidance');
  const [savingInteractMessage, setSavingInteractMessage] = useState(false);
  const [interactSuccess, setInteractSuccess] = useState(false);

  // State for the currently selected course's students
  const [courseStudents, setCourseStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [savingMarks, setSavingMarks] = useState(false);
  const [attDate, setAttDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollData, setEnrollData] = useState({ name: '', usn: '', email: '', program: '', semester: '', courseIds: [] });
  const [savingEnroll, setSavingEnroll] = useState(false);

  const [sortField, setSortField] = useState('usn');
  const [sortAsc, setSortAsc] = useState(true);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskData, setTaskData] = useState({ text: '', due_date: new Date().toISOString().split('T')[0], urgent: false, courseId: '' });
  const [savingTask, setSavingTask] = useState(false);

  // Assignments State // 'self' or 'student'
  const [holidayScope, setHolidayScope] = useState('all');
  const [selectedHolidayCourses, setSelectedHolidayCourses] = useState([]);

  const t = DK;

  const formatTaskDueDate = (due) => {
    if (!due) return 'Today';
    if (/^\d{4}-\d{2}-\d{2}$/.test(due)) {
      try {
        const parts = due.split('-');
        const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      } catch (e) {
        return due;
      }
    }
    return due;
  };

  const [predictions, setPredictions] = useState([]);
  const [runningAI, setRunningAI] = useState(false);

  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Classroom custom settings
  const [customThresholds, setCustomThresholds] = useState({});
  const [emailOnHighRisk, setEmailOnHighRisk] = useState(true);
  const [autoNotifyAbsentee, setAutoNotifyAbsentee] = useState(false);
  const [consultationSlots, setConsultationSlots] = useState([]);
  const [newSlotDay, setNewSlotDay] = useState('Monday');
  const [newSlotStart, setNewSlotStart] = useState('10:00');
  const [newSlotEnd, setNewSlotEnd] = useState('11:00');

  const removeSlot = (idx) => {
    setConsultationSlots(prev => prev.filter((_, i) => i !== idx));
  };

  // HOD State

  // Mentorship State

  // --- 1. FETCH DASHBOARD DATA ON MOUNT ---
  const fetchDashboard = async () => {
    try {
      const data = await teacherService.getDashboardData();
      setDashboardData(data);

      if (data && data.profile) {
        setProfileName(data.profile.name || '');
        setProfileEmail(data.profile.email || '');
        setCustomThresholds(data.profile.custom_thresholds || {});

        const prefs = data.profile.notification_prefs || {};
        setEmailOnHighRisk(prefs.emailOnHighRisk !== undefined ? prefs.emailOnHighRisk : true);
        setAutoNotifyAbsentee(prefs.autoNotifyAbsentee !== undefined ? prefs.autoNotifyAbsentee : false);

        setConsultationSlots(data.profile.consultation_hours || []);
      }
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch teacher dashboard:", err);
      setError("Failed to load dashboard data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Fetch grievances on navigation to tab
  useEffect(() => {
    if (page === 'grievances') {
      const fetchGrievances = async () => {
        setLoadingGrievances(true);
        try {
          const list = await teacherService.getGrievances();
          setGrievancesList(list);
        } catch (err) {
          console.error("Failed to load teacher grievances:", err);
        } finally {
          setLoadingGrievances(false);
        }
      };
      fetchGrievances();
    }
  }, [page]);

  // --- 2. FETCH STUDENTS WHEN COURSE INDEX CHANGES ---
  useEffect(() => {
    if (!dashboardData || !dashboardData.courses || dashboardData.courses.length === 0) return;

    const selectedCourseCode = ci === -1 ? 'all' : dashboardData.courses[ci]?.code;
    const selectedSection = ci === -1 ? null : dashboardData.courses[ci]?.section;
    if (!selectedCourseCode) return;

    const fetchStudents = async () => {
      setStudentsLoading(true);
      try {
        const students = await teacherService.getCourseStudents(selectedCourseCode, attDate, selectedSection);
        const preds = selectedCourseCode !== 'all' ? await mlService.getCoursePredictions(selectedCourseCode) : []; // AI only for specific course
        setPredictions(preds);
        // Map backend data directly into editable state
        setCourseStudents(students.map(s => ({
          usn: s.usn,
          name: s.name,
          program: s.program,
          semester: s.semester,
          cgpa: s.cgpa,
          course_code: s.course_code,
          section: s.section,
          att: s.attendance_percentage !== undefined ? s.attendance_percentage : 0,
          todayAtt: s.today_attendance || null,
          ia1: s.ia1 !== undefined && s.ia1 !== null ? String(s.ia1) : '',
          ia2: s.ia2 !== undefined && s.ia2 !== null ? String(s.ia2) : '',
          ia3: s.ia3 !== undefined && s.ia3 !== null ? String(s.ia3) : '',
          practical: s.practical !== undefined && s.practical !== null ? String(s.practical) : '',
          finalExam: s.finalExam !== undefined && s.finalExam !== null ? String(s.finalExam) : '',
          health_score: s.health_score || 0,
          risk: s.risk_level,
          factors: [],
          fb: null,
          notes: ''
        })));
      } catch (err) {
        console.error("Failed to fetch students:", err);
      } finally {
        setStudentsLoading(false);
      }
    };
    fetchStudents();
  }, [ci, dashboardData, attDate]);

  const handleToggleHoliday = async () => {
    const isSunday = new Date(attDate).getDay() === 0;
    if (isSunday) {
      alert("Cannot declare Sunday as a Holiday.");
      return;
    }

    const isAll = holidayScope === 'all';
    const targetCourses = isAll ? [null] : selectedHolidayCourses;

    if (!isAll && targetCourses.length === 0) {
      alert("Please select at least one class or choose 'All Classes'.");
      return;
    }

    try {
      // Check if any of the target courses already have a holiday declared on this date
      const alreadyHoliday = targetCourses.some(code =>
        dashboardData?.holidays?.some(h => h.date === attDate && h.course_code === code)
      );

      const scopeLabel = isAll ? "All Classes" : `${targetCourses.length} selected classes (${targetCourses.join(', ')})`;
      const msg = alreadyHoliday
        ? `Are you sure you want to remove the Holiday status on this day for the selected ${scopeLabel}?`
        : `Are you sure you want to declare this day as a Holiday for the selected ${scopeLabel}? Any matching attendance records on this day will be permanently cleared.`;
      if (!window.confirm(msg)) return;

      for (const code of targetCourses) {
        const isCurrentHoliday = dashboardData?.holidays?.some(h => h.date === attDate && h.course_code === code);
        // Only toggle if it matches the action we want
        if (alreadyHoliday ? isCurrentHoliday : !isCurrentHoliday) {
          await teacherService.toggleHoliday(attDate, alreadyHoliday ? "" : `Holiday declared for ${code || 'All Classes'}`, code);
        }
      }

      alert(alreadyHoliday ? "Holiday status removed successfully!" : "Holiday declared successfully!");
      await fetchDashboard();
    } catch (err) {
      console.error("Failed to toggle holiday:", err);
      alert("Failed to update holiday status.");
    }
  };

  // --- 3. CRUD HANDLERS ---
  const handleMarkAttendance = async (usn, status, specificCourseCode) => {
    const courseCode = specificCourseCode || dashboardData.courses[ci].code;
    // Optimistic UI update
    setCourseStudents(prev => prev.map(s => (s.usn === usn && s.course_code === courseCode) ? { ...s, todayAtt: status } : s));
    try {
      await teacherService.markAttendance(courseCode, { usn, status, date: attDate });
    } catch (err) {
      // Revert optimistic update
      setCourseStudents(prev => prev.map(s => (s.usn === usn && s.course_code === courseCode) ? { ...s, todayAtt: null } : s));
      alert(err.response?.data?.error || "Failed to save attendance. Please try again.");
    }
  };

  const handleMarkBatchAttendance = async (status) => {
    if (ci === -1) {
      alert("Please select a specific course to mark batch attendance.");
      return;
    }

    const courseCode = dashboardData.courses[ci].code;

    // Determine which students to mark
    let studentsToMark = courseStudents.filter(s => s.course_code === courseCode);
    if (status === 'absent') {
      // When marking all as absent, only affect those who haven't been explicitly marked present
      studentsToMark = studentsToMark.filter(s => s.todayAtt !== 'present');
    }

    const records = studentsToMark.map(s => ({ usn: s.usn, status }));

    // Optimistic UI update
    setCourseStudents(prev => prev.map(s => {
      if (s.course_code === courseCode) {
        if (status === 'absent' && s.todayAtt === 'present') return s;
        return { ...s, todayAtt: status };
      }
      return s;
    }));

    try {
      await teacherService.markBatchAttendance(courseCode, {
        records,
        date: attDate
      });
    } catch (err) {
      // If batch fails, we would ideally revert, but it's safer to just reload the data
      fetchDashboard();
      alert(err.response?.data?.error || "Failed to save batch attendance. Please try again.");
    }
  };

  const handleMarkChange = (usn, field, value) => {
    if (value === '') {
      setCourseStudents(prev => prev.map(s => s.usn === usn ? { ...s, [field]: '' } : s));
      return;
    }
    const num = Number(value);
    let max = 30; // default for ia1, ia2, ia3
    if (field === 'practical') max = 20;
    if (field === 'finalExam') max = 100;

    if (isNaN(num) || num < 0 || num > max) return;
    setCourseStudents(prev => prev.map(s => s.usn === usn ? { ...s, [field]: value } : s));
  };

  const handleSaveMarks = async () => {
    setSavingMarks(true);
    const courseCode = dashboardData.courses[ci].code;
    try {
      const payload = courseStudents.map(s => ({ usn: s.usn, ia1: s.ia1, ia2: s.ia2, ia3: s.ia3, practical: s.practical, finalExam: s.finalExam }));
      await teacherService.saveMarks(courseCode, payload);
      alert('Marks saved successfully to database!');
    } catch (err) {
      alert("Failed to save marks.");
    } finally {
      setSavingMarks(false);
    }
  };

  const handleEnroll = async () => {
    if (!enrollData.usn || enrollData.courseIds.length === 0) {
      return alert("USN and at least one Subject are required.");
    }
    setSavingEnroll(true);

    try {
      await Promise.all(enrollData.courseIds.map(async (idStr) => {
        const parts = idStr.split('|');
        const courseCode = parts[0];
        const selectedSection = parts[1];
        await teacherService.enrollStudent(courseCode, { ...enrollData, section: selectedSection });
      }));

      alert("Student enrolled successfully!");
      setEnrollModalOpen(false);
      setEnrollData({ name: '', usn: '', email: '', program: '', semester: '', courseIds: [] });

      // Refresh students for the currently active tab (which might be 'all' or the specific course)
      const activeCourseCode = ci === -1 ? 'all' : dashboardData.courses[ci].code;
      const activeSection = ci === -1 ? null : dashboardData.courses[ci].section;

      const students = await teacherService.getCourseStudents(activeCourseCode, attDate, activeSection);
      setCourseStudents(students.map(s => ({
        usn: s.usn,
        name: s.name,
        program: s.program,
        semester: s.semester,
        cgpa: s.cgpa,
        course_code: s.course_code,
        section: s.section,
        att: s.attendance_percentage !== undefined ? s.attendance_percentage : 0,
        todayAtt: s.today_attendance || null,
        ia1: s.ia1 !== undefined && s.ia1 !== null ? String(s.ia1) : '',
        ia2: s.ia2 !== undefined && s.ia2 !== null ? String(s.ia2) : '',
        ia3: s.ia3 !== undefined && s.ia3 !== null ? String(s.ia3) : '',
        practical: s.practical !== undefined && s.practical !== null ? String(s.practical) : '',
        finalExam: s.finalExam !== undefined && s.finalExam !== null ? String(s.finalExam) : '',
        health_score: s.health_score || 0,
        risk: s.risk_level,
        factors: [],
        fb: null,
        notes: ''
      })));

      const data = await teacherService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      alert("Failed to enroll student.");
    } finally {
      setSavingEnroll(false);
    }
  };

  const handleLogIntervention = async () => {
    if (!interNotes.trim()) return alert("Please add notes");
    setSavingIntervention(true);
    try {
      await interventionService.logIntervention({
        usn: interModalUsn,
        action_taken: interAction,
        notes: interNotes
      });
      alert('Intervention logged successfully! Audit trail updated.');
      setInterModalUsn(null);
      setInterNotes('');
    } catch (err) {
      alert('Failed to log intervention.');
    } finally {
      setSavingIntervention(false);
    }
  };

  const handleSendDirectMessage = async () => {
    if (!interactMessage.trim()) return alert("Please enter a message.");
    setSavingInteractMessage(true);
    try {
      await interventionService.sendStudentMessage(interactModalUsn, {
        message: interactMessage,
        type: interactType
      });
      setInteractSuccess(true);
      setInteractMessage('');
      setTimeout(() => {
        setInteractSuccess(false);
        setInteractModalUsn(null);
      }, 2000);
    } catch (err) {
      alert("Failed to send message. Please try again.");
    } finally {
      setSavingInteractMessage(false);
    }
  };

  const handleRunAI = async () => {
    setRunningAI(true);
    const courseCode = dashboardData.courses[ci].code;
    try {
      await mlService.generatePredictions(courseCode);
      const preds = await mlService.getCoursePredictions(courseCode);
      setPredictions(preds);
      alert('AI Analysis complete!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to run AI analysis.');
    } finally {
      setRunningAI(false);
    }
  };

  const toggleTask = async (id) => {
    // Optimistic UI update
    setDashboardData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)
    }));
    try {
      await teacherService.toggleTask(id);
    } catch (err) {
      alert('Failed to update task');
      // Revert on failure
      setDashboardData(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)
      }));
    }
  };

  const handleCreateTask = async () => {
    if (!taskData.text) return alert("Task description is required.");
    setSavingTask(true);
    try {
      let finalTxt = taskData.text;
      if (taskData.courseId) {
        finalTxt = `[${taskData.courseId}] ${finalTxt}`;
      }
      const newTask = await teacherService.createTask({
        text: finalTxt,
        due_date: taskData.due_date || 'Today',
        urgent: taskData.urgent
      });
      setDashboardData(prev => ({
        ...prev,
        tasks: [newTask, ...prev.tasks]
      }));
      setTaskModalOpen(false);
      setTaskData({ text: '', due_date: new Date().toISOString().split('T')[0], urgent: false, courseId: '' });
    } catch (err) {
      alert("Failed to create task");
    } finally {
      setSavingTask(false);
    }
  };

  const handleDeleteTask = async (id) => {
    const originalTasks = [...dashboardData.tasks];
    setDashboardData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
    try {
      await teacherService.deleteTask(id);
    } catch (err) {
      alert("Failed to delete task");
      setDashboardData(prev => ({ ...prev, tasks: originalTasks }));
    }
  };

  const handleSendAnnouncement = async () => {
    if (!anno.trim()) return;
    try {
      if (annoTarget === 'Department_Broadcast') {
        await teacherService.sendDepartmentAnnouncement(anno);
      } else {
        const targetCourseCode = annoTarget === 'All' ? null : annoTarget;
        await teacherService.sendAnnouncement(anno, targetCourseCode);
      }
      setAnnoSent(true);
      setAnno('');
      setTimeout(() => setAnnoSent(false), 3000);
    } catch (err) {
      alert('Failed to send announcement');
    }
  };

  const handleUpdateProfile = async () => {
    setSavingProfile(true);
    try {
      await authService.updateProfile({ name: profileName, email: profileEmail });

      // Save additional classroom preferences
      await teacherService.updateSettings({
        custom_thresholds: customThresholds,
        notification_prefs: {
          emailOnHighRisk,
          autoNotifyAbsentee
        },
        consultation_hours: consultationSlots
      });

      // Update local storage to reflect new name
      const storedUser = JSON.parse(localStorage.getItem('muse_user') || '{}');
      storedUser.name = profileName;
      storedUser.email = profileEmail;
      localStorage.setItem('muse_user', JSON.stringify(storedUser));

      // Refresh dashboard state from database
      await fetchDashboard();

      alert('All settings and profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile settings.');
    } finally {
      setSavingProfile(false);
    }
  };

  // --- RENDER GUARDS ---
  if (loading) return <Loader dk />;
  if (error) return <div style={{ padding: '2rem', color: t.rHigh }}>{error}</div>;
  if (!dashboardData) return null;

  // --- MAP REAL DATA TO UI VARIABLES ---
  const d = dashboardData || {};
  const courses = d.courses || [];
  const profile = d.profile || {};
  const tasksList = d.tasks || [];
  const trendData = d.attTrend || [];
  const C = courses[ci] || {};

  const filtered = courseStudents.filter((s) => (rf === 'All' ? true : s.risk === rf));

  // --- UI COMPONENTS ---
  const renderCourseTabs = (allowAll = false) => (
    <div style={{ display: 'flex', gap: '.45rem', marginBottom: '.25rem', flexWrap: 'wrap' }}>
      {allowAll && (
        <button onClick={() => setCi(-1)} className={`btn ${ci === -1 ? 'btn-wh' : 'btn-gh'}`}>
          All Classes
        </button>
      )}
      {courses.map((c, i) => (
        <button key={`${c.code}-${c.section}`} onClick={() => setCi(i)} className={`btn ${i === ci ? 'btn-wh' : 'btn-gh'}`}>
          {c.code} ({c.section})
        </button>
      ))}
    </div>
  );

  // Sort helper for single-subject tables (Attendance/Marks)
  const handleSort = (field) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const getSortedStudents = (list) => {
    return [...list].sort((a, b) => {
      // If "All Classes" is selected and we aren't explicitly sorting by course_code, group by course_code first anyway!
      if (ci === -1 && sortField !== 'course_code') {
        const cA = a.course_code || '';
        const cB = b.course_code || '';
        if (cA < cB) return -1;
        if (cA > cB) return 1;
      }

      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  };

  // Derived grouping and sorting specifically for Manage Students table
  const getDerivedStudents = () => {
    // 1. Normalize and Group
    const normalized = courseStudents.reduce((acc, s) => {
      const existing = acc.find(x => x.usn === s.usn);
      if (existing) {
        if (s.course_code && !existing.assignedSubjects.includes(s.course_code)) {
          existing.assignedSubjects.push(s.course_code);
        }
      } else {
        acc.push({
          ...s,
          assignedSubjects: s.course_code ? [s.course_code] : []
        });
      }
      return acc;
    }, []);

    // 2. Sort by assigned subjects then name
    return normalized.sort((a, b) => {
      // Unassigned at bottom
      if (a.assignedSubjects.length === 0 && b.assignedSubjects.length > 0) return 1;
      if (a.assignedSubjects.length > 0 && b.assignedSubjects.length === 0) return -1;

      // Sort by first subject
      const aSub = a.assignedSubjects[0] || '';
      const bSub = b.assignedSubjects[0] || '';
      if (aSub < bSub) return -1;
      if (aSub > bSub) return 1;

      // Sort by name
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      if (aName < bName) return -1;
      if (aName > bName) return 1;

      return 0;
    });
  };

  // --- PAGE ROUTING ---
  if (page === 'mentees') return <MenteesTab />;

  if (page === 'hod_hub') return <HodHubTab />;

  if (page === 'attendance') return <AttendanceTab courses={courses} ci={ci} attDate={attDate} setAttDate={setAttDate} calendarMonth={calendarMonth} setCalendarMonth={setCalendarMonth} courseStudents={courseStudents} handleSort={handleSort} sortField={sortField} sortAsc={sortAsc} getSortedStudents={getSortedStudents} handleMarkAttendance={handleMarkAttendance} handleMarkBatchAttendance={handleMarkBatchAttendance} handleToggleHoliday={handleToggleHoliday} holidayScope={holidayScope} setHolidayScope={setHolidayScope} selectedHolidayCourses={selectedHolidayCourses} setSelectedHolidayCourses={setSelectedHolidayCourses} dashboardData={dashboardData} renderCourseTabs={renderCourseTabs} studentsLoading={studentsLoading} />;

  if (page === 'marks') {
    return (
      <MarksTab
        ci={ci}
        setCi={setCi}
        courses={courses}
        C={C}
        savingMarks={savingMarks}
        handleSaveMarks={handleSaveMarks}
        studentsLoading={studentsLoading}
        courseStudents={courseStudents}
        handleMarkChange={handleMarkChange}
        renderCourseTabs={renderCourseTabs}
      />
    );
  }

  if (page === 'risk') return <RiskTab C={C} rf={rf} setRf={setRf} courseStudents={courseStudents} predictions={predictions} studentsLoading={studentsLoading} runningAI={runningAI} handleRunAI={handleRunAI} renderCourseTabs={renderCourseTabs} interModalUsn={interModalUsn} setInterModalUsn={setInterModalUsn} interAction={interAction} setInterAction={setInterAction} interNotes={interNotes} setInterNotes={setInterNotes} savingIntervention={savingIntervention} handleLogIntervention={handleLogIntervention} />;

  if (page === 'ai_diagnostics') return <AiDiagnosticsTab C={C} courseStudents={courseStudents} predictions={predictions} runningAI={runningAI} handleRunAI={handleRunAI} renderCourseTabs={renderCourseTabs} />;

  if (page === 'students') return <StudentsTab ci={ci} C={C} courseStudents={courseStudents} studentsLoading={studentsLoading} renderCourseTabs={renderCourseTabs} handleSort={handleSort} getDerivedStudents={getDerivedStudents} interactModalUsn={interactModalUsn} setInteractModalUsn={setInteractModalUsn} interactMessage={interactMessage} setInteractMessage={setInteractMessage} interactType={interactType} setInteractType={setInteractType} interactSuccess={interactSuccess} setInteractSuccess={setInteractSuccess} savingInteractMessage={savingInteractMessage} handleSendDirectMessage={handleSendDirectMessage} />;

  if (page === 'announcements') return <AnnouncementsTab dashboardData={dashboardData} annoTarget={annoTarget} setAnnoTarget={setAnnoTarget} annoSent={annoSent} setAnnoSent={setAnnoSent} anno={anno} setAnno={setAnno} handleSendAnnouncement={handleSendAnnouncement} />;

  if (page === 'tasks') return <TasksTab tasksList={tasksList} taskModalOpen={taskModalOpen} setTaskModalOpen={setTaskModalOpen} taskData={taskData} setTaskData={setTaskData} courses={courses} savingTask={savingTask} handleCreateTask={handleCreateTask} toggleTask={toggleTask} handleDeleteTask={handleDeleteTask} formatTaskDueDate={formatTaskDueDate} />;

  if (page === 'assignments') return <AssignmentsTab dashboardData={dashboardData} />;

  if (page === 'grievances') return <GrievancesTab loadingGrievances={loadingGrievances} grievancesList={grievancesList} setGrievancesList={setGrievancesList} selectedGrievance={selectedGrievance} setSelectedGrievance={setSelectedGrievance} responseText={responseText} setResponseText={setResponseText} submittingResponse={submittingResponse} setSubmittingResponse={setSubmittingResponse} />;

  if (page === 'timetable') return <TeacherTimetableTab courses={courses} />;

  if (page === 'settings') return <SettingsTab profile={profile} courses={courses} dashboardData={dashboardData} profileName={profileName} setProfileName={setProfileName} profileEmail={profileEmail} setProfileEmail={setProfileEmail} savingProfile={savingProfile} handleUpdateProfile={handleUpdateProfile} customThresholds={customThresholds} setCustomThresholds={setCustomThresholds} emailOnHighRisk={emailOnHighRisk} setEmailOnHighRisk={setEmailOnHighRisk} autoNotifyAbsentee={autoNotifyAbsentee} setAutoNotifyAbsentee={setAutoNotifyAbsentee} consultationSlots={consultationSlots} setConsultationSlots={setConsultationSlots} removeSlot={removeSlot} newSlotDay={newSlotDay} setNewSlotDay={setNewSlotDay} newSlotStart={newSlotStart} setNewSlotStart={setNewSlotStart} newSlotEnd={newSlotEnd} setNewSlotEnd={setNewSlotEnd} />;

  // --- MAIN DASHBOARD OVERVIEW ---
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '1.28rem', fontWeight: 700, color: t.text }}>Welcome, {profile.name ? profile.name.split(' ').pop() : 'Teacher'}</div>
          <div style={{ fontSize: '.78rem', color: t.muted, marginTop: 2 }}>
            {profile.designation || ''} · {profile.department || ''}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '.45rem' }}>
          <button className="btn btn-tl" onClick={() => setPage('attendance')}>
            <CheckCircle size={13} /> Attendance
          </button>
          <button className="btn btn-wh" onClick={() => setPage('marks')}>
            <Edit2 size={13} /> Enter Marks
          </button>
        </div>
      </div>

      <div className="g4">
        <KPI label="Students Taught" value={d.kpis?.totalUniqueStudents || 0} delta="this semester" up={null} icon={Users} accent="rgba(255,255,255,.8)" dk />
        <KPI label="Avg. Attendance" value={`${d.kpis?.avgAttendance || 0}%`} delta="all classes" up={null} icon={CheckCircle} accent={t.rMed} dk />
        <KPI label="High Risk" value={courseStudents.filter(s => {
          const p = predictions.find(pred => pred.usn === s.usn);
          return (p ? p.risk_level : s.risk) === 'High';
        }).length} delta={ci === -1 ? "all students" : "selected course"} up={false} icon={AlertTriangle} accent={t.rHigh} dk />
        <KPI label="Urgent Tasks" value={tasksList.filter((x) => !x.done && x.urgent).length} delta="pending today" up={false} icon={ClipboardList} accent={t.rMed} dk />
      </div>

      <div className="g2">
        <div className="card-dk">
          <CH title="My Courses" sub="Click to select" dk />
          <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {courses.map((c, i) => (
              <div
                key={c.code}
                onClick={() => setCi(i)}
                style={{
                  padding: '.875rem 1rem',
                  border: `1px solid ${i === ci ? 'rgba(255,255,255,.25)' : t.border}`,
                  borderRadius: 9,
                  cursor: 'pointer',
                  background: i === ci ? 'rgba(255,255,255,.07)' : 'transparent',
                }}
              >
                <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '.58rem', color: 'rgba(255,255,255,.45)' }}>
                  {c.code} ({c.section})
                </div>
                <div style={{ fontSize: '.86rem', fontWeight: 600, color: t.text, marginTop: 2 }}>{c.name}</div>
                <div style={{ fontSize: '.72rem', color: t.muted, marginBottom: '.42rem' }}>
                  {c.student_count} students enrolled
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-dk">
          <CH title="Attendance Trend" sub="Weekly averages" dk />
          <div style={{ padding: '.75rem .25rem .5rem' }}>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fill: t.muted }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: t.muted }} axisLine={false} tickLine={false} />
                <Tooltip content={<CT />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                {courses.map((c, i) => (
                  <Area key={c.code} type="monotone" dataKey={c.code} name={c.code} stroke={`rgba(255,255,255,${1 - i * 0.3})`} fill={`rgba(255,255,255,${0.15 - i * 0.05})`} strokeWidth={2} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}