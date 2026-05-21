/**
 * Client-side wrappers for the FastAPI /api/web/* endpoints.
 *
 * Mirrors the Pydantic models in `app/api/web.py`. Keep these in sync.
 */

import { api } from "@/lib/api";
import { config } from "@/lib/config";

export type Me = {
  id: number;
  telegram_id: number | null;
  telegram_username: string | null;
  first_name: string | null;
  business_name: string | null;
  onboarding_complete: boolean;
  language_code: string | null;
  has_telegram_paired: boolean;
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
};

export type AdAccountSummary = {
  id: number;
  platform: string;
  platform_account_id: string;
  account_name: string | null;
  currency: string;
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

export type WizardLaunchRequest = WizardAuditRequest;

export type WizardLaunchResult = {
  platform: string;
  ok: boolean;
  campaign_id: string | null;
  detail: string | null;
  error: string | null;
};

export type WizardLaunchResponse = {
  project_id: number | null;
  results: WizardLaunchResult[];
};

export const tgBridge = {
  me: () => api.get<Me>("/api/web/me"),
  startPair: () => api.post<PairStart>("/api/web/pair/start"),
  listMessages: () => api.get<WebMessage[]>("/api/web/messages"),
  sendMessage: (text: string) =>
    api.post<WebMessage>("/api/web/messages", { text }),
  services: () => api.get<ServiceSummary[]>("/api/web/services"),
  adAccounts: () => api.get<AccountsResponse>("/api/web/ad-accounts"),
  wizardAudit: (body: WizardAuditRequest) =>
    api.post<WizardAuditResponse>("/api/web/campaigns/wizard/audit", body),
  wizardLaunch: (body: WizardLaunchRequest) =>
    api.post<WizardLaunchResponse>("/api/web/campaigns/wizard/launch", body),
  campaigns: () => api.get<CampaignsResponse>("/api/web/campaigns"),
  campaign: (id: string) => api.get<CampaignDetail>(`/api/web/campaigns/${encodeURIComponent(id)}`),
  pauseCampaign: (id: string) =>
    api.post<ActionResult>(`/api/web/campaigns/${encodeURIComponent(id)}/pause`),
  resumeCampaign: (id: string) =>
    api.post<ActionResult>(`/api/web/campaigns/${encodeURIComponent(id)}/resume`),
  adjustBudget: (id: string, body: { factor?: number; daily_eur?: number }) =>
    api.post<ActionResult>(`/api/web/campaigns/${encodeURIComponent(id)}/budget`, body),
  landingAudit: (id: string) =>
    api.post<LandingAuditReport>(`/api/web/campaigns/${encodeURIComponent(id)}/landing-audit`),
  kpi: () => api.get<DashboardKpi>("/api/web/dashboard/kpi"),

  /**
   * Open a Server-Sent Events stream of incoming messages.
   * Returns an EventSource — caller closes it on unmount.
   *
   * EventSource doesn't support custom headers (no Authorization, no
   * x-user-id), so for dev we pass the user id as a query parameter and
   * the backend route reads it. Update when JWT lands in cookies.
   */
  openStream(onMessage: (msg: WebMessage) => void): EventSource {
    const url = new URL(`${config.apiUrl}/api/web/messages/stream`);
    if (config.devUserId) {
      url.searchParams.set("user_id", config.devUserId);
    }
    const es = new EventSource(url.toString(), { withCredentials: false });
    es.addEventListener("message", (ev) => {
      try {
        const data = JSON.parse((ev as MessageEvent).data) as WebMessage;
        onMessage(data);
      } catch (e) {
        console.warn("SSE parse error", e);
      }
    });
    return es;
  },
};
