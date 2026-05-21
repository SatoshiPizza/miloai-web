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
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Mockup/>);
