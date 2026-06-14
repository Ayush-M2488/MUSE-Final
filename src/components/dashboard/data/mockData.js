import { Users, GraduationCap, BookOpen, AlertTriangle } from 'lucide-react';

export const STUDENT_DATA = {
    name: 'Arjun Sharma',
    usn: '21CS047',
    program: 'B.E. AI & ML',
    semester: '5th Semester',
    mentor: 'Dr. Priya Nair',
    email: 'arjun.s@muse.ac.in',
    phone: '+91 98765 43210',
    fees: 'Clear',
    hostel: 'Yes',
    cgpa: 8.4,
    attendance: 71,
    subjects: [
        { name: 'Machine Learning', code: 'CS501', att: 68, ia1: 22, ia2: 19 },
        { name: 'Data Structures', code: 'CS502', att: 82, ia1: 23, ia2: 24 },
        { name: 'Computer Networks', code: 'CS503', att: 64, ia1: 18, ia2: 20 },
        { name: 'Deep Learning', code: 'CS504', att: 78, ia1: 21, ia2: 22 },
        { name: 'Engineering Math', code: 'MA501', att: 75, ia1: 20, ia2: 21 },
    ],
    assignments: [
        { id: 1, title: 'SVM Implementation', subject: 'CS501', due: 'Dec 28', status: 'pending', priority: 'high' },
        { id: 2, title: 'TCP Lab Report', subject: 'CS503', due: 'Dec 30', status: 'pending', priority: 'high' },
        { id: 3, title: 'CNN Architecture Project', subject: 'CS504', due: 'Jan 5', status: 'submitted', priority: 'med' },
        { id: 4, title: 'Eigen Values Assignment', subject: 'MA501', due: 'Jan 8', status: 'pending', priority: 'low' },
        { id: 5, title: 'Graph BFS/DFS', subject: 'CS502', due: 'Jan 10', status: 'graded', priority: 'low' },
    ],
    timetable: [
        { time: '09:00', subject: 'Machine Learning', room: 'Lab 3', faculty: 'Dr. Priya Nair' },
        { time: '11:00', subject: 'Data Structures', room: 'CR 204', faculty: 'Prof. R. Kumar' },
        { time: '14:00', subject: 'Deep Learning', room: 'Lab 1', faculty: 'Dr. S. Reddy' },
    ],
    marks: [
        { test: 'IA-1', ML: 22, DS: 23, CN: 18, DL: 21, MA: 20 },
        { test: 'IA-2', ML: 19, DS: 24, CN: 20, DL: 22, MA: 21 },
    ],
    notifications: [
        { id: 1, type: 'warn', read: false, text: 'Attendance in CS501 dropped to 68%. Min required is 75%.', time: '2h ago' },
        { id: 2, type: 'info', read: false, text: 'IA-3 schedule: CS501 on Jan 14, CS502 on Jan 16.', time: '5h ago' },
        { id: 3, type: 'info', read: true, text: 'Hall tickets for semester exams are now available.', time: '1d ago' },
        { id: 4, type: 'ok', read: true, text: 'DL Mini Project submitted successfully. Awaiting grade.', time: '2d ago' },
    ],
};

