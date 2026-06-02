import { useChatStore } from "../stores/useChatStore";

import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

const HomePage = () => {
  const { activeTab, selectedUser } = useChatStore();

  const showChatPanel = Boolean(selectedUser);

  return (
    <div className="h-[calc(100dvh-4rem)] bg-base-300 flex md:items-center md:justify-center md:p-4">
      <div className="flex relative w-full max-w-6xl md:rounded-xl overflow-hidden md:shadow-cl h-full md:h-[800px] border-0 md:border border-base-300/50">
        {/* LEFT SIDE — full width on mobile when no chat is open */}
        <div
          className={`${showChatPanel ? "hidden md:flex" : "flex"} w-full md:w-80 shrink-0 backdrop-blur-sm flex-col bg-base-100 border-r border-base-500/50`}
        >
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* RIGHT SIDE — full width on mobile when a chat is open */}
        <div
          className={`${showChatPanel ? "flex" : "hidden md:flex"} flex-1 min-w-0 flex flex-col backdrop-blur-sm bg-base-200`}
        >
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </div>
    </div>
  );
}

export default HomePage
