export interface AnnouncementAuthor {
  id: number;
  nom: string;
  prenom: string;
  avatar: string | null;
}

export interface Announcement {
  id: number;
  etablissement_id: number;
  user_id: number;
  titre: string;
  contenu: string;
  extrait: string | null;
  target_roles: string[];
  is_pinned: boolean;
  published_at: string | null;
  created_at: string;
  author?: AnnouncementAuthor | null;
}
