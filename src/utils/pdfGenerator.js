import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Reusable Header function
const addHeader = (doc, title, studentData) => {
    const isLandscape = doc.internal.pageSize.getWidth() > 220;
    const rightMargin = isLandscape ? 283 : 196;

    // Muse University Branding
    doc.setFontSize(22);
    doc.setTextColor(30, 64, 175); // A nice blue
    doc.text("MUSE University", 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text(title, 14, 30);
    
    // Student Info
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Name: ${studentData.name || 'N/A'}`, 14, 40);
    doc.text(`USN: ${studentData.usn || 'N/A'}`, 14, 46);
    doc.text(`Program: ${studentData.program || 'N/A'}`, 14, 52);
    doc.text(`Semester: ${studentData.semester || 'N/A'}`, 14, 58);
    
    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 62, rightMargin, 62);
    
    return 70; // Return the Y coordinate to start the table
};

export const generateMarksheetPDF = (d) => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const startY = addHeader(doc, "Official Academic Marksheet (Internal & External Assessments)", d);
    
    const tableData = (d.subjects || []).map(s => [
        s.code || 'N/A',
        s.name || 'N/A',
        s.ia1 !== null && s.ia1 !== undefined ? s.ia1 : '-',
        s.ia2 !== null && s.ia2 !== undefined ? s.ia2 : '-',
        s.ia3 !== null && s.ia3 !== undefined ? s.ia3 : '-',
        s.ia_avg !== null && s.ia_avg !== undefined ? s.ia_avg : '-',
        s.practical !== null && s.practical !== undefined ? s.practical : '-',
        s.internal_total !== null && s.internal_total !== undefined ? s.internal_total : '-',
        s.finalExam !== null && s.finalExam !== undefined ? s.finalExam : '-',
        s.overall_total !== null && s.overall_total !== undefined ? s.overall_total : '-'
    ]);
    
    autoTable(doc, {
        startY: startY,
        head: [['Code', 'Course Name', 'IA-1', 'IA-2', 'IA-3', 'Avg IA', 'Practical', 'Int Total', 'Final Exam', 'Overall']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [30, 64, 175] },
        styles: { fontSize: 9 }
    });
    
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(`Current CGPA: ${d.cgpa || 'N/A'}`, 14, doc.lastAutoTable.finalY + 15);
    
    doc.save(`muse_marksheet_${d.usn || 'student'}.pdf`);
};

export const generateAttendancePDF = (d) => {
    const doc = new jsPDF();
    const startY = addHeader(doc, "Attendance Report", d);
    
    const tableData = (d.subjects || []).map(s => [
        s.code || 'N/A',
        s.name || 'N/A',
        `${s.att || 0}%`
    ]);
    
    autoTable(doc, {
        startY: startY,
        head: [['Course Code', 'Course Name', 'Attendance %']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [30, 64, 175] },
        styles: { fontSize: 10 }
    });
    
    doc.setFontSize(10);
    doc.text(`Overall Attendance: ${d.attendance || 0}%`, 14, doc.lastAutoTable.finalY + 15);
    
    doc.save(`muse_attendance_${d.usn || 'student'}.pdf`);
};

export const generateFeeReceiptPDF = (d) => {
    const doc = new jsPDF();
    const startY = addHeader(doc, "Fee Receipt & Statement", d);
    
    const tableData = (d.feesList || []).map(f => [
        f.id || 'N/A',
        f.amount ? `Rs. ${f.amount}` : 'N/A',
        f.due_date ? new Date(f.due_date).toLocaleDateString() : 'N/A',
        f.status || 'Pending'
    ]);
    
    autoTable(doc, {
        startY: startY,
        head: [['Transaction/Fee ID', 'Amount', 'Due Date', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [30, 64, 175] },
        styles: { fontSize: 10 }
    });
    
    doc.setFontSize(10);
    doc.text(`Current Fee Status: ${d.fees || 'Unknown'}`, 14, doc.lastAutoTable.finalY + 15);
    
    doc.save(`muse_fees_${d.usn || 'student'}.pdf`);
};
