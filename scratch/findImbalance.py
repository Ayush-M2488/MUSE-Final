import os

file_path = os.path.join(os.path.dirname(__file__), '../src/components/dashboard/teacher/TeacherDashboard.jsx')
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

round_b = 0
curly_b = 0
for i, line in enumerate(lines):
    for char in line:
        if char == '(':
            round_b += 1
        elif char == ')':
            round_b -= 1
        elif char == '{':
            curly_b += 1
        elif char == '}':
            curly_b -= 1
    if round_b < 0 or curly_b < 0:
        print(f"Line {i+1} has imbalance: ()={round_b}, {{}}={curly_b}")
        # don't break, keep going to show the shape of it

print(f"Final ()={round_b}, {{}}={curly_b}")
