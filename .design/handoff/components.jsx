// ─────────────────────────────────────────────────────────────────────────────
// MiloAI animation — visual building blocks (frames, dashboard, telegram, etc)
// All components consume useTime / useTimeline / useSprite for animation.
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  // Stage / surfaces
  stage:        '#EBE7DE',  // warm cream stage background
  stageDeep:    '#DAD3C5',  // for deeper shadow gradients
  surface:      '#FAFAF9',  // dashboard inside-browser bg
  card:         '#FFFFFF',
  cardSoft:     '#F7F4EE',
  border:       '#E8E2D6',
  borderSoft:   '#EFEAE0',
  divider:      'rgba(31,29,26,0.06)',

  // Ink
  ink:          '#1F1D1A',
  inkMute:      '#6F6962',
  inkSubtle:    '#A39E94',
  inkOnPeach:   '#FFFFFF',

  // Brand accent (peach)
  peach:        '#E8956C',
  peachDeep:    '#C26F46',
  peachSoft:    '#FBE4D6',
  peachWash:    '#FCF1E8',
  peachInk:     '#7A3A18',

  // Status
  success:      '#85A275',
  successSoft:  '#DCE6D3',
  danger:       '#C46A4A',
  dangerSoft:   '#F7DDD0',
  warn:         '#D9A04E',

  // Telegram
  tgBg:         '#FFFFFF',
  tgHeaderBg:   '#FAFAF9',
  tgUserBubble: '#E8956C',
  tgBotBubble:  '#F2EFE8',
};

// ─── icons (lucide-style, thin lines) ────────────────────────────────────────
function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 1.6, style }) {
  const paths = {
    grid:        <><rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/><rect x="3" y="14" width="7" height="7" rx="1.2"/><rect x="14" y="14" width="7" height="7" rx="1.2"/></>,
    rocket:      <><path d="M5 13l-1.5 6 6-1.5c4-1 8-5 9-12.5-7.5 1-11.5 5-12.5 8z"/><circle cx="14.5" cy="9.5" r="1.5"/><path d="M5 13l-2 2"/></>,
    folder:      <path d="M3 7a1.5 1.5 0 011.5-1.5h3.6a1.5 1.5 0 011 .4l1.4 1.2h9a1.5 1.5 0 011.5 1.5v9.4a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 18V7z"/>,
    chat:        <path d="M21 12c0 4.5-4 8-9 8-1.2 0-2.4-.2-3.5-.5L4 21l1.5-4.5C4.5 15 4 13.5 4 12c0-4.5 4-8 8-8s9 3.5 9 8z"/>,
    image:       <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.8"/><path d="M21 15l-5-5L5 21"/></>,
    globe:       <><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 3 4 6.5 4 9s-1.5 6-4 9c-2.5-3-4-6.5-4-9s1.5-6 4-9z"/></>,
    inbox:       <><path d="M3 13l3-9h12l3 9v6a1.5 1.5 0 01-1.5 1.5H4.5A1.5 1.5 0 013 19v-6z"/><path d="M3 13h5.5L10 15h4l1.5-2H21"/></>,
    plug:        <><path d="M9 2v6M15 2v6"/><path d="M6 8h12v2a6 6 0 01-12 0V8z"/><path d="M12 16v5"/></>,
    settings:    <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 00.3 1.7l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.7-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.6 1.6 0 00-1-1.5 1.6 1.6 0 00-1.7.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.7 1.6 1.6 0 00-1.5-1H3a2 2 0 110-4h.1a1.6 1.6 0 001.5-1 1.6 1.6 0 00-.3-1.7l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.7.3 1.6 1.6 0 001-1.5V3a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.7-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.7 1.6 1.6 0 001.5 1H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z"/></>,
    bell:        <><path d="M6 8a6 6 0 1112 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 004 0"/></>,
    search:      <><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></>,
    mic:         <><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3M8 21h8"/></>,
    send:        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>,
    pause:       <><rect x="6" y="4" width="4" height="16" rx="0.5"/><rect x="14" y="4" width="4" height="16" rx="0.5"/></>,
    play:        <path d="M5 3l14 9-14 9V3z"/>,
    alert:       <><path d="M12 9v5M12 18h.01"/><path d="M10.3 3.8L1.8 18A2 2 0 003.5 21h17a2 2 0 001.7-3L13.7 3.8a2 2 0 00-3.4 0z"/></>,
    check:       <path d="M5 12l5 5L20 7"/>,
    arrowUp:     <><path d="M12 19V5M5 12l7-7 7 7"/></>,
    arrowDown:   <><path d="M12 5v14M19 12l-7 7-7-7"/></>,
    arrowRight:  <path d="M5 12h14M13 5l7 7-7 7"/>,
    sparkleSm:   <path d="M12 3l1.6 6.4L20 12l-6.4 1.6L12 21l-1.6-7.4L4 12l6.4-1.6L12 3z"/>,
    trend:       <><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></>,
    euro:        <><path d="M18 6.5c-1.4-1.5-3.6-2.5-6-2.5-4 0-7 3.6-7 8s3 8 7 8c2.4 0 4.6-1 6-2.5"/><path d="M3 10h11M3 14h11"/></>,
    target:      <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/></>,
    users:       <><circle cx="9" cy="8" r="3.5"/><path d="M2 21v-1.5a5.5 5.5 0 0114 0V21M16 4a4 4 0 010 8M22 21v-1.5a5.5 5.5 0 00-4-5.3"/></>,
    pointer:     <path d="M5 3l4 18 3.5-8 8-3.5L5 3z"/>,
    paperclip:   <path d="M21 12.5l-9 9a5 5 0 01-7-7l9-9a3.5 3.5 0 015 5l-9 9a2 2 0 01-3-3l8-8"/>,
    smile:       <><circle cx="12" cy="12" r="9"/><path d="M8 14a4 4 0 008 0M9 9.5h.01M15 9.5h.01"/></>,
    chevronDown: <path d="M6 9l6 6 6-6"/>,
    bolt:        <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {paths[name] || null}
    </svg>
  );
}

