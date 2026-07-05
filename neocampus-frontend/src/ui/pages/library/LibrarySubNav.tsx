import React from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from '@/application/useCases/useTranslation'
import { 
  LayoutDashboard, 
  BookOpen, 
  BookMarked, 
  Users, 
  Coins, 
  BarChart3, 
  Settings 
} from 'lucide-react'

export const LibrarySubNav: React.FC = () => {
  const { t } = useTranslation()

  const tabs = [
    { nameKey: 'library_dashboard', path: '/library/dashboard', icon: LayoutDashboard },
    { nameKey: 'library_books', path: '/library/books', icon: BookOpen },
    { nameKey: 'library_loans', path: '/library/loans', icon: BookMarked },
    { nameKey: 'library_members', path: '/library/members', icon: Users },
    { nameKey: 'library_fines', path: '/library/fines', icon: Coins },
    { nameKey: 'library_analytics', path: '/library/analytics', icon: BarChart3 },
    { nameKey: 'library_settings', path: '/library/settings', icon: Settings },
  ]

  return (
    <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-4 mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-black text-white shadow-sm font-black'
                  : 'bg-white text-neutral-500 hover:text-neutral-900 border border-neutral-200 hover:bg-neutral-50'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{t(tab.nameKey as any)}</span>
          </NavLink>
        )
      })}
    </div>
  )
}

export default LibrarySubNav
