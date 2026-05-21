// ─────────────────────────────────────────────────────────────────────────────
// MiloAI — static product mockup screens (Design Canvas)
// Reuses C, Icon, SparkleLogo from components.jsx.
// Adds platform color treatment (Meta blue, Google multi-color).
// ─────────────────────────────────────────────────────────────────────────────

// Platform colors
const PLAT = {
  meta:        '#0866FF',
  metaSoft:    '#E5EEFE',
  metaInk:     '#0344AA',
  google:      '#4285F4',
  googleSoft:  '#E8F0FE',
  googleRed:   '#EA4335',
  googleYel:   '#FBBC04',
  googleGrn:   '#34A853',
};

// ─── Platform icons & badges ────────────────────────────────────────────────

function MetaGlyph({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 17.5c0 .8.2 1.5.7 2 .5.5 1.1.8 1.9.8 1 0 1.8-.3 2.5-.9.7-.6 1.5-1.6 2.4-3 .8-1.2 1.5-2.4 2.1-3.6 1.3 2.5 2.4 4.3 3.4 5.3 1 1 2.1 1.5 3.4 1.5 1.2 0 2.2-.4 2.9-1.2.7-.8 1.1-1.9 1.1-3.4V11c0-2.6-.7-4.7-2-6.3-1.3-1.5-3.1-2.3-5.3-2.3-1.4 0-2.7.4-3.9 1.2-1.2.8-2.3 2-3.4 3.6-1-1.6-2-2.8-3-3.6-1-.8-2.1-1.2-3.2-1.2-1.2 0-2.1.4-2.9 1.2C.4 4.4 0 5.5 0 6.9c0 1.4.4 3 1.2 4.7L3 17.5z" fill={PLAT.meta}/>
    </svg>
  );
}

function GoogleGlyph({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v3.9h5.4c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill={PLAT.google}/>
      <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1V16C4.7 19.6 8.1 22 12 22z" fill={PLAT.googleGrn}/>
      <path d="M6.4 13.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V7.7H3.1A10 10 0 002 12c0 1.6.4 3.1 1.1 4.3l3.3-2.4z" fill={PLAT.googleYel}/>
      <path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 3 14.7 2 12 2 8.1 2 4.7 4.4 3.1 7.7l3.3 2.4C7.2 7.8 9.4 5.9 12 5.9z" fill={PLAT.googleRed}/>
    </svg>
  );
}

function ChannelsIcon({ size = 17, color = 'currentColor', strokeWidth = 1.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="12" width="4" height="9" rx="0.5"/>
      <rect x="10" y="6" width="4" height="15" rx="0.5"/>
      <rect x="17" y="14" width="4" height="7" rx="0.5"/>
    </svg>
  );
}

function PlatformBadge({ platform, size = 'sm' }) {
  const isSm = size === 'sm';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: isSm ? '3px 8px' : '5px 10px',
      borderRadius: isSm ? 6 : 8,
      background: platform === 'meta' ? PLAT.metaSoft : PLAT.googleSoft,
      border: `1px solid ${platform === 'meta' ? '#CDDDFA' : '#D6E4FB'}`,
      fontSize: isSm ? 10.5 : 12, fontWeight: 600,
      color: platform === 'meta' ? PLAT.metaInk : '#1A56C7',
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
      fontFamily: 'Geist Mono, monospace',
    }}>
      {platform === 'meta' ? <MetaGlyph size={isSm ? 10 : 12}/> : <GoogleGlyph size={isSm ? 10 : 12}/>}
      {platform === 'meta' ? 'Meta' : 'Google'}
    </div>
  );
}

// ─── Top bar (inside browser, above main) ───────────────────────────────────

