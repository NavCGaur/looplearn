import { Book, AudioWaveform, Repeat, BarChartHorizontal, Users, Telescope, ChevronDown, Settings, Upload, Database, Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const menuItems = [
  { icon: BarChartHorizontal, label: "Overview", path: "/admin/dashboard/stats" },
  { icon: Book, label: "Vocab Quiz", path: "/admin/dashboard/vocab" },
  { icon: Book, label: "Grammar Quiz", path: "/admin/dashboard/grammar" },
  { icon: Repeat, label: "Spaced Repetition", path: "/admin/dashboard/spaced" },
  { icon: BarChartHorizontal, label: "Math Quiz", path: "/admin/dashboard/spaced/math-quiz" },
  { icon: AudioWaveform, label: "Speech Shadow", path: "/admin/dashboard/speech" },
  { icon: Users, label: "Student Management", path: "/admin/dashboard/students" },
];

const scienceMenuItems = [
  { icon: Telescope, label: "Question Generator", path: "/admin/dashboard/science-question-generator" },
  { icon: Settings, label: "Question Manager", path: "/admin/dashboard/question-manager" },
  { icon: Plus, label: "Question Assigner", path: "/admin/dashboard/question-assigner" },
  { icon: Upload, label: "Bulk Upload", path: "/admin/dashboard/bulk-upload" },
  { icon: Database, label: "Main Dashboard", path: "/admin/dashboard/science-questions" },
];

const AdminDashboardSidebar = () => {
  const location = useLocation();
  const [isScienceOpen, setIsScienceOpen] = useState(
    location.pathname.includes('/admin/dashboard/science-') || 
    location.pathname.includes('/admin/dashboard/question-manager') ||
    location.pathname.includes('/admin/dashboard/question-assigner') ||
    location.pathname.includes('/admin/dashboard/bulk-upload')
  );

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
              
              {/* Science Question Management Collapsible */}
              <Collapsible open={isScienceOpen} onOpenChange={setIsScienceOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Telescope />
                      <span>Science Questions</span>
                      <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${isScienceOpen ? 'rotate-180' : ''}`} />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {scienceMenuItems.map((item) => (
                        <SidebarMenuSubItem key={item.label}>
                          <SidebarMenuSubButton asChild>
                            <Link 
                              to={item.path}
                              className={location.pathname === item.path ? "bg-sidebar-accent" : ""}
                            >
                              <item.icon />
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminDashboardSidebar;
