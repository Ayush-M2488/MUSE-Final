import os

file_path = os.path.join(os.path.dirname(__file__), '../src/components/dashboard/teacher/TeacherDashboard.jsx')
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

round_balance = 0
curly_balance = 0
square_balance = 0

for i, char in enumerate(content):
    if char == '(':
        round_balance += 1
    elif char == ')':
        round_balance -= 1
    elif char == '{':
        curly_balance += 1
    elif char == '}':
        curly_balance -= 1
    elif char == '[':
        square_balance += 1
    elif char == ']':
        square_balance -= 1

print(f"( : {round_balance}")
print(f"{{ : {curly_balance}")
print(f"[ : {square_balance}")
