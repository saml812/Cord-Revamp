import { useEffect, useMemo, useState } from "react";
import { useAdminStore } from "../stores/useAdminStore";
import { useAuthStore } from "../stores/useAuthStore";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminUserHeader from "../components/admin/AdminUserHeader";
import AdminUserActions from "../components/admin/AdminUserActions";
import AdminUserMessages from "../components/admin/AdminUserMessages";
import AdminAuditLogs from "../components/admin/AdminAuditLogs";
import type { AdminTab } from "../components/admin/types";
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
    auditLogs,
    isAuditLogsLoading,
    fetchUsers,
    selectUser,
    updateUserRole,
    deleteUser,
    lockUser,
    banUser,
    fetchUserMessages,
    applyAdminNewMessage,
    fetchAuditLogs,
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (activeTab !== "audit") return;
    fetchAuditLogs({ page: 1 });
  }, [activeTab, fetchAuditLogs]);

  useEffect(() => {
    if (!selectedUser) return;
    if (activeTab !== "messages") return;
    fetchUserMessages(selectedUser._id, { chatPage: 1 });
  }, [activeTab, fetchUserMessages, selectedUser]);

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
  const showMobileDetail = Boolean(selectedUser) || activeTab === "audit";

  return (
    <div className="h-[calc(100dvh-4rem)] bg-base-300 flex md:items-center md:justify-center md:p-4">
      <div className="flex relative w-full max-w-8xl md:rounded-xl overflow-hidden md:shadow-cl h-full md:h-[800px] border-0 md:border border-base-300/50">
        <AdminSidebar
          className={showMobileDetail ? "hidden md:flex" : "flex"}
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
        <div
          className={`${showMobileDetail ? "flex" : "hidden md:flex"} flex-1 min-w-0 flex flex-col backdrop-blur-sm bg-base-200`}
        >
          {activeTab === "audit" ? (
            <div className="p-4 flex-1 overflow-y-auto min-w-0">
              <AdminAuditLogs
                onBack={() => setActiveTab("users")}
                isLoading={isAuditLogsLoading}
                data={auditLogs}
                onPrev={() => fetchAuditLogs({ page: Math.max((auditLogs?.page ?? 2) - 1, 1) })}
                onNext={() => fetchAuditLogs({ page: (auditLogs?.page ?? 1) + 1 })}
              />
            </div>
          ) : !selectedUser ? (
            <div className="h-full flex items-center justify-center text-center p-8">
              <div className="max-w-md space-y-2">
                <div className="text-xl font-semibold">Select a user</div>
                <div className="opacity-70">Pick a user on the left to manage roles, lock/ban state, and view DM history.</div>
              </div>
            </div>
          ) : (
            <>
              <AdminUserHeader user={selectedUser} onBack={() => selectUser(null)} />

              <div
                className={
                  activeTab === "messages"
                    ? "p-3 sm:p-4 flex-1 min-h-0 flex flex-col overflow-hidden"
                    : "p-3 sm:p-4 space-y-4 overflow-y-auto"
                }
              >
                {activeTab === "users" && (
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
                )}

                {activeTab === "messages" && (
                  <div className="flex-1 min-h-0 flex flex-col min-w-0">
                    <AdminUserMessages
                      selectedUser={selectedUser}
                      isLoading={isUserMessagesLoading}
                      data={userMessages}
                      onPrev={() =>
                        fetchUserMessages(selectedUser._id, {
                          chatPage: Math.max((userMessages?.chatsPage ?? 2) - 1, 1),
                        })
                      }
                      onNext={() =>
                        fetchUserMessages(selectedUser._id, {
                          chatPage: (userMessages?.chatsPage ?? 1) + 1,
                        })
                      }
                    />
                  </div>
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

