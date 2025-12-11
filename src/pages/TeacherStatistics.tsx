import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/lms/DashboardLayout';
import { StatCard } from '@/components/lms/StatCard';
import { useLMSData } from '@/hooks/useLMSData';
import { BookOpen, Users, FileText, ClipboardCheck, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const TeacherStatistics = () => {
  const { user } = useAuth();
  const { getTeacherStats, getCoursesByTeacher, enrollments } = useLMSData();

  const stats = user ? getTeacherStats(user.id) : null;
  const courses = user ? getCoursesByTeacher(user.id) : [];

  const categoryData = courses.reduce((acc, course) => {
    const existing = acc.find(item => item.name === course.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: course.category, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const enrollmentData = courses.map(course => ({
    name: course.title.substring(0, 15) + '...',
    students: course.enrolledCount,
  }));

  const COLORS = ['hsl(230, 85%, 60%)', 'hsl(340, 75%, 55%)', 'hsl(160, 70%, 45%)', 'hsl(38, 92%, 50%)'];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Statistics</h1>
          <p className="text-muted-foreground">Overview of your teaching performance</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Courses" value={stats.totalCourses} icon={BookOpen} />
            <StatCard title="Total Students" value={stats.totalStudents} icon={Users} />
            <StatCard title="Materials" value={stats.totalMaterials} icon={FileText} />
            <StatCard title="Quizzes" value={stats.totalQuizzes} icon={ClipboardCheck} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <div className="lms-card p-6">
            <h2 className="text-xl font-semibold mb-6">Courses by Category</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Enrollment Stats */}
          <div className="lms-card p-6">
            <h2 className="text-xl font-semibold mb-6">Students per Course</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="students" fill="hsl(230, 85%, 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Course Performance */}
        <div className="lms-card p-6">
          <h2 className="text-xl font-semibold mb-6">Course Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Course</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Enrolled</th>
                  <th className="text-left py-3 px-4 font-medium">Duration</th>
                  <th className="text-left py-3 px-4 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{course.title}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {course.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">{course.enrolledCount}</td>
                    <td className="py-3 px-4">{course.duration}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherStatistics;
