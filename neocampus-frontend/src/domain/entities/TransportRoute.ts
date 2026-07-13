import { Vehicle } from './Vehicle';

export interface RouteStudent {
  eleve_id: number;
  nom: string;
  prenom: string;
  classe_nom: string;
  point_ramassage: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface TransportRoute {
  id: number;
  nom: string;
  zone: string;
  description: string | null;
  vehicule_id: number | null;
  vehicule?: Vehicle;
  heure_depart: string | null;
  heure_retour: string | null;
  statut: 'actif' | 'inactif';
  students?: RouteStudent[];
  student_count?: number;
  created_at: string;
}
