import os

file_path = r'c:\Users\ayush\Desktop\final year draft1\src\components\dashboard\admin\AdminDashboard.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
for i, line in enumerate(lines):
    if "if (page === 'fees')" in line:
        start_idx = i
        break

if start_idx != -1:
    open_parens = 0
    end_idx = -1
    for i in range(start_idx+1, len(lines)):
        open_parens += lines[i].count('(')
        open_parens -= lines[i].count(')')
        if open_parens == 0 and lines[i].strip() == ');':
            end_idx = i
            break

    if end_idx != -1:
        block = ''.join(lines[start_idx:end_idx+1])
        print(f"Found block from {start_idx+1} to {end_idx+1}")
        # Create the new component file
        component_content = f"""import React from 'react';
import {{ CH, Loader }} from '../../shared/Primitives';
import {{ Edit2, CheckCircle, Search, AlertTriangle, X, Upload, Plus, Trash2 }} from 'lucide-react';
import {{ LT }} from '../../shared/theme';
import {{ adminService }} from '../../../services/api';

const Card = ({{ children, style }}) => (
    <div className="card-lt" style={{style}}>
        {{children}}
    </div>
);

export default function FeesTab({{ 
    t, setPage, fees, setFees, feeSearch, setFeeSearch, 
    feeSortOrder, setFeeSortOrder, feeSortCol, setFeeSortCol,
    processFeeModal, setProcessFeeModal, feeModalOpen, setFeeModalOpen,
    feeForm, setFeeForm, feeEditMode, setFeeEditMode, 
    submittingFee, setSubmittingFee, handleSaveFee, handleDeleteFee
}}) {{
{block.replace("if (page === 'fees')", "").replace("return (", "return (", 1)}
}}
"""
        os.makedirs(r'c:\Users\ayush\Desktop\final year draft1\src\components\dashboard\admin\tabs', exist_ok=True)
        with open(r'c:\Users\ayush\Desktop\final year draft1\src\components\dashboard\admin\tabs\FeesTab.jsx', 'w', encoding='utf-8') as f:
            f.write(component_content)
        print("FeesTab.jsx created.")

        # Now remove it from AdminDashboard and replace with component
        replacement = f"    if (page === 'fees') {{\n        return <FeesTab \n            t={{t}} setPage={{setPage}} fees={{fees}} setFees={{setFees}} feeSearch={{feeSearch}} setFeeSearch={{setFeeSearch}}\n            feeSortOrder={{feeSortOrder}} setFeeSortOrder={{setFeeSortOrder}} feeSortCol={{feeSortCol}} setFeeSortCol={{setFeeSortCol}}\n            processFeeModal={{processFeeModal}} setProcessFeeModal={{setProcessFeeModal}} feeModalOpen={{feeModalOpen}} setFeeModalOpen={{setFeeModalOpen}}\n            feeForm={{feeForm}} setFeeForm={{setFeeForm}} feeEditMode={{feeEditMode}} setFeeEditMode={{setFeeEditMode}}\n            submittingFee={{submittingFee}} setSubmittingFee={{setSubmittingFee}} handleSaveFee={{handleSaveFee}} handleDeleteFee={{handleDeleteFee}}\n        />;\n    }}\n"
        new_lines = lines[:start_idx] + [replacement] + lines[end_idx+1:]
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print("AdminDashboard.jsx updated.")
    else:
        print("Could not find end of block")
