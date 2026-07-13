import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useStudent } from '@/application/useCases/useStudent'
import { useOverviewStats } from '@/application/useCases/admin/useStatistics'
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  CreditCard, 
  BookMarked, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react'

interface UserRoleCardProps {
  title: string;
  count: React.ReactNode;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  link: string;
}

const UserRoleCard: React.FC<UserRoleCardProps> = ({
  title,
  count,
  description,
  icon: Icon,
  link,
}) => {
  return (
    <Link to={link} className="block group">
      <Card className="relative overflow-hidden bg-white border border-[#e5e7eb] hover:border-neutral-400 transition-all duration-200 rounded-2xl shadow-sm group-hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 rounded-xl bg-[#f9f9f9] border border-[#e5e7eb] text-black">
              <Icon className="h-5 w-5 text-black group-hover:scale-105 transition-transform duration-200" />
            </div>
            <div className="text-2xl font-black text-neutral-900 tracking-tight leading-none">
              {count}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                {title}
              </h3>
              <ArrowRight className="h-3 w-3 text-neutral-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
            </div>
            <p className="text-[11px] text-neutral-500 font-medium leading-normal">
              {description}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}



export const UserHubPage: React.FC = () => {
  const { students } = useStudent()
  const { data: overview, isLoading } = useOverviewStats()

  const renderCount = (key: keyof typeof overview | 'students') => {
    if (isLoading) {
      return <Skeleton className="h-6 w-10 rounded animate-pulse" />
    }
    if (!overview) {
      if (key === 'students') return students.length;
      return 0;
    }
    if (key === 'students') return overview.total_eleves;
    if (key === 'teachers') return overview.total_enseignants;
    if (key === 'parents') return overview.total_parents ?? 0;
    if (key === 'accountants') return overview.total_comptables ?? 0;
    if (key === 'librarians') return overview.total_bibliothecaires ?? 0;
    if (key === 'admins') return overview.total_admins ?? 0;
    return 0;
  }

  const userRoles = [
    {
      title: 'Students',
      count: renderCount('students'),
      description: 'Manage student profiles, enrollments, class structures and academic folders',
      icon: GraduationCap,
      link: '/admin/students',
    },
    {
      title: 'Teachers',
      count: renderCount('teachers'),
      description: 'Manage faculty specialties, course workloads and class schedules',
      icon: BookOpen,
      link: '/admin/teachers',
    },
    {
      title: 'Parents',
      count: renderCount('parents'),
      description: 'Manage guardian contacts, link siblings and parent communication details',
      icon: Users,
      link: '/admin/parents',
    },
    {
      title: 'Accountants',
      count: renderCount('accountants'),
      description: 'Manage finance managers, cash collections and accounting reports',
      icon: CreditCard,
      link: '/admin/accountants',
    },
    {
      title: 'Librarians',
      count: renderCount('librarians'),
      description: 'Manage librarians, physical catalog issues, and overdue lists',
      icon: BookMarked,
      link: '/library',
    },
    {
      title: 'Administrators',
      count: renderCount('admins'),
      description: 'Supervise general system settings, tenants profiles and site administrators',
      icon: ShieldAlert,
      link: '/admin/settings',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in text-neutral-900">
      <div>
        <h1 className="text-xl font-bold tracking-wider uppercase text-neutral-900 mb-1">
          Users Directory
        </h1>
        <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
          Select the user type to manage directory profiles
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {userRoles.map((role, idx) => (
          <UserRoleCard
            key={idx}
            title={role.title}
            count={role.count}
            description={role.description}
            icon={role.icon}
            link={role.link}
          />
        ))}
      </div>
    </div>
  )
}

export default UserHubPage
