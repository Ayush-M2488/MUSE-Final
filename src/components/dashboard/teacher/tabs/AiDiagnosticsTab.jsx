import React, { useState, useMemo } from 'react';
import { DK as t } from '../../shared/theme';
import { CH, Loader } from '../../shared/Primitives';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Rectangle, LabelList } from 'recharts';
import { BrainCircuit, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

const CustomBarShape = (props) => {
    const { fill, x, y, width, height, payload } = props;
    const isNegative = payload.value < 0;
    const radius = isNegative ? [4, 0, 0, 4] : [0, 4, 4, 0];
    return <Rectangle x={x} y={y} width={width} height={height} fill={fill} radius={radius} />;
};

export default function AiDiagnosticsTab({ C, courseStudents, predictions, runningAI, handleRunAI, renderCourseTabs }) {
    const [selectedUsn, setSelectedUsn] = useState('');

    // Prepare options for the dropdown
    const studentOptions = useMemo(() => {
        if (!predictions || predictions.length === 0) return [];
        return predictions.map(p => {
            const student = courseStudents.find(s => s.usn === p.usn);
            return {
                ...p,
                name: student ? student.name : 'Unknown Student'
            };
        }).sort((a, b) => {
            // Sort High Risk first
            const riskMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
            return (riskMap[b.risk_level] || 0) - (riskMap[a.risk_level] || 0);
        });
    }, [predictions, courseStudents]);

    // Auto-select first High/Medium risk student if available
    React.useEffect(() => {
        if (studentOptions.length > 0 && !selectedUsn) {
            setSelectedUsn(studentOptions[0].usn);
        }
    }, [studentOptions, selectedUsn]);

    const selectedPrediction = useMemo(() => {
        return studentOptions.find(p => p.usn === selectedUsn);
    }, [studentOptions, selectedUsn]);

    // Transform explanations for Recharts Waterfall/Bar chart
    const chartData = useMemo(() => {
        if (!selectedPrediction || !selectedPrediction.factors) return [];
        return [...selectedPrediction.factors]
            .sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap))
            .map(exp => ({
                name: exp.feature,
                value: parseFloat(exp.shap.toFixed(4)),
                rawValue: exp.value,
                impactText: exp.impact
            }));
    }, [selectedPrediction]);

    const generateAISummary = (prediction) => {
        if (!prediction || !prediction.factors || prediction.factors.length === 0)
            return "No Explainable AI (SHAP) data available for this prediction.";

        const sorted = [...prediction.factors].sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap));
        const topFactor = sorted[0];
        const topPositive = sorted.find(f => f.shap > 0);
        const topNegative = sorted.find(f => f.shap < 0);

        let summary = `The AI Engine classified this student's trajectory as `;

        if (prediction.risk_level === 'High') {
            summary += `<strong style="color: ${t.rHigh}">Critical Intervention Needed</strong>. `;
        } else if (prediction.risk_level === 'Medium') {
            summary += `<strong style="color: ${t.gold}">Needs Attention</strong>. `;
        } else {
            summary += `<strong style="color: ${t.teal}">On Track</strong>. `;
        }

        if (topFactor) {
            summary += `The primary driving factor is their <strong>${topFactor.feature}</strong> (Value: ${topFactor.value}), which <strong>${topFactor.shap > 0 ? 'increased' : 'decreased'}</strong> their forecast significantly. `;
        }

        if (prediction.risk_level === 'High' || prediction.risk_level === 'Medium') {
            if (topNegative) {
                summary += `However, their <strong>${topNegative.feature}</strong> acted as a protective factor, preventing the score from going even higher. `;
            } else {
                summary += `There were no significant protective factors identified. `;
            }
        } else {
            if (topPositive) {
                summary += `While their overall risk is low, their <strong>${topPositive.feature}</strong> is a slight area of concern that pushed the score slightly higher. `;
            }
        }

        return summary;
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const isPositive = data.value > 0;
            return (
                <div style={{ background: '#1A1A1A', border: `1px solid ${t.border}`, padding: '1rem', borderRadius: '8px', color: t.text, boxShadow: '0 4px 12px rgba(0,0,0,0.5)', maxWidth: '250px' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: t.primary }}>{data.name}</div>
                    <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        <span style={{ color: t.muted }}>Actual Value:</span> <span style={{ fontWeight: 500 }}>{data.rawValue}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: t.muted }}>Forecast Impact:</span> <span style={{ fontWeight: 600, color: isPositive ? t.rHigh : t.teal }}>
                            {isPositive ? '+' : ''}{data.value.toFixed(4)}
                        </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: t.muted, fontStyle: 'italic', lineHeight: '1.4' }}>
                        "{data.impactText}"
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <CH
                    title="Explainable AI Diagnostics (SHAP)"
                    sub="Understand exactly why the Random Forest model assigned a specific AI forecast"
                    dk
                />
                {predictions && predictions.length > 0 && (
                    <button className="btn btn-wh" onClick={() => handleRunAI(C?.code || 'all')} disabled={runningAI}>
                        {runningAI ? 'Analyzing...' : 'Run New Analysis'}
                    </button>
                )}
            </div>

            {renderCourseTabs()}

            {runningAI ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: `1px solid ${t.border}` }}>
                    <Loader text="Generating SHAP Visualizations..." />
                </div>
            ) : !predictions || predictions.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: `1px solid ${t.border}` }}>
                    <BrainCircuit size={48} style={{ color: t.muted, margin: '0 auto 1rem', opacity: 0.5 }} />
                    <h3 style={{ color: t.text, marginBottom: '0.5rem' }}>No AI Diagnostics Available</h3>
                    <p style={{ color: t.muted, fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                        Please run the AI Risk Analysis engine first to generate SHAP explanations for your students.
                    </p>
                    <button className="btn btn-pm" onClick={() => handleRunAI(C?.code || 'all')}>
                        Run AI Analysis Now
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1.25rem', alignItems: 'start' }}>

                    {/* Left Column: Student Selector & Summary */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: `1px solid ${t.border}`, padding: '1.5rem' }}>
                            <div style={{ fontSize: '0.85rem', color: t.muted, marginBottom: '0.5rem', fontWeight: 500 }}>Select Student to Diagnose</div>
                            <select
                                className="inp-dk"
                                style={{ width: '100%', marginBottom: '1rem', cursor: 'pointer' }}
                                value={selectedUsn}
                                onChange={(e) => setSelectedUsn(e.target.value)}
                            >
                                {studentOptions.map(opt => (
                                    <option key={opt.usn} value={opt.usn}>
                                        {opt.risk_level === 'High' ? '🔴' : opt.risk_level === 'Medium' ? '🟡' : '🟢'} {opt.name} ({opt.usn})
                                    </option>
                                ))}
                            </select>

                            {selectedPrediction && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>


                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: t.muted, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <BrainCircuit size={14} /> AI Synthesis
                                        </div>
                                        <div
                                            style={{ fontSize: '0.9rem', lineHeight: '1.6', color: t.text }}
                                            dangerouslySetInnerHTML={{ __html: generateAISummary(selectedPrediction) }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {selectedPrediction && (
                            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: `1px solid ${t.border}`, padding: '1.5rem' }}>
                                <div style={{ fontSize: '0.85rem', color: t.muted, marginBottom: '1rem', fontWeight: 500 }}>Feature Values</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {selectedPrediction.factors?.map((exp, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                            <span style={{ color: t.text }}>{exp.feature}</span>
                                            <span style={{ fontWeight: 600, color: t.primary }}>{exp.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: SHAP Chart */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: `1px solid ${t.border}`, padding: '1.5rem', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: t.text, marginBottom: '0.25rem' }}>SHAP Impact Visualization</h3>
                                <p style={{ fontSize: '0.85rem', color: t.muted }}>
                                    Bars extending to the right <strong style={{ color: t.rHigh }}>(Red)</strong> push toward risk.<br />
                                    Bars extending to the left <strong style={{ color: t.teal }}>(Green)</strong> protect the standing.
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: t.muted }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <div style={{ width: 12, height: 12, borderRadius: 2, background: t.rHigh }}></div> Pushes toward High Risk
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <div style={{ width: 12, height: 12, borderRadius: 2, background: t.teal }}></div> Pushes toward Low Risk
                                </div>
                            </div>
                        </div>

                        {chartData.length > 0 ? (
                            <div style={{ flex: 1, width: '100%', minHeight: '400px', position: 'relative' }}>
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart
                                        layout="vertical"
                                        data={chartData}
                                        margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke={t.border} horizontal={true} vertical={true} />
                                        <XAxis
                                            type="number"
                                            domain={['dataMin - 0.15', 'dataMax + 0.15']}
                                            tickFormatter={(val) => val > 0 ? `+${val.toFixed(4)}` : val.toFixed(4)}
                                            stroke={t.muted}
                                            fontSize={12}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            stroke={t.text}
                                            fontSize={13}
                                            fontWeight={500}
                                            width={100}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                        <ReferenceLine x={0} stroke={t.muted} strokeWidth={2} />
                                        <Bar dataKey="value" shape={<CustomBarShape />} barSize={32}>
                                            {chartData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.value > 0 ? t.rHigh : t.teal}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.muted }}>
                                No SHAP values to visualize for this student.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
