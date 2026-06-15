const fs = require('fs');
const files = fs.readdirSync('dist/assets');
const jsFile = files.find(f => f.endsWith('.js') && f.startsWith('index'));
const code = fs.readFileSync('dist/assets/' + jsFile, 'utf8');

const regex = /(?<![a-zA-Z0-9_$])courses(?![a-zA-Z0-9_$])/g;
let match;
let found = false;
while ((match = regex.exec(code)) !== null) {
    const snippet = code.substring(Math.max(0, match.index - 50), Math.min(code.length, match.index + 50));
    
    // Ignore valid property accesses like `this.courses`, `d.courses`, `{courses:`
    if (!snippet.includes('.courses') && !snippet.includes('courses:') && !snippet.includes('{courses') && !snippet.includes('"courses"') && !snippet.includes("courses'") && !snippet.includes('courses,')) {
        console.log("Isolated 'courses' found!");
        console.log("Snippet:", snippet);
        console.log("Line number (approx):", code.substring(0, match.index).split('\n').length);
        found = true;
    }
}
if (!found) console.log("No isolated courses found.");
