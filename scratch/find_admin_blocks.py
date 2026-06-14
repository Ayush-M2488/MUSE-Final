import re

with open(r'c:\Users\ayush\Desktop\final year draft1\src\components\dashboard\admin\AdminDashboard.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "if (page ===" in line or "if (page ==" in line:
        print(f'{i+1}: {line.strip()}')
