export interface ParametresExamen {
  id?: number;
  etablissement_id: number;
  periode_saisie_notes_debut: string;
  periode_saisie_notes_fin: string;
  force_admin_schedule: boolean;
  template_sujet_path?: string | null;
  require_sujet_upload: boolean;
}
