export type UserRole = 'admin' | 'comptable' | 'enseignant' | 'bibliothecaire' | 'parent' | 'eleve';

export interface User {
  id: number;
  etablissement_id: number;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  temp_password?: string | null;
}
