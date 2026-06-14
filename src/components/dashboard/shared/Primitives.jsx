import React from 'react';
import {
    ArrowUpRight,
    ArrowDownRight,
    ChevronRight,
    RefreshCw,
    Bell,
    Monitor,
    Search,
    LogOut,
    Home,
    BookOpen,
    ClipboardList,
    Calendar,
    Settings,
    Download,
    MessageSquare,
    BarChart2,
    CheckCircle,
    Users,
    Edit2,
    AlertTriangle,
    Activity,
    Database,
    Shield,
    BrainCircuit
} from 'lucide-react';
import { DK, LT, getTheme } from './theme';

export const CT = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
        <div
            style={{
                background: '#111827',
                border: '1px solid rgba(255,255,255,.12)',
                padding: '.4rem .65rem',
                borderRadius: 8,
                fontSize: '.72rem',
                color: '#fff',
            }}
        >
            <div
                style={{
                    fontFamily: 'JetBrains Mono,monospace',
                    fontSize: '.55rem',
                    opacity: 0.55,
                    marginBottom: '.18rem',
                }}
            >
                {label}
            </div>
            {payload.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.35rem', marginTop: '.1rem' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.color }} />
                    <span>
                        {p.name}: <strong>{p.value}</strong>
                    </span>
                </div>
            ))}
        </div>
    );
};

export const Pbar = ({ val, threshold = 75, dk }) => {
    const t = dk ? DK : LT;
    const col = val >= threshold ? t.rLow : val >= 65 ? t.rMed : t.rHigh;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem' }}>
            <div className={`pg ${dk ? 'pg-dk' : 'pg-lt'}`} style={{ flex: 1 }}>
                <div className="pgf" style={{ width: `${val}%`, background: col }} />
            </div>
            <span
                style={{
                    fontFamily: 'JetBrains Mono,monospace',
                    fontSize: '.64rem',
                    fontWeight: 600,
                    color: col,
                    minWidth: 30,
                    textAlign: 'right',
                }}
            >
                {val}%
            </span>
        </div>
    );
};

