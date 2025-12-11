import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/lms/DashboardLayout';
import { MaterialList } from '@/components/lms/MaterialList';
import { QuizCard } from '@/components/lms/QuizCard';
import { FileUpload } from '@/components/lms/FileUpload';
import { useLMSData } from '@/hooks/useLMSData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Settings, FileText, ClipboardCheck, Plus, Users, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ManageCourse = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    courses,
    updateCourse,
    deleteCourse,
    getMaterialsByCourse,
    getQuizzesByCourse,
    addMaterial,
    deleteMaterial,
    createQuiz,
    deleteQuiz,
  } = useLMSData();

  const course = courses.find((c) => c.id === id);
  const materials = id ? getMaterialsByCourse(id) : [];
  const quizzes = id ? getQuizzesByCourse(id) : [];

  const [title, setTitle] = useState(course?.title || '');
  const [description, setDescription] = useState(course?.description || '');
  const [materialTitle, setMaterialTitle] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [showMaterialDialog, setShowMaterialDialog] = useState(false);
  const [showQuizDialog, setShowQuizDialog] = useState(false);

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

  const handleUpdateCourse = () => {
    if (!id) return;
    updateCourse(id, { title, description });
    toast({ title: 'Saved!', description: 'Course details have been updated.' });
  };

  const handleFileUpload = (file: File, type: 'pdf' | 'video' | 'document') => {
    if (!id) return;
    addMaterial({
      courseId: id,
      title: materialTitle || file.name,
      type,
      url: URL.createObjectURL(file),
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    });
    toast({ title: 'Uploaded!', description: 'Material has been added to the course.' });
    setMaterialTitle('');
    setShowMaterialDialog(false);
  };

  const handleCreateQuiz = () => {
    if (!id) return;
    createQuiz({
      courseId: id,
      title: quizTitle,
      description: quizDescription,
      timeLimit: 15,
      questions: [
        {
          id: '1',
          text: 'Sample question - edit this quiz to add real questions',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0,
        },
      ],
    });
    toast({ title: 'Created!', description: 'Quiz has been added to the course.' });
    setQuizTitle('');
    setQuizDescription('');
    setShowQuizDialog(false);
  };

  const handleDeleteCourse = () => {
    if (!id) return;
    deleteCourse(id);
    toast({ title: 'Deleted', description: 'Course has been deleted.' });
    navigate('/courses');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/courses')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
          <Button variant="destructive" onClick={handleDeleteCourse}>
            Delete Course
          </Button>
        </div>

        {/* Course Header */}
        <div className="lms-card p-6">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {course.enrolledCount} students
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {course.duration}
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
        </div>

        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="materials" className="gap-2">
              <FileText className="w-4 h-4" />
              Materials
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="gap-2">
              <ClipboardCheck className="w-4 h-4" />
              Quizzes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <div className="lms-card p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={handleUpdateCourse}>Save Changes</Button>
            </div>
          </TabsContent>

          <TabsContent value="materials">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Course Materials</h2>
                <Dialog open={showMaterialDialog} onOpenChange={setShowMaterialDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Material
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Material</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="materialTitle">Title (optional)</Label>
                        <Input
                          id="materialTitle"
                          placeholder="Material title"
                          value={materialTitle}
                          onChange={(e) => setMaterialTitle(e.target.value)}
                        />
                      </div>
                      <FileUpload onUpload={handleFileUpload} />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <MaterialList
                materials={materials}
                isTeacher
                onDelete={(material) => {
                  deleteMaterial(material.id);
                  toast({ title: 'Deleted', description: 'Material has been removed.' });
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="quizzes">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Course Quizzes</h2>
                <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Quiz
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Quiz</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="quizTitle">Quiz Title</Label>
                        <Input
                          id="quizTitle"
                          placeholder="Enter quiz title"
                          value={quizTitle}
                          onChange={(e) => setQuizTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quizDescription">Description</Label>
                        <Textarea
                          id="quizDescription"
                          placeholder="Describe the quiz"
                          value={quizDescription}
                          onChange={(e) => setQuizDescription(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleCreateQuiz} className="w-full">
                        Create Quiz
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizzes.map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    isTeacher
                    onEdit={() => toast({ title: 'Edit', description: 'Quiz editor coming soon!' })}
                    onDelete={() => {
                      deleteQuiz(quiz.id);
                      toast({ title: 'Deleted', description: 'Quiz has been removed.' });
                    }}
                  />
                ))}
              </div>
              {quizzes.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <ClipboardCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No quizzes yet. Create your first quiz!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ManageCourse;
