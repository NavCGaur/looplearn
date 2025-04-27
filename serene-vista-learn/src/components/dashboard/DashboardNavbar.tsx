
import { Menu, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebar } from "@/components/ui/sidebar";

import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useDispatch } from "react-redux";
import { logout } from "../../state/slices/authSlice.ts";

const DashboardNavbar = () => {
  const { toggleSidebar } = useSidebar();

  const auth = getAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

   const handleLogout = async () => {
      
      try {
        // Sign out from Firebase
        await signOut(auth);
        
        // Clear local storage and Redux state
        localStorage.removeItem("token");
        dispatch(logout());
        
        // Redirect to login page
        navigate("/login");
      } catch (error) {
        console.error("Logout error:", error);
        // Still try to clear local state even if Firebase logout fails
        localStorage.removeItem("token");
        dispatch(logout());
        navigate("/login");
      }
    };



  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b z-50">
      <div className="flex items-center justify-between h-full px-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
