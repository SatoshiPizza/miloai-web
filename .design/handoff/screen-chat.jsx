// ═════════════════════════════════════════════════════════════════════════════
// 4) AI CHAT + TELEGRAM (split view — the sync killer feature)
// ═════════════════════════════════════════════════════════════════════════════

function ScreenChatSync() {
  return (
    <StaticBrowserFrame url="app.miloai.com/chat">
      <MockSidebar active="chat"/>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
        <TopBar/>
        <div style={{flex: 1, padding: '22px 28px', overflow: 'auto', display: 'flex', gap: 22}}>
          {/* Web chat (left, larger) */}
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, gap: 14}}>
            <div>
              <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6}}>
                <SparkleLogo size={22} color={C.peach}/>
                <div style={{
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                  fontSize: 26, fontWeight: 700, color: C.ink, letterSpacing: '-0.02em',
                }}>Чат с AI</div>
                <div style={{display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 100, background: C.successSoft, border: `1px solid #BFD0B0`}}>
                  <div style={{width: 6, height: 6, borderRadius: 3, background: C.success}}/>
                  <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11, color: '#456838', fontWeight: 500}}>Sync · Telegram @vallu_clinic_bot</div>
                </div>
              </div>
              <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13.5, color: C.inkMute}}>
                Всё что пишешь здесь — летит в Telegram. И наоборот: голос → распознанный текст → действие.
              </div>
            </div>

            {/* Conversation */}
            <div style={{
              flex: 1,
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 14, overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{
                padding: '12px 18px', borderBottom: `1px solid ${C.divider}`,
                background: C.cardSoft,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkSubtle, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Понедельник · 14:32</div>
                <div style={{flex: 1}}/>
                <Icon name="search" size={14} color={C.inkMute}/>
              </div>

              <div style={{flex: 1, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'auto'}}>
                <DayDivider label="ПН · сегодня"/>
                <BotMsg time="09:01">
                  Доброе утро. За ночь поступило 2 лида с Implant-кампании. Один уже забрал номер у Telegram-формы. Открыть Inbox?
                </BotMsg>
                <UserMsg time="09:03">Открой, и покажи вчерашние расходы по платформам</UserMsg>
                <BotMsg time="09:03" hasActions>
                  <div style={{marginBottom: 10}}>Вчера:</div>
                  <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                    <SpendRow platform="meta" name="Meta · 3 кампании" value="€186" pct={62}/>
                    <SpendRow platform="google" name="Google · 2 кампании" value="€114" pct={38}/>
                  </div>
                  <div style={{marginTop: 12, fontFamily: 'Geist, sans-serif', fontSize: 13, color: C.inkMute}}>
                    Итого <b style={{color: C.ink}}>€300</b> · CPL <b style={{color: C.ink}}>€41</b> · конверсия лендинга <b style={{color: C.ink}}>4.2%</b>
                  </div>
                  <div style={{display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap'}}>
                    <ActionPill>Открыть Lead Inbox</ActionPill>
                    <ActionPill>Детализация по дням</ActionPill>
                  </div>
                </BotMsg>

                <UserMsg time="11:47" via="telegram">Подними бюджет на Импланты до €45</UserMsg>
                <BotMsg time="11:47">
                  <div style={{display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8}}>
                    <div style={{width: 18, height: 18, borderRadius: 9, background: C.success, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <Icon name="check" size={11} color="#fff" strokeWidth={2.5}/>
                    </div>
                    <div style={{fontFamily: 'Geist, sans-serif', fontSize: 14, fontWeight: 600, color: C.ink}}>Бюджет обновлён</div>
                  </div>
                  <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 12, color: C.inkMute, marginBottom: 6}}>Vällu — Имплантаты (Tallinn)</div>
                  <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 16, color: C.ink, fontWeight: 500}}>
                    €30 <span style={{color: C.inkSubtle}}>→</span> <span style={{color: C.peachDeep}}>€45</span> / день
                  </div>
                  <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12.5, color: C.inkMute, marginTop: 8, lineHeight: 1.4}}>
                    Прогноз: +6 лидов в неделю, ROAS останется выше 3.5×. Если ROAS просядет до 3.0× — пришлю сразу.
                  </div>
                </BotMsg>

                <UserMsg time="14:30" via="telegram">[🎤 0:08] Покажи как Vällu выглядит на фоне конкурентов</UserMsg>
                <BotMsg time="14:32">
                  В Tallinn 14 клиник крутят рекламу в Meta. У вас CPA <b>€38</b>, у конкурентов в среднем <b>€89</b>. Лучше по CTR на 2.3× vs средняя 1.1%.
                </BotMsg>
              </div>

              <div style={{
                padding: '14px 18px', borderTop: `1px solid ${C.divider}`,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <Icon name="paperclip" size={16} color={C.inkSubtle}/>
                <Icon name="image" size={16} color={C.inkSubtle}/>
                <div style={{
                  flex: 1, fontFamily: 'Geist, sans-serif', fontSize: 13.5, color: C.inkSubtle,
                  padding: '8px 0',
                }}>Команда, вопрос или голосовое…</div>
                <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 11, color: C.inkSubtle, background: C.cardSoft, padding: '3px 7px', borderRadius: 5, border: `1px solid ${C.border}`}}>⌘K</div>
                <div style={{width: 32, height: 32, borderRadius: 16, background: C.peach, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}}>
                  <Icon name="mic" size={15} color="#fff" strokeWidth={1.8}/>
                </div>
              </div>
            </div>
          </div>

          {/* Telegram preview (right) */}
          <div style={{width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14}}>
            <div style={{
              fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkSubtle,
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>То же самое в Telegram</div>
            <TelegramPreview/>
          </div>
        </div>
      </div>
    </StaticBrowserFrame>
  );
}

function BotMsg({ time, children, hasActions }) {
  return (
    <div style={{display: 'flex', gap: 12, alignItems: 'flex-start'}}>
      <div style={{
        width: 30, height: 30, borderRadius: 15,
        background: `linear-gradient(135deg, ${C.peach}, ${C.peachDeep})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <SparkleLogo size={14} color="#fff"/>
      </div>
      <div style={{maxWidth: '78%'}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 5}}>
          <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12.5, fontWeight: 600, color: C.ink}}>MiloAI</div>
          <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkSubtle}}>{time}</div>
        </div>
        <div style={{
          background: C.cardSoft, border: `1px solid ${C.border}`,
          padding: '11px 14px', borderRadius: '12px 12px 12px 4px',
          fontFamily: 'Geist, sans-serif', fontSize: 13.5, color: C.ink, lineHeight: 1.5,
          letterSpacing: '-0.005em',
        }}>{children}</div>
      </div>
    </div>
  );
}

function UserMsg({ time, children, via }) {
  return (
    <div style={{display: 'flex', gap: 12, alignItems: 'flex-start', justifyContent: 'flex-end'}}>
      <div style={{maxWidth: '70%'}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 5, justifyContent: 'flex-end'}}>
          {via === 'telegram' && (
            <div style={{
              fontFamily: 'Geist Mono, monospace', fontSize: 10, color: '#0088CC',
              background: '#E8F4FB', padding: '1px 7px', borderRadius: 4,
              border: '1px solid #C3E1F3', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="#0088CC"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>
              из Telegram
            </div>
          )}
          <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkSubtle}}>{time}</div>
        </div>
        <div style={{
          background: C.peach, color: '#fff',
          padding: '11px 14px', borderRadius: '12px 12px 4px 12px',
          fontFamily: 'Geist, sans-serif', fontSize: 13.5, lineHeight: 1.5,
          letterSpacing: '-0.005em',
        }}>{children}</div>
      </div>
      <div style={{
        width: 30, height: 30, borderRadius: 15,
        background: `linear-gradient(135deg, ${C.peach}, ${C.peachDeep})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
        fontFamily: 'Geist, sans-serif', fontWeight: 600, fontSize: 12, flexShrink: 0,
      }}>VK</div>
    </div>
  );
}

function DayDivider({ label }) {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, marginBottom: 4}}>
      <div style={{flex: 1, height: 1, background: C.divider}}/>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkSubtle, letterSpacing: '0.1em', textTransform: 'uppercase'}}>{label}</div>
      <div style={{flex: 1, height: 1, background: C.divider}}/>
    </div>
  );
}

