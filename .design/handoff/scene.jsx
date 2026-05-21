// ─────────────────────────────────────────────────────────────────────────────
// MiloAI magic moment — scene composition.
// 9:16 (1080×1920), 15 seconds.
// Storyboard:
//   0.0–2.4s  Intro (logo + tagline)
//   2.4–13.0s Magic moment (split-screen sync)
//   13.0–15.0s End frame
// Each HTML file injects `window.COPY` (RU or EN) before this script.
// ─────────────────────────────────────────────────────────────────────────────

const STAGE_W = 1080;
const STAGE_H = 1920;
const DURATION = 15;

// ─── Times ───────────────────────────────────────────────────────────────────
const T = {
  // Intro
  introStart:       0.0,
  logoFadeIn:       0.3,
  taglineIn:        0.9,
  introFadeOut:     2.0,

  // Scene entry
  devicesIn:        2.3,
  devicesSettled:   3.4,

  // User sends voice → text
  tgUserMsg:        3.9,

  // Bot acknowledges (typing in both surfaces)
  tgBotTyping:      4.7,
  webChatTyping:    5.0,

  // Cursor moves in dashboard
  cursorStart:      4.8,
  cursorAtRow:      5.7,
  cursorAtBudget:   6.2,

  // The sync moment
  rowHighlight:     6.1,
  budgetTick:       6.7,
  kpiPulse:         6.7,

  // Confirmations
  tgBotReply:       7.2,
  webChatReply:     7.7,

  // Anomaly
  anomalyDashboard: 9.4,
  anomalyTelegram:  9.9,

  // Hold
  finalHoldStart:   11.8,

  // End frame
  endFrameStart:    13.0,
  endLogoIn:        13.3,
  endTaglineIn:     13.7,
  endUrlIn:         14.1,
};

// ─── Top-level scene root ────────────────────────────────────────────────────

function MagicScene() {
  const copy = window.COPY;
  const t = useTime();

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(120% 80% at 50% 35%, #EEEAE0 0%, #E2DCCC 100%)',
      fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif',
      color: C.ink,
      overflow: 'hidden',
    }}>
      {/* Soft warm gloss top-left */}
      <div style={{
        position: 'absolute', top: -200, left: -160, width: 700, height: 700,
        background: 'radial-gradient(circle, rgba(232, 149, 108, 0.15) 0%, transparent 60%)',
        pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', bottom: -200, right: -160, width: 700, height: 700,
        background: 'radial-gradient(circle, rgba(133, 162, 117, 0.10) 0%, transparent 60%)',
        pointerEvents: 'none',
      }}/>

      {/* INTRO */}
      <IntroScene copy={copy}/>

      {/* MAGIC MOMENT */}
      <Sprite start={T.devicesIn - 0.2} end={T.endFrameStart + 0.4} keepMounted={false}>
        <MagicMoment copy={copy}/>
      </Sprite>

      {/* Caption strip (outside camera transform — stays anchored to top) */}
      <SceneCaption copy={copy}/>

      {/* END FRAME */}
      <Sprite start={T.endFrameStart - 0.2} end={DURATION + 1} keepMounted={false}>
        <EndFrame copy={copy}/>
      </Sprite>
    </div>
  );
}

// ─── Intro scene ─────────────────────────────────────────────────────────────

