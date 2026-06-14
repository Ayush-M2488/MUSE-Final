import os

hod_file = os.path.join(os.path.dirname(__file__), 'hod_hub_block.txt')
with open(hod_file, 'r', encoding='utf-8') as f:
    hod_lines = f.readlines()

# Lines 48 to 445 (0-indexed 47 to 444)
handlers_to_restore = "".join(hod_lines[47:444])

dash_file = os.path.join(os.path.dirname(__file__), '../src/components/dashboard/teacher/TeacherDashboard.jsx')
with open(dash_file, 'r', encoding='utf-8') as f:
    content = f.read()

bad_block = "  useEffect(() => {\n    if (page === 'hod_hub') return <HodHubTab />;"
replacement = handlers_to_restore + "\n  if (page === 'hod_hub') return <HodHubTab />;"

if bad_block in content:
    new_content = content.replace(bad_block, replacement)
    with open(dash_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully restored handlers!")
else:
    print("Could not find bad block!")
