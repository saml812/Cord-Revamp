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
    <div className="h-[calc(100vh-4rem)] bg-base flex items-center justify-center">

      <div className="flex relative w-full max-w-6xl rounded-lg shadow-cl h-[800px]">
        {/* LEFT SIDE */}
        <div className="w-80 backdrop-blur-sm flex flex-col bg-base-200">
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
