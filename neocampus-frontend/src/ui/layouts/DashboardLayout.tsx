import React from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/application/stores/authStore'
import { useTranslation } from '@/application/useCases/useTranslation'
import { TranslationKey } from '@/application/utils/translations'
import { UserRole } from '@/domain/entities/User'
import { 
  Users, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  MessageSquare, 
  Bus, 
  Settings, 
  LogOut, 
  Bell, 
  User as UserIcon,
  BookMarked,
  FileSpreadsheet,
  GraduationCap,
  CalendarDays,
  Languages,
  PenTool,
  FileText,
  TrendingUp,
  CreditCard
} from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'

interface SubMenuItem {
  nameKey: TranslationKey;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavCategory {
  id: string;
  nameKey: TranslationKey;
  icon: React.ComponentType<{ className?: string }>;
  hasSubmenu: boolean;
  gridCols?: string;
  items?: SubMenuItem[];
  path?: string; // used when hasSubmenu is false
}

// Helper to generate role-specific navigation list using keys
const getNavItemsForRole = (role: UserRole): NavCategory[] => {
  switch (role) {
    case 'parent':
      return [
        {
          id: 'pedagogy',
          nameKey: 'pedagogy',
          icon: BookOpen,
          hasSubmenu: true,
          gridCols: 'grid-cols-3',
          items: [
            { nameKey: 'submenu_grades', path: '/grades', icon: GraduationCap },
            { nameKey: 'submenu_absence', path: '/attendance', icon: FileSpreadsheet },
            { nameKey: 'submenu_library', path: '/library', icon: BookOpen },
          ]
        },
        { id: 'calendar', nameKey: 'calendar', icon: Calendar, hasSubmenu: false, path: '/timetable' },
        { id: 'analytics', nameKey: 'analytics', icon: BarChart3, hasSubmenu: false, path: '/finance' },
        { id: 'communication', nameKey: 'communication', icon: MessageSquare, hasSubmenu: false, path: '/chatbot' },
        { id: 'transport', nameKey: 'transport', icon: Bus, hasSubmenu: false, path: '/transport' },
      ];
    case 'eleve':
      return [
        {
          id: 'pedagogy',
          nameKey: 'pedagogy',
          icon: BookOpen,
          hasSubmenu: true,
          gridCols: 'grid-cols-3',
          items: [
            { nameKey: 'submenu_grades', path: '/grades', icon: GraduationCap },
            { nameKey: 'submenu_absence', path: '/attendance', icon: FileSpreadsheet },
            { nameKey: 'submenu_library', path: '/library', icon: BookOpen },
          ]
        },
        { id: 'calendar', nameKey: 'calendar', icon: Calendar, hasSubmenu: false, path: '/timetable' },
        { id: 'analytics', nameKey: 'analytics', icon: BarChart3, hasSubmenu: false, path: '/finance' },
        { id: 'communication', nameKey: 'communication', icon: MessageSquare, hasSubmenu: false, path: '/chatbot' },
        { id: 'transport', nameKey: 'transport', icon: Bus, hasSubmenu: false, path: '/transport' },
      ];
    case 'enseignant':
      return [
        {
          id: 'pedagogy',
          nameKey: 'pedagogy',
          icon: BookOpen,
          hasSubmenu: true,
          gridCols: 'grid-cols-3',
          items: [
            { nameKey: 'submenu_classes', path: '/admin/classes', icon: BookMarked },
            { nameKey: 'submenu_timetable', path: '/timetable', icon: CalendarDays },
            { nameKey: 'submenu_grades', path: '/grades', icon: GraduationCap },
            { nameKey: 'submenu_absence', path: '/attendance', icon: FileSpreadsheet },
            { nameKey: 'submenu_salaries', path: '/teacher/salaires', icon: FileText },
          ]
        },
        { id: 'calendar', nameKey: 'calendar', icon: Calendar, hasSubmenu: false, path: '/timetable' },
        { id: 'communication', nameKey: 'announce', icon: PenTool, hasSubmenu: false, path: '/announcements' },
      ];
    case 'admin':
      return [
        { id: 'users', nameKey: 'users', icon: Users, hasSubmenu: false, path: '/admin/users' },
        {
          id: 'pedagogy',
          nameKey: 'pedagogy',
          icon: BookOpen,
          hasSubmenu: true,
          gridCols: 'grid-cols-3',
          items: [
            { nameKey: 'submenu_classes', path: '/admin/classes', icon: BookMarked },
            { nameKey: 'submenu_exams', path: '/admin/exams', icon: FileText },
            { nameKey: 'submenu_timetable', path: '/timetable', icon: CalendarDays },
            { nameKey: 'submenu_grades', path: '/grades', icon: GraduationCap },
            { nameKey: 'submenu_absence', path: '/attendance', icon: FileSpreadsheet },
            { nameKey: 'submenu_library', path: '/library', icon: BookOpen },
          ]
        },
        { id: 'analytics', nameKey: 'submenu_salaries', icon: CreditCard, hasSubmenu: false, path: '/finance/salaires' },
        { id: 'communication', nameKey: 'communication', icon: MessageSquare, hasSubmenu: false, path: '/chatbot' },
        { id: 'transport', nameKey: 'transport', icon: Bus, hasSubmenu: false, path: '/transport' },
      ];
    case 'comptable':
      return [
        { id: 'frais', nameKey: 'fees_setup', icon: Settings, hasSubmenu: false, path: '/finance/fees' },
        { id: 'encaissements', nameKey: 'collections_record', icon: CreditCard, hasSubmenu: false, path: '/finance/payments' },
        { id: 'salaires', nameKey: 'submenu_salaries', icon: CreditCard, hasSubmenu: false, path: '/finance/salaires' },
        { id: 'soldes', nameKey: 'balances_reports', icon: FileText, hasSubmenu: false, path: '/finance/reports' },
        { id: 'recettes', nameKey: 'revenues_expenses', icon: TrendingUp, hasSubmenu: false, path: '/finance/accounting' },
      ];
    default:
      return [];
  }
}

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuthStore()
  const { t, setLanguage } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  if (!user) return null

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Get items list for current user role
  const roleNavItems = getNavItemsForRole(user.role)

