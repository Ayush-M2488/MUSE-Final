import os

file_path = r'c:\Users\ayush\Desktop\final year draft1\src\components\dashboard\admin\AdminDashboard.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
for i, line in enumerate(lines):
    if "if (page === 'courses') {" in line:
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
import {{ Plus, X, Edit2, Trash2 }} from 'lucide-react';
import {{ LT }} from '../../shared/theme';
import {{ adminService }} from '../../../services/api';

const Card = ({{ children, style }}) => (
    <div className="card-lt" style={{style}}>
        {{children}}
    </div>
);

export default function CoursesTab({{ 
    t, setPage, 
    coursesFilter, setCoursesFilter, 
    courseSearch, setCourseSearch, 
    allCourses, setAllCourses, 
    users 
}}) {{
{block.replace("if (page === 'courses') {", "").rstrip()[:-1]}
}}
"""
        os.makedirs(r'c:\Users\ayush\Desktop\final year draft1\src\components\dashboard\admin\tabs', exist_ok=True)
        with open(r'c:\Users\ayush\Desktop\final year draft1\src\components\dashboard\admin\tabs\CoursesTab.jsx', 'w', encoding='utf-8') as f:
            f.write(component_content)
        print("CoursesTab.jsx created.")

        # Now remove it from AdminDashboard and replace with component
        replacement = f"    if (page === 'courses') {{\n        return <CoursesTab \n            t={{t}} setPage={{setPage}}\n            coursesFilter={{coursesFilter}} setCoursesFilter={{setCoursesFilter}}\n            courseSearch={{courseSearch}} setCourseSearch={{setCourseSearch}}\n            allCourses={{allCourses}} setAllCourses={{setAllCourses}}\n            users={{users}}\n        />;\n    }}\n"
        new_lines = lines[:start_idx] + [replacement] + lines[end_idx+1:]
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print("AdminDashboard.jsx updated.")
