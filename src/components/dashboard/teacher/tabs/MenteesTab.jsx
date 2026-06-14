import React, { useState, useEffect, useRef } from 'react';
import { Send, X, FileText, Download, Paperclip } from 'lucide-react';
import { CH, Loader } from '../../shared/Primitives';
import { DK as t } from '../../shared/theme';
import { teacherService } from '../../../../services/api';
import { socket, connectSocket, disconnectSocket } from '../../../../services/socket';

export default function MenteesTab() {
  const [mentees, setMentees] = useState([]);
  const [loadingMentees, setLoadingMentees] = useState(false);
  const [activeMentee, setActiveMentee] = useState(null);
  const [menteeMessages, setMenteeMessages] = useState([]);
  const [menteeNewMessage, setMenteeNewMessage] = useState("");
  const [menteeNewFile, setMenteeNewFile] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMentees = async () => {
        setLoadingMentees(true);
        try {
            const data = await teacherService.getMyMentees();
            setMentees(data);
        } catch (err) {
            console.error("Failed to fetch mentees", err);
        } finally {
            setLoadingMentees(false);
        }
    };
    fetchMentees();
  }, []);

  useEffect(() => {
      if (activeMentee) {
          const fetchMsgs = async () => {
              try {
                  const msgs = await teacherService.getMentorshipMessages(activeMentee.usn);
                  setMenteeMessages(msgs);
              } catch (err) {
                  console.error("Failed to fetch messages", err);
              }
          };
          fetchMsgs(); // Initial fetch

          // Connect to WebSocket room
          connectSocket(activeMentee.user_id);
          
          socket.on('receive_message', (newMsg) => {
              setMenteeMessages(prev => {
                  if (prev.find(m => m.id === newMsg.id)) return prev;
                  return [...prev, newMsg];
              });
          });
      }
      return () => { 
          socket.off('receive_message');
          disconnectSocket();
      };
  }, [activeMentee]);

  useEffect(() => {
      if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
  }, [menteeMessages]);

  const sendMsg = async () => {
      if ((!menteeNewMessage.trim() && !menteeNewFile) || !activeMentee) return;
      try {
          const newMsg = await teacherService.sendMentorshipMessage(activeMentee.usn, menteeNewMessage, menteeNewFile);
          setMenteeMessages(prev => {
              if (prev.find(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
          });
          setMenteeNewMessage("");
          setMenteeNewFile(null);
      } catch (err) {
          alert('Failed to send message');
      }
  };

  if (loadingMentees) return <Loader dk />;

  return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem', height: '100%' }}>
          <div className="card-dk" style={{ display: 'flex', flexDirection: 'column' }}>
              <CH title="My Mentees" sub={`${mentees.length} assigned students`} dk />
              <div style={{ flex: 1, overflowY: 'auto' }}>
                  {mentees.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: t.muted }}>No mentees assigned.</div>
                  ) : (
                      mentees.map(s => (
                          <div key={s.usn} onClick={() => setActiveMentee(s)} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', background: activeMentee?.usn === s.usn ? 'rgba(255,255,255,0.05)' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="hover-row">
                              <div>
                                  <div style={{ fontWeight: 600, color: t.text }}>{s.name}</div>
                                  <div style={{ fontSize: '.75rem', color: t.muted, fontFamily: 'JetBrains Mono, monospace' }}>{s.usn} • Sem {s.semester}</div>
                              </div>
                              <span className="b bM" style={{ background: s.risk === 'High' ? `${t.rHigh}1a` : s.risk === 'Medium' ? `${t.rMed}1a` : `${t.rLow}1a`, color: s.risk === 'High' ? t.rHigh : s.risk === 'Medium' ? t.rMed : t.rLow }}>{s.risk}</span>
                          </div>
                      ))
                  )}
              </div>
          </div>
          <div className="card-dk" style={{ display: 'flex', flexDirection: 'column' }}>
              {activeMentee ? (
                  <>
                      <CH title={`Mentorship: ${activeMentee.name}`} sub={activeMentee.usn} dk />
                      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {menteeMessages.length === 0 ? (
                              <div style={{ textAlign: 'center', color: t.muted, margin: 'auto' }}>No messages yet. Start the conversation!</div>
                          ) : (
                              menteeMessages.map((msg, i) => {
                                  const isMe = msg.sender.role === 'teacher';
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
                          <div ref={messagesEndRef} />
                      </div>
                      {menteeNewFile && (
                            <div style={{ padding: '0.75rem 1.25rem', background: '#1E293B', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ background: '#3B82F620', color: '#60A5FA', padding: '0.5rem', borderRadius: 8, display: 'flex' }}>
                                    <FileText size={18} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '.85rem', color: t.text, fontWeight: 500 }}>{menteeNewFile.name}</div>
                                    <div style={{ fontSize: '.7rem', color: t.muted }}>Ready to send</div>
                                </div>
                                <button onClick={() => setMenteeNewFile(null)} style={{ background: 'rgba(255,0,0,0.1)', border: 'none', color: t.rHigh, cursor: 'pointer', padding: '0.4rem', display: 'flex', borderRadius: '50%' }}>
                                    <X size={16} />
                                </button>
                            </div>
                      )}
                      <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '.75rem', alignItems: 'center', background: 'rgba(0,0,0,0.1)' }}>
                          <label style={{ cursor: 'pointer', color: t.muted, padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                              <Paperclip size={20} />
                              <input type="file" style={{ display: 'none' }} onChange={(e) => setMenteeNewFile(e.target.files[0])} />
                          </label>
                          <input className="inp-dk" style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: 20 }} placeholder="Type a message..." value={menteeNewMessage} onChange={e => setMenteeNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()} />
                          <button className="btn btn-primary" onClick={sendMsg} style={{ padding: '0.6rem 1.25rem', borderRadius: 20, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Send size={16} /> Send
                          </button>
                      </div>
                  </>
              ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.muted }}>
                      Select a mentee to view messages
                  </div>
              )}
          </div>
      </div>
  );
}
