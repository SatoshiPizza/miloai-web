import { ComingSoon } from "@/components/coming-soon";

export default function InboxPage() {
  return (
    <ComingSoon
      title="Lead Inbox"
      description="Лиды с Meta Lead Forms + Google forms в виде Kanban."
      upcoming={[
        "4 колонки: Новые → В работе → Won → Lost",
        "Drag-and-drop между статусами",
        "AI-suggested response template для каждого нового лида",
        "Звонок / WhatsApp / email прямо из карточки",
      ]}
    />
  );
}
