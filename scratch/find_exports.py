import re
text = open(r'c:\Users\ayush\Desktop\final year draft1\backend\controllers\adminController.ts', 'r', encoding='utf-8').read()
exports = re.findall(r'export const (\w+)', text)
print(exports)
