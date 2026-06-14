import os
import re

file_path = os.path.join(os.path.dirname(__file__), '../src/components/dashboard/teacher/TeacherDashboard.jsx')
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove all states related to mentees
to_remove = [
    r'\s*const \[mentees, setMentees\] = useState\(\[\]\);',
    r'\s*const \[loadingMentees, setLoadingMentees\] = useState\(false\);',
    r'\s*const \[activeMentee, setActiveMentee\] = useState\(null\);',
    r'\s*const \[menteeMessages, setMenteeMessages\] = useState\(\[\]\);',
    r'\s*const \[menteeNewMessage, setMenteeNewMessage\] = useState\(\"\"\);',
    r'\s*const \[menteeNewFile, setMenteeNewFile\] = useState\(null\);',
    r'\s*const messagesEndRef = React\.useRef\(null\);'
]

for pattern in to_remove:
    content = re.sub(pattern, '', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Removed states.')
