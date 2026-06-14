import os

file_path = os.path.join(os.path.dirname(__file__), '../src/components/dashboard/teacher/TeacherDashboard.jsx')
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

del lines[247:320]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print('Cleaned duplicate effect block')
