// ═════════════════════════════════════════════════════════════════════════════
// 9-12) Accounts (redesign), Landings, Competitors, Settings
// ═════════════════════════════════════════════════════════════════════════════

// ── 9. ACCOUNTS ─────────────────────────────────────────────────────────────

function ScreenAccounts() {
  return (
    <StaticBrowserFrame url="app.miloai.com/accounts">
      <MockSidebar active="accounts"/>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
        <TopBar/>
        <div style={{flex: 1, padding: '22px 28px', overflow: 'auto'}}>
          <div style={{maxWidth: 820}}>
            <div style={{marginBottom: 18}}>
              <div style={{fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 28, fontWeight: 700, color: C.ink, letterSpacing: '-0.025em'}}>Аккаунты &amp; интеграции</div>
              <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13.5, color: C.inkMute, marginTop: 5}}>
                Telegram-мост + рекламные платформы. Все OAuth-токены хранятся зашифрованно.
              </div>
            </div>

            <TelegramCard/>
            <div style={{height: 14}}/>
            <AdAccountCard platform="meta" connected
              account="vällu_clinic_eu"
              detail="Business Manager · 3 ad accounts · Pixel установлен"
              connectedSince="2 недели"
              health="ok"
            />
            <div style={{height: 14}}/>
            <AdAccountCard platform="google" connected
              account="MCC Estonia 285-471-9320"
              detail="2 кампании · €0.54 средний CPC · Conversion tracking активен"
              connectedSince="3 недели"
              health="ok"
            />
            <div style={{height: 14}}/>

            {/* Team section */}
            <div style={{marginTop: 28, marginBottom: 14}}>
              <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkSubtle, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600}}>КОМАНДА</div>
            </div>
            <TeamCard/>
          </div>
        </div>
      </div>
    </StaticBrowserFrame>
  );
}

function TelegramCard() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #FCF1E8 0%, #F8E8D9 100%)',
      border: `1px solid #F5DDC8`,
      borderRadius: 14, padding: 20,
      position: 'relative',
    }}>
      <div style={{display: 'flex', alignItems: 'flex-start', gap: 14}}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, boxShadow: '0 4px 14px -4px rgba(232,149,108,0.5)',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#229ED9">
            <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
          </svg>
        </div>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4}}>
            <div style={{fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 19, fontWeight: 700, color: C.ink, letterSpacing: '-0.018em'}}>Telegram</div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 100,
              background: '#fff', color: '#456838',
              fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
            }}>
              <div style={{width: 5, height: 5, borderRadius: 3, background: C.success}}/>
              ПОДКЛЮЧЕНО · @vallu_klinik
            </div>
            <div style={{
              padding: '2px 9px', borderRadius: 100, background: C.peach, color: '#fff',
              fontFamily: 'Geist Mono, monospace', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.05em',
            }}>KILLER</div>
          </div>
          <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13, color: C.inkMute, marginBottom: 12, lineHeight: 1.5, letterSpacing: '-0.005em'}}>
            Голосовые сообщения с телефона → автоматически распознаются и применяются. Каждое действие в браузере — летит ответом в чат.
          </div>
          <div style={{display: 'flex', gap: 18}}>
            <SyncStat label="Сообщений за неделю" value="47"/>
            <SyncStat label="Голосовых" value="22" pct="47%"/>
            <SyncStat label="Команд применено" value="14"/>
            <SyncStat label="Среднее время отклика" value="1.8с"/>
          </div>
        </div>
        <div style={{
          padding: '7px 14px', borderRadius: 9,
          background: '#fff', color: C.ink, border: `1px solid ${C.border}`,
          fontFamily: 'Geist, sans-serif', fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
          flexShrink: 0,
        }}>Открыть бота →</div>
      </div>
    </div>
  );
}

function SyncStat({ label, value, pct }) {
  return (
    <div>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 9.5, color: C.peachDeep, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600}}>{label}</div>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 5}}>
        <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 18, fontWeight: 500, color: C.ink, marginTop: 3, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em'}}>{value}</div>
        {pct && <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11, color: C.inkSubtle}}>{pct}</div>}
      </div>
    </div>
  );
}

