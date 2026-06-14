import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api', // Points to our Express server
    headers: { 'Content-Type': 'application/json' },
});

// 1. REQUEST INTERCEPTOR: Automatically attach the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('muse_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 2. RESPONSE INTERCEPTOR: Handle expired/invalid tokens globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Don't force redirect if the 401 comes from a failed login attempt
            if (error.config && error.config.url === '/auth/login') {
                return Promise.reject(error);
            }

            console.warn('Unauthorized or token expired. Clearing local session.');
            localStorage.removeItem('muse_token');
            localStorage.removeItem('muse_role');
            localStorage.removeItem('muse_user');

            // If we are not already on the login page or landing page, kick them to login
            if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// --- Auth Services ---
export const authService = {
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },
    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },
    googleSSO: async () => {
        const response = await api.post('/auth/sso/google');
        return response.data;
    },
    changePassword: async (currentPassword, newPassword) => {
        const response = await api.put('/auth/change-password', { currentPassword, newPassword });
        return response.data;
    },
    updateProfile: async (data) => {
        const response = await api.put('/auth/profile', data);
        return response.data;
    }
};

// --- Student Services ---
export const studentService = {
    getDashboardData: async () => {
        const response = await api.get('/student/dashboard');
        return response.data;
    },
    getAIInsights: async () => {
        const response = await api.get('/student/ai-insights');
        return response.data;
    },
    markNotificationRead: async (id) => {
        const response = await api.put(`/student/notifications/${id}/read`);
        return response.data;
    },
    submitGrievance: async (data) => {
        const response = await api.post('/student/grievances', data);
        return response.data;
    },
    getGrievances: async () => {
        const response = await api.get('/student/grievances');
        return response.data;
    },
    getMentorship: async () => {
        const response = await api.get('/student/mentorship');
        return response.data;
    },
    sendMentorshipMessage: async (content, file = null) => {
        let response;
        if (file) {
            const formData = new FormData();
            formData.append('content', content);
            formData.append('file', file);
            response = await api.post('/student/mentorship/messages', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        } else {
            response = await api.post('/student/mentorship/messages', { content });
        }
        return response.data;
    }
};


export const teacherService = {
    getDashboardData: async () => {
        const response = await api.get('/teacher/dashboard');
        return response.data;
    },
    getCourseStudents: async (courseCode, date = null, section = null) => {
        const queryParams = new URLSearchParams();
        if (date) queryParams.append('date', date);
        if (section) queryParams.append('section', section);
        const url = `/teacher/courses/${courseCode}/students?${queryParams.toString()}`;
        const response = await api.get(url);
        return response.data;
    },
    enrollStudent: async (courseCode, studentData) => {
        const response = await api.post(`/teacher/courses/${courseCode}/enroll`, studentData);
        return response.data;
    },
    markAttendance: async (courseCode, data) => {
        const response = await api.post(`/teacher/courses/${courseCode}/attendance`, data);
        return response.data;
    },
    markBatchAttendance: async (courseCode, data) => {
        const response = await api.post(`/teacher/courses/${courseCode}/attendance/batch`, data);
        return response.data;
    },
    saveMarks: async (courseCode, marksData) => {
        const response = await api.post(`/teacher/courses/${courseCode}/marks`, { marksData });
        return response.data;
    },
    toggleTask: async (taskId) => {
        const response = await api.post(`/teacher/tasks/${taskId}/toggle`);
        return response.data;
    },
    createTask: async (taskData) => {
        const response = await api.post('/teacher/tasks', taskData);
        return response.data;
    },
    deleteTask: async (taskId) => {
        const response = await api.delete(`/teacher/tasks/${taskId}`);
        return response.data;
    },
    sendAnnouncement: async (content, target_course_code = null) => {
        const response = await api.post(`/teacher/announcements`, { content, target_course_code });
        return response.data;
    },
    toggleHoliday: async (date, description = '', course_code = null) => {
        const response = await api.post('/teacher/holidays/toggle', { date, description, course_code });
        return response.data;
    },
    getDepartmentHub: async () => {
        const response = await api.get('/teacher/hod/hub');
        return response.data;
    },
    getDepartmentStudents: async () => {
        const response = await api.get('/teacher/hod/students');
        return response.data;
    },
    getDepartmentFacultyDetails: async (emp_id) => {
        const response = await api.get(`/teacher/hod/faculty/${emp_id}`);
        return response.data;
    },
    sendDepartmentAnnouncement: async (content) => {
        const response = await api.post('/teacher/hod/announcement', { content });
        return response.data;
    },
    updateSettings: async (settingsData) => {
        const response = await api.put('/teacher/settings', settingsData);
        return response.data;
    },
    assignMentor: async (usn, mentorEmpId) => {
        const response = await api.post('/teacher/hod/assign-mentor', { usn, mentor_emp_id: mentorEmpId });
        return response.data;
    },
    getGrievances: async () => {
        const response = await api.get('/teacher/grievances');
        return response.data;
    },
    respondToGrievance: async (id, responseText) => {
        const response = await api.post(`/teacher/grievances/${id}/respond`, { response: responseText });
        return response.data;
    },
    getTimetables: async () => {
        const response = await api.get('/teacher/timetable');
        return response.data;
    },
    updateTimetable: async (id, data) => {
        const response = await api.put(`/teacher/timetable/${id}`, data);
        return response.data;
    },
    getMyMentees: async () => {
        const response = await api.get('/teacher/mentorship/mentees');
        return response.data;
    },
    getMentorshipMessages: async (usn) => {
        const response = await api.get(`/teacher/mentorship/mentees/${usn}/messages`);
        return response.data;
    },
    sendMentorshipMessage: async (usn, content, file = null) => {
        let response;
        if (file) {
            const formData = new FormData();
            formData.append('content', content);
            formData.append('file', file);
            response = await api.post(`/teacher/mentorship/mentees/${usn}/messages`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        } else {
            response = await api.post(`/teacher/mentorship/mentees/${usn}/messages`, { content });
        }
        return response.data;
    }
};

// --- ML Services ---
export const mlService = {
    generatePredictions: async (courseCode) => {
        const response = await api.post(`/ml/courses/${courseCode}/predict`);
        return response.data;
    },
    getCoursePredictions: async (courseCode) => {
        const response = await api.get(`/ml/courses/${courseCode}/predictions`);
        return response.data;
    },
    getStudentRisk: async () => {
        const response = await api.get(`/ml/student/risk`);
        return response.data;
    }
};

// --- Intervention Services ---
export const interventionService = {
    logIntervention: async (data) => {
        const response = await api.post('/interventions', data);
        return response.data;
    },
    getStudentInterventions: async (usn) => {
        const response = await api.get(`/interventions/student/${usn}`);
        return response.data;
    },
    sendStudentMessage: async (usn, payload) => {
        const response = await api.post(`/interventions/student/${usn}/message`, payload);
        return response.data;
    },
    getAdminAuditLogs: async () => {
        const response = await api.get('/interventions/admin/audit');
        return response.data;
    },
    updateInterventionStatus: async (id, status) => {
        const response = await api.put(`/interventions/${id}`, { status });
        return response.data;
    }
};

// --- Admin Services ---
export const adminService = {
    getAnalytics: async () => {
        const response = await api.get('/admin/analytics');
        return response.data;
    },
    getUsers: async (page = 1, limit = 50, search = '', role = 'All') => {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });
        if (search) queryParams.append('search', search);
        if (role !== 'All') queryParams.append('role', role);
        const response = await api.get(`/admin/users?${queryParams.toString()}`);
        return response.data;
    },
    createUser: async (userData) => {
        const response = await api.post('/admin/users', userData);
        return response.data;
    },
    deleteUser: async (id) => {
        const response = await api.delete(`/admin/users/${id}`);
        return response.data;
    },
    updateUserStatus: async (id, status) => {
        const response = await api.patch(`/admin/users/${id}/status`, { status });
        return response.data;
    },
    resetUserPassword: async (id) => {
        const response = await api.put(`/admin/users/${id}/reset-password`);
        return response.data;
    },
    updateUser: async (id, userData) => {
        const response = await api.put(`/admin/users/${id}`, userData);
        return response.data;
    },
    getConfig: async () => {
        const response = await api.get('/admin/config');
        return response.data;
    },
    updateGlobalConfig: async (configData) => {
        const response = await api.put('/admin/config', configData);
        return response.data;
    },
    getCourses: async (page = 1, limit = 50, search = '', department = 'All') => {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });
        if (search) queryParams.append('search', search);
        if (department !== 'All') queryParams.append('department', department);
        const response = await api.get(`/admin/courses?${queryParams.toString()}`);
        return response.data;
    },
    assignCourseFaculty: async (courseCode, empId) => {
        const response = await api.post(`/admin/courses/${courseCode}/assign`, { empId });
        return response.data;
    },
    createUsersBulk: async (users) => {
        const response = await api.post('/admin/users/bulk', { users });
        return response.data;
    },
    getRiskRoster: async () => {
        const response = await api.get('/admin/risk-roster');
        return response.data;
    },
    getBackups: async () => {
        const response = await api.get('/admin/backups');
        return response.data;
    },
    triggerBackup: async () => {
        const response = await api.post('/admin/backups/trigger');
        return response.data;
    },
    downloadBackup: async (filename) => {
        const response = await api.get(`/admin/backups/download/${filename}`, {
            responseType: 'blob'
        });
        return response.data;
    },
    deleteBackup: async (filename) => {
        const response = await api.delete(`/admin/backups/${filename}`);
        return response.data;
    },
    getGrievances: async () => {
        const response = await api.get('/admin/grievances');
        return response.data;
    },
    respondToGrievance: async (id, responseText) => {
        const response = await api.post(`/admin/grievances/${id}/respond`, { response: responseText });
        return response.data;
    },
    getLogs: async () => {
        const response = await api.get('/admin/logs');
        return response.data;
    },
    generateReport: async (reportId, filters = {}) => {
        const response = await api.post(`/admin/reports/${reportId}`, filters);
        return response.data;
    }
};

