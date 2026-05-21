// ═════════════════════════════════════════════════════════════════════════════
// 7) CHANNELS — side-by-side Meta vs Google comparison
// ═════════════════════════════════════════════════════════════════════════════

function ScreenChannels() {
  return (
    <StaticBrowserFrame url="app.miloai.com/channels">
      <MockSidebar active="channels"/>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
        <TopBar/>
        <div style={{flex: 1, padding: '22px 28px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16}}>
          <ChannelsHeader/>
          <AllocationStrip/>
          <AIAllocationCard/>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
            <MetaPanel/>
            <GooglePanel/>
          </div>
        </div>
      </div>
    </StaticBrowserFrame>
  );
}

function ChannelsHeader() {
  return (
    <div style={{display: 'flex', alignItems: 'flex-end'}}>
      <div>
        <div style={{fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 28, fontWeight: 700, color: C.ink, letterSpacing: '-0.025em'}}>Каналы</div>
        <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13.5, color: C.inkMute, marginTop: 5}}>
          Meta и Google в сравнении · AI помогает распределять бюджет между ними
        </div>
      </div>
      <div style={{flex: 1}}/>
      <div style={{display: 'flex', gap: 4}}>
        {['24ч', '7д', '30д', 'все'].map((d, i) => (
          <div key={d} style={{
            padding: '6px 12px', borderRadius: 8,
            background: i === 1 ? C.ink : 'transparent',
            color: i === 1 ? '#fff' : C.inkMute,
            border: `1px solid ${i === 1 ? C.ink : C.border}`,
            fontFamily: 'Geist, sans-serif', fontSize: 12.5, fontWeight: 500,
            cursor: 'pointer',
          }}>{d}</div>
        ))}
      </div>
    </div>
  );
}

function AllocationStrip() {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: 20,
    }}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 16}}>
        <div>
          <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkSubtle, letterSpacing: '0.1em', textTransform: 'uppercase'}}>SPEND · 7 ДНЕЙ</div>
          <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 32, fontWeight: 500, color: C.ink, letterSpacing: '-0.02em', marginTop: 4, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>€2,184</div>
        </div>
        <div style={{display: 'flex', gap: 18, marginLeft: 24}}>
          <SmallMetric label="Лиды" value="34"/>
          <SmallMetric label="CPL" value="€64"/>
          <SmallMetric label="ROAS" value="3.8×"/>
        </div>
      </div>

      {/* Allocation bar */}
      <div style={{display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12}}>
        <div style={{
          flex: 65, height: 36, borderRadius: '8px 0 0 8px',
          background: PLAT.meta,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 14px', color: '#fff',
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <MetaGlyph size={14}/>
            <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13, fontWeight: 600}}>Meta</div>
            <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11.5, opacity: 0.85}}>65%</div>
          </div>
          <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 14, fontWeight: 500, fontVariantNumeric: 'tabular-nums'}}>€1,420</div>
        </div>
        <div style={{
          flex: 35, height: 36, borderRadius: '0 8px 8px 0',
          background: PLAT.google,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 14px', color: '#fff',
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <GoogleGlyph size={14}/>
            <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13, fontWeight: 600}}>Google</div>
            <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11.5, opacity: 0.85}}>35%</div>
          </div>
          <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 14, fontWeight: 500, fontVariantNumeric: 'tabular-nums'}}>€764</div>
        </div>
      </div>

      {/* Detail row */}
      <div style={{display: 'flex', gap: 4, fontFamily: 'Geist Mono, monospace', fontSize: 11.5, color: C.inkMute}}>
        <div style={{flex: 65, padding: '0 14px', display: 'flex', gap: 16}}>
          <span>22 лидов</span>
          <span>·</span>
          <span>CPL <b style={{color: C.ink, fontWeight: 500}}>€65</b></span>
          <span>·</span>
          <span>ROAS <b style={{color: C.success, fontWeight: 500}}>4.1×</b></span>
        </div>
        <div style={{flex: 35, padding: '0 14px', display: 'flex', gap: 16}}>
          <span>12 лидов</span>
          <span>·</span>
          <span>CPL <b style={{color: C.ink, fontWeight: 500}}>€64</b></span>
          <span>·</span>
          <span>ROAS <b style={{color: C.ink, fontWeight: 500}}>2.8×</b></span>
        </div>
      </div>
    </div>
  );
}

