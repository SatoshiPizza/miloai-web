/**
 * Client-side wrappers for the FastAPI /api/web/* endpoints.
 *
 * Mirrors the Pydantic models in `app/api/web.py`. Keep these in sync.
 */

import { api } from "@/lib/api";
import { config } from "@/lib/config";
import { getSessionToken } from "@/lib/session";

export type BusinessSummary = {
  id: number;
  name: string;
  category: string | null;
  site_url: string | null;
  onboarding_complete: boolean;
  is_active: boolean;
};

export type BusinessDetail = BusinessSummary & {
  source_type: string | null;
  instagram_url: string | null;
  has_site: boolean;
  description: string | null;
  usp: string | null;
  target_audience: string | null;
  country: string | null;
  city: string | null;
  languages: string | null;
  monthly_ad_budget: number | null;
  contact_phone: string | null;
  contact_email: string | null;
  contact_whatsapp: string | null;
  meta_ad_account_id: number | null;
  google_ad_account_id: number | null;
  onboarding_step: number;
  photo_pool: unknown[] | null;
  // Snapshot from the campaign-import roll-up the onboarding pipeline writes
  // at Step 3. Onboarding Step 6 reads this to render either the rich-data
  // variant (imported campaigns with current CPL → plan) or the empty-state
  // checklist. Shape is intentionally loose because the backend can extend
  // it without bumping every consumer.
  starting_plan?: {
    platforms?: Record<string, {
      connected: boolean;
      account_name?: string | null;
      campaigns_count?: number;
      active_count?: number;
      spend_7d?: number;
      leads_7d?: number;
      cpl_7d?: number | null;
      top_campaigns?: Array<{
        name: string; status: string; spend_7d: number; leads_7d: number;
        cpa: number | null; cpc: number | null; ctr: number | null;
      }>;
      error?: string;
    }>;
    total_spend_7d?: number;
    total_leads_7d?: number;
    any_connected?: boolean;
  } | null;
};

export type Me = {
  id: number;
  telegram_id: number | null;
  telegram_username: string | null;
  first_name: string | null;
  business_name: string | null;
  onboarding_complete: boolean;
  language_code: string | null;
  has_telegram_paired: boolean;
  active_business_id: number | null;
  businesses: BusinessSummary[];
};

export type WebMessage = {
  id: number;
  source: "telegram" | "web" | "system";
  direction: "in" | "out";
  kind: "user_text" | "user_voice" | "ai_text" | "system_notice" | "tool_action";
  text: string | null;
  voice_transcript: string | null;
  meta: Record<string, unknown> | null;
  telegram_message_id: number | null;
  created_at: string;
};

export type PairStart = {
  token: string;
  deep_link: string;
  expires_at: string;
};

export type CampaignAnomaly = {
  severity: "info" | "warn" | "critical";
  message: string;
};

export type CampaignSummary = {
  id: string;
  name: string;
  status: string;
  platform: "meta" | "google" | string;
  ad_account_id: number;
  ad_account_name: string;
  objective: string;
  daily_budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpa: number | null;
  cpc: number | null;
  ctr: number | null; // fraction 0-1
  roas: number | null;
  anomalies: CampaignAnomaly[];
};

export type CampaignTotals = {
  spend: number;
  clicks: number;
  conversions: number;
  campaigns_count: number;
  active_count: number;
  cpl: number | null;
};

export type CampaignsResponse = {
  campaigns: CampaignSummary[];
  totals: CampaignTotals;
};

export type DashboardKpi = {
  spend_7d: number;
  leads_7d: number;
  cpl: number | null;
  target_cpl: number | null;
  active_campaigns: number;
  total_campaigns: number;
};

export type CampaignRecommendation = {
  issue: string;
  suggestion: string;
  impact: string;
};

export type CampaignAdvice = {
  health: "healthy" | "needs_attention" | "critical" | string;
  summary: string;
  recommendations: CampaignRecommendation[];
};

export type CampaignDetail = CampaignSummary & {
  advice: CampaignAdvice | null;
};

export type ActionResult = {
  ok: boolean;
  detail: string | null;
};

export type LandingPublishResult = {
  ok: boolean;
  url: string | null;
  slug: string | null;
  backend: "local" | "cloudflare" | string;
  detail: string | null;
};

export type LeadStatus = "new" | "contacted" | "won" | "lost";
export type LeadPlatform = "meta" | "google" | "manual";

