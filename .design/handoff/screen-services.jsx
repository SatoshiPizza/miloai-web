// ═════════════════════════════════════════════════════════════════════════════
// 5) SERVICES CATALOG
// ═════════════════════════════════════════════════════════════════════════════

const SERVICES = [
  {
    name: 'Импланты',
    price: 'от €890',
    tint: '#3B5C44',
    angles: ['Pain+Solution', 'Direct Offer', 'Trust+Premium'],
    landing: 'vällu.ee/implant',
    status: 'active',
    campaigns: 2,
    leads7: 18,
    cpl: '€38',
  },
  {
    name: 'Отбеливание Zoom',
    price: 'от €185',
    tint: '#46538C',
    angles: ['Pain+Solution', 'Direct Offer', 'Trust+Premium'],
    landing: 'vällu.ee/zoom-whitening',
    status: 'active',
    campaigns: 1,
    leads7: 9,
    cpl: '€46',
  },
  {
    name: 'Профчистка',
    price: '€70',
    tint: '#4C5B3E',
    angles: ['Direct Offer', 'Trust+Premium'],
    landing: 'vällu.ee/cleaning',
    status: 'ready',
    campaigns: 0,
    leads7: 0,
    cpl: '—',
  },
  {
    name: 'Брекеты Invisalign',
    price: 'от €1,890',
    tint: '#5E4A38',
    angles: [],
    landing: null,
    status: 'draft',
    campaigns: 0,
    leads7: 0,
    cpl: '—',
  },
];

function ScreenServices() {
  return (
    <StaticBrowserFrame url="app.miloai.com/services">
      <MockSidebar active="services"/>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
        <TopBar/>
        <div style={{flex: 1, padding: '22px 28px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 18}}>
          {/* Header */}
          <div style={{display: 'flex', alignItems: 'flex-end'}}>
            <div>
              <div style={{
                fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 28, fontWeight: 700,
                color: C.ink, letterSpacing: '-0.025em',
              }}>Услуги</div>
              <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13.5, color: C.inkMute, marginTop: 5}}>
                4 услуги · 3 готовы к запуску · AI обновляет креативы каждые 7 дней
              </div>
            </div>
            <div style={{flex: 1}}/>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px',
              background: C.ink, color: '#fff', borderRadius: 10, border: 'none',
              fontFamily: 'Geist, sans-serif', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>
              <Icon name="folder" size={13} color="#fff"/>
              Добавить услугу
            </button>
          </div>

          {/* Service cards */}
          <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
            {SERVICES.map((s, i) => <ServiceCard key={i} svc={s}/>)}
          </div>
        </div>
      </div>
    </StaticBrowserFrame>
  );
}

