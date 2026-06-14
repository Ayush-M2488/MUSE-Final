import React from 'react';
import { DK as t } from '../../shared/theme';
import { CH, Loader } from '../../shared/Primitives';
import { FileText, Download, X, Paperclip, Send } from 'lucide-react';

export default function MentorTab({
    loadingMentor,
    mentorData,
    mentorMessages,
    mentorNewMessage,
    setMentorNewMessage,
    mentorNewFile,
    setMentorNewFile,
    sendMsg,
    mentorMessagesEndRef
}) {
    if (loadingMentor) return <Loader dk />;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem', height: '100%' }}>
            <div className="card-dk" style={{ display: 'flex', flexDirection: 'column' }}>
                <CH title="My Mentor" sub="Faculty assigned to you" dk />
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {mentorData ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 600 }}>
                                    {mentorData.full_name.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: t.text }}>{mentorData.full_name}</div>
                                    <div style={{ fontSize: '.8rem', color: t.muted }}>{mentorData.role === 'teacher' ? 'Faculty Member' : 'Mentor'}</div>
                                </div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '.75rem', color: t.muted, marginBottom: '.2rem' }}>Contact</div>
                                <div style={{ fontSize: '.85rem', color: t.text }}>{mentorData.email}</div>
                            </div>
                            <p style={{ fontSize: '.8rem', color: t.muted, lineHeight: 1.5 }}>
                                Your mentor is here to help you succeed academically and professionally. Feel free to reach out with questions about courses, careers, or general advice.
                            </p>
                        </>
                    ) : (
                        <div style={{ color: t.muted, textAlign: 'center', padding: '2rem' }}>No mentor currently assigned.</div>
                    )}
                </div>
            </div>

            <div className="card-dk" style={{ display: 'flex', flexDirection: 'column' }}>
                <CH title="Messages" sub="Direct communication with your mentor" dk />
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {mentorMessages.length === 0 ? (
                        <div style={{ textAlign: 'center', color: t.muted, margin: 'auto' }}>No messages yet. Say hello!</div>
                    ) : (
                        mentorMessages.map((msg, i) => {
                            const isMe = msg.sender.role === 'student';
                            return (
                                <div key={i} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                                    <div style={{ fontSize: '.65rem', color: t.muted, marginBottom: '.2rem', textAlign: isMe ? 'right' : 'left' }}>
                                        {isMe ? 'You' : msg.sender.full_name} • {new Date(msg.sent_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                    <div style={{ background: isMe ? '#175855' : '#1E293B', padding: '.75rem 1rem', borderRadius: 8, color: '#fff', fontSize: '.85rem', lineHeight: 1.5 }}>
                                        {msg.content}
                                        {msg.file_url && (
                                            <div style={{ 
                                                marginTop: msg.content ? '0.75rem' : '0', 
                                                padding: '0.5rem 0.75rem', 
                                                background: 'rgba(0,0,0,0.15)', 
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: 8, 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '0.75rem'
                                            }}>
                                                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
                                                    <FileText size={16} color={t.text} />
                                                </div>
                                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                                    <a href={`http://localhost:3000${msg.file_url}`} download={msg.file_name} target="_blank" rel="noopener noreferrer" style={{ color: '#E2E8F0', textDecoration: 'none', fontSize: '.85rem', fontWeight: 500, display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                        {msg.file_name}
                                                    </a>
                                                    <div style={{ fontSize: '.65rem', color: t.muted, marginTop: '2px' }}>Attachment</div>
                                                </div>
                                                <a href={`http://localhost:3000${msg.file_url}`} download={msg.file_name} target="_blank" rel="noopener noreferrer" style={{ color: t.muted, padding: '0.25rem', display: 'flex', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = t.text} onMouseLeave={e => e.currentTarget.style.color = t.muted}>
                                                    <Download size={16} />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={mentorMessagesEndRef} />
                </div>
                {mentorData && (
                    <>
                        {mentorNewFile && (
                            <div style={{ padding: '0.75rem 1.25rem', background: '#1E293B', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ background: '#3B82F620', color: '#60A5FA', padding: '0.5rem', borderRadius: 8, display: 'flex' }}>
                                    <FileText size={18} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '.85rem', color: t.text, fontWeight: 500 }}>{mentorNewFile.name}</div>
                                    <div style={{ fontSize: '.7rem', color: t.muted }}>Ready to send</div>
                                </div>
                                <button onClick={() => setMentorNewFile(null)} style={{ background: 'rgba(255,0,0,0.1)', border: 'none', color: t.rHigh, cursor: 'pointer', padding: '0.4rem', display: 'flex', borderRadius: '50%' }}>
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '.75rem', alignItems: 'center', background: 'rgba(0,0,0,0.1)' }}>
                            <label style={{ cursor: 'pointer', color: t.muted, padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                                <Paperclip size={20} />
                                <input type="file" style={{ display: 'none' }} onChange={(e) => setMentorNewFile(e.target.files[0])} />
                            </label>
                            <input className="inp-dk" style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: 20 }} placeholder="Type a message..." value={mentorNewMessage} onChange={e => setMentorNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()} disabled={!mentorData} />
                            <button className="btn btn-primary" onClick={sendMsg} disabled={!mentorData} style={{ padding: '0.6rem 1.25rem', borderRadius: 20, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Send size={16} /> Send
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
