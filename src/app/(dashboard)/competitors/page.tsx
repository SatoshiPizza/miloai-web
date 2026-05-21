import { ComingSoon } from "@/components/coming-soon";

export default function CompetitorsPage() {
  return (
    <ComingSoon
      title="Конкуренты"
      description="Разведка через Meta Ad Library — что крутят соседи по нише."
      upcoming={[
        "Вставь URL конкурента или Instagram → парсим Meta Ad Library",
        "Grid их активных объявлений с датами запуска",
        "AI-разбор: основной угол, средняя длина headline, частота смены",
        "Сравнение с твоими креативами по той же услуге",
      ]}
    />
  );
}
