export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  teacherId: string;
  teacherName: string;
  category: string;
  duration: string;
  enrolledCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  enrolledAt: Date;
  progress: number;
  completed: boolean;
}

export interface Material {
  id: string;
  courseId: string;
  title: string;
  type: 'pdf' | 'video' | 'document';
  url: string;
  size?: string;
  uploadedAt: Date;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string;
  timeLimit?: number; // in minutes
  questions: Question[];
  createdAt: Date;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  answers: number[];
  score: number;
  totalQuestions: number;
  completedAt: Date;
}

export interface Progress {
  courseId: string;
  studentId: string;
  completedMaterials: string[];
  quizScores: { quizId: string; score: number; total: number }[];
  overallProgress: number;
  lastAccessedAt: Date;
}
