import os

file_path = os.path.join(os.path.dirname(__file__), '../src/components/dashboard/teacher/TeacherDashboard.jsx')
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "if (page === 'mentees') {" in line:
        start_idx = i
    if "if (page === 'hod_hub') {" in line:
        end_idx = i

if start_idx != -1 and end_idx != -1 and start_idx < end_idx:
    new_lines = lines[:start_idx] + ["  if (page === 'mentees') return <MenteesTab />;\n\n"] + lines[end_idx:]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print(f"Replaced lines {start_idx} to {end_idx - 1}")
else:
    print(f"Failed to find markers. Start: {start_idx}, End: {end_idx}")