// --- Assignment Services ---
export const assignmentService = {
    getAll: async () => {
        const response = await api.get('/assignments');
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/assignments', data);
        return response.data;
    },
    updateStatus: async (id, status) => {
        const response = await api.put(`/assignments/${id}/status`, { status });
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/assignments/${id}`);
        return response.data;
    },
    getSubmissions: async (id) => {
        const response = await api.get(`/assignments/${id}/submissions`);
        return response.data;
    },
    updateStudentSubmission: async (id, studentUsn, status) => {
        const response = await api.put(`/assignments/${id}/submissions/${studentUsn}`, { status });
        return response.data;
    },
    sendReminder: async (id, studentUsn = null) => {
        const response = await api.post(`/assignments/${id}/remind`, { studentUsn });
        return response.data;
    }
};

// --- Admin Extended Services ---
export const adminExtendedService = {
    getReportData: async (type) => {
        const response = await api.get(`/admin/reports/data/${type}`);
        return response.data;
    },
    assignHod: async (department, emp_id) => {
        const response = await api.post('/admin/department/hod', { department, emp_id });
        return response.data;
    },
    // Fees Management
    getFees: async () => {
        const response = await api.get('/admin/fees');
        return response.data;
    },
    createFee: async (data) => {
        const response = await api.post('/admin/fees', data);
        return response.data;
    },
    deleteFee: async (id) => {
        const response = await api.delete(`/admin/fees/${id}`);
        return response.data;
    },
    updateFee: async (id, data) => {
        const response = await api.put(`/admin/fees/${id}`, data);
        return response.data;
    },
    toggleFeeStatus: async (id, status) => {
        const response = await api.put(`/admin/fees/${id}/toggle`, { status });
        return response.data;
    },
    // Timetable Management
    getTimetables: async () => {
        const response = await api.get('/admin/timetables');
        return response.data;
    },
    createTimetable: async (data) => {
        const response = await api.post('/admin/timetables', data);
        return response.data;
    },
    deleteTimetable: async (id) => {
        const response = await api.delete(`/admin/timetables/${id}`);
        return response.data;
    }
};
