// ═════════════════════════════════════════════════════════════════════════════
// 8) NEW CAMPAIGN WIZARD — 5-step flow, on-brand redesign
// Replaces the generic shadcn wizard with our warm peach treatment.
// Each step is a separate artboard so reviewer can compare them side-by-side.
// ═════════════════════════════════════════════════════════════════════════════

function WizardFrame({ stepIdx, children }) {
  return (
    <StaticBrowserFrame url="app.miloai.com/campaigns/new">
      <MockSidebar active="campaigns"/>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
        <TopBar/>
        <div style={{flex: 1, padding: '22px 28px', overflow: 'auto', display: 'flex', justifyContent: 'center'}}>
          <div style={{maxWidth: 760, width: '100%', display: 'flex', flexDirection: 'column', gap: 20}}>
            <WizardHeader/>
            <WizardStepper current={stepIdx}/>
            {children}
          </div>
        </div>
      </div>
    </StaticBrowserFrame>
  );
}

function WizardHeader() {
  return (
    <div>
      <div style={{display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8}}>
        <Icon name="arrowRight" size={12} color={C.inkSubtle} style={{transform: 'rotate(180deg)'}}/>
        <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12.5, color: C.inkMute, cursor: 'pointer'}}>Кампании</div>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `linear-gradient(135deg, ${C.peach}, ${C.peachDeep})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 18px -6px rgba(232,149,108,0.5)',
        }}>
          <Icon name="rocket" size={20} color="#fff" strokeWidth={1.8}/>
        </div>
        <div>
          <div style={{
            fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 28, fontWeight: 700,
            color: C.ink, letterSpacing: '-0.025em', lineHeight: 1.05,
          }}>Новая кампания</div>
          <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13.5, color: C.inkMute, marginTop: 3}}>
            AI проведёт тебя по 5 шагам и поможет с аудитом перед запуском
          </div>
        </div>
      </div>
    </div>
  );
}

function WizardStepper({ current }) {
  const steps = ['Платформы', 'Услуга', 'Бюджет', 'Аудит', 'Готово'];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '14px 18px',
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 12,
    }}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={i}>
            <div style={{display: 'flex', alignItems: 'center', gap: 9}}>
              <div style={{
                width: 24, height: 24, borderRadius: 12,
                background: done ? C.success : active ? C.peach : C.cardSoft,
                border: done || active ? 'none' : `1px solid ${C.border}`,
                color: done || active ? '#fff' : C.inkSubtle,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Geist Mono, monospace', fontSize: 11.5, fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
                boxShadow: active ? '0 0 0 4px rgba(232,149,108,0.18)' : 'none',
              }}>
                {done ? <Icon name="check" size={12} color="#fff" strokeWidth={2.5}/> : i + 1}
              </div>
              <div style={{
                fontFamily: 'Geist, sans-serif', fontSize: 12.5,
                color: active ? C.ink : done ? C.inkMute : C.inkSubtle,
                fontWeight: active ? 500 : 400,
                letterSpacing: '-0.005em',
              }}>{label}</div>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 1,
                background: done ? `${C.success}66` : C.divider,
                margin: '0 4px',
              }}/>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function WizardCard({ children, title, subtitle, actions }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      <div style={{padding: '20px 24px 4px'}}>
        <div style={{
          fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 20, fontWeight: 700,
          color: C.ink, letterSpacing: '-0.02em',
        }}>{title}</div>
        {subtitle && (
          <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13.5, color: C.inkMute, marginTop: 5, lineHeight: 1.5}}>
            {subtitle}
          </div>
        )}
      </div>
      <div style={{padding: '16px 24px'}}>{children}</div>
      {actions && (
        <div style={{
          padding: '14px 24px',
          borderTop: `1px solid ${C.divider}`,
          background: C.cardSoft,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>{actions}</div>
      )}
    </div>
  );
}

function WizardBtn({ children, primary, ghost, disabled, icon, iconLeft, onLeft }) {
  const baseStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    padding: '10px 18px',
    borderRadius: 9,
    fontFamily: 'Geist, sans-serif', fontSize: 13.5, fontWeight: 500,
    letterSpacing: '-0.005em',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transition: 'background 120ms',
    border: 'none',
  };
  if (ghost) {
    return (
      <div style={{...baseStyle, background: 'transparent', color: C.inkMute, marginRight: onLeft ? 'auto' : 0}}>
        {iconLeft && <Icon name={iconLeft} size={13} color={C.inkMute}/>}
        {children}
      </div>
    );
  }
  if (primary) {
    return (
      <div style={{
        ...baseStyle,
        background: C.peach, color: '#fff',
        boxShadow: disabled ? 'none' : '0 4px 14px -4px rgba(232,149,108,0.5)',
        marginLeft: 'auto',
      }}>
        {children}
        {icon && <Icon name={icon} size={13} color="#fff" strokeWidth={2}/>}
      </div>
    );
  }
  return (
    <div style={{...baseStyle, background: C.card, color: C.ink, border: `1px solid ${C.border}`}}>
      {children}
    </div>
  );
}

// ── Step 1: Platforms ───────────────────────────────────────────────────────

function WizardStep1() {
  return (
    <WizardFrame stepIdx={0}>
      <WizardCard
        title="Где запускаем?"
        subtitle="Выбери платформы. Если что-то не подключено — кликни «Подключить» и пройди OAuth (1 минута)."
        actions={
          <>
            <WizardBtn ghost onLeft iconLeft="arrowRight">← Отменить</WizardBtn>
            <WizardBtn primary icon="arrowRight">Дальше</WizardBtn>
          </>
        }
      >
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          <PlatformOption platform="meta" connected enabled
            name="Meta Ads"
            sub="Facebook + Instagram · Business Manager vällu_clinic_eu · 3 ad accounts"
            highlight="Здесь обычно лучше для emotional/visual креативов"
          />
          <PlatformOption platform="google" connected enabled
            name="Google Ads"
            sub="MCC Estonia · 2 кампании активны · €0.54 средний CPC"
            highlight="Берёт горячий трафик — те кто ищет «имплант tallinn»"
          />
        </div>
      </WizardCard>
    </WizardFrame>
  );
}

function PlatformOption({ platform, connected, enabled, name, sub, highlight }) {
  const colorBg = platform === 'meta' ? PLAT.metaSoft : '#F4FAEF';
  const colorBorder = platform === 'meta' ? '#CDDDFA' : '#D9E7CC';
  const colorInk = platform === 'meta' ? PLAT.metaInk : '#1A56C7';
  const Glyph = platform === 'meta' ? MetaGlyph : GoogleGlyph;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: 16,
      background: enabled ? colorBg + '55' : C.cardSoft,
      border: `1px solid ${enabled ? colorBorder : C.border}`,
      borderRadius: 12,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        background: '#fff', border: `1px solid ${enabled ? colorBorder : C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Glyph size={20}/>
      </div>
      <div style={{flex: 1}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4}}>
          <div style={{fontFamily: 'Geist, sans-serif', fontSize: 15, fontWeight: 600, color: C.ink, letterSpacing: '-0.01em'}}>{name}</div>
          {connected && (
            <div style={{display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 100, background: C.successSoft, color: '#456838', fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.04em'}}>
              <div style={{width: 5, height: 5, borderRadius: 3, background: C.success}}/>
              ПОДКЛЮЧЕНО
            </div>
          )}
        </div>
        <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11.5, color: C.inkMute, lineHeight: 1.5, marginBottom: 6}}>{sub}</div>
        <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12.5, color: colorInk, fontStyle: 'italic', lineHeight: 1.45}}>{highlight}</div>
      </div>
      <div style={{
        width: 22, height: 22, borderRadius: 6,
        background: enabled ? C.peach : 'transparent',
        border: `1.5px solid ${enabled ? C.peach : C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {enabled && <Icon name="check" size={13} color="#fff" strokeWidth={2.5}/>}
      </div>
    </div>
  );
}

// ── Step 2: Service ─────────────────────────────────────────────────────────

function WizardStep2({ platforms = { meta: true, google: true }, variant = 'both' }) {
  // platforms = which platforms were selected on Step 1
  const services = [
    { name: 'Имплантация', desc: 'Имплант под ключ от €890. Лендинг готов.', meta: 'ready', google: 'ready', selected: true, price: 'от €890', metaCount: '6 креативов', googleCount: '15 headlines · 4 descriptions' },
    { name: 'Отбеливание Zoom', desc: 'Профессиональное отбеливание зубов.', meta: 'ready', google: 'ready', price: '€185', metaCount: '3 креатива', googleCount: '15 headlines' },
    { name: 'Профчистка', desc: 'Ультразвук + air-flow за 40 минут.', meta: 'will-gen', google: 'ready', price: '€70', metaCount: null, googleCount: '15 headlines' },
    { name: 'Брекеты Invisalign', desc: 'Без описания. AI сгенерирует при запуске.', meta: 'will-gen', google: 'will-gen', price: 'от €1,890', metaCount: null, googleCount: null },
  ];

  // Context line: tell the user what they picked on step 1
  const ctxLabel = (() => {
    if (platforms.meta && platforms.google) return 'Запускаем в Meta + Google';
    if (platforms.meta) return 'Запускаем только в Meta';
    if (platforms.google) return 'Запускаем только в Google';
    return '';
  })();

  return (
    <WizardFrame stepIdx={1}>
      <WizardCard
        title="Какую услугу рекламируем?"
        subtitle={
          <span style={{display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap'}}>
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', background: C.peachWash, border: `1px solid ${C.peachSoft}`, borderRadius: 100, color: C.peachDeep, fontFamily: 'Geist Mono, monospace', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.04em'}}>
              {platforms.meta && <MetaGlyph size={10}/>}
              {platforms.google && <GoogleGlyph size={10}/>}
              {ctxLabel.toUpperCase()}
            </span>
            <span style={{color: C.inkMute}}>· выбери что рекламируем — статус креативов покажу справа</span>
          </span>
        }
        actions={
          <>
            <WizardBtn ghost onLeft iconLeft="arrowRight">← Назад</WizardBtn>
            <WizardBtn primary icon="arrowRight">Дальше</WizardBtn>
          </>
        }
      >
        <div style={{display: 'flex', flexDirection: 'column', gap: 9}}>
          {services.map((s, i) => <ServiceOption key={i} svc={s} platforms={platforms}/>)}
        </div>
        <div style={{
          marginTop: 14,
          padding: '10px 14px',
          background: C.peachWash, border: `1px dashed ${C.peachSoft}`,
          borderRadius: 9,
          display: 'flex', alignItems: 'center', gap: 9,
          fontFamily: 'Geist, sans-serif', fontSize: 12.5, color: C.peachDeep,
          cursor: 'pointer',
        }}>
          <Icon name="sparkleSm" size={13} color={C.peachDeep}/>
          Не вижу подходящую услугу — <span style={{textDecoration: 'underline'}}>добавить новую</span>
        </div>
      </WizardCard>
    </WizardFrame>
  );
}

function ServiceOption({ svc, platforms }) {
  // Build readiness status only for selected platforms.
  const showMeta = platforms.meta;
  const showGoogle = platforms.google;

  const metaReady = svc.meta === 'ready';
  const googleReady = svc.google === 'ready';

  // Aggregate state for the status line
  let statusLine = null;
  if (showMeta && showGoogle) {
    if (metaReady && googleReady) {
      statusLine = { icon: '✨', text: 'Всё готово — мгновенный запуск', color: C.success };
    } else if (!metaReady && !googleReady) {
      statusLine = { icon: '⊙', text: 'AI сгенерирует креативы при запуске (~30 сек)', color: C.inkMute };
    } else {
      // Mixed
      statusLine = {
        icon: '⊙',
        text: metaReady
          ? `Meta готова · Google сгенерируется (~30 сек)`
          : `Google готов · Meta сгенерируется (~30 сек)`,
        color: C.warn,
      };
    }
  } else if (showMeta) {
    statusLine = metaReady
      ? { icon: '✨', text: `Готово — ${svc.metaCount || '3 креатива'}`, color: C.success }
      : { icon: '⊙', text: 'AI сгенерирует креативы при запуске (~30 сек)', color: C.inkMute };
  } else if (showGoogle) {
    statusLine = googleReady
      ? { icon: '✨', text: `Готово — ${svc.googleCount || '15 headlines'}`, color: C.success }
      : { icon: '⊙', text: 'AI сгенерирует RSA при запуске (~30 сек)', color: C.inkMute };
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px',
      background: svc.selected ? C.peachWash : 'transparent',
      border: `1px solid ${svc.selected ? C.peach : C.border}`,
      borderRadius: 11,
      cursor: 'pointer',
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: 10,
        border: `1.5px solid ${svc.selected ? C.peach : C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {svc.selected && <div style={{width: 8, height: 8, borderRadius: 4, background: C.peach}}/>}
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <div style={{fontFamily: 'Geist, sans-serif', fontSize: 14, fontWeight: 500, color: C.ink, letterSpacing: '-0.005em'}}>{svc.name}</div>
          <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11, color: C.inkSubtle}}>{svc.price}</div>
        </div>
        <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12, color: C.inkMute, marginTop: 2, lineHeight: 1.45}}>{svc.desc}</div>
        {statusLine && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontFamily: 'Geist, sans-serif', fontSize: 11.5,
            color: statusLine.color,
            marginTop: 6, fontWeight: 500,
            letterSpacing: '-0.005em',
          }}>
            <span style={{fontSize: 12, lineHeight: 1}}>{statusLine.icon}</span>
            {statusLine.text}
          </div>
        )}
      </div>
    </div>
  );
}

