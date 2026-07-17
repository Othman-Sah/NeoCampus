export type UserRole = 'admin' | 'comptable' | 'enseignant' | 'bibliothecaire' | 'parent' | 'eleve' | 'chauffeur' | 'super-admin';

export interface User {
  id: number;
  etablissement_id: number;
  succursale_id?: number | null;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  temp_password?: string | null;
  etablissement?: {
    id: number;
    nom: string;
    plan_tier: 'free' | 'basic' | 'premium' | 'enterprise';
    subscription_status: string;
    trial_ends_at?: string | null;
    subscription_ends_at?: string | null;
  } | null;
}
