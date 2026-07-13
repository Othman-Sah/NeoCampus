export interface CourseSupport {
  id: number;
  titre: string;
  description: string | null;
  fichier_url: string | null;
  type: 'document' | 'video' | 'link' | 'image';
  matiere_nom: string;
  enseignant_nom: string;
  created_at: string;
}
