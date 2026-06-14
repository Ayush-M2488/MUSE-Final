import re
text = open(r'c:\Users\ayush\Desktop\final year draft1\src\components\dashboard\admin\AdminDashboard.jsx', 'r', encoding='utf-8').read()
lines = text.split('\n')
for i, line in enumerate(lines):
    if 'setUsers' in line or 'getUsers' in line:
        print(f'{i+1}: {line}')
