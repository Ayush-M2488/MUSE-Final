const fs = require('fs');

const content = fs.readFileSync('src/components/dashboard/admin/AdminDashboard.jsx', 'utf8');
const lines = content.split('\n');

const start = lines.findIndex(l => l.includes("if (page === 'users')"));
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

const replacement = `    if (page === 'users')
        return (
            <UserManagementTab
                modal={modal} setModal={setModal} bulkModal={bulkModal} setBulkModal={setBulkModal}
                csvRows={csvRows} setCsvRows={setCsvRows} bulkImporting={bulkImporting}
                bulkFeedback={bulkFeedback} nu={nu} setNu={setNu} userFilters={userFilters}
                setUserFilters={setUserFilters} filteredUsers={filteredUsers} allCourses={allCourses}
                addUser={addUser} delUser={delUser} toggleStatus={toggleStatus}
                handleCsvFile={handleCsvFile} downloadTemplate={downloadTemplate}
                submitBulkUsers={submitBulkUsers} t={t}
            />
        );`;

lines.splice(start, end - start + 1, replacement);

let finalContent = lines.join('\n');
if (!finalContent.includes("import UserManagementTab")) {
    finalContent = finalContent.replace(
        "import { interventionService, adminService, adminExtendedService } from '../../../services/api';",
        "import { interventionService, adminService, adminExtendedService } from '../../../services/api';\nimport UserManagementTab from './UserManagementTab';"
    );
}

fs.writeFileSync('src/components/dashboard/admin/AdminDashboard.jsx', finalContent);
console.log("Replaced user tab successfully.");
