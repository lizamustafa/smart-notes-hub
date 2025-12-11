import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/lms/DashboardLayout';
import { CourseCard } from '@/components/lms/CourseCard';
import { useLMSData } from '@/hooks/useLMSData';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen } from 'lucide-react';

const TeacherCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getCoursesByTeacher, deleteCourse } = useLMSData();

  const courses = user ? getCoursesByTeacher(user.id) : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Courses</h1>
            <p className="text-muted-foreground">Manage your courses and content</p>
          </div>
          <Button onClick={() => navigate('/courses/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                showEnrollButton={false}
                onView={() => navigate(`/courses/${course.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No courses yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first course and start teaching!
            </p>
            <Button onClick={() => navigate('/courses/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherCourses;