function AdAccountCard({ platform, connected, account, detail, connectedSince, health }) {
  const isMeta = platform === 'meta';
  const Glyph = isMeta ? MetaGlyph : GoogleGlyph;
  const platformInk = isMeta ? PLAT.metaInk : '#1A56C7';

  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: 18,
      display: 'flex', alignItems: 'flex-start', gap: 14,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: '#fff', border: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Glyph size={22}/>
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4}}>
          <div style={{fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 17, fontWeight: 700, color: platformInk, letterSpacing: '-0.018em'}}>{isMeta ? 'Meta Ads' : 'Google Ads'}</div>
          {connected ? (
            <>
              <div style={{display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 100, background: C.successSoft, color: '#456838', fontFamily: 'Geist Mono, monospace', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.04em'}}>
                <div style={{width: 4, height: 4, borderRadius: 2, background: C.success}}/>
                ПОДКЛЮЧЕНО
              </div>
              <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11, color: C.inkSubtle}}>с {connectedSince} назад</div>
            </>
          ) : (
            <div style={{padding: '2px 8px', borderRadius: 100, background: C.cardSoft, color: C.inkMute, fontFamily: 'Geist Mono, monospace', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.04em'}}>НЕ ПОДКЛЮЧЕНО</div>
          )}
        </div>
        <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 12.5, color: C.ink, marginBottom: 4}}>{account}</div>
        <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12.5, color: C.inkMute, lineHeight: 1.5, letterSpacing: '-0.005em'}}>{detail}</div>
      </div>
      <div style={{display: 'flex', gap: 7, flexShrink: 0}}>
        <div style={{padding: '7px 12px', background: 'transparent', color: C.inkMute, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: 'Geist, sans-serif', fontSize: 12, fontWeight: 500, cursor: 'pointer'}}>Управление</div>
        <div style={{padding: '7px 12px', background: 'transparent', color: C.danger, border: `1px solid ${C.dangerSoft}`, borderRadius: 8, fontFamily: 'Geist, sans-serif', fontSize: 12, fontWeight: 500, cursor: 'pointer'}}>Отвязать</div>
      </div>
    </div>
  );
}

