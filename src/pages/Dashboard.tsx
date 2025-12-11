import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/lms/DashboardLayout';
import { StatCard } from '@/components/lms/StatCard';
import { CourseCard } from '@/components/lms/CourseCard';
import { useLMSData } from '@/hooks/useLMSData';
import { BookOpen, Users, FileText, ClipboardCheck, GraduationCap, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    courses,
    getTeacherStats,
    getStudentProgress,
    getEnrolledCourses,
    getCoursesByTeacher,
    enrollInCourse,
    isEnrolled,
  } = useLMSData();

  const isTeacher = user?.role === 'teacher';
  
  const teacherStats = isTeacher ? getTeacherStats(user.id) : null;
  const studentStats = !isTeacher && user ? getStudentProgress(user.id) : null;
  const enrolledCourses = !isTeacher && user ? getEnrolledCourses(user.id) : [];
  const teacherCourses = isTeacher ? getCoursesByTeacher(user.id) : [];

  const handleEnroll = (courseId: string) => {
    if (!user) return;
    enrollInCourse(courseId, user.id);
    toast({ title: 'Enrolled!', description: 'You have successfully enrolled in the course.' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            {isTeacher
              ? 'Manage your courses and track student progress'
              : 'Continue learning and track your progress'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isTeacher && teacherStats ? (
            <>
              <StatCard title="Total Courses" value={teacherStats.totalCourses} icon={BookOpen} />
              <StatCard title="Total Students" value={teacherStats.totalStudents} icon={Users} />
              <StatCard title="Materials Uploaded" value={teacherStats.totalMaterials} icon={FileText} />
              <StatCard title="Quizzes Created" value={teacherStats.totalQuizzes} icon={ClipboardCheck} />
            </>
          ) : studentStats ? (
            <>
              <StatCard title="Enrolled Courses" value={studentStats.totalCourses} icon={GraduationCap} />
              <StatCard title="Completed" value={studentStats.completedCourses} icon={BookOpen} />
              <StatCard title="Avg Progress" value={`${Math.round(studentStats.averageProgress)}%`} icon={BarChart3} />
              <StatCard title="Avg Quiz Score" value={`${Math.round(studentStats.averageScore)}%`} icon={ClipboardCheck} />
            </>
          ) : null}
        </div>

        {/* Courses Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {isTeacher ? 'Your Courses' : 'Continue Learning'}
            </h2>
            <button
              onClick={() => navigate(isTeacher ? '/courses' : '/browse')}
              className="text-primary text-sm font-medium hover:underline"
            >
              View all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isTeacher
              ? teacherCourses.slice(0, 3).map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    showEnrollButton={false}
                    onView={() => navigate(`/courses/${course.id}`)}
                  />
                ))
              : enrolledCourses.length > 0
              ? enrolledCourses.slice(0, 3).map(({ id, title, description, category, teacherName, duration, enrolledCount, createdAt, updatedAt, teacherId, enrollment }) => (
                  <CourseCard
                    key={id}
                    course={{ id, title, description, category, teacherName, duration, enrolledCount, createdAt, updatedAt, teacherId }}
                    isEnrolled
                    showEnrollButton={false}
                    progress={enrollment.progress}
                    onView={() => navigate(`/course/${id}`)}
                  />
                ))
              : courses.slice(0, 3).map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={user ? isEnrolled(course.id, user.id) : false}
                    onEnroll={() => handleEnroll(course.id)}
                    onView={() => navigate(`/course/${course.id}`)}
                  />
                ))}
          </div>

          {!isTeacher && enrolledCourses.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              You haven't enrolled in any courses yet. Browse our catalog to get started!
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
