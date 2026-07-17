import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosClient } from '@/infrastructure/api/axiosClient'
import { useAuthStore } from '@/application/stores/authStore'
import { 
  CreditCard, 
  Check, 
  HelpCircle, 
  AlertTriangle, 
  ArrowRightRight, 
  Download, 
  Sparkles,
  Building 
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useTranslation } from '@/application/useCases/useTranslation'

export const BillingPage: React.FC = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const { t } = useTranslation()

  // Get freshest establishment/user details
  const { data: profileData } = useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      const res = await axiosClient.get('/auth/me')
      return res.data
    }
  })

  // Mutate checkout session
  const checkoutMutation = useMutation({
    mutationFn: async (planTier: string) => {
      const res = await axiosClient.post('/billing/checkout', { plan_tier: planTier })
      return res.data
    },
    onSuccess: (data) => {
      // Redirect to mock Stripe Checkout session URL
      if (data?.url) {
        window.location.href = data.url
      }
    }
  })

  // Mutate billing portal redirect
  const portalMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosClient.get('/billing/portal')
      return res.data
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url
      }
    }
  })

  const activeUser = profileData?.user ?? user
  const etablissement = activeUser?.etablissement

  const planTier = etablissement?.plan_tier ?? 'free'
  const subStatus = etablissement?.subscription_status ?? 'trialing'
  const trialEndsAt = etablissement?.trial_ends_at
  const subscriptionEndsAt = etablissement?.subscription_ends_at

  // Standard pricing configuration in English
  const plans = [
    {
      tier: 'basic',
      name: 'Basic Plan',
      price: '49 €',
      period: '/month',
      description: 'Ideal for small single-campus schools.',
      features: [
        'Max 1 physical Branch',
        'Up to 200 active Students',
        'Grade reports & marks management',
        'Standard email support',
        'Automatic monthly backups',
      ],
      limits: 'Max 1 campus, 200 students',
      actionText: planTier === 'basic' ? 'Current Plan' : 'Select Basic',
      color: 'border-neutral-200 bg-white'
    },
    {
      tier: 'premium',
      name: 'Premium Plan',
      price: '99 €',
      period: '/month',
      description: 'Perfect for growing regional groups with multiple branches.',
      features: [
        'Up to 5 physical Branches',
        'Up to 1000 active Students',
        'Library & Catalog Module included',
        'School Transport Module included',
        '24/7 Priority support',
        'Weekly backups',
      ],
      limits: 'Max 5 campuses, 1000 students',
      actionText: planTier === 'premium' ? 'Current Plan' : 'Select Premium',
      popular: true,
      color: 'border-[#d0f137] bg-white ring-2 ring-[#d0f137]/35'
    },
    {
      tier: 'enterprise',
      name: 'Enterprise Plan',
      price: '199 €',
      period: '/month',
      description: 'Unlimited capabilities for national school networks.',
      features: [
        'Unlimited physical Branches',
        'Unlimited active Students',
        'All standard & premium modules',
        'Custom report card generator',
        'Developer API access',
        'Real-time daily backups',
      ],
      limits: 'Unlimited campuses & students',
      actionText: planTier === 'enterprise' ? 'Current Plan' : 'Select Enterprise',
      color: 'border-neutral-200 bg-white'
    }
  ]

  // Mock Invoice history list
  const invoices = [
    { id: 'INV-2026-003', date: '07/01/2026', amount: '99.00 €', status: 'Paid', plan: 'Premium' },
    { id: 'INV-2026-002', date: '06/01/2026', amount: '99.00 €', status: 'Paid', plan: 'Premium' },
    { id: 'INV-2026-001', date: '05/01/2026', amount: '49.00 €', status: 'Paid', plan: 'Basic' },
  ]

  return (
    <div className="space-y-8 pb-10">
      {/* Alert Warning for past due */}
      {subStatus === 'past_due' && (
        <Alert variant="destructive" className="border-amber-500 bg-amber-50 text-amber-900 rounded-2xl p-4">
          <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0" />
          <div className="ml-2">
            <AlertTitle className="font-extrabold text-sm uppercase">Payment Failed / Overdue</AlertTitle>
            <AlertDescription className="text-xs text-amber-800">
              Your latest subscription payment failed. Please update your payment method in the Stripe Customer Portal to avoid account suspension.
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">SUBSCRIPTION & BILLING</h1>
          <p className="text-neutral-500 text-sm">Manage branch licenses, payment details, and invoice history.</p>
        </div>

        <Button 
          onClick={() => portalMutation.mutate()}
          disabled={portalMutation.isPending}
          className="bg-black text-white hover:bg-neutral-900 rounded-xl cursor-pointer"
        >
          {portalMutation.isPending ? 'Loading...' : 'Stripe Customer Portal'}
        </Button>
      </div>

      {/* Subscription Summary */}
      <Card className="border border-neutral-100 rounded-2xl shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-neutral-50/50 border-b border-neutral-100/50">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-base font-black">LICENSE SUMMARY</CardTitle>
              <CardDescription className="text-xs">Details of your active contract.</CardDescription>
            </div>
            <Badge className="bg-[#d0f137] text-black font-extrabold px-3 py-1 text-xs capitalize">
              {planTier} Plan
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-xs text-neutral-450 uppercase font-bold">Subscription Status</p>
            <p className="text-sm font-extrabold text-neutral-900 capitalize flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${subStatus === 'active' || subStatus === 'trialing' ? 'bg-green-500' : 'bg-red-500'}`} />
              {subStatus === 'trialing' ? 'Free Trial' : subStatus}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-neutral-450 uppercase font-bold">Renewal / Expiry Date</p>
            <p className="text-sm font-extrabold text-neutral-900">
              {subscriptionEndsAt ? new Date(subscriptionEndsAt).toLocaleDateString() : trialEndsAt ? new Date(trialEndsAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-neutral-450 uppercase font-bold">Billed to</p>
            <p className="text-sm font-extrabold text-neutral-900">
              {etablissement?.nom ?? 'Your School'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Plan Pricing selection */}
      <div>
        <h2 className="text-lg font-black tracking-tight text-neutral-900 mb-6 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#d0f137]" />
          UPGRADE OR MODIFY PLAN
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isCurrent = planTier === p.tier
            return (
              <Card key={p.tier} className={`flex flex-col rounded-3xl shadow-sm border ${p.color} relative overflow-hidden transition duration-200 hover:shadow-md`}>
                {p.popular && (
                  <div className="absolute top-3 right-3 bg-black text-[#d0f137] font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Popular
                  </div>
                )}
                <CardHeader className="pb-4">
                  <p className="text-xs font-black uppercase text-neutral-400 tracking-widest">{p.name}</p>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-black tracking-tight text-neutral-900">{p.price}</span>
                    <span className="text-xs text-neutral-450 font-bold">{p.period}</span>
                  </div>
                  <CardDescription className="text-xs text-neutral-500 mt-2 leading-relaxed">{p.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-6 space-y-4 border-t border-neutral-50 pt-4">
                  <p className="text-[10px] font-black text-neutral-450 uppercase tracking-wider">Plan Limits</p>
                  <p className="text-xs font-bold text-neutral-800 bg-neutral-50 p-2 rounded-xl flex items-center gap-2">
                    <Building className="h-4 w-4 text-neutral-450 shrink-0" />
                    {p.limits}
                  </p>
                  <ul className="space-y-2.5 text-xs text-neutral-650 pt-2">
                    {p.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[#d0f137] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-2 pb-6">
                  <Button 
                    disabled={isCurrent || checkoutMutation.isPending}
                    onClick={() => checkoutMutation.mutate(p.tier)}
                    className={`w-full font-extrabold rounded-xl py-5 text-xs border cursor-pointer ${
                      isCurrent 
                        ? 'bg-neutral-100 text-neutral-450 border-neutral-200 hover:bg-neutral-100' 
                        : 'bg-[#d0f137] text-black border-[#d0f137] hover:bg-[#b8d62c] shadow-sm'
                    }`}
                  >
                    {isCurrent ? 'Current Plan' : checkoutMutation.isPending ? 'Loading...' : 'Subscribe'}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Invoice History */}
      <Card className="border border-neutral-100 rounded-2xl shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-base font-black">TRANSACTION HISTORY</CardTitle>
          <CardDescription className="text-xs">View and download your Stripe payment receipts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-400 font-bold uppercase text-[10px] tracking-wider bg-neutral-50/50">
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Billing Date</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Download</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-neutral-100 hover:bg-neutral-50/30 transition">
                    <td className="py-3 px-4 font-mono font-bold">{inv.id}</td>
                    <td className="py-3 px-4 text-neutral-500">{inv.date}</td>
                    <td className="py-3 px-4 text-neutral-900 font-bold">{inv.plan}</td>
                    <td className="py-3 px-4 font-black">{inv.amount}</td>
                    <td className="py-3 px-4">
                      <Badge className="bg-green-100 text-green-800 font-bold text-[10px]">
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 cursor-pointer">
                        <Download className="h-4 w-4 text-neutral-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
export default BillingPage;
