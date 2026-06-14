import os

file_path = r'c:\Users\ayush\Desktop\final year draft1\src\components\dashboard\admin\AdminDashboard.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
for i, line in enumerate(lines):
    if "if (page === 'logs')" in line and i > 500:
        start_idx = i
        break

if start_idx != -1:
    open_parens = 0
    end_idx = -1
    for i in range(start_idx+1, len(lines)):
        open_parens += lines[i].count('(')
        open_parens -= lines[i].count(')')
        if open_parens == 0 and lines[i].strip() == ');':
            end_idx = i
            break

    if end_idx != -1:
        block = ''.join(lines[start_idx:end_idx+1])
        print(f"Found block from {start_idx+1} to {end_idx+1}")
        # Create the new component file
        component_content = f"""import React from 'react';
import {{ CH, Loader }} from '../../shared/Primitives';
import {{ LT }} from '../../shared/theme';

const Card = ({{ children, style }}) => (
    <div className="card-lt" style={{style}}>
        {{children}}
    </div>
);

export default function LogsTab({{ 
    t, setPage, auditLogs, loadingLogs 
}}) {{
{block.replace("if (page === 'logs')", "").replace("return (", "return (", 1)}
}}
"""
        os.makedirs(r'c:\Users\ayush\Desktop\final year draft1\src\components\dashboard\admin\tabs', exist_ok=True)
        with open(r'c:\Users\ayush\Desktop\final year draft1\src\components\dashboard\admin\tabs\LogsTab.jsx', 'w', encoding='utf-8') as f:
            f.write(component_content)
        print("LogsTab.jsx created.")

        # Now remove it from AdminDashboard and replace with component
        replacement = f"    if (page === 'logs') {{\n        return <LogsTab \n            t={{t}} setPage={{setPage}}\n            auditLogs={{auditLogs}} loadingLogs={{loadingLogs}}\n        />;\n    }}\n"
        new_lines = lines[:start_idx] + [replacement] + lines[end_idx+1:]
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print("AdminDashboard.jsx updated.")
    else:
        print("Could not find end of block")