function IntroScene({ copy }) {
  const t = useTime();
  // Fade out the whole intro overlay
  const overlayOp = tween(t, T.introFadeOut, T.devicesIn, 1, 0, Easing.easeInCubic);
  if (t > T.devicesIn) return null;

  // Logo: scale + fade in
  const logoOp = tween(t, T.logoFadeIn, T.logoFadeIn + 0.5, 0, 1);
  const logoScale = tween(t, T.logoFadeIn, T.logoFadeIn + 0.7, 0.86, 1, Easing.easeOutBack);

  // Tagline: fade in, slight slide up
  const tagOp = tween(t, T.taglineIn, T.taglineIn + 0.45, 0, 1);
  const tagTy = tween(t, T.taglineIn, T.taglineIn + 0.45, 12, 0);

  // Subtle breathing on the whole group
  const breath = 1 + Math.sin((t - T.logoFadeIn) * 0.7) * 0.005;

  // Two decorative chips that pre-stage the magic (small phone + small dashboard hints)
  const decoOp = tween(t, T.logoFadeIn + 0.2, T.logoFadeIn + 1.0, 0, 1);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: overlayOp,
    }}>
      {/* Hint chips floating above */}
      <div style={{
        position: 'absolute', top: 420,
        display: 'flex', gap: 24,
        opacity: decoOp * 0.8,
        transform: `translateY(${(1-decoOp) * 12}px)`,
      }}>
        <HintChip icon="chat" label="Telegram" accent={C.peach}/>
        <div style={{
          fontFamily: 'Geist Mono, monospace', fontSize: 22, color: C.inkSubtle,
          alignSelf: 'center',
        }}>↔</div>
        <HintChip icon="grid" label="Dashboard" accent={C.ink}/>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 22,
        opacity: logoOp,
        transform: `scale(${logoScale * breath})`,
      }}>
        <SparkleLogo size={104} color={C.ink}/>
        <div style={{
          fontFamily: 'Bricolage Grotesque, Geist, serif',
          fontWeight: 700,
          fontSize: 124,
          letterSpacing: '-0.04em',
          color: C.ink,
          lineHeight: 1,
        }}>MiloAI</div>
      </div>

      <div style={{
        marginTop: 36,
        fontFamily: 'Geist, sans-serif',
        fontSize: 34,
        fontWeight: 400,
        color: C.inkMute,
        letterSpacing: '-0.02em',
        textAlign: 'center',
        opacity: tagOp,
        transform: `translateY(${tagTy}px)`,
        maxWidth: 760,
        lineHeight: 1.25,
      }}>{copy.intro_tagline}</div>

      <div style={{
        marginTop: 20,
        opacity: tagOp,
        transform: `translateY(${tagTy}px)`,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 16px',
        background: 'rgba(255,255,255,0.55)',
        border: `1px solid rgba(31,29,26,0.08)`,
        borderRadius: 100,
        fontFamily: 'Geist Mono, monospace',
        fontSize: 16,
        color: C.inkMute,
        letterSpacing: '0.02em',
      }}>
        <div style={{width: 6, height: 6, borderRadius: 3, background: C.peach}}/>
        {copy.intro_chip}
      </div>
    </div>
  );
}

function HintChip({ icon, label, accent }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 20px',
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      boxShadow: '0 8px 20px -10px rgba(31,29,26,0.10)',
      fontFamily: 'Geist, sans-serif', fontSize: 18, fontWeight: 500,
      color: C.ink,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: accent === C.peach ? C.peachWash : C.cardSoft,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={16} color={accent}/>
      </div>
      {label}
    </div>
  );
}

// ─── Magic moment (devices on stage) ─────────────────────────────────────────

function MagicMoment({ copy }) {
  const t = useTime();

  // Browser entry: slide down + fade
  const browserOp = tween(t, T.devicesIn, T.devicesIn + 0.9, 0, 1, Easing.easeOutCubic);
  const browserTy = tween(t, T.devicesIn, T.devicesIn + 1.0, -90, 0, Easing.easeOutCubic);

  // Phone entry: slide up + fade
  const phoneOp = tween(t, T.devicesIn + 0.25, T.devicesIn + 1.1, 0, 1, Easing.easeOutCubic);
  const phoneTy = tween(t, T.devicesIn + 0.25, T.devicesIn + 1.2, 120, 0, Easing.easeOutCubic);

  // Slight, slow ken-burns of the whole stage starting after settle
  const camZoom = tween(t, T.devicesSettled, T.finalHoldStart, 1, 1.04, Easing.easeInOutQuad);
  const camTy = tween(t, T.devicesSettled, T.finalHoldStart, 0, -16, Easing.easeInOutQuad);

  // Exit on end frame
  const exitOp = tween(t, T.endFrameStart - 0.3, T.endFrameStart + 0.5, 1, 0, Easing.easeInCubic);
  const exitScale = tween(t, T.endFrameStart - 0.3, T.endFrameStart + 0.5, 1, 1.04, Easing.easeInCubic);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      transform: `scale(${camZoom * exitScale}) translateY(${camTy}px)`,
      transformOrigin: '50% 45%',
      opacity: exitOp,
    }}>
      {/* Browser */}
      <div style={{
        position: 'absolute',
        left: 20, top: 140,
        width: 1040, height: 870,
        opacity: browserOp,
        transform: `translateY(${browserTy}px) rotate(-0.8deg)`,
        transformOrigin: '50% 50%',
      }}>
        <BrowserFrame width={1040} height={870} url={copy.url}>
          <DashboardContent copy={copy}/>
        </BrowserFrame>
      </div>

      {/* Phone */}
      <div style={{
        position: 'absolute',
        left: 318, top: 1040,
        width: 444, height: 832,
        opacity: phoneOp,
        transform: `translateY(${phoneTy}px) rotate(1.4deg)`,
        transformOrigin: '50% 50%',
      }}>
        <PhoneFrame width={444} height={832}>
          <TelegramChat
            copy={copy}
            userMsg={copy.tg_user_msg}
            showUserAt={T.tgUserMsg}
            showBotTypingAt={T.tgBotTyping}
            showBotReplyAt={T.tgBotReply}
            showAnomalyAt={T.anomalyTelegram}
            anomalyTitle={copy.tg_anomaly_title}
            anomalyBody={copy.tg_anomaly_body}
          />
        </PhoneFrame>
      </div>

      {/* Connection beam between phone & dashboard */}
      <SyncBeam/>
    </div>
  );
}