function SpendRow({ platform, name, value, pct }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 10px',
      background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8,
    }}>
      {platform === 'meta' ? <MetaGlyph size={14}/> : <GoogleGlyph size={14}/>}
      <div style={{fontFamily: 'Geist, sans-serif', fontSize: 13, color: C.ink, flex: 1}}>{name}</div>
      <div style={{
        width: 80, height: 6, background: C.cardSoft, borderRadius: 3, overflow: 'hidden',
      }}>
        <div style={{
          width: pct + '%', height: '100%',
          background: platform === 'meta' ? PLAT.meta : PLAT.google,
          borderRadius: 3,
        }}/>
      </div>
      <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 13, color: C.ink, fontWeight: 500, fontVariantNumeric: 'tabular-nums', minWidth: 50, textAlign: 'right'}}>{value}</div>
    </div>
  );
}

function TelegramPreview() {
  return (
    <div style={{
      flex: 1,
      background: '#F4EFE5',
      borderRadius: 22,
      border: `1px solid ${C.border}`,
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* TG header */}
      <div style={{
        padding: '12px 16px',
        background: C.tgHeaderBg,
        borderBottom: `1px solid ${C.divider}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 16,
          background: `linear-gradient(135deg, ${C.peach}, ${C.peachDeep})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <SparkleLogo size={16} color="#fff"/>
        </div>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontFamily: 'Geist, sans-serif', fontWeight: 600, fontSize: 13.5, color: C.ink}}>MiloAI Bot</div>
          <div style={{fontFamily: 'Geist, sans-serif', fontSize: 11, color: C.success}}>в сети</div>
        </div>
        <Icon name="bell" size={15} color={C.inkSubtle}/>
      </div>

      {/* Messages */}
      <div style={{flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto'}}>
        <div style={{
          alignSelf: 'flex-start', background: '#fff', padding: '8px 12px',
          borderRadius: '12px 12px 12px 3px', maxWidth: '85%',
          fontFamily: 'Geist, sans-serif', fontSize: 12.5, color: C.ink, lineHeight: 1.4,
          border: `1px solid ${C.border}`,
        }}>
          За ночь поступило 2 лида · открыть Inbox?
        </div>
        <div style={{
          alignSelf: 'flex-end', background: C.peach, color: '#fff',
          padding: '8px 12px', borderRadius: '12px 12px 3px 12px', maxWidth: '85%',
          fontFamily: 'Geist, sans-serif', fontSize: 12.5, lineHeight: 1.4,
        }}>
          Подними бюджет на Импланты до €45
        </div>
        <div style={{
          alignSelf: 'flex-start', background: '#fff', padding: '10px 12px',
          borderRadius: '12px 12px 12px 3px', maxWidth: '90%',
          border: `1px solid ${C.border}`,
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5}}>
            <div style={{width: 14, height: 14, borderRadius: 7, background: C.success, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Icon name="check" size={9} color="#fff" strokeWidth={2.5}/>
            </div>
            <div style={{fontFamily: 'Geist, sans-serif', fontSize: 12.5, fontWeight: 600, color: C.ink}}>Бюджет обновлён</div>
          </div>
          <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkSubtle, marginBottom: 3}}>Импланты Tallinn</div>
          <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 13.5, color: C.ink, fontWeight: 500}}>
            €30 → <span style={{color: C.peachDeep}}>€45</span> / день
          </div>
        </div>
        <div style={{
          alignSelf: 'flex-end',
          background: '#fff', border: `1.5px solid ${C.peach}`,
          padding: '6px 10px', borderRadius: 18,
          display: 'flex', alignItems: 'center', gap: 7, maxWidth: '85%',
        }}>
          <Icon name="mic" size={13} color={C.peach}/>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 2,
            flex: 1, height: 16,
          }}>
            {[3, 7, 12, 18, 24, 19, 14, 9, 14, 21, 17, 10, 6, 11, 16, 12, 8].map((h, i) => (
              <div key={i} style={{
                width: 2, height: h, borderRadius: 1,
                background: C.peach, opacity: 0.7,
              }}/>
            ))}
          </div>
          <div style={{fontFamily: 'Geist Mono, monospace', fontSize: 10.5, color: C.inkMute}}>0:08</div>
        </div>
        <div style={{
          alignSelf: 'flex-start', background: '#fff', padding: '8px 12px',
          borderRadius: '12px 12px 12px 3px', maxWidth: '90%',
          fontFamily: 'Geist, sans-serif', fontSize: 12.5, color: C.ink, lineHeight: 1.4,
          border: `1px solid ${C.border}`,
        }}>
          В Tallinn 14 клиник конкурируют. CPA у вас €38, у них в среднем €89.
        </div>
      </div>

      {/* TG input */}
      <div style={{
        padding: '10px 12px',
        background: C.tgHeaderBg, borderTop: `1px solid ${C.divider}`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <Icon name="paperclip" size={18} color={C.inkSubtle}/>
        <div style={{
          flex: 1, background: '#fff', border: `1px solid ${C.border}`,
          borderRadius: 16, padding: '5px 12px',
          fontFamily: 'Geist, sans-serif', fontSize: 12, color: C.inkSubtle,
        }}>Сообщение</div>
        <div style={{width: 30, height: 30, borderRadius: 15, background: C.peach, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Icon name="mic" size={14} color="#fff" strokeWidth={1.8}/>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenChatSync });
