import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { useStudent } from '@/application/useCases/useStudent'
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
  count: number;
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
            <span className="text-2xl font-black text-neutral-900 tracking-tight leading-none">
              {count}
            </span>
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

  const userRoles = [
    {
      title: 'Students',
      count: students.length,
      description: 'Manage student profiles, enrollments, class structures and academic folders',
      icon: GraduationCap,
      link: '/admin/students',
    },
    {
      title: 'Teachers',
      count: 42,
      description: 'Manage faculty specialties, course workloads and class schedules',
      icon: BookOpen,
      link: '/admin/teachers',
    },
    {
      title: 'Parents',
      count: 512,
      description: 'Manage guardian contacts, link siblings and parent communication details',
      icon: Users,
      link: '/admin/parents',
    },
    {
      title: 'Accountants',
      count: 3,
      description: 'Manage finance managers, cash collections and accounting reports',
      icon: CreditCard,
      link: '/admin/accountants',
    },
    {
      title: 'Librarians',
      count: 2,
      description: 'Manage librarians, physical catalog issues, and overdue lists',
      icon: BookMarked,
      link: '/library',
    },
    {
      title: 'Administrators',
      count: 4,
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