function ServiceCard({ svc }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: 18,
      display: 'flex', gap: 22, alignItems: 'stretch',
    }}>
      {/* Left: identity */}
      <div style={{width: 220, flexShrink: 0}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6}}>
          <div style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: 19, fontWeight: 700, color: C.ink, letterSpacing: '-0.018em',
          }}>{svc.name}</div>
        </div>
        <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 12.5, color: C.inkMute, marginBottom: 10}}>{svc.price}</div>
        <ServiceStatus status={svc.status}/>

        {svc.landing && (
          <div style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, color: C.inkMute, cursor: 'pointer'}}>
            <Icon name="globe" size={12} color={C.inkSubtle}/>
            <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11, color: C.inkMute, textDecoration: 'underline', textDecorationStyle: 'dotted'}}>{svc.landing}</div>
          </div>
        )}

        <div style={{display: 'flex', gap: 14, marginTop: 14}}>
          <Stat label="Кампаний" value={svc.campaigns}/>
          <Stat label="Лидов 7д" value={svc.leads7}/>
          <Stat label="CPL" value={svc.cpl}/>
        </div>
      </div>

      {/* Center: creatives */}
      <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8}}>
        <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkSubtle, letterSpacing: '0.08em', textTransform: 'uppercase'}}>3 креатива (Meta) · 15 headlines (Google)</div>
        <div style={{display: 'flex', gap: 10, flex: 1}}>
          {svc.angles.length === 0 ? (
            <div style={{
              flex: 1, borderRadius: 10,
              background: 'repeating-linear-gradient(135deg, #f3eee2 0 10px, #ece6d6 10px 20px)',
              border: `1px dashed ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Geist, sans-serif', fontSize: 12.5, color: C.inkSubtle,
              minHeight: 140,
            }}>Сгенерируй креативы — нужен Pain/Direct/Trust angle</div>
          ) : svc.angles.map((angle, i) => <MiniCreative key={i} svc={svc} angle={angle}/>)}
        </div>
      </div>

      {/* Right: actions */}
      <div style={{width: 180, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 7, justifyContent: 'center'}}>
        <ServiceAction icon="rocket" label="Запустить кампанию" primary={svc.status === 'ready'}/>
        <ServiceAction icon="sparkleSm" label="Регенерировать"/>
        <ServiceAction icon="image" label="Редактировать"/>
        <ServiceAction icon="globe" label="Лендинг"/>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 9.5, color: C.inkSubtle, letterSpacing: '0.08em', textTransform: 'uppercase'}}>{label}</div>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 16, fontWeight: 500, color: C.ink, fontVariantNumeric: 'tabular-nums', marginTop: 2}}>{value}</div>
    </div>
  );
}

function ServiceStatus({ status }) {
  const map = {
    active: { label: 'Активна', bg: C.successSoft, color: '#456838', dot: C.success },
    ready:  { label: 'Готова к запуску', bg: C.peachWash, color: C.peachDeep, dot: C.peach },
    draft:  { label: 'Черновик', bg: C.cardSoft, color: C.inkMute, dot: C.inkSubtle },
  };
  const s = map[status];
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 9px', borderRadius: 100,
      background: s.bg, color: s.color,
      fontFamily: 'Geist, sans-serif', fontSize: 11.5, fontWeight: 500,
    }}>
      <div style={{width: 6, height: 6, borderRadius: 3, background: s.dot}}/>
      {s.label}
    </div>
  );
}

function MiniCreative({ svc, angle }) {
  return (
    <div style={{
      flex: 1, borderRadius: 10, overflow: 'hidden',
      background: `linear-gradient(155deg, ${svc.tint} 0%, ${svc.tint}aa 100%)`,
      padding: '10px 12px',
      display: 'flex', flexDirection: 'column',
      position: 'relative', minHeight: 140,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `repeating-linear-gradient(135deg, ${svc.tint} 0 10px, ${svc.tint}cc 10px 20px)`,
        opacity: 0.3,
      }}/>
      <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 6}}>
        <div style={{
          padding: '2px 6px', background: 'rgba(255,255,255,0.95)',
          borderRadius: 4, fontFamily: 'Geist Mono, monospace',
          fontSize: 8, color: svc.tint, letterSpacing: '0.05em', fontWeight: 600,
        }}>VÄLLU</div>
        <div style={{flex: 1}}/>
        <div style={{
          padding: '1px 5px', background: 'rgba(255,255,255,0.85)',
          borderRadius: 3, fontFamily: 'Geist Mono, monospace',
          fontSize: 8, color: svc.tint, letterSpacing: '0.02em',
        }}>{angle.split('+')[0]}</div>
      </div>
      <div style={{flex: 1}}/>
      <div style={{position: 'relative', fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.005em'}}>
        {angle.startsWith('Pain') && 'Зуба нет давно? — Имплант за 1 визит'}
        {angle.startsWith('Direct') && svc.name === 'Импланты' && 'Имплант под ключ ' + svc.price}
        {angle.startsWith('Direct') && svc.name === 'Отбеливание Zoom' && 'Zoom отбеливание · €185'}
        {angle.startsWith('Direct') && svc.name === 'Профчистка' && 'Профчистка · €70'}
        {angle.startsWith('Trust') && 'Уровень премиум-клиник'}
      </div>
    </div>
  );
}

function ServiceAction({ icon, label, primary }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 12px',
      background: primary ? C.peach : C.cardSoft,
      border: `1px solid ${primary ? C.peach : C.border}`,
      borderRadius: 9,
      color: primary ? '#fff' : C.ink,
      fontFamily: 'Geist, sans-serif', fontSize: 12.5, fontWeight: 500,
      cursor: 'pointer',
    }}>
      <Icon name={icon} size={13} color={primary ? '#fff' : C.inkMute} strokeWidth={1.8}/>
      {label}
    </div>
  );
}

Object.assign(window, { ScreenServices });
