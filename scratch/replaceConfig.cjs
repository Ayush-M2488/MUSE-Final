const fs = require('fs');

const content = fs.readFileSync('src/components/dashboard/admin/AdminDashboard.jsx', 'utf8');
const lines = content.split('\n');

const start = lines.findIndex(l => l.includes("if (page === 'config')"));
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

const replacement = `    if (page === 'config')
        return (
            <SystemSettingsTab
                cfg={cfg} setCfg={setCfg} configTab={configTab} setConfigTab={setConfigTab}
                cfgSaved={cfgSaved} setCfgSaved={setCfgSaved} backupList={backupList}
                backingUp={backingUp} handleTriggerBackup={handleTriggerBackup}
                handleDownloadBackup={handleDownloadBackup} handleDeleteBackup={handleDeleteBackup} t={t}
            />
        );`;

lines.splice(start, end - start + 1, replacement);

let finalContent = lines.join('\n');
if (!finalContent.includes("import SystemSettingsTab")) {
    finalContent = finalContent.replace(
        "import AdminAnalyticsTab from './AdminAnalyticsTab';",
        "import AdminAnalyticsTab from './AdminAnalyticsTab';\nimport SystemSettingsTab from './SystemSettingsTab';"
    );
}

fs.writeFileSync('src/components/dashboard/admin/AdminDashboard.jsx', finalContent);
console.log("Replaced config tab successfully.");