function SparkleLogo({ size = 28, color = C.peach }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M14 2l2 9 9 2-9 2-2 9-2-9-9-2 9-2 2-9z" fill={color}/>
      <path d="M22.5 4l.7 2.8 2.8.7-2.8.7-.7 2.8-.7-2.8-2.8-.7 2.8-.7.7-2.8z" fill={color} opacity="0.55"/>
    </svg>
  );
}

// ─── shared layout helpers ───────────────────────────────────────────────────

function Stack({ gap = 8, dir = 'col', align = 'stretch', justify = 'flex-start', style, children }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: dir === 'row' ? 'row' : 'column',
      gap,
      alignItems: align,
      justifyContent: justify,
      ...style,
    }}>{children}</div>
  );
}

// Lerp helper bound to absolute time
function tween(t, fromT, toT, fromV, toV, ease = Easing.easeInOutCubic) {
  if (t <= fromT) return fromV;
  if (t >= toT) return toV;
  const p = (t - fromT) / (toT - fromT);
  return fromV + (toV - fromV) * ease(p);
}

// Smooth entry+hold+exit envelope: 0 before in, 1 between, 0 after out.
function envelope(t, inT, holdEnd, outT, easeIn = Easing.easeOutCubic, easeOut = Easing.easeInCubic) {
  if (t < inT) return 0;
  if (t < holdEnd) return easeIn(Math.min(1, (t - inT) / Math.max(0.0001, holdEnd - inT - 0.0001)));
  if (t < outT) return 1 - easeOut(Math.min(1, (t - holdEnd) / Math.max(0.0001, outT - holdEnd)));
  return 0;
}

// ─── Browser frame (macOS chrome) ────────────────────────────────────────────

function BrowserFrame({ width, height, url = 'app.miloai.com/dashboard', children }) {
  return (
    <div style={{
      width, height,
      background: C.surface,
      borderRadius: 22,
      overflow: 'hidden',
      boxShadow: '0 40px 90px -20px rgba(31, 29, 26, 0.22), 0 14px 28px -10px rgba(31, 29, 26, 0.10), 0 1px 0 rgba(255,255,255,0.7) inset',
      border: '1px solid rgba(31, 29, 26, 0.07)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        height: 52, flexShrink: 0,
        background: '#F0EBE0',
        borderBottom: '1px solid rgba(31,29,26,0.06)',
        display: 'flex', alignItems: 'center', padding: '0 20px',
        gap: 18,
      }}>
        <div style={{display: 'flex', gap: 9}}>
          <div style={{width: 14, height: 14, borderRadius: 7, background: '#E07053'}}/>
          <div style={{width: 14, height: 14, borderRadius: 7, background: '#E6BB55'}}/>
          <div style={{width: 14, height: 14, borderRadius: 7, background: '#85A275'}}/>
        </div>
        <div style={{
          flex: 1,
          background: '#FFFFFF',
          borderRadius: 10,
          height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Geist Mono, ui-monospace, monospace',
          fontSize: 14, fontWeight: 400,
          color: C.inkMute,
          border: '1px solid rgba(31,29,26,0.05)',
          gap: 6,
          padding: '0 12px',
        }}>
          <Icon name="globe" size={13} color={C.inkSubtle} strokeWidth={1.6}/>
          {url}
        </div>
        <div style={{width: 24, opacity: 0.4}}>
          <Icon name="chevronDown" size={16} color={C.inkMute}/>
        </div>
      </div>
      <div style={{flex: 1, overflow: 'hidden', display: 'flex'}}>{children}</div>
    </div>
  );
}

