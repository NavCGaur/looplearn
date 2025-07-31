import { Book, AudioWaveform, Repeat, BookOpenText  ,Atom, BarChartHorizontal, Puzzle, Gamepad2, ClipboardCheck } from "lucide-react";
import { Link, useLocation , Outlet} from "react-router-dom";

import {
  Sidebar,
  useSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { title } from "process";
import path from "path";

const GuestDashboardSidebar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();

  // Independent menu states for English and Science
  const [englishOpen, setEnglishOpen] = useState(
    location.pathname.startsWith("/guest/dashboard/spaced")
  );
  const [scienceOpen, setScienceOpen] = useState(
    location.pathname.startsWith("/guest/dashboard/spaced-science")
  );

  const handleNavClick = () => {
    if (isMobile) toggleSidebar();
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    {
      title: "LeaderBoard",
      icon: <BarChartHorizontal className="h-4 w-4" />,
      path: "/guest/dashboard/leaderboard",
    },
     {
          title: "Word Practice",
          icon: <ClipboardCheck className="h-4 w-4" />,
          path: "/guest/dashboard/spaced/practice",
        },
        {
          title: "English Quiz",
          icon: <Puzzle className="h-4 w-4" />,
          path: "/guest/dashboard/spaced/word-quiz",
        },
         {
          title: "Science Quiz",
          icon: <Atom className="h-5 w-5" />,
          path: "/guest/dashboard/spaced/science-quiz",
        },
        {
          title: "My Word List",
          icon: <ClipboardCheck className="h-4 w-4" />,
          path: "/guest/dashboard/spaced/my-word-list",
        },
        {
          title: "Hangman",
          icon: <Gamepad2 className="h-4 w-4" />,
          path: "/guest/dashboard/spaced/hangman-game",
        },
      
    
  ];

  return (
    <Sidebar>
      <SidebarHeader className="relative z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-langlearn-blue to-langlearn-light-blue flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="font-bold text-lg text-langlearn-dark-blue">
              LinguaLearn
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="relative z-10">
        <SidebarGroup>
          <SidebarGroupLabel className="text-md font-medium px-4 pb-1 text-gray-500">
            Features
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="py-1">
              {menuItems.map((item, index) => (
                <SidebarMenuItem key={index}>
                  {item.title === "English" && (
                    <>
                      <button
                        onClick={() => setEnglishOpen(!englishOpen)}
                        className={`flex items-center gap-3 px-3 py-6 w-full text-left cursor-pointer ${
                          location.pathname.startsWith("/guest/dashboard/spaced")
                            ? "bg-langlearn-blue/10 text-langlearn-blue font-medium"
                            : "hover:bg-gray-100/80"
                        }`}
                      >
                        {item.icon}
                        <span>{item.title}</span>
                      </button>
                      {englishOpen &&
                      //@ts-ignore
                        item.children.map((child, cIndex) => (
                          <SidebarMenuItem key={cIndex}>
                            <SidebarMenuButton asChild>
                              <Link
                                to={child.path}
                                onClick={handleNavClick}
                                className={`ml-6 flex items-center gap-3 px-3 py-3 cursor-pointer text-sm ${
                                  isActive(child.path)
                                    ? "bg-langlearn-blue/10 text-langlearn-blue font-medium"
                                    : "hover:bg-gray-100/80"
                                }`}
                              >
                                {child.icon}
                                <span>{child.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                    </>
                  )}
                  {item.title === "Science" && (
                    <>
                      <button
                        onClick={() => setScienceOpen(!scienceOpen)}
                        className={`flex items-center gap-3 px-3 py-6 w-full text-left cursor-pointer ${
                          location.pathname.startsWith("/guest/dashboard/spaced-science")
                            ? "bg-langlearn-blue/10 text-langlearn-blue font-medium"
                            : "hover:bg-gray-100/80"
                        }`}
                      >
                        {item.icon}
                        <span>{item.title}</span>
                      </button>
                      {scienceOpen &&
                      //@ts-ignore
                        item.children.map((child, cIndex) => (
                          <SidebarMenuItem key={cIndex}>
                            <SidebarMenuButton asChild>
                              <Link
                                to={child.path}
                                onClick={handleNavClick}
                                className={`ml-6 flex items-center gap-3 px-3 py-3 cursor-pointer text-sm ${
                                  isActive(child.path)
                                    ? "bg-langlearn-blue/10 text-langlearn-blue font-medium"
                                    : "hover:bg-gray-100/80"
                                }`}
                              >
                                {child.icon}
                                <span>{child.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                    </>
                  )}
                  { //@ts-ignore
                  !item.collapsible && (
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.path}
                        onClick={handleNavClick}
                        className={`flex items-center gap-3 px-3 py-6 cursor-pointer ${
                          isActive(item.path)
                            ? "bg-langlearn-blue/10 text-langlearn-blue font-medium"
                            : "hover:bg-gray-100/80"
                        }`}
                      >
                        {item.icon}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="px-4 mt-auto mb-6 pt-4 pb-4">
          <div className="rounded-lg bg-gradient-to-r from-langlearn-blue/10 to-langlearn-light-blue/10 p-3 shadow-sm">
            <h4 className="font-medium text-langlearn-dark-blue text-sm">Learning Tip</h4>
            <p className="text-xs text-gray-600">
              Practice for at least 15 minutes daily for optimal results.
            </p>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default GuestDashboardSidebar;
