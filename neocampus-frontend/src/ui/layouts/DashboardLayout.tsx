import React, { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
  CreditCard,
  Coins,
  Banknote
} from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { NotificationBell } from '@/ui/components/NotificationBell'
import { ChatbotWidget } from '@/ui/components/ChatbotWidget'
import DevelopmentGate from '@/ui/components/DevelopmentGate'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'

// SaaS Overhaul imports
import { useBranchStore } from '@/application/stores/branchStore'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { axiosClient } from '@/infrastructure/api/axiosClient'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
const getNavItemsForRole = (role: UserRole, selectedChildId: string | null): NavCategory[] => {
  switch (role) {
    case 'parent':
      const childPrefix = selectedChildId ? `/parent/child/${selectedChildId}` : '/parent';
      return [
        {
          id: 'pedagogy',
          nameKey: 'pedagogy',
          icon: BookOpen,
          hasSubmenu: true,
          gridCols: 'grid-cols-2',
          items: [
            { nameKey: 'submenu_grades', path: `${childPrefix}/grades`, icon: GraduationCap },
            { nameKey: 'submenu_absence', path: `${childPrefix}/attendance`, icon: FileSpreadsheet },
            { nameKey: 'submenu_library', path: `${childPrefix}/library`, icon: BookOpen },
            { nameKey: 'submenu_bulletins', path: `${childPrefix}/bulletins`, icon: FileText },
          ]
        },
        { id: 'calendar', nameKey: 'calendar', icon: Calendar, hasSubmenu: false, path: `${childPrefix}/timetable` },
        { id: 'analytics', nameKey: 'analytics', icon: BarChart3, hasSubmenu: false, path: `${childPrefix}/balance` },
        { id: 'communication', nameKey: 'communication', icon: MessageSquare, hasSubmenu: false, path: '/chatbot' },
      ];
    case 'eleve':
      return [
        {
          id: 'pedagogy',
          nameKey: 'pedagogy',
          icon: BookOpen,
          hasSubmenu: true,
          gridCols: 'grid-cols-2',
          items: [
            { nameKey: 'submenu_grades', path: '/student/grades', icon: GraduationCap },
            { nameKey: 'submenu_absence', path: '/student/attendance', icon: FileSpreadsheet },
            { nameKey: 'submenu_library', path: '/student/library', icon: BookOpen },
            { nameKey: 'submenu_bulletins', path: '/bulletins', icon: FileText },
          ]
        },
        { id: 'calendar', nameKey: 'calendar', icon: Calendar, hasSubmenu: false, path: '/student/timetable' },
        { id: 'homework', nameKey: 'submenu_homework' as any, icon: BookOpen, hasSubmenu: false, path: '/student/homework' },
        { id: 'supports', nameKey: 'submenu_supports' as any, icon: FileText, hasSubmenu: false, path: '/student/supports' },
        { id: 'communication', nameKey: 'communication', icon: MessageSquare, hasSubmenu: false, path: '/chatbot' },
      ];
    case 'enseignant':
      return [
        { id: 'classes', nameKey: 'submenu_classes', icon: BookMarked, hasSubmenu: false, path: '/admin/classes' },
        { id: 'calendar', nameKey: 'calendar', icon: Calendar, hasSubmenu: false, path: '/timetable' },
        { id: 'exams', nameKey: 'submenu_exams', icon: FileText, hasSubmenu: false, path: '/teacher/exams' },
        { id: 'grades', nameKey: 'submenu_grades', icon: GraduationCap, hasSubmenu: false, path: '/grades' },
        { id: 'attendance', nameKey: 'submenu_absence', icon: FileSpreadsheet, hasSubmenu: false, path: '/attendance' },
        { id: 'bulletins', nameKey: 'submenu_bulletins', icon: FileText, hasSubmenu: false, path: '/bulletins' },
        { id: 'homework', nameKey: 'submenu_homework' as any, icon: BookOpen, hasSubmenu: false, path: '/teacher/homework' },
        { id: 'salaries', nameKey: 'submenu_salaries', icon: Coins, hasSubmenu: false, path: '/teacher/salaires' },
        { id: 'communication', nameKey: 'communication', icon: MessageSquare, hasSubmenu: false, path: '/chatbot' },
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
            { nameKey: 'submenu_bulletins', path: '/bulletins', icon: FileText },
          ]
        },
        {
          id: 'library',
          nameKey: 'submenu_library',
          icon: BookMarked,
          hasSubmenu: true,
          gridCols: 'grid-cols-3',
          items: [
            { nameKey: 'library_dashboard', path: '/library/dashboard', icon: BarChart3 },
            { nameKey: 'library_books', path: '/library/books', icon: BookOpen },
            { nameKey: 'library_loans', path: '/library/loans', icon: BookMarked },
            { nameKey: 'library_members', path: '/library/members', icon: Users },
            { nameKey: 'library_fines', path: '/library/fines', icon: CreditCard },
            { nameKey: 'library_analytics', path: '/library/analytics', icon: BarChart3 },
            { nameKey: 'library_settings', path: '/library/settings', icon: Settings },
          ]
        },
        {
          id: 'finance',
          nameKey: 'submenu_finance',
          icon: CreditCard,
          hasSubmenu: true,
          gridCols: 'grid-cols-2',
          items: [
            { nameKey: 'revenues_expenses', path: '/finance/salaires', icon: Banknote },
            { nameKey: 'fees_setup', path: '/finance/fees', icon: Coins },
            { nameKey: 'collections_record', path: '/finance/payments', icon: CreditCard },
            { nameKey: 'balances_reports', path: '/finance/reports', icon: BarChart3 },
          ]
        },
        { id: 'communication', nameKey: 'communication', icon: MessageSquare, hasSubmenu: false, path: '/chatbot' },
        { id: 'transport', nameKey: 'transport', icon: Bus, hasSubmenu: false, path: '/transport' },
      ];
    case 'comptable':
      return [
        { id: 'frais', nameKey: 'fees_setup', icon: Coins, hasSubmenu: false, path: '/finance/fees' },
        { id: 'encaissements', nameKey: 'collections_record', icon: CreditCard, hasSubmenu: false, path: '/finance/payments' },
        { id: 'soldes', nameKey: 'balances_reports', icon: BarChart3, hasSubmenu: false, path: '/finance/reports' },
        { id: 'payouts', nameKey: 'revenues_expenses', icon: Banknote, hasSubmenu: false, path: '/finance/salaires' },
      ];
    case 'bibliothecaire':
      return [
        {
          id: 'library',
          nameKey: 'submenu_library',
          icon: BookMarked,
          hasSubmenu: true,
          gridCols: 'grid-cols-3',
          items: [
            { nameKey: 'library_dashboard', path: '/library/dashboard', icon: BarChart3 },
            { nameKey: 'library_books', path: '/library/books', icon: BookOpen },
            { nameKey: 'library_loans', path: '/library/loans', icon: BookMarked },
            { nameKey: 'library_members', path: '/library/members', icon: Users },
            { nameKey: 'library_fines', path: '/library/fines', icon: CreditCard },
            { nameKey: 'library_analytics', path: '/library/analytics', icon: BarChart3 },
            { nameKey: 'library_settings', path: '/library/settings', icon: Settings },
          ]
        }
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

  const [selectedChildId, setSelectedChildId] = useState<string | null>(localStorage.getItem('selected_child_id'))
  const [logoClicks, setLogoClicks] = useState(0)

  // SaaS Overhaul: Branch selection and Query invalidation
  const queryClient = useQueryClient()
  const { activeBranchId, setActiveBranch, setBranches, branches } = useBranchStore()

  // Fetch branches only if user is establishment admin
  const { data: fetchedBranches } = useQuery({
    queryKey: ['my-branches'],
    queryFn: async () => {
      const res = await axiosClient.get('/admin/branches')
      return res.data
    },
    enabled: user?.role === 'admin',
  })

  // Synchronize store branches
  useEffect(() => {
    if (fetchedBranches) {
      setBranches(fetchedBranches)
      if (!activeBranchId && fetchedBranches.length > 0) {
        setActiveBranch(fetchedBranches[0].id.toString())
      }
    }
  }, [fetchedBranches, activeBranchId, setBranches, setActiveBranch])

  const handleBranchChange = (branchId: string) => {
    setActiveBranch(branchId)
    // Smoothly reload queries
    queryClient.invalidateQueries()
  }

  // Etablissement details
  const activeUser = user
  const etablissement = activeUser?.etablissement
  const planTier = etablissement?.plan_tier ?? 'free'
  const subStatus = etablissement?.subscription_status ?? 'trialing'

  useEffect(() => {
    const handleChildChanged = () => {
      setSelectedChildId(localStorage.getItem('selected_child_id'))
    }
    window.addEventListener('childChanged', handleChildChanged)
    return () => window.removeEventListener('childChanged', handleChildChanged)
  }, [])

  if (!user) return null

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Get items list for current user role
  const roleNavItems = getNavItemsForRole(user.role, selectedChildId)

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
        
        {/* Amber Warning Header Alert for past_due */}
        {subStatus === 'past_due' && (
          <div className="bg-amber-500 text-black py-2.5 px-4 mb-4 rounded-xl font-bold text-xs flex items-center justify-between shadow-sm animate-pulse shrink-0">
            <span>⚠️ Warning: Your subscription payment failed. Please resolve the issue to avoid service interruption.</span>
            <Link to="/settings/billing" className="underline font-black hover:text-neutral-800 ml-2">Resolve Account</Link>
          </div>
        )}

        {/* Red Full-screen Restrictor Modal for canceled */}
        {subStatus === 'canceled' && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-6 text-white text-center">
            <div className="max-w-md space-y-6">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto text-white text-2xl font-bold">
                ✕
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight">RESTRICTED ACCESS — SUBSCRIPTION CANCELED</h2>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Access to your institution has been suspended due to payment failure. Please resolve the issue to restore access to your data.
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={async () => {
                    const res = await axiosClient.get('/billing/portal')
                    if (res.data?.url) {
                      window.location.href = res.data.url
                    }
                  }}
                  className="bg-[#d0f137] text-black font-extrabold hover:bg-[#b8d62c] rounded-xl py-6 cursor-pointer"
                >
                  Access Stripe Portal
                </Button>
                <button 
                  onClick={handleLogout}
                  className="text-xs text-red-400 hover:text-red-300 underline font-semibold mt-2 cursor-pointer border-none bg-transparent"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Header widgets (Scrolls with page, normal block flow, h-16) */}
        <div className="w-full h-16 flex items-center justify-between shrink-0 mb-6 bg-transparent z-30">
          <div className="flex items-center gap-4">
            {/* School Name: All caps, tracking-wider, font-black, larger (text-base) */}
            <h2 
              onClick={() => {
                setLogoClicks(prev => {
                  const next = prev + 1
                  if (next >= 5) {
                    navigate('/dev-control')
                    return 0
                  }
                  return next
                })
              }}
              className="text-base font-black text-neutral-900 tracking-wider uppercase cursor-pointer select-none shrink-0"
            >
              {etablissement?.nom ?? 'GROUPE SCOLAIRE EMSI'}
            </h2>

            {/* Branch Switcher (only for establishment admin role: 'admin') */}
            {user.role === 'admin' && branches.length > 0 && (
              <div className="flex items-center gap-2">
                <Select value={activeBranchId || ''} onValueChange={handleBranchChange}>
                  <SelectTrigger className="w-48 h-8 text-xs font-extrabold rounded-xl bg-white border border-neutral-100 shadow-sm cursor-pointer focus:outline-none">
                    <SelectValue placeholder="Select a branch" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-neutral-100">
                    {branches.map(b => (
                      <SelectItem key={b.id} value={b.id.toString()} className="text-xs font-bold cursor-pointer">
                        {b.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {activeBranchId && (
                  <Badge className="bg-[#d0f137] text-black font-extrabold text-[9px] tracking-tight border-none py-1">
                    {branches.find(b => b.id.toString() === activeBranchId)?.nom ?? 'Branch'}
                  </Badge>
                )}
              </div>
            )}
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
            <NotificationBell />

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
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="h-full"
              >
                <DevelopmentGate />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
      <ChatbotWidget />
    </div>
  )
}

export default DashboardLayout;