function TopBar() {
  return (
    <div style={{
      height: 56, flexShrink: 0,
      borderBottom: `1px solid ${C.divider}`,
      display: 'flex', alignItems: 'center',
      padding: '0 26px', gap: 16,
      background: C.surface,
    }}>
      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        flex: 1, maxWidth: 360,
        padding: '8px 14px',
        borderRadius: 9,
        background: C.cardSoft,
        border: `1px solid ${C.border}`,
      }}>
        <Icon name="search" size={14} color={C.inkSubtle}/>
        <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13, color: C.inkSubtle, flex: 1}}>Поиск, действия, AI…</div>
        <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11, color: C.inkSubtle, background: C.card, padding: '2px 6px', borderRadius: 4, border: `1px solid ${C.border}`}}>⌘K</div>
      </div>
      <div style={{flex: 1}}/>
      {/* Bell */}
      <div style={{position: 'relative', cursor: 'pointer'}}>
        <Icon name="bell" size={18} color={C.inkMute}/>
        <div style={{
          position: 'absolute', top: -3, right: -4,
          width: 14, height: 14, borderRadius: 7,
          background: C.danger, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Geist, sans-serif', fontSize: 9, fontWeight: 700,
        }}>2</div>
      </div>
      {/* Avatar */}
      <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
        <div style={{
          width: 32, height: 32, borderRadius: 16,
          background: `linear-gradient(135deg, ${C.peach}, ${C.peachDeep})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontFamily: 'Geist, sans-serif', fontWeight: 600, fontSize: 13,
        }}>VK</div>
        <div>
          <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13, fontWeight: 500, color: C.ink}}>Vällu Klinik</div>
          <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10, color: C.inkSubtle}}>Tallinn · EE</div>
        </div>
      </div>
    </div>
  );
}

// ─── Enhanced sidebar (more nav items) ──────────────────────────────────────

function MockSidebar({ active = 'dashboard' }) {
  const items = [
    { k: 'dashboard',  icon: 'grid',   label: 'Dashboard' },
    { k: 'channels',   icon: 'channels', label: 'Каналы',   custom: 'channels' },
    { k: 'campaigns',  icon: 'rocket', label: 'Кампании', count: '7' },
    { k: 'services',   icon: 'folder', label: 'Услуги' },
    { k: 'chat',       icon: 'chat',   label: 'Чат с AI', dot: true },
    { k: 'creatives',  icon: 'image',  label: 'Креативы' },
    { k: 'landings',   icon: 'globe',  label: 'Лендинги' },
    { k: 'inbox',      icon: 'inbox',  label: 'Lead Inbox', count: '5' },
    { k: 'analytics',  icon: 'trend',  label: 'Аналитика' },
    { k: 'rivals',     icon: 'target', label: 'Конкуренты' },
  ];
  const bottom = [
    { k: 'accounts', icon: 'plug',     label: 'Аккаунты' },
    { k: 'settings', icon: 'settings', label: 'Настройки' },
  ];

  const NavItem = ({ item }) => {
    const isActive = item.k === active;
    const iconEl = item.custom === 'channels'
      ? <ChannelsIcon size={17} color={isActive ? C.ink : C.inkMute}/>
      : <Icon name={item.icon} size={17} color={isActive ? C.ink : C.inkMute} strokeWidth={1.6}/>;
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '8px 12px',
        borderRadius: 9,
        background: isActive ? C.cardSoft : 'transparent',
        color: isActive ? C.ink : C.inkMute,
        fontFamily: 'Geist, sans-serif',
        fontWeight: isActive ? 500 : 400,
        fontSize: 14,
        letterSpacing: '-0.01em',
        position: 'relative',
      }}>
        {iconEl}
        <div style={{flex: 1}}>{item.label}</div>
        {item.dot && <div style={{width: 6, height: 6, borderRadius: 3, background: C.peach}}/>}
        {item.count && (
          <div style={{
            fontFamily: 'Geist Mono, monospace', fontSize: 10.5,
            color: C.inkSubtle,
            background: C.card,
            padding: '1px 6px', borderRadius: 6,
            border: `1px solid ${C.border}`,
          }}>{item.count}</div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      width: 240, flexShrink: 0,
      borderRight: `1px solid ${C.divider}`,
      padding: '22px 14px',
      display: 'flex', flexDirection: 'column',
      background: '#F8F5EE',
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', marginBottom: 22}}>
        <SparkleLogo size={22} color={C.ink}/>
        <div>
          <div style={{fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 18, color: C.ink, letterSpacing: '-0.02em'}}>MiloAI</div>
          <div style={{fontFamily: 'Geist, sans-serif', fontSize: 11, color: C.inkSubtle, marginTop: -2}}>AI media buyer</div>
        </div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
        {items.map(it => <NavItem key={it.k} item={it}/>)}
      </div>
      <div style={{flex: 1}}/>
      <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
        {bottom.map(it => <NavItem key={it.k} item={it}/>)}
      </div>
    </div>
  );
}

// ─── Generic browser chrome (no animation) ──────────────────────────────────

function StaticBrowserFrame({ children, url = 'app.miloai.com/dashboard' }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: C.surface,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        height: 44, flexShrink: 0,
        background: '#F0EBE0',
        borderBottom: `1px solid ${C.divider}`,
        display: 'flex', alignItems: 'center', padding: '0 16px',
        gap: 14,
      }}>
        <div style={{display: 'flex', gap: 7}}>
          <div style={{width: 12, height: 12, borderRadius: 6, background: '#E07053'}}/>
          <div style={{width: 12, height: 12, borderRadius: 6, background: '#E6BB55'}}/>
          <div style={{width: 12, height: 12, borderRadius: 6, background: '#85A275'}}/>
        </div>
        <div style={{
          flex: 1, maxWidth: 460,
          background: '#FFFFFF',
          borderRadius: 8, height: 26,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Geist Mono, monospace', fontSize: 12, color: C.inkMute,
          border: `1px solid rgba(31,29,26,0.05)`,
          gap: 6,
        }}>
          <Icon name="globe" size={11} color={C.inkSubtle}/>
          {url}
        </div>
        <div style={{flex: 1}}/>
      </div>
      <div style={{flex: 1, display: 'flex', overflow: 'hidden'}}>{children}</div>
    </div>
  );
}

Object.assign(window, { PLAT, MetaGlyph, GoogleGlyph, PlatformBadge, TopBar, MockSidebar, StaticBrowserFrame, ChannelsIcon });
