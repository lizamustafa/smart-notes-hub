import { Quiz } from '@/types/lms';
import { Clock, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface QuizCardProps {
  quiz: Quiz;
  onStart?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isTeacher?: boolean;
  lastScore?: { score: number; total: number };
}

export const QuizCard = ({ quiz, onStart, onEdit, onDelete, isTeacher = false, lastScore }: QuizCardProps) => {
  return (
    <div className="lms-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{quiz.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{quiz.description}</p>
        </div>
        {lastScore && (
          <Badge variant={lastScore.score / lastScore.total >= 0.7 ? 'default' : 'secondary'}>
            {lastScore.score}/{lastScore.total}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4" />
          {quiz.questions.length} questions
        </div>
        {quiz.timeLimit && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {quiz.timeLimit} min
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {isTeacher ? (
          <>
            <Button variant="outline" onClick={onEdit} className="flex-1">
              Edit
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          </>
        ) : (
          <Button onClick={onStart} className="w-full">
            {lastScore ? 'Retake Quiz' : 'Start Quiz'}
          </Button>
        )}
      </div>
    </div>
  );
};