function SmallMetric({ label, value }) {
  return (
    <div>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 9.5, color: C.inkSubtle, letterSpacing: '0.08em', textTransform: 'uppercase'}}>{label}</div>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 18, fontWeight: 500, color: C.ink, marginTop: 3, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em'}}>{value}</div>
    </div>
  );
}

function AIAllocationCard() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #FCF1E8 0%, #F8E8D9 100%)',
      border: `1px solid #F5DDC8`,
      borderRadius: 14, padding: 16,
      display: 'flex', gap: 16, alignItems: 'flex-start',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 18,
        background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 2px 6px rgba(232, 149, 108, 0.25)',
      }}>
        <SparkleLogo size={19} color={C.peach}/>
      </div>
      <div style={{flex: 1}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6}}>
          <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.peachDeep, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600}}>AI · АЛЛОКАЦИЯ</div>
        </div>
        <div style={{fontFamily: 'Geist, sans-serif', fontSize: 14.5, color: C.ink, lineHeight: 1.5, letterSpacing: '-0.005em'}}>
          В Meta ROAS <b>4.1×</b>, в Google <b>2.8×</b> — но Google быстрее конвертирует горячий трафик (тот, кто гуглит «имплант Tallinn»). Сдвинь <b>€15/день</b> в Meta-Импланты, но не выруби Google полностью — он закрывает branded запросы дешевле всего.
        </div>
        <div style={{display: 'flex', gap: 8, marginTop: 12}}>
          <div style={{padding: '7px 14px', background: C.peach, color: '#fff', borderRadius: 9, fontFamily: 'Geist, sans-serif', fontSize: 12.5, fontWeight: 500, cursor: 'pointer'}}>Применить (€15 → Meta)</div>
          <div style={{padding: '7px 14px', background: 'rgba(255,255,255,0.6)', border: `1px solid ${C.peachSoft}`, color: C.peachDeep, borderRadius: 9, fontFamily: 'Geist, sans-serif', fontSize: 12.5, fontWeight: 500, cursor: 'pointer'}}>Объясни</div>
          <div style={{padding: '7px 14px', color: C.inkMute, borderRadius: 9, fontFamily: 'Geist, sans-serif', fontSize: 12.5, cursor: 'pointer'}}>Игнор</div>
        </div>
      </div>
    </div>
  );
}

// ── Meta panel ─────────────────────────────────────────────────────────────

