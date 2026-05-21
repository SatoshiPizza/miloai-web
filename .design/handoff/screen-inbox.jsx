// ═════════════════════════════════════════════════════════════════════════════
// 6) LEAD INBOX (Kanban)
// ═════════════════════════════════════════════════════════════════════════════

const LEADS = {
  new: [
    { name: 'Marie Tamm', phone: '+372 5• 12 34', service: 'Имплант (1 зуб)', source: 'meta', when: '8 мин назад', age: 38, ai: 'Спросить: какой зуб и когда удалили. Записать на бесплатную консультацию в эти выходные.' },
    { name: 'Olga Petrova', phone: '+372 5• 99 88', service: 'Отбеливание Zoom', source: 'meta', when: '47 мин', age: 29, ai: 'Готова к продаже. Предложить запись на конкретное время.' },
    { name: 'Andres Kask', phone: '+372 5• 41 02', service: 'Профчистка', source: 'google', when: '2 ч', age: 44, ai: 'Цена-чувствительный. Подчеркнуть включение air-flow в €70.' },
  ],
  contacted: [
    { name: 'Helena Soosaar', phone: '+372 5• 71 09', service: 'Имплант (3 зуба)', source: 'meta', when: '5 ч', age: 56, ai: 'Сомневается из-за цены. Предложить рассрочку 6 мес без %.' },
    { name: 'Юрий Иванов',   phone: '+372 5• 22 15', service: 'Имплант + протез', source: 'google', when: 'вчера', age: 61, ai: 'Высокий бюджет, требуется визит. Назначен на четверг 16:00.' },
  ],
  won: [
    { name: 'Liisa Lepp', service: 'Отбеливание', source: 'meta', value: '€185', when: '2 дня' },
    { name: 'Marko Lill', service: 'Имплантация (2 зуба)', source: 'meta', value: '€1,780', when: '3 дня' },
    { name: 'Tarmo Saar', service: 'Профчистка',  source: 'google', value: '€70',   when: '4 дня' },
  ],
  lost: [
    { name: 'Anna Mets', service: 'Имплант', source: 'meta', reason: 'Цена', when: '1 день' },
    { name: 'Peeter Kõiv', service: 'Брекеты', source: 'google', reason: 'Не отвечает', when: '5 дней' },
  ],
};

function ScreenInbox() {
  return (
    <StaticBrowserFrame url="app.miloai.com/inbox">
      <MockSidebar active="inbox"/>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
        <TopBar/>
        <div style={{flex: 1, padding: '22px 28px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 18}}>
          {/* Header */}
          <div style={{display: 'flex', alignItems: 'flex-end'}}>
            <div>
              <div style={{
                fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 28, fontWeight: 700,
                color: C.ink, letterSpacing: '-0.025em',
              }}>Lead Inbox</div>
              <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13.5, color: C.inkMute, marginTop: 5}}>
                Лиды из Meta Lead Forms приходят в реальном времени. AI готовит ответ — твоё дело подтвердить.
              </div>
            </div>
            <div style={{flex: 1}}/>
            <div style={{display: 'flex', gap: 14, alignItems: 'center', marginRight: 14}}>
              <InboxStat label="Сегодня" value="5"/>
              <InboxStat label="Эта неделя" value="14"/>
              <InboxStat label="Конверсия" value="38%"/>
            </div>
          </div>

          {/* Kanban */}
          <div style={{display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr 1fr', gap: 14, flex: 1}}>
            <KanbanCol label="Новые"      count={LEADS.new.length}      color={C.peach} bg={C.peachWash}>
              {LEADS.new.map((l, i) => <LeadCardNew key={i} lead={l}/>)}
            </KanbanCol>
            <KanbanCol label="В работе"   count={LEADS.contacted.length} color="#4F7A8C" bg="#E5EEF2">
              {LEADS.contacted.map((l, i) => <LeadCardNew key={i} lead={l}/>)}
            </KanbanCol>
            <KanbanCol label="Won"        count={LEADS.won.length}       color={C.success} bg={C.successSoft}>
              {LEADS.won.map((l, i) => <LeadCardWon key={i} lead={l}/>)}
            </KanbanCol>
            <KanbanCol label="Lost"       count={LEADS.lost.length}      color={C.inkSubtle} bg={C.cardSoft}>
              {LEADS.lost.map((l, i) => <LeadCardLost key={i} lead={l}/>)}
            </KanbanCol>
          </div>
        </div>
      </div>
    </StaticBrowserFrame>
  );
}

function InboxStat({ label, value }) {
  return (
    <div>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 9.5, color: C.inkSubtle, letterSpacing: '0.08em', textTransform: 'uppercase'}}>{label}</div>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 22, fontWeight: 500, color: C.ink, fontVariantNumeric: 'tabular-nums', marginTop: 2}}>{value}</div>
    </div>
  );
}