export const KPI = ({ label, value, delta, up, icon: Icon, accent, dk }) => {
    const t = dk ? DK : LT;

    return (
        <div className={dk ? 'card-dk' : 'card-lt'} style={{ padding: '1.15rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div
                        style={{
                            fontSize: '.68rem',
                            fontWeight: 500,
                            color: t.muted,
                            textTransform: 'uppercase',
                            letterSpacing: '.06em',
                            marginBottom: '.38rem',
                        }}
                    >
                        {label}
                    </div>
                    <div style={{ fontSize: '1.78rem', fontWeight: 700, color: t.text, lineHeight: 1 }}>{value}</div>

                    {delta && (
                        <div
                            style={{
                                fontSize: '.7rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '.16rem',
                                marginTop: '.28rem',
                                color: up === true ? t.rLow : up === false ? t.rHigh : t.muted,
                            }}
                        >
                            {up === true && <ArrowUpRight size={12} />}
                            {up === false && <ArrowDownRight size={12} />}
                            {delta}
                        </div>
                    )}
                </div>

                <div
                    style={{
                        width: 38,
                        height: 38,
                        borderRadius: 9,
                        background: `${accent}22`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Icon size={17} style={{ color: accent }} strokeWidth={1.5} />
                </div>
            </div>
        </div>
    );
};

export const CH = ({ title, sub, right, border = true, dk }) => {
    const t = dk ? DK : LT;

    return (
        <div
            style={{
                padding: '1rem 1.25rem',
                borderBottom: border ? `1px solid ${t.sep}` : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '.5rem',
                flexWrap: 'wrap',
            }}
        >
            <div>
                <div style={{ fontWeight: 600, fontSize: '.88rem', color: t.text }}>{title}</div>
                {sub && <div style={{ fontSize: '.7rem', color: t.muted, marginTop: 1 }}>{sub}</div>}
            </div>
            {right && <div>{right}</div>}
        </div>
    );
};

export const Loader = ({ dk }) => {
    const t = dk ? DK : LT;

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem',
                gap: '1rem',
                opacity: 0.6,
            }}
        >
            <RefreshCw size={24} style={{ color: dk ? '#fff' : t.teal }} />
            <div
                style={{
                    fontFamily: 'JetBrains Mono,monospace',
                    fontSize: '.65rem',
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    color: t.muted,
                }}
            >
                Loading Data...
            </div>
        </div>
    );
};

const NAV = {
    student: [
        {
            g: 'Menu',
            items: [
                ['home', Home, 'Dashboard'],
                ['assignments', ClipboardList, 'Assignments'],
                ['marks', BarChart2, 'Marks / IA'],
                ['attendance', CheckCircle, 'Attendance'],
                ['timetable', Calendar, 'Timetable'],
            ],
        },
        {
            g: 'Services',
            items: [
                ['ai_insights', BrainCircuit, 'AI Insights'],
                ['mentor', Users, 'My Mentor'],
                ['notifications', Bell, 'Notifications'],
                ['announcements', MessageSquare, 'Announcements'],
                ['downloads', Download, 'Downloads'],
                ['grievances', MessageSquare, 'Grievances'],
                ['settings', Settings, 'Settings'],
            ],
        },
    ],
    teacher: [
        {
            g: 'Menu',
            items: [
                ['home', Home, 'Dashboard'],
                ['tasks', ClipboardList, 'My Tasks'],
                ['assignments', BookOpen, 'Assignments'],
                ['students', Users, 'My Students'],
                ['mentees', Users, 'My Mentees'],
                ['attendance', CheckCircle, 'Take Attendance'],
                ['marks', Edit2, 'Enter Marks'],
                ['timetable', Calendar, 'My Timetable'],
            ],
        },
        {
            g: 'Analytics',
            items: [
                ['risk', AlertTriangle, 'Risk Overview'],
                ['ai_diagnostics', BrainCircuit, 'AI Diagnostics'],
                ['announcements', MessageSquare, 'Announcements'],
                ['grievances', MessageSquare, 'Grievances'],
                ['settings', Settings, 'Settings'],
            ],
        },
    ],
    admin: [
        {
            g: 'Menu',
            items: [
                ['home', Home, 'Dashboard'],
                ['analytics', Activity, 'Analytics'],
            ],
        },
        {
            g: 'Academics',
            items: [
                ['courses', BookOpen, 'Courses / Sections'],
                ['academic', ClipboardList, 'Academic Data'],
                ['risk', AlertTriangle, 'Risk Management'],
                ['fees', Database, 'Fee Management'],
                ['reports', BarChart2, 'Reports'],
            ],
        },
        {
            g: 'Administration',
            items: [
                ['users', Users, 'User Management'],
                ['grievances', MessageSquare, 'Grievances'],
                ['logs', Shield, 'Decision Logs'],
                ['config', Settings, 'Configuration'],
            ],
        },
    ],
};

export const Sidebar = ({ role, page, onNav, onLogout }) => {
    const dk = role !== 'admin';
    const ltSb = !dk;
    const userStr = window.localStorage.getItem('muse_user');
    const authUser = userStr ? JSON.parse(userStr) : null;
    const [navSearch, setNavSearch] = React.useState('');

    let nav = [...NAV[role]];
    if (role === 'teacher' && authUser?.is_hod) {
        nav = [
            nav[0], // Dashboard
            {
                g: 'Administration',
                items: [
                    ['hod_hub', Database, 'Department Hub']
                ]
            },
            ...nav.slice(1)
        ];
    }

    const names = {
        student: 'Student Portal',
        teacher: 'Faculty Portal',
        admin: 'Admin Panel',
    };

    const defaultUsers = {
        student: { n: 'Student', id: 'Student ID' },
        teacher: { n: 'Faculty', id: 'Faculty ID' },
        admin: { n: 'Admin', id: 'ADM-001' },
    };

    const u = authUser ? { n: authUser.name, id: authUser.id } : defaultUsers[role];

    const filteredNav = nav
        .map((group) => {
            const filteredItems = group.items.filter((item) =>
                item[2].toLowerCase().includes(navSearch.toLowerCase())
            );
            return { ...group, items: filteredItems };
        })
        .filter((group) => group.items.length > 0);

    return (
        <div className={dk ? 'sb-dk' : 'sb-lt'}>
            <div
                style={{
                    padding: '1.1rem 1.25rem',
                    borderBottom: dk ? '1px solid rgba(255,255,255,.07)' : '1px solid #F2F4F7',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.65rem',
                }}
            >
                <div
                    style={{
                        width: 56,
                        height: 56,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <img src="/src/assets/mysore_logo.png" alt="MUSE Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>

                <div>
                    <div style={{ fontSize: '.95rem', fontWeight: 800, color: ltSb ? '#111827' : '#fff' }}>MUSE</div>
                    <div
                        style={{
                            fontFamily: 'JetBrains Mono,monospace',
                            fontSize: '.44rem',
                            color: ltSb ? '#9CA3AF' : 'rgba(255,255,255,.3)',
                            textTransform: 'uppercase',
                            letterSpacing: '.1em',
                        }}
                    >
                        {names[role]}
                    </div>
                </div>
            </div>

            <div style={{ padding: '.7rem .875rem' }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '.4rem',
                        borderRadius: 8,
                        padding: '.36rem .7rem',
                        background: ltSb ? '#F2F4F7' : 'rgba(255,255,255,.06)',
                        border: ltSb ? '1px solid #E8ECF0' : '1px solid rgba(255,255,255,.08)',
                    }}
                >
                    <Search size={12} style={{ color: ltSb ? '#9CA3AF' : 'rgba(255,255,255,.3)' }} />
                    <input
                        placeholder="Search menu..."
                        value={navSearch}
                        onChange={(e) => setNavSearch(e.target.value)}
                        style={{
                            background: 'none',
                            border: 'none',
                            outline: 'none',
                            width: '100%',
                            color: ltSb ? '#111827' : '#fff',
                            fontSize: '.76rem'
                        }}
                    />
                </div>
            </div>

            <div
                style={{
                    margin: '0 .75rem .5rem',
                    padding: '.55rem .72rem',
                    borderRadius: 8,
                    background: ltSb ? '#F9FAFB' : 'rgba(255,255,255,.06)',
                    border: ltSb ? '1px solid #E8ECF0' : '1px solid rgba(255,255,255,.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.5rem',
                }}
            >
                <div
                    style={{
                        width: 27,
                        height: 27,
                        borderRadius: '50%',
                        background: ltSb ? '#F0FDFA' : 'rgba(255,255,255,.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '.68rem',
                        fontWeight: 700,
                        color: ltSb ? '#0D9488' : '#fff',
                    }}
                >
                    {u.n.charAt(0)}
                </div>

                <div>
                    <div style={{ fontSize: '.76rem', fontWeight: 600, color: ltSb ? '#111827' : '#fff' }}>{u.n}</div>
                    <div
                        style={{
                            fontFamily: 'JetBrains Mono,monospace',
                            fontSize: '.52rem',
                            color: ltSb ? '#9CA3AF' : 'rgba(255,255,255,.3)',
                        }}
                    >
                        {u.id}
                    </div>
                </div>
            </div>

            {filteredNav.map((group) => (
                <div key={group.g} style={{ padding: '.7rem .875rem .2rem' }}>
                    <div
                        style={{
                            fontFamily: 'JetBrains Mono,monospace',
                            fontSize: '.46rem',
                            textTransform: 'uppercase',
                            letterSpacing: '.18em',
                            color: ltSb ? '#D1D5DB' : 'rgba(255,255,255,.2)',
                            paddingLeft: '.42rem',
                            marginBottom: '.28rem',
                        }}
                    >
                        {group.g}
                    </div>

                    {group.items.map(([id, Icon, label]) => (
                        <div key={id} className={`sb-nav-item ${page === id ? 'on' : ''}`} onClick={() => onNav(id)}>
                            <Icon size={14} strokeWidth={1.6} />
                            <span style={{ flex: 1 }}>{label}</span>
                        </div>
                    ))}
                </div>
            ))}

            {filteredNav.length === 0 && (
                <div style={{
                    padding: '1.5rem 1rem',
                    textAlign: 'center',
                    fontSize: '.72rem',
                    color: ltSb ? '#9CA3AF' : 'rgba(255,255,255,.4)'
                }}>
                    No matches found
                </div>
            )}

            <div
                style={{
                    marginTop: 'auto',
                    padding: '.7rem .875rem',
                    borderTop: dk ? '1px solid rgba(255,255,255,.07)' : '1px solid #F2F4F7',
                }}
            >
                <div className="sb-nav-item" style={{ color: ltSb ? '#EF4444' : 'rgba(248,113,113,.6)' }} onClick={onLogout}>
                    <LogOut size={14} strokeWidth={1.6} />
                    <span>Sign Out</span>
                </div>
            </div>
        </div>
    );
};

export const Topbar = ({ title, sub, dk, unread = 2, onNotificationClick, onRefresh, showNotification = true }) => {
    const t = dk ? DK : LT;

    return (
        <div className={dk ? 'tb-dk' : 'tb-lt'}>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.28rem' }}>
                    <span
                        style={{
                            fontFamily: 'JetBrains Mono,monospace',
                            fontSize: '.56rem',
                            color: t.muted,
                            textTransform: 'uppercase',
                            letterSpacing: '.08em',
                        }}
                    >
                        Dashboard
                    </span>
                    <ChevronRight size={10} style={{ color: t.muted }} />
                    <span
                        style={{
                            fontFamily: 'JetBrains Mono,monospace',
                            fontSize: '.56rem',
                            color: dk ? 'rgba(255,255,255,.75)' : LT.teal,
                            textTransform: 'uppercase',
                            letterSpacing: '.08em',
                        }}
                    >
                        {title}
                    </span>
                </div>

                {sub && <div style={{ fontSize: '.7rem', color: t.muted, marginTop: 1 }}>{sub}</div>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '.55rem' }}>
                <button 
                    className={`btn ${dk ? 'btn-gh' : 'btn-ng'}`}
                    onClick={() => {
                        if (onRefresh) {
                            onRefresh();
                        } else {
                            window.location.reload();
                        }
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    <RefreshCw size={12} />
                    Refresh
                </button>

                {showNotification && (
                    <button
                        onClick={onNotificationClick}
                        style={{
                            position: 'relative',
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            background: dk ? 'rgba(255,255,255,.06)' : '#F9FAFB',
                            border: `1px solid ${t.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        <Bell size={14} style={{ color: t.text }} />
                        {unread > 0 && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 7,
                                    right: 7,
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    background: dk ? '#fff' : LT.teal,
                                }}
                            />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export { getTheme };