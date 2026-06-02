import { useChatStore } from "../stores/useChatStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div className="w-full px-4 py-2">
      <div className="flex w-full rounded-xl bg-base-200 p-1 border border-base-300/50">
      <button
        onClick={() => setActiveTab("chats")}
        type="button"
        className={[
          "flex-1 py-2 text-sm font-medium rounded-lg transition-colors",
          activeTab === "chats"
            ? "bg-primary text-primary-content"
            : "text-base-content/70 hover:bg-base-300/40",
        ].join(" ")}
      >
        Chats
      </button>

      <button
        onClick={() => setActiveTab("contacts")}
        type="button"
        className={[
          "flex-1 py-2 text-sm font-medium rounded-lg transition-colors",
          activeTab === "contacts"
            ? "bg-primary text-primary-content"
            : "text-base-content/70 hover:bg-base-300/40",
        ].join(" ")}
      >
        Contacts
      </button>
      </div>
    </div>
  );
}
export default ActiveTabSwitch;