function KanbanCol({ label, count, color, bg, children }) {
  return (
    <div style={{
      background: bg, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: 12,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '4px 4px 8px'}}>
        <div style={{width: 8, height: 8, borderRadius: 4, background: color}}/>
        <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13, fontWeight: 600, color: C.ink, letterSpacing: '-0.005em'}}>{label}</div>
        <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11, color: C.inkSubtle, background: 'rgba(255,255,255,0.6)', padding: '1px 7px', borderRadius: 6, border: `1px solid ${C.border}`}}>{count}</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflow: 'auto'}}>
        {children}
      </div>
    </div>
  );
}

function LeadCardNew({ lead }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: '11px 12px',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <div style={{
          width: 28, height: 28, borderRadius: 14,
          background: '#E2DCCC',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Geist, sans-serif', fontSize: 11, fontWeight: 600, color: C.ink,
        }}>{lead.name.split(' ').map(s => s[0]).join('').slice(0, 2)}</div>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13, fontWeight: 500, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{lead.name}</div>
          <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkSubtle}}>{lead.phone} · {lead.age}</div>
        </div>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkMute}}>
        <div style={{padding: '1px 6px', background: lead.source === 'meta' ? PLAT.metaSoft : PLAT.googleSoft, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4}}>
          {lead.source === 'meta' ? <MetaGlyph size={9}/> : <GoogleGlyph size={9}/>}
          <span style={{color: lead.source === 'meta' ? PLAT.metaInk : '#1A56C7', fontWeight: 600, letterSpacing: '0.02em'}}>{lead.source === 'meta' ? 'META' : 'GOOG'}</span>
        </div>
        <span>·</span>
        <span>{lead.service}</span>
      </div>
      <div style={{
        padding: '8px 10px',
        background: C.peachWash, border: `1px solid ${C.peachSoft}`,
        borderRadius: 8,
        display: 'flex', gap: 8, alignItems: 'flex-start',
      }}>
        <SparkleLogo size={12} color={C.peachDeep}/>
        <div style={{flex: 1}}>
          <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 9.5, color: C.peachDeep, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 3}}>AI · ОТВЕТ</div>
          <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12, color: C.ink, lineHeight: 1.4, letterSpacing: '-0.005em'}}>{lead.ai}</div>
        </div>
      </div>
      <div style={{display: 'flex', gap: 5, alignItems: 'center'}}>
        <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkSubtle, flex: 1}}>{lead.when}</div>
        <div style={{padding: '4px 10px', background: C.ink, color: '#fff', borderRadius: 7, fontFamily: 'Geist, sans-serif', fontSize: 11.5, fontWeight: 500, cursor: 'pointer'}}>Написать</div>
      </div>
    </div>
  );
}

function LeadCardWon({ lead }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: '11px 12px',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <div style={{width: 18, height: 18, borderRadius: 9, background: C.successSoft, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Icon name="check" size={11} color={C.success} strokeWidth={2.4}/>
        </div>
        <div style={{flex: 1, fontFamily: 'Geist, sans-serif', fontSize: 13, fontWeight: 500, color: C.ink}}>{lead.name}</div>
        <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 12.5, color: C.success, fontWeight: 500}}>{lead.value}</div>
      </div>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkSubtle}}>{lead.service} · {lead.when}</div>
      <div style={{display: 'flex', gap: 5, alignItems: 'center'}}>
        <div style={{padding: '1px 5px', background: lead.source === 'meta' ? PLAT.metaSoft : PLAT.googleSoft, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 3}}>
          {lead.source === 'meta' ? <MetaGlyph size={8}/> : <GoogleGlyph size={8}/>}
          <span style={{fontFamily: 'Geist Mono, monospace', fontSize: 9.5, color: lead.source === 'meta' ? PLAT.metaInk : '#1A56C7', fontWeight: 600}}>{lead.source === 'meta' ? 'META' : 'GOOG'}</span>
        </div>
      </div>
    </div>
  );
}

function LeadCardLost({ lead }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: '11px 12px',
      display: 'flex', flexDirection: 'column', gap: 5,
      opacity: 0.75,
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <div style={{flex: 1, fontFamily: 'Geist, sans-serif', fontSize: 13, fontWeight: 500, color: C.ink}}>{lead.name}</div>
        <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.danger, background: C.dangerSoft, padding: '1px 6px', borderRadius: 4}}>{lead.reason}</div>
      </div>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkSubtle}}>{lead.service} · {lead.when}</div>
    </div>
  );
}

Object.assign(window, { ScreenInbox });
