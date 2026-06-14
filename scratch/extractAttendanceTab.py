import os

file_path = os.path.join(os.path.dirname(__file__), '../src/components/dashboard/teacher/TeacherDashboard.jsx')
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the UI block
ui_start = content.find("if (page === 'attendance') {")
ui_end = content.find("if (page === 'marks') {", ui_start)
ui_block = content[ui_start:ui_end]

# extract body
ui_body = ui_block.replace("if (page === 'attendance') {", "")
ui_body = ui_body[:ui_body.rfind('}')]

tab_code = f"""import React from 'react';
import {{ AlertTriangle, Save }} from 'lucide-react';
import {{ CH }} from '../../shared/Primitives';
import {{ DK as t }} from '../../shared/theme';

export default function AttendanceTab({{ 
  courses, ci, attDate, setAttDate, calendarMonth, setCalendarMonth, 
  courseStudents, handleSort, sortField, sortAsc, getSortedStudents, 
  handleMarkAttendance, handleToggleHoliday, holidayScope, setHolidayScope, 
  selectedHolidayCourses, setSelectedHolidayCourses, dashboardData, renderCourseTabs 
}}) {{
  {ui_body}
}}
"""

tab_path = os.path.join(os.path.dirname(__file__), '../src/components/dashboard/teacher/tabs/AttendanceTab.jsx')
with open(tab_path, 'w', encoding='utf-8') as f:
    f.write(tab_code)

print("Created AttendanceTab.jsx")

# Clean TeacherDashboard.jsx
content = content[:ui_start] + "if (page === 'attendance') return <AttendanceTab courses={courses} ci={ci} attDate={attDate} setAttDate={setAttDate} calendarMonth={calendarMonth} setCalendarMonth={setCalendarMonth} courseStudents={courseStudents} handleSort={handleSort} sortField={sortField} sortAsc={sortAsc} getSortedStudents={getSortedStudents} handleMarkAttendance={handleMarkAttendance} handleToggleHoliday={handleToggleHoliday} holidayScope={holidayScope} setHolidayScope={setHolidayScope} selectedHolidayCourses={selectedHolidayCourses} setSelectedHolidayCourses={setSelectedHolidayCourses} dashboardData={dashboardData} renderCourseTabs={renderCourseTabs} />;\n\n  " + content[ui_end:]

if "import AttendanceTab" not in content:
    import_idx = content.find("import HodHubTab")
    content = content[:import_idx] + "import AttendanceTab from './tabs/AttendanceTab';\n" + content[import_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Cleaned TeacherDashboard.jsx")
