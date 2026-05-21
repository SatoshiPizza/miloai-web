// ═════════════════════════════════════════════════════════════════════════════
// 2) CAMPAIGN DETAIL (drill-in)
// ═════════════════════════════════════════════════════════════════════════════

function ScreenCampaignDetail() {
  return (
    <StaticBrowserFrame url="app.miloai.com/campaigns/vallu-implants-tallinn">
      <MockSidebar active="campaigns"/>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
        <TopBar/>
        <div style={{flex: 1, padding: '22px 28px', overflow: 'auto', display: 'flex', gap: 22}}>
          <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 18}}>
            <CampaignHeader/>
            <CampaignChart/>
            <MetricGrid/>
            <CampaignTimeline/>
          </div>
          <div style={{width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16}}>
            <AiRecsPanel/>
            <ActionPanel/>
          </div>
        </div>
      </div>
    </StaticBrowserFrame>
  );
}

function CampaignHeader() {
  return (
    <div>
      <div style={{display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10}}>
        <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12, color: C.inkSubtle, cursor: 'pointer'}}>Кампании</div>
        <Icon name="chevronDown" size={12} color={C.inkSubtle} style={{transform: 'rotate(-90deg)'}}/>
        <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12, color: C.ink}}>Vällu — Имплантаты (Tallinn)</div>
      </div>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 14}}>
        <div>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6}}>
            <div style={{width: 8, height: 8, borderRadius: 4, background: C.success, boxShadow: `0 0 0 3px ${C.success}22`}}/>
            <div style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: 28, fontWeight: 700, color: C.ink, letterSpacing: '-0.022em',
              lineHeight: 1,
            }}>Vällu — Имплантаты (Tallinn)</div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <PlatformBadge platform="meta"/>
            <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11.5, color: C.inkSubtle}}>activated 14 Apr · 37 дней назад · 1 ad set · 3 креатива</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Chart card with axis ──
function CampaignChart() {
  // Two series: spend (peach) and conversions (sage)
  const spend  = [42, 51, 38, 47, 58, 64, 72];
  const conv   = [3,   5,  4,  6,  7,  9, 11];
  const days   = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: '18px 20px',
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18}}>
        <div style={{fontFamily: 'Geist, sans-serif', fontSize: 14, fontWeight: 600, color: C.ink}}>Spend &amp; Conversions</div>
        <div style={{flex: 1}}/>
        <div style={{display: 'flex', gap: 14, marginRight: 14}}>
          <LegendDot color={PLAT.meta} label="Spend (€)"/>
          <LegendDot color={C.success} label="Conv (qty)"/>
        </div>
        <div style={{display: 'flex', gap: 4}}>
          {['24ч', '7д', '30д', 'все'].map((d, i) => (
            <div key={d} style={{
              padding: '4px 10px', borderRadius: 6,
              background: i === 1 ? C.cardSoft : 'transparent',
              border: `1px solid ${i === 1 ? C.border : 'transparent'}`,
              fontFamily: 'Geist Mono, monospace', fontSize: 11, color: C.ink,
              cursor: 'pointer',
            }}>{d}</div>
          ))}
        </div>
      </div>
      <DualLineChart spend={spend} conv={conv} days={days}/>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
      <div style={{width: 10, height: 10, borderRadius: 5, background: color}}/>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11, color: C.inkMute}}>{label}</div>
    </div>
  );
}

