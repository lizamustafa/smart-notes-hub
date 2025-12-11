import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/lms/DashboardLayout';
import { CourseCard } from '@/components/lms/CourseCard';
import { useLMSData } from '@/hooks/useLMSData';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MyCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getEnrolledCourses } = useLMSData();

  const enrolledCourses = user ? getEnrolledCourses(user.id) : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Courses</h1>
          <p className="text-muted-foreground">Continue your learning journey</p>
        </div>

        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map(({ id, title, description, category, teacherName, duration, enrolledCount, createdAt, updatedAt, teacherId, enrollment }) => (
              <CourseCard
                key={id}
                course={{ id, title, description, category, teacherName, duration, enrolledCount, createdAt, updatedAt, teacherId }}
                isEnrolled
                showEnrollButton={false}
                progress={enrollment.progress}
                onView={() => navigate(`/course/${id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No courses yet</h2>
            <p className="text-muted-foreground mb-6">
              Browse our catalog and enroll in courses to start learning.
            </p>
            <Button onClick={() => navigate('/browse')}>Browse Courses</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyCourses;
