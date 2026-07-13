export interface ChildGrade {
  matiere: string;
  examen: string;
  valeur: number | null;
  date: string;
  coefficient: number;
  classe_average?: number;
}
