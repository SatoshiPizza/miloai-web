// ─────────────────────────────────────────────────────────────────────────────
// MiloAI — static screens for the Design Canvas.
// Each screen is self-contained and sized for its artboard.
// ─────────────────────────────────────────────────────────────────────────────

// ═════════════════════════════════════════════════════════════════════════════
// 1) DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════

function ScreenDashboard() {
  return (
    <StaticBrowserFrame url="app.miloai.com/dashboard">
      <MockSidebar active="dashboard"/>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
        <TopBar/>
        <div style={{flex: 1, padding: '24px 28px', overflow: 'auto', display: 'flex', gap: 22}}>
          {/* Main column */}
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0}}>
            <DashHeader/>
            <KpiRow/>
            <InsightsRow/>
            <CampaignsTable/>
          </div>
          {/* Right column */}
          <div style={{width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 18}}>
            <AiChatMini/>
            <AnomaliesFeed/>
          </div>
        </div>
      </div>
    </StaticBrowserFrame>
  );
}

function DashHeader() {
  return (
    <div style={{display: 'flex', alignItems: 'flex-end'}}>
      <div>
        <div style={{
          fontFamily: 'Bricolage Grotesque, Geist, sans-serif',
          fontSize: 30, fontWeight: 700, color: C.ink, letterSpacing: '-0.025em',
          lineHeight: 1.1,
        }}>Доброе утро, Vällu</div>
        <div style={{fontFamily: 'Geist, sans-serif', fontSize: 14, color: C.inkMute, marginTop: 6}}>
          7 активных кампаний · 2 аномалии за 24 ч · вчера потратили €312
        </div>
      </div>
      <div style={{flex: 1}}/>
      <div style={{display: 'flex', gap: 8}}>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '9px 14px',
          background: C.card, color: C.ink,
          borderRadius: 10, border: `1px solid ${C.border}`,
          fontFamily: 'Geist, sans-serif', fontSize: 13, fontWeight: 500,
          cursor: 'pointer',
        }}>
          <Icon name="image" size={13} color={C.inkMute}/>
          Сгенерить креативы
        </button>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '9px 14px',
          background: C.ink, color: '#fff',
          borderRadius: 10, border: 'none',
          fontFamily: 'Geist, sans-serif', fontSize: 13, fontWeight: 500,
          cursor: 'pointer',
        }}>
          <Icon name="rocket" size={13} color="#fff"/>
          Новая кампания
        </button>
      </div>
    </div>
  );
}

function KpiCardStatic({ icon, label, value, delta, deltaDir = 'up', breakdown }) {
  return (
    <div style={{
      flex: 1, padding: '16px 18px',
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 13,
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10}}>
        <Icon name={icon} size={14} color={C.inkSubtle}/>
        <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12.5, color: C.inkMute}}>{label}</div>
      </div>
      <div style={{
        fontFamily: 'Geist Mono, monospace', fontWeight: 500, fontSize: 26,
        color: C.ink, letterSpacing: '-0.02em', lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 5, marginTop: 8}}>
        <Icon name={deltaDir === 'up' ? 'arrowUp' : 'arrowDown'} size={11} color={deltaDir === 'up' ? C.success : C.danger}/>
        <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11, color: deltaDir === 'up' ? C.success : C.danger, fontVariantNumeric: 'tabular-nums'}}>{delta}</div>
      </div>
      {breakdown && (
        <div style={{display: 'flex', gap: 4, marginTop: 12, alignItems: 'center'}}>
          <div style={{
            flex: breakdown.meta,
            height: 4, borderRadius: 2, background: PLAT.meta,
          }}/>
          <div style={{
            flex: breakdown.google,
            height: 4, borderRadius: 2, background: PLAT.google,
          }}/>
          <div style={{
            fontFamily: 'Geist Mono, monospace', fontSize: 10, color: C.inkSubtle,
            marginLeft: 6,
          }}>
            <span style={{color: PLAT.metaInk}}>{Math.round(breakdown.meta * 100 / (breakdown.meta + breakdown.google))}%</span>
            {' · '}
            <span style={{color: '#1A56C7'}}>{Math.round(breakdown.google * 100 / (breakdown.meta + breakdown.google))}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiRow() {
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14}}>
      <KpiCardStatic icon="euro" label="Spend · 7д" value="€2,184" delta="+12% к прошлой" deltaDir="up" breakdown={{meta: 65, google: 35}}/>
      <KpiCardStatic icon="users" label="Leads · 7д" value="34" delta="+9 vs прошлая" deltaDir="up" breakdown={{meta: 22, google: 12}}/>
      <KpiCardStatic icon="target" label="CPL средний" value="€64" delta="−€18" deltaDir="down"/>
      <KpiCardStatic icon="trend" label="ROAS" value="3.8×" delta="+0.6×" deltaDir="up"/>
    </div>
  );
}

