import os

file_path = os.path.join(os.path.dirname(__file__), '../src/components/dashboard/teacher/TeacherDashboard.jsx')
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = "if (page === 'hod_hub') {"
end_marker = "if (page === 'attendance') {"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    block = content[start_idx:end_idx]
    with open(os.path.join(os.path.dirname(__file__), 'hod_hub_block.txt'), 'w', encoding='utf-8') as f:
        f.write(block)
    print("Extracted hod_hub block.")
else:
    print("Failed to find markers.")
