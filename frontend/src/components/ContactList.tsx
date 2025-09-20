import { useEffect } from "react";
import { useChatStore } from "../stores/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../stores/useAuthStore";

function ContactList() {
  const { getContacts, contacts, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getContacts();
  }, [getContacts]);

  useEffect(() => {
    console.log("Contacts:", contacts);
  }, [contacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      {contacts.map((contact) => (
        <div
          key={contact._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => setSelectedUser(contact)}
        >
          <div className="flex items-center gap-3">
            {/* need to fix */}
            <div className={`avatar ${onlineUsers.includes(contact._id) ? "online" : "offline"}`}>
              <div className="size-12 rounded-full">
                <img src={contact.profilePic || "/avatar.png"} />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium">{contact.firstName + " " + contact.lastName}</h4>
          </div>
        </div>
      ))}
    </>
  );
}
export default ContactList;