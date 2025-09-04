import { Sidebar, SidebarProvider, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from "../../components/ui/sidebar";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  Clock, 
  Building2, 
  BarChart3, 
  Gamepad2, 
  Settings, 
  LogOut,
  X
} from "lucide-react";
import frame1 from '../../assets/images/frame1.png';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navigationItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/tasks", label: "Tasks", icon: ClipboardCheck },
    { path: "/time-tracker", label: "Time Tracker", icon: Clock },
    { path: "/co-working", label: "Co-working Rooms", icon: Building2 },
    { path: "/reports", label: "Reports", icon: BarChart3 },
    { path: "/challenges", label: "Challenges", icon: Gamepad2 },
  ];

  const bottomItems = [
    { path: "/settings", label: "Settings", icon: Settings },
    { path: "/logout", label: "Logout", icon: LogOut },
  ];

  const handleLogout = () => {
    // Add logout logic here
    navigate("/onboarding/login");
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar className="bg-white border-r border-gray-200" collapsible="icon">
          <SidebarHeader className="p-4">
            <div className="flex items-center justify-between">
              <div className="">
                <img src={frame1} alt="ClockKo Wellness App Logo" className="w-32 h-8" />
              </div>
              <SidebarTrigger className="h-6 w-6 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                <X className="h-4 w-4" />
              </SidebarTrigger>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-3">
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={isActive ? "bg-lightBlue! text-blue1! border-r-2 border-blue-700" : "hover:bg-gray-50"}
                    >
                      <Link to={item.path}>
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="p-3">
            <SidebarMenu>
              {bottomItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                if (item.path === "/logout") {
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        onClick={handleLogout}
                        className="hover:bg-gray-50 text-gray-700"
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }
                
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={isActive ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" : "hover:bg-gray-50"}
                    >
                      <Link to={item.path}>
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}