function InsightsRow() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #FCF1E8 0%, #F8E8D9 100%)',
      border: `1px solid #F5DDC8`,
      borderRadius: 14,
      padding: 20,
      display: 'flex', gap: 18, alignItems: 'flex-start',
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 19,
        background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 2px 6px rgba(232, 149, 108, 0.25)',
      }}>
        <SparkleLogo size={20} color={C.peach}/>
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}>
          <div style={{
            fontFamily: 'Geist Mono, monospace', fontSize: 10.5, letterSpacing: '0.1em',
            color: C.peachDeep, textTransform: 'uppercase', fontWeight: 600,
          }}>AI · СЕГОДНЯ</div>
          <div style={{width: 4, height: 4, borderRadius: 2, background: C.peach}}/>
          <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkSubtle}}>обновлено 4 мин назад</div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 9}}>
          <Insight icon="check" iconColor={C.success}
            text={<><b>CPA по импланты в 3× ниже среднего</b> по EE-клиникам — углы «гарантия 5 лет» работают. Подними бюджет?</>}/>
          <Insight icon="alert" iconColor={C.danger}
            text={<><b>Retargeting Pain+Solution креатив выдыхается</b> — CTR упал 50% за 24ч. Регенерация на новых фото с сайта?</>}/>
          <Insight icon="bolt" iconColor={C.peachDeep}
            text={<><b>Конкурент Stomatology Plus запустил новую кампанию</b> с акцией «−30% до конца месяца». Разобрать?</>}/>
        </div>
      </div>
    </div>
  );
}

function Insight({ icon, iconColor, text }) {
  return (
    <div style={{display: 'flex', alignItems: 'flex-start', gap: 10}}>
      <div style={{
        width: 18, height: 18, borderRadius: 9,
        background: 'rgba(255,255,255,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: 1,
      }}>
        <Icon name={icon} size={11} color={iconColor} strokeWidth={2.2}/>
      </div>
      <div style={{
        fontFamily: 'Geist, sans-serif', fontSize: 13.5, color: C.ink,
        lineHeight: 1.45, letterSpacing: '-0.005em',
      }}>{text}</div>
    </div>
  );
}

function CampaignsTable() {
  const rows = [
    { name: 'Vällu — Имплантаты (Tallinn)', platform: 'meta', service: 'Импланты', status: 'active', spend: '€684', clicks: '1.2k', conv: 18, cpa: '€38', ctr: '2.3%', budget: '€30/day', spark: [3, 5, 4, 6, 5, 7, 8] },
    { name: 'Vällu — Отбеливание premium',  platform: 'meta', service: 'Отбеливание', status: 'active', spend: '€412', clicks: '890', conv: 9, cpa: '€46', ctr: '1.8%', budget: '€20/day', spark: [4, 4, 5, 6, 5, 6, 6] },
    { name: 'Vällu — Search "стоматолог"',  platform: 'google', service: 'Брендовый поиск', status: 'active', spend: '€520', clicks: '1.5k', conv: 14, cpa: '€37', ctr: '5.2%', budget: '€25/day', spark: [2, 3, 4, 4, 5, 5, 6] },
    { name: 'Vällu — RSA "имплант цена"',   platform: 'google', service: 'Импланты', status: 'active', spend: '€296', clicks: '420', conv: 5, cpa: '€59', ctr: '3.1%', budget: '€18/day', spark: [3, 4, 3, 5, 4, 5, 5] },
    { name: 'Vällu — Retargeting',          platform: 'meta', service: 'Импланты',  status: 'attention', spend: '€198', clicks: '340', conv: 2, cpa: '€99', ctr: '0.9%', budget: '€15/day', spark: [5, 5, 4, 3, 3, 2, 2], badge: 'CTR ↓50%' },
    { name: 'Vällu — Brand awareness',      platform: 'meta', service: 'Бренд', status: 'paused', spend: '€74', clicks: '160', conv: 1, cpa: '€74', ctr: '1.1%', budget: '€10/day', spark: [3, 3, 3, 3, 3, 3, 3] },
  ];

  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 14, overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 18px', borderBottom: `1px solid ${C.divider}`,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{fontFamily: 'Geist, sans-serif', fontSize: 14, fontWeight: 600, color: C.ink}}>Активные кампании</div>
        <div style={{flex: 1}}/>
        <div style={{display: 'flex', gap: 6}}>
          <FilterChip label="Все" active count="7"/>
          <FilterChip label="Meta" icon={<MetaGlyph size={11}/>} count="4"/>
          <FilterChip label="Google" icon={<GoogleGlyph size={11}/>} count="2"/>
          <FilterChip label="Paused" count="1"/>
        </div>
      </div>
      {/* Header row */}
      <div style={{
        padding: '10px 18px', borderBottom: `1px solid ${C.divider}`,
        display: 'grid', gridTemplateColumns: '1fr 110px 70px 60px 60px 80px 100px 24px',
        gap: 14, alignItems: 'center',
        fontFamily: 'Geist Mono, monospace', fontSize: 10.5,
        color: C.inkSubtle, letterSpacing: '0.08em', textTransform: 'uppercase',
      }}>
        <div>Кампания</div>
        <div>Платформа</div>
        <div style={{textAlign: 'right'}}>Spend</div>
        <div style={{textAlign: 'right'}}>Conv</div>
        <div style={{textAlign: 'right'}}>CPA</div>
        <div style={{textAlign: 'center'}}>7д</div>
        <div style={{textAlign: 'right'}}>Бюджет</div>
        <div></div>
      </div>
      {rows.map((r, i) => <CampaignRowStatic key={i} row={r}/>)}
    </div>
  );
}

