import os
for root, dirs, files in os.walk(r'C:\Users\ayush\.gemini\antigravity\brain'):
    for f in files:
        if f == 'overview.txt':
            try:
                text = open(os.path.join(root, f), 'r', encoding='utf-8').read()
                if "export default function AdminDashboard" in text:
                    print(f'FOUND IN {root}')
            except: pass