// ─── Phone frame (iPhone-ish) ────────────────────────────────────────────────

function PhoneFrame({ width, height, statusTime = '9:41', children }) {
  return (
    <div style={{
      width, height,
      background: '#1F1D1A',
      borderRadius: 64,
      padding: 14,
      boxShadow: '0 50px 110px -20px rgba(31,29,26,0.42), 0 22px 50px -12px rgba(31,29,26,0.22), 0 0 0 1.5px rgba(255,255,255,0.08) inset',
      position: 'relative',
    }}>
      <div style={{
        width: '100%', height: '100%',
        background: C.tgBg,
        borderRadius: 52,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Status bar */}
        <div style={{
          height: 54, flexShrink: 0,
          padding: '0 40px',
          display: 'flex', alignItems: 'flex-end', paddingBottom: 8,
          justifyContent: 'space-between',
          fontFamily: 'Geist, ui-sans-serif',
          fontWeight: 600, fontSize: 17,
          color: C.ink,
        }}>
          <div>{statusTime}</div>
          <div style={{display: 'flex', gap: 6, alignItems: 'center'}}>
            <svg width="18" height="11" viewBox="0 0 18 11" fill="none"><rect x="0" y="6" width="3" height="5" rx="0.5" fill={C.ink}/><rect x="5" y="3" width="3" height="8" rx="0.5" fill={C.ink}/><rect x="10" y="0" width="3" height="11" rx="0.5" fill={C.ink} opacity="0.4"/></svg>
            <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><path d="M8 2.5C5 2.5 2.5 4 1 5.5l1.5 1.5C3.5 6 5.5 5 8 5s4.5 1 5.5 2L15 5.5C13.5 4 11 2.5 8 2.5z" fill={C.ink}/></svg>
            <div style={{width: 26, height: 12, border: `1.5px solid ${C.ink}`, borderRadius: 3, padding: 1.5, opacity: 0.85}}>
              <div style={{width: '78%', height: '100%', background: C.ink, borderRadius: 1}}/>
            </div>
          </div>
        </div>
        {/* Dynamic island */}
        <div style={{
          position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
          width: 110, height: 32, background: '#000', borderRadius: 18,
        }}/>
        {/* App content */}
        <div style={{flex: 1, overflow: 'hidden', position: 'relative'}}>{children}</div>
        {/* Home indicator */}
        <div style={{position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 134, height: 5, background: C.ink, borderRadius: 3, opacity: 0.9}}/>
      </div>
    </div>
  );
}

// ─── Sidebar (inside browser) ────────────────────────────────────────────────

function DashboardSidebar({ copy, activeKey = 'dashboard' }) {
  const items = [
    { k: 'dashboard',  icon: 'grid',   label: copy.nav_dashboard },
    { k: 'campaigns',  icon: 'rocket', label: copy.nav_campaigns },
    { k: 'services',   icon: 'folder', label: copy.nav_services },
    { k: 'chat',       icon: 'chat',   label: copy.nav_chat },
    { k: 'creatives',  icon: 'image',  label: copy.nav_creatives },
    { k: 'landings',   icon: 'globe',  label: copy.nav_landings },
    { k: 'inbox',      icon: 'inbox',  label: copy.nav_inbox },
  ];
  const bottom = [
    { k: 'accounts', icon: 'plug',     label: copy.nav_accounts },
    { k: 'settings', icon: 'settings', label: copy.nav_settings },
  ];

  const NavItem = ({ item }) => {
    const active = item.k === activeKey;
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '9px 12px',
        borderRadius: 9,
        background: active ? C.cardSoft : 'transparent',
        color: active ? C.ink : C.inkMute,
        fontFamily: 'Geist, ui-sans-serif',
        fontWeight: active ? 500 : 400,
        fontSize: 15,
        letterSpacing: '-0.01em',
      }}>
        <Icon name={item.icon} size={18} color={active ? C.ink : C.inkMute} strokeWidth={1.6}/>
        <div>{item.label}</div>
      </div>
    );
  };

  return (
    <div style={{
      width: 240, flexShrink: 0,
      borderRight: `1px solid ${C.divider}`,
      padding: '22px 16px',
      display: 'flex', flexDirection: 'column',
      background: '#F8F5EE',
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '6px 8px', marginBottom: 22,
      }}>
        <SparkleLogo size={22} color={C.ink}/>
        <div>
          <div style={{fontFamily: 'Bricolage Grotesque, Geist, sans-serif', fontWeight: 700, fontSize: 18, color: C.ink, letterSpacing: '-0.02em'}}>MiloAI</div>
          <div style={{fontFamily: 'Geist, sans-serif', fontSize: 11, color: C.inkSubtle, marginTop: -2}}>{copy.tagline_small}</div>
        </div>
      </div>
      <Stack gap={2}>
        {items.map(it => <NavItem key={it.k} item={it}/>)}
      </Stack>
      <div style={{flex: 1}}/>
      <Stack gap={2}>
        {bottom.map(it => <NavItem key={it.k} item={it}/>)}
      </Stack>
    </div>
  );
}

