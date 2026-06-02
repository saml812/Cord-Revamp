import { useEffect, useMemo, useState } from "react";
import { useAdminStore } from "../stores/useAdminStore";
import { useAuthStore } from "../stores/useAuthStore";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminUserHeader from "../components/admin/AdminUserHeader";
import AdminUserActions from "../components/admin/AdminUserActions";
import AdminUserMessages from "../components/admin/AdminUserMessages";
import type { AdminTab } from "../components/admin/utils";
import { canManageUser } from "../components/admin/utils";
import type { Message } from "../types/user";

const AdminPage = () => {
  const { authUser } = useAuthStore();

  const {
    users,
    selectedUser,
    isUsersLoading,
    isUserActionLoading,
    userMessages,
    isUserMessagesLoading,
    fetchUsers,
    selectUser,
    updateUserRole,
    deleteUser,
    lockUser,
    banUser,
    fetchUserMessages,
    applyAdminNewMessage,
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (!selectedUser) return;
    if (activeTab !== "messages") return;
    fetchUserMessages(selectedUser._id);
  }, [activeTab, fetchUserMessages, selectedUser]);

  // Admin realtime message feed
  useEffect(() => {
    if (activeTab !== "messages") return;
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    const handler = (message: Message) => {
      applyAdminNewMessage(message);
    };

    socket.off("admin:newMessage", handler);
    socket.on("admin:newMessage", handler);

    return () => {
      socket.off("admin:newMessage", handler);
    };
  }, [activeTab, applyAdminNewMessage, selectedUser]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const name = `${u.firstName} ${u.lastName}`.toLowerCase();
      return name.includes(q) || u.email.toLowerCase().includes(q) || u._id.toLowerCase().includes(q);
    });
  }, [query, users]);

  if (!authUser) return null;

  const canManageSelected = selectedUser ? canManageUser({ actor: authUser, target: selectedUser }) : false;

  return (
    <div className="h-[calc(100vh-4rem)] bg-base-300 flex items-center justify-center">
      <div className="flex relative w-full max-w-6xl rounded-xl overflow-hidden shadow-cl h-[800px] border border-base-300/50">
        <AdminSidebar
          authUser={authUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          query={query}
          setQuery={setQuery}
          isUsersLoading={isUsersLoading}
          users={filteredUsers}
          selectedUser={selectedUser}
          onSelectUser={(u) => selectUser(u)}
        />

        {/* RIGHT */}
        <div className="flex-1 flex flex-col backdrop-blur-sm bg-base-200">
          {!selectedUser ? (
            <div className="h-full flex items-center justify-center text-center p-8">
              <div className="max-w-md space-y-2">
                <div className="text-xl font-semibold">Select a user</div>
                <div className="opacity-70">Pick a user on the left to manage roles, lock/ban state, and view DM history.</div>
              </div>
            </div>
          ) : (
            <>
              <AdminUserHeader user={selectedUser} />

              <div className="p-4 space-y-4 overflow-y-auto">
                <AdminUserActions
                  authUser={authUser}
                  selectedUser={selectedUser}
                  canManageSelected={canManageSelected}
                  isUserActionLoading={isUserActionLoading}
                  updateUserRole={updateUserRole}
                  lockUser={lockUser}
                  banUser={banUser}
                  deleteUser={deleteUser}
                />

                {activeTab === "messages" && (
                  <AdminUserMessages selectedUser={selectedUser} isLoading={isUserMessagesLoading} data={userMessages} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

