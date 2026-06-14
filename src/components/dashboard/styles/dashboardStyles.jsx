import React from 'react';

const DashboardStyles = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body,input,textarea,select,button{font-family:Inter,sans-serif}

    .dash{display:flex;height:100vh;overflow:hidden}
    .dk-root{background:#0A0A0A;color:#fff}
    .lt-root{background:#F0F2F5;color:#101828}

    .main{flex:1;display:flex;flex-direction:column;overflow:hidden}
    .content{flex:1;overflow-y:auto;padding:1.5rem 1.75rem}

    .sb-dk,.sb-lt{width:220px;flex-shrink:0;display:flex;flex-direction:column;overflow-y:auto}
    .sb-dk{background:#111;border-right:1px solid rgba(255,255,255,.07)}
    .sb-lt{background:#fff;border-right:1px solid #E8ECF0}

    .tb-dk,.tb-lt{height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 1.75rem;flex-shrink:0}
    .tb-dk{background:#111;border-bottom:1px solid rgba(255,255,255,.07)}
    .tb-lt{background:#fff;border-bottom:1px solid #E4E7EC}

    .card-dk,.card-lt{border-radius:12px}
    .card-dk{background:#1A1A1A;border:1px solid rgba(255,255,255,.08)}
    .card-lt{background:#fff;border:1px solid #E4E7EC}

    .tbl{width:100%;border-collapse:collapse;font-size:.81rem}
    .tbl th{text-align:left;padding:.58rem 1rem;font-family:'JetBrains Mono',monospace;font-size:.56rem;text-transform:uppercase;letter-spacing:.1em}
    .tbl td{padding:.7rem 1rem;vertical-align:middle}
    .tbl-dk th{color:rgba(255,255,255,.28);background:#141414;border-bottom:1px solid rgba(255,255,255,.07)}
    .tbl-dk td{color:#fff;border-bottom:1px solid rgba(255,255,255,.05)}
    .tbl-lt th{color:#98A2B3;background:#F9FAFB;border-bottom:1px solid #F2F4F7}
    .tbl-lt td{color:#101828;border-bottom:1px solid #F2F4F7}

    .b{display:inline-flex;align-items:center;font-size:.6rem;font-weight:600;font-family:'JetBrains Mono',monospace;letter-spacing:.04em;padding:.17rem .5rem;border-radius:5px;text-transform:uppercase;white-space:nowrap}
    .bH{background:rgba(248,113,113,.12);color:#fca5a5;border:1px solid rgba(248,113,113,.2)}
    .bM{background:rgba(251,191,36,.12);color:#fcd34d;border:1px solid rgba(251,191,36,.2)}
    .bL{background:rgba(52,211,153,.12);color:#6ee7b7;border:1px solid rgba(52,211,153,.2)}
    .bPend{background:rgba(251,191,36,.12);color:#fcd34d;border:1px solid rgba(251,191,36,.2)}
    .bSub{background:rgba(255,255,255,.07);color:rgba(255,255,255,.8);border:1px solid rgba(255,255,255,.12)}
    .bGrd{background:rgba(52,211,153,.12);color:#6ee7b7;border:1px solid rgba(52,211,153,.2)}

    .lH{background:#FEE2E2;color:#991B1B}
    .lM{background:#FEF3C7;color:#92400E}
    .lL{background:#D1FAE5;color:#065F46}
    .lAc{background:#D1FAE5;color:#065F46}
    .lIn{background:#F3F4F6;color:#6B7280}
    .lOk{background:#D1FAE5;color:#065F46}
    .lW{background:#FEF3C7;color:#92400E}
    .lI{background:#EFF6FF;color:#1D4ED8}

    .pg{height:5px;border-radius:3px;overflow:hidden}
    .pg-dk{background:rgba(255,255,255,.1)}
    .pg-lt{background:#F2F4F7}
    .pgf{height:100%;border-radius:3px;transition:width .5s ease}

    .inp-dk,.inp-lt{border-radius:7px;padding:.46rem .7rem;font-size:.81rem;outline:none;transition:border .15s;width:100%}
    .inp-dk{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#fff}
    .inp-dk option{background:#0A0A0A;color:#fff}
    .inp-lt{background:#fff;border:1px solid #D0D5DD;color:#101828}
    .inp-lt option{background:#F0F2F5;color:#101828}

    .btn{display:inline-flex;align-items:center;justify-content:center;gap:.32rem;padding:.4rem .85rem;border-radius:8px;font-size:.78rem;font-weight:500;border:none;cursor:pointer;transition:all .13s}
    .btn-wh{background:#fff;color:#0A0A0A;font-weight:700}
    .btn-gh{background:rgba(255,255,255,.07);color:rgba(255,255,255,.72);border:1px solid rgba(255,255,255,.12)}
    .btn-tl,.btn-nt,.btn-np{background:#0D9488;color:#fff;font-weight:600}
    .btn-ng{background:#fff;color:#344054;border:1px solid #D0D5DD}
    .btn-dr{background:#FEE2E2;color:#991B1B}

    .mlbl{font-family:'JetBrains Mono',monospace;font-size:.56rem;text-transform:uppercase;letter-spacing:.12em}

    .tabs{display:flex}
    .tab{padding:.5rem 1rem;font-size:.78rem;font-weight:500;cursor:pointer;border-bottom:2px solid transparent}
    .tab-dk{color:rgba(255,255,255,.3)}
    .tab-dk.on{color:#fff;border-bottom-color:#fff;font-weight:600}
    .tab-lt{color:#667085}
    .tab-lt.on{color:#0D9488;border-bottom-color:#0D9488;font-weight:600}

    .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}
    .g2{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem}
    .gauto{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:1rem}

    .sb-nav-item{display:flex;align-items:center;gap:.55rem;padding:.5rem .75rem;border-radius:7px;cursor:pointer;font-size:.82rem;font-weight:400;margin-bottom:1px;transition:all .12s}
    .sb-dk .sb-nav-item{color:rgba(255,255,255,.38)}
    .sb-dk .sb-nav-item.on{background:rgba(255,255,255,.11);color:#fff;font-weight:600}
    .sb-lt .sb-nav-item{color:#6B7280}
    .sb-lt .sb-nav-item.on{background:#F0FDFA;color:#0D9488;font-weight:700}

    @media (max-width:1100px){
      .g4,.g2{grid-template-columns:1fr 1fr}
    }

    @media (max-width:820px){
      .dash{flex-direction:column}
      .sb-dk,.sb-lt{width:100%;max-height:220px}
      .content{padding:1rem}
      .g4,.g2{grid-template-columns:1fr}
    }
  `}</style>
);

export default DashboardStyles;