// ─── KPI Card with pulse-on-update ───────────────────────────────────────────

function KpiCard({ label, valueText, delta, deltaDir = 'up', icon, pulseAt, accent }) {
  const t = useTime();
  // pulse window: 0.5s after pulseAt
  let pulse = 0;
  if (pulseAt != null) {
    const since = t - pulseAt;
    if (since >= 0 && since <= 0.9) {
      pulse = Math.sin((since / 0.9) * Math.PI); // 0 → 1 → 0
    }
  }
  const ring = accent || C.peach;

  return (
    <div style={{
      flex: 1,
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: '18px 20px',
      position: 'relative',
      transform: `scale(${1 + pulse * 0.025})`,
      boxShadow: pulse > 0
        ? `0 0 0 ${pulse * 4}px ${ring}22, 0 4px 18px -8px ${ring}66`
        : '0 1px 3px rgba(31,29,26,0.04)',
      transition: 'box-shadow 80ms linear',
    }}>
      <Stack dir="row" align="center" gap={8} style={{marginBottom: 12}}>
        <Icon name={icon} size={15} color={C.inkSubtle}/>
        <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13, color: C.inkMute, letterSpacing: '-0.005em'}}>{label}</div>
      </Stack>
      <div style={{
        fontFamily: 'Geist Mono, ui-monospace, monospace',
        fontWeight: 500,
        fontSize: 30,
        color: C.ink,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}>{valueText}</div>
      {delta && (
        <Stack dir="row" align="center" gap={4} style={{marginTop: 10}}>
          <Icon name={deltaDir === 'up' ? 'arrowUp' : 'arrowDown'} size={12} color={deltaDir === 'up' ? C.success : C.danger}/>
          <div style={{fontFamily: 'Geist Mono, sans-serif', fontSize: 12, color: deltaDir === 'up' ? C.success : C.danger, fontVariantNumeric: 'tabular-nums'}}>{delta}</div>
        </Stack>
      )}
    </div>
  );
}

// ─── Campaign row with budget tick ───────────────────────────────────────────

function CampaignRow({ name, ctr, cpa, budgetText, status = 'active', highlightAt, budgetTickAt, accent, copy }) {
  const t = useTime();

  // Highlight window: row glows peach when targeted
  let highlight = 0;
  if (highlightAt != null) {
    const since = t - highlightAt;
    if (since >= 0 && since <= 2.2) {
      // fade in 0.3s, hold, fade out last 0.6s
      if (since < 0.3) highlight = Easing.easeOutCubic(since / 0.3);
      else if (since > 1.6) highlight = 1 - Easing.easeInCubic((since - 1.6) / 0.6);
      else highlight = 1;
    }
  }

  // Budget tick flash: brief glow at tick moment
  let tickFlash = 0;
  if (budgetTickAt != null) {
    const since = t - budgetTickAt;
    if (since >= 0 && since <= 0.8) {
      tickFlash = Math.sin((since / 0.8) * Math.PI);
    }
  }

  const statusColor = status === 'active' ? C.success : status === 'paused' ? C.inkSubtle : C.warn;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '16px 18px',
      borderRadius: 12,
      background: highlight > 0 ? `rgba(232, 149, 108, ${highlight * 0.07})` : 'transparent',
      borderLeft: `2px solid ${highlight > 0 ? `rgba(232, 149, 108, ${highlight * 0.9})` : 'transparent'}`,
      transition: 'none',
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: 4, background: statusColor,
        boxShadow: status === 'active' ? `0 0 0 3px ${statusColor}22` : 'none',
        flexShrink: 0,
      }}/>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{
          fontFamily: 'Geist, sans-serif', fontSize: 15, fontWeight: 500,
          color: C.ink, letterSpacing: '-0.01em',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{name}</div>
        <div style={{
          fontFamily: 'Geist Mono, monospace', fontSize: 11.5,
          color: C.inkSubtle, marginTop: 3, letterSpacing: '0.01em',
          fontVariantNumeric: 'tabular-nums',
        }}>
          CTR {ctr} · CPA {cpa}
        </div>
      </div>
      <div style={{
        fontFamily: 'Geist Mono, monospace',
        fontSize: 15, fontWeight: 500,
        fontVariantNumeric: 'tabular-nums',
        color: tickFlash > 0.05 ? C.peachDeep : C.ink,
        background: tickFlash > 0
          ? `rgba(232, 149, 108, ${tickFlash * 0.18})`
          : 'transparent',
        padding: '6px 10px', borderRadius: 8,
        border: tickFlash > 0 ? `1px solid rgba(232, 149, 108, ${tickFlash * 0.7})` : '1px solid transparent',
        letterSpacing: '-0.01em',
        position: 'relative',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}>
        {budgetText}
        {tickFlash > 0.5 && <SparkleBurst originX={0} originY={0} startAt={budgetTickAt}/>}
      </div>
    </div>
  );
}

