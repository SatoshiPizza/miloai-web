import { ComingSoon } from "@/components/coming-soon";

export default function LandingsPage() {
  return (
    <ComingSoon
      title="Лендинги"
      description="AI-генерированные одностраничники с превью и редактором."
      upcoming={[
        "Сетка карточек с iframe-превью лендингов",
        "Split-view editor: визуальный слева, HTML справа",
        "Опубликовать одной кнопкой → реальный URL",
        "Аудит каждого лендинга на mobile / conversion mechanic",
      ]}
    />
  );
}
