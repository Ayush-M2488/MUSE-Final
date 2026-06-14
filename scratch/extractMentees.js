const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/dashboard/teacher/TeacherDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// We will extract the page === 'mentees' block.
// Find 'if (page === \'mentees\') {'
const startIndex = content.indexOf('if (page === \'mentees\') {');
const endIndex = content.indexOf('if (page === \'hod_hub\') {');

const menteesBlock = content.substring(startIndex, endIndex);
console.log('Extracted Mentees Block Length:', menteesBlock.length);