// Variants for the design review — same Step 2 but different Step 1 context.
function WizardStep2_BothPlatforms() {
  return <WizardStep2 platforms={{ meta: true, google: true }}/>;
}
function WizardStep2_MetaOnly() {
  return <WizardStep2 platforms={{ meta: true, google: false }}/>;
}
function WizardStep2_GoogleOnly() {
  return <WizardStep2 platforms={{ meta: false, google: true }}/>;
}

// ── Step 3: Budget ──────────────────────────────────────────────────────────

function WizardStep3() {
  return (
    <WizardFrame stepIdx={2}>
      <WizardCard
        title="Дневной бюджет"
        subtitle="EUR в день на каждую выбранную платформу. Алгоритмы Meta и Google лучше учатся от €10/день."
        actions={
          <>
            <WizardBtn ghost onLeft iconLeft="arrowRight">← Назад</WizardBtn>
            <WizardBtn primary icon="sparkleSm">Запустить аудит</WizardBtn>
          </>
        }
      >
        {/* Big input */}
        <div style={{
          padding: '24px 20px',
          background: C.peachWash, border: `1px solid ${C.peachSoft}`,
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
        }}>
          <div style={{
            fontFamily: 'Geist Mono, monospace', fontSize: 56, fontWeight: 500,
            color: C.peachDeep, lineHeight: 1, letterSpacing: '-0.03em',
            fontVariantNumeric: 'tabular-nums',
          }}>€<span style={{color: C.ink}}>15</span></div>
          <div style={{
            fontFamily: 'Geist, sans-serif', fontSize: 16, color: C.inkMute,
            alignSelf: 'flex-end', marginBottom: 4,
          }}>/ день на каждую платформу</div>
        </div>

        {/* Presets */}
        <div style={{display: 'flex', gap: 8, marginTop: 14}}>
          {[5, 10, 15, 25, 50, 100].map((v, i) => (
            <div key={v} style={{
              flex: 1, padding: '10px',
              background: v === 15 ? C.ink : C.cardSoft,
              color: v === 15 ? '#fff' : C.inkMute,
              border: `1px solid ${v === 15 ? C.ink : C.border}`,
              borderRadius: 9,
              fontFamily: 'Geist Mono, monospace', fontSize: 13, fontWeight: 500,
              fontVariantNumeric: 'tabular-nums', textAlign: 'center',
              cursor: 'pointer',
            }}>€{v}</div>
          ))}
        </div>

        {/* Forecast strip */}
        <div style={{
          marginTop: 18,
          padding: '14px 16px',
          background: 'linear-gradient(135deg, #FCF1E8 0%, #F8E8D9 100%)',
          border: `1px solid #F5DDC8`,
          borderRadius: 11,
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <SparkleLogo size={18} color={C.peach}/>
          <div style={{flex: 1}}>
            <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.peachDeep, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6}}>AI · ПРОГНОЗ</div>
            <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13, color: C.ink, lineHeight: 1.55, letterSpacing: '-0.005em'}}>
              При <b>€15/день × 2 платформы</b> и текущих бенчмарках по нише «имплантация» в Tallinn:
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 10}}>
              <ForecastTile label="Месячный бюджет" value="€900"/>
              <ForecastTile label="Прогноз лидов" value="22–28" sub="3.8% conv"/>
              <ForecastTile label="Ожидаемый CPL" value="€32–45" sub="бенчмарк €78"/>
            </div>
          </div>
        </div>
      </WizardCard>
    </WizardFrame>
  );
}

