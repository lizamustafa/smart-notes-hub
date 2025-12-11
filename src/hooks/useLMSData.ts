import { useState, useCallback } from 'react';
import { Course, Material, Quiz, Enrollment, QuizAttempt, Progress } from '@/types/lms';
import { v4 as uuidv4 } from 'uuid';

// Initial mock data
const initialCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to React',
    description: 'Learn the fundamentals of React including components, state, props, and hooks.',
    category: 'Programming',
    teacherId: '1',
    teacherName: 'John Teacher',
    duration: '8 hours',
    enrolledCount: 156,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: '2',
    title: 'Advanced TypeScript',
    description: 'Master TypeScript with advanced types, generics, and best practices.',
    category: 'Programming',
    teacherId: '1',
    teacherName: 'John Teacher',
    duration: '12 hours',
    enrolledCount: 89,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-05'),
  },
  {
    id: '3',
    title: 'UI/UX Design Principles',
    description: 'Learn design thinking, wireframing, and creating beautiful user interfaces.',
    category: 'Design',
    teacherId: '1',
    teacherName: 'John Teacher',
    duration: '6 hours',
    enrolledCount: 234,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-10'),
  },
];

const initialMaterials: Material[] = [
  { id: '1', courseId: '1', title: 'React Basics PDF', type: 'pdf', url: '#', size: '2.4 MB', uploadedAt: new Date() },
  { id: '2', courseId: '1', title: 'Components Tutorial', type: 'video', url: '#', size: '156 MB', uploadedAt: new Date() },
  { id: '3', courseId: '2', title: 'TypeScript Handbook', type: 'pdf', url: '#', size: '5.1 MB', uploadedAt: new Date() },
];

