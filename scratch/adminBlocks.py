import os

file_path = os.path.join(os.path.dirname(__file__), '../src/components/dashboard/admin/AdminDashboard.jsx')
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "if (page === " in line:
        print(f"{i}: {line.strip()}")