function ForecastTile({ label, value, sub }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.65)', borderRadius: 8,
      padding: '8px 11px',
    }}>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 9.5, color: C.peachDeep, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600}}>{label}</div>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 16, fontWeight: 500, color: C.ink, marginTop: 3, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums'}}>{value}</div>
      {sub && <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10, color: C.inkSubtle, marginTop: 1}}>{sub}</div>}
    </div>
  );
}

// ── Step 4: Audit ───────────────────────────────────────────────────────────

function WizardStep4() {
  const items = [
    { status: 'ok',   text: 'Лендинг достижим и грузится за <2с' },
    { status: 'ok',   text: 'Контакты на видном месте · телефон кликабельный' },
    { status: 'ok',   text: 'Бюджет €15/день достаточен для алгоритма Meta' },
    { status: 'warn', text: 'Лендинг не оптимизирован под mobile', fix: 'Регенерируй или включи AI auto-fix перед запуском' },
    { status: 'ok',   text: 'Фото с сайта качественные · разрешение 1200+' },
    { status: 'warn', text: 'Аудитория слишком узкая (38k)', fix: 'Расширь возрастной диапазон до 30–65 либо добавь LAL 1%' },
  ];

  return (
    <WizardFrame stepIdx={3}>
      <WizardCard
        title="Анализ перед запуском"
        subtitle="Проверяю настройки, бенчмарки, и AI оценивает шансы. 5–15 секунд."
        actions={
          <>
            <WizardBtn ghost onLeft iconLeft="arrowRight">← Изменить бюджет</WizardBtn>
            <WizardBtn primary icon="rocket">Запустить</WizardBtn>
          </>
        }
      >
        {/* Score circle + verdict */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 24,
          padding: 20,
          background: C.cardSoft, borderRadius: 12,
          border: `1px solid ${C.border}`,
        }}>
          <ScoreCircle score={8.5}/>
          <div style={{flex: 1}}>
            <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkSubtle, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600}}>ВЕРДИКТ AI</div>
            <div style={{fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: '-0.02em', marginTop: 4}}>Запускать можно</div>
            <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13.5, color: C.inkMute, marginTop: 6, lineHeight: 1.5, letterSpacing: '-0.005em'}}>
              Сильный лендинг и адекватный бюджет. Два предупреждения — это не блокеры, но советую починить до запуска.
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 100,
            background: C.successSoft, color: '#456838',
            fontFamily: 'Geist, sans-serif', fontSize: 12.5, fontWeight: 600,
          }}>
            <Icon name="check" size={12} color={C.success} strokeWidth={2.5}/>
            Готова
          </div>
        </div>

        {/* Items */}
        <div style={{marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8}}>
          {items.map((it, i) => <AuditItem key={i} item={it}/>)}
        </div>

        {/* AI priority fix */}
        <div style={{
          marginTop: 16,
          background: 'linear-gradient(135deg, #FCF1E8 0%, #F8E8D9 100%)',
          border: `1px solid #F5DDC8`,
          borderRadius: 11,
          padding: 14,
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <SparkleLogo size={20} color={C.peach}/>
          <div style={{flex: 1}}>
            <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.peachDeep, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 5}}>🎯 ПРИОРИТЕТ AI</div>
            <div style={{fontFamily: 'Geist, sans-serif', fontSize: 14, color: C.ink, fontWeight: 500, marginBottom: 5, letterSpacing: '-0.005em'}}>
              Сначала почини mobile-версию лендинга
            </div>
            <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12.5, color: C.inkMute, lineHeight: 1.5}}>
              68% твоего трафика будет с телефонов. Если лендинг лагает на мобилке, CPA вырастет минимум в 2×. Регенерация займёт 30 сек.
            </div>
            <div style={{display: 'flex', gap: 7, marginTop: 11}}>
              <div style={{padding: '6px 12px', background: C.peach, color: '#fff', borderRadius: 8, fontFamily: 'Geist, sans-serif', fontSize: 12, fontWeight: 500, cursor: 'pointer'}}>Регенерировать лендинг</div>
              <div style={{padding: '6px 12px', background: 'transparent', color: C.peachDeep, borderRadius: 8, fontFamily: 'Geist, sans-serif', fontSize: 12, fontWeight: 500, cursor: 'pointer'}}>Запустить как есть</div>
            </div>
          </div>
        </div>
      </WizardCard>
    </WizardFrame>
  );
}

