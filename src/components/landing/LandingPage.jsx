import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu, X, ArrowRight, MapPin, Phone, Mail, Clock,
  Cpu, Database, LayoutTemplate, Activity, Leaf,
  Microscope, Monitor, Landmark, Trophy, Library, GraduationCap, LogIn, ChevronDown, BookOpen, Shield
} from 'lucide-react';
import gsap from 'gsap';

/* ==========================================================================
   GLOBAL RESPONSIVE STYLES
   ========================================================================== */
const GlobalResponsiveStyles = () => (
  <style>{`
    /* ─── REVEAL ANIMATION ─────────────────────────────────────────── */
    .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
    .reveal.visible { opacity: 1; transform: translateY(0); }

    /* ─── NAV LINK ACTIVE UNDERLINE ────────────────────────────────── */
    .nav-link::after { content:''; position:absolute; bottom:0; left:0; width:0; height:1px; background:currentColor; transition:width 0.3s ease; }
    .nav-link:hover::after, .nav-link.active::after { width:100%; }

    /* ─── BTN PRIMARY ──────────────────────────────────────────────── */
    .btn-primary { display:inline-flex; align-items:center; justify-content:center; padding:0.75rem 2rem; background:var(--color-navy,#1a2744); color:#fff; font-family:monospace; font-size:0.7rem; letter-spacing:0.15em; text-transform:uppercase; border:none; cursor:pointer; text-decoration:none; transition:background 0.2s, color 0.2s; }
    .btn-primary:hover { background:var(--color-gold,#b4913c); }

    /* ══════════════════════════════════════════════════════════════════
       NAVBAR
    ══════════════════════════════════════════════════════════════════ */
    @media (max-width: 1023px) {
      .hub-dropdown { width: 100% !important; position: static !important; box-shadow: none !important; border-top: 1px solid var(--color-border,#e5e7eb) !important; animation: none !important; margin-top: 0.5rem; }
    }

    /* ══════════════════════════════════════════════════════════════════
       HERO
    ══════════════════════════════════════════════════════════════════ */
    @media (max-width: 767px) {
      .hero-recruiter-inner { flex-direction: column !important; align-items: flex-start !important; gap: 0.75rem !important; }
      .hero-brands { gap: 1.25rem !important; flex-wrap: wrap !important; }
      .hero-badge { flex-wrap: wrap; }
    }

    /* ══════════════════════════════════════════════════════════════════
       ABOUT / SLIDESHOW
    ══════════════════════════════════════════════════════════════════ */
    @media (max-width: 767px) {
      .about-content-panel { padding: 0 6vw !important; }
      .about-stats { gap: 1.5rem 2rem !important; }
      .about-bottom-bar { padding: 1rem 6vw !important; }
      .about-body { font-size: 0.82rem !important; }
      .about-heading { font-size: clamp(1.6rem, 6vw, 2.4rem) !important; }
    }
    @media (max-width: 480px) {
      .about-stats { display: grid !important; grid-template-columns: 1fr 1fr !important; }
    }

    /* ══════════════════════════════════════════════════════════════════
       PROGRAMMES
    ══════════════════════════════════════════════════════════════════ */
    .prog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.8rem 5vw;
      border-bottom: 1px solid #E0DDD8;
    }
    .prog-body {
      flex: 1;
      display: grid;
      grid-template-columns: 42% 1fr;
      min-height: calc(100vh - 68px);
    }
    .prog-list {
      border-right: 1px solid #E0DDD8;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 1.5rem 4vw 1.5rem 5vw;
    }
    .prog-detail {
      position: relative;
      overflow: hidden;
      background: #FFFFFF;
    }
    .prog-header-right { display: flex; align-items: center; gap: 1.4rem; }

    @media (max-width: 1023px) {
      .prog-body {
        grid-template-columns: 1fr !important;
        min-height: unset !important;
      }
      .prog-list {
        border-right: none !important;
        border-bottom: 1px solid #E0DDD8;
        justify-content: flex-start !important;
        padding: 1.5rem 5vw !important;
        max-height: none !important;
      }
      .prog-detail {
        min-height: 520px;
      }
    }

    @media (max-width: 767px) {
      .prog-header {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 0.5rem !important;
        padding: 1rem 5vw !important;
      }
      .prog-header-right { display: none !important; }
      .prog-detail-inner { padding: 1.75rem 5vw !important; }
      .prog-two-col { grid-template-columns: 1fr !important; }
      .prog-ghost { display: none !important; }
      .prog-meta-row { flex-direction: column !important; align-items: flex-start !important; }
      .prog-meta-stats { flex-wrap: wrap; gap: 1rem 1.5rem !important; }
    }

    @media (max-width: 480px) {
      .prog-list-btn { padding: 0.75rem 0 !important; }
      .prog-list-btn-name { font-size: 0.95rem !important; }
    }

    /* ══════════════════════════════════════════════════════════════════
       CAMPUS LIFE
    ══════════════════════════════════════════════════════════════════ */
    .campus-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      grid-template-rows: 300px 300px;
      gap: 1px;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 6px;
      overflow: hidden;
    }
    .campus-card-large { grid-row: span 2; }

    @media (max-width: 1023px) {
      .campus-grid {
        grid-template-columns: 1fr 1fr !important;
        grid-template-rows: 240px 240px 240px !important;
      }
      .campus-card-large { grid-row: span 1 !important; grid-column: span 2 !important; }
    }

    @media (max-width: 767px) {
      .campus-grid {
        grid-template-columns: 1fr !important;
        grid-template-rows: repeat(5, 220px) !important;
        border-radius: 4px;
      }
      .campus-card-large { grid-column: span 1 !important; }
      .campus-section-header { margin-top: 0 !important; }
    }

    /* ══════════════════════════════════════════════════════════════════
       ADMISSIONS
    ══════════════════════════════════════════════════════════════════ */
    @media (max-width: 767px) {
      .admissions-header { margin-bottom: 2.5rem !important; }
    }

    /* ══════════════════════════════════════════════════════════════════
       CONTACT
    ══════════════════════════════════════════════════════════════════ */
    @media (max-width: 767px) {
      .contact-grid { grid-template-columns: 1fr !important; }
    }

    /* ══════════════════════════════════════════════════════════════════
       FOOTER
    ══════════════════════════════════════════════════════════════════ */
    @media (max-width: 767px) {
      .footer-bottom { flex-direction: column !important; text-align: center; gap: 0.75rem !important; }
    }

    /* ══════════════════════════════════════════════════════════════════
       UTILITY: hide scrollbar on mobile carousels
    ══════════════════════════════════════════════════════════════════ */
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

/* ==========================================================================
   FACTUAL DATA
   ========================================================================== */
const timeline = [
  { year: "1916", text: "University of Mysore founded by Nalwadi Krishnaraja Wodeyar, establishing a century-old legacy of excellence." },
  { year: "1960", text: "Relocation to the historic 739-acre Manasagangotri campus, the 'Fountainhead of the Ganges of the Mind'." },
  { year: "2021", text: "Mysore University School of Engineering (MUSE) established in alignment with NEP-2020 to offer multi-disciplinary tech education." },
  { year: "2024", text: "Expansion of AICTE-approved B.E. programs and establishment of advanced robotics and AI computing laboratories." }
];

const admissionSteps = [
  { step: "01", title: "Review AICTE Programs", desc: "Explore our 5 specialized B.E. programs. Ensure you meet the 10+2 eligibility criteria for technical education." },
  { step: "02", title: "Entrance Examination (KEA)", desc: "50% of our seats are filled via Karnataka Examination Authority (KCET). The remaining 50% are under the self-financing scheme." },
  { step: "03", title: "Submit Application", desc: "Apply via our dedicated portal. Upload academic transcripts, entrance scorecards, and necessary identification." },
  { step: "04", title: "Counselling & Enrollment", desc: "Attend document verification, finalize your branch selection, and complete your registration at the MUSE administrative office." }
];

/* ==========================================================================
   HOOKS
   ========================================================================== */
const useScrollReveal = (options = {}) => {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const { stagger = false } = options;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains('reveal')) entry.target.classList.add('visible');
          if (stagger) {
            const reveals = entry.target.querySelectorAll('.reveal');
            Array.from(reveals).forEach((child, idx) => {
              child.style.transitionDelay = `${idx * 0.12}s`;
              child.classList.add('visible');
            });
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [options.stagger]);
  return ref;
};

const useActiveSection = () => {
  const [active, setActive] = useState('home');
  useEffect(() => {
    const sections = document.querySelectorAll('[data-section]');
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); }); },
      { threshold: 0.4 }
    );
    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, []);
  return active;
};

/* ==========================================================================
   CANVAS
   ========================================================================== */
const KnowledgeGraphCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let mouse = { x: -9999, y: -9999 };
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const onMouseMove = (e) => { const rect = canvas.getBoundingClientRect(); mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top; };
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
    const NODE_COUNT = 100, CONNECTION_DIST = 175, MOUSE_REPEL_DIST = 110;
    const rand = (min, max) => Math.random() * (max - min) + min;
    const makeNode = () => {
      const kind = Math.random();
      return { x: rand(0, canvas.width), y: rand(0, canvas.height), vx: rand(-0.3, 0.3), vy: rand(-0.3, 0.3), r: kind > 0.93 ? rand(5, 8) : kind > 0.76 ? rand(2.5, 4) : rand(1, 2), type: kind > 0.93 ? 'hub' : kind > 0.76 ? 'mid' : 'small', pulse: rand(0, Math.PI * 2), pulseSpeed: rand(0.02, 0.055) };
    };
    let nodes = Array.from({ length: NODE_COUNT }, makeNode);
    const draw = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      nodes.forEach(n => {
        n.pulse += n.pulseSpeed;
        const dx = n.x - mouse.x, dy = n.y - mouse.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_REPEL_DIST && dist > 0) { const force = (MOUSE_REPEL_DIST - dist) / MOUSE_REPEL_DIST; n.vx += (dx / dist) * force * 0.35; n.vy += (dy / dist) * force * 0.35; }
        n.vx *= 0.996; n.vy *= 0.996;
        const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (speed < 0.04) { n.vx += rand(-0.04, 0.04); n.vy += rand(-0.04, 0.04); }
        n.x += n.vx; n.y += n.vy;
        if (n.x < -20) n.x = canvas.width + 20; if (n.x > canvas.width + 20) n.x = -20;
        if (n.y < -20) n.y = canvas.height + 20; if (n.y > canvas.height + 20) n.y = -20;
      });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = 1 - dist / CONNECTION_DIST, isHub = a.type === 'hub' || b.type === 'hub', isMid = a.type === 'mid' || b.type === 'mid';
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            if (isHub && dist < 130) { ctx.strokeStyle = `rgba(200,225,245,${alpha * 0.55})`; ctx.lineWidth = alpha * 1.1; }
            else if (isMid && dist < 150) { ctx.strokeStyle = `rgba(100,175,215,${alpha * 0.45})`; ctx.lineWidth = alpha * 0.75; }
            else { ctx.strokeStyle = `rgba(90,150,200,${alpha * 0.18})`; ctx.lineWidth = alpha * 0.5; }
            ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        const glow = 0.65 + 0.35 * Math.sin(n.pulse);
        if (n.type === 'hub') {
          const outer = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6);
          outer.addColorStop(0, `rgba(130,195,245,${0.28 * glow})`); outer.addColorStop(1, 'rgba(130,195,245,0)');
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2); ctx.fillStyle = outer; ctx.fill();
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r * glow, 0, Math.PI * 2); ctx.fillStyle = `rgba(160,215,255,${0.9 * glow})`; ctx.fill();
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 0.4, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,1)'; ctx.fill();
        } else if (n.type === 'mid') {
          const mid = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
          mid.addColorStop(0, `rgba(70,155,215,${0.35 * glow})`); mid.addColorStop(1, 'rgba(70,155,215,0)');
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2); ctx.fillStyle = mid; ctx.fill();
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r * glow, 0, Math.PI * 2); ctx.fillStyle = `rgba(90,175,230,${0.9 * glow})`; ctx.fill();
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 0.38, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill();
        } else {
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r * glow, 0, Math.PI * 2); ctx.fillStyle = `rgba(140,190,230,${0.4 + 0.3 * glow})`; ctx.fill();
        }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); canvas.removeEventListener('mousemove', onMouseMove); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" style={{ display: 'block' }} />;
};

/* ==========================================================================
   NAVBAR
   ========================================================================== */
const Navbar = ({ activeSection, onPortalLogin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hubOpen, setHubOpen] = useState(false);
  const [mobileHubOpen, setMobileHubOpen] = useState(false);
  const hubRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => { if (hubRef.current && !hubRef.current.contains(e.target)) setHubOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const links = ['Home', 'Institute', 'B.E. Courses', 'Facilities', 'Admissions', 'Contact'];
  const portals = [
    { label: 'Student Portal', icon: GraduationCap, href: '#student-login', desc: 'Access academics & results' },
    { label: 'Teacher Portal', icon: BookOpen, href: '#teacher-login', desc: 'Manage courses & attendance' },
    { label: 'Admin Portal', icon: Shield, href: '#admin-login', desc: 'Institution administration' },
  ];

  return (
    <>
      <style>{`
        .hub-dropdown {
          position: absolute; top: calc(100% + 12px); right: 0; width: 280px;
          background: rgba(255, 255, 255, 0.95); border: 1px solid rgba(26, 39, 68, 0.08);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 24px 48px rgba(26, 39, 68, 0.12); z-index: 100;
          transform-origin: top right; animation: hubReveal 0.2s cubic-bezier(0.16,1,0.3,1) forwards;
          border-radius: 12px; overflow: hidden;
        }
        @keyframes hubReveal { from{opacity:0;transform:scale(0.95) translateY(-6px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .portal-row { display:flex; align-items:center; gap:0.875rem; padding:1rem 1.2rem; border-bottom:1px solid rgba(26, 39, 68, 0.05); text-decoration:none; transition:all 0.2s ease; cursor:pointer; }
        .portal-row:last-child { border-bottom:none; }
        .portal-row:hover { background: #1A2744; padding-left: 1.5rem; }
        .portal-row:hover p { color: #fff !important; }
        .portal-row:hover .portal-icon { background:#fff; transform: scale(1.05); }
        .portal-row:hover .portal-arrow { opacity:1; transform:translateX(0); }
        .portal-icon { width:36px; height:36px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:#fff; box-shadow: 0 4px 12px rgba(0,0,0,0.08); transition:all 0.2s ease; }
        .portal-arrow { margin-left:auto; opacity:0; transform:translateX(-4px); transition:opacity 0.2s,transform 0.2s; color:#fff; }
        .hub-btn { display:flex; align-items:center; gap:0.5rem; font-family:monospace; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; padding:0.6rem 1rem; border:1px solid currentColor; background:transparent; cursor:pointer; transition:background 0.2s,color 0.2s,border-color 0.2s; white-space:nowrap; }
        .hub-btn-chevron { transition:transform 0.2s; }
        .hub-btn-chevron.open { transform:rotate(180deg); }
      `}</style>

      <nav className={`fixed w-full z-50 transition-all duration-500 border-b ${scrolled ? 'bg-surface/80 backdrop-blur-md border-border py-4 text-navy' : 'bg-transparent border-transparent py-6 text-white'} px-8 lg:px-16`}>
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">

          {/* Logo */}
          <a href="#home" className="flex items-center gap-3 group flex-shrink-0">
            <img src="/mysore_logo.png" alt="MUSE Logo" className="w-14 h-14 lg:w-16 lg:h-16 object-contain transition-transform duration-300 group-hover:scale-105" />



            <div className="flex flex-col">
              <span className={`font-sans font-semibold tracking-tight text-lg lg:text-xl font-semibold leading-none tracking-tight ${scrolled ? 'text-navy' : 'text-white'}`}>MUSE</span>
              <span className={`font-mono text-[0.5rem] lg:text-[0.55rem] uppercase tracking-[0.1em] mt-1.5 ${scrolled ? 'text-muted' : 'text-white/70'}`}>School of Engineering</span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map(link => {
              const id = link.split(' ')[0].toLowerCase();
              return (
                <a key={id} href={`#${id}`} className={`relative font-sans text-xs font-medium uppercase tracking-widest pb-1 nav-link ${activeSection === id ? 'text-gold active' : (scrolled ? 'text-navy hover:text-gold transition-colors' : 'text-white hover:text-gold transition-colors')}`}>
                  {link}
                </a>
              );
            })}
          </div>

          {/* Desktop Login Hub */}
          <div className="hidden lg:block" ref={hubRef} style={{ position: 'relative' }}>
            <button className="hub-btn" style={{ color: scrolled ? 'var(--color-navy)' : '#fff' }} onClick={() => setHubOpen((o) => !o)}>
              <LogIn size={13} strokeWidth={1.5} />
              Login Hub
              <ChevronDown size={12} strokeWidth={2} className={`hub-btn-chevron ${hubOpen ? 'open' : ''}`} />
            </button>
            {hubOpen && (
              <div className="hub-dropdown">
                <div style={{ padding: '0.75rem 1.2rem', borderBottom: '1px solid rgba(26, 39, 68, 0.05)', background: 'rgba(26, 39, 68, 0.02)' }}>
                  <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-navy/40">Select Portal</p>
                </div>
                {portals.map(({ label, icon: Icon, href, desc }) => (
                  <a key={label} href={href} className="portal-row" onClick={(e) => { e.preventDefault(); setHubOpen(false); onPortalLogin(href.replace('#', '').replace('-login', '')); }}>
                    <div className="portal-icon"><Icon size={15} strokeWidth={1.5} className="text-black" /></div>
                    <div>
                      <p className="font-sans text-sm font-semibold text-navy leading-none mb-1" style={{ letterSpacing: '0.01em' }}>{label}</p>
                      <p className="font-sans text-[0.7rem] text-navy/50" style={{ letterSpacing: '0.01em' }}>{desc}</p>
                    </div>
                    <div className="portal-arrow">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className={`${scrolled ? 'text-navy' : 'text-white'} lg:hidden p-1`} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-surface border-b border-border flex flex-col px-8 py-6 gap-5 shadow-2xl lg:hidden text-navy overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
            {links.map(link => (
              <a key={link} href={`#${link.split(' ')[0].toLowerCase()}`} onClick={() => setIsOpen(false)} className="font-sans font-semibold tracking-tight text-xl">
                {link}
              </a>
            ))}

            {/* Mobile Login Hub */}
            <div style={{ borderTop: '1px solid var(--color-border,#e5e7eb)', paddingTop: '1.25rem' }}>
              <button onClick={() => setMobileHubOpen((o) => !o)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <LogIn size={14} strokeWidth={1.5} className="text-gold" />
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-navy">Login Hub</span>
                <ChevronDown size={13} strokeWidth={2} className="text-muted" style={{ marginLeft: '0.25rem', transition: 'transform 0.2s', transform: mobileHubOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>
              {mobileHubOpen && (
                <div style={{ marginTop: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {portals.map(({ label, icon: Icon, href }) => (
                    <a key={label} href={href} onClick={(e) => { e.preventDefault(); setIsOpen(false); setMobileHubOpen(false); onPortalLogin(href.replace('#', '').replace('-login', '')); }} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', border: '1px solid var(--color-border,#e5e7eb)', textDecoration: 'none', background: 'var(--color-bg,#fff)' }}>
                      <Icon size={15} strokeWidth={1.5} className="text-gold" />
                      <span className="font-sans text-sm text-navy font-medium">{label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

/* ==========================================================================
   HERO
   ========================================================================== */
const Hero = () => {
  const contentRef = useRef(null);
  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(contentRef.current.children, { opacity: 0, y: 40, stagger: 0.15, duration: 1.2, ease: 'power3.out', delay: 0.3 });
    }, contentRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="home" data-section="home" className="relative h-screen min-h-[800px] flex flex-col justify-center items-center overflow-hidden" style={{ background: '#000000' }}>
      <KnowledgeGraphCanvas />
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, transparent 0%, rgba(0,0,0,0.60) 100%)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-40 z-[2] pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, #000000)' }} />

      <div ref={contentRef} className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-4xl mx-auto mt-0">
        <div className="hero-badge flex items-center gap-3 p-1 pr-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
          <span className="bg-white text-navy font-sans text-[0.65rem] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full whitespace-nowrap">Latest</span>
          <span className="font-sans text-[0.75rem] text-white/90 font-medium">Admissions Open for 2026–27</span>
        </div>
        <h1 className="font-sans font-extrabold tracking-tighter text-[clamp(2rem,6vw,5.5rem)] text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60 leading-[1.05] mb-8 drop-shadow-2xl">
          Engineering the <br className="hidden sm:block" /> Future of Technology.
        </h1>
        <p className="font-sans text-[clamp(0.9rem,1.2vw,1.15rem)] text-white/70 leading-relaxed max-w-2xl mb-12">
          Mysore University School of Engineering (MUSE). The unified workspace for problem-solving, innovation, and technical mastery under a century-old academic legacy.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <a href="#b.e." className="bg-white text-navy font-sans text-sm font-semibold px-8 py-4 rounded-full hover:bg-gold hover:text-white transition-all duration-300 w-full sm:w-auto text-center">Explore Programmes</a>
          <a href="#institute" className="text-white font-sans text-sm font-medium hover:text-gold transition-colors flex items-center gap-2 px-4 py-4">Learn More</a>
        </div>
      </div>

      {/* Recruiter strip
      <div className="absolute bottom-0 left-0 w-full border-t border-white/10 bg-black/20 backdrop-blur-md z-20">
        <div className="hero-recruiter-inner max-w-[1400px] mx-auto px-8 lg:px-16 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <span className="font-sans text-xs text-white/50 flex-shrink-0">Top industry recruiters for MUSE graduates</span>
          <div className="hero-brands flex flex-wrap items-center gap-6 md:gap-14 opacity-70">
            <span className="font-sans text-base lg:text-lg font-bold tracking-[0.2em] text-white">TCS</span>
            <span className="font-sans font-semibold tracking-tight text-lg lg:text-xl font-bold italic text-white">Infosys</span>
            <span className="font-mono text-base lg:text-lg font-semibold tracking-wider text-white">IBM</span>
            <span className="font-sans text-lg lg:text-xl font-black tracking-tighter text-white">BOSCH</span>
            <span className="font-sans text-base lg:text-lg font-medium tracking-widest text-white">INTEL</span>
          </div>
        </div>
      </div> */}
    </section>
  );
};

/* ==========================================================================
   ABOUT / SLIDESHOW
   ========================================================================== */
const slides = [
  { id: 1, image: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2066&auto=format&fit=crop', tag: '// Our Legacy', year: '1916', heading: 'A Century of Academic Excellence', body: `The University of Mysore was founded on 27 July 1916 under Maharaja Krishnaraja Wadiyar IV — the first university outside British-administered India and the sixth in the entire subcontinent. Spanning a lush 739-acre Manasagangotri campus, it has grown into one of Karnataka's most distinguished institutions, earning NAAC Grade A+ accreditation and a Top 54 NIRF ranking among Indian universities in 2024.`, stats: [{ num: '108+', label: 'Years of Operation' }, { num: 'NAAC A+', label: 'Accreditation' }, { num: '54th', label: 'NIRF 2024 Rank' }], accent: '#00797B' },
  { id: 2, image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=2070&auto=format&fit=crop', tag: '// The Engineering School', year: '2021', heading: 'Mysore University School of Engineering', body: `Established in 2021–22 under NEP-2020, MUSE is the first integral engineering institute under the Faculty of Engineering, University of Mysore. AICTE-approved with 60 seats per branch, the school offers five future-ready B.E. programmes — AI & ML, AI & Data Science, Computer Science & Design, Biomedical & Robotic Engineering, and Civil Environmental Engineering — each designed around Industry 4.0 competencies.`, stats: [{ num: '5', label: 'B.E. Programmes' }, { num: '300+', label: 'Total Seats' }, { num: 'AICTE', label: 'Approved' }], accent: '#00797B' },
  { id: 3, image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop', tag: '// Pedagogy & Research', year: 'NEP 2020', heading: 'Learning Built for the Real World', body: `MUSE integrates project-based learning, live industry projects, and patent-filing support into every semester. Faculty holding Ph.D. qualifications mentor students through dedicated research centres in Artificial Intelligence and Sustainable Technologies. The curriculum is continuously reviewed against global engineering standards to bridge the gap between theory and high-impact practical application across all five branches.`, stats: [{ num: 'Ph.D.', label: 'Faculty Qualification' }, { num: '2', label: 'Research Centres' }, { num: '100%', label: 'Project-Based Learning' }], accent: '#00797B' },
  { id: 4, image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2028&auto=format&fit=crop', tag: '// Knowledge Infrastructure', year: '800,000+', heading: "One of India's Largest University Libraries", body: `The UoM Central Library houses over 800,000 volumes, 2,400 journal titles, and 100,000 volumes of journals — one of the most comprehensive academic collections in South India. Students at MUSE enjoy unrestricted access to IEEE digital repositories, Springer, Elsevier, and rare Kannada manuscripts. The 739-acre Manasagangotri campus is fully Wi-Fi enabled to support round-the-clock digital research.`, stats: [{ num: '8L+', label: 'Library Volumes' }, { num: '2,400', label: 'Journal Titles' }, { num: '739ac', label: 'Campus Area' }], accent: '#00797B' },
  { id: 5, image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop', tag: '// Campus Life', year: 'Manasagangotri', heading: '"Fountainhead of the Ganges of the Mind"', body: `The Manasagangotri campus — whose name translates as the fountainhead of the Ganges of the Mind — is a self-contained academic ecosystem. Facilities include an amphitheatre, auditorium, Olympic-standard swimming pool, indoor stadium, and separate hostel accommodations for men and women. Transport is provided across the city, and a sustainability charter is in place targeting a carbon-neutral campus by 2035.`, stats: [{ num: '2', label: 'Hostel Blocks' }, { num: 'Olympic', label: 'Swimming Pool' }, { num: '2035', label: 'Carbon Neutral Target' }], accent: '#00797B' },
];

const About = () => {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [contentKey, setContentKey] = useState(0);
  const intervalRef = useRef(null);
  const DURATION = 6000;

  const goTo = useCallback((idx) => {
    if (animating || idx === current) return;
    setAnimating(true); setPrev(current); setCurrent(idx); setContentKey(k => k + 1);
    setTimeout(() => { setPrev(null); setAnimating(false); }, 900);
  }, [animating, current]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);
  const back = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo]);

  const resetInterval = useCallback(() => { clearInterval(intervalRef.current); intervalRef.current = setInterval(next, DURATION); }, [next]);
  useEffect(() => { resetInterval(); return () => clearInterval(intervalRef.current); }, [resetInterval]);

  const handleNav = (idx) => { goTo(idx); resetInterval(); };
  const slide = slides[current];
  const prevSlide = prev !== null ? slides[prev] : null;

  return (
    <section id="institute" data-section="institute" className="relative overflow-hidden" style={{ height: '100vh', minHeight: '600px' }}>
      {prevSlide && (
        <div key={`bg-prev-${prev}`} className="absolute inset-0 z-0" style={{ animation: 'bgFadeOut 0.9s ease forwards' }}>
          <img src={prevSlide.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.62)' }} />
        </div>
      )}
      <div key={`bg-curr-${current}`} className="absolute inset-0 z-[1]" style={{ animation: 'bgFadeIn 1.1s ease forwards' }}>
        <img src={slide.image} alt={slide.heading} className="w-full h-full object-cover" style={{ animation: 'bgZoom 8s ease forwards' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.20) 100%)' }} />
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-30" style={{ height: '2px', background: 'rgba(255,255,255,0.10)' }}>
        <div key={`prog-${current}`} style={{ height: '100%', background: slide.accent, animation: `progressFill ${DURATION}ms linear forwards`, transformOrigin: 'left' }} />
      </div>

      {/* Content panel */}
      <div className="about-content-panel absolute inset-0 z-20 flex flex-col justify-center" style={{ padding: '0 5vw' }}>
        <div key={`content-${contentKey}`} className="max-w-xl" style={{ animation: 'contentSlideIn 0.75s cubic-bezier(0.22,1,0.36,1) forwards' }}>
          <div className="flex items-center gap-3 mb-5" style={{ animation: 'contentSlideIn 0.65s 0.05s cubic-bezier(0.22,1,0.36,1) both' }}>
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em]" style={{ color: slide.accent }}>{slide.tag}</span>
            <span className="font-sans font-semibold tracking-tight text-sm italic" style={{ color: 'rgba(255,255,255,0.4)' }}>{slide.year}</span>
          </div>
          <h2 className="about-heading font-sans font-semibold tracking-tight font-semibold text-white leading-tight mb-6" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3.2rem)', animation: 'contentSlideIn 0.7s 0.12s cubic-bezier(0.22,1,0.36,1) both', textShadow: '0 2px 30px rgba(0,0,0,0.6)' }}>
            {slide.heading}
          </h2>
          <div style={{ width: '52px', height: '2px', background: slide.accent, marginBottom: '1.4rem', animation: 'contentSlideIn 0.7s 0.18s cubic-bezier(0.22,1,0.36,1) both' }} />
          <p className="about-body font-sans leading-relaxed mb-8" style={{ fontSize: 'clamp(0.82rem, 1.05vw, 1rem)', color: 'rgba(255,255,255,0.75)', animation: 'contentSlideIn 0.7s 0.24s cubic-bezier(0.22,1,0.36,1) both' }}>
            {slide.body}
          </p>
          <div className="about-stats flex gap-8 flex-wrap" style={{ animation: 'contentSlideIn 0.7s 0.33s cubic-bezier(0.22,1,0.36,1) both' }}>
            {slide.stats.map((s, i) => (
              <div key={i}>
                <div className="font-sans font-semibold tracking-tight font-bold leading-none" style={{ fontSize: 'clamp(1.25rem, 2vw, 1.75rem)', color: slide.accent }}>{s.num}</div>
                <div className="font-mono uppercase tracking-widest mt-1" style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.45)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Thumbnail strip — desktop only */}
      <div className="absolute right-0 top-0 bottom-0 z-20 hidden lg:flex flex-col justify-center" style={{ padding: '0 2rem', gap: '0.6rem' }}>
        {slides.map((s, i) => (
          <button key={s.id} onClick={() => handleNav(i)} className="relative overflow-hidden rounded-sm transition-all duration-500 block" style={{ width: i === current ? '100px' : '72px', height: '56px', opacity: i === current ? 1 : 0.45, outline: i === current ? `2px solid ${slide.accent}` : '2px solid transparent', outlineOffset: '2px', transition: 'all 0.4s ease' }}>
            <img src={s.image} alt={s.heading} className="w-full h-full object-cover" />
            {i === current && <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.25)' }} />}
          </button>
        ))}
      </div>

      {/* Bottom controls */}
      <div className="about-bottom-bar absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between" style={{ padding: '1.2rem 5vw', background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)' }}>
        {/* Mobile dot strip - scrollable */}
        <div className="flex items-center gap-2 no-scrollbar overflow-x-auto">
          {slides.map((_, i) => (
            <button key={i} onClick={() => handleNav(i)} style={{ width: i === current ? '28px' : '8px', height: '3px', borderRadius: '2px', background: i === current ? slide.accent : 'rgba(255,255,255,0.3)', transition: 'all 0.4s ease', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }} />
          ))}
        </div>
        <div className="flex items-center gap-3 md:gap-5">
          <span className="font-mono hidden sm:block" style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>
            {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </span>
          {[{ fn: () => { back(); resetInterval(); }, label: '←' }, { fn: () => { next(); resetInterval(); }, label: '→' }].map(({ fn, label }) => (
            <button key={label} onClick={fn} className="flex items-center justify-center rounded-sm transition-all duration-200" style={{ width: '34px', height: '34px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', fontSize: '1rem', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.background = slide.accent; e.currentTarget.style.borderColor = slide.accent; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes bgFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes bgFadeOut { from{opacity:1} to{opacity:0} }
        @keyframes bgZoom { from{transform:scale(1.04)} to{transform:scale(1.00)} }
        @keyframes contentSlideIn { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes progressFill { from{width:0%} to{width:100%} }
      `}</style>
    </section>
  );
};

/* ==========================================================================
   PROGRAMMES
   ========================================================================== */
const disciplines = [
  { id: 1, code: '01', shortName: 'AI & ML', fullName: 'Artificial Intelligence & Machine Learning', degree: 'B.E.', accent: '#C9972B', accentDim: 'rgba(201,151,43,0.08)', seats: 60, duration: '4 Years', status: 'open', tagline: 'Build machines that think.', description: 'This programme trains engineers to design and deploy autonomous intelligent systems. Students master deep learning architectures, reinforcement learning, computer vision, and NLP, graduating as specialists capable of building production-grade AI systems across healthcare, finance, robotics, and beyond.', specializations: ['Deep Learning & Neural Architectures', 'Computer Vision & Image Processing', 'Natural Language Processing', 'Autonomous Systems & Robotics AI'], careers: ['ML Engineer', 'AI Researcher', 'Data Scientist', 'Robotics Engineer'], icon: 'o' },
  { id: 2, code: '02', shortName: 'AI & DS', fullName: 'Artificial Intelligence & Data Science', degree: 'B.E.', accent: '#00797B', accentDim: 'rgba(0,121,123,0.08)', seats: 60, duration: '4 Years', status: 'open', tagline: 'Turn data into decisions.', description: 'An intersection of statistics, machine learning, and software engineering designed for the data-driven economy. Students learn to architect data pipelines, build predictive models, and derive actionable insights from massive datasets, skills that power every industry in the modern world.', specializations: ['Big Data Engineering & Analytics', 'Predictive Modelling & Forecasting', 'Business Intelligence Dashboards', 'Cloud Data Architecture (AWS / Azure)'], careers: ['Data Engineer', 'Analytics Lead', 'BI Analyst', 'AI Product Manager'], icon: '*' },
  { id: 3, code: '03', shortName: 'CS & Design', fullName: 'Computer Science & Design', degree: 'B.E.', accent: '#8B5E3C', accentDim: 'rgba(139,94,60,0.08)', seats: 60, duration: '4 Years', status: 'open', tagline: 'Code what people love.', description: 'The only programme in Karnataka that fuses rigorous computer science with human-centred design methodology. Students graduate fluent in both software engineering and UX thinking, able to conceive, design, and build complete digital products from first principles.', specializations: ['Human-Computer Interaction & UX Research', 'Full-Stack Software Engineering', 'Interaction Design & Prototyping', 'Design Systems & Product Strategy'], careers: ['Product Designer', 'Full-Stack Developer', 'UX Engineer', 'Creative Technologist'], icon: '+' },
  { id: 4, code: '04', shortName: 'Biomedical', fullName: 'Biomedical & Robotic Engineering', degree: 'B.E.', accent: '#C9972B', accentDim: 'rgba(201,151,43,0.08)', seats: 60, duration: '4 Years', status: 'open', tagline: 'Engineer the human body.', description: 'A convergent discipline at the frontier of medicine and machine intelligence. Students learn to design prosthetics, surgical robots, diagnostic imaging systems, and AI-driven healthcare automation, bridging the gap between biomedical science and cutting-edge robotics.', specializations: ['Surgical & Rehabilitation Robotics', 'Medical Imaging & Diagnostics AI', 'Neural Engineering & BCI', 'Wearable Health Monitoring Systems'], careers: ['Biomedical Engineer', 'Healthcare AI Developer', 'Robotics Designer', 'Clinical Engineer'], icon: 'x' },
  { id: 5, code: '05', shortName: 'Civil Env', fullName: 'Civil Environmental Engineering', degree: 'B.E.', accent: '#00797B', accentDim: 'rgba(0,121,123,0.08)', seats: 60, duration: '4 Years', status: 'soon', tagline: 'Build cities. Save the planet.', description: 'A forward-looking programme merging civil engineering with environmental science, green infrastructure, and smart city planning. Students tackle the defining challenge of the century, building sustainable, resilient urban ecosystems that can endure climate change and resource scarcity.', specializations: ['Smart City Infrastructure & IoT', 'Environmental Impact Assessment', 'Sustainable Construction Technologies', 'Water Resource Management'], careers: ['Structural Engineer', 'Smart City Planner', 'Environmental Consultant', 'Infrastructure Analyst'], icon: '^' },
  { id: 6, code: '06', shortName: 'CSE', fullName: 'Computer Science Engineering', degree: 'B.E.', accent: '#1A2744', accentDim: 'rgba(26,39,68,0.07)', seats: 60, duration: '4 Years', status: 'open', tagline: 'Master the machine.', description: 'The foundational engineering discipline for the digital age. Students gain deep expertise in algorithms, operating systems, compiler design, computer networks, database systems, and software engineering, forming the bedrock from which all other computing disciplines emerge.', specializations: ['Algorithms & Computational Theory', 'Operating Systems & Compiler Design', 'Computer Networks & Cybersecurity', 'Database Systems & Cloud Computing'], careers: ['Software Engineer', 'Systems Architect', 'Cybersecurity Analyst', 'Cloud Solutions Engineer'], icon: '#' },
  { id: 7, code: '07', shortName: 'ECE', fullName: 'Electronics & Communication Engineering', degree: 'B.E.', accent: '#8B5E3C', accentDim: 'rgba(139,94,60,0.08)', seats: 60, duration: '4 Years', status: 'open', tagline: 'Connect the world.', description: 'A core engineering branch bridging hardware design, embedded systems, and telecommunications. Students master analog and digital circuits, VLSI, microprocessors, and wireless networks, paving the way for innovations in IoT, 5G/6G, and space communication.', specializations: ['Embedded Systems & IoT', 'VLSI Design & Architecture', 'Wireless & Satellite Communication', 'Signal & Image Processing'], careers: ['Hardware Engineer', 'Network Architect', 'Embedded Developer', 'Telecommunications Specialist'], icon: '~' },
];

const Programmes = () => {
  const [active, setActive] = useState(0);
  const [panelKey, setPanelKey] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const disc = disciplines[active];

  const activate = (idx) => { if (idx === active) return; setActive(idx); setPanelKey(k => k + 1); };

  useEffect(() => {
    if (!isHovered) return;
    const handler = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); activate((active + 1) % disciplines.length); }
      if (e.key === 'ArrowUp') { e.preventDefault(); activate((active - 1 + disciplines.length) % disciplines.length); }
    };
    window.addEventListener('keydown', handler, { passive: false });
    return () => window.removeEventListener('keydown', handler);
  }, [active, isHovered]);

  const mono = "'IBM Plex Mono', monospace";
  const serif = "'Playfair Display', serif";
  const sans = "'DM Sans', sans-serif";

  return (
    <section id="b.e." data-section="b.e."
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ background: '#F5F4F0', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{`
        @keyframes panelIn { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes ghostIn { from{opacity:0;transform:translateX(36px) scale(0.96)} to{opacity:1;transform:translateX(0) scale(1)} }
        @keyframes specIn  { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        @keyframes tagFade { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ruleIn  { from{transform:scaleY(0)} to{transform:scaleY(1)} }
      `}</style>

      {/* Header bar */}
      <div className="prog-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ display: 'inline-block', width: '26px', height: '1px', background: disc.accent, transition: 'background 0.4s' }} />
          <span style={{ fontFamily: mono, fontSize: '0.83rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: disc.accent, transition: 'color 0.4s' }}>// B.E. Disciplines — MUSE</span>
        </div>
        <div className="prog-header-right">
          <span style={{ fontFamily: mono, fontSize: '0.7rem', color: '#6B7280', letterSpacing: '0.1em', textTransform: 'uppercase' }}>AICTE Approved · 60 Seats / Branch</span>
          <span style={{ fontFamily: mono, fontSize: '0.7rem', color: disc.accent, border: `1px solid ${disc.accent}`, padding: '0.22rem 0.75rem', borderRadius: '2px', transition: 'all 0.4s' }}>
            {String(active + 1).padStart(2, '0')} / {String(disciplines.length).padStart(2, '0')}
          </span>
        </div>
      </div>
      {/* Two-col body */}
      <div className="prog-body">

        {/* LEFT list */}
        <div className="prog-list">
          <p style={{ fontFamily: mono, fontSize: '0.56rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#9CA3AF', marginBottom: '1.4rem' }}>Select a discipline</p>

          {disciplines.map((d, i) => {
            const isActive = i === active;
            return (
              <button key={d.id} onClick={() => activate(i)} className="prog-list-btn" style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 0', borderBottom: '1px solid #E0DDD8', borderLeft: isActive ? `3px solid ${d.accent}` : '3px solid transparent', paddingLeft: isActive ? '1.1rem' : '0.15rem', background: isActive ? d.accentDim : 'transparent', transition: 'all 0.32s cubic-bezier(0.4,0,0.2,1)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.85rem', minWidth: 0 }}>
                  <span style={{ fontFamily: mono, fontSize: '0.58rem', color: isActive ? d.accent : '#9CA3AF', letterSpacing: '0.06em', transition: 'color 0.3s', flexShrink: 0 }}>{d.code}</span>
                  <div style={{ minWidth: 0 }}>
                    <span className="prog-list-btn-name" style={{ fontFamily: serif, fontSize: 'clamp(0.9rem,1.45vw,1.28rem)', fontWeight: isActive ? 700 : 400, color: isActive ? '#1A2744' : '#4B5563', lineHeight: 1.2, transition: 'all 0.3s', display: 'block' }}>
                      <span style={{ fontFamily: 'serif', fontSize: '0.88rem', color: isActive ? d.accent : 'rgba(26,39,68,0.2)', marginRight: '0.35rem', transition: 'color 0.3s' }}>{d.icon}</span>
                      {d.degree} {d.fullName}
                    </span>
                    {isActive && (
                      <span style={{ fontFamily: mono, fontSize: '0.57rem', color: d.accent, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginTop: '0.22rem', animation: 'tagFade 0.35s ease both', fontStyle: 'italic' }}>
                        {d.tagline}
                      </span>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: '0.82rem', color: isActive ? d.accent : '#D1D5DB', transition: 'all 0.3s', opacity: isActive ? 1 : 0.4, marginLeft: '0.8rem', flexShrink: 0 }}>→</span>
              </button>
            );
          })}
          <p style={{ fontFamily: mono, fontSize: '0.5rem', color: '#B0B7C3', marginTop: '1.1rem', letterSpacing: '0.1em', textTransform: 'uppercase' }} className="hidden lg:block">Arrow keys to navigate</p>
        </div>

        {/* RIGHT detail */}
        <div className="prog-detail">
          {/* Ghost text */}
          <div key={`g-${panelKey}`} className="prog-ghost" style={{ position: 'absolute', bottom: '-1rem', right: '-1.5rem', fontFamily: serif, fontSize: 'clamp(4.5rem,12vw,11rem)', fontWeight: 900, color: disc.accentDim, lineHeight: 1, whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none', animation: 'ghostIn 0.65s cubic-bezier(0.4,0,0.2,1) both', zIndex: 0 }}>
            {disc.shortName}
          </div>

          {/* Vertical rule */}
          <div style={{ position: 'absolute', left: 0, top: '2.5rem', bottom: '2.5rem', width: '3px', background: disc.accent, borderRadius: '0 2px 2px 0', transition: 'background 0.4s', transformOrigin: 'top', animation: 'ruleIn 0.45s ease both' }} />

          {/* Content */}
          <div key={`p-${panelKey}`} className="prog-detail-inner" style={{ position: 'relative', zIndex: 1, padding: '2.8rem 3.5vw 2rem 3.5vw', height: '100%', display: 'flex', flexDirection: 'column', animation: 'panelIn 0.5s cubic-bezier(0.4,0,0.2,1) both' }}>

            {/* Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: mono, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: disc.accent, border: `1px solid ${disc.accent}`, padding: '0.22rem 0.7rem', borderRadius: '2px' }}>{disc.degree}</span>
              <span style={{ fontFamily: mono, fontSize: '0.57rem', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0.22rem 0.7rem', borderRadius: '2px', background: disc.status === 'open' ? '#DCFCE7' : '#FEF9C3', color: disc.status === 'open' ? '#166534' : '#854D0E' }}>
                {disc.status === 'open' ? 'Admissions Open' : 'Closing Soon'}
              </span>
            </div>

            <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.3rem,2.5vw,2.3rem)', fontWeight: 700, color: '#1A2744', lineHeight: 1.15, marginBottom: '0.45rem' }}>{disc.fullName}</h2>
            <p style={{ fontFamily: mono, fontSize: '0.75rem', color: disc.accent, letterSpacing: '0.08em', marginBottom: '1.1rem', fontStyle: 'italic' }}>"{disc.tagline}"</p>
            <div style={{ width: '44px', height: '2px', background: disc.accent, marginBottom: '1.2rem', transition: 'background 0.4s' }} />
            <p style={{ fontFamily: sans, fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.78, marginBottom: '1.6rem', maxWidth: '510px' }}>{disc.description}</p>

            {/* Two-col specs */}
            <div className="prog-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem 2rem', marginBottom: '1.6rem' }}>
              <div>
                <div style={{ fontFamily: mono, fontSize: '0.56rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: disc.accent, marginBottom: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ display: 'inline-block', width: '14px', height: '1px', background: disc.accent }} /> Specializations
                </div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.42rem' }}>
                  {disc.specializations.map((s, i) => (
                    <li key={i} style={{ fontFamily: sans, fontSize: '0.77rem', color: '#374151', display: 'flex', alignItems: 'flex-start', gap: '0.4rem', lineHeight: 1.4, animation: `specIn 0.4s ${0.07 + i * 0.07}s both ease` }}>
                      <span style={{ color: disc.accent, flexShrink: 0 }}>›</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div style={{ fontFamily: mono, fontSize: '0.56rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: disc.accent, marginBottom: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ display: 'inline-block', width: '14px', height: '1px', background: disc.accent }} /> Career Paths
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.38rem' }}>
                  {disc.careers.map((c, i) => (
                    <span key={i} style={{ fontFamily: mono, fontSize: '0.66rem', color: '#1A2744', background: disc.accentDim, border: `1px solid ${disc.accent}22`, padding: '0.26rem 0.65rem', borderRadius: '2px', letterSpacing: '0.04em', width: 'fit-content', animation: `specIn 0.4s ${0.1 + i * 0.07}s both ease` }}>{c}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom meta */}
            <div className="prog-meta-row" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #E0DDD8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem' }}>
              <div className="prog-meta-stats" style={{ display: 'flex', gap: '1.8rem', flexWrap: 'wrap' }}>
                {[{ l: 'Duration', v: disc.duration }, { l: 'Seats', v: `${disc.seats} Seats` }, { l: 'Approval', v: 'AICTE' }, { l: 'University', v: 'UoM' }].map(({ l, v }) => (
                  <div key={l}>
                    <div style={{ fontFamily: mono, fontSize: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9CA3AF', marginBottom: '0.15rem' }}>{l}</div>
                    <div style={{ fontFamily: sans, fontSize: '0.78rem', fontWeight: 600, color: '#1A2744' }}>{v}</div>
                  </div>
                ))}
              </div>
              <a href="#admissions" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: disc.accent, color: '#fff', fontFamily: mono, fontSize: '0.64rem', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0.62rem 1.25rem', borderRadius: '2px', textDecoration: 'none', transition: 'opacity 0.2s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.82'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                Apply Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ==========================================================================
   CAMPUS LIFE
   ========================================================================== */
const campusCards = [
  { id: 1, Icon: Microscope, title: 'Advanced Laboratories', desc: 'State-of-the-art labs equipped with modern instruments and computing hardware for hands-on, practical engineering exposure across all five B.E. disciplines.', large: true, tag: 'Research', image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=2070&auto=format&fit=crop', panFrom: '50% 25%', panTo: '50% 58%' },
  { id: 2, Icon: Library, title: 'Digital Library & Hub', desc: 'Access to IEEE journals, 3 lakh+ volumes, and round-the-clock digital repositories from the central UoM library.', large: false, tag: 'Knowledge', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2028&auto=format&fit=crop', panFrom: '50% 35%', panTo: '50% 62%' },
  { id: 3, Icon: Landmark, title: 'Manasagangotri Campus', desc: 'A lush, eco-friendly academic sanctuary fostering innovation, critical thinking, and intellectual dialogue.', large: false, tag: 'Campus', image: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2066&auto=format&fit=crop', panFrom: '50% 18%', panTo: '50% 48%' },
  { id: 4, Icon: Trophy, title: 'Sports & Recreation', desc: 'Comprehensive sports facilities including an indoor stadium, Olympic-standard track, and modern gymnasium.', large: false, tag: 'Athletics', image: 'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?q=80&w=2070&auto=format&fit=crop', panFrom: '50% 30%', panTo: '50% 55%' },
  { id: 5, Icon: Leaf, title: 'Eco Campus', desc: 'Botanical gardens, rain-water harvesting, and a sustainability charter targeting carbon neutrality by 2035.', large: false, tag: 'Green', image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop', panFrom: '50% 20%', panTo: '50% 50%' },
];

const CampusLife = () => {
  const [hoveredId, setHoveredId] = useState(null);
  return (
    <section id="facilities" data-section="facilities" className="py-32 px-8 lg:px-16 bg-navy text-surface relative overflow-hidden">
      <style>{`
        .cl-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:0; transform:scale(1.08); transition:opacity 0.65s cubic-bezier(0.4,0,0.2,1),transform 8s cubic-bezier(0.4,0,0.2,1); will-change:opacity,transform; z-index:0; }
        .cl-card:hover .cl-img { opacity:1; transform:scale(1.16); }
        .cl-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(26,39,68,0.97) 0%,rgba(26,39,68,0.60) 45%,rgba(26,39,68,0.08) 100%); opacity:0; transition:opacity 0.65s cubic-bezier(0.4,0,0.2,1); z-index:1; }
        .cl-card:hover .cl-overlay { opacity:1; }
        .cl-content { position:relative; z-index:2; transition:transform 0.45s cubic-bezier(0.4,0,0.2,1); }
        .cl-card:hover .cl-content { transform:translateY(-8px); }
        .cl-tag { transition:color 0.35s ease,border-color 0.35s ease; }
        .cl-card:hover .cl-tag { color:#C9972B !important; border-color:rgba(201,151,43,0.55) !important; }
        .cl-cta { opacity:0; transform:translateY(10px); transition:opacity 0.35s 0.12s ease,transform 0.35s 0.12s ease; }
        .cl-card:hover .cl-cta { opacity:1; transform:translateY(0); }
        .cl-card::after { content:''; position:absolute; inset:0; border:1px solid rgba(255,255,255,0); pointer-events:none; z-index:3; transition:border-color 0.4s ease; }
        .cl-card:hover::after { border-color:rgba(255,255,255,0.16); }
      `}</style>

      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="campus-section-header max-w-2xl mb-16 lg:mb-20 -mt-4 lg:-mt-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-[1px] bg-gold block" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-gold">Infrastructure</span>
          </div>
          <h2 className="font-sans font-extrabold tracking-tight text-[clamp(2rem,4vw,3.5rem)] text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60 leading-tight mb-6">
            An ecosystem built for<br className="hidden sm:block" /> technological breakthroughs.
          </h2>
          <p className="font-sans text-sm text-white/50 leading-relaxed">
            Every facility at MUSE is purpose-built to accelerate learning, research, and collaboration across all five engineering disciplines. Hover each card to explore it up close.
          </p>
        </div>

        {/* Responsive grid */}
        <div className="campus-grid">
          {campusCards.map((card) => {
            const isHovered = hoveredId === card.id;
            const { Icon } = card;
            return (
              <div key={card.id} className={`cl-card group bg-navy hover:bg-[#0E1D35] transition-colors duration-500 ${card.large ? 'campus-card-large' : ''}`}
                style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', cursor: 'default' }}
                onMouseEnter={() => setHoveredId(card.id)} onMouseLeave={() => setHoveredId(null)}>
                <img className="cl-img" src={card.image} alt={card.title} style={{ objectPosition: isHovered ? card.panTo : card.panFrom }} />
                <div className="cl-overlay" />
                <div className="cl-content" style={{ padding: card.large ? 'clamp(1.5rem,3.5vw,3rem) clamp(1.5rem,3.5vw,3.5rem)' : 'clamp(1.25rem,2.5vw,2rem) clamp(1.25rem,2.5vw,2.5rem)' }}>
                  <span className="cl-tag font-mono inline-block" style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.28)', border: '1px solid rgba(255,255,255,0.12)', padding: '0.2rem 0.6rem', borderRadius: '2px', marginBottom: '1.25rem', display: 'inline-block' }}>{card.tag}</span>
                  <Icon size={28} strokeWidth={1} className="text-gold opacity-80 group-hover:opacity-100 transition-opacity" style={{ display: 'block', marginBottom: '1rem' }} />
                  <h3 className="font-sans font-semibold tracking-tight text-xl lg:text-2xl mb-3 text-white">{card.title}</h3>
                  <p className="font-sans text-sm text-white/60 leading-relaxed">{card.desc}</p>
                  <div className="cl-cta flex items-center gap-2" style={{ marginTop: '1rem' }}>
                    <span className="block w-5 h-[1px] bg-gold" />
                    <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-gold">Explore facility</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ==========================================================================
   ADMISSIONS
   ========================================================================== */
const Admissions = () => {
  const stepsRef = useScrollReveal({ stagger: true });
  const infoRef = useScrollReveal();

  return (
    <section id="admissions" data-section="admissions" className="py-32 px-8 lg:px-16 bg-surface" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-120px', right: '-120px', width: '480px', height: '480px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(var(--color-gold-rgb, 180,145,60), 0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="max-w-[1400px] mx-auto">
        <div className="admissions-header flex flex-col items-center text-center max-w-2xl mx-auto mb-10 -mt-14">
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(var(--color-gold-rgb, 180,145,60), 0.3)', marginBottom: '1.5rem', background: 'rgba(var(--color-gold-rgb, 180,145,60), 0.06)' }}>
            <GraduationCap size={24} strokeWidth={1} className="text-gold" />
          </div>
          <h2 className="font-sans font-extrabold tracking-tight text-[clamp(2rem,4vw,3.5rem)] text-transparent bg-clip-text bg-gradient-to-r from-navy to-navy/60 leading-tight mb-6">Begin your engineering journey.</h2>
          <p className="font-sans text-muted leading-relaxed text-sm lg:text-base">
            MUSE provides a transformative educational experience. We welcome aspiring engineers ready to excel in Industry 4.0 paradigms.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start">
          {/* Left — Steps */}
          <div ref={stepsRef}>
            <h3 className="font-sans font-semibold tracking-tight text-2xl text-navy border-b border-border pb-4 mb-8 flex items-center gap-3"><span className="w-2 h-6 bg-gold rounded-full inline-block"></span>Admission Process</h3>
            {admissionSteps.map((step, idx) => (
              <div key={idx} className="reveal group" style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem 0', borderBottom: '1px solid var(--color-border,#e5e7eb)', transition: 'background 0.2s', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-8px', top: '50%', transform: 'translateY(-50%) scaleY(0)', width: '3px', height: '60%', background: 'var(--color-gold,#b4913c)', borderRadius: '2px', transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)' }} className="step-accent-bar" />
                <div className="font-sans font-semibold tracking-tight text-navy" style={{ fontSize: '1.1rem', fontWeight: '400', letterSpacing: '0.05em', opacity: '0.25', minWidth: '2.5rem', paddingTop: '0.2rem', transition: 'opacity 0.2s', fontVariantNumeric: 'tabular-nums' }}>{step.step}</div>
                <div style={{ flex: 1 }}>
                  <h4 className="font-sans font-semibold tracking-tight text-lg lg:text-xl text-navy mb-2" style={{ lineHeight: '1.3' }}>{step.title}</h4>
                  <p className="font-sans text-sm text-muted leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
            <style>{`.group:hover .step-accent-bar{transform:translateY(-50%) scaleY(1) !important}.group:hover>div:first-of-type{opacity:0.9 !important;color:var(--color-gold,#b4913c) !important}`}</style>
          </div>

          {/* Right — Info card */}
          <div ref={infoRef} className="reveal" style={{ background: 'var(--color-bg,#fff)', border: '1px solid var(--color-border,#e5e7eb)', padding: 'clamp(1.5rem,4vw,3.5rem)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: 'linear-gradient(135deg, transparent 50%, rgba(var(--color-gold-rgb, 180,145,60), 0.08) 50%)', pointerEvents: 'none' }} />
            <h3 className="font-sans font-semibold tracking-tight text-2xl text-teal mb-8 flex items-center gap-3"><span className="w-2 h-6 bg-teal rounded-full inline-block"></span>Admission Details</h3>
            <div style={{ borderTop: '1px solid var(--color-border,#e5e7eb)' }}>
              {[
                { label: 'Intake Per Branch', value: '60 Seats', highlight: false },
                { label: 'KEA Quota (Merit)', value: '50% · 30 Seats', highlight: true },
                { label: 'Self-Financed Quota', value: '50% · 30 Seats', highlight: true },
                { label: 'Entrance Accepted', value: 'KCET / KEA', highlight: false },
                { label: 'Academic Year Commences', value: 'September 2026', highlight: false },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 0', borderBottom: '1px solid var(--color-border,#e5e7eb)', gap: '1rem', flexWrap: 'wrap' }}>
                  <span className="font-sans text-sm text-navy font-medium">{item.label}</span>
                  <span className="font-mono text-xs uppercase tracking-widest" style={{ color: item.highlight ? 'var(--color-gold,#b4913c)' : 'var(--color-muted,#9ca3af)', background: item.highlight ? 'rgba(var(--color-gold-rgb, 180,145,60), 0.07)' : 'transparent', padding: item.highlight ? '0.25rem 0.6rem' : '0', borderRadius: '2px', whiteSpace: 'nowrap', letterSpacing: '0.12em' }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn-primary w-full">Download Brochure</button>
              <p className="font-mono text-xs text-muted text-center" style={{ letterSpacing: '0.08em', opacity: 0.6 }}>PDF · Admissions 2026–27</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ==========================================================================
   CONTACT
   ========================================================================== */
const Contact = () => {
  const infoRef = useScrollReveal({ stagger: true });
  const formRef = useScrollReveal();
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="contact" data-section="contact" className="py-32 px-8 lg:px-16 bg-bg border-t border-border">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

        <div ref={infoRef} className="max-w-md w-full">
          <div className="reveal flex items-center gap-3 mb-6">
            <span className="w-8 h-[1px] bg-gold" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-teal">Directory</span>
          </div>
          <h2 className="reveal font-sans font-extrabold tracking-tight text-[clamp(2rem,4vw,3.5rem)] text-transparent bg-clip-text bg-gradient-to-r from-navy to-navy/60 leading-tight mb-10 lg:mb-12">Reach out to MUSE.</h2>
          <div className="flex flex-col gap-8 lg:gap-10">
            {[
              { icon: MapPin, title: 'Campus Location', data: 'Mysore University School of Engineering\nManasagangotri, Mysore 570006\nKarnataka, India' },
              { icon: Phone, title: 'Admissions & Inquiry', data: '+91 99729 40201\n+91 821 2419099' },
              { icon: Mail, title: 'Electronic Mail', data: 'directormusem@uni-mysore.ac.in\noffice-soe@uni-mysore.ac.in' }
            ].map((info, i) => {
              const Icon = info.icon;
              return (
                <div key={i} className="reveal flex gap-5 items-start">
                  <Icon size={18} strokeWidth={1.5} className="text-gold mt-1 flex-none" />
                  <div>
                    <div className="font-mono text-[0.65rem] uppercase tracking-widest text-navy mb-2">{info.title}</div>
                    <div className="font-sans text-sm text-muted whitespace-pre-line leading-relaxed">{info.data}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div ref={formRef} className="reveal bg-[#0A0A0A] border border-[#222] p-8 lg:p-14 w-full rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 z-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url('/school-of-engineering.webp')` }} />
          <div className="absolute inset-0 z-0 bg-black/60 backdrop-blur-[2px]" />
          <div className="relative z-10">
            <h3 className="font-sans font-extrabold tracking-tight text-2xl lg:text-3xl text-white mb-8">Official Correspondence</h3>
            {submitted ? (
              <div className="p-8 bg-[#111] border border-[#333] rounded-xl text-center">
                <p className="font-sans font-semibold tracking-tight text-xl text-white mb-2">Inquiry Received</p>
                <p className="font-sans text-sm text-white/60">A representative from the engineering administration will respond shortly.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-mono text-[0.65rem] uppercase tracking-widest text-white/50">Full Name</label>
                    <input required className="w-full bg-[#111] border border-[#333] text-white p-3.5 text-sm rounded-md focus:outline-none focus:border-white/30 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-[0.65rem] uppercase tracking-widest text-white/50">Email Address</label>
                    <input type="email" required className="w-full bg-[#111] border border-[#333] text-white p-3.5 text-sm rounded-md focus:outline-none focus:border-white/30 transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[0.65rem] uppercase tracking-widest text-white/50">Department / Purpose</label>
                  <select className="w-full bg-[#111] border border-[#333] text-white p-3.5 text-sm rounded-md focus:outline-none focus:border-white/30 transition-all appearance-none">
                    <option className="bg-[#111] text-white">B.E. Admissions</option>
                    <option className="bg-[#111] text-white">Faculty/Academic Inquiry</option>
                    <option className="bg-[#111] text-white">Placements & Industry Relations</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[0.65rem] uppercase tracking-widest text-white/50">Message</label>
                  <textarea required rows={4} className="w-full bg-[#111] border border-[#333] text-white p-3.5 text-sm rounded-md focus:outline-none focus:border-white/30 transition-all resize-none" />
                </div>
                <button type="submit" className="w-full bg-white text-black font-sans font-semibold text-base py-3.5 rounded-md hover:bg-gray-200 focus:outline-none transition-colors">Submit Inquiry</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
/* ==========================================================================
   FOOTER
   ========================================================================== */
const Footer = () => (
  <footer className="relative bg-[#030712] pt-12 pb-12 px-8 lg:px-16 overflow-hidden border-t border-white/5">
    {/* Subtle Background Glow */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

    <div className="max-w-[1400px] mx-auto relative z-10">

      {/* Top Section: CTA & Branding */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-20 pb-12 border-b border-white/10">
        <div className="max-w-2xl">
          <h3 className="font-sans font-extrabold tracking-tight text-[clamp(2rem,4vw,3rem)] text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50 mb-4">Shape the future with us.</h3>
          <p className="font-sans text-white/50 text-sm lg:text-base leading-relaxed max-w-xl">Join a community of innovators, researchers, and creators at the University of Mysore's premier engineering institute.</p>
        </div>
        <a href="#admissions" className="group flex items-center gap-3 bg-white text-navy px-8 py-4 rounded-full font-sans font-bold text-sm hover:bg-gold hover:text-white transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(201,151,43,0.3)] flex-shrink-0">
          Apply for 2026
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-24 relative z-10">
        <div className="lg:col-span-4 pr-8">
          <div className="flex items-center gap-6 mb-8">
            <img src="/mysore_logo.png" alt="MUSE Logo" className="w-20 h-20 object-contain drop-shadow-xl" />
            <div>
              <div className="font-sans font-bold tracking-tight text-3xl text-white">MUSE</div>
              <div className="font-mono text-[0.6rem] uppercase tracking-widest text-white/60 mt-1.5">School of Engineering</div>
            </div>
          </div>
          <p className="font-sans text-sm text-white/40 leading-relaxed mb-6">Affiliated to University of Mysore.<br />Approved by AICTE, New Delhi.</p>
        </div>

        <div className="lg:col-span-2 lg:col-start-6">
          <div className="font-mono text-[0.65rem] uppercase tracking-widest text-white/30 mb-8">Navigation</div>
          <ul className="space-y-4">
            {["Home", "Director's Message", "B.E. Programs", "Campus Facilities"].map(link => (
              <li key={link}><a href="#" className="font-sans text-sm text-white/60 hover:text-gold transition-colors inline-block">{link}</a></li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2 lg:col-start-8">
          <div className="font-mono text-[0.65rem] uppercase tracking-widest text-white/30 mb-8">Administration</div>
          <ul className="space-y-4">
            {['Vice Chancellor', 'Director (MUSE)', 'Registrar Office', 'AICTE Approvals'].map(link => (
              <li key={link}><a href="#" className="font-sans text-sm text-white/60 hover:text-gold transition-colors inline-block">{link}</a></li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3 lg:col-start-10">
          <div className="font-mono text-[0.65rem] uppercase tracking-widest text-white/30 mb-8">Quick Resources</div>
          <ul className="space-y-4">
            {['KEA Admission Portal', 'Fee Structure', 'Curriculum Syllabus', 'Tenders & Notices'].map(link => (
              <li key={link}><a href="#" className="font-sans text-sm text-white/60 hover:text-gold transition-colors inline-block">{link}</a></li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/5 relative z-10">
        <div className="font-mono text-[0.6rem] uppercase tracking-widest text-white/30 text-center md:text-left">
          © {new Date().getFullYear()} Mysore University School of Engineering. All Rights Reserved.
        </div>
        <div className="flex flex-wrap justify-center gap-6 font-mono text-[0.6rem] uppercase tracking-widest text-white/30">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
          <a href="#" className="hover:text-white transition-colors">AICTE Mandates</a>
        </div>
      </div>

      {/* Massive Watermark */}
      <div className="absolute bottom-[-6vw] left-1/2 -translate-x-1/2 text-[18vw] font-sans font-black tracking-tighter text-white/[0.015] pointer-events-none select-none w-full text-center leading-none z-0">
        MUSE
      </div>
    </div>
  </footer>
);

/* ==========================================================================
   APP
   ========================================================================== */
const LandingPage = () => {
  const activeSection = useActiveSection();
  const navigate = useNavigate();
  return (
    <>
      <GlobalResponsiveStyles />
      <Navbar activeSection={activeSection} onPortalLogin={(role) => { navigate('/login', { state: { role } }); window.scrollTo(0, 0); }} />
      <main>
        <Hero />
        <About />
        <Programmes />
        <CampusLife />
        <Admissions />
        <Contact />
      </main>
      <Footer />
    </>
  );
};

export default LandingPage;