export type Lead = {
  id: number;
  user_id: number;
  platform: LeadPlatform | string;
  platform_lead_id: string | null;
  form_id: string | null;
  platform_campaign_id: string | null;
  service_id: number | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  status: LeadStatus | string;
  ai_response: string | null;
  notes: string | null;
  value: number | null;
  reason: string | null;
  created_at: string;
  contacted_at: string | null;
  closed_at: string | null;
};

/** SSE event envelope from /api/web/leads/stream. */
export type LeadStreamEvent =
  | (Lead & { event: "created" | "updated" })
  | { event: "heartbeat" };

export type LeadUpdate = {
  status?: LeadStatus;
  notes?: string;
  value?: number;
  reason?: string;
};

export type LeadCreateManual = {
  name?: string;
  phone?: string;
  email?: string;
  service_id?: number;
  notes?: string;
};

export type BillingStatus = {
  plan: "starter" | "pro" | "growth" | "agency" | string;
  status: "trial" | "active" | "expired" | "cancelled" | string;
  current_period_end: string | null;
  has_payment_method: boolean;
};

export type BillingTier = "pro" | "growth";

export type SocialLoginOut = {
  token: string;
  user_id: number;
  first_name: string | null;
  email: string | null;
  avatar_url?: string | null;
};

export type CompetitorAd = {
  advertiser_name: string;
  legal_name: string;
  days_running: number;
  format: "image" | "video" | "carousel" | string;
  headline: string | null;
  body: string | null;
  image_url: string | null;
  landing_url: string | null;
  archive_url: string;
};

export type CompetitorOverview = {
  players: number;
  pages: number;
  ads_90d: number;
  active_ads: number;
  top_formats: Record<string, number>;
  top_languages: Record<string, number>;
  ad_destinations: Record<string, number>;
};

export type CompetitorInsight = {
  headline: string;
  body: string;
};

export type CompetitorResearchResult = {
  ok: boolean;
  niche: string;
  country: string;
  overview: CompetitorOverview;
  top_ads: CompetitorAd[];
  insights: CompetitorInsight[];
  is_mock: boolean;
  data_sources: string[];
  generated_at: string;
  disclaimer?: string;
  error?: string;
};

export type IdentityProvider = "telegram" | "google" | "meta" | "email";

export type Identity = {
  id: number;
  provider: IdentityProvider | string;
  provider_uid: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  last_login_at: string | null;
};

export type LandingAuditItem = {
  status: "ok" | "warn" | "fail" | string;
  message: string;
};

export type LandingAuditReport = {
  url: string;
  score: number;
  reachable: boolean;
  page_size_kb: number;
  items: LandingAuditItem[];
};

export type ServiceBannerPreview = {
  angle: string;
  headline: string;
  subheadline: string;
  color_scheme: string;
};

export type ServiceSummary = {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  price_currency: string;
  target_audience: string | null;
  has_meta_creatives: boolean;
  has_google_rsa: boolean;
  has_landing: boolean;
  landing_url: string | null;
  /** 0-100 offer-intake completeness — drives the readiness badge and which
   *  card action is highlighted. */
  profile_score: number;
  banner_previews: ServiceBannerPreview[];
  sample_headlines: string[];
};

/** One offer's deep profile. Mirrors OfferProfile in
 *  app/ai/schemas/offer_profile.py. All fields optional — intake is
 *  progressive. We only render/read; the backend owns the shape. */
export type OfferProfile = {
  economics?: {
    what_it_is?: string | null;
    price_mode?: "exact" | "from" | "individual" | "free" | null;
    price_eur?: number | null;
    avg_check_eur?: number | null;
    margin_per_sale_eur?: number | null;
    repeat_revenue_eur?: number | null;
    monthly_capacity?: number | null;
    close_rate?: number | null;
    target_leads_month?: number | null;
    acceptable_cpl_eur?: number | null;
  };
  buyers?: {
    who_buys?: string[];
    trigger_situations?: string[];
    top_problems?: string[];
    desired_outcome?: string | null;
    current_frustration?: string | null;
    pre_purchase_fears?: string[];
    common_questions?: string[];
    why_postpone?: string[];
    what_they_tried?: string[];
    why_choose_us?: string[];
  };
  proof?: {
    concrete_result?: string | null;
    time_to_first_result?: string | null;
    depends_on?: string[];
    cases?: string[];
    numbers?: string[];
    available_proof?: string[];
    proof_urls?: string[];
  };
  entry_point?: {
    kind?: string | null;
    custom_kind?: string | null;
    what_they_get?: string | null;
    price_eur?: number | null;
    duration?: string | null;
    why_now?: string | null;
    scarcity_kind?: string | null;
    scarcity_detail?: string | null;
    bonus?: string | null;
    guarantee?: string | null;
    generated_offer?: string | null;
  };
};

