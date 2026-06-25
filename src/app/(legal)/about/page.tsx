import Link from "next/link";

/**
 * About page — publicly readable, required by ad-platform compliance
 * reviewers (Google Ads API, Meta App Review) to verify the link
 * between the product brand and the operating legal entity.
 *
 * Kept short and machine-readable: legal entity card up top, business
 * model + scope below, contact + legal links at the bottom. No founder
 * bio or marketing copy — the marketing landing lives at /.
 */

export const metadata = {
  title: "About — UniAds",
  description:
    "UniAds is a SaaS tool for small and medium businesses to manage their own Google Ads and Meta Ads campaigns. Operated by Siberian OÜ, Tallinn, Estonia.",
};

export default function AboutPage() {
  return (
    <article className="prose-legal">
      <h1 className="font-heading text-[40px] font-bold tracking-[-0.025em] leading-tight">
        About UniAds
      </h1>
      <p className="text-[13.5px] text-[var(--ink-subtle)] mt-2 mb-10">
        Voice-first AI media buyer for small and medium businesses in Estonia and the EU.
      </p>

      {/* ── Legal entity card ─────────────────────────────────── */}
      <section
        className="rounded-[14px] border border-[var(--border)] bg-[var(--card-soft)]/50 p-6 mb-10"
      >
        <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--peach-deep)] mb-3">
          Operating company
        </div>
        <div className="font-heading text-[22px] font-bold tracking-[-0.018em] text-[var(--ink)] mb-3">
          Siberian OÜ
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-y-2 gap-x-4 text-[14px]">
          <dt className="text-[var(--ink-subtle)]">Business registry code</dt>
          <dd className="font-mono text-[var(--ink)]">16192007</dd>

          <dt className="text-[var(--ink-subtle)]">Country</dt>
          <dd className="text-[var(--ink)]">Estonia</dd>

          <dt className="text-[var(--ink-subtle)]">Registered address</dt>
          <dd className="text-[var(--ink)]">Tala tn 4, Lasnamäe linnaosa, Tallinn 11415, Estonia</dd>

          <dt className="text-[var(--ink-subtle)]">Contact email</dt>
          <dd>
            <a
              href="mailto:info@uniads.eu"
              className="text-[var(--peach-deep)] underline"
            >
              info@uniads.eu
            </a>
          </dd>

          <dt className="text-[var(--ink-subtle)]">Product domain</dt>
          <dd className="text-[var(--ink)]">
            <a
              href="https://uniads.eu"
              className="text-[var(--peach-deep)] underline"
            >
              uniads.eu
            </a>{" "}
            <span className="text-[var(--ink-subtle)]">
              (operated by Siberian OÜ as a trading brand)
            </span>
          </dd>
        </dl>
      </section>

      {/* ── What we do ─────────────────────────────────── */}
      <Section title="What UniAds is">
        <p>
          UniAds is a software-as-a-service (SaaS) tool that helps small and medium businesses launch, audit, and adjust their own Google Ads and Meta Ads campaigns through a web dashboard at uniads.eu and a Telegram bot. The product targets local service businesses (clinics, salons, professional services, B2B agencies) in Estonia and the wider European Union that do not have an in-house marketing team.
        </p>
        <p>
          Customers connect their own existing ad accounts via OAuth. UniAds reads campaign performance metrics, drafts ad copy and structure suggestions with the help of large-language-model providers, and applies changes only after the customer explicitly approves them.
        </p>
      </Section>

      <Section title="What UniAds is NOT">
        <p>
          UniAds is <b>not an advertising agency</b>. We do not spend advertising budget on customers&apos; behalf. Every campaign is launched inside the customer&apos;s own Google Ads and Meta Ads accounts using their own billing methods. We never charge customers for ad spend, and we never take a percentage of media spend.
        </p>
        <p>
          The subscription fee customers pay (Pro, Growth tiers) is a fixed SaaS subscription, billed via Stripe by Siberian OÜ. It covers access to the dashboard, the AI features, the Telegram bot, and customer support &mdash; not media spend.
        </p>
      </Section>

      <Section title="How it works">
        <ul>
          <li>
            <b>Onboarding</b>: the customer signs in via email magic-link, Google, or Telegram, then connects their Google Ads and Meta Ads accounts through standard OAuth flows.
          </li>
          <li>
            <b>Analysis</b>: UniAds reads the existing campaigns and current website (with the customer&apos;s permission) and summarises what is being advertised, to whom, and how it performs.
          </li>
          <li>
            <b>Suggestions</b>: AI drafts new campaigns, budget changes, and ad copy. Customers approve or reject each suggestion in the dashboard or the Telegram bot.
          </li>
          <li>
            <b>Launch &amp; manage</b>: approved changes are applied to the customer&apos;s ad account via the official Google Ads API and Meta Marketing API.
          </li>
          <li>
            <b>Disconnect</b>: the customer can revoke access at any time from <a href="/dashboard">/accounts</a>; OAuth tokens are deleted on disconnect.
          </li>
        </ul>
      </Section>

      <Section title="Data and security">
        <p>
          OAuth refresh tokens are stored encrypted with AES-256-GCM, scoped per user. We do not share customer data with anyone other than the AI providers necessary to deliver the service (OpenAI, Anthropic). Full details: <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </Section>

      <Section title="Legal &amp; policies">
        <ul>
          <li><Link href="/privacy">Privacy Policy</Link> &mdash; GDPR-compliant disclosure of data we collect and process</li>
          <li><Link href="/terms">Terms of Service</Link> &mdash; subscription terms, refund policy, acceptable use</li>
          <li>Tax invoices issued by Siberian OÜ on Stripe Customer Portal</li>
        </ul>
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
      <div className="text-[14.5px] leading-[1.65] text-[var(--ink-mute)] [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ul]:space-y-1.5 [&_li]:leading-[1.55] [&_p]:my-3 [&_a]:underline [&_a]:text-[var(--peach-deep)] [&_b]:text-[var(--ink)] [&_b]:font-semibold">
        {children}
      </div>
    </section>
  );
}