// ─── Sparkle burst (small confetti) ──────────────────────────────────────────

function SparkleBurst({ startAt, count = 8 }) {
  const t = useTime();
  const since = t - startAt;
  if (since < 0 || since > 1.4) return null;

  const particles = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (i * 0.13);
      const dist = 32 + (i % 3) * 14;
      arr.push({
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist - 6,
        size: 6 + (i % 4) * 2,
        delay: (i % 4) * 0.05,
        hue: i % 2 === 0 ? C.peach : C.peachDeep,
      });
    }
    return arr;
  }, [count]);

  return (
    <div style={{position: 'absolute', left: '50%', top: '50%', pointerEvents: 'none', zIndex: 5}}>
      {particles.map((p, i) => {
        const local = since - p.delay;
        if (local < 0 || local > 1) return null;
        const e = Easing.easeOutCubic(Math.min(1, local / 0.6));
        const opacity = local < 0.6 ? local / 0.6 : 1 - (local - 0.6) / 0.4;
        return (
          <div key={i} style={{
            position: 'absolute',
            transform: `translate(${p.dx * e}px, ${p.dy * e}px) scale(${0.4 + e * 0.7}) rotate(${e * 180}deg)`,
            opacity,
          }}>
            <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill={p.hue}>
              <path d="M12 2l1.8 8.2L22 12l-8.2 1.8L12 22l-1.8-8.2L2 12l8.2-1.8L12 2z"/>
            </svg>
          </div>
        );
      })}
    </div>
  );
}

// ─── Anomaly toast ───────────────────────────────────────────────────────────

