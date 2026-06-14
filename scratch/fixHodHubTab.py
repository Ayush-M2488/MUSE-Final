import os

hod_file = os.path.join(os.path.dirname(__file__), 'hod_hub_block.txt')
with open(hod_file, 'r', encoding='utf-8') as f:
    hod_lines = f.readlines()

# The UI block starts at line 446 in hod_hub_block.txt (0-indexed 445: "  if (page === 'hod_hub') {\n")
# It ends at the end of the file.
ui_block_lines = hod_lines[446:] # skip the 'if (page === 'hod_hub') {'

# The last line of hod_hub_block.txt is '  }' (closing the if block)
ui_block_lines = ui_block_lines[:-2] # remove '  }' and '\n'

ui_body = "".join(ui_block_lines)

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

print("Fixed HodHubTab.jsx")
