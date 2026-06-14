import json
import sys

with open(r'C:\Users\ayush\.gemini\antigravity\brain\00e2c141-9ba2-4b47-b000-aef87b38710c\.system_generated\logs\overview.txt', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('getFees')
if idx != -1:
    print('FOUND IT!')
    start = max(0, idx - 500)
    end = min(len(text), idx + 2000)
    print(text[start:end])
else:
    print('Not found')
