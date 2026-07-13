export interface StudentDashboardData {
  today_schedule: Array<{
    heure_debut: string;
    heure_fin: string;
    matiere_nom: string;
    enseignant_nom: string;
  }>;
  recent_grades: Array<{
    matiere: string;
    valeur: number;
    date: string;
  }>;
  pending_homework: Array<{
    titre: string;
    matiere_nom: string;
    date_echeance: string;
    days_remaining: number;
  }>;
  stats: {
    attendance_rate: number;
    overall_average: number | null;
    unread_announcements: number;
  };
}