function DualLineChart({ spend, conv, days }) {
  const W = 700, H = 200, padL = 36, padR = 36, padT = 12, padB = 26;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const maxSpend = Math.max(...spend) * 1.15;
  const maxConv = Math.max(...conv) * 1.15;
  const x = i => padL + (i / (spend.length - 1)) * innerW;
  const ySpend = v => padT + innerH - (v / maxSpend) * innerH;
  const yConv  = v => padT + innerH - (v / maxConv) * innerH;

  const spendPath = spend.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${ySpend(v)}`).join(' ');
  const convPath  = conv.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${yConv(v)}`).join(' ');
  const spendArea = spendPath + ` L${x(spend.length - 1)},${padT + innerH} L${x(0)},${padT + innerH} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display: 'block'}}>
      {/* gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map(p => (
        <line key={p} x1={padL} x2={W - padR} y1={padT + p * innerH} y2={padT + p * innerH} stroke={C.divider} strokeDasharray="2 4"/>
      ))}
      {/* y axes labels (left = spend €, right = conv) */}
      {[0, 0.5, 1].map(p => (
        <g key={'l' + p}>
          <text x={padL - 8} y={padT + (1 - p) * innerH + 4} fontSize="10" fontFamily="Geist Mono, monospace" textAnchor="end" fill={C.inkSubtle}>€{Math.round(maxSpend * p)}</text>
          <text x={W - padR + 8} y={padT + (1 - p) * innerH + 4} fontSize="10" fontFamily="Geist Mono, monospace" textAnchor="start" fill={C.inkSubtle}>{Math.round(maxConv * p)}</text>
        </g>
      ))}
      {/* x labels */}
      {days.map((d, i) => (
        <text key={i} x={x(i)} y={H - 8} fontSize="10" fontFamily="Geist Mono, monospace" textAnchor="middle" fill={C.inkSubtle}>{d}</text>
      ))}
      {/* spend area */}
      <path d={spendArea} fill={PLAT.meta} opacity={0.08}/>
      {/* spend line */}
      <path d={spendPath} fill="none" stroke={PLAT.meta} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      {/* conv line */}
      <path d={convPath} fill="none" stroke={C.success} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0"/>
      {/* points */}
      {spend.map((v, i) => (
        <circle key={'sp' + i} cx={x(i)} cy={ySpend(v)} r={3} fill="#fff" stroke={PLAT.meta} strokeWidth={1.5}/>
      ))}
      {conv.map((v, i) => (
        <circle key={'cv' + i} cx={x(i)} cy={yConv(v)} r={3} fill="#fff" stroke={C.success} strokeWidth={1.5}/>
      ))}
    </svg>
  );
}

function MetricGrid() {
  const m = [
    { label: 'Spend (7д)', value: '€684', sub: '+12% к прошл.', sub2: 'up' },
    { label: 'Conv (7д)',  value: '45',   sub: '+11',          sub2: 'up' },
    { label: 'CPA',        value: '€38',  sub: '−€7',           sub2: 'down', good: true },
    { label: 'CTR',        value: '2.3%', sub: '+0.4 п.п.',     sub2: 'up' },
    { label: 'CPC',        value: '€0.57', sub: '−€0.08',       sub2: 'down', good: true },
    { label: 'Reach',      value: '14.2k', sub: '+3.1k',         sub2: 'up' },
    { label: 'Freq',       value: '1.8',   sub: 'нормально',     sub2: 'flat' },
    { label: 'ROAS',       value: '4.1×',  sub: '+0.6×',         sub2: 'up' },
  ];
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12}}>
      {m.map((x, i) => (
        <div key={i} style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 11, padding: '12px 14px',
        }}>
          <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkSubtle, letterSpacing: '0.08em', textTransform: 'uppercase'}}>{x.label}</div>
          <div style={{
            fontFamily: 'Geist Mono, monospace', fontSize: 22, fontWeight: 500,
            color: C.ink, marginTop: 6, fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.015em',
          }}>{x.value}</div>
          <div style={{
            fontFamily: 'Geist Mono, monospace', fontSize: 11, marginTop: 5,
            color: x.good || x.sub2 === 'up' ? C.success : x.sub2 === 'down' ? C.danger : C.inkSubtle,
          }}>{x.sub}</div>
        </div>
      ))}
    </div>
  );
}

function CampaignTimeline() {
  const events = [
    { t: 'сейчас', icon: 'sparkleSm', color: C.peach, title: 'AI пересчитал прогноз', body: 'ROAS останется 4.1× при +50% бюджете' },
    { t: '3 ч назад', icon: 'arrowUp', color: C.success, title: 'Бюджет поднят с €20 до €30', body: 'Голос из Telegram · "подними до €30"' },
    { t: '2 дня', icon: 'image', color: PLAT.meta, title: 'Регенерация креативов (Premium angle)', body: '3 баннера · 1 фото с сайта' },
    { t: '5 дней', icon: 'play', color: C.success, title: 'Кампания запущена', body: 'Audit 9/10 · €20/day · 3 креатива' },
  ];
  return (
    <div style={{background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 20px'}}>
      <div style={{fontFamily: 'Geist, sans-serif', fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 14}}>Таймлайн событий</div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        {events.map((e, i) => (
          <div key={i} style={{display: 'flex', alignItems: 'flex-start', gap: 12}}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: e.color === C.peach ? C.peachWash : e.color === C.success ? C.successSoft : PLAT.metaSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon name={e.icon} size={13} color={e.color} strokeWidth={2}/>
            </div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13, fontWeight: 500, color: C.ink}}>{e.title}</div>
              <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12, color: C.inkMute, marginTop: 2}}>{e.body}</div>
            </div>
            <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkSubtle, flexShrink: 0}}>{e.t}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AiRecsPanel() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #FCF1E8 0%, #F8E8D9 100%)',
      border: `1px solid #F5DDC8`,
      borderRadius: 14, padding: 16,
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12}}>
        <SparkleLogo size={18} color={C.peach}/>
        <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.peachDeep, letterSpacing: '0.1em', fontWeight: 600, textTransform: 'uppercase'}}>AI рекомендации</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 11}}>
        <Rec icon="arrowUp" iconColor={C.success}
          title="Поднять бюджет до €45/день"
          body="CPL в 3× ниже среднего по EE. По прогнозу +6 лидов в неделю при сохранении ROAS &gt;3.5×."
          cta="Применить"/>
        <Rec icon="image" iconColor={PLAT.meta}
          title="Регенерировать креатив #2"
          body="Trust+Premium падает по CTR на 7 день. Свежее фото с сайта + новый headline."
          cta="Регенерить"/>
        <Rec icon="globe" iconColor={C.peachDeep}
          title="A/B-тест лендинга"
          body="Текущий конверт 4.2%. Версия B с раскрытыми ценами обычно даёт +1.8 п.п."
          cta="Запустить тест"/>
      </div>
    </div>
  );
}

