import { Menu, LogOut, User, Bell, Search, Home, Book, ChevronDown, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebar } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";

import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useDispatch } from "react-redux";
import { logout } from "../../../state/slices/authSlice.ts";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const GuestDashboardNavbar = () => {
  const { toggleSidebar } = useSidebar();
  const auth = getAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const location = useLocation();
  const [showSearch, setShowSearch] = useState(false);

  //@ts-ignore
  const user = useSelector((state) => state.auth?.user);
  const userName = user?.displayName || "Student";


   // Dummy quick links
   const quickLinks = [
    { title: "Dashboard", icon: Home, path: "/dashboard" },
    { title: "Vocabulary", icon: Book, path: "/dashboard/vocab" },
  ];

    // Breadcrumb generation
    const getBreadcrumbs = () => {
      const paths = location.pathname.split('/').filter(p => p !== '');
      if (paths.length <= 1) return null;
      
      return (
        <div className="hidden md:flex items-center text-sm text-muted-foreground">
          {paths.map((path, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <span className="mx-2">/</span>}
              <span className={index === paths.length - 1 ? "font-medium text-foreground" : ""}>
                {path.charAt(0).toUpperCase() + path.slice(1)}
              </span>
            </div>
          ))}
        </div>
      );
    };

   // Dummy data for notifications
   const notifications = [
    { id: 1, title: "New vocabulary word assigned", read: false },
    { id: 2, title: "Practice reminder for Spanish", read: false },
    { id: 3, title: "Congratulations on streak achievement", read: true },
    { id: 4, title: "New grammar lesson available", read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("token");
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b z-50">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left side - Menu button and logo */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-langlearn-dark-blue"
            >
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
          </Button>
  
          <div className="hidden md:flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-langlearn-blue to-langlearn-light-blue flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-bold md:text-lg  text-langlearn-dark-blue">LoopLearn</span>
          </div>
        </div>
  
        {/* Right side - Notifications and user profile */}
        <div className="flex items-center gap-6">
          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-langlearn-dark-blue"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-langlearn-orange text-white text-xs font-medium">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 mr-2">
              <div className="p-3 border-b">
                <h4 className="font-medium">Notifications</h4>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b last:border-0 hover:bg-gray-50 ${notification.read ? '' : 'bg-blue-50/50'}`}
                    >
                      <p className="text-sm">{notification.title}</p>
                     
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No new notifications
                  </div>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-2 border-t">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    Mark all as read
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
  
          {/* User profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 rounded-full">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">{userName}</span>
                  <span className="text-xs text-gray-500">Student</span>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback className="bg-langlearn-blue text-white">
                    {userName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span style={{ cursor: 'pointer' }}>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span style={{ cursor: 'pointer' }}>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span style={{ cursor: 'pointer' }}>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default GuestDashboardNavbar;