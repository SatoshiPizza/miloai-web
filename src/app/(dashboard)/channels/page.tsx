"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Megaphone, Globe, ArrowRight, TrendingUp, Users, Image as ImageIcon, Search as SearchIcon,
} from "lucide-react";
import { tgBridge, type ChannelsResponse, type ChannelStats, type ChannelTopCampaign } from "@/lib/tg-bridge";

/**
 * Channels page (Каналы) — Meta vs Google comparison + AI budget allocation.
 * Per design handoff §2.
 */

export default function ChannelsPage() {
  const [data, setData] = useState<ChannelsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tgBridge.channels()
      .then(setData)
      .catch((e) => {
        console.error(e);
        setError("Не удалось загрузить данные каналов.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-[1200px] space-y-6">
      <header>
        <h1 className="font-heading text-[28px] font-bold tracking-tight">Каналы</h1>
        <p className="text-[13.5px] text-[var(--ink-mute)] mt-1">
          Meta vs Google за 7 дней. AI смотрит CPL и рекомендует куда переложить бюджет.
        </p>
      </header>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Allocation strip — handoff §Allocation Strip */}
      <AllocationStrip data={data} loading={loading} />

      {/* AI Allocation card — peach gradient */}
      <AiAllocationCard data={data} loading={loading} />

      {/* Per-platform panels — handoff §Meta Panel / Google Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MetaPanel stats={data?.meta} loading={loading} />
        <GooglePanel stats={data?.google} loading={loading} />
      </div>
    </div>
  );
}


function AllocationStrip({ data, loading }: { data: ChannelsResponse | null; loading: boolean }) {
  if (loading || !data) {
    return (
      <Card>
        <CardContent className="p-5 space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-6 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  const meta = data.meta;
  const google = data.google;
  const total = data.total_spend;
  // Show 50/50 placeholder if total is zero (both unspent campaigns).
  const metaPct = total > 0 ? (meta.spend / total) * 100 : 50;
  const googlePct = total > 0 ? (google.spend / total) * 100 : 50;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--ink-subtle)] font-semibold">
              Spend · 7 дней
            </div>
            <div className="font-mono text-[32px] font-medium tracking-[-0.02em] tabular-nums leading-none mt-1">
              €{total.toFixed(0)}
            </div>
          </div>
          <div className="flex gap-5 text-right">
            <SmallMetric label="Лидов" value={String(meta.leads + google.leads)} />
            <SmallMetric label="CPL ср." value={(() => {
              const allLeads = meta.leads + google.leads;
              return allLeads > 0 ? `€${(total / allLeads).toFixed(0)}` : "—";
            })()} />
            <SmallMetric label="ROAS" value={(() => {
              const both = [meta.roas, google.roas].filter((x): x is number => x != null);
              return both.length ? `${(both.reduce((a, b) => a + b, 0) / both.length).toFixed(2)}×` : "—";
            })()} />
          </div>
        </div>

        {/* Split bar */}
        <div className="flex h-9 rounded-lg overflow-hidden">
          <div
            className="flex items-center justify-between px-3 text-white text-[12px] font-medium transition-all"
            style={{ width: `${metaPct}%`, background: "var(--meta)", minWidth: total === 0 ? "50%" : undefined }}
          >
            <span className="flex items-center gap-1.5">
              <Megaphone className="size-3.5" strokeWidth={2} /> Meta
            </span>
            <span className="font-mono tabular-nums text-[11px] opacity-90">
              {metaPct.toFixed(0)}% · €{meta.spend.toFixed(0)}
            </span>
          </div>
          <div
            className="flex items-center justify-between px-3 text-white text-[12px] font-medium transition-all"
            style={{ width: `${googlePct}%`, background: "var(--google)", minWidth: total === 0 ? "50%" : undefined }}
          >
            <span className="flex items-center gap-1.5">
              <Globe className="size-3.5" strokeWidth={2} /> Google
            </span>
            <span className="font-mono tabular-nums text-[11px] opacity-90">
              {googlePct.toFixed(0)}% · €{google.spend.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Detail row per side */}
        <div className="grid grid-cols-2 gap-6 mt-4 text-[12.5px]">
          <SideDetail
            stats={meta}
            otherRoas={google.roas}
            color="var(--meta)"
          />
          <SideDetail
            stats={google}
            otherRoas={meta.roas}
            color="var(--google)"
          />
        </div>
      </CardContent>
    </Card>
  );
}


function SideDetail({ stats, otherRoas, color }: { stats: ChannelStats; otherRoas: number | null; color: string }) {
  const winning = stats.roas != null && otherRoas != null && stats.roas > otherRoas;
  return (
    <div className="flex justify-between">
      <SmallMetric label="Лидов" value={String(stats.leads)} />
      <SmallMetric label="CPL" value={stats.cpl != null ? `€${stats.cpl.toFixed(0)}` : "—"} />
      <SmallMetric
        label="ROAS"
        value={stats.roas != null ? `${stats.roas.toFixed(2)}×` : "—"}
        color={winning ? "var(--sage)" : undefined}
      />
    </div>
  );
}


function SmallMetric({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--ink-subtle)] font-semibold">
        {label}
      </div>
      <div
        className="font-mono text-[14px] font-medium tabular-nums leading-tight mt-0.5"
        style={{ color: color ?? "var(--ink)" }}
      >
        {value}
      </div>
    </div>
  );
}


