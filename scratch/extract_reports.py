import os

file_path = r'c:\Users\ayush\Desktop\final year draft1\src\components\dashboard\admin\AdminDashboard.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
for i, line in enumerate(lines):
    if "if (page === 'reports') {" in line:
        start_idx = i
        break

if start_idx != -1:
    open_braces = 0
    end_idx = -1
    for i in range(start_idx, len(lines)):
        open_braces += lines[i].count('{')
        open_braces -= lines[i].count('}')
        if open_braces == 0:
            end_idx = i
            break

    if end_idx != -1:
        block = ''.join(lines[start_idx:end_idx+1])
        print(f"Found block from {start_idx+1} to {end_idx+1}")
        # Create the new component file
        component_content = f"""import React from 'react';
import {{ CH, Loader }} from '../../shared/Primitives';
import {{ FileText, Download }} from 'lucide-react';
import {{ LT }} from '../../shared/theme';

const Card = ({{ children, style }}) => (
    <div className="card-lt" style={{style}}>
        {{children}}
    </div>
);

export default function ReportsTab({{ 
    t, cfg, setPage, 
    reportConfig, setReportConfig, handleGenerateReport, loadingReport
}}) {{
{block.replace("if (page === 'reports') {", "").rstrip()[:-1]}
}}
"""
        os.makedirs(r'c:\Users\ayush\Desktop\final year draft1\src\components\dashboard\admin\tabs', exist_ok=True)
        with open(r'c:\Users\ayush\Desktop\final year draft1\src\components\dashboard\admin\tabs\ReportsTab.jsx', 'w', encoding='utf-8') as f:
            f.write(component_content)
        print("ReportsTab.jsx created.")

        # Now remove it from AdminDashboard and replace with component
        replacement = f"    if (page === 'reports') {{\n        return <ReportsTab \n            t={{t}} cfg={{cfg}} setPage={{setPage}}\n            reportConfig={{reportConfig}} setReportConfig={{setReportConfig}}\n            handleGenerateReport={{handleGenerateReport}} loadingReport={{loadingReport}}\n        />;\n    }}\n"
        new_lines = lines[:start_idx] + [replacement] + lines[end_idx+1:]
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print("AdminDashboard.jsx updated.")
