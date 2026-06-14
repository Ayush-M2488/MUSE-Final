import os

file_path = os.path.join(os.path.dirname(__file__), '../src/components/dashboard/teacher/TeacherDashboard.jsx')
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = "if (page === 'mentees') {"
end_marker = "if (page === 'hod_hub') {"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + "if (page === 'mentees') return <MenteesTab />;\n\n  " + content[end_idx:]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully replaced mentees tab logic.")
else:
    print("Failed to find markers.")
