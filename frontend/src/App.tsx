import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import AdminPage from "./pages/AdminPage";

import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./stores/useAuthStore";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { useThemeStore } from "./stores/useThemeStore";
import { initAxiosAuthInterceptors } from "./lib/axios";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, forceLogout } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    initAxiosAuthInterceptors();
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const onForceLogout = (event: WindowEventMap["auth:forceLogout"]) => {
      forceLogout(event.detail?.message);
    };
    window.addEventListener("auth:forceLogout", onForceLogout);
    return () => window.removeEventListener("auth:forceLogout", onForceLogout);
  }, [forceLogout]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser) return (
    <div className="flex items-center justify-center h-screen">
      <Loader className="size-10 animate-spin" />
    </div>
  )

  return (
    <div data-theme={theme} className="min-h-screen">
      <Navbar />

      <main className="pt-16 min-h-screen">
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="login" />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route
            path="/admin"
            element={
              authUser?.role === "admin" || authUser?.role === "owner"
                ? <AdminPage />
                : <Navigate to={authUser ? "/" : "/login"} />
            }
          />
        </Routes>
      </main>

      <Toaster />
    </div>
  )
}

export default App
