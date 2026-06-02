import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { LogOut, MessageSquare, Settings, Shield, User } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header
      className="border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-3 sm:px-4 h-16">
        <div className="flex items-center justify-between h-full gap-2">
          <div className="flex items-center min-w-0">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-all min-w-0">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold truncate hidden sm:block">Cord 2</h1>
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Link
              to={"/settings"}
              className="btn btn-sm gap-2 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                {(authUser.role === "admin" || authUser.role === "owner") && (
                  <Link to={"/admin"} className={`btn btn-sm gap-2`}>
                    <Shield className="w-5 h-5" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button
                  className="flex gap-2 items-center hover:opacity-80 transition-all"
                  onClick={logout}
                  type="button"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
