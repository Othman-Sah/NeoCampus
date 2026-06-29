import React from 'react'
import { useLocation } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const PlaceholderPage: React.FC = () => {
  const location = useLocation()
  const pageName = location.pathname.split('/').filter(Boolean).pop() || 'Tableau de bord'
  const title = pageName.charAt(0).toUpperCase() + pageName.slice(1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
      </div>
      <Card className="bg-slate-900 border-slate-800 text-slate-100">
        <CardHeader>
          <CardTitle>Module en cours de développement</CardTitle>
          <CardDescription className="text-slate-400">
            Chemin d'accès : {location.pathname}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300">
            Ce module fait partie du plan de développement de 2 semaines pour la plateforme NeoCampus. 
            Le squelette d'architecture hexagonale est en place et prêt à recevoir la logique de domaine.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default PlaceholderPage;