function MetaPanel() {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 14, overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 18px',
        background: '#F8FAFE',
        borderBottom: `1px solid #DCE5F4`,
        display: 'flex', alignItems: 'center', gap: 11,
      }}>
        <div style={{width: 36, height: 36, borderRadius: 9, background: '#fff', border: `1px solid #DCE5F4`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <MetaGlyph size={18}/>
        </div>
        <div style={{flex: 1}}>
          <div style={{fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 17, fontWeight: 700, color: PLAT.metaInk, letterSpacing: '-0.018em'}}>Meta</div>
          <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11, color: '#5273A8', marginTop: 1, display: 'flex', alignItems: 'center', gap: 6}}>
            <div style={{width: 5, height: 5, borderRadius: 3, background: C.success}}/>
            vällu_clinic_eu · BM подключён
          </div>
        </div>
        <Icon name="chevronDown" size={14} color={C.inkSubtle}/>
      </div>

      <div style={{padding: 18, display: 'flex', flexDirection: 'column', gap: 18}}>
        {/* Top creatives section */}
        <div>
          <SectionLabel>КРЕАТИВЫ ПО УГЛАМ</SectionLabel>
          <div style={{display: 'flex', flexDirection: 'column', gap: 7, marginTop: 9}}>
            <CreativeRow angle="Pain+Solution" headline="Зуба нет 5 лет? Имплант за 1 визит" ctr="2.3%" leads={8} active/>
            <CreativeRow angle="Trust+Premium" headline="Имплантация уровня премиум-клиник" ctr="1.9%" leads={6}/>
            <CreativeRow angle="Direct Offer"  headline="Имплант под ключ €890 в Tallinn"   ctr="1.6%" leads={5}/>
          </div>
        </div>

        {/* Insight */}
        <InsightBlock
          icon="check" color={C.success}
          title="Что работает у Meta"
          items={[
            <><b>Pain+Solution</b> опережает Direct Offer на <b>+30% CTR</b></>,
            <>Лучше всего — фото клиники с пациентом, не stock</>,
            <>Headline до <b>40 символов</b> = +0.4 пп CTR</>,
          ]}
        />

        {/* Ad sets */}
        <div>
          <SectionLabel>AD SETS · АУДИТОРИИ</SectionLabel>
          <div style={{display: 'flex', flexDirection: 'column', gap: 7, marginTop: 9}}>
            <AudienceRow name="Tallinn · 30-55 · women" reach="48k" cpa="€36" lookalike/>
            <AudienceRow name="Tallinn · 35-65 · all" reach="92k" cpa="€44"/>
            <AudienceRow name="Retargeting · website 30d" reach="3.2k" cpa="€61"/>
          </div>
        </div>

        <div style={{display: 'flex', gap: 7, marginTop: 4}}>
          <PanelBtn primary><Icon name="image" size={12} color="#fff"/>Сгенерить креатив</PanelBtn>
          <PanelBtn><Icon name="users" size={12} color={C.inkMute}/>Аудитории</PanelBtn>
        </div>
      </div>
    </div>
  );
}

function CreativeRow({ angle, headline, ctr, leads, active }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 11,
      padding: '9px 11px',
      background: C.cardSoft, border: `1px solid ${C.border}`,
      borderRadius: 9,
    }}>
      {/* Thumb */}
      <div style={{
        width: 36, height: 36, borderRadius: 7,
        background: `linear-gradient(135deg, #3B5C44 0%, #2E3F4F 100%)`,
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="image" size={14} color="rgba(255,255,255,0.6)"/>
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
          <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 9.5, color: C.peachDeep, background: C.peachWash, padding: '1px 5px', borderRadius: 3, fontWeight: 600, letterSpacing: '0.02em'}}>{angle}</div>
          {active && <div style={{width: 6, height: 6, borderRadius: 3, background: C.success}}/>}
        </div>
        <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12.5, color: C.ink, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{headline}</div>
      </div>
      <div style={{textAlign: 'right', flexShrink: 0}}>
        <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 12, color: C.ink, fontWeight: 500, fontVariantNumeric: 'tabular-nums'}}>{ctr}</div>
        <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10, color: C.inkSubtle, marginTop: 1}}>{leads} лидов</div>
      </div>
    </div>
  );
}

function AudienceRow({ name, reach, cpa, lookalike }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 11px',
      background: C.cardSoft, border: `1px solid ${C.border}`,
      borderRadius: 9,
    }}>
      <Icon name="users" size={14} color={PLAT.meta}/>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
          <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12.5, color: C.ink}}>{name}</div>
          {lookalike && <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 9, color: PLAT.metaInk, background: PLAT.metaSoft, padding: '0 5px', borderRadius: 3, fontWeight: 600, letterSpacing: '0.04em'}}>LAL 1%</div>}
        </div>
      </div>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11, color: C.inkMute}}>{reach}</div>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 12, color: C.ink, fontWeight: 500, minWidth: 38, textAlign: 'right'}}>{cpa}</div>
    </div>
  );
}

// ── Google panel ───────────────────────────────────────────────────────────