function Rec({ icon, iconColor, title, body, cta }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.55)',
      borderRadius: 10, padding: '11px 13px',
    }}>
      <div style={{display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 6}}>
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name={icon} size={12} color={iconColor} strokeWidth={2}/>
        </div>
        <div style={{flex: 1}}>
          <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12.5, fontWeight: 600, color: C.ink, lineHeight: 1.3, letterSpacing: '-0.005em'}}>{title}</div>
          <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12, color: C.inkMute, marginTop: 4, lineHeight: 1.4}}>{body}</div>
        </div>
      </div>
      <div style={{display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 6}}>
        <div style={{
          padding: '5px 11px', borderRadius: 7,
          background: C.peach, color: '#fff',
          fontFamily: 'Geist, sans-serif', fontSize: 11.5, fontWeight: 500,
          cursor: 'pointer',
        }}>{cta}</div>
      </div>
    </div>
  );
}

function ActionPanel() {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: 14,
    }}>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkSubtle, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12}}>БЫСТРЫЕ ДЕЙСТВИЯ</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8}}>
        <ActionBtn icon="pause" label="Поставить на паузу"/>
        <ActionBtn icon="arrowUp" label="+20% бюджет" accent/>
        <ActionBtn icon="arrowDown" label="−20% бюджет"/>
        <ActionBtn icon="image" label="Регенерировать"/>
        <ActionBtn icon="globe" label="Аудит лендинга"/>
        <ActionBtn icon="target" label="Аудитория"/>
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, accent }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      padding: '9px 11px',
      background: accent ? C.peachWash : 'transparent',
      border: `1px solid ${accent ? C.peachSoft : C.border}`,
      borderRadius: 9,
      fontFamily: 'Geist, sans-serif', fontSize: 11.5, fontWeight: 500,
      color: accent ? C.peachDeep : C.ink,
      cursor: 'pointer',
    }}>
      <Icon name={icon} size={12} color={accent ? C.peachDeep : C.inkMute} strokeWidth={1.8}/>
      {label}
    </div>
  );
}

Object.assign(window, { ScreenCampaignDetail });
