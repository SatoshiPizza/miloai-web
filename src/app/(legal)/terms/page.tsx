/**
 * Terms of Service.
 *
 * Linked from Meta App Settings (Terms of Service URL) and our marketing
 * footer. Keep in sync with the actual product behaviour — if billing
 * changes, refund policy changes, etc., update here in the same PR.
 */

export const metadata = {
  title: "Terms of Service — UniAds",
  description: "Terms under which UniAds provides its AI media-buyer service.",
};

export default function TermsPage() {
  return (
    <article className="prose-legal">
      <h1 className="font-heading text-[40px] font-bold tracking-[-0.025em] leading-tight">
        Terms of Service
      </h1>
      <p className="text-[13.5px] text-[var(--ink-subtle)] mt-2 mb-10">
        Last updated: 24 May 2026 · Effective date: 24 May 2026
      </p>

      <Section title="1. Acceptance">
        <p>
          By creating an account or using UniAds (the &quot;Service&quot;) you agree to these Terms of Service and our <a href="/privacy">Privacy Policy</a>. If you don&apos;t agree, don&apos;t use the Service.
        </p>
      </Section>

      <Section title="2. What UniAds is">
        <p>
          UniAds is a software-as-a-service that helps small and medium businesses manage their own Google Ads and Meta Ads campaigns through a web dashboard and a Telegram bot. We do <b>not</b> spend advertising budget on your behalf — campaigns run inside your own ad accounts using your own billing methods with Google and Meta.
        </p>
      </Section>

      <Section title="3. Eligibility">
        <ul>
          <li>You must be at least 18 years old.</li>
          <li>You must own (or be authorised to manage) the ad accounts you connect.</li>
          <li>Your use must not violate Meta Advertising Policies, Google Ads Policies, or applicable laws.</li>
        </ul>
      </Section>

      <Section title="4. Your account">
        <p>
          You are responsible for keeping your login credentials secure. You may link multiple identity providers (Google, Telegram, email) to a single UniAds account. Sharing one account between several humans is allowed for organisations; we may add proper multi-seat support later.
        </p>
        <p>
          You can delete your account at any time from Settings → Account, or by emailing <a href="mailto:info@uniads.eu">info@uniads.eu</a>. See <a href="/privacy">Privacy Policy §7</a> for what happens to your data on deletion.
        </p>
      </Section>

      <Section title="5. Acceptable use">
        <p>You will not, and will not allow others to, use the Service to:</p>
        <ul>
          <li>Advertise illegal goods or services in any jurisdiction where you operate.</li>
          <li>Run political advertising without proper disclosure required by the destination platform.</li>
          <li>Target audiences in violation of Meta or Google policies (e.g. discriminatory housing/employment targeting, age-gated products to minors).</li>
          <li>Submit false business information to obtain higher API limits.</li>
          <li>Reverse-engineer, scrape, or attempt to access source code beyond what is publicly available.</li>
          <li>Resell the Service to other parties without a written reseller agreement.</li>
          <li>Use AI-generated content in ways that violate Meta&apos;s or Google&apos;s policies on disclosing AI-generated media.</li>
        </ul>
        <p>We may suspend or terminate your account if we detect a violation. Where the cause is clearly a mistake (not abuse), we will reach out before suspending.</p>
      </Section>

      <Section title="6. Subscriptions and billing">
        <h3>6.1 Plans</h3>
        <ul>
          <li><b>Free / Beta</b> — €0, full feature access during the closed beta.</li>
          <li><b>Pro</b> — €49 / month, monthly recurring.</li>
          <li><b>Growth</b> — €149 / month, monthly recurring.</li>
        </ul>
        <p>Plan limits (number of ad accounts, AI requests per day, priority support) are listed in /settings → Billing and are enforced on a best-effort basis. We may adjust the technical limits within a tier as the product evolves, but will not lower them without 14 days&apos; notice to active subscribers.</p>

        <h3>6.2 Payment</h3>
        <p>All payments are processed by Stripe. You authorise us to charge your payment method monthly on the same calendar date as your initial subscription. Failed payments enter a 3-day grace period; after that we downgrade you to Free.</p>

        <h3>6.3 Refunds</h3>
        <p>We do not provide refunds for partial months. If you cancel mid-month, you keep paid features until the end of the current billing period and are not charged again. If you believe you were billed in error, email <a href="mailto:info@uniads.eu">info@uniads.eu</a> within 30 days and we&apos;ll review case by case.</p>

        <h3>6.4 Cancellation</h3>
        <p>Cancel any time from Settings → Billing → Stripe Portal. No retention call, no questionnaire.</p>

        <h3>6.5 VAT</h3>
        <p>Prices are exclusive of VAT. Business customers within the EU may provide a valid VAT number for reverse-charge billing. Non-EU customers are responsible for any local taxes.</p>
      </Section>

      <Section title="7. Your content">
        <p>
          You retain all rights to the business information you provide (your website, products, photos, services, leads, ad content). You grant us a limited, non-exclusive licence to:
        </p>
        <ul>
          <li>Display this content back to you in the Service.</li>
          <li>Pass relevant portions to AI providers (OpenAI, Anthropic, Groq) to generate copy and recommendations.</li>
          <li>Pass relevant portions to Meta and Google to launch and manage campaigns you ask us to run.</li>
        </ul>
        <p>
          This licence ends when you delete the content or your account.
        </p>
      </Section>

      <Section title="8. AI-generated content">
        <p>
          The Service uses large language models and image-generation models to draft ad copy, landing-page text, banner mockups, and to suggest budget changes. AI outputs are <b>suggestions, not facts</b>. You are responsible for reviewing every campaign before launch and every budget change before applying. We are not liable for outcomes of campaigns you launched on AI advice.
        </p>
        <p>
          You must comply with each ad platform&apos;s policies on disclosing AI-generated content where applicable (e.g. Meta requires disclosure for AI-generated political imagery).
        </p>
      </Section>

      <Section title="9. Service availability">
        <p>
          We aim for 99% monthly uptime but make no formal SLA at this stage of the product. Maintenance windows and degraded periods will be announced in advance where possible. We are not responsible for downtime caused by upstream providers (Meta, Google, Stripe, Cloudflare, OpenAI/Anthropic) outside our control.
        </p>
      </Section>

      <Section title="10. Termination">
        <p>
          You may terminate by deleting your account. We may terminate (with reasonable notice) if you violate these Terms, if continued service becomes economically unviable for us, or if required by law. On termination of a paid plan we will refund the unused portion only when termination is initiated by us without cause.
        </p>
      </Section>

      <Section title="11. Disclaimers">
        <p>
          The Service is provided &quot;as is&quot; without warranties of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, or non-infringement. AI suggestions may be incorrect. Campaign performance depends on factors outside our control.
        </p>
      </Section>

      <Section title="12. Limitation of liability">
        <p>
          To the maximum extent permitted by law, our aggregate liability arising out of or related to the Service is limited to the amount you paid us in the 12 months preceding the claim, or €100, whichever is greater. We are not liable for indirect, incidental, consequential, or punitive damages.
        </p>
        <p>
          Nothing in these Terms limits liability for fraud, gross negligence, death or personal injury caused by our negligence, or any other liability that cannot be excluded under Estonian law.
        </p>
      </Section>

      <Section title="13. Indemnity">
        <p>
          You agree to indemnify UniAds against claims arising from your violation of these Terms, your ad content, your use of third-party services through us, or your infringement of someone else&apos;s rights.
        </p>
      </Section>

      <Section title="14. Changes to these Terms">
        <p>
          We may update these Terms as the product evolves. Material changes: 14 days&apos; email notice to active users + updated &quot;Last updated&quot; date. Continued use after the effective date constitutes acceptance.
        </p>
      </Section>

      <Section title="15. Governing law">
        <p>
          These Terms are governed by the laws of Estonia. Disputes that cannot be resolved through good-faith discussion (email <a href="mailto:info@uniads.eu">info@uniads.eu</a>) will be brought before the courts of Harju County, Estonia. EU consumers retain the right to bring action in their country of residence under applicable consumer-protection law.
        </p>
      </Section>

      <Section title="16. Contact">
        <p>
          Questions about these Terms: <a href="mailto:info@uniads.eu">info@uniads.eu</a>
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
      <div className="text-[14.5px] leading-[1.65] text-[var(--ink-mute)] [&_h3]:font-semibold [&_h3]:text-[var(--ink)] [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-[15px] [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ul]:space-y-1 [&_li]:leading-[1.55] [&_p]:my-3 [&_a]:underline [&_a]:text-[var(--peach-deep)] [&_b]:text-[var(--ink)] [&_b]:font-semibold">
        {children}
      </div>
    </section>
  );
}
