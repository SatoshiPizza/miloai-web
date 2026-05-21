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

export const tgBridge = {
  me: () => api.get<Me>("/api/web/me"),
  startPair: () => api.post<PairStart>("/api/web/pair/start"),
  listMessages: () => api.get<WebMessage[]>("/api/web/messages"),
  sendMessage: (text: string) =>
    api.post<WebMessage>("/api/web/messages", { text }),
  campaigns: () => api.get<CampaignsResponse>("/api/web/campaigns"),
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