// ─── Dashboard content (inside browser) ──────────────────────────────────────

function DashboardContent({ copy }) {
  const t = useTime();

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      background: C.surface,
      position: 'relative',
    }}>
      <DashboardSidebar copy={copy} activeKey="dashboard"/>

      {/* Main */}
      <div style={{flex: 1, padding: '26px 30px', position: 'relative', overflow: 'hidden'}}>
        {/* Header */}
        <Stack dir="row" align="center" style={{marginBottom: 4}}>
          <div>
            <div style={{
              fontFamily: 'Bricolage Grotesque, Geist, sans-serif',
              fontSize: 32, fontWeight: 700, color: C.ink,
              letterSpacing: '-0.025em',
            }}>{copy.dash_title}</div>
            <div style={{fontFamily: 'Geist, sans-serif', fontSize: 14, color: C.inkMute, marginTop: 4}}>{copy.dash_subtitle}</div>
          </div>
          <div style={{flex: 1}}/>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 18px',
            background: C.ink, color: '#fff',
            borderRadius: 10,
            fontFamily: 'Geist, sans-serif', fontSize: 14, fontWeight: 500,
            letterSpacing: '-0.005em',
          }}>
            <Icon name="rocket" size={15} color="#fff" strokeWidth={1.6}/>
            {copy.dash_cta}
          </div>
        </Stack>

        {/* KPI Row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14,
          marginTop: 22,
        }}>
          <KpiCard
            icon="euro" label={copy.kpi_spend_label}
            valueText={<BudgetSpend t={t}/>}
            delta={copy.kpi_spend_delta} deltaDir="up"
            pulseAt={T.kpiPulse}
          />
          <KpiCard
            icon="users" label={copy.kpi_leads_label}
            valueText="23" delta={copy.kpi_leads_delta} deltaDir="up"
          />
          <KpiCard
            icon="target" label={copy.kpi_cpl_label}
            valueText="€80" delta={copy.kpi_cpl_delta} deltaDir="down"
          />
          <KpiCard
            icon="trend" label={copy.kpi_roas_label}
            valueText="3.2×" delta={copy.kpi_roas_delta} deltaDir="up"
          />
        </div>

        {/* Section label */}
        <div style={{
          marginTop: 26, marginBottom: 6,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            fontFamily: 'Geist Mono, monospace', fontSize: 11, fontWeight: 500,
            color: C.inkSubtle, letterSpacing: '0.12em',
          }}>{copy.dash_campaigns_section}</div>
          <div style={{flex: 1, height: 1, background: C.divider}}/>
          <div style={{
            fontFamily: 'Geist, sans-serif', fontSize: 12, color: C.inkSubtle,
          }}>{copy.dash_filter_active}</div>
        </div>

        {/* Campaign list */}
        <div style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          marginTop: 10,
          overflow: 'hidden',
        }}>
          <CampaignRow
            name={copy.camp_1_name}
            ctr="1.8%" cpa="€74"
            budgetText={<BudgetCell t={t}/>}
            status="active"
            highlightAt={T.rowHighlight}
            budgetTickAt={T.budgetTick}
            copy={copy}
          />
          <div style={{height: 1, background: C.divider, marginLeft: 18, marginRight: 18}}/>
          <CampaignRow
            name={copy.camp_2_name}
            ctr="2.4%" cpa="€58"
            budgetText="€15.00 / day"
            status="active"
            copy={copy}
          />
          <div style={{height: 1, background: C.divider, marginLeft: 18, marginRight: 18}}/>
          <CampaignRow
            name={copy.camp_3_name}
            ctr="1.2%" cpa="€92"
            budgetText="€18.00 / day"
            status="paused"
            copy={copy}
          />
        </div>

        {/* Web chat panel (bottom right floating) */}
        <div style={{
          position: 'absolute', bottom: 22, right: 30, left: 30,
        }}>
          <WebChatPanel
            copy={copy}
            command={copy.tg_user_msg}
            showUserAt={T.tgUserMsg + 0.2}
            showTypingAt={T.webChatTyping}
            showReplyAt={T.webChatReply}
            replyText={copy.web_chat_reply}
          />
        </div>

        {/* Cursor moves in dashboard */}
        <MovingCursor keyframes={[
          { t: T.cursorStart,    x: 60,  y: 480 },
          { t: T.cursorAtRow,    x: 560, y: 360 },
          { t: T.cursorAtBudget, x: 720, y: 360 },
          { t: T.cursorAtBudget + 0.8, x: 720, y: 360, fadeAfter: T.cursorAtBudget + 1.0 },
        ]}/>

        {/* Anomaly toast */}
        <AnomalyToast
          startAt={T.anomalyDashboard}
          copy={copy}
          title={copy.dash_anomaly_title}
          body={copy.dash_anomaly_body}
          campaign={copy.dash_anomaly_campaign}
        />
      </div>
    </div>
  );
}

