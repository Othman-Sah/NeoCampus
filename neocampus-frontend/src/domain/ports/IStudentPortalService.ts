import { StudentDashboardData } from '../entities/StudentDashboardData';
import { ChildGrade } from '../entities/ChildGrade';
import { ChildAttendance } from '../entities/ChildAttendance';
import { Seance } from '../entities/Seance';
import { CourseSupport } from '../entities/CourseSupport';
import { Homework } from '../entities/Homework';

export interface IStudentPortalService {
  getDashboard(): Promise<StudentDashboardData>;
  getMyGrades(): Promise<ChildGrade[]>;
  getMyAttendance(params?: { start_date?: string; end_date?: string }): Promise<ChildAttendance[]>;
  getMyTimetable(): Promise<Seance[]>;
  getMySupports(): Promise<CourseSupport[]>;
  getMyHomework(): Promise<Homework[]>;
  getMyLoans(): Promise<any[]>;
}