function TeamCard() {
  const members = [
    { name: 'Vällu Klinik', email: 'admin@vallu.ee', role: 'Owner', initials: 'VK' },
    { name: 'Maria Tamm',   email: 'maria@vallu.ee', role: 'Editor', initials: 'MT' },
  ];
  return (
    <div style={{background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden'}}>
      <div style={{padding: '14px 18px', borderBottom: `1px solid ${C.divider}`, display: 'flex', alignItems: 'center'}}>
        <div style={{fontFamily: 'Geist, sans-serif', fontSize: 14, fontWeight: 600, color: C.ink}}>2 участника</div>
        <div style={{flex: 1}}/>
        <div style={{padding: '6px 12px', background: C.ink, color: '#fff', borderRadius: 8, fontFamily: 'Geist, sans-serif', fontSize: 12, fontWeight: 500, cursor: 'pointer'}}>Пригласить</div>
      </div>
      {members.map((m, i) => (
        <div key={i} style={{padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: i < members.length - 1 ? `1px solid ${C.divider}` : 'none'}}>
          <div style={{width: 34, height: 34, borderRadius: 17, background: `linear-gradient(135deg, ${C.peach}, ${C.peachDeep})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Geist, sans-serif', fontSize: 12, fontWeight: 600}}>{m.initials}</div>
          <div style={{flex: 1}}>
            <div style={{fontFamily: 'Geist, sans-serif', fontSize: 14, fontWeight: 500, color: C.ink}}>{m.name}</div>
            <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11, color: C.inkSubtle}}>{m.email}</div>
          </div>
          <div style={{
            padding: '3px 9px', borderRadius: 100,
            background: m.role === 'Owner' ? C.peachWash : C.cardSoft,
            color: m.role === 'Owner' ? C.peachDeep : C.inkMute,
            fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
          }}>{m.role.toUpperCase()}</div>
        </div>
      ))}
    </div>
  );
}

// ── 10. LANDINGS ────────────────────────────────────────────────────────────

function ScreenLandings() {
  const landings = [
    { url: 'vällu.ee/implant', svc: 'Имплантация', tint: '#3B5C44', status: 'published', visitors: '1,284', conv: '4.2%', leads: 54, score: 8 },
    { url: 'vällu.ee/zoom-whitening', svc: 'Отбеливание Zoom', tint: '#46538C', status: 'published', visitors: '672', conv: '3.1%', leads: 21, score: 7 },
    { url: 'vällu.ee/cleaning', svc: 'Профчистка', tint: '#4C5B3E', status: 'draft', visitors: '—', conv: '—', leads: 0, score: null },
    { url: '—', svc: 'Брекеты Invisalign', tint: '#5E4A38', status: 'none', visitors: '—', conv: '—', leads: 0, score: null },
  ];
  return (
    <StaticBrowserFrame url="app.miloai.com/landings">
      <MockSidebar active="landings"/>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
        <TopBar/>
        <div style={{flex: 1, padding: '22px 28px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 18}}>
          <div style={{display: 'flex', alignItems: 'flex-end'}}>
            <div>
              <div style={{fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 28, fontWeight: 700, color: C.ink, letterSpacing: '-0.025em'}}>Лендинги</div>
              <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13.5, color: C.inkMute, marginTop: 5}}>
                AI-генерированные одностраничники под каждую услугу — с реальными контактами и формой
              </div>
            </div>
            <div style={{flex: 1}}/>
            <div style={{display: 'flex', gap: 8}}>
              <div style={{padding: '9px 14px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, fontFamily: 'Geist, sans-serif', fontSize: 13, fontWeight: 500, color: C.ink, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer'}}>
                <Icon name="globe" size={13} color={C.inkMute}/>
                Кастомный домен
              </div>
              <div style={{padding: '9px 14px', background: C.peach, color: '#fff', borderRadius: 10, fontFamily: 'Geist, sans-serif', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer'}}>
                <Icon name="sparkleSm" size={13} color="#fff"/>
                Сгенерить лендинг
              </div>
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14}}>
            {landings.map((l, i) => <LandingCard key={i} l={l}/>)}
          </div>
        </div>
      </div>
    </StaticBrowserFrame>
  );
}

function LandingCard({ l }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 14, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Preview */}
      <div style={{
        height: 200,
        background: l.status === 'none'
          ? `repeating-linear-gradient(135deg, #f3eee2 0 10px, #ece6d6 10px 20px)`
          : `linear-gradient(160deg, ${l.tint} 0%, ${l.tint}aa 60%, ${l.tint}55 100%)`,
        position: 'relative',
        display: 'flex', flexDirection: 'column',
        padding: 16,
      }}>
        {l.status === 'none' ? (
          <div style={{margin: 'auto', textAlign: 'center'}}>
            <Icon name="globe" size={24} color={C.inkSubtle}/>
            <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12, color: C.inkSubtle, marginTop: 8}}>Лендинг не создан</div>
          </div>
        ) : (
          <>
            {/* Fake site header */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `repeating-linear-gradient(135deg, ${l.tint} 0 14px, ${l.tint}cc 14px 28px)`,
              opacity: 0.25,
            }}/>
            <div style={{display: 'flex', alignItems: 'center', gap: 6, position: 'relative', zIndex: 2}}>
              <div style={{padding: '3px 8px', background: 'rgba(255,255,255,0.9)', borderRadius: 100, fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 600, color: l.tint, letterSpacing: '0.04em'}}>VÄLLU CLINIC</div>
              <div style={{flex: 1}}/>
              <div style={{fontFamily: 'Geist, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.9)'}}>Услуги · Команда · Контакты</div>
            </div>
            <div style={{flex: 1}}/>
            <div style={{position: 'relative', zIndex: 2}}>
              <div style={{fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.015em', textShadow: '0 1px 2px rgba(0,0,0,0.15)', marginBottom: 8}}>
                {l.svc === 'Имплантация' && 'Имплант за 1 визит'}
                {l.svc === 'Отбеливание Zoom' && 'Белее за 1 час'}
                {l.svc === 'Профчистка' && 'Чистка под ключ'}
                {l.svc === 'Брекеты Invisalign' && 'Незаметные брекеты'}
              </div>
              <div style={{padding: '7px 14px', background: '#fff', color: l.tint, borderRadius: 100, fontFamily: 'Geist, sans-serif', fontSize: 12, fontWeight: 600, display: 'inline-block'}}>
                Записаться бесплатно →
              </div>
            </div>
          </>
        )}

        {l.status === 'published' && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            padding: '3px 10px', background: 'rgba(255,255,255,0.95)', color: '#456838',
            borderRadius: 100, fontFamily: 'Geist Mono, monospace', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.04em',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <div style={{width: 5, height: 5, borderRadius: 3, background: C.success}}/>
            LIVE
          </div>
        )}
      </div>

      {/* Meta */}
      <div style={{padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontFamily: 'Geist, sans-serif', fontSize: 14, fontWeight: 600, color: C.ink}}>{l.svc}</div>
            <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11, color: C.inkSubtle, marginTop: 1, display: 'flex', alignItems: 'center', gap: 5}}>
              <Icon name="globe" size={10} color={C.inkSubtle}/>
              {l.url}
            </div>
          </div>
          {l.score && <ScoreBadge score={l.score}/>}
        </div>

        {l.status === 'published' && (
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, paddingTop: 4}}>
            <LandingStat label="Посетители 7д" value={l.visitors}/>
            <LandingStat label="Conv rate" value={l.conv}/>
            <LandingStat label="Лидов" value={l.leads}/>
          </div>
        )}

        <div style={{display: 'flex', gap: 6, marginTop: 4}}>
          <LandingAction icon="globe" label="Открыть"/>
          <LandingAction icon="sparkleSm" label="A/B тест"/>
          <div style={{flex: 1}}/>
          <LandingAction icon="settings" label=""/>
        </div>
      </div>
    </div>
  );
}

