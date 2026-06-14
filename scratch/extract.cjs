const fs = require('fs');
const content = fs.readFileSync('src/components/dashboard/admin/AdminDashboard.jsx', 'utf8');
const lines = content.split('\n');

const extractBlock = (pageName) => {
    let start = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(`if (page === '${pageName}')`) && lines[i+1].includes('return')) {
            start = i;
            break;
        }
    }
    if (start === -1) return null;
    let end = -1;
    let braces = 0;
    for (let i = start; i < lines.length; i++) {
        braces += (lines[i].match(/\{/g) || []).length;
        braces -= (lines[i].match(/\}/g) || []).length;
        braces += (lines[i].match(/\(/g) || []).length;
        braces -= (lines[i].match(/\)/g) || []).length;
        if (braces <= 0 && lines[i].includes(');')) {
            end = i;
            break;
        }
    }
    return { start, end, lines: lines.slice(start, end + 1).join('\n') };
};

const usersBlock = extractBlock("users");
const systemBlock = extractBlock("system");
const analyticsBlock = extractBlock("analytics");
const configBlock = extractBlock("config");

if (usersBlock) fs.writeFileSync('scratch/users.txt', usersBlock.lines);
if (systemBlock) fs.writeFileSync('scratch/system.txt', systemBlock.lines);
if (analyticsBlock) fs.writeFileSync('scratch/analytics.txt', analyticsBlock.lines);
if (configBlock) fs.writeFileSync('scratch/config.txt', configBlock.lines);

console.log({
    users: usersBlock ? [usersBlock.start, usersBlock.end] : null,
    system: systemBlock ? [systemBlock.start, systemBlock.end] : null,
    analytics: analyticsBlock ? [analyticsBlock.start, analyticsBlock.end] : null,
    config: configBlock ? [configBlock.start, configBlock.end] : null
});
