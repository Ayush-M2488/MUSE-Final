import os
import re

file_path = os.path.join(os.path.dirname(__file__), '../src/components/dashboard/teacher/TeacherDashboard.jsx')
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the UI block
ui_start = content.find("if (page === 'hod_hub') {")
ui_end = content.find("if (page === 'attendance') {", ui_start)
ui_block = content[ui_start:ui_end]

# Remove 'if (page === 'hod_hub') {' and '}' from the UI block to make it a component body
# Wait, inside the block, there's `if (loadingHod) return ...` and `return (<> ... </>)`
ui_body = ui_block.replace("if (page === 'hod_hub') {", "")
ui_body = ui_body[:ui_body.rfind('}')]

# Construct HodHubTab.jsx
tab_code = f"""import React, {{ useState, useEffect }} from 'react';
import {{ Users, AlertTriangle, Download, X }} from 'lucide-react';
import {{ CH, KPI, Loader }} from '../../shared/Primitives';
import {{ DK as t }} from '../../shared/theme';
import {{ teacherService }} from '../../../../services/api';

export default function HodHubTab() {{
  const [hodData, setHodData] = useState(null);
  const [hodStudents, setHodStudents] = useState([]);
  const [loadingHod, setLoadingHod] = useState(false);
  const [hodFacultyModal, setHodFacultyModal] = useState(false);
  const [hodFacultyDetails, setHodFacultyDetails] = useState(null);
  const [hodLoadingFaculty, setHodLoadingFaculty] = useState(false);
  const [hodSortConfig, setHodSortConfig] = useState({{ key: 'usn', direction: 'asc' }});

  useEffect(() => {{
    const fetchHod = async () => {{
        setLoadingHod(true);
        try {{
            const [hub, studs] = await Promise.all([
                teacherService.getDepartmentHub(),
                teacherService.getDepartmentStudents()
            ]);
            setHodData(hub);
            setHodStudents(studs);
        }} catch (err) {{
            console.error("Failed to fetch HOD data", err);
        }} finally {{
            setLoadingHod(false);
        }}
    }};
    fetchHod();
  }}, []);

  const handleViewFaculty = async (emp_id) => {{
    setHodFacultyModal(true);
    setHodLoadingFaculty(true);
    try {{
        const details = await teacherService.getDepartmentFacultyDetails(emp_id);
        setHodFacultyDetails(details);
    }} catch (err) {{
        console.error("Failed to load faculty details", err);
    }} finally {{
        setHodLoadingFaculty(false);
    }}
  }};

  const handleExportCSV = () => {{
    if (!hodData || hodStudents.length === 0) return;
    const header = "USN,Name,Semester,CGPA,Risk Level\\n";
    const rows = hodStudents.map(s => `"${{s.usn}}","${{s.name}}",${{s.semester}},${{s.cgpa}},"${{s.risk}}"`).join("\\n");
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(header + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `Department_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }};

  {ui_body}
}}
"""

tab_path = os.path.join(os.path.dirname(__file__), '../src/components/dashboard/teacher/tabs/HodHubTab.jsx')
with open(tab_path, 'w', encoding='utf-8') as f:
    f.write(tab_code)

print("Created HodHubTab.jsx")

# Now clean up TeacherDashboard.jsx
# 1. Remove states
for state in ['hodData', 'hodStudents', 'loadingHod', 'hodFacultyModal', 'hodFacultyDetails', 'hodLoadingFaculty', 'hodSortConfig']:
    content = re.sub(r"\s*const \[" + state + r".*\] = useState\(.*\);", "", content)

# 2. Remove handlers
handler_start = content.find('const handleViewFaculty = async')
handler_end = content.find('const handleToggleHoliday = async')
if handler_start != -1 and handler_end != -1:
    content = content[:handler_start] + content[handler_end:]

# 3. Replace UI block
ui_start = content.find("if (page === 'hod_hub') {")
ui_end = content.find("if (page === 'attendance') {", ui_start)
if ui_start != -1 and ui_end != -1:
    content = content[:ui_start] + "if (page === 'hod_hub') return <HodHubTab />;\n\n  " + content[ui_end:]

# 4. Add import
if "import HodHubTab" not in content:
    import_idx = content.find("import MenteesTab")
    content = content[:import_idx] + "import HodHubTab from './tabs/HodHubTab';\n" + content[import_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Cleaned TeacherDashboard.jsx")