function ScoreBadge({ score }) {
  const color = score >= 8 ? C.success : score >= 6 ? C.warn : C.danger;
  const bg = score >= 8 ? C.successSoft : score >= 6 ? '#FBEDD3' : C.dangerSoft;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '4px 9px', borderRadius: 7,
      background: bg, color: color,
      fontFamily: 'Geist Mono, monospace', fontSize: 11, fontWeight: 600,
      flexShrink: 0,
    }}>
      <Icon name="check" size={10} color={color} strokeWidth={2.4}/>
      {score}/10
    </div>
  );
}

function LandingStat({ label, value }) {
  return (
    <div>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 9, color: C.inkSubtle, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600}}>{label}</div>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 14, fontWeight: 500, color: C.ink, marginTop: 2, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em'}}>{value}</div>
    </div>
  );
}

function LandingAction({ icon, label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: label ? '6px 11px' : 6,
      background: C.cardSoft, border: `1px solid ${C.border}`, borderRadius: 7,
      fontFamily: 'Geist, sans-serif', fontSize: 11.5, color: C.ink, fontWeight: 500,
      cursor: 'pointer',
    }}>
      <Icon name={icon} size={11} color={C.inkMute} strokeWidth={1.8}/>
      {label}
    </div>
  );
}

// ── 11. COMPETITORS ────────────────────────────────────────────────────────