  // Find if category or subitem is active
  const isCategoryActive = (category: NavCategory) => {
    if (!category.hasSubmenu) {
      return location.pathname === category.path
    }
    return category.items?.some(item => location.pathname === item.path) ?? false
  }

  const isSubItemActive = (path: string) => {
    return location.pathname === path
  }

  // Generate breadcrumbs from location path
  const pathParts = location.pathname.split('/').filter(Boolean)
  const breadcrumbs = pathParts.map((part, index) => {
    const url = `/${pathParts.slice(0, index + 1).join('/')}`
    const name = part.charAt(0).toUpperCase() + part.slice(1)
    return { name, url }
  })

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-neutral-900 flex overflow-hidden font-sans">
      
      {/* Floating Pill Sidebar (Styled exactly to NavMenu.html) */}
      <nav className="fixed left-4 top-1/2 -translate-y-1/2 h-[80vh] w-16 rounded-full py-6 bg-[#0A0A0A] flex flex-col items-center justify-between z-50 shadow-lg">
        
        {/* Logo area */}
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black font-black text-sm mb-2 shadow-sm shrink-0">
          NC
        </div>

        {/* Navigation items container */}
        <div className="flex-1 flex flex-col items-center justify-center gap-5 w-full">
          {roleNavItems.map((category) => {
            const Icon = category.icon
            const active = isCategoryActive(category)

            if (category.hasSubmenu) {
              return (
                <div key={category.id} className="relative w-full flex justify-center nav-item-group">
                  {/* Category Trigger Button */}
                  <button 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                      active 
                        ? 'bg-[#d0f137] text-black scale-105 shadow-sm' 
                        : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </button>

                  {/* Popout Submenu (Pill rounded-[32px] matching NavMenu.html) */}
                  <div className="sub-menu absolute left-14 top-1/2 ml-2 w-64 bg-white border border-[#E5E7EB] rounded-[32px] z-40 shadow-lg p-3 text-black">
                    <div className="p-1 flex flex-col">
                      <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-450 mb-2 border-b border-neutral-50 text-neutral-400">
                        {t(category.nameKey)}
                      </div>

                      <div className={`grid ${category.gridCols ?? 'grid-cols-2'} gap-2 p-1`}>
                        {category.items?.map((item) => {
                          const SubIcon = item.icon
                          const subActive = isSubItemActive(item.path)
                          return (
                            <Link
                              key={item.nameKey}
                              to={item.path}
                              className={`flex flex-col items-center justify-center p-3 rounded-xl transition text-center relative group/sub ${
                                subActive
                                  ? 'bg-black text-[#d0f137]'
                                  : 'text-neutral-800 hover:bg-neutral-50'
                              }`}
                            >
                              <SubIcon className="h-5 w-5 mb-1.5 shrink-0" />
                              {/* Smaller text to fit all items cleanly */}
                              <span className="text-[9px] font-extrabold tracking-tight uppercase truncate max-w-full leading-none">
                                {t(item.nameKey)}
                              </span>
                              {subActive && (
                                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#d0f137]" />
                              )}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            } else {
              // Flat Item (No submenu)
              return (
                <div key={category.id} className="relative w-full flex justify-center nav-item-group">
                  <Link 
                    to={category.path ?? '/dashboard'}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                      active 
                        ? 'bg-[#d0f137] text-black scale-105 shadow-sm' 
                        : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                </div>
              )
            }
          })}
        </div>

        {/* Configuration settings and Logout at bottom - NO SUBMENUS */}
        <div className="mt-auto pt-4 border-t border-neutral-800/30 flex flex-col items-center gap-3 w-full shrink-0">
          {/* Settings Flat Button */}
          <Link 
            to="/settings" 
            className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-800/50 hover:text-white transition cursor-pointer"
          >
            <Settings className="h-5 w-5" />
          </Link>
          
          {/* Logout Flat Button */}
          <button 
            onClick={handleLogout}
            className="w-10 h-10 rounded-full flex items-center justify-center text-red-500 hover:bg-red-950/20 transition cursor-pointer border-none"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Main Content Area (Scrolls naturally) */}
      <div className="flex-1 flex flex-col min-w-0 ml-28 h-screen overflow-y-auto bg-[#f9f9f9] px-8 pt-4 pb-8">
        
        {/* Top Header widgets (Scrolls with page, normal block flow, h-16) */}
        <div className="w-full h-16 flex items-center justify-between shrink-0 mb-6 bg-transparent z-30">
          <div className="flex items-center gap-4">
            {/* School Name: All caps, tracking-wider, font-black, larger (text-base) */}
            <h2 className="text-base font-black text-neutral-900 tracking-wider uppercase">
              GROUPE SCOLAIRE EMSI
            </h2>
          </div>

          {/* Action Tools & User Profile */}
          <div className="flex items-center gap-4">
            {/* Language Toggler */}
            <DropdownMenu>
              <DropdownMenuTrigger className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-50 hover:text-black transition focus:outline-none cursor-pointer">
                <Languages className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border border-neutral-100">
                <DropdownMenuItem onClick={() => setLanguage('fr')} className="text-xs font-semibold cursor-pointer">
                  Français (FR)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')} className="text-xs font-semibold cursor-pointer">
                  English (EN)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notification Bell */}
            <button className="w-9 h-9 flex items-center justify-center rounded-lg relative text-neutral-500 hover:bg-neutral-50 hover:text-black transition focus:outline-none cursor-pointer">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>

            <div className="h-5 w-px bg-neutral-200" />

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 hover:opacity-85 transition focus:outline-none cursor-pointer">
                <Avatar className="h-8 w-8 ring-2 ring-neutral-100">
                  {user.avatar && (
                    <AvatarImage
                      src={user.avatar}
                      alt={`${user.prenom} ${user.nom}`}
                    />
                  )}
                  <AvatarFallback className="bg-neutral-900 text-white text-xs font-bold uppercase">
                    {user.nom.charAt(0)}{user.prenom.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left shrink-0">
                  <p className="text-xs font-bold text-neutral-900 leading-tight">
                    {user.prenom} {user.nom}
                  </p>
                  <p className="text-[10px] text-neutral-400 leading-none capitalize">
                    {user.role}
                  </p>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border border-neutral-100 text-neutral-900">
                <DropdownMenuLabel className="text-xs font-bold">{t('my_account')}</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-neutral-50" />
                <DropdownMenuItem className="text-xs cursor-pointer focus:bg-neutral-50">
                  <UserIcon className="h-3.5 w-3.5 mr-2 inline" /> {t('profile')}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-neutral-50" />
                <DropdownMenuItem 
                  className="text-xs cursor-pointer text-red-600 focus:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-3.5 w-3.5 mr-2 inline" /> {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <main className="flex-1 flex flex-col min-h-0">
          
          {/* Breadcrumbs Navigation */}
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-6">
              <Link to="/dashboard" className="hover:text-black transition">{t('home')}</Link>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.url}>
                  <span>/</span>
                  {idx === breadcrumbs.length - 1 ? (
                    <span className="text-neutral-900">{crumb.name}</span>
                  ) : (
                    <Link to={crumb.url} className="hover:text-black transition">{crumb.name}</Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}

          {/* Render Route Pages */}
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout;
