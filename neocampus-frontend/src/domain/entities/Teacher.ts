import { User } from './User';

export interface TeacherAssignment {
  classe_id: number;
  classe_nom?: string;
  niveau?: string;
  matiere_id: number;
  matiere_nom?: string;
}

export interface Teacher {
  id: number;
  user_id?: number | null;
  specialite: string;
  salaire_de_base?: number;
  etablissement_id: number;
  user?: User | null;
  classes?: TeacherAssignment[];
}
