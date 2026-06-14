import React from 'react';
import { CH, Loader } from '../../shared/Primitives';
import { Edit2, CheckCircle, Search, AlertTriangle, X, Upload, Plus, Trash2 } from 'lucide-react';
import { LT } from '../../shared/theme';
import { adminService, adminExtendedService } from '../../../../services/api';

const Card = ({ children, style }) => (
    <div className="card-lt" style={style}>
        {children}
    </div>
);

export default function FeesTab({ t, setPage, fees, setFees, cfg, setCfg }) {
    const [feeSortKey, setFeeSortKey] = React.useState('usn');
    const [feeSortOrder, setFeeSortOrder] = React.useState('asc');
    const [feeDeptFilter, setFeeDeptFilter] = React.useState('All');
    const [feeSemFilter, setFeeSemFilter] = React.useState('All');
    const [feeSearchQuery, setFeeSearchQuery] = React.useState('');
    const [feeModalOpen, setFeeModalOpen] = React.useState(false);
    const [feeEditMode, setFeeEditMode] = React.useState(false);
    const [selectedFeeId, setSelectedFeeId] = React.useState(null);
    const [submittingFee, setSubmittingFee] = React.useState(false);
    const [commonDueDate, setCommonDueDate] = React.useState('');
    const [savingDueDate, setSavingDueDate] = React.useState(false);
    const [feeForm, setFeeForm] = React.useState({
        usn: '',
        semester: '1',
        amount_due: '150000',
        amount_paid: '0',
        status: 'Not Assigned'
    });

    React.useEffect(() => {
        if (cfg?.feeDueDate) {
            setCommonDueDate(cfg.feeDueDate);
        }
    }, [cfg]);

    const handleSaveCommonDueDate = async () => {
        setSavingDueDate(true);
        try {
            const updatedCfg = { ...cfg, feeDueDate: commonDueDate };
            await adminService.updateGlobalConfig(updatedCfg);
            setCfg(updatedCfg);
            alert('Common fee due date saved successfully!');
        } catch (err) {
            console.error('Failed to save fee due date:', err);
            alert('Failed to save common fee due date.');
        } finally {
            setSavingDueDate(false);
        }
    };

    const handleAmountDueChange = (val) => {
        const due = parseFloat(val) || 0;
        const paid = parseFloat(feeForm.amount_paid) || 0;
        let nextStatus = feeForm.status;
        if (paid < due) {
            nextStatus = 'Pending';
        } else if (paid >= due && due > 0) {
            nextStatus = 'Clear';
        }
        setFeeForm(prev => ({ ...prev, amount_due: val, status: nextStatus }));
    };

    const handleAmountPaidChange = (val) => {
        const due = parseFloat(feeForm.amount_due) || 0;
        const paid = parseFloat(val) || 0;
        let nextStatus = feeForm.status;
        if (paid < due) {
            nextStatus = 'Pending';
        } else if (paid >= due && due > 0) {
            nextStatus = 'Clear';
        }
        setFeeForm(prev => ({ ...prev, amount_paid: val, status: nextStatus }));
    };

    const openAddFeeModal = () => {
        setFeeEditMode(false);
        setSelectedFeeId(null);
        setFeeForm({
            usn: '',
            semester: '1',
            amount_due: '150000',
            amount_paid: '0',
            status: 'Not Assigned'
        });
        setFeeModalOpen(true);
    };

    const openEditFeeModal = (fee) => {
        setFeeEditMode(true);
        setSelectedFeeId(fee.id);
        setFeeForm({
            usn: fee.usn,
            semester: String(fee.semester),
            amount_due: String(fee.amount_due),
            amount_paid: String(fee.amount_paid),
            status: fee.status
        });
        setFeeModalOpen(true);
    };

    const handleSaveFee = async () => {
        if (!feeForm.usn) {
            alert('USN is required');
            return;
        }
        setSubmittingFee(true);
        try {
            const payload = {
                usn: feeForm.usn.trim(),
                semester: parseInt(feeForm.semester, 10),
                amount_due: parseFloat(feeForm.amount_due),
                amount_paid: parseFloat(feeForm.amount_paid),
                status: feeForm.status
            };
            if (feeEditMode) {
                const res = await adminExtendedService.updateFee(selectedFeeId, payload);
                if (res.success) {
                    setFees((prev) => prev.map((f) => f.id === selectedFeeId ? res.fee : f));
                    setFeeModalOpen(false);
                }
            } else {
                const res = await adminExtendedService.createFee(payload);
                if (res.success) {
                    setFees((prev) => [res.fee, ...prev]);
                    setFeeModalOpen(false);
                }
            }
        } catch (error) {
            console.error(error);
            alert('Failed to save fee record');
        } finally {
            setSubmittingFee(false);
        }
    };

    const handleDeleteFee = async (id) => {
        if (!window.confirm('Are you sure you want to delete this fee record?')) return;
        try {
            const res = await adminExtendedService.deleteFee(id);
            if (res.success) {
                setFees((prev) => prev.filter((f) => f.id !== id));
            }
        } catch (error) {
            console.error(error);
            alert('Failed to delete fee record');
        }
    };
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {feeModalOpen && (
                    <div
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.82)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                        onClick={(e) => e.target === e.currentTarget && setFeeModalOpen(false)}
                    >
                        <div className="modal-lt" style={{ background: '#fff', border: '1px solid #E4E7EC', borderRadius: 14, width: '100%', maxWidth: 490 }}>
                            <div style={{ padding: '1.1rem 1.25rem', borderBottom: '1px solid #E4E7EC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontWeight: 600, color: t.text }}>{feeEditMode ? 'Edit Fee Record' : 'Add Fee Record'}</div>
                                <button onClick={() => setFeeModalOpen(false)}><X size={17} /></button>
                            </div>

                            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
                                <div>
                                    <div className="mlbl" style={{ color: t.muted, marginBottom: '.35rem' }}>USN</div>
                                    <input 
                                        className="inp-lt" 
                                        style={{ width: '100%' }} 
                                        disabled={feeEditMode}
                                        value={feeForm.usn} 
                                        onChange={e => setFeeForm({ ...feeForm, usn: e.target.value })} 
                                        placeholder="e.g. 21AM045"
                                    />
                                </div>
                                <div>
                                    <div className="mlbl" style={{ color: t.muted, marginBottom: '.35rem' }}>Semester</div>
                                    <input 
                                        className="inp-lt" 
                                        type="number"
                                        min="1"
                                        max="8"
                                        style={{ width: '100%' }} 
                                        value={feeForm.semester} 
                                        onChange={e => setFeeForm({ ...feeForm, semester: e.target.value })} 
                                        placeholder="e.g. 5"
                                    />
                                </div>
                                <div>
                                    <div className="mlbl" style={{ color: t.muted, marginBottom: '.35rem' }}>Amount Due (₹)</div>
                                    <input 
                                        className="inp-lt" 
                                        type="number"
                                        style={{ width: '100%' }} 
                                        value={feeForm.amount_due} 
                                        onChange={e => handleAmountDueChange(e.target.value)} 
                                        placeholder="e.g. 150000"
                                    />
                                </div>
                                <div>
                                    <div className="mlbl" style={{ color: t.muted, marginBottom: '.35rem' }}>Amount Paid (₹)</div>
                                    <input 
                                        className="inp-lt" 
                                        type="number"
                                        style={{ width: '100%' }} 
                                        value={feeForm.amount_paid} 
                                        onChange={e => handleAmountPaidChange(e.target.value)} 
                                        placeholder="e.g. 50000"
                                    />
                                </div>
                                <div>
                                    <div className="mlbl" style={{ color: t.muted, marginBottom: '.35rem' }}>Remaining Amount (₹)</div>
                                    <input 
                                        className="inp-lt" 
                                        style={{ width: '100%', background: '#F1F3F4', color: '#5F6368' }} 
                                        disabled
                                        value={Math.max(0, (parseFloat(feeForm.amount_due || '0') - parseFloat(feeForm.amount_paid || '0'))).toFixed(2)} 
                                    />
                                </div>
                                <div>
                                    <div className="mlbl" style={{ color: t.muted, marginBottom: '.35rem' }}>Status</div>
                                    <select 
                                        className="inp-lt" 
                                        style={{ width: '100%' }} 
                                        value={feeForm.status} 
                                        onChange={e => setFeeForm({ ...feeForm, status: e.target.value })}
                                    >
                                        <option value="Not Assigned">Not Assigned</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Clear">Clear</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #E4E7EC', display: 'flex', justifyContent: 'flex-end', gap: '.65rem', background: '#FAFAFA', borderBottomLeftRadius: 14, borderBottomRightRadius: 14 }}>
                                <button className="btn btn-gh" onClick={() => setFeeModalOpen(false)}>Cancel</button>
                                <button className="btn btn-np" onClick={handleSaveFee}>Save Record</button>
                            </div>
                        </div>
                    </div>
                )}
                <Card style={{ marginBottom: '1.25rem', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <div style={{ fontWeight: 600, color: t.text, fontSize: '.9rem' }}>Global Common Due Date</div>
                            <div style={{ fontSize: '.76rem', color: t.muted, marginTop: '2px' }}>Define a unified deadline for student fee payments across the entire institution.</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                            <input
                                type="date"
                                className="inp-lt"
                                style={{ width: '170px', padding: '.35rem .6rem', height: '36px' }}
                                value={commonDueDate}
                                onChange={(e) => setCommonDueDate(e.target.value)}
                            />
                            <button
                                type="button"
                                className="btn btn-np"
                                onClick={handleSaveCommonDueDate}
                                disabled={savingDueDate}
                                style={{ padding: '.45rem 1rem', fontSize: '.76rem', whiteSpace: 'nowrap' }}
                            >
                                {savingDueDate ? 'Saving...' : 'Save Due Date'}
                            </button>
                        </div>
                    </div>
                </Card>

                <Card>
                    <CH 
                        title="Institution Fee Records" 
                        sub="All recorded student fee transactions and dues" 
                        right={
                            <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    placeholder="Search USN or Name..."
                                    value={feeSearchQuery}
                                    onChange={e => setFeeSearchQuery(e.target.value)}
                                    style={{ border: `1px solid ${t.border}`, borderRadius: 8, padding: '5px 8px', fontSize: '.78rem', background: t.card, color: t.text, outline: 'none', width: '160px' }}
                                />
                                <select 
                                    value={feeDeptFilter}
                                    onChange={e => setFeeDeptFilter(e.target.value)}
                                    style={{ border: `1px solid ${t.border}`, borderRadius: 8, padding: '5px 8px', fontSize: '.78rem', background: t.card, color: t.text, outline: 'none' }}
                                >
                                    <option value="All">All Departments</option>
                                    {[...new Set(fees.map(f => f.student?.department).filter(Boolean))].map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                                <select 
                                    value={feeSemFilter}
                                    onChange={e => setFeeSemFilter(e.target.value)}
                                    style={{ border: `1px solid ${t.border}`, borderRadius: 8, padding: '5px 8px', fontSize: '.78rem', background: t.card, color: t.text, outline: 'none' }}
                                >
                                    <option value="All">All Semesters</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                        <option key={s} value={String(s)}>Semester {s}</option>
                                    ))}
                                </select>
                                <button className="btn btn-np" onClick={openAddFeeModal}><Plus size={13} /> Add Record</button>
                            </div>
                        } 
                    />
                    <div style={{ overflowX: 'auto' }}>
                        <table className="tbl tbl-lt" style={{ minWidth: 600 }}>
                            <thead>
                                <tr>
                                    <th onClick={() => { setFeeSortOrder(feeSortKey === 'usn' && feeSortOrder === 'asc' ? 'desc' : 'asc'); setFeeSortKey('usn'); }} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        USN {feeSortKey === 'usn' ? (feeSortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                                    </th>
                                    <th>Student Name</th>
                                    <th onClick={() => { setFeeSortOrder(feeSortKey === 'department' && feeSortOrder === 'asc' ? 'desc' : 'asc'); setFeeSortKey('department'); }} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        Department {feeSortKey === 'department' ? (feeSortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                                    </th>
                                    <th onClick={() => { setFeeSortOrder(feeSortKey === 'semester' && feeSortOrder === 'asc' ? 'desc' : 'asc'); setFeeSortKey('semester'); }} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        Semester {feeSortKey === 'semester' ? (feeSortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                                    </th>
                                    <th>Amount Due</th>
                                    <th>Amount Paid</th>
                                    <th>Remaining</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fees.length === 0 ? (
                                    <tr><td colSpan="9" style={{ textAlign: 'center', color: t.muted }}>No fee records found.</td></tr>
                                ) : (
                                    [...fees].filter(f => {
                                        const matchesDept = feeDeptFilter === 'All' || (f.student?.department || 'N/A') === feeDeptFilter;
                                        const matchesSem = feeSemFilter === 'All' || String(f.semester) === feeSemFilter;
                                        const q = feeSearchQuery.toLowerCase();
                                        const matchesSearch = !q || f.usn.toLowerCase().includes(q) || (f.student?.user?.full_name || '').toLowerCase().includes(q);
                                        return matchesDept && matchesSem && matchesSearch;
                                    }).sort((a, b) => {
                                        let valA, valB;
                                        if (feeSortKey === 'department') {
                                            valA = a.student?.department || '';
                                            valB = b.student?.department || '';
                                        } else if (feeSortKey === 'semester') {
                                            valA = Number(a.semester) || 0;
                                            valB = Number(b.semester) || 0;
                                        } else {
                                            valA = a.usn || '';
                                            valB = b.usn || '';
                                        }
                                        if (valA < valB) return feeSortOrder === 'asc' ? -1 : 1;
                                        if (valA > valB) return feeSortOrder === 'asc' ? 1 : -1;
                                        return 0;
                                    }).map(f => (
                                        <tr key={f.id}>
                                            <td style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{f.usn}</td>
                                            <td style={{ fontWeight: 600 }}>{f.student?.user?.full_name || 'N/A'}</td>
                                            <td>{f.student?.department || 'N/A'}</td>
                                            <td>Semester {f.semester}</td>
                                            <td>₹{f.amount_due}</td>
                                            <td>₹{f.amount_paid}</td>
                                            <td style={{ fontWeight: 600, color: (Number(f.amount_due) - Number(f.amount_paid)) > 0 ? t.rHigh : t.rLow }}>
                                                ₹{Math.max(0, Number(f.amount_due) - Number(f.amount_paid)).toFixed(2)}
                                            </td>
                                            <td>
                                                <select
                                                    value={f.status}
                                                    onChange={(e) => handleToggleFee(f.id, e.target.value)}
                                                    style={{
                                                        padding: '4px 8px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        borderRadius: '6px',
                                                        border: '1px solid #E4E7EC',
                                                        background: f.status === 'Clear' ? '#E6F4EA' : f.status === 'Pending' ? '#FEF7E0' : '#F1F3F4',
                                                        color: f.status === 'Clear' ? '#137333' : f.status === 'Pending' ? '#B06000' : '#3C4043',
                                                        cursor: 'pointer',
                                                        outline: 'none',
                                                        boxShadow: 'none'
                                                    }}
                                                >
                                                    <option value="Not Assigned">Not Assigned</option>
                                                    <option value="Pending">Pending</option>
                                                    <option value="Clear">Cleared</option>
                                                </select>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <button 
                                                        onClick={() => openEditFeeModal(f)} 
                                                        style={{ background: 'none', border: 'none', color: t.teal, cursor: 'pointer', padding: 4 }}
                                                        title="Edit record"
                                                    >
                                                        <Edit2 size={13} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteFee(f.id)} 
                                                        style={{ background: 'none', border: 'none', color: t.rHigh, cursor: 'pointer', padding: 4 }}
                                                        title="Delete record"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        );

}