export type IntakeBlock = "economics" | "buyers" | "proof" | "entry_point";

export type OfferProfileResponse = {
  offer_profile: OfferProfile;
  profile_score: number;
  weakest_blocks: string[];
  max_cpl_eur: number | null;
  breakeven_cpl_eur: number | null;
  max_cpl_confidence: "high" | "medium" | "low";
  suggested_daily_budget_eur: number | null;
};

export type AdAccountSummary = {
  id: number;
  platform: string;
  platform_account_id: string;
  account_name: string | null;
  currency: string;
  is_selected?: boolean;
};

export type AccountsResponse = {
  accounts: AdAccountSummary[];
  has_meta: boolean;
  has_google: boolean;
};

export type WizardAuditRequest = {
  service_id: number;
  daily_budget_eur: number;
  platforms: { meta?: boolean; google?: boolean };
};

export type WizardAuditItem = {
  status: "ok" | "warn" | "fail" | string;
  message: string;
  fix: string | null;
  code: string | null;
};

export type WizardAuditResponse = {
  score: number;
  recommendation: "launch" | "fix_first" | "do_not_launch" | string;
  items: WizardAuditItem[];
  ai_summary: string | null;
  ai_priority_fix: string | null;
  ai_why_priority: string | null;
  service_landing_url: string | null;
};

export type WizardLaunchRequest = WizardAuditRequest & {
  /** Campaign objective — maps to Meta's OUTCOME_* + Google's conversion goal. */
  goal?: "leads" | "sales" | "traffic" | "bookings";
  /** ISO-2 country override; falls back to user.country / "EE". */
  geo_country?: string;
  geo_city?: string;
  age_min?: number;
  age_max?: number;
  /** Freeform interest keywords piped into Meta's flexible_spec. */
  interests?: string[];
};

export type WizardLaunchResult = {
  platform: string;
  ok: boolean;
  campaign_id: string | null;
  /** Raw platform account id — for Meta e.g. "act_1234" without prefix; for
   * Google the "customers/N/..." form. Used to build the deep link to the
   * platform's own ads manager after a successful launch. */
  platform_account_id: string | null;
  detail: string | null;
  error: string | null;
};

export type WizardLaunchResponse = {
  project_id: number | null;
  results: WizardLaunchResult[];
};

export type ChannelTopCampaign = {
  id: string;
  name: string;
  status: string;
  spend: number;
  leads: number;
  ctr: number | null;
  cpa: number | null;
};

export type ChannelStats = {
  spend: number;
  clicks: number;
  leads: number;
  impressions: number;
  ctr: number | null;
  cpl: number | null;
  roas: number | null;
  campaigns_count: number;
  active_count: number;
  top_campaigns: ChannelTopCampaign[];
};

export type AiAllocationRecommendation = {
  from_platform: string;
  to_platform: string;
  amount_eur: number;
  reason: string;
};

export type ChannelsResponse = {
  meta: ChannelStats;
  google: ChannelStats;
  total_spend: number;
  ai_allocation: {
    summary: string;
    recommendation: AiAllocationRecommendation | null;
  };
};