function ScreenCompetitors() {
  const ads = [
    { tint: '#3B5C44', headline: 'Имплант под ключ за 1 день', sub: 'Гарантия 10 лет', cta: 'Записаться', daysLive: 47, badge: 'TOP' },
    { tint: '#4A4040', headline: 'Стоматолог в Tallinn без очереди', sub: 'Запись на эту неделю', cta: 'Узнать цены', daysLive: 18 },
    { tint: '#5B403E', headline: 'Скидка −30% на отбеливание', sub: 'До конца месяца', cta: 'Узнать больше', daysLive: 8, badge: 'NEW' },
    { tint: '#2E3F4F', headline: 'Имплантация по полису', sub: 'Возврат 20%', cta: 'Проверить', daysLive: 67 },
    { tint: '#695440', headline: '«Я снова улыбаюсь»', sub: 'История пациента', cta: 'Читать', daysLive: 34 },
    { tint: '#46538C', headline: 'Брекеты Invisalign · €1,890', sub: '6 месяцев', cta: 'Записаться', daysLive: 23 },
  ];
  return (
    <StaticBrowserFrame url="app.miloai.com/competitors">
      <MockSidebar active="competitors"/>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
        <TopBar/>
        <div style={{flex: 1, padding: '22px 28px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 18}}>
          <div>
            <div style={{fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 28, fontWeight: 700, color: C.ink, letterSpacing: '-0.025em'}}>Конкуренты</div>
            <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13.5, color: C.inkMute, marginTop: 5}}>
              Что крутят в Meta Ad Library соседи по нише — учимся на их углах
            </div>
          </div>

          {/* Search bar */}
          <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: 14, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Icon name="search" size={15} color={C.inkSubtle}/>
            <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13.5, color: C.ink, flex: 1}}>stomatologyplus.ee</div>
            <div style={{padding: '7px 14px', background: C.ink, color: '#fff', borderRadius: 8, fontFamily: 'Geist, sans-serif', fontSize: 12.5, fontWeight: 500, cursor: 'pointer'}}>Разобрать</div>
          </div>

          {/* Result split */}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16}}>
            {/* Ads grid */}
            <div>
              <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12}}>
                <div style={{fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 18, fontWeight: 700, color: C.ink, letterSpacing: '-0.018em'}}>Stomatology Plus</div>
                <div style={{padding: '2px 8px', borderRadius: 100, background: C.cardSoft, fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkMute}}>14 активных объявлений</div>
                <div style={{flex: 1}}/>
                <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11, color: C.inkSubtle}}>обновлено 18 мин назад</div>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10}}>
                {ads.map((ad, i) => <CompetitorAd key={i} ad={ad}/>)}
              </div>
            </div>

            {/* AI Analysis side panel */}
            <div style={{
              background: 'linear-gradient(135deg, #FCF1E8 0%, #F8E8D9 100%)',
              border: `1px solid #F5DDC8`,
              borderRadius: 14, padding: 16,
              alignSelf: 'flex-start',
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12}}>
                <SparkleLogo size={18} color={C.peach}/>
                <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.peachDeep, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600}}>AI · РАЗБОР</div>
              </div>
              <RivalInsight label="Основной угол" value="Гарантия + цена 'под ключ'" body="6 из 14 объявлений упирают на длинную гарантию (10 лет vs ваши 5)"/>
              <RivalInsight label="Средний headline" value="32 символа" body="У тебя 28 — норм, но можно протестить длиннее"/>
              <RivalInsight label="Креативы" value="Stock photo" body="Используют фотобанк. У тебя реальные фото клиники — это твоё преимущество"/>
              <RivalInsight label="Частота смены" value="Раз в 14 дней" body="Старые объявления крутят 47+ дней без замены — выгорание неминуемо"/>

              <div style={{display: 'flex', gap: 7, marginTop: 12}}>
                <div style={{padding: '7px 12px', background: C.peach, color: '#fff', borderRadius: 8, fontFamily: 'Geist, sans-serif', fontSize: 12, fontWeight: 500, cursor: 'pointer'}}>Создать контр-креатив</div>
                <div style={{padding: '7px 12px', background: 'rgba(255,255,255,0.6)', color: C.peachDeep, borderRadius: 8, fontFamily: 'Geist, sans-serif', fontSize: 12, fontWeight: 500, cursor: 'pointer'}}>Сравнить</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StaticBrowserFrame>
  );
}

