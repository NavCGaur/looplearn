import { Book, AudioWaveform, Repeat, BarChartHorizontal } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
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

const menuItems = [
  { icon: BarChartHorizontal, label: "Overview", path: "/guest/dashboard/stats" },
  { icon: Book, label: "Vocab Quiz", path: "/guest/dashboard/vocab" },
  { icon: Book, label: "Grammar Quiz", path: "/guest/dashboard/grammar" },
  { icon: Repeat, label: "Spaced Repetition", path: "/guest/dashboard/spaced" },
  { icon: AudioWaveform, label: "Speech Shadow", path: "/guest/dashboard/speech" },
];

const GuestDashboardSidebar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  const { toggleSidebar } = useSidebar();


  return (
    <Sidebar>
      <SidebarHeader className="relative z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-langlearn-blue to-langlearn-light-blue flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="font-bold text-lg text-langlearn-dark-blue">LinguaLearn</span>
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
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.path}
                      onClick={isMobile ? toggleSidebar : undefined}
                      className={`flex items-center gap-3 px-3 py-6 cursor-pointer ${
                        location.pathname === item.path 
                          ? "bg-langlearn-blue/10 text-langlearn-blue font-medium" 
                          : "hover:bg-gray-100/80"
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${
                        location.pathname === item.path 
                          ? "text-langlearn-blue" 
                          : "text-gray-500"
                      }`} />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
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
