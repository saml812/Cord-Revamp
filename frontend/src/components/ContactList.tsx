import { useEffect } from "react";
import { useChatStore } from "../stores/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../stores/useAuthStore";

function ContactList() {
  const { getContacts, contacts, setSelectedUser, isUsersLoading } = useChatStore();
  const onlineUsers = useAuthStore((s) => s.onlineUsers);
  const isSocketConnected = useAuthStore((s) => s.isSocketConnected);

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
          className="bg-base-200/60 p-4 rounded-lg cursor-pointer hover:bg-base-200 transition-colors border border-base-300/40 hover:border-base-500/50"
          onClick={() => setSelectedUser(contact)}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="size-12 rounded-full overflow-hidden">
                <img
                  src={contact.profilePic || "/avatar.png"}
                  alt={`${contact.firstName} ${contact.lastName}`.trim() || "User"}
                  className="size-full object-cover"
                />
              </div>
              <span
                aria-label={isSocketConnected && onlineUsers.includes(contact._id) ? "Online" : "Offline"}
                className={[
                  "absolute bottom-0 right-0 size-3 rounded-full border-2",
                  "border-base-200/60",
                  isSocketConnected && onlineUsers.includes(contact._id) ? "bg-emerald-500" : "bg-slate-500",
                ].join(" ")}
              />
            </div>
            <h4 className="text-base-content font-medium">{contact.firstName + " " + contact.lastName}</h4>
          </div>
        </div>
      ))}
    </>
  );
}
export default ContactList;