function FilterChip({ label, icon, active, count }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '5px 11px',
      borderRadius: 8,
      background: active ? C.ink : 'transparent',
      color: active ? '#fff' : C.inkMute,
      border: `1px solid ${active ? C.ink : C.border}`,
      fontFamily: 'Geist, sans-serif', fontSize: 12, fontWeight: 500,
    }}>
      {icon}
      {label}
      {count && (
        <div style={{
          fontFamily: 'Geist Mono, monospace', fontSize: 10,
          color: active ? 'rgba(255,255,255,0.7)' : C.inkSubtle,
        }}>{count}</div>
      )}
    </div>
  );
}

function CampaignRowStatic({ row }) {
  const statusColor = row.status === 'active' ? C.success : row.status === 'attention' ? C.warn : C.inkSubtle;
  return (
    <div style={{
      padding: '14px 18px',
      display: 'grid', gridTemplateColumns: '1fr 110px 70px 60px 60px 80px 100px 24px',
      gap: 14, alignItems: 'center',
      borderBottom: `1px solid ${C.divider}`,
      background: row.status === 'attention' ? 'rgba(217, 160, 78, 0.04)' : 'transparent',
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, minWidth: 0}}>
        <div style={{width: 7, height: 7, borderRadius: 4, background: statusColor, flexShrink: 0}}/>
        <div style={{minWidth: 0}}>
          <div style={{
            fontFamily: 'Geist, sans-serif', fontSize: 13.5, fontWeight: 500,
            color: C.ink, letterSpacing: '-0.005em',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{row.name}</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 2}}>
            <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkSubtle}}>{row.service}</div>
            {row.badge && (
              <div style={{
                fontFamily: 'Geist Mono, monospace', fontSize: 10, color: C.danger,
                background: C.dangerSoft, padding: '1px 6px', borderRadius: 4, fontWeight: 600,
              }}>{row.badge}</div>
            )}
          </div>
        </div>
      </div>
      <PlatformBadge platform={row.platform}/>
      <div style={{textAlign: 'right', fontFamily: 'Geist Mono, monospace', fontSize: 13, color: C.ink, fontVariantNumeric: 'tabular-nums'}}>{row.spend}</div>
      <div style={{textAlign: 'right', fontFamily: 'Geist Mono, monospace', fontSize: 13, color: C.ink, fontVariantNumeric: 'tabular-nums'}}>{row.conv}</div>
      <div style={{textAlign: 'right', fontFamily: 'Geist Mono, monospace', fontSize: 13, color: C.ink, fontVariantNumeric: 'tabular-nums'}}>{row.cpa}</div>
      <Sparkline data={row.spark} platform={row.platform} status={row.status}/>
      <div style={{textAlign: 'right', fontFamily: 'Geist Mono, monospace', fontSize: 13, color: C.ink, fontVariantNumeric: 'tabular-nums'}}>{row.budget}</div>
      <div style={{cursor: 'pointer', display: 'flex', justifyContent: 'flex-end'}}>
        <Icon name="chevronDown" size={14} color={C.inkSubtle} strokeWidth={1.8} style={{transform: 'rotate(-90deg)'}}/>
      </div>
    </div>
  );
}

