import { Book, AudioWaveform, Repeat, BarChartHorizontal } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  { icon: BarChartHorizontal, label: "Overview", path: "/guest/dashboard/stats" },
  { icon: Book, label: "Vocab Quiz", path: "/guest/dashboard/vocab" },
  { icon: Book, label: "Grammar Quiz", path: "/guest/dashboard/grammar" },
  { icon: Repeat, label: "Spaced Repetition", path: "/guest/dashboard/spaced" },
  { icon: AudioWaveform, label: "Speech Shadow", path: "/guest/dashboard/speech" },
];

const DashboardSidebar = () => {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-langlearn-blue to-langlearn-light-blue flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="font-bold text-lg text-langlearn-dark-blue">LinguaLearn</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Features</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.path}
                      className={location.pathname === item.path ? "bg-sidebar-accent" : ""}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
