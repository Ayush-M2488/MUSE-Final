const fs = require('fs');
const files = fs.readdirSync('dist/assets');
const jsFile = files.find(f => f.endsWith('.js'));
const code = fs.readFileSync('dist/assets/' + jsFile, 'utf8');

const regex = /(?<![a-zA-Z0-9_$])courses(?![a-zA-Z0-9_$])/g;
let match;
while ((match = regex.exec(code)) !== null) {
    const snippet = code.substring(Math.max(0, match.index - 50), Math.min(code.length, match.index + 50));
    // Filter out valid property accesses or object keys
    if (!snippet.includes('.courses') && !snippet.includes('courses:') && !snippet.includes('{courses') && !snippet.includes('"courses"') && !snippet.includes('courses,')) {
        console.log("Found isolated 'courses':", snippet);
    }
}
