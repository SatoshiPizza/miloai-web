// ═════════════════════════════════════════════════════════════════════════════
// 3) CREATIVES GALLERY
// ═════════════════════════════════════════════════════════════════════════════

const CREATIVE_THEMES = [
  { svc: 'Импланты',   platform: 'meta',   angle: 'Pain+Solution', headline: 'Зуба нет 5 лет? Имплант за 1 визит',     sub: 'Гарантия 5 лет · от €890', tint: '#3B5C44' },
  { svc: 'Импланты',   platform: 'meta',   angle: 'Direct Offer',  headline: 'Имплант "под ключ" в Tallinn — €890',     sub: 'Тариф фиксирован',         tint: '#2E3F4F' },
  { svc: 'Импланты',   platform: 'meta',   angle: 'Trust+Premium', headline: 'Имплантация уровня премиум-клиник',       sub: '850+ пациентов · фото-кейсы', tint: '#5E4A38' },
  { svc: 'Отбеливание',platform: 'meta',   angle: 'Pain+Solution', headline: 'Чай, кофе, годы — белее за 1 час',         sub: 'Zoom 4 · от €185',         tint: '#46538C' },
  { svc: 'Отбеливание',platform: 'meta',   angle: 'Direct Offer',  headline: 'Отбеливание Zoom · €185',                  sub: 'Запись на эту неделю',     tint: '#4A4040' },
  { svc: 'Отбеливание',platform: 'meta',   angle: 'Trust+Premium', headline: '40 оттенков белее — без боли',             sub: 'Сертификат Philips',       tint: '#3C5F70' },
  { svc: 'Чистка',     platform: 'meta',   angle: 'Pain+Solution', headline: 'Камень → чистые зубы за 40 мин',           sub: 'Ультразвук + air-flow',    tint: '#4C5B3E' },
  { svc: 'Чистка',     platform: 'meta',   angle: 'Direct Offer',  headline: 'Профчистка €70 · август',                  sub: 'Стандарт EU клиник',       tint: '#695440' },
];

function ScreenCreatives() {
  return (
    <StaticBrowserFrame url="app.miloai.com/creatives">
      <MockSidebar active="creatives"/>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
        <TopBar/>
        <div style={{flex: 1, padding: '22px 28px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 18}}>
          {/* Header */}
          <div style={{display: 'flex', alignItems: 'flex-end'}}>
            <div>
              <div style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: 28, fontWeight: 700, color: C.ink, letterSpacing: '-0.025em',
              }}>Креативы</div>
              <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13.5, color: C.inkMute, marginTop: 5}}>
                47 баннеров · сгенерированы AI на основе фото с сайта vällu.ee
              </div>
            </div>
            <div style={{flex: 1}}/>
            <div style={{display: 'flex', gap: 8}}>
              <button style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px',
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
                fontFamily: 'Geist, sans-serif', fontSize: 13, fontWeight: 500, color: C.ink, cursor: 'pointer',
              }}>
                <Icon name="image" size={13} color={C.inkMute}/>
                Загрузить фото
              </button>
              <button style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px',
                background: C.peach, color: '#fff', borderRadius: 10, border: 'none',
                fontFamily: 'Geist, sans-serif', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}>
                <Icon name="sparkleSm" size={13} color="#fff"/>
                Сгенерить ещё
              </button>
            </div>
          </div>

          {/* Filters */}
          <div style={{display: 'flex', gap: 18, paddingBottom: 6}}>
            <FilterGroup label="Услуга" items={['Все', 'Импланты', 'Отбеливание', 'Чистка', 'Брекеты']}/>
            <FilterGroup label="Платформа" items={['Все', 'Meta', 'Google']}/>
            <FilterGroup label="Угол" items={['Все', 'Pain+Solution', 'Direct Offer', 'Trust+Premium']}/>
          </div>

          {/* Grid */}
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16}}>
            {CREATIVE_THEMES.map((c, i) => <CreativeCard key={i} creative={c}/>)}
          </div>
        </div>
      </div>
    </StaticBrowserFrame>
  );
}

function FilterGroup({ label, items }) {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
      <div style={{
        fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkSubtle,
        letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: 4,
      }}>{label}</div>
      {items.map((it, i) => (
        <div key={it} style={{
          padding: '4px 10px', borderRadius: 7,
          background: i === 0 ? C.cardSoft : 'transparent',
          border: `1px solid ${i === 0 ? C.border : 'transparent'}`,
          fontFamily: 'Geist, sans-serif', fontSize: 12, color: i === 0 ? C.ink : C.inkMute,
          cursor: 'pointer',
        }}>{it}</div>
      ))}
    </div>
  );
}

function CreativeCard({ creative }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 14, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Banner preview */}
      <div style={{
        aspectRatio: '1 / 1',
        background: `linear-gradient(160deg, ${creative.tint} 0%, ${creative.tint}d0 60%, ${creative.tint}88 100%)`,
        padding: '18px 18px 14px',
        position: 'relative',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Photo placeholder (clinic image) */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `repeating-linear-gradient(135deg, ${creative.tint} 0 14px, ${creative.tint}cc 14px 28px)`,
          opacity: 0.4,
        }}/>
        {/* Vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 30% 30%, transparent 30%, ${creative.tint}cc 100%)`,
        }}/>

        {/* Platform corner */}
        <div style={{position: 'absolute', top: 12, right: 12, zIndex: 2}}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: 'rgba(255,255,255,0.95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {creative.platform === 'meta' ? <MetaGlyph size={12}/> : <GoogleGlyph size={12}/>}
          </div>
        </div>

        {/* Pill at top-left */}
        <div style={{
          position: 'relative', zIndex: 2,
          alignSelf: 'flex-start',
          padding: '4px 9px',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 100,
          fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 600,
          color: creative.tint, letterSpacing: '0.04em',
        }}>VÄLLU CLINIC</div>

        {/* Body */}
        <div style={{flex: 1}}/>
        <div style={{position: 'relative', zIndex: 2}}>
          <div style={{
            fontFamily: 'Bricolage Grotesque, Geist, sans-serif',
            fontSize: 17, fontWeight: 600,
            color: '#fff', lineHeight: 1.15, letterSpacing: '-0.01em',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
          }}>{creative.headline}</div>
          <div style={{
            fontFamily: 'Geist, sans-serif', fontSize: 12,
            color: 'rgba(255,255,255,0.85)', marginTop: 5,
          }}>{creative.sub}</div>
        </div>

        {/* CTA pill */}
        <div style={{
          position: 'relative', zIndex: 2, marginTop: 12,
          padding: '7px 14px',
          background: '#fff', color: creative.tint,
          borderRadius: 100, alignSelf: 'flex-start',
          fontFamily: 'Geist, sans-serif', fontSize: 11.5, fontWeight: 600,
        }}>Записаться →</div>
      </div>

      {/* Card meta */}
      <div style={{padding: '11px 14px', display: 'flex', flexDirection: 'column', gap: 6}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
          <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12.5, fontWeight: 500, color: C.ink}}>{creative.svc}</div>
          <div style={{
            fontFamily: 'Geist Mono, monospace', fontSize: 10, color: C.inkSubtle,
            background: C.cardSoft, padding: '1px 6px', borderRadius: 4,
            border: `1px solid ${C.border}`,
          }}>{creative.angle}</div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkSubtle}}>
          <span>CTR 2.1%</span>
          <span>·</span>
          <span>CPC €0.54</span>
          <span>·</span>
          <span>Active</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenCreatives });
