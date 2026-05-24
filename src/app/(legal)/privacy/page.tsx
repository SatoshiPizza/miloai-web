/**
 * Privacy Policy.
 *
 * Required by:
 *   - Meta App Review (App Dashboard → Settings → Privacy Policy URL)
 *   - Google Ads API access tier (referenced in the Design Doc submission)
 *   - GDPR (we serve EU residents)
 *
 * Must accurately describe every category of data we collect and every
 * third party we share it with. If the product gains a new integration
 * (e.g. TikTok Ads, new AI provider), update this page in the same PR.
 */

export const metadata = {
  title: "Privacy Policy — MiloAI",
  description: "How MiloAI collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <article className="prose-legal">
      <h1 className="font-heading text-[40px] font-bold tracking-[-0.025em] leading-tight">
        Privacy Policy
      </h1>
      <p className="text-[13.5px] text-[var(--ink-subtle)] mt-2 mb-10">
        Last updated: 24 May 2026 · Effective date: 24 May 2026
      </p>

      <Section title="1. Who we are">
        <p>
          MiloAI (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is an AI media-buyer software-as-a-service operated by an independent founder based in Estonia. We help small and medium businesses launch and manage their own Google Ads and Meta Ads campaigns through a web dashboard and a Telegram bot.
        </p>
        <p>
          Contact: <a href="mailto:hello@miloai.ee">hello@miloai.ee</a>
        </p>
      </Section>

      <Section title="2. What data we collect">
        <h3>2.1 Account data</h3>
        <ul>
          <li>
            <b>Email address</b> — when you sign up with email, or supplied by Google / Facebook / Telegram on social login.
          </li>
          <li>
            <b>Display name</b> — first name and (where available) avatar URL from the identity provider you used.
          </li>
          <li>
            <b>Telegram identifiers</b> — telegram_id and @username when you connect your Telegram account.
          </li>
          <li>
            <b>Identity provider keys</b> — Google &quot;sub&quot;, Facebook user id, Telegram id (one row per provider you link).
          </li>
        </ul>

        <h3>2.2 Connected ad accounts</h3>
        <ul>
          <li>
            <b>OAuth refresh tokens</b> from Meta Ads and Google Ads, encrypted with AES-256-GCM before storage. Decrypted only at API call time, never logged.
          </li>
          <li>
            <b>Ad account metadata</b> — your Google Ads customer_id, Meta ad account id, account name, currency. Connected ad accounts you authorise; we never harvest data from accounts you have not explicitly connected.
          </li>
        </ul>

        <h3>2.3 Business profile (filled in onboarding)</h3>
        <ul>
          <li>Business name, type, website URL, country/city, target audience.</li>
          <li>Service descriptions and prices for the offerings you ask us to advertise.</li>
          <li>Photos and other creative assets you upload or that we scrape from your website at your request.</li>
        </ul>

        <h3>2.4 Campaign metrics</h3>
        <ul>
          <li>
            Read-only metrics we pull from your connected ad accounts: spend, impressions, clicks, conversions, CPA, CTR, ROAS. Stored for up to 12 months for charts and anomaly detection.
          </li>
        </ul>

        <h3>2.5 Leads</h3>
        <ul>
          <li>
            When a visitor submits a form on a landing page we host for you, or when Meta forwards a lead via webhook, we store: name, phone, email, the form id, the campaign id, and your AI-suggested first reply.
          </li>
          <li>
            These leads belong to <b>you</b> (the advertiser). We process them on your behalf as a processor under GDPR.
          </li>
        </ul>

        <h3>2.6 Conversations</h3>
        <ul>
          <li>
            Text and voice messages you exchange with our Telegram bot or the web chat. Voice messages are transcribed to text via OpenAI Whisper; the audio is discarded after transcription.
          </li>
          <li>
            We retain the last 100 messages per user to give the AI conversational context. Older history is deleted automatically.
          </li>
        </ul>

        <h3>2.7 Payment data</h3>
        <ul>
          <li>
            Handled entirely by Stripe. We store only the Stripe customer id and subscription id — <b>never card numbers, CVV, or bank details</b>.
          </li>
        </ul>

        <h3>2.8 Technical data</h3>
        <ul>
          <li>IP address (kept for rate-limiting), browser user-agent, request timestamps.</li>
          <li>Session JWT stored in your browser&apos;s localStorage (replaces cookies for auth).</li>
        </ul>
      </Section>

      <Section title="3. How we use your data">
        <ul>
          <li><b>Provide the service</b>: launch and manage campaigns you ask us to launch, generate creatives, render landing pages, route leads to your inbox.</li>
          <li><b>AI features</b>: send a working subset of your business profile and campaign context to large-language-model providers (OpenAI, Anthropic, Groq) so they can draft ad copy, suggest budget changes, and summarise performance.</li>
          <li><b>Anomaly detection &amp; reporting</b>: compute trend lines, surface significant changes in your KPIs.</li>
          <li><b>Billing</b>: manage your subscription via Stripe.</li>
          <li><b>Security</b>: detect abuse, prevent unauthorised access.</li>
          <li><b>Service emails</b> (transactional): receipts, security alerts, expiring-token notifications. We do not send marketing emails without separate opt-in.</li>
        </ul>
      </Section>

      <Section title="4. Third parties we share data with">
        <p>We only share data with vendors that are necessary to deliver the service. Each is contractually bound to protect your data and process it solely for the stated purpose.</p>
        <table>
          <thead><tr><th>Provider</th><th>What we send</th><th>Why</th></tr></thead>
          <tbody>
            <tr><td>Stripe (Ireland / US)</td><td>Email, subscription id</td><td>Billing &amp; PCI-compliant card handling</td></tr>
            <tr><td>OpenAI (US)</td><td>Anonymised business profile + campaign context + voice audio for transcription</td><td>Generates ad copy, landings, voice transcripts</td></tr>
            <tr><td>Anthropic (US)</td><td>Same context as OpenAI</td><td>Heavy analytical tasks, alternative model</td></tr>
            <tr><td>Groq (US)</td><td>Same context (text only)</td><td>Fast inexpensive variant for small tasks</td></tr>
            <tr><td>Cloudflare (US / global edge)</td><td>Landing-page HTML</td><td>Hosts your published landing pages at the edge</td></tr>
            <tr><td>Vercel (US / global edge)</td><td>Standard HTTP request data</td><td>Hosts our web dashboard</td></tr>
            <tr><td>Meta Platforms (Ireland)</td><td>API calls scoped to <i>your</i> connected ad account</td><td>Read/write Meta Ads on your behalf</td></tr>
            <tr><td>Google LLC (Ireland)</td><td>API calls scoped to <i>your</i> connected Google Ads account</td><td>Read/write Google Ads on your behalf</td></tr>
            <tr><td>Telegram FZ-LLC (UAE)</td><td>Bot messages</td><td>Delivers messages between you and our bot</td></tr>
            <tr><td>Supabase (EU)</td><td>All persistent data described in §2</td><td>Database hosting</td></tr>
          </tbody>
        </table>
        <p>
          We <b>do not</b> sell personal data. We do not run ad-tech tracking on our own marketing site (no Google Analytics, no Meta Pixel) — page views are server-rendered.
        </p>
      </Section>

      <Section title="5. Where data is processed">
        <p>Your data is primarily stored in Supabase (EU region). API calls to AI providers may route through their US infrastructure under EU-US Data Privacy Framework or Standard Contractual Clauses. By using the service you consent to these international transfers.</p>
      </Section>

      <Section title="6. Your rights under GDPR">
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your account and associated data</li>
          <li>Export your data in a portable format (JSON)</li>
          <li>Restrict or object to specific processing</li>
          <li>Withdraw consent for AI processing (this will disable AI-powered features but keep your account active)</li>
          <li>Lodge a complaint with the Estonian Data Protection Inspectorate (<a href="https://www.aki.ee" target="_blank" rel="noopener noreferrer">aki.ee</a>)</li>
        </ul>
        <p>To exercise any of these rights, email <a href="mailto:hello@miloai.ee">hello@miloai.ee</a> from the email associated with your account. We respond within 30 days.</p>
      </Section>

      <Section title="7. Data deletion">
        <p>You can delete your account at any time:</p>
        <ul>
          <li>From inside the app: Settings → Account → Delete account</li>
          <li>By email: send a deletion request to <a href="mailto:hello@miloai.ee">hello@miloai.ee</a></li>
        </ul>
        <p>Upon deletion we immediately purge: your user row, business profile, conversations, OAuth tokens, leads, creatives, and connected ad-account metadata. Encrypted backups are retained for up to 30 days for disaster recovery, then permanently deleted. We retain anonymised billing records for 7 years as required by Estonian tax law.</p>
        <p>Disconnecting an ad platform from /accounts also revokes the OAuth token and removes the stored tokens immediately.</p>
      </Section>

      <Section title="8. Security">
        <ul>
          <li>All traffic served over HTTPS / TLS 1.2+.</li>
          <li>OAuth refresh tokens encrypted with AES-256-GCM at rest, with per-user authenticated additional data so a stolen ciphertext cannot be reused across accounts.</li>
          <li>Production secrets stored as environment variables, never committed to source control.</li>
          <li>Access to production data is limited to the founder and reviewed quarterly.</li>
        </ul>
      </Section>

      <Section title="9. Children">
        <p>MiloAI is intended for business users aged 18 or over. We do not knowingly collect personal data from anyone under 16. If you believe a child has provided us with personal data, contact us and we will delete it.</p>
      </Section>

      <Section title="10. Changes to this policy">
        <p>We may update this policy as we add features or vendors. When we make material changes we will: (a) notify active users by email at least 14 days before the change takes effect, and (b) bump the &quot;Last updated&quot; date at the top of this page.</p>
      </Section>

      <Section title="11. Contact">
        <p>
          Privacy questions, data requests, or complaints:{" "}
          <a href="mailto:hello@miloai.ee">hello@miloai.ee</a>
        </p>
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-heading text-[22px] font-bold tracking-[-0.018em] text-[var(--ink)] mb-3">
        {title}
      </h2>
      <div className="text-[14.5px] leading-[1.65] text-[var(--ink-mute)] [&_h3]:font-semibold [&_h3]:text-[var(--ink)] [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-[15px] [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ul]:space-y-1 [&_li]:leading-[1.55] [&_p]:my-3 [&_a]:underline [&_a]:text-[var(--peach-deep)] [&_table]:w-full [&_table]:text-[13px] [&_table]:my-4 [&_table]:border-collapse [&_th]:text-left [&_th]:py-2 [&_th]:px-2 [&_th]:border-b [&_th]:border-[var(--border)] [&_th]:text-[var(--ink)] [&_th]:font-medium [&_td]:py-2 [&_td]:px-2 [&_td]:border-b [&_td]:border-[var(--border)]/50 [&_td]:align-top [&_b]:text-[var(--ink)] [&_b]:font-semibold">
        {children}
      </div>
    </section>
  );
}