function GooglePanel() {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 14, overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 18px',
        background: '#F4FAEF',
        borderBottom: `1px solid #D9E7CC`,
        display: 'flex', alignItems: 'center', gap: 11,
      }}>
        <div style={{width: 36, height: 36, borderRadius: 9, background: '#fff', border: `1px solid #D9E7CC`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <GoogleGlyph size={18}/>
        </div>
        <div style={{flex: 1}}>
          <div style={{fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 17, fontWeight: 700, color: '#1A56C7', letterSpacing: '-0.018em'}}>Google Ads</div>
          <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11, color: '#5A8052', marginTop: 1, display: 'flex', alignItems: 'center', gap: 6}}>
            <div style={{width: 5, height: 5, borderRadius: 3, background: C.success}}/>
            MCC Estonia · 2 кампании
          </div>
        </div>
        <Icon name="chevronDown" size={14} color={C.inkSubtle}/>
      </div>

      <div style={{padding: 18, display: 'flex', flexDirection: 'column', gap: 18}}>
        {/* Top keywords */}
        <div>
          <SectionLabel>ТОП КЛЮЧЕВИКОВ (по конверсиям)</SectionLabel>
          <div style={{display: 'flex', flexDirection: 'column', gap: 5, marginTop: 9}}>
            <KeywordRow term="имплант tallinn" impressions={482} ctr="6.2%" cpc="€0.54" leads={6} match="exact" featured/>
            <KeywordRow term="зубной имплант цена" impressions={391} ctr="4.8%" cpc="€0.71" leads={4} match="phrase"/>
            <KeywordRow term="vällu стоматолог"  impressions={287} ctr="11.5%" cpc="€0.22" leads={2} match="brand"/>
            <KeywordRow term="имплантация под ключ" impressions={203} ctr="3.4%" cpc="€0.62" leads={1} match="broad"/>
          </div>
          <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkSubtle, marginTop: 7, textAlign: 'right'}}>+ 138 keywords</div>
        </div>

        {/* Insight */}
        <InsightBlock
          icon="check" color={C.success}
          title="Что работает у Google"
          items={[
            <><b>«имплант tallinn»</b> и брендовые запросы дают <b>54% лидов</b></>,
            <><b>Exact match</b> в 3× эффективнее broad по CPA</>,
            <>Search Terms Report: 47 новых запросов за неделю, AI добавит лучшие</>,
          ]}
        />

        {/* RSA Assets */}
        <div>
          <SectionLabel>RSA · ТОП HEADLINES (15)</SectionLabel>
          <div style={{display: 'flex', flexDirection: 'column', gap: 5, marginTop: 9}}>
            <RsaHeadline text="Имплант под ключ — €890" perf="best" ctr="5.4%"/>
            <RsaHeadline text="Гарантия 5 лет · сертификат" perf="good" ctr="4.1%"/>
            <RsaHeadline text="Tallinn · запись в эти выходные" perf="good" ctr="3.8%"/>
            <RsaHeadline text="3D-планирование операции" perf="ok" ctr="2.2%"/>
            <RsaHeadline text="Бесплатная консультация" perf="low" ctr="1.4%"/>
          </div>
          <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkSubtle, marginTop: 7, textAlign: 'right'}}>+ 10 headlines · 4 descriptions</div>
        </div>

        <div style={{display: 'flex', gap: 7, marginTop: 4}}>
          <PanelBtn primary><Icon name="sparkleSm" size={12} color="#fff"/>Сгенерить headlines</PanelBtn>
          <PanelBtn><Icon name="search" size={12} color={C.inkMute}/>Keywords research</PanelBtn>
        </div>
      </div>
    </div>
  );
}

