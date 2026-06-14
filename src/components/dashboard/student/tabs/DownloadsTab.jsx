import React from 'react';
import { Download, FileText, Shield } from 'lucide-react';
import { DK as t } from '../../shared/theme';
import { generateMarksheetPDF, generateAttendancePDF, generateFeeReceiptPDF } from '../../../../utils/pdfGenerator';

export default function DownloadsTab({ d }) {
    return (
        <div className="gauto">
            {[
                { icon: Download, label: 'Marksheet', sub: 'Latest semester', action: () => generateMarksheetPDF(d) },
                { icon: FileText, label: 'Attendance', sub: 'Current semester', action: () => generateAttendancePDF(d) },
                { icon: Shield, label: 'Fee Receipt', sub: 'All payments', action: () => generateFeeReceiptPDF(d) },
            ].map(({ icon: Icon, label, sub, action }) => (
                <button
                    key={label}
                    className="btn card-dk"
                    style={{ flexDirection: 'column', gap: '.65rem', padding: '1.1rem', height: 'auto', alignItems: 'flex-start' }}
                    onClick={action}
                >
                    <div
                        style={{
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            background: 'rgba(255,255,255,.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Icon size={15} style={{ color: '#fff' }} />
                    </div>
                    <div>
                        <div style={{ fontSize: '.82rem', fontWeight: 600, color: '#fff' }}>{label}</div>
                        <div style={{ fontSize: '.67rem', color: t.muted }}>{sub}</div>
                    </div>
                </button>
            ))}
        </div>
    );
}
