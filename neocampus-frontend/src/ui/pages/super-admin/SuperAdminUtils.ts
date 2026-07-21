import { PlanTier } from '@/infrastructure/api/superAdminApiService'

export const planPrice: Record<PlanTier, number> = {
  free: 0,
  basic: 49,
  premium: 99,
  enterprise: 199,
}

export const formatDate = (value?: string | null) => {
  if (!value) return 'Never'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
}

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) return

  const headers = Object.keys(data[0])
  const csvRows = []

  csvRows.push(headers.join(','))

  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header]
      const escaped = ('' + (val ?? '')).replace(/"/g, '\\"')
      return `"${escaped}"`
    })
    csvRows.push(values.join(','))
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