function KeywordRow({ term, impressions, ctr, cpc, leads, match, featured }) {
  const matchColors = {
    exact:  { bg: '#E8F5E0', color: '#456838', label: 'exact' },
    phrase: { bg: '#E8F0FE', color: '#1A56C7', label: 'phrase' },
    broad:  { bg: C.cardSoft, color: C.inkMute, label: 'broad' },
    brand:  { bg: C.peachWash, color: C.peachDeep, label: 'brand' },
  };
  const m = matchColors[match];
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 60px 50px 60px 36px',
      gap: 10, alignItems: 'center',
      padding: '7px 10px',
      background: featured ? '#F8FAFE' : 'transparent',
      border: `1px solid ${featured ? '#DCE5F4' : C.border}`,
      borderRadius: 7,
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: 6, minWidth: 0}}>
        <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 9, color: m.color, background: m.bg, padding: '1px 5px', borderRadius: 3, fontWeight: 600, letterSpacing: '0.02em', flexShrink: 0}}>{m.label}</div>
        <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 12, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{term}</div>
      </div>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11, color: C.inkMute, textAlign: 'right', fontVariantNumeric: 'tabular-nums'}}>{impressions}</div>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11, color: C.ink, textAlign: 'right', fontVariantNumeric: 'tabular-nums'}}>{ctr}</div>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11, color: C.inkMute, textAlign: 'right', fontVariantNumeric: 'tabular-nums'}}>{cpc}</div>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11.5, color: leads > 2 ? C.success : C.ink, fontWeight: 500, textAlign: 'right', fontVariantNumeric: 'tabular-nums'}}>{leads}</div>
    </div>
  );
}

function RsaHeadline({ text, perf, ctr }) {
  const perfColors = {
    best: { color: C.success, label: 'BEST', bg: C.successSoft },
    good: { color: '#456838', label: 'GOOD', bg: '#EBF1E3' },
    ok:   { color: C.inkMute, label: 'OK',   bg: C.cardSoft },
    low:  { color: C.danger,  label: 'LOW',  bg: C.dangerSoft },
  };
  const p = perfColors[perf];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '7px 10px',
      background: C.cardSoft, border: `1px solid ${C.border}`,
      borderRadius: 7,
    }}>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 9, color: p.color, background: p.bg, padding: '1px 5px', borderRadius: 3, fontWeight: 700, letterSpacing: '0.04em', flexShrink: 0}}>{p.label}</div>
      <div style={{flex: 1, fontFamily: 'Geist, sans-serif', fontSize: 12.5, color: C.ink, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{text}</div>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11, color: C.inkMute, fontVariantNumeric: 'tabular-nums'}}>{ctr}</div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 600,
      color: C.inkSubtle, letterSpacing: '0.1em', textTransform: 'uppercase',
    }}>{children}</div>
  );
}

function InsightBlock({ icon, color, title, items }) {
  return (
    <div style={{
      background: C.successSoft + '55',
      border: `1px solid ${C.successSoft}`,
      borderRadius: 10, padding: 12,
      display: 'flex', gap: 11, alignItems: 'flex-start',
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: 10,
        background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: 1,
      }}>
        <Icon name={icon} size={11} color={color} strokeWidth={2.4}/>
      </div>
      <div style={{flex: 1}}>
        <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12.5, fontWeight: 600, color: C.ink, marginBottom: 6, letterSpacing: '-0.005em'}}>{title}</div>
        <ul style={{margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4}}>
          {items.map((it, i) => (
            <li key={i} style={{fontFamily: 'Geist, sans-serif', fontSize: 12, color: C.inkMute, lineHeight: 1.5, paddingLeft: 12, position: 'relative'}}>
              <div style={{position: 'absolute', left: 0, top: 8, width: 4, height: 4, borderRadius: 2, background: color}}/>
              {it}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PanelBtn({ children, primary }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '8px 12px',
      background: primary ? C.ink : C.cardSoft,
      border: `1px solid ${primary ? C.ink : C.border}`,
      borderRadius: 8,
      color: primary ? '#fff' : C.ink,
      fontFamily: 'Geist, sans-serif', fontSize: 12, fontWeight: 500,
      cursor: 'pointer',
    }}>{children}</div>
  );
}

Object.assign(window, { ScreenChannels });
