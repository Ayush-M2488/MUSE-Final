import React from 'react';
import { CH } from '../../shared/Primitives';

export default function FeesTab({ d, C }) {
    const formattedCommonDate = d.globalConfig?.feeDueDate 
        ? new Date(d.globalConfig.feeDueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
        : null;

    return (
        <C>
            <CH 
                title="Fee Details" 
                sub={formattedCommonDate ? `Current Semester · Common Due Date: ${formattedCommonDate}` : "Current Semester"} 
                dk 
            />
            <table className="tbl tbl-dk">
                <thead>
                    <tr>
                        <th>Semester</th>
                        <th>Amount Due</th>
                        <th>Amount Paid</th>
                        <th>Status</th>
                        <th>Due Date</th>
                    </tr>
                </thead>
                <tbody>
                    {d.feesList?.map((f) => {
                        const rowDueDate = d.globalConfig?.feeDueDate 
                            ? new Date(d.globalConfig.feeDueDate).toLocaleDateString()
                            : (f.due_date ? new Date(f.due_date).toLocaleDateString() : 'N/A');

                        return (
                            <tr key={f.id}>
                                <td>{f.semester}</td>
                                <td>₹{f.amount_due}</td>
                                <td>₹{f.amount_paid}</td>
                                <td><span className={`b ${f.status === 'Clear' ? 'bSub' : 'bH'}`}>{f.status}</span></td>
                                <td>{rowDueDate}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </C>
    );
}