export const TEACHER_DATA = {
    name: 'Dr. Priya Nair',
    empId: 'MUSE-FAC-018',
    dept: 'AI & ML',
    designation: 'Assistant Professor',
    email: 'priya.nair@muse.ac.in',
    courses: [
        {
            code: 'CS501',
            name: 'Machine Learning',
            section: 'A',
            students: 60,
            avgAtt: 74,
            ia2Pending: true,
            risk: { high: 8, med: 14, low: 38 },
            list: [
                { usn: '21CS001', name: 'Aarav Mehta', att: 62, ia1: 18, ia2: 16, risk: 'High', factors: ['Low attendance', 'Declining marks'], notes: '', fb: null },
                { usn: '21CS012', name: 'Riya Desai', att: 71, ia1: 21, ia2: 19, risk: 'Medium', factors: ['Below threshold attendance'], notes: '', fb: null },
                { usn: '21CS047', name: 'Arjun Sharma', att: 68, ia1: 22, ia2: 19, risk: 'Medium', factors: ['Low att.', 'Incomplete tasks'], notes: '', fb: null },
            ],
            todayAtt: { '21CS001': null, '21CS012': null, '21CS047': null },
            ia2: { '21CS001': '', '21CS012': '', '21CS047': '' },
        },
        {
            code: 'CS504',
            name: 'Deep Learning',
            section: 'A',
            students: 60,
            avgAtt: 79,
            ia2Pending: false,
            risk: { high: 4, med: 11, low: 45 },
            list: [
                { usn: '21CS001', name: 'Aarav Mehta', att: 72, ia1: 19, ia2: 20, risk: 'Medium', factors: ['Declining marks'], notes: '', fb: null },
                { usn: '21CS023', name: 'Kavya Reddy', att: 90, ia1: 25, ia2: 24, risk: 'Low', factors: [], notes: '', fb: null },
                { usn: '21CS055', name: 'Rohan Patil', att: 60, ia1: 14, ia2: 15, risk: 'High', factors: ['Low attendance'], notes: '', fb: null },
            ],
            todayAtt: {},
            ia2: {},
        },
    ],
    tasks: [
        { id: 1, text: 'Enter IA-2 marks for CS501-A', urgent: true, due: 'Today', done: false },
        { id: 2, text: 'Approve 3 deadline extension requests', urgent: true, due: 'Today', done: false },
        { id: 3, text: 'Mentor session — Aarav Mehta', urgent: false, due: 'Dec 27', done: false },
        { id: 4, text: 'Upload Module 4 course materials', urgent: false, due: 'Dec 30', done: false },
    ],
    trend: [
        { week: 'W1', CS501: 80, CS504: 84 },
        { week: 'W2', CS501: 78, CS504: 82 },
        { week: 'W3', CS501: 76, CS504: 80 },
        { week: 'W4', CS501: 74, CS504: 79 },
        { week: 'W5', CS501: 72, CS504: 79 },
    ],
};

export const ADMIN_DATA = {
    kpis: [
        { label: 'Total Students', value: 298, delta: '+12', up: true, icon: Users },
        { label: 'Faculty Members', value: 24, delta: '+2', up: true, icon: GraduationCap },
        { label: 'Active Courses', value: 18, delta: '—', up: null, icon: BookOpen },
        { label: 'At-Risk Students', value: 47, delta: '+6', up: false, icon: AlertTriangle },
    ],
    riskDist: [
        { name: 'Low Risk', value: 186, color: '#10B981' },
        { name: 'Medium Risk', value: 65, color: '#F59E0B' },
        { name: 'High Risk', value: 47, color: '#EF4444' },
    ],
    deptRisk: [
        { dept: 'AI & ML', high: 8, med: 14, low: 38 },
        { dept: 'AI & DS', high: 6, med: 12, low: 42 },
        { dept: 'CS Design', high: 10, med: 18, low: 32 },
        { dept: 'Biomed', high: 14, med: 11, low: 35 },
        { dept: 'CSE', high: 9, med: 10, low: 41 },
    ],
    fee: { collected: 68, pending: 22, defaulters: 10 },
    attTrend: [
        { month: 'Aug', avg: 82 },
        { month: 'Sep', avg: 79 },
        { month: 'Oct', avg: 76 },
        { month: 'Nov', avg: 74 },
        { month: 'Dec', avg: 71 },
    ],
    activity: [
        { id: 1, text: 'New student registered: Rohan Patil', time: '10m ago', type: 'info' },
        { id: 2, text: '3 students moved to High Risk (CS Design)', time: '1h ago', type: 'warn' },
        { id: 3, text: 'IA-2 marks uploaded for CS501-A', time: '2h ago', type: 'ok' },
    ],
    users: [
        { id: 1, name: 'Aarav Mehta', role: 'Student', dept: 'AI & ML', status: 'active', last: '2h ago', email: 'aarav@muse.ac.in' },
        { id: 2, name: 'Dr. Priya Nair', role: 'Faculty', dept: 'AI & ML', status: 'active', last: '30m ago', email: 'priya@muse.ac.in' },
        { id: 3, name: 'Riya Desai', role: 'Student', dept: 'AI & DS', status: 'active', last: '5h ago', email: 'riya@muse.ac.in' },
    ],
    config: { minAtt: 75, iaMax: 25, highT: 0.7, medT: 0.4, semStart: 'Aug 2024', semEnd: 'Apr 2025', ay: '2024–25' },
};