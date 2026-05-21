import { ComingSoon } from "@/components/coming-soon";

export default function ChannelsPage() {
  return (
    <ComingSoon
      title="Каналы"
      description="Сравнение Meta vs Google: бюджет, лиды, CPL и AI-рекомендация куда переложить."
      upcoming={[
        "Split-bar: спенд Meta vs Google за 7 дней",
        "AI Allocation Card — конкретный совет «перелей €X с Y на Z»",
        "Meta panel: креативы по углам + аудитории + AI insight",
        "Google panel: топ keywords + match-types + RSA performance",
      ]}
    />
  );
}
