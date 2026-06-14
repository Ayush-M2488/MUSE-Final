import React, { useState, useEffect, useMemo } from 'react';
import { DK as t } from '../../shared/theme';
import { CH, Loader } from '../../shared/Primitives';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { BrainCircuit, BookOpen } from 'lucide-react';
import { studentService } from '../../../../services/api';

export default function AiInsightsTab() {
    const [predictions, setPredictions] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('overall');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await studentService.getAIInsights();
                setPredictions(res.predictions || []);
            } catch (err) {
                setError('Failed to fetch AI insights. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const prediction = useMemo(() => {
        if (selectedCourse === 'overall') return null;
        return predictions.find(p => p.course_code === selectedCourse);
    }, [predictions, selectedCourse]);

    // Transform explanations for Recharts Waterfall/Bar chart
    const chartData = useMemo(() => {
        if (!prediction || !prediction.factors) return [];
        return [...prediction.factors]
            .sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap))
            .map(exp => ({
                name: exp.feature,
                value: parseFloat(exp.shap.toFixed(3)),
                rawValue: exp.value,
                impactText: exp.impact
            }));
    }, [prediction]);

    const generateAISummary = (pred) => {
        if (!pred || !pred.factors || pred.factors.length === 0) 
            return "No Explainable AI (SHAP) data available for this course currently. This means your teachers haven't run the AI analysis recently.";
        
        const sorted = [...pred.factors].sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap));
        const topFactor = sorted[0];
        const topPositive = sorted.find(f => f.shap > 0);
        const topNegative = sorted.find(f => f.shap < 0);

        let summary = `The MUSE AI Engine has classified your current academic trajectory in this course as `;
        
        if (pred.risk_level === 'High') {
            summary += `<strong style="color: ${t.rHigh}">Critical Intervention Needed</strong>. `;
        } else if (pred.risk_level === 'Medium') {
            summary += `<strong style="color: ${t.gold}">Needs Attention</strong>. `;
        } else {
            summary += `<strong style="color: ${t.teal}">On Track</strong>. `;
        }

        if (topFactor) {
            summary += `The primary driving factor for this assessment is your <strong>${topFactor.feature}</strong> (Current Value: ${topFactor.value}), which <strong>${topFactor.shap > 0 ? 'increased' : 'decreased'}</strong> your academic forecast significantly. `;
        }

        if (pred.risk_level === 'High' || pred.risk_level === 'Medium') {
            if (topNegative) {
                summary += `However, your <strong>${topNegative.feature}</strong> acted as a positive protective factor, preventing your forecast from dropping further. `;
            }
            summary += `<br/><br/><span style="color: ${t.rHigh}; font-weight: 600;">Actionable Advice:</span> To improve your standing, focus heavily on improving your ${topPositive ? topPositive.feature : topFactor.feature}.`;
        } else {
            if (topPositive) {
                summary += `While your overall risk is low, your <strong>${topPositive.feature}</strong> is a slight area of concern that pushed the score slightly higher. `;
            }
            summary += `<br/><br/><span style="color: ${t.teal}; font-weight: 600;">Actionable Advice:</span> Keep up the excellent work! You are on a great path. Maintain your positive habits.`;
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
                        <span style={{ color: t.muted }}>Your Value:</span> <span style={{ fontWeight: 500 }}>{data.rawValue}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: t.muted }}>Forecast Impact:</span> <span style={{ fontWeight: 600, color: isPositive ? t.rHigh : t.teal }}>
                            {isPositive ? '+' : ''}{data.value}
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

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <CH title="My AI Insights" sub="Understand your academic performance through the lens of AI" dk />
                <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: `1px solid ${t.border}` }}>
                    <Loader text="Loading AI Insights..." />
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <CH 
                    title="My AI Insights" 
                    sub="Understand exactly why the Random Forest model assigned your specific AI forecast across your subjects" 
                    dk 
                />
            </div>

            {error ? (
                <div style={{ padding: '2rem', background: `${t.rHigh}22`, color: t.rHigh, borderRadius: '8px', border: `1px solid ${t.rHigh}55` }}>
                    {error}
                </div>
            ) : !predictions || predictions.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: `1px solid ${t.border}` }}>
                    <BrainCircuit size={48} style={{ color: t.muted, margin: '0 auto 1rem', opacity: 0.5 }} />
                    <h3 style={{ color: t.text, marginBottom: '0.5rem' }}>No AI Diagnostics Available</h3>
                    <p style={{ color: t.muted, fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                        Your faculty has not yet run an AI analysis on your profile for this semester.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Course Tabs */}
                    <div style={{ display: 'flex', gap: '1rem', borderBottom: `1px solid ${t.border}`, paddingBottom: '0.5rem', overflowX: 'auto' }}>
                        <button 
                            className={`btn ${selectedCourse === 'overall' ? 'btn-pm' : 'btn-wh'}`}
                            onClick={() => setSelectedCourse('overall')}
                            style={selectedCourse !== 'overall' ? { background: 'transparent', border: 'none', color: t.muted } : {}}
                        >
                            Overall Analysis
                        </button>
                        {predictions.map(p => (
                            <button 
                                key={p.course_code}
                                className={`btn ${selectedCourse === p.course_code ? 'btn-pm' : 'btn-wh'}`}
                                onClick={() => setSelectedCourse(p.course_code)}
                                style={selectedCourse !== p.course_code ? { background: 'transparent', border: 'none', color: t.muted } : {}}
                            >
                                {p.course_code}
                            </button>
                        ))}
                    </div>

                    {selectedCourse === 'overall' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                            {predictions.map(p => (
                                <div key={p.course_code} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: `1px solid ${t.border}`, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: t.text }}>
                                            <BookOpen size={18} style={{ color: t.primary }} /> {p.course_code}
                                        </div>
                                        <div style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, background: p.risk_level === 'High' ? `${t.rHigh}33` : p.risk_level === 'Medium' ? `${t.gold}33` : `${t.teal}33`, color: p.risk_level === 'High' ? t.rHigh : p.risk_level === 'Medium' ? t.gold : t.teal }}>
                                            {p.risk_level === 'High' ? 'CRITICAL INTERVENTION' : p.risk_level === 'Medium' ? 'NEEDS ATTENTION' : 'ON TRACK'}
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: t.muted, marginBottom: '0.5rem' }}>Top Driving Factor:</div>
                                        {p.factors && p.factors.length > 0 ? (() => {
                                            const topF = [...p.factors].sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap))[0];
                                            return (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                    <span style={{ color: t.text }}>{topF.feature}</span>
                                                    <span style={{ fontWeight: 600, color: topF.shap > 0 ? t.rHigh : t.teal }}>{topF.shap > 0 ? 'Risk Increased' : 'Protective'}</span>
                                                </div>
                                            );
                                        })() : (
                                            <span style={{ color: t.muted, fontSize: '0.85rem' }}>No data</span>
                                        )}
                                    </div>
                                    <button className="btn btn-wh" style={{ width: '100%', marginTop: 'auto' }} onClick={() => setSelectedCourse(p.course_code)}>
                                        View Deep Dive
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1.25rem', alignItems: 'start' }}>
                            {/* Left Column: Summary */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: `1px solid ${t.border}`, padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                                        
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: t.muted, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <BrainCircuit size={14} /> AI Synthesis
                                            </div>
                                            <div 
                                                style={{ fontSize: '0.9rem', lineHeight: '1.6', color: t.text }}
                                                dangerouslySetInnerHTML={{ __html: generateAISummary(prediction) }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: `1px solid ${t.border}`, padding: '1.5rem' }}>
                                    <div style={{ fontSize: '0.85rem', color: t.muted, marginBottom: '1rem', fontWeight: 500 }}>My Feature Values</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {prediction.factors?.map((exp, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                <span style={{ color: t.text }}>{exp.feature}</span>
                                                <span style={{ fontWeight: 600, color: t.primary }}>{exp.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: SHAP Chart */}
                            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: `1px solid ${t.border}`, padding: '1.5rem', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: t.text, marginBottom: '0.25rem' }}>SHAP Impact Visualization</h3>
                                        <p style={{ fontSize: '0.85rem', color: t.muted }}>
                                            Bars extending to the right <strong style={{color: t.rHigh}}>(Red)</strong> push you toward risk.<br/>
                                            Bars extending to the left <strong style={{color: t.teal}}>(Green)</strong> protect your standing.
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: t.muted }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <div style={{ width: 12, height: 12, borderRadius: 2, background: t.rHigh }}></div> Pushes toward Risk
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <div style={{ width: 12, height: 12, borderRadius: 2, background: t.teal }}></div> Protective Factor
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
                                                    domain={['dataMin - 0.1', 'dataMax + 0.1']} 
                                                    tickFormatter={(val) => val > 0 ? `+${val}` : val}
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
                                                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                                                <ReferenceLine x={0} stroke={t.muted} strokeWidth={2} />
                                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                                    {chartData.map((entry, index) => (
                                                        <Cell 
                                                            key={`cell-${index}`} 
                                                            fill={entry.value > 0 ? t.rHigh : t.teal} 
                                                            radius={entry.value > 0 ? [0, 4, 4, 0] : [4, 0, 0, 4]}
                                                        />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.muted }}>
                                        No SHAP values to visualize.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