function CompetitorAd({ ad }) {
  return (
    <div style={{
      borderRadius: 10, overflow: 'hidden',
      background: C.card, border: `1px solid ${C.border}`,
    }}>
      <div style={{
        height: 160,
        background: `linear-gradient(160deg, ${ad.tint} 0%, ${ad.tint}aa 100%)`,
        padding: 12, position: 'relative',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{position: 'absolute', inset: 0, background: `repeating-linear-gradient(135deg, ${ad.tint} 0 10px, ${ad.tint}cc 10px 20px)`, opacity: 0.3}}/>
        <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 5}}>
          <div style={{padding: '2px 7px', background: 'rgba(255,255,255,0.9)', borderRadius: 100, fontFamily: 'Geist Mono, monospace', fontSize: 9, fontWeight: 600, color: ad.tint, letterSpacing: '0.04em'}}>STOMATOLOGY+</div>
          {ad.badge && (
            <div style={{padding: '2px 7px', background: ad.badge === 'TOP' ? C.successSoft : C.peachWash, color: ad.badge === 'TOP' ? '#456838' : C.peachDeep, borderRadius: 100, fontFamily: 'Geist Mono, monospace', fontSize: 8.5, fontWeight: 700, letterSpacing: '0.05em'}}>{ad.badge}</div>
          )}
        </div>
        <div style={{flex: 1}}/>
        <div style={{position: 'relative'}}>
          <div style={{fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.005em'}}>{ad.headline}</div>
          <div style={{fontFamily: 'Geist, sans-serif', fontSize: 10.5, color: 'rgba(255,255,255,0.8)', marginTop: 4}}>{ad.sub}</div>
        </div>
        <div style={{position: 'relative', marginTop: 8}}>
          <div style={{padding: '4px 10px', background: '#fff', color: ad.tint, borderRadius: 100, fontFamily: 'Geist, sans-serif', fontSize: 10, fontWeight: 600, display: 'inline-block'}}>{ad.cta}</div>
        </div>
      </div>
      <div style={{padding: '8px 11px', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Geist Mono, monospace', fontSize: 10, color: C.inkSubtle}}>
        <MetaGlyph size={9}/>
        {ad.daysLive} дней · CTA «{ad.cta}»
      </div>
    </div>
  );
}

function RivalInsight({ label, value, body }) {
  return (
    <div style={{
      padding: '10px 12px',
      background: 'rgba(255,255,255,0.55)',
      borderRadius: 9, marginBottom: 8,
    }}>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 9.5, color: C.peachDeep, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600}}>{label}</div>
      <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13, fontWeight: 600, color: C.ink, marginTop: 3, letterSpacing: '-0.005em'}}>{value}</div>
      <div style={{fontFamily: 'Geist, sans-serif', fontSize: 11.5, color: C.inkMute, marginTop: 4, lineHeight: 1.5}}>{body}</div>
    </div>
  );
}

// ── 12. SETTINGS ──────────────────────────────────────────────────────────

function ScreenSettings() {
  return (
    <StaticBrowserFrame url="app.miloai.com/settings">
      <MockSidebar active="settings"/>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
        <TopBar/>
        <div style={{flex: 1, padding: '22px 28px', overflow: 'auto'}}>
          <div style={{maxWidth: 820, display: 'flex', flexDirection: 'column', gap: 18}}>
            <div>
              <div style={{fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 28, fontWeight: 700, color: C.ink, letterSpacing: '-0.025em'}}>Настройки</div>
              <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13.5, color: C.inkMute, marginTop: 5}}>
                Профиль бизнеса, целевые метрики, биллинг, ключи API
              </div>
            </div>

            {/* Tabs */}
            <div style={{display: 'flex', gap: 4, borderBottom: `1px solid ${C.divider}`, paddingBottom: 0}}>
              <SettingsTab label="Профиль" active/>
              <SettingsTab label="Цели"/>
              <SettingsTab label="Биллинг"/>
              <SettingsTab label="Команда"/>
              <SettingsTab label="API ключи"/>
              <SettingsTab label="Уведомления"/>
            </div>

            {/* Profile section */}
            <SettingsBlock title="Бизнес-профиль" subtitle="Заполняется автоматически из URL сайта и голосового описания. AI обновляет при пересканах.">
              <SettingsField label="Название" value="Vällu Klinik"/>
              <SettingsField label="Сайт" value="vällu.ee"/>
              <SettingsField label="Категория" value="Стоматология · премиум-сегмент"/>
              <SettingsField label="Гео" value="Tallinn, Estonia · обслуживаем Harju, Tartu, Pärnu"/>
              <SettingsField label="Языки" value="ET · RU · EN" pills/>
              <SettingsTextarea label="USP (от AI)" value="Имплантация под ключ с гарантией 5 лет. 850+ пациентов, 12 лет опыта, своё 3D-планирование. Не используем стоковые фото."/>
            </SettingsBlock>

            {/* Goals card */}
            <SettingsBlock title="Целевые метрики" subtitle="AI будет ориентироваться на эти цели при автоматических рекомендациях">
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12}}>
                <GoalInput label="Target CPA" value="€45" sub="текущий €38 ✓"/>
                <GoalInput label="Target ROAS" value="3.0×" sub="текущий 3.8× ✓"/>
                <GoalInput label="Лидов в неделю" value="20" sub="текущий 28 ✓"/>
              </div>
            </SettingsBlock>

            {/* Billing teaser */}
            <SettingsBlock title="Тариф &amp; биллинг" subtitle="">
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: 16,
                background: 'linear-gradient(135deg, #FCF1E8 0%, #F8E8D9 100%)',
                border: `1px solid #F5DDC8`,
                borderRadius: 11,
              }}>
                <div style={{
                  padding: '4px 10px', background: '#fff', color: C.peachDeep,
                  borderRadius: 100, fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
                }}>PRO</div>
                <div style={{flex: 1}}>
                  <div style={{fontFamily: 'Geist, sans-serif', fontSize: 14, fontWeight: 600, color: C.ink, letterSpacing: '-0.005em'}}>€99 / месяц</div>
                  <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12, color: C.inkMute, marginTop: 2}}>До 10 активных кампаний · ∞ AI-сообщений · Meta + Google · Telegram-bridge</div>
                </div>
                <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11.5, color: C.inkMute, textAlign: 'right'}}>
                  следующее списание<br/>14 декабря
                </div>
                <div style={{padding: '7px 12px', background: '#fff', border: `1px solid ${C.peachSoft}`, color: C.peachDeep, borderRadius: 8, fontFamily: 'Geist, sans-serif', fontSize: 12, fontWeight: 500, cursor: 'pointer'}}>Stripe Portal →</div>
              </div>
            </SettingsBlock>
          </div>
        </div>
      </div>
    </StaticBrowserFrame>
  );
}