function Sparkline({ data, platform, status, width = 80, height = 28 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 6) - 3;
    return [x, y];
  });
  const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const fillPath = path + ` L${width},${height} L0,${height} Z`;
  const color = status === 'attention' ? C.warn : platform === 'meta' ? PLAT.meta : PLAT.google;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={fillPath} fill={color} opacity={0.08}/>
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function AiChatMini() {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 14, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        padding: '12px 14px', borderBottom: `1px solid ${C.divider}`,
        display: 'flex', alignItems: 'center', gap: 9,
        background: C.cardSoft,
      }}>
        <SparkleLogo size={18} color={C.peach}/>
        <div style={{flex: 1}}>
          <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13, fontWeight: 600, color: C.ink}}>MiloAI чат</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 4, marginTop: 1}}>
            <div style={{width: 6, height: 6, borderRadius: 3, background: C.success}}/>
            <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10, color: C.inkSubtle}}>sync · Telegram</div>
          </div>
        </div>
      </div>
      <div style={{padding: 14, display: 'flex', flexDirection: 'column', gap: 9, minHeight: 230}}>
        <SmallBotBubble>Подними бюджет на «Импланты» — CPL в 3× ниже среднего по EE-клиникам.</SmallBotBubble>
        <SmallUserBubble>На сколько подними?</SmallUserBubble>
        <SmallBotBubble>С €30 до €45/день. ROAS должен остаться выше 3.5×, по прогнозу +6 лидов в неделю.</SmallBotBubble>
        <div style={{display: 'flex', gap: 6, marginTop: 2}}>
          <ActionPill>Подними до €45</ActionPill>
          <ActionPill>Объясни прогноз</ActionPill>
        </div>
      </div>
      <div style={{
        padding: '10px 14px', borderTop: `1px solid ${C.divider}`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <Icon name="mic" size={16} color={C.peach}/>
        <div style={{
          flex: 1, fontFamily: 'Geist, sans-serif', fontSize: 12, color: C.inkSubtle,
          padding: '6px 0',
        }}>Спроси или дай команду…</div>
        <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10, color: C.inkSubtle, background: C.cardSoft, padding: '2px 5px', borderRadius: 4}}>⌘K</div>
      </div>
    </div>
  );
}

function SmallBotBubble({ children }) {
  return (
    <div style={{
      alignSelf: 'flex-start', maxWidth: '90%',
      background: C.cardSoft, padding: '8px 11px',
      borderRadius: '12px 12px 12px 3px',
      fontFamily: 'Geist, sans-serif', fontSize: 12.5, lineHeight: 1.4,
      color: C.ink, border: `1px solid ${C.border}`,
    }}>{children}</div>
  );
}
function SmallUserBubble({ children }) {
  return (
    <div style={{
      alignSelf: 'flex-end', maxWidth: '85%',
      background: C.peach, color: '#fff', padding: '8px 11px',
      borderRadius: '12px 12px 3px 12px',
      fontFamily: 'Geist, sans-serif', fontSize: 12.5, lineHeight: 1.4,
    }}>{children}</div>
  );
}
function ActionPill({ children }) {
  return (
    <div style={{
      padding: '5px 10px', borderRadius: 8,
      background: C.peachWash, border: `1px solid ${C.peachSoft}`,
      color: C.peachDeep, fontFamily: 'Geist, sans-serif', fontSize: 11.5, fontWeight: 500,
      cursor: 'pointer',
    }}>{children}</div>
  );
}

function AnomaliesFeed() {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: 14,
    }}>
      <div style={{
        fontFamily: 'Geist Mono, monospace', fontSize: 10.5,
        color: C.inkSubtle, letterSpacing: '0.1em', textTransform: 'uppercase',
        fontWeight: 600, marginBottom: 12,
      }}>ИЗМЕНЕНИЯ ЗА 24 Ч</div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
        <Anomaly
          when="3 ч назад" type="danger"
          title="CTR ↓50% на Retargeting"
          body="Vällu — Pain+Solution"
        />
        <Anomaly
          when="7 ч назад" type="success"
          title="CPA −18% за день"
          body="Vällu — Имплантаты"
        />
        <Anomaly
          when="вчера" type="info"
          title="Конкурент запустил акцию"
          body="Stomatology Plus · −30%"
        />
      </div>
    </div>
  );
}

function Anomaly({ when, type, title, body }) {
  const color = type === 'danger' ? C.danger : type === 'success' ? C.success : C.peach;
  const bg = type === 'danger' ? C.dangerSoft : type === 'success' ? C.successSoft : C.peachWash;
  const icon = type === 'danger' ? 'alert' : type === 'success' ? 'check' : 'bolt';
  return (
    <div style={{display: 'flex', alignItems: 'flex-start', gap: 10}}>
      <div style={{
        width: 24, height: 24, borderRadius: 7,
        background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: 1,
      }}>
        <Icon name={icon} size={12} color={color} strokeWidth={2.2}/>
      </div>
      <div style={{flex: 1}}>
        <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12.5, fontWeight: 500, color: C.ink, letterSpacing: '-0.005em'}}>{title}</div>
        <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkSubtle, marginTop: 2}}>{body} · {when}</div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenDashboard });
