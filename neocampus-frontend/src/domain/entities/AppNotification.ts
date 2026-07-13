export interface AppNotification {
  id: number;
  etablissement_id: number;
  target_user_id: number;
  type: 'annonce' | 'transport' | 'note' | 'presence' | 'paiement' | 'systeme';
  titre: string;
  contenu: string;
  link: string | null;
  is_read: boolean;
  date_envoi: string;
  relative_time?: string;
  created_at: string;
}
