import { prisma } from '../backend/config/db.ts';

async function createStaticTimetable() {
    await prisma.timetable.deleteMany({});
    
    const courses = await prisma.course.findMany({
        include: {
            enrollments: { select: { faculty_emp_id: true } }
        }
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
        { start: '09:00', end: '10:00' },
        { start: '10:00', end: '11:00' },
        { start: '11:15', end: '12:15' },
        { start: '13:00', end: '14:00' },
        { start: '14:00', end: '15:00' }
    ];

    const timetableEntries: any[] = [];
    const usedSlots: Set<string> = new Set(); // To prevent double booking a room or a teacher

    for (const course of courses) {
        // Find the teacher assigned to this course (if any)
        const facultyIds = [...new Set(course.enrollments.map(e => e.faculty_emp_id).filter(id => id))];
        const facultyId = facultyIds.length > 0 ? facultyIds[0] : null;

        if (!facultyId) continue; // Skip courses with no teachers

        const semester = course.semester;
        const room = `Room ${semester}0${Math.floor(Math.random() * 5) + 1}`; // e.g. Room 801

        // Assign 3 random slots per course
        let slotsAssigned = 0;
        let attempts = 0;
        
        while (slotsAssigned < 3 && attempts < 100) {
            attempts++;
            const day = days[Math.floor(Math.random() * days.length)];
            const slot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
            
            const teacherSlotKey = `${facultyId}-${day}-${slot.start}`;
            const roomSlotKey = `${room}-${day}-${slot.start}`;
            const semSlotKey = `${semester}-${day}-${slot.start}`;

            if (!usedSlots.has(teacherSlotKey) && !usedSlots.has(roomSlotKey) && !usedSlots.has(semSlotKey)) {
                usedSlots.add(teacherSlotKey);
                usedSlots.add(roomSlotKey);
                usedSlots.add(semSlotKey);

                timetableEntries.push({
                    course_code: course.course_code,
                    faculty_emp_id: facultyId,
                    day_of_week: day,
                    start_time: slot.start,
                    end_time: slot.end,
                    room: room
                });
                slotsAssigned++;
            }
        }
    }

    if (timetableEntries.length > 0) {
        await prisma.timetable.createMany({ data: timetableEntries });
        console.log(`Created ${timetableEntries.length} static timetable slots across all semesters.`);
    } else {
        console.log("No courses with assigned teachers found.");
    }
}

createStaticTimetable()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
