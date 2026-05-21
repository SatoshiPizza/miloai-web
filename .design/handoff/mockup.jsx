// ─────────────────────────────────────────────────────────────────────────────
// Main mockup — Design Canvas with all screens.
// ─────────────────────────────────────────────────────────────────────────────

function Mockup() {
  return (
    <DesignCanvas title="MiloAI · Product Mockup">
      <DCSection id="hero" title="Core flow" subtitle="Главные экраны продукта · кликни и зумь для деталей">
        <DCArtboard id="dash" label="Dashboard" width={1440} height={900}>
          <ScreenDashboard/>
        </DCArtboard>
        <DCArtboard id="campaign" label="Campaign · drill-in" width={1440} height={900}>
          <ScreenCampaignDetail/>
        </DCArtboard>
      </DCSection>

      <DCSection id="killer" title="Killer feature" subtitle="Web + Telegram, в реальном времени">
        <DCArtboard id="chat" label="AI Chat · sync c Telegram" width={1440} height={900}>
          <ScreenChatSync/>
        </DCArtboard>
        <DCArtboard id="channels" label="Каналы · Meta vs Google" width={1440} height={900}>
          <ScreenChannels/>
        </DCArtboard>
      </DCSection>

      <DCSection id="wizard" title="Новая кампания · 5 шагов" subtitle="Передизайн визарда — на нашу палитру + AI-прогноз и аудит">
        <DCArtboard id="w1" label="① Платформы" width={1440} height={900}>
          <WizardStep1/>
        </DCArtboard>
        <DCArtboard id="w2" label="② Услуга (обе платформы)" width={1440} height={900}>
          <WizardStep2_BothPlatforms/>
        </DCArtboard>
        <DCArtboard id="w2-meta" label="② Услуга — только Meta" width={1440} height={900}>
          <WizardStep2_MetaOnly/>
        </DCArtboard>
        <DCArtboard id="w2-google" label="② Услуга — только Google" width={1440} height={900}>
          <WizardStep2_GoogleOnly/>
        </DCArtboard>
        <DCArtboard id="w3" label="③ Бюджет (с AI-прогнозом)" width={1440} height={900}>
          <WizardStep3/>
        </DCArtboard>
        <DCArtboard id="w4" label="④ Аудит" width={1440} height={900}>
          <WizardStep4/>
        </DCArtboard>
        <DCArtboard id="w5" label="⑤ Готово" width={1440} height={900}>
          <WizardStep5/>
        </DCArtboard>
      </DCSection>

      <DCSection id="content" title="Content & ops" subtitle="Услуги, креативы, входящие лиды">
        <DCArtboard id="services" label="Услуги" width={1440} height={900}>
          <ScreenServices/>
        </DCArtboard>
        <DCArtboard id="creatives" label="Креативы · AI-generated" width={1440} height={900}>
          <ScreenCreatives/>
        </DCArtboard>
        <DCArtboard id="inbox" label="Lead Inbox" width={1440} height={900}>
          <ScreenInbox/>
        </DCArtboard>
        <DCArtboard id="landings" label="Лендинги" width={1440} height={900}>
          <ScreenLandings/>
        </DCArtboard>
        <DCArtboard id="competitors" label="Конкуренты" width={1440} height={900}>
          <ScreenCompetitors/>
        </DCArtboard>
      </DCSection>

      <DCSection id="config" title="Настройки & интеграции" subtitle="">
        <DCArtboard id="accounts" label="Аккаунты &amp; интеграции" width={1440} height={900}>
          <ScreenAccounts/>
        </DCArtboard>
        <DCArtboard id="settings" label="Настройки" width={1440} height={900}>
          <ScreenSettings/>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Mockup/>);