function AnomalyToast({ startAt, copy, title, body, campaign }) {
  const t = useTime();
  const since = t - startAt;
  if (since < -0.1) return null;

  // slide in 0.45s, hold, slide out at +3.5s
  const inDur = 0.5;
  const outStart = 4.0;
  let opacity = 0, ty = -14;
  if (since < inDur) {
    const e = Easing.easeOutCubic(Math.max(0, since) / inDur);
    opacity = e;
    ty = -14 * (1 - e);
  } else if (since < outStart) {
    opacity = 1; ty = 0;
  } else if (since < outStart + 0.5) {
    const e = Easing.easeInCubic((since - outStart) / 0.5);
    opacity = 1 - e;
    ty = -10 * e;
  }

  return (
    <div style={{
      position: 'absolute', top: 20, right: 24,
      width: 380,
      background: C.card,
      border: `1px solid ${C.dangerSoft}`,
      borderLeft: `3px solid ${C.danger}`,
      borderRadius: 12,
      padding: '14px 16px',
      boxShadow: '0 14px 30px -8px rgba(196, 106, 74, 0.18), 0 4px 10px -4px rgba(31,29,26,0.06)',
      opacity, transform: `translateY(${ty}px)`,
      zIndex: 20,
    }}>
      <Stack dir="row" gap={12} align="flex-start">
        <div style={{
          width: 28, height: 28, borderRadius: 14,
          background: C.dangerSoft,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon name="alert" size={15} color={C.danger}/>
        </div>
        <div style={{flex: 1}}>
          <div style={{
            fontFamily: 'Geist, sans-serif', fontSize: 13, fontWeight: 600,
            color: C.ink, letterSpacing: '-0.01em',
          }}>{title}</div>
          <div style={{
            fontFamily: 'Geist, sans-serif', fontSize: 12.5,
            color: C.inkMute, marginTop: 3, lineHeight: 1.4,
          }}>{body}</div>
          <div style={{
            fontFamily: 'Geist Mono, monospace', fontSize: 11,
            color: C.inkSubtle, marginTop: 5,
          }}>{campaign}</div>
        </div>
      </Stack>
    </div>
  );
}

// ─── In-dashboard AI chat panel (mini chat widget bottom-right) ──────────────

function WebChatPanel({ copy, command, showUserAt, showTypingAt, showReplyAt, replyText }) {
  const t = useTime();
  const userOpacity = tween(t, showUserAt, showUserAt + 0.4, 0, 1);
  const userTy = tween(t, showUserAt, showUserAt + 0.4, 12, 0);
  const typingOn = t >= showTypingAt && t < showReplyAt;
  const replyOpacity = tween(t, showReplyAt, showReplyAt + 0.4, 0, 1);
  const replyTy = tween(t, showReplyAt, showReplyAt + 0.4, 12, 0);

  return (
    <div style={{
      width: '100%',
      background: C.card,
      borderRadius: 14,
      border: `1px solid ${C.border}`,
      boxShadow: '0 6px 22px -10px rgba(31,29,26,0.10)',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${C.divider}`,
        display: 'flex', alignItems: 'center', gap: 10,
        background: C.cardSoft,
      }}>
        <SparkleLogo size={18} color={C.peach}/>
        <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13, fontWeight: 600, color: C.ink}}>{copy.web_chat_title}</div>
        <div style={{flex: 1}}/>
        <div style={{
          fontFamily: 'Geist Mono, monospace', fontSize: 10.5,
          color: C.inkSubtle,
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <div style={{width: 6, height: 6, borderRadius: 3, background: C.success}}/>
          {copy.tg_synced}
        </div>
      </div>
      <div style={{padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 110}}>
        {/* user msg */}
        {t >= showUserAt && (
          <div style={{
            alignSelf: 'flex-end', maxWidth: '85%',
            background: C.peach, color: '#fff',
            padding: '9px 13px',
            borderRadius: '14px 14px 4px 14px',
            fontFamily: 'Geist, sans-serif', fontSize: 13, lineHeight: 1.35,
            opacity: userOpacity, transform: `translateY(${userTy}px)`,
            letterSpacing: '-0.005em',
          }}>{command}</div>
        )}
        {/* typing dots or reply */}
        {typingOn && <TypingDots/>}
        {t >= showReplyAt && (
          <div style={{
            alignSelf: 'flex-start', maxWidth: '88%',
            background: C.cardSoft, color: C.ink,
            padding: '9px 13px',
            borderRadius: '14px 14px 14px 4px',
            fontFamily: 'Geist, sans-serif', fontSize: 13, lineHeight: 1.4,
            opacity: replyOpacity, transform: `translateY(${replyTy}px)`,
            border: `1px solid ${C.border}`,
            whiteSpace: 'pre-line',
            letterSpacing: '-0.005em',
          }}>{replyText}</div>
        )}
      </div>
    </div>
  );
}

function TypingDots({ small = false }) {
  const t = useTime();
  const dotS = small ? 5 : 7;
  return (
    <div style={{
      alignSelf: 'flex-start',
      background: C.cardSoft, padding: small ? '5px 9px' : '9px 14px',
      borderRadius: '14px 14px 14px 4px', display: 'flex', gap: 4, alignItems: 'center',
      border: `1px solid ${C.border}`,
    }}>
      {[0,1,2].map(i => {
        const phase = (t * 1.6 + i * 0.18) % 1;
        const op = 0.3 + 0.7 * Math.max(0, Math.sin(phase * Math.PI));
        return <div key={i} style={{
          width: dotS, height: dotS, borderRadius: dotS/2,
          background: C.inkMute, opacity: op,
        }}/>;
      })}
    </div>
  );
}

// ─── Telegram chat (inside phone) ────────────────────────────────────────────

function TelegramChat({
  copy,
  userMsg,
  showUserAt,
  showBotTypingAt,
  showBotReplyAt,
  botReplyText,
  showAnomalyAt,
  anomalyTitle,
  anomalyBody,
}) {
  const t = useTime();

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#F4EFE5',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 18px 14px',
        background: C.tgHeaderBg,
        borderBottom: `1px solid ${C.divider}`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          fontFamily: 'Geist, sans-serif', fontSize: 14, color: C.peach, fontWeight: 500,
          letterSpacing: '-0.01em',
        }}>‹</div>
        <div style={{
          width: 38, height: 38, borderRadius: 19,
          background: `linear-gradient(135deg, ${C.peach}, ${C.peachDeep})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <SparkleLogo size={20} color="#fff"/>
        </div>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontFamily: 'Geist, sans-serif', fontWeight: 600, fontSize: 15, color: C.ink, letterSpacing: '-0.01em'}}>MiloAI Bot</div>
          <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12, color: C.success, marginTop: 1}}>{copy.tg_online}</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, padding: '16px 14px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', gap: 10,
        background: '#F4EFE5',
      }}>
        {/* opening bot msg context (always visible) */}
        <BotBubble>
          <div style={{fontWeight: 500, marginBottom: 2}}>{copy.tg_context_title}</div>
          <div style={{fontSize: 13, color: C.inkMute}}>{copy.tg_context_body}</div>
        </BotBubble>

        {/* User message */}
        {t >= showUserAt && (
          <UserBubble appearAt={showUserAt}>
            <div>{userMsg}</div>
          </UserBubble>
        )}

        {/* Bot typing */}
        {t >= showBotTypingAt && t < showBotReplyAt && <TgTypingBubble/>}

        {/* Bot reply: budget confirmation */}
        {t >= showBotReplyAt && (
          <BotBubble appearAt={showBotReplyAt}>
            <Stack dir="row" align="center" gap={6} style={{marginBottom: 6}}>
              <div style={{
                width: 18, height: 18, borderRadius: 9, background: C.success,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="check" size={11} color="#fff" strokeWidth={2.5}/>
              </div>
              <div style={{fontWeight: 600, fontSize: 14, color: C.ink}}>{copy.tg_reply_title}</div>
            </Stack>
            <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 12, color: C.inkMute, marginBottom: 4, lineHeight: 1.5}}>
              {copy.tg_reply_campaign}
            </div>
            <div style={{
              fontFamily: 'Geist Mono, monospace', fontSize: 15,
              color: C.ink, fontVariantNumeric: 'tabular-nums', fontWeight: 500,
            }}>
              €20 <span style={{color: C.inkSubtle}}>→</span> <span style={{color: C.peachDeep}}>€25</span>{copy.tg_reply_per_day}
            </div>
          </BotBubble>
        )}

        {/* Anomaly bot bubble */}
        {t >= showAnomalyAt && (
          <BotBubble appearAt={showAnomalyAt} accent="danger">
            <Stack dir="row" align="center" gap={6} style={{marginBottom: 6}}>
              <div style={{
                width: 18, height: 18, borderRadius: 9, background: C.dangerSoft,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="alert" size={11} color={C.danger} strokeWidth={2.2}/>
              </div>
              <div style={{fontWeight: 600, fontSize: 14, color: C.danger}}>{anomalyTitle}</div>
            </Stack>
            <div style={{fontSize: 13, color: C.inkMute, lineHeight: 1.4, marginBottom: 10}}>
              {anomalyBody}
            </div>
            <Stack dir="row" gap={6}>
              <TgInlineBtn label={copy.tg_btn_pause} icon="pause"/>
              <TgInlineBtn label={copy.tg_btn_inspect}/>
            </Stack>
          </BotBubble>
        )}
      </div>

      {/* Input bar */}
      <div style={{
        padding: '10px 12px 14px',
        background: C.tgHeaderBg,
        borderTop: `1px solid ${C.divider}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Icon name="paperclip" size={22} color={C.inkSubtle}/>
        <div style={{
          flex: 1,
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          padding: '8px 14px',
          fontFamily: 'Geist, sans-serif', fontSize: 13,
          color: C.inkSubtle,
        }}>
          {copy.tg_input_placeholder}
        </div>
        <Icon name="smile" size={22} color={C.inkSubtle}/>
        <div style={{
          width: 36, height: 36, borderRadius: 18,
          background: C.peach,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="mic" size={18} color="#fff" strokeWidth={1.8}/>
        </div>
      </div>
    </div>
  );
}

function UserBubble({ children, appearAt }) {
  const t = useTime();
  const op = appearAt != null ? tween(t, appearAt, appearAt + 0.35, 0, 1) : 1;
  const sc = appearAt != null ? tween(t, appearAt, appearAt + 0.35, 0.92, 1, Easing.easeOutBack) : 1;
  return (
    <div style={{
      alignSelf: 'flex-end', maxWidth: '78%',
      background: C.tgUserBubble, color: '#fff',
      padding: '10px 14px',
      borderRadius: '16px 16px 4px 16px',
      fontFamily: 'Geist, sans-serif', fontSize: 14, lineHeight: 1.4,
      boxShadow: '0 2px 8px -2px rgba(232, 149, 108, 0.35)',
      opacity: op, transform: `scale(${sc})`, transformOrigin: 'bottom right',
      letterSpacing: '-0.005em',
    }}>{children}</div>
  );
}

function BotBubble({ children, appearAt, accent }) {
  const t = useTime();
  const op = appearAt != null ? tween(t, appearAt, appearAt + 0.35, 0, 1) : 1;
  const sc = appearAt != null ? tween(t, appearAt, appearAt + 0.35, 0.94, 1, Easing.easeOutBack) : 1;
  return (
    <div style={{
      alignSelf: 'flex-start', maxWidth: '82%',
      background: C.card,
      padding: '10px 14px',
      borderRadius: '16px 16px 16px 4px',
      fontFamily: 'Geist, sans-serif', fontSize: 14, lineHeight: 1.4,
      color: C.ink,
      border: `1px solid ${accent === 'danger' ? C.dangerSoft : C.border}`,
      boxShadow: '0 1px 3px rgba(31,29,26,0.04)',
      opacity: op, transform: `scale(${sc})`, transformOrigin: 'bottom left',
      letterSpacing: '-0.005em',
    }}>{children}</div>
  );
}

function TgTypingBubble() {
  const t = useTime();
  return (
    <div style={{
      alignSelf: 'flex-start',
      background: C.card, padding: '11px 16px',
      borderRadius: '16px 16px 16px 4px',
      border: `1px solid ${C.border}`,
      display: 'flex', gap: 5, alignItems: 'center',
    }}>
      {[0,1,2].map(i => {
        const phase = (t * 1.8 + i * 0.22) % 1;
        const op = 0.25 + 0.75 * Math.max(0, Math.sin(phase * Math.PI));
        const ty = -2 * Math.max(0, Math.sin(phase * Math.PI));
        return <div key={i} style={{
          width: 6, height: 6, borderRadius: 3,
          background: C.inkMute, opacity: op,
          transform: `translateY(${ty}px)`,
        }}/>;
      })}
    </div>
  );
}

function TgInlineBtn({ label, icon }) {
  return (
    <div style={{
      padding: '6px 12px',
      borderRadius: 10,
      background: C.peachWash,
      border: `1px solid ${C.peachSoft}`,
      display: 'flex', alignItems: 'center', gap: 5,
      fontFamily: 'Geist, sans-serif', fontSize: 12, fontWeight: 500,
      color: C.peachDeep,
    }}>
      {icon && <Icon name={icon} size={11} color={C.peachDeep} strokeWidth={2}/>}
      {label}
    </div>
  );
}

// ─── Cursor (moves around in the browser dashboard) ──────────────────────────

function MovingCursor({ keyframes }) {
  // keyframes: [{ t: 5.6, x: 600, y: 380 }, ...]
  const t = useTime();
  // find segment
  const kf = keyframes;
  if (t < kf[0].t) return null;
  let pos = { x: kf[kf.length - 1].x, y: kf[kf.length - 1].y };
  for (let i = 0; i < kf.length - 1; i++) {
    if (t >= kf[i].t && t <= kf[i + 1].t) {
      const local = (t - kf[i].t) / (kf[i + 1].t - kf[i].t);
      const e = Easing.easeInOutCubic(local);
      pos = {
        x: kf[i].x + (kf[i + 1].x - kf[i].x) * e,
        y: kf[i].y + (kf[i + 1].y - kf[i].y) * e,
      };
      break;
    }
  }
  // fade out after last
  const last = kf[kf.length - 1];
  const fadeAfter = (last.fadeAfter ?? null);
  let opacity = 1;
  if (fadeAfter != null && t > fadeAfter) {
    opacity = Math.max(0, 1 - (t - fadeAfter) / 0.5);
  }
  // entry fade
  if (t < kf[0].t + 0.2) opacity *= (t - kf[0].t) / 0.2;

  return (
    <div style={{
      position: 'absolute', left: pos.x, top: pos.y,
      pointerEvents: 'none', zIndex: 10,
      transform: 'translate(-4px, -2px)',
      opacity,
    }}>
      <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
        <path d="M3 2l5 24 4-9 9-3L3 2z" fill="#1F1D1A" stroke="#FFF" strokeWidth="1.2" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

// ─── Expose to window ────────────────────────────────────────────────────────

Object.assign(window, {
  C, Icon, SparkleLogo, Stack, tween, envelope,
  BrowserFrame, PhoneFrame, DashboardSidebar,
  KpiCard, CampaignRow, SparkleBurst, AnomalyToast,
  WebChatPanel, TypingDots, TelegramChat,
  UserBubble, BotBubble, TgTypingBubble, TgInlineBtn,
  MovingCursor,
});
