export interface Vehicle {
  id: number;
  matricule: string;
  marque: string;
  modele: string | null;
  capacite: number;
  statut: 'actif' | 'maintenance' | 'hors_service';
  annee_mise_en_service: number | null;
  driver_count?: number;
  route_count?: number;
  created_at: string;
}