function ScoreCircle({ score }) {
  const pct = score / 10;
  const r = 28; const cx = 36; const cy = 36;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{position: 'relative', width: 72, height: 72, flexShrink: 0}}>
      <svg width="72" height="72" viewBox="0 0 72 72" style={{transform: 'rotate(-90deg)'}}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={5}/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.peach} strokeWidth={5}
          strokeDasharray={`${circ * pct} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 22, fontWeight: 600, color: C.ink, lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums'}}>{score}</div>
        <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 9, color: C.inkSubtle, marginTop: 1, letterSpacing: '0.05em'}}>/ 10</div>
      </div>
    </div>
  );
}

function AuditItem({ item }) {
  const color = item.status === 'ok' ? C.success : item.status === 'warn' ? C.warn : C.danger;
  const bg = item.status === 'ok' ? C.successSoft : item.status === 'warn' ? '#FBEDD3' : C.dangerSoft;
  const icon = item.status === 'ok' ? 'check' : 'alert';
  return (
    <div style={{
      padding: '11px 14px',
      background: C.card, border: `1px solid ${C.border}`, borderLeft: `3px solid ${color}`,
      borderRadius: '6px 9px 9px 6px',
    }}>
      <div style={{display: 'flex', alignItems: 'flex-start', gap: 10}}>
        <div style={{width: 18, height: 18, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1}}>
          <Icon name={icon} size={11} color={color} strokeWidth={2.4}/>
        </div>
        <div style={{flex: 1}}>
          <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13.5, color: C.ink, lineHeight: 1.5, letterSpacing: '-0.005em'}}>{item.text}</div>
          {item.fix && (
            <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12, color: C.inkMute, marginTop: 4, lineHeight: 1.5, fontStyle: 'italic'}}>
              ↳ {item.fix}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step 5: Done ───────────────────────────────────────────────────────────

function WizardStep5() {
  return (
    <WizardFrame stepIdx={4}>
      <WizardCard
        title="Кампания запущена 🎉"
        subtitle="Все объекты созданы в статусе Paused. Проверь в Ads Manager и активируй вручную — или дай команду «активируй» из Telegram."
        actions={
          <>
            <WizardBtn ghost onLeft iconLeft="arrowRight">К списку кампаний</WizardBtn>
            <WizardBtn primary icon="arrowRight">Открыть кампанию</WizardBtn>
          </>
        }
      >
        <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
          <LaunchResultRow platform="meta" ok
            objects={['Campaign', 'Ad Set', '3 ads (Pain/Direct/Trust)']}
            id="meta_camp_28194710"
          />
          <LaunchResultRow platform="google" ok
            objects={['Campaign', '15 RSA headlines', '4 descriptions', '28 keywords']}
            id="google_camp_91827364"
          />
        </div>

        <div style={{
          marginTop: 14,
          padding: '14px 16px',
          background: C.peachWash, border: `1px solid ${C.peachSoft}`,
          borderRadius: 11,
          display: 'flex', alignItems: 'flex-start', gap: 11,
        }}>
          <Icon name="bell" size={16} color={C.peachDeep} style={{marginTop: 2}}/>
          <div style={{flex: 1}}>
            <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13.5, color: C.ink, fontWeight: 500, marginBottom: 3, letterSpacing: '-0.005em'}}>
              Я буду присматривать за метриками
            </div>
            <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12.5, color: C.inkMute, lineHeight: 1.5}}>
              Через 24 ч пришлю в Telegram first-look отчёт. Если CPA скакнёт или CTR упадёт — оповещу сразу.
            </div>
          </div>
        </div>
      </WizardCard>
    </WizardFrame>
  );
}

function LaunchResultRow({ platform, ok, objects, id }) {
  const Glyph = platform === 'meta' ? MetaGlyph : GoogleGlyph;
  return (
    <div style={{
      padding: '13px 16px',
      background: ok ? C.successSoft + '60' : C.dangerSoft,
      border: `1px solid ${ok ? '#BFD0B0' : '#E8B59C'}`,
      borderRadius: 10,
      display: 'flex', alignItems: 'flex-start', gap: 12,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, background: '#fff',
        border: `1px solid ${ok ? '#BFD0B0' : '#E8B59C'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Glyph size={16}/>
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5}}>
          <div style={{fontFamily: 'Geist, sans-serif', fontSize: 14, fontWeight: 600, color: C.ink, letterSpacing: '-0.005em'}}>{platform === 'meta' ? 'Meta' : 'Google Ads'}</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '1px 7px', borderRadius: 4,
            background: ok ? C.success : C.danger, color: '#fff',
            fontFamily: 'Geist Mono, monospace', fontSize: 9.5, letterSpacing: '0.04em', fontWeight: 600,
          }}>
            <Icon name="check" size={9} color="#fff" strokeWidth={2.5}/>
            CREATED
          </div>
        </div>
        <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12.5, color: C.inkMute, marginBottom: 5, lineHeight: 1.4}}>
          {objects.join(' · ')}
        </div>
        <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11, color: C.inkSubtle}}>id: {id}</div>
      </div>
    </div>
  );
}

Object.assign(window, { WizardStep1, WizardStep2, WizardStep2_BothPlatforms, WizardStep2_MetaOnly, WizardStep2_GoogleOnly, WizardStep3, WizardStep4, WizardStep5 });
