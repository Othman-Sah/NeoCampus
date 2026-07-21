import React from 'react'
import { Badge } from '@/components/ui/badge'
import { PlanTier, SubscriptionStatus } from '@/infrastructure/api/superAdminApiService'

export const PlanBadge: React.FC<{ plan: PlanTier }> = ({ plan }) => (
  <Badge
    className={
      plan === 'enterprise'
        ? 'bg-purple-100 text-purple-800 border border-purple-200 uppercase text-[10px] font-black'
        : plan === 'premium'
          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase text-[10px] font-black'
          : plan === 'basic'
            ? 'bg-blue-100 text-blue-800 border border-blue-200 uppercase text-[10px] font-black'
            : 'bg-neutral-100 text-neutral-800 uppercase text-[10px] font-black'
    }
  >
    {plan}
  </Badge>
)

export const StatusBadge: React.FC<{ status: SubscriptionStatus }> = ({ status }) => (
  <Badge
    className={
      status === 'active'
        ? 'bg-green-100 text-green-800 capitalize text-[10px] font-bold'
        : status === 'trialing'
          ? 'bg-yellow-100 text-yellow-800 capitalize text-[10px] font-bold'
          : status === 'past_due'
            ? 'bg-amber-100 text-amber-800 capitalize text-[10px] font-bold'
            : 'bg-red-100 text-red-800 capitalize text-[10px] font-bold'
    }
  >
    {status.replace('_', ' ')}
  </Badge>
)

export const EmptyState: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-8 text-center">
    <p className="text-sm font-black text-neutral-900">{title}</p>
    <p className="mt-1 text-xs text-neutral-500">{description}</p>
  </div>
)