// Budget text in campaign row — flips from €20 to €25 at tick
function BudgetCell({ t }) {
  const tickAt = T.budgetTick;
  const isAfter = t >= tickAt;
  // small wobble right after change
  const since = t - tickAt;
  let scale = 1;
  if (since >= 0 && since < 0.5) {
    scale = 1 + 0.12 * Math.sin((since / 0.5) * Math.PI);
  }
  return (
    <span style={{display: 'inline-block', transform: `scale(${scale})`, transformOrigin: 'center'}}>
      €{isAfter ? '25.00' : '20.00'} / day
    </span>
  );
}

// Spend KPI value — increments slightly at budget tick
function BudgetSpend({ t }) {
  const base = 1847;
  const after = 1912;
  const tickAt = T.kpiPulse;
  const v = t >= tickAt ? after : base;
  return <>€{v.toLocaleString('en-US')}</>;
}

// ─── Sync beam — subtle peach particles flowing between phone & dashboard ────

function SyncBeam() {
  const t = useTime();
  if (t < T.tgBotTyping || t > T.webChatReply + 0.5) return null;
  const localStart = T.tgBotTyping;
  const localEnd = T.webChatReply;
  const total = localEnd - localStart;
  const local = (t - localStart) / total;

  // Stage-coord endpoints
  const x1 = 540, y1 = 1100; // top of phone (Telegram surface)
  const x2 = 980, y2 = 530;  // budget cell on dashboard

  const N = 6;
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 6}}>
      {Array.from({length: N}).map((_, i) => {
        const phase = ((local * 2.4 + i / N) % 1);
        const op = Math.sin(phase * Math.PI) * 0.55;
        const x = x1 + (x2 - x1) * phase;
        const y = y1 + (y2 - y1) * phase;
        return (
          <div key={i} style={{
            position: 'absolute', left: x, top: y,
            width: 12, height: 12, borderRadius: 6,
            background: C.peach, opacity: op,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 22px ${C.peach}cc`,
          }}/>
        );
      })}
    </div>
  );
}

// ─── Caption strip at the TOP ────────────────────────────────────────────────

function SceneCaption({ copy }) {
  const t = useTime();

  // Caption schedule
  const schedule = [
    { start: T.tgUserMsg - 0.2,         out: T.budgetTick - 0.05,             text: copy.cap_voice },
    { start: T.budgetTick + 0.15,        out: T.anomalyDashboard - 0.25,       text: copy.cap_synced },
    { start: T.anomalyDashboard - 0.05,  out: T.endFrameStart - 0.4,           text: copy.cap_anomaly },
  ];

  const fade = 0.45;

  return (
    <div style={{
      position: 'absolute', top: 38, left: 0, right: 0,
      display: 'flex', justifyContent: 'center',
      pointerEvents: 'none',
      zIndex: 30,
      height: 80,
    }}>
      {schedule.map((cap, i) => {
        if (t < cap.start - fade || t > cap.out + fade) return null;
        let op = 1, ty = 0;
        const dIn = t - cap.start;
        const dOut = t - cap.out;
        if (dIn < 0) {
          // Pre-fade in
          const p = Math.max(0, (dIn + fade) / fade);
          op = p; ty = -12 * (1 - p);
        } else if (dIn < fade) {
          op = dIn / fade;
          ty = -12 * (1 - op);
        }
        if (dOut > 0) {
          const p = Math.min(1, dOut / fade);
          op = Math.min(op, 1 - p);
          ty = -10 * p;
        }
        if (op <= 0.005) return null;
        return (
          <div key={i} style={{
            position: 'absolute',
            padding: '14px 30px',
            background: 'rgba(255,255,255,0.92)',
            border: `1px solid rgba(31,29,26,0.08)`,
            borderRadius: 100,
            fontFamily: 'Geist, sans-serif', fontSize: 26, fontWeight: 500,
            color: C.ink, letterSpacing: '-0.012em',
            opacity: op, transform: `translateY(${ty}px)`,
            boxShadow: '0 14px 32px -14px rgba(31,29,26,0.16)',
            whiteSpace: 'nowrap',
          }}>{cap.text}</div>
        );
      })}
    </div>
  );
}

// ─── End frame ───────────────────────────────────────────────────────────────

function EndFrame({ copy }) {
  const t = useTime();
  const opFrame = tween(t, T.endFrameStart, T.endFrameStart + 0.4, 0, 1);

  const logoOp = tween(t, T.endLogoIn, T.endLogoIn + 0.5, 0, 1);
  const logoScale = tween(t, T.endLogoIn, T.endLogoIn + 0.6, 0.92, 1, Easing.easeOutBack);

  const tagOp = tween(t, T.endTaglineIn, T.endTaglineIn + 0.45, 0, 1);
  const tagTy = tween(t, T.endTaglineIn, T.endTaglineIn + 0.45, 14, 0);

  const urlOp = tween(t, T.endUrlIn, T.endUrlIn + 0.4, 0, 1);
  const urlTy = tween(t, T.endUrlIn, T.endUrlIn + 0.4, 12, 0);

  // Decorative feature chips above logo
  const featOp = tween(t, T.endLogoIn + 0.1, T.endLogoIn + 0.7, 0, 1);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(120% 80% at 50% 40%, #EEEAE0 0%, #E2DCCC 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: opFrame,
    }}>
      {/* Soft warm gloss */}
      <div style={{
        position: 'absolute', top: -150, left: -160, width: 700, height: 700,
        background: 'radial-gradient(circle, rgba(232, 149, 108, 0.18) 0%, transparent 60%)',
        pointerEvents: 'none',
      }}/>

      {/* Three feature chips above logo */}
      <div style={{
        position: 'absolute', top: 420,
        display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center',
        maxWidth: 900,
        opacity: featOp,
        transform: `translateY(${(1-featOp) * 14}px)`,
      }}>
        <FeatureChip>{copy.end_feat_1}</FeatureChip>
        <FeatureChip>{copy.end_feat_2}</FeatureChip>
        <FeatureChip>{copy.end_feat_3}</FeatureChip>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 22,
        opacity: logoOp, transform: `scale(${logoScale})`,
      }}>
        <SparkleLogo size={108} color={C.ink}/>
        <div style={{
          fontFamily: 'Bricolage Grotesque, Geist, serif',
          fontWeight: 700, fontSize: 128,
          letterSpacing: '-0.04em', color: C.ink, lineHeight: 1,
        }}>MiloAI</div>
      </div>
      <div style={{
        marginTop: 40,
        fontFamily: 'Geist, sans-serif', fontSize: 36, fontWeight: 400,
        color: C.inkMute, letterSpacing: '-0.02em',
        textAlign: 'center', maxWidth: 820, lineHeight: 1.3,
        opacity: tagOp, transform: `translateY(${tagTy}px)`,
        whiteSpace: 'pre-line',
      }}>{copy.end_tagline}</div>

      <div style={{
        marginTop: 64,
        opacity: urlOp, transform: `translateY(${urlTy}px)`,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '18px 32px',
        background: C.ink, color: '#fff',
        borderRadius: 100,
        fontFamily: 'Geist Mono, monospace', fontSize: 26, fontWeight: 500,
        letterSpacing: '-0.01em',
      }}>
        <Icon name="arrowRight" size={22} color={C.peach} strokeWidth={2}/>
        {copy.end_url}
      </div>
    </div>
  );
}

function FeatureChip({ children }) {
  return (
    <div style={{
      padding: '10px 18px',
      background: 'rgba(255,255,255,0.7)',
      border: `1px solid rgba(31,29,26,0.08)`,
      borderRadius: 100,
      fontFamily: 'Geist, sans-serif', fontSize: 18, fontWeight: 500,
      color: C.ink, letterSpacing: '-0.01em',
    }}>{children}</div>
  );
}

// ─── Boot ────────────────────────────────────────────────────────────────────

function Root() {
  return (
    <Stage
      width={STAGE_W}
      height={STAGE_H}
      duration={DURATION}
      background={C.stage}
      persistKey={'miloai-magic-' + (window.COPY?.lang || 'ru')}
    >
      <MagicScene/>
    </Stage>
  );
}

const rootEl = document.getElementById('root');
ReactDOM.createRoot(rootEl).render(<Root/>);
