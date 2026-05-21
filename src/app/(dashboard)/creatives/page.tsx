import { ComingSoon } from "@/components/coming-soon";

export default function CreativesPage() {
  return (
    <ComingSoon
      title="Креативы"
      description="Все сгенерированные баннеры. Фильтры по услуге, платформе и углу."
      upcoming={[
        "4-колоночный grid 1:1 банеров",
        "Tinted gradient backgrounds + diagonal stripe texture",
        "Клик → редактор: смена headline/цвета/фото с сайта",
        "CTR + CPC + статус «active» под каждым баннером",
      ]}
    />
  );
}
