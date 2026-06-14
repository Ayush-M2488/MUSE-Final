import os

with open("src/components/landing/LandingPage.jsx", "r", encoding="utf-8") as f:
    lines = f.read().splitlines()

header_part = "\n".join(lines[:696])

missing_prog_body = """
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
                { label: 'Academic Year Commences', value: 'September 2025', highlight: false },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 0', borderBottom: '1px solid var(--color-border,#e5e7eb)', gap: '1rem', flexWrap: 'wrap' }}>
                  <span className="font-sans text-sm text-navy font-medium">{item.label}</span>
                  <span className="font-mono text-xs uppercase tracking-widest" style={{ color: item.highlight ? 'var(--color-gold,#b4913c)' : 'var(--color-muted,#9ca3af)', background: item.highlight ? 'rgba(var(--color-gold-rgb, 180,145,60), 0.07)' : 'transparent', padding: item.highlight ? '0.25rem 0.6rem' : '0', borderRadius: '2px', whiteSpace: 'nowrap', letterSpacing: '0.12em' }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn-primary w-full">Download Brochure</button>
              <p className="font-mono text-xs text-muted text-center" style={{ letterSpacing: '0.08em', opacity: 0.6 }}>PDF · Admissions 2025–26</p>
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
              { icon: MapPin, title: 'Campus Location', data: 'Mysore University School of Engineering\\nManasagangotri, Mysore 570006\\nKarnataka, India' },
              { icon: Phone, title: 'Admissions & Inquiry', data: '+91 99729 40201\\n+91 821 2419099' },
              { icon: Mail, title: 'Electronic Mail', data: 'directormusem@uni-mysore.ac.in\\noffice-soe@uni-mysore.ac.in' }
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
          <div className="absolute inset-0 z-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url('/src/assets/school-of-engineering.webp')` }} />
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
"""

footer_idx = -1
for i, line in enumerate(lines):
    if "/* ===" in line and "FOOTER" in line:
        footer_idx = i
        break

if footer_idx != -1:
    footer_part = "\\n".join(lines[footer_idx:])
else:
    footer_part = """
/* ==========================================================================
   FOOTER
   ========================================================================== */
const Footer = () => (
  <footer className="bg-navy pt-16 lg:pt-24 pb-8 px-8 lg:px-16 border-t-[8px] border-gold">
    <div className="max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16 mb-16 lg:mb-24">
        <div className="sm:col-span-2 lg:col-span-1">
          <Monitor size={24} strokeWidth={1} className="text-gold mb-6" />
          <div className="font-sans font-semibold tracking-tight text-2xl text-surface mb-2">MUSE</div>
          <div className="font-mono text-[0.6rem] uppercase tracking-widest text-surface/40 mb-6">School of Engineering</div>
          <p className="font-sans text-sm text-surface/60 leading-relaxed">Affiliated to University of Mysore.<br />Approved by AICTE, New Delhi.</p>
        </div>
        <div>
          <div className="font-mono text-[0.65rem] uppercase tracking-widest text-gold mb-6 lg:mb-8">Navigation</div>
          <ul className="space-y-3 lg:space-y-4">
            {["Home", "Director's Message", "B.E. Programs", "Campus Facilities"].map(link => (
              <li key={link}><a href="#" className="font-sans text-sm text-surface/60 hover:text-surface transition-colors">{link}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-mono text-[0.65rem] uppercase tracking-widest text-gold mb-6 lg:mb-8">Administration</div>
          <ul className="space-y-3 lg:space-y-4">
            {['Vice Chancellor', 'Director (MUSE)', 'Registrar Office', 'AICTE Approvals'].map(link => (
              <li key={link}><a href="#" className="font-sans text-sm text-surface/60 hover:text-surface transition-colors">{link}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-mono text-[0.65rem] uppercase tracking-widest text-gold mb-6 lg:mb-8">Quick Resources</div>
          <ul className="space-y-3 lg:space-y-4">
            {['KEA Admission Portal', 'Fee Structure', 'Curriculum Syllabus', 'Tenders & Notices'].map(link => (
              <li key={link}><a href="#" className="font-sans text-sm text-surface/60 hover:text-surface transition-colors">{link}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="footer-bottom border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="font-mono text-[0.65rem] uppercase tracking-widest text-surface/30 text-center md:text-left">
          © {new Date().getFullYear()} Mysore University School of Engineering. All Rights Reserved.
        </div>
        <div className="flex gap-6 font-mono text-[0.65rem] uppercase tracking-widest text-surface/30">
          <a href="#" className="hover:text-surface/70 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-surface/70 transition-colors">AICTE Mandates</a>
        </div>
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
"""

final_content = header_part + "\\n" + missing_prog_body + "\\n" + footer_part + "\\n"

with open("src/components/landing/LandingPage.jsx", "w", encoding="utf-8") as f:
    f.write(final_content)

print("Repair completed!")
