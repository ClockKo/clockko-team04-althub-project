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
  LogOut,
  X,
  ChevronLeft,
  Menu,
  Search,
  User,
  Link2,
  Sliders,
  Mail,
  Shield,
  Gift,
  HelpCircle,
  Flame,
  Settings,
  Brain,
} from 'lucide-react'
import clockkoLogo from '../../assets/images/frame1.png'
import { useIsMobile } from '../../hooks/use-mobile'
import { useAuth } from '../auth/authcontext'
import { SidebarProvider } from '../../components/ui/sidebar'
import { getAvatarUrl } from '../../utils/avatarUtils'

// Avatar Preview Modal Component
const AvatarPreviewModal = ({ isOpen, onClose, avatarUrl, userName }: { 
  isOpen: boolean; 
  onClose: () => void; 
  avatarUrl: string; 
  userName: string; 
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
        aria-label="Close avatar preview"
      />
      {/* Modal */}
      <div className="relative bg-white rounded-lg p-6 mx-4 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close preview"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="flex flex-col items-center">
          <img
            src={avatarUrl}
            alt={`${userName}'s avatar`}
            className="w-48 h-48 rounded-full border-4 border-gray-200 mb-4 object-cover"
          />
          <p className="text-gray-600 text-center">
            {userName}'s profile picture
          </p>
          <p className="text-sm text-gray-400 text-center mt-2">
            To change your avatar, visit your profile settings.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false)
  const { logout } = useAuth()

  const [searchTerm, setSearchTerm] = useState<string>('')
  // Sidebar mode: 'main' or 'settings'
  const [sidebarMode, setSidebarMode] = useState<'main' | 'settings'>('main')

  // Use the same user data hook as headerWidget
  const { data: user, isLoading: userLoading, error: userError } = useUserData()

  // No need to use localStorage for avatar, always use backend user data

  // Switch to settings mode if on /settings route
  useEffect(() => {
    if (location.pathname.startsWith('/settings')) {
      setSidebarMode('settings')
    } else {
      setSidebarMode('main')
    }
  }, [location.pathname])

  // Debug logging for mainLayout
  console.log('🔍 MainLayout - User data:', { user, userLoading, userError, userName: user?.name })
  console.log('🔍 MainLayout - Auth token exists:', !!localStorage.getItem('authToken'))

  // Avatar upload handler with image processing (delegated to ProfileSettings)

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tasks', label: 'Tasks', icon: ClipboardCheck },
    { path: '/time-tracker', label: 'Time Tracker', icon: Clock },
    { path: '/co-working', label: 'Co-working Rooms', icon: Building2 },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    { path: '/challenges', label: 'Challenges', icon: Gamepad2 },
    { path: '/smart-features', label: 'Smart Features', icon: Brain },
  ]

  // Settings sidebar sections and items with icons
  const settingsSections = [
    {
      header: 'Accounts',
      items: [
        { path: '/settings/profile', label: 'Profile', icon: User },
        { path: '/settings/integrations', label: 'Integrations', icon: Link2 },
        { path: '/settings/general', label: 'General', icon: Sliders },
      ],
    },
    {
      header: 'App Settings',
      items: [
        { path: '/settings/email', label: 'Email and Calendars', icon: Mail },
        { path: '/settings/security', label: 'Security', icon: Shield },
        { path: '/settings/whats-new', label: "What's new", icon: Flame },
        { path: '/settings/invite', label: 'Invite friends', icon: Gift },
        { path: '/settings/help', label: 'Help & feedback', icon: HelpCircle },
      ],
    },
  ]

  // Filter navigation items by search term (case-insensitive)
  const filteredNavigationItems = searchTerm.trim()
    ? navigationItems.filter((item) => item.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : navigationItems
  const mainBottomItems = [
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/logout', label: 'Logout', icon: LogOut },
  ]
  const settingsBottomItems = [{ path: '/logout', label: 'Logout', icon: LogOut }]

  const handleLogout = () => {
    logout()
    navigate('/signin')
  }

  // Sidebar navigation definition (moved outside handleLogout)
  const sidebarNav = (
    <SidebarProvider>
      <div
        className={`flex flex-col ${isMobile ? 'h-screen' : 'h-full'} bg-white shadow-lg ${!isMobile && collapsed ? 'w-16' : 'w-64'} max-w-full transition-all duration-300`}
      >
        <SidebarHeader className="p-4">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <Link to="/dashboard">
                <img
                  src={clockkoLogo}
                  alt="ClockKo Logo"
                  className="w-30 h-8 transition-all duration-300"
                />
              </Link>
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
          {/* Settings header with back button and icon */}
          {sidebarMode === 'settings' && (
            <div className="flex flex-col mt-4 mb-2">
              <div className="flex items-center">
                <button
                  className="mr-2 h-7 w-7 flex items-center justify-center rounded hover:bg-gray-100"
                  onClick={() => {
                    setSidebarMode('main')
                    navigate('/dashboard')
                  }}
                  aria-label="Back to main menu"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700" />
                </button>
                <span className="font-semibold text-lg">Settings</span>
              </div>
              <div className="border-b border-gray-200 mt-3" />
            </div>
          )}
        </SidebarHeader>
        <SidebarContent className="px-3 flex-1">
          <SidebarMenu>
            {sidebarMode === 'main'
              ? filteredNavigationItems.map((item) => {
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
                })
              : settingsSections.flatMap((section, idx) => [
                  // Section header
                  <div
                    key={section.header}
                    className={`pl-3 pt-4 pb-1 text-xs font-semibold text-gray-500 ${idx !== 0 ? 'mt-2' : ''}`}
                  >
                    {section.header}
                  </div>,
                  ...section.items.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path
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
                            <Icon className="h-5 w-5 mr-2" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  }),
                ])}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-3">
          <SidebarMenu>
            {(sidebarMode === 'main' ? mainBottomItems : settingsBottomItems).map((item) => {
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
                    <Link
                      to={item.path}
                      onClick={
                        item.path === '/settings'
                          ? (e) => {
                              e.preventDefault()
                              setSidebarMode('settings')
                              navigate('/settings/profile')
                              setMobileSidebarOpen(false)
                            }
                          : undefined
                      }
                    >
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

  // Helper for current nav (for mobile topbar)
  const getCurrentNav = () => {
    if (sidebarMode === 'settings') {
      return { label: 'Settings', icon: Settings }
    }
    const current = navigationItems.find((item) => location.pathname.startsWith(item.path))
    return current || navigationItems[0]
  }
  const Icon = getCurrentNav().icon

  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col w-full">
      {/* Avatar Preview Modal */}
      <AvatarPreviewModal
        isOpen={avatarPreviewOpen}
        onClose={() => setAvatarPreviewOpen(false)}
        avatarUrl={getAvatarUrl(user)}
        userName={user?.name || 'Guest'}
      />

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
              {/* User avatar - click to preview */}
              <button
                onClick={() => setAvatarPreviewOpen(true)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                aria-label="View profile picture"
              >
                <img
                  src={getAvatarUrl(user)}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-blue-400 transition duration-200"
                />
              </button>
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
        <main
          className="flex-1 min-w-0 bg-powderBlue overflow-y-auto"
          style={{ maxHeight: '100vh' }}
        >
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
                <button
                  onClick={() => setAvatarPreviewOpen(true)}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  aria-label="View profile picture"
                >
                  <img
                    src={getAvatarUrl(user)}
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-blue-400 transition duration-200"
                  />
                </button>
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
