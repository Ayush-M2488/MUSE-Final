import os
import re

file_path = os.path.join(os.path.dirname(__file__), '../src/components/dashboard/teacher/TeacherDashboard.jsx')
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the UI block
ui_start = content.find("if (page === 'assignments') {")
ui_end = content.find("if (page === 'grievances') {", ui_start)
ui_block = content[ui_start:ui_end]

# extract body
ui_body = ui_block.replace("if (page === 'assignments') {", "")
ui_body = ui_body[:ui_body.rfind('}')]

tab_code = f"""import React, {{ useState, useEffect }} from 'react';
import {{ Check, CheckCircle, ClipboardList, Edit2, Plus, Bell, Download, X, Paperclip, FileText, AlertTriangle, Send, Trash2 }} from 'lucide-react';
import {{ CH, Loader, Pbar }} from '../../shared/Primitives';
import {{ DK as t }} from '../../shared/theme';
import {{ assignmentService }} from '../../../../services/api';

export default function AssignmentsTab({{ dashboardData }}) {{
  const [assignments, setAssignments] = useState([]);
  const [assignTab, setAssignTab] = useState('student');
  const [assignModal, setAssignModal] = useState(false);
  const [assignData, setAssignData] = useState({{ title: '', description: '', due_date: '', priority: 'Medium', course_code: '', file_name: '', file_data: '' }});
  const [savingAssign, setSavingAssign] = useState(false);
  const [expandedAssignId, setExpandedAssignId] = useState(null);
  const [submissionsRoster, setSubmissionsRoster] = useState([]);
  const [loadingRosterId, setLoadingRosterId] = useState(null);
  const [remindingAllId, setRemindingAllId] = useState(null);
  const [remindedStudents, setRemindedStudents] = useState({{}});
  const [syncingStudentUsn, setSyncingStudentUsn] = useState(null);

  useEffect(() => {{
    const fetchAssigns = async () => {{
        try {{
            const assigns = await assignmentService.getAll();
            setAssignments(assigns);
        }} catch (err) {{
            console.error("Failed to fetch assignments", err);
        }}
    }};
    fetchAssigns();
  }}, []);

  const handleCreateAssign = async () => {{
      if (!assignData.title || !assignData.due_date || (assignTab === 'student' && !assignData.course_code)) {{
          return alert("Title, Due Date, and Course Code (for students) are required.");
      }}
      setSavingAssign(true);
      try {{
          const payload = {{ ...assignData, type: assignTab }};
          const newAssign = await assignmentService.create(payload);
          setAssignments(prev => [newAssign, ...prev]);
          setAssignModal(false);
          setAssignData({{ title: '', description: '', due_date: '', priority: 'Medium', course_code: '', file_name: '', file_data: '' }});
      }} catch (err) {{
          alert("Failed to create assignment.");
      }} finally {{
          setSavingAssign(false);
      }}
  }};

  const handleDeleteAssign = async (id) => {{
      if (!window.confirm("Are you sure you want to delete this assignment?")) return;
      try {{
          await assignmentService.delete(id);
          setAssignments(prev => prev.filter(a => a.id !== id));
          if (expandedAssignId === id) {{
              setExpandedAssignId(null);
              setSubmissionsRoster([]);
          }}
      }} catch (err) {{
          alert("Failed to delete assignment.");
      }}
  }};

  const handleViewSubmissions = async (id) => {{
      if (expandedAssignId === id) {{
          setExpandedAssignId(null);
          return;
      }}
      setExpandedAssignId(id);
      setLoadingRosterId(id);
      try {{
          const roster = await assignmentService.getSubmissionsRoster(id);
          setSubmissionsRoster(roster);
      }} catch (err) {{
          alert("Failed to load submissions roster.");
          setExpandedAssignId(null);
      }} finally {{
          setLoadingRosterId(null);
      }}
  }};

  const handleSyncSingleMarks = async (assignmentId, usn) => {{
      setSyncingStudentUsn(usn);
      try {{
          await assignmentService.syncMarksToCourse(assignmentId, [usn]);
          const roster = await assignmentService.getSubmissionsRoster(assignmentId);
          setSubmissionsRoster(roster);
          alert(`Marks synced successfully for ${{usn}}!`);
      }} catch (err) {{
          alert("Failed to sync marks for student.");
      }} finally {{
          setSyncingStudentUsn(null);
      }}
  }};

  const handleSyncAllMarks = async (assignmentId) => {{
      const evaluatedStudents = submissionsRoster.filter(s => s.status === 'Evaluated');
      if (evaluatedStudents.length === 0) return alert("No evaluated students to sync.");
      
      if (!window.confirm(`Sync marks for ${{evaluatedStudents.length}} evaluated students to the Dashboard?`)) return;
      
      try {{
          const usns = evaluatedStudents.map(s => s.usn);
          await assignmentService.syncMarksToCourse(assignmentId, usns);
          const roster = await assignmentService.getSubmissionsRoster(assignmentId);
          setSubmissionsRoster(roster);
          alert("All evaluated marks synced successfully!");
      }} catch (err) {{
          alert("Failed to sync all marks.");
      }}
  }};

  const handleRemindSingle = async (assignmentId, usn) => {{
      try {{
          await assignmentService.sendReminder(assignmentId, [usn]);
          setRemindedStudents(prev => ({{ ...prev, [usn]: true }}));
      }} catch (err) {{
          alert("Failed to send reminder.");
      }}
  }};

  const handleRemindAll = async (assignmentId) => {{
      const pendingStudents = submissionsRoster.filter(s => s.status === 'Pending' || s.status === 'Overdue');
      if (pendingStudents.length === 0) return alert("No pending students to remind.");

      setRemindingAllId(assignmentId);
      try {{
          const usns = pendingStudents.map(s => s.usn);
          await assignmentService.sendReminder(assignmentId, usns);
          const newReminded = {{ ...remindedStudents }};
          usns.forEach(u => newReminded[u] = true);
          setRemindedStudents(newReminded);
          alert(`Reminders sent to ${{usns.length}} students!`);
      }} catch (err) {{
          alert("Failed to send bulk reminders.");
      }} finally {{
          setRemindingAllId(null);
      }}
  }};

  {ui_body}
}}
"""

