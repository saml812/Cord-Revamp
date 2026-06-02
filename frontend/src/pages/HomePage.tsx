import { useChatStore } from "../stores/useChatStore";

import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

const HomePage = () => {
  const { activeTab, selectedUser } = useChatStore();

  return (
    <div className="h-[calc(100vh-4rem)] bg-base-300 flex items-center justify-center">

      <div className="flex relative w-full max-w-6xl rounded-xl overflow-hidden shadow-cl h-[800px] border border-base-300/50">
        {/* LEFT SIDE */}
        <div className="w-80 backdrop-blur-sm flex flex-col bg-base-100 border-r border-base-500/50">
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 flex flex-col backdrop-blur-sm bg-base-200">
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </div>

    </div>
  );
}

export default HomePage
