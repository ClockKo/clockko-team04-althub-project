import { useState, useEffect } from 'react'
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '../../components/ui/sidebar'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useUserData } from '../../pages/dashboard/dashboardHooks'
import {
  LayoutDashboard,
  ClipboardCheck,
  Clock,
  Building2,
  BarChart3,
  Gamepad2,
  Settings,
  LogOut,
  X,
  Menu,
  Search,
} from 'lucide-react'
import clockkoLogo from '../../assets/images/frame1.png'
import { useIsMobile } from '../../hooks/use-mobile'
import { SidebarProvider } from '../../components/ui/sidebar'
import ellipse6 from '../../assets/images/Ellipse6.png'
import { processAvatarImage, validateImageFile } from '../../utils/imageProcessing'
import toast from 'react-hot-toast'



// Demo avatar
const defaultAvatar = ellipse6

export default function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>(defaultAvatar)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isProcessingAvatar, setIsProcessingAvatar] = useState(false)
  
  // Use the same user data hook as headerWidget
  const { data: user, isLoading: userLoading, error: userError } = useUserData()
  
  // Load saved avatar from localStorage on component mount
  useEffect(() => {
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
      console.log('🖼️ Loaded avatar from localStorage:', savedAvatar.substring(0, 50) + '...');
    }
  }, []);
  
  // Debug logging for mainLayout
  console.log("🔍 MainLayout - User data:", { user, userLoading, userError, userName: user?.name });
  console.log("🔍 MainLayout - Auth token exists:", !!localStorage.getItem('authToken'));

  // Avatar upload handler with image processing
  const handleAvatarUpload = async (file: File) => {
    if (isProcessingAvatar) return;

    setIsProcessingAvatar(true);

    try {
      // Validate the file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        toast.error(validation.error || 'Invalid file');
        return;
      }

      // Process the image (resize, crop, optimize)
      const processedDataURL = await processAvatarImage(file, {
        maxWidth: 256,
        maxHeight: 256,
        quality: 0.9,
        format: 'image/jpeg',
        cropToSquare: true
      });

      // Update avatar URL and save to localStorage
      setAvatarUrl(processedDataURL);
      localStorage.setItem('userAvatar', processedDataURL);
      
      toast.success('Avatar updated successfully!');
      console.log('💾 Processed avatar saved to localStorage');

    } catch (error) {
      console.error('❌ Avatar processing failed:', error);
      toast.error('Failed to process image. Please try a different file.');
    } finally {
      setIsProcessingAvatar(false);
    }
  };

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tasks', label: 'Tasks', icon: ClipboardCheck },
    { path: '/time-tracker', label: 'Time Tracker', icon: Clock },
    { path: '/co-working', label: 'Co-working Rooms', icon: Building2 },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    { path: '/challenges', label: 'Challenges', icon: Gamepad2 },
  ]

  // Filter navigation items by search term (case-insensitive)
  const filteredNavigationItems = searchTerm.trim()
    ? navigationItems.filter((item) => item.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : navigationItems
  const bottomItems = [
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/logout', label: 'Logout', icon: LogOut },
  ]

  const handleLogout = () => {
    navigate('/')
  }

  // Utility
  const getCurrentNav = () => {
    const current = navigationItems.find((item) => location.pathname.startsWith(item.path))
    return current || navigationItems[0]
  }

  const Icon = getCurrentNav().icon

  // Sidebar for mobile & desktop
  const sidebarNav = (
    <SidebarProvider>
      <div
        className={`flex flex-col ${isMobile ? 'h-screen' : 'h-full'} bg-white shadow-lg ${!isMobile && collapsed ? 'w-16' : 'w-64'} max-w-full transition-all duration-300`}
      >
        <SidebarHeader className="p-4">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <img
                src={clockkoLogo}
                alt="ClockKo Logo"
                className="w-30 h-8 transition-all duration-300"
              />
            )}
            {/* Desktop collapse toggle */}
            <button
              className="hidden md:block h-7 w-7 rounded hover:bg-gray-100"
              aria-label="Collapse sidebar"
              onClick={() => setCollapsed((prev) => !prev)}
            >
              <Menu className="h-5 w-5 text-gray-700" />
            </button>
            {/* Mobile close button */}
            <button
              className="block md:hidden h-7 w-7 rounded hover:bg-gray-100"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-3 flex-1">
          <SidebarMenu>
            {filteredNavigationItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname.startsWith(item.path)
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={
                      isActive
                        ? '!bg-lightBlue !text-blue1 border-r-2 border-blue-700'
                        : 'hover:bg-gray-50'
                    }
                    onClick={() => {
                      setMobileSidebarOpen(false)
                    }}
                  >
                    <Link to={item.path}>
                      <Icon className="h-5 w-5" />
                      {isMobile && !collapsed && <span className="ml-2">{item.label}</span>}
                      <span className="hidden md:block">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-3">
          <SidebarMenu>
            {bottomItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname.startsWith(item.path)
              if (item.path === '/logout') {
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={handleLogout}
                      className="hover:bg-gray-50 text-gray-700"
                    >
                      <Icon className="h-5 w-5" />
                      {isMobile && !collapsed && <span className="ml-2">{item.label}</span>}
                      <span className="hidden md:block">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              }
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={
                      isActive
                        ? '!bg-lightBlue !text-blue1 border-r-2 border-blue-700'
                        : 'hover:bg-gray-50'
                    }
                    onClick={() => setMobileSidebarOpen(false)}
                  >
                    <Link to={item.path}>
                      <Icon className="h-5 w-5" />
                      {isMobile && !collapsed && <span className="ml-2">{item.label}</span>}
                      <span className="hidden md:block">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarFooter>
      </div>
    </SidebarProvider>
  )

  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col w-full">
      {/* Topbar for mobile */}
      {isMobile && (
        <div className="w-full bg-white border-b flex items-center px-3 py-2">
          <button
            className="mr-2 h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6 text-gray-800" />
          </button>
          <div className="flex items-center justify-between flex-1">
            <div className="flex items-center gap-2 border-2 border-gray-200 px-12 py-2 rounded text-blue1 bg-lightBlue">
              {Icon && <Icon className="h-5 w-5" />}
              <span className="font-semibold text-base">{getCurrentNav().label}</span>
            </div>
            {/* topbar for desktop */}
            <div className="hidden md:block">
              {/* input search bar */}
              <input
                type="text"
                placeholder="Search..."
                className="border-2 border-gray-200 rounded px-4 py-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="text-gray-600 hover:text-gray-800">
                <Search className="h-5 w-5" />
              </button>
              {/* User can change avatar */}
              <label className={`cursor-pointer ${isProcessingAvatar ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="relative">
                  <img
                    src={avatarUrl}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-blue-400 transition duration-200"
                  />
                  {isProcessingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isProcessingAvatar}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleAvatarUpload(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar: desktop always, mobile as overlay */}
      <div className="flex-1 flex w-full min-h-0">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex flex-col">{sidebarNav}</div>
        {/* Mobile Sidebar Overlay */}
        {isMobile && mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close sidebar"
            />
            {/* Sidebar */}
            <div className="relative z-50 h-full">{sidebarNav}</div>
          </div>
        )}
        {/* Main Content */}
        <main className="flex-1 min-w-0 bg-powderBlue overflow-y-auto" style={{ maxHeight: '100vh' }}>
          {/* Desktop Topbar (inside Outlet area) */}
          {!isMobile && (
            <div className="flex items-center justify-between px-8 py-4 rounded-lg mb-6">
              <div className="flex-1 mx-8 relative">
                {/* input search bar */}
                <label htmlFor="search" className="sr-only"></label>
                {searchTerm === '' && (
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="text-gray-400" />
                  </span>
                )}

                <input
                  type="text"
                  placeholder="        Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-[60%] border-2 border-white bg-whitey shadow-md rounded-4xl px-4 py-2 focus:outline-none focus:border-blue-400"
                />
              </div>
              {/* avatar and user name section */}
              <div className="flex items-center gap-4">
                <label className={`cursor-pointer ${isProcessingAvatar ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="relative">
                    <img
                      src={avatarUrl}
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-blue-400 transition duration-200"
                    />
                    {isProcessingAvatar && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isProcessingAvatar}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleAvatarUpload(file);
                      }
                    }}
                  />
                </label>
                <span className="font-medium text-gray-700">
                  {userLoading ? 'Loading...' : user?.name || 'Guest'}
                </span>
              </div>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
