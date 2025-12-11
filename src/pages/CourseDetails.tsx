import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/lms/DashboardLayout';
import { MaterialList } from '@/components/lms/MaterialList';
import { QuizCard } from '@/components/lms/QuizCard';
import { QuizTaker } from '@/components/lms/QuizTaker';
import { useLMSData } from '@/hooks/useLMSData';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Clock, Users, BookOpen, FileText, ClipboardCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Quiz } from '@/types/lms';

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    courses,
    getMaterialsByCourse,
    getQuizzesByCourse,
    enrollInCourse,
    isEnrolled,
    submitQuizAttempt,
    getQuizAttempts,
  } = useLMSData();

  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  const course = courses.find((c) => c.id === id);
  const materials = id ? getMaterialsByCourse(id) : [];
  const quizzes = id ? getQuizzesByCourse(id) : [];
  const enrolled = user && id ? isEnrolled(id, user.id) : false;
  const quizAttempts = user ? getQuizAttempts(user.id) : [];

  if (!course) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Course not found</p>
          <Button variant="link" onClick={() => navigate(-1)}>
            Go back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleEnroll = () => {
    if (!user || !id) return;
    enrollInCourse(id, user.id);
    toast({ title: 'Enrolled!', description: 'You have successfully enrolled in the course.' });
  };

  const handleQuizComplete = (answers: number[]) => {
    if (!user || !activeQuiz) return;
    const attempt = submitQuizAttempt(activeQuiz.id, user.id, answers);
    if (attempt) {
      toast({
        title: 'Quiz completed!',
        description: `You scored ${attempt.score}/${attempt.totalQuestions}`,
      });
    }
  };

  const getLastScore = (quizId: string) => {
    const attempt = quizAttempts.find((a) => a.quizId === quizId);
    return attempt ? { score: attempt.score, total: attempt.totalQuestions } : undefined;
  };

  if (activeQuiz) {
    return (
      <DashboardLayout>
        <QuizTaker
          quiz={activeQuiz}
          onComplete={handleQuizComplete}
          onCancel={() => setActiveQuiz(null)}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Course Header */}
        <div className="lms-card p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/3">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg" />
            </div>
            <div className="lg:w-2/3">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full mb-3">
                {course.category}
              </span>
              <h1 className="text-2xl font-bold mb-3">{course.title}</h1>
              <p className="text-muted-foreground mb-4">{course.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {course.duration}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {course.enrolledCount} students
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  {materials.length} materials
                </div>
                <div className="flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4" />
                  {quizzes.length} quizzes
                </div>
              </div>

              {enrolled ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Your progress</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              ) : (
                <Button onClick={handleEnroll} size="lg">
                  Enroll in Course
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Course Content */}
        {enrolled && (
          <Tabs defaultValue="materials" className="space-y-6">
            <TabsList>
              <TabsTrigger value="materials" className="gap-2">
                <FileText className="w-4 h-4" />
                Materials
              </TabsTrigger>
              <TabsTrigger value="quizzes" className="gap-2">
                <ClipboardCheck className="w-4 h-4" />
                Quizzes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="materials">
              <MaterialList
                materials={materials}
                onView={(material) => toast({ title: 'Opening...', description: `Viewing ${material.title}` })}
                onDownload={(material) => toast({ title: 'Downloading...', description: `Downloading ${material.title}` })}
              />
            </TabsContent>

            <TabsContent value="quizzes">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizzes.map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    onStart={() => setActiveQuiz(quiz)}
                    lastScore={getLastScore(quiz.id)}
                  />
                ))}
              </div>
              {quizzes.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <ClipboardCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No quizzes available for this course yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {!enrolled && (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Enroll in this course to access materials and quizzes.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CourseDetails;