function AiAllocationCard({ data, loading }: { data: ChannelsResponse | null; loading: boolean }) {
  if (loading || !data) {
    return <Skeleton className="h-24 w-full" />;
  }
  const rec = data.ai_allocation.recommendation;
  return (
    <div
      className="relative rounded-[14px] border p-5"
      style={{
        background: "linear-gradient(135deg, var(--peach-wash) 0%, #F8E8D9 100%)",
        borderColor: "#F5DDC8",
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="size-[38px] rounded-full bg-white flex items-center justify-center shrink-0"
          style={{ boxShadow: "0 4px 14px -4px rgba(232,149,108,0.4)" }}
        >
          <Sparkles className="size-[18px] text-[var(--peach)]" strokeWidth={1.6} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--peach-deep)] mb-2">
            AI · Аллокация бюджета
          </div>
          <p className="text-[13.5px] leading-snug text-[var(--ink)]">
            {data.ai_allocation.summary}
          </p>
          {rec && (
            <div className="mt-3 flex items-center gap-3 rounded-lg bg-white/70 border border-[var(--peach-soft)] px-3 py-2.5 flex-wrap">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--peach-deep)] font-semibold">
                Рекомендация
              </span>
              <PlatformChip platform={rec.from_platform} />
              <ArrowRight className="size-4 text-[var(--peach-deep)]" strokeWidth={2} />
              <PlatformChip platform={rec.to_platform} />
              <span className="font-mono text-[13px] font-medium tabular-nums text-[var(--ink)]">
                €{rec.amount_eur.toFixed(0)}
              </span>
              <span className="text-[12px] text-[var(--peach-ink)]/80 basis-full">
                {rec.reason}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


function PlatformChip({ platform }: { platform: string }) {
  if (platform === "meta") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md font-mono text-[10.5px] font-semibold uppercase tracking-[0.02em]"
        style={{ background: "var(--meta-soft)", color: "var(--meta-ink)", border: "1px solid #CDDDFA" }}
      >
        <Megaphone className="size-3" strokeWidth={2} /> Meta
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded-md font-mono text-[10.5px] font-semibold uppercase tracking-[0.02em]"
      style={{ background: "var(--google-soft)", color: "var(--google-ink)", border: "1px solid #D6E4FB" }}
    >
      <Globe className="size-3" strokeWidth={2} /> Google
    </span>
  );
}


function MetaPanel({ stats, loading }: { stats: ChannelStats | undefined; loading: boolean }) {
  return (
    <PlatformPanel
      stats={stats}
      loading={loading}
      label="Meta"
      icon={Megaphone}
      headerBg="linear-gradient(180deg, #F8FAFE 0%, white 100%)"
      headerBorder="#DCE5F4"
      titleColor="var(--meta-ink)"
      emptyHint="Подключи Meta Ads в /accounts чтобы увидеть креативы и аудитории."
      sectionTitle="Топ кампании по спенду"
      footerCta="Сгенерить креатив"
      footerSecondary="Аудитории"
      insightHeader="Что сработало"
    />
  );
}


function GooglePanel({ stats, loading }: { stats: ChannelStats | undefined; loading: boolean }) {
  return (
    <PlatformPanel
      stats={stats}
      loading={loading}
      label="Google"
      icon={Globe}
      headerBg="linear-gradient(180deg, #F8FAFE 0%, white 100%)"
      headerBorder="#D6E4FB"
      titleColor="var(--google-ink)"
      emptyHint="Подключи Google Ads в /accounts (нужен MCC + developer token)."
      sectionTitle="Топ кампании по спенду"
      footerCta="Сгенерить headlines"
      footerSecondary="Keyword research"
      insightHeader="Что сработало"
    />
  );
}


function PlatformPanel({
  stats, loading, label, icon: Icon, headerBg, headerBorder, titleColor,
  emptyHint, sectionTitle, footerCta, footerSecondary, insightHeader,
}: {
  stats: ChannelStats | undefined;
  loading: boolean;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  headerBg: string;
  headerBorder: string;
  titleColor: string;
  emptyHint: string;
  sectionTitle: string;
  footerCta: string;
  footerSecondary: string;
  insightHeader: string;
}) {
  return (
    <Card className="overflow-hidden">
      <div
        className="px-5 py-4 flex items-center gap-3 border-b"
        style={{ background: headerBg, borderColor: headerBorder }}
      >
        <div
          className="size-9 rounded-md bg-white flex items-center justify-center"
          style={{ border: `1px solid ${headerBorder}` }}
        >
          <Icon className="size-[18px]" strokeWidth={1.6} style={{ color: titleColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="font-heading text-[17px] font-bold tracking-tight"
            style={{ color: titleColor }}
          >
            {label}
          </div>
          {stats && (
            <div className="font-mono text-[10.5px] text-[var(--ink-subtle)] flex items-center gap-2 mt-0.5">
              <span className="size-1.5 rounded-full bg-[var(--sage)] inline-block" />
              {stats.campaigns_count} кампаний · {stats.active_count} активных
            </div>
          )}
        </div>
        <div className="text-right">
          {stats && (
            <>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--ink-subtle)] font-semibold">
                Spend
              </div>
              <div className="font-mono text-[16px] font-medium tabular-nums leading-tight">
                €{stats.spend.toFixed(0)}
              </div>
            </>
          )}
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : !stats || stats.campaigns_count === 0 ? (
          <div className="py-6 text-center text-[13px] text-[var(--ink-mute)]">
            <Icon className="size-6 mx-auto mb-2 text-[var(--ink-subtle)]" strokeWidth={1.4} />
            <p>{emptyHint}</p>
          </div>
        ) : (
          <>
            {/* Top campaigns */}
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--ink-subtle)] font-semibold mb-2.5">
                {sectionTitle}
              </div>
              <div className="space-y-1.5">
                {stats.top_campaigns.map((c) => (
                  <TopCampaignRow key={c.id} c={c} />
                ))}
              </div>
            </div>

            {/* AI insight stub */}
            <div className="rounded-lg p-3 text-[12.5px]" style={{ background: "var(--sage-soft)", color: "#456838" }}>
              <div className="font-mono text-[10px] uppercase tracking-[0.08em] font-semibold mb-1.5">
                ✓ {insightHeader}
              </div>
              <ul className="space-y-1 list-disc list-inside">
                {stats.leads > 0 ? (
                  <li>{stats.leads} лидов суммарно — CPL €{stats.cpl?.toFixed(0) ?? "—"}</li>
                ) : (
                  <li>Лидов пока 0 — рано анализировать креативы</li>
                )}
                {stats.ctr != null && stats.ctr > 0.012 && <li>CTR {(stats.ctr * 100).toFixed(2)}% выше benchmark 1.2%</li>}
                {stats.active_count > 0 && <li>{stats.active_count} активных, остальное на паузе</li>}
              </ul>
            </div>

            {/* Footer actions */}
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" disabled>
                <ImageIcon className="size-3.5 mr-1.5" strokeWidth={1.6} />
                {footerCta}
              </Button>
              <Button variant="outline" className="flex-1" disabled>
                <Users className="size-3.5 mr-1.5" strokeWidth={1.6} />
                {footerSecondary}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}


function TopCampaignRow({ c }: { c: ChannelTopCampaign }) {
  return (
    <Link
      href={`/campaigns/${c.id}`}
      className="flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-[var(--card-soft)] transition-colors text-[12.5px]"
    >
      <span className={`size-2 rounded-full shrink-0 ${
        c.status === "active" ? "bg-[var(--sage)]" : c.status === "paused" ? "bg-[var(--ink-subtle)]" : "bg-[var(--warn)]"
      }`} />
      <span className="flex-1 truncate">{c.name}</span>
      <span className="font-mono tabular-nums text-[11.5px] text-[var(--ink-mute)] shrink-0">
        €{c.spend.toFixed(0)}
      </span>
      <span className="font-mono tabular-nums text-[11.5px] shrink-0" style={{ color: c.leads > 0 ? "var(--sage)" : "var(--ink-subtle)" }}>
        {c.leads}🎯
      </span>
    </Link>
  );
}
