const fs = require('fs');

const content = fs.readFileSync('src/components/dashboard/admin/AdminDashboard.jsx', 'utf8');
const lines = content.split('\n');

const start = lines.findIndex(l => l.includes("if (page === 'analytics')"));
if (start === -1) process.exit(1);

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

const replacement = `    if (page === 'analytics')
        return (
            <AdminAnalyticsTab
                roleDist={roleDist} deptCapacity={deptCapacity} riskDist={riskDist}
                deptRisk={deptRisk} attTrend={attTrend} t={t}
            />
        );`;

lines.splice(start, end - start + 1, replacement);

let finalContent = lines.join('\n');
if (!finalContent.includes("import AdminAnalyticsTab")) {
    finalContent = finalContent.replace(
        "import UserManagementTab from './UserManagementTab';",
        "import UserManagementTab from './UserManagementTab';\nimport AdminAnalyticsTab from './AdminAnalyticsTab';"
    );
}

fs.writeFileSync('src/components/dashboard/admin/AdminDashboard.jsx', finalContent);
console.log("Replaced analytics tab successfully.");
