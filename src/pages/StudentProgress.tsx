import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/lms/DashboardLayout';
import { StatCard } from '@/components/lms/StatCard';
import { useLMSData } from '@/hooks/useLMSData';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, BookOpen, ClipboardCheck, TrendingUp } from 'lucide-react';

const StudentProgress = () => {
  const { user } = useAuth();
  const { getStudentProgress, getEnrolledCourses, getQuizAttempts } = useLMSData();

  const stats = user ? getStudentProgress(user.id) : null;
  const enrolledCourses = user ? getEnrolledCourses(user.id) : [];
  const quizAttempts = user ? getQuizAttempts(user.id) : [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Progress</h1>
          <p className="text-muted-foreground">Track your learning journey</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Enrolled Courses" value={stats.totalCourses} icon={GraduationCap} />
            <StatCard title="Completed" value={stats.completedCourses} icon={BookOpen} />
            <StatCard title="Avg Progress" value={`${Math.round(stats.averageProgress)}%`} icon={TrendingUp} />
            <StatCard title="Avg Quiz Score" value={`${Math.round(stats.averageScore)}%`} icon={ClipboardCheck} />
          </div>
        )}

        {/* Course Progress */}
        <div className="lms-card p-6">
          <h2 className="text-xl font-semibold mb-6">Course Progress</h2>
          <div className="space-y-6">
            {enrolledCourses.map(({ id, title, enrollment }) => (
              <div key={id} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{title}</span>
                  <span className="text-muted-foreground">{enrollment.progress}%</span>
                </div>
                <Progress value={enrollment.progress} className="h-2" />
              </div>
            ))}
            {enrolledCourses.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No courses enrolled yet. Start learning today!
              </p>
            )}
          </div>
        </div>

        {/* Quiz Performance */}
        <div className="lms-card p-6">
          <h2 className="text-xl font-semibold mb-6">Recent Quiz Attempts</h2>
          <div className="space-y-4">
            {quizAttempts.slice(0, 5).map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Quiz #{attempt.quizId}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(attempt.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    {attempt.score}/{attempt.totalQuestions}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round((attempt.score / attempt.totalQuestions) * 100)}%
                  </p>
                </div>
              </div>
            ))}
            {quizAttempts.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No quiz attempts yet. Take a quiz to see your scores!
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentProgress;