export const tgBridge = {
  me: () => api.get<Me>("/api/web/me"),
  startPair: () => api.post<PairStart>("/api/web/pair/start"),
  listMessages: () => api.get<WebMessage[]>("/api/web/messages"),

  // ── Businesses (workspace switcher) ──
  listBusinesses: () => api.get<BusinessSummary[]>("/api/web/businesses"),
  activeBusiness: () => api.get<BusinessDetail>("/api/web/businesses/active"),
  getBusiness: (id: number) =>
    api.get<BusinessDetail>(`/api/web/businesses/${id}`),
  createBusiness: (body: {
    name: string;
    category?: string;
    source_type?: "site" | "instagram" | "none";
    site_url?: string;
    instagram_url?: string;
  }) => api.post<BusinessDetail>("/api/web/businesses", body),
  patchBusiness: (id: number, body: Partial<BusinessDetail>) =>
    api.patch<BusinessDetail>(`/api/web/businesses/${id}`, body),
  switchBusiness: (id: number) =>
    api.post<BusinessSummary>("/api/web/businesses/switch", {
      business_id: id,
    }),
  archiveBusiness: (id: number) =>
    api.del<void>(`/api/web/businesses/${id}`),
  sendMessage: (text: string) =>
    api.post<WebMessage>("/api/web/messages", { text }),
  services: () => api.get<ServiceSummary[]>("/api/web/services"),
  patchService: (
    id: number,
    patch: {
      name?: string;
      description?: string | null;
      price?: number | null;
      price_currency?: string;
      target_audience?: string | null;
    },
  ) => api.patch<ServiceSummary>(`/api/web/services/${id}`, patch),
  deleteService: (id: number) =>
    api.del<void>(`/api/web/services/${id}`),
  regenerateServiceCreatives: (id: number) =>
    api.post<ServiceSummary>(`/api/web/services/${id}/regenerate`),
  deleteVariant: (serviceId: number, index: number) =>
    api.del<void>(`/api/web/services/${serviceId}/variants/${index}`),
  regenerateVariant: (serviceId: number, index: number) =>
    api.post<ServiceSummary>(`/api/web/services/${serviceId}/variants/${index}/regenerate`),

  /** ── Offer intake ───────────────────────────────────────
   *  Deep per-product profile, collected at first launch. extract sends a
   *  voice/text answer for one block; backend AI-fills it, merges, recomputes
   *  score + max_cpl, returns the full state. probeVague bounces filler
   *  answers ("качество") with a concrete re-ask before we accept them. */
  getOfferProfile: (serviceId: number) =>
    api.get<OfferProfileResponse>(`/api/web/services/${serviceId}/offer-profile`),
  intakeExtract: (serviceId: number, block: IntakeBlock, transcript: string) =>
    api.post<OfferProfileResponse>(
      `/api/web/services/${serviceId}/intake/extract`,
      { block, transcript },
    ),
  probeVague: (answer: string) =>
    api.post<{ is_vague: boolean; reason: string | null; reask: string | null }>(
      "/api/web/intake/probe-vague",
      { answer },
    ),
  creativeStatus: (serviceId: number) =>
    api.get<{
      photo_source: "site" | "upload" | "mixed" | "none";
      own_photo_count: number;
      content_generated: boolean;
      content_stale: boolean;
      variant_count: number;
    }>(`/api/web/services/${serviceId}/creative-status`),

  /** ── Photo pool ─────────────────────────────────────────
   *  Photos live on business.photo_pool as data-URIs. Upload accepts
   *  1-10 files at a time, backend resizes to 1440px max long-edge JPEG
   *  q82 and appends. Playwright loads data-URIs directly in banner
   *  HTML so no external storage needed. */
  listBusinessPhotos: () =>
    api.get<{ photos: string[] }>("/api/web/business/photos"),
  uploadBusinessPhotos: async (files: File[]): Promise<{ photos: string[] }> => {
    const fd = new FormData();
    for (const f of files) fd.append("files", f);
    // Custom fetch — api.post JSON-encodes the body but multipart needs
    // FormData raw. Mirror api.ts auth precedence: session JWT if
    // logged-in, else NEXT_PUBLIC_DEV_USER_ID via x-user-id (local dev).
    // Never fall back to a bare Bearer "" — the backend was rejecting
    // with 'missing Authorization Bearer or x-user-id' when the previous
    // hardcoded wrong localStorage key returned an empty string.
    const headers: Record<string, string> = {
      "ngrok-skip-browser-warning": "1",
    };
    const token = getSessionToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else if (config.devUserId) {
      headers["x-user-id"] = config.devUserId;
    }
    const res = await fetch(`${config.apiUrl}/api/web/business/photos`, {
      method: "POST",
      headers,
      body: fd,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `upload failed: ${res.status}`);
    }
    return res.json();
  },
  deleteBusinessPhoto: (index: number) =>
    api.post<{ photos: string[] }>("/api/web/business/photos/delete", { index }),
  adAccounts: () => api.get<AccountsResponse>("/api/web/ad-accounts"),
  wizardAudit: (body: WizardAuditRequest) =>
    api.post<WizardAuditResponse>("/api/web/campaigns/wizard/audit", body),
  wizardLaunch: (body: WizardLaunchRequest) =>
    api.post<WizardLaunchResponse>("/api/web/campaigns/wizard/launch", body),
  auditSuggestFix: (body: { code: "audience" | "offer"; service_id?: number }) =>
    api.post<{ suggestion: string; reasoning: string }>(
      "/api/web/audit/suggest-fix",
      body,
    ),
  auditApplyFix: (body: {
    code: "contacts" | "audience" | "offer";
    service_id?: number;
    contact_phone?: string | null;
    contact_whatsapp?: string | null;
    contact_email?: string | null;
    text?: string | null;
  }) => api.post<{ ok: boolean }>("/api/web/audit/apply-fix", body),
  campaigns: () => api.get<CampaignsResponse>("/api/web/campaigns"),
  campaign: (id: string) => api.get<CampaignDetail>(`/api/web/campaigns/${encodeURIComponent(id)}`),
  channels: () => api.get<ChannelsResponse>("/api/web/channels"),
  metaOauthUrl: () => api.get<{ url: string }>("/api/web/oauth/meta/url"),
  googleOauthUrl: () => api.get<{ url: string }>("/api/web/oauth/google/url"),
  disconnectPlatform: (platform: "meta" | "google") =>
    api.post<ActionResult>(`/api/web/accounts/${platform}/disconnect`),
  selectAdAccount: (platform: "meta" | "google", ad_account_id: number) =>
    api.post<AccountsResponse>(
      `/api/web/accounts/${platform}/select`,
      { ad_account_id },
    ),
  pauseCampaign: (id: string) =>
    api.post<ActionResult>(`/api/web/campaigns/${encodeURIComponent(id)}/pause`),
  resumeCampaign: (id: string) =>
    api.post<ActionResult>(`/api/web/campaigns/${encodeURIComponent(id)}/resume`),
  adjustBudget: (id: string, body: { factor?: number; daily_eur?: number }) =>
    api.post<ActionResult>(`/api/web/campaigns/${encodeURIComponent(id)}/budget`, body),
  landingAudit: (id: string) =>
    api.post<LandingAuditReport>(`/api/web/campaigns/${encodeURIComponent(id)}/landing-audit`),
  republishLanding: (serviceId: number) =>
    api.post<LandingPublishResult>(`/api/web/services/${serviceId}/landing/republish`),

  // ── Leads ─────────────────────────────────────────────
  leads: () => api.get<Lead[]>("/api/web/leads"),
  updateLead: (id: number, body: LeadUpdate) =>
    api.patch<Lead>(`/api/web/leads/${id}`, body),
  createManualLead: (body: LeadCreateManual) =>
    api.post<Lead>("/api/web/leads/manual", body),

  researchCompetitors: (niche: string, country?: string) =>
    api.post<CompetitorResearchResult>("/api/web/competitors/research", { niche, country }),

  // ── Identities (linked login methods) ────────────────
  identities: () => api.get<Identity[]>("/api/auth/identities"),
  unlinkIdentity: (id: number) =>
    api.del<{ ok: boolean }>(`/api/auth/identities/${id}`),

  // ── Billing ───────────────────────────────────────────
  billingStatus: () => api.get<BillingStatus>("/api/web/billing/status"),
  billingCheckout: (tier: BillingTier) =>
    api.post<{ url: string }>("/api/web/billing/checkout", { tier }),
  billingPortal: () => api.post<{ url: string }>("/api/web/billing/portal"),

  /** Live leads — same polling fallback as openStream() (ngrok-free breaks SSE). */
  openLeadsStream(onEvent: (ev: LeadStreamEvent) => void): { close: () => void } {
    let lastId = 0;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const tick = async () => {
      if (cancelled) return;
      try {
        const list = await api.get<Lead[]>("/api/web/leads");
        for (const lead of list) {
          if (lead.id > lastId) {
            onEvent({ ...(lead as Lead), event: "created" });
            lastId = lead.id;
          }
        }
      } catch {
        /* swallow — retry next tick */
      }
      if (!cancelled) timer = setTimeout(tick, 4000);
    };
    timer = setTimeout(tick, 50);
    return {
      close: () => {
        cancelled = true;
        if (timer) clearTimeout(timer);
      },
    };
  },
  kpi: () => api.get<DashboardKpi>("/api/web/dashboard/kpi"),

  /**
   * Open a live message stream for /chat. Returns a handle with close()
   * for unmount cleanup, shaped like EventSource so existing callers don't
   * need to change.
   *
   * Under the hood: polling — we tried SSE but EventSource can't set the
   * `ngrok-skip-browser-warning` header, so on ngrok-free the stream just
   * receives the interstitial HTML page instead of an event stream. When
   * the backend moves off ngrok-free we can flip back to SSE.
   */
  openStream(onMessage: (msg: WebMessage) => void): { close: () => void } {
    let lastId = 0;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      if (cancelled) return;
      try {
        const list = await api.get<WebMessage[]>("/api/web/messages");
        for (const msg of list) {
          if (msg.id > lastId) {
            onMessage(msg);
            lastId = msg.id;
          }
        }
      } catch {
        // network blip — next tick will retry; surface via console only.
      }
      if (!cancelled) timer = setTimeout(tick, 3000);
    };
    // Kick off on next microtask so the caller's setState wiring is done.
    timer = setTimeout(tick, 50);
    return {
      close: () => {
        cancelled = true;
        if (timer) clearTimeout(timer);
      },
    };
  },
};