tab_path = os.path.join(os.path.dirname(__file__), '../src/components/dashboard/teacher/tabs/AssignmentsTab.jsx')
with open(tab_path, 'w', encoding='utf-8') as f:
    f.write(tab_code)
print("Created AssignmentsTab.jsx")

# Clean TeacherDashboard.jsx
content = content[:ui_start] + "if (page === 'assignments') return <AssignmentsTab dashboardData={dashboardData} />;\n\n  " + content[ui_end:]

# Remove assignments states from TeacherDashboard.jsx
states_to_remove = [
  'assignments',
  'assignTab',
  'assignModal',
  'assignData',
  'savingAssign',
  'expandedAssignId',
  'submissionsRoster',
  'loadingRosterId',
  'remindingAllId',
  'remindedStudents',
  'syncingStudentUsn'
]

for state in states_to_remove:
    content = re.sub(r"\s*const \[" + state + r".*\] = useState\(.*\);", "", content)

# Remove assignments from fetchDashboard
content = re.sub(r"\s*const assigns = await assignmentService\.getAll\(\);\s*setAssignments\(assigns\);", "", content)

# Remove handlers
for handler in ['handleCreateAssign', 'handleDeleteAssign', 'handleViewSubmissions', 'handleSyncSingleMarks', 'handleSyncAllMarks', 'handleRemindSingle', 'handleRemindAll']:
    # finding from const handleName = to the next empty line or };
    # A simple regex for removing the whole function block safely
    content = re.sub(r"\s*const " + handler + r" = async \([^\)]*\) => \{[\s\S]*?\n\s*\};", "", content)

if "import AssignmentsTab" not in content:
    import_idx = content.find("import AttendanceTab")
    content = content[:import_idx] + "import AssignmentsTab from './tabs/AssignmentsTab';\n" + content[import_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Cleaned TeacherDashboard.jsx")