const initialQuizzes: Quiz[] = [
  {
    id: '1',
    courseId: '1',
    title: 'React Fundamentals Quiz',
    description: 'Test your knowledge of React basics',
    timeLimit: 15,
    createdAt: new Date(),
    questions: [
      { id: '1', text: 'What is React?', options: ['A database', 'A JavaScript library', 'A programming language', 'An operating system'], correctAnswer: 1 },
      { id: '2', text: 'What hook is used for state in functional components?', options: ['useEffect', 'useState', 'useContext', 'useReducer'], correctAnswer: 1 },
      { id: '3', text: 'JSX stands for?', options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript Extension'], correctAnswer: 0 },
    ],
  },
];

const initialEnrollments: Enrollment[] = [
  { id: '1', courseId: '1', studentId: '2', enrolledAt: new Date(), progress: 45, completed: false },
  { id: '2', courseId: '2', studentId: '2', enrolledAt: new Date(), progress: 20, completed: false },
];

export const useLMSData = () => {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(initialEnrollments);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);

  // Course operations
  const createCourse = useCallback((course: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'enrolledCount'>) => {
    const newCourse: Course = {
      ...course,
      id: uuidv4(),
      enrolledCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCourses(prev => [...prev, newCourse]);
    return newCourse;
  }, []);

  const updateCourse = useCallback((id: string, updates: Partial<Course>) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c));
  }, []);

  const deleteCourse = useCallback((id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    setMaterials(prev => prev.filter(m => m.courseId !== id));
    setQuizzes(prev => prev.filter(q => q.courseId !== id));
  }, []);

  const getCoursesByTeacher = useCallback((teacherId: string) => {
    return courses.filter(c => c.teacherId === teacherId);
  }, [courses]);

  // Enrollment operations
  const enrollInCourse = useCallback((courseId: string, studentId: string) => {
    const exists = enrollments.some(e => e.courseId === courseId && e.studentId === studentId);
    if (exists) return false;

    const newEnrollment: Enrollment = {
      id: uuidv4(),
      courseId,
      studentId,
      enrolledAt: new Date(),
      progress: 0,
      completed: false,
    };
    setEnrollments(prev => [...prev, newEnrollment]);
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, enrolledCount: c.enrolledCount + 1 } : c));
    return true;
  }, [enrollments]);

  const getEnrolledCourses = useCallback((studentId: string) => {
    const enrolled = enrollments.filter(e => e.studentId === studentId);
    return enrolled.map(e => ({
      ...courses.find(c => c.id === e.courseId)!,
      enrollment: e,
    })).filter(c => c.id);
  }, [courses, enrollments]);

  const isEnrolled = useCallback((courseId: string, studentId: string) => {
    return enrollments.some(e => e.courseId === courseId && e.studentId === studentId);
  }, [enrollments]);

  // Material operations
  const addMaterial = useCallback((material: Omit<Material, 'id' | 'uploadedAt'>) => {
    const newMaterial: Material = {
      ...material,
      id: uuidv4(),
      uploadedAt: new Date(),
    };
    setMaterials(prev => [...prev, newMaterial]);
    return newMaterial;
  }, []);

  const deleteMaterial = useCallback((id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  }, []);

  const getMaterialsByCourse = useCallback((courseId: string) => {
    return materials.filter(m => m.courseId === courseId);
  }, [materials]);

  // Quiz operations
  const createQuiz = useCallback((quiz: Omit<Quiz, 'id' | 'createdAt'>) => {
    const newQuiz: Quiz = {
      ...quiz,
      id: uuidv4(),
      createdAt: new Date(),
    };
    setQuizzes(prev => [...prev, newQuiz]);
    return newQuiz;
  }, []);

  const deleteQuiz = useCallback((id: string) => {
    setQuizzes(prev => prev.filter(q => q.id !== id));
  }, []);

  const getQuizzesByCourse = useCallback((courseId: string) => {
    return quizzes.filter(q => q.courseId === courseId);
  }, [quizzes]);

  const submitQuizAttempt = useCallback((quizId: string, studentId: string, answers: number[]) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return null;

    const score = quiz.questions.reduce((acc, q, idx) => {
      return acc + (q.correctAnswer === answers[idx] ? 1 : 0);
    }, 0);

    const attempt: QuizAttempt = {
      id: uuidv4(),
      quizId,
      studentId,
      answers,
      score,
      totalQuestions: quiz.questions.length,
      completedAt: new Date(),
    };
    setQuizAttempts(prev => [...prev, attempt]);
    return attempt;
  }, [quizzes]);

  const getQuizAttempts = useCallback((studentId: string) => {
    return quizAttempts.filter(a => a.studentId === studentId);
  }, [quizAttempts]);

  // Progress & Statistics
  const getStudentProgress = useCallback((studentId: string) => {
    const enrolled = getEnrolledCourses(studentId);
    const attempts = getQuizAttempts(studentId);
    
    return {
      totalCourses: enrolled.length,
      completedCourses: enrolled.filter(e => e.enrollment.completed).length,
      averageProgress: enrolled.length ? enrolled.reduce((acc, e) => acc + e.enrollment.progress, 0) / enrolled.length : 0,
      totalQuizzes: attempts.length,
      averageScore: attempts.length ? attempts.reduce((acc, a) => acc + (a.score / a.totalQuestions) * 100, 0) / attempts.length : 0,
    };
  }, [getEnrolledCourses, getQuizAttempts]);

  const getTeacherStats = useCallback((teacherId: string) => {
    const teacherCourses = getCoursesByTeacher(teacherId);
    const courseIds = teacherCourses.map(c => c.id);
    const totalStudents = enrollments.filter(e => courseIds.includes(e.courseId)).length;
    
    return {
      totalCourses: teacherCourses.length,
      totalStudents,
      totalMaterials: materials.filter(m => courseIds.includes(m.courseId)).length,
      totalQuizzes: quizzes.filter(q => courseIds.includes(q.courseId)).length,
    };
  }, [getCoursesByTeacher, enrollments, materials, quizzes]);

  return {
    courses,
    materials,
    quizzes,
    enrollments,
    quizAttempts,
    createCourse,
    updateCourse,
    deleteCourse,
    getCoursesByTeacher,
    enrollInCourse,
    getEnrolledCourses,
    isEnrolled,
    addMaterial,
    deleteMaterial,
    getMaterialsByCourse,
    createQuiz,
    deleteQuiz,
    getQuizzesByCourse,
    submitQuizAttempt,
    getQuizAttempts,
    getStudentProgress,
    getTeacherStats,
  };
};