function SettingsTab({ label, active }) {
  return (
    <div style={{
      padding: '10px 16px',
      borderBottom: active ? `2px solid ${C.peach}` : '2px solid transparent',
      marginBottom: -1,
      fontFamily: 'Geist, sans-serif', fontSize: 13.5, fontWeight: active ? 600 : 400,
      color: active ? C.ink : C.inkMute,
      cursor: 'pointer',
      letterSpacing: '-0.005em',
    }}>{label}</div>
  );
}

function SettingsBlock({ title, subtitle, children }) {
  return (
    <div style={{background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20}}>
      <div style={{marginBottom: 14}}>
        <div style={{fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 18, fontWeight: 700, color: C.ink, letterSpacing: '-0.018em'}}>{title}</div>
        {subtitle && <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12.5, color: C.inkMute, marginTop: 4, lineHeight: 1.5}}>{subtitle}</div>}
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>{children}</div>
    </div>
  );
}

function SettingsField({ label, value, pills }) {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: `1px solid ${C.divider}`}}>
      <div style={{width: 120, fontFamily: 'Geist, sans-serif', fontSize: 13, color: C.inkMute, flexShrink: 0}}>{label}</div>
      <div style={{flex: 1, fontFamily: 'Geist, sans-serif', fontSize: 13.5, color: C.ink, letterSpacing: '-0.005em'}}>
        {pills ? (
          <div style={{display: 'flex', gap: 6}}>
            {value.split(' · ').map((p, i) => (
              <div key={i} style={{padding: '2px 9px', borderRadius: 100, background: C.cardSoft, border: `1px solid ${C.border}`, fontFamily: 'Geist Mono, monospace', fontSize: 11, color: C.ink}}>{p}</div>
            ))}
          </div>
        ) : value}
      </div>
      <Icon name="settings" size={13} color={C.inkSubtle} style={{cursor: 'pointer'}}/>
    </div>
  );
}

function SettingsTextarea({ label, value }) {
  return (
    <div>
      <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13, color: C.inkMute, marginBottom: 6}}>{label}</div>
      <div style={{padding: '10px 12px', background: C.cardSoft, border: `1px solid ${C.border}`, borderRadius: 9, fontFamily: 'Geist, sans-serif', fontSize: 13, color: C.ink, lineHeight: 1.55, letterSpacing: '-0.005em'}}>{value}</div>
    </div>
  );
}

function GoalInput({ label, value, sub }) {
  return (
    <div>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10, color: C.inkSubtle, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 5}}>{label}</div>
      <div style={{padding: '10px 12px', background: C.cardSoft, border: `1px solid ${C.border}`, borderRadius: 9, fontFamily: 'Geist Mono, monospace', fontSize: 18, fontWeight: 500, color: C.ink, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums'}}>{value}</div>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11, color: C.success, marginTop: 4}}>{sub}</div>
    </div>
  );
}

Object.assign(window, { ScreenAccounts, ScreenLandings, ScreenCompetitors, ScreenSettings });
