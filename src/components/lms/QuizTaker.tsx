import { useState, useEffect } from 'react';
import { Quiz, Question } from '@/types/lms';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizTakerProps {
  quiz: Quiz;
  onComplete: (answers: number[]) => void;
  onCancel: () => void;
}

export const QuizTaker = ({ quiz, onComplete, onCancel }: QuizTakerProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(quiz.questions.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit ? quiz.timeLimit * 60 : null);
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (timeLeft === null || submitted) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setShowResults(true);
    onComplete(answers.map(a => a ?? -1));
  };

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const answeredCount = answers.filter(a => a !== null).length;

  if (showResults) {
    const score = quiz.questions.reduce((acc, q, idx) => {
      return acc + (q.correctAnswer === answers[idx] ? 1 : 0);
    }, 0);
    const percentage = Math.round((score / quiz.questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto">
        <div className="lms-card p-8 text-center">
          <div className={cn(
            'w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center',
            percentage >= 70 ? 'bg-accent/20' : 'bg-destructive/20'
          )}>
            {percentage >= 70 ? (
              <CheckCircle className="w-12 h-12 text-accent" />
            ) : (
              <XCircle className="w-12 h-12 text-destructive" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
          <p className="text-muted-foreground mb-6">
            {percentage >= 70 ? 'Great job! You passed the quiz.' : 'Keep practicing and try again.'}
          </p>

          <div className="text-5xl font-bold mb-2">
            {score}/{quiz.questions.length}
          </div>
          <p className="text-muted-foreground mb-8">{percentage}% correct</p>

          <div className="space-y-4">
            {quiz.questions.map((q, idx) => (
              <div
                key={q.id}
                className={cn(
                  'p-4 rounded-lg text-left',
                  answers[idx] === q.correctAnswer ? 'bg-accent/10' : 'bg-destructive/10'
                )}
              >
                <p className="font-medium mb-2">{idx + 1}. {q.text}</p>
                <p className="text-sm">
                  Your answer: <span className={cn(
                    'font-medium',
                    answers[idx] === q.correctAnswer ? 'text-accent' : 'text-destructive'
                  )}>
                    {answers[idx] !== null ? q.options[answers[idx]] : 'Not answered'}
                  </span>
                </p>
                {answers[idx] !== q.correctAnswer && (
                  <p className="text-sm text-accent">
                    Correct: {q.options[q.correctAnswer]}
                  </p>
                )}
              </div>
            ))}
          </div>

          <Button onClick={onCancel} className="mt-8">
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{quiz.title}</h2>
          {timeLeft !== null && (
            <div className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              timeLeft < 60 ? 'bg-destructive/10 text-destructive' : 'bg-muted'
            )}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          Question {currentQuestion + 1} of {quiz.questions.length} • {answeredCount} answered
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="lms-card p-6">
            <h3 className="text-lg font-medium mb-6">{question.text}</h3>

            <RadioGroup
              value={answers[currentQuestion]?.toString() ?? ''}
              onValueChange={(value) => handleAnswer(currentQuestion, parseInt(value))}
            >
              <div className="space-y-3">
                {question.options.map((option, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all',
                      answers[currentQuestion] === idx
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                    onClick={() => handleAnswer(currentQuestion, idx)}
                  >
                    <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                    <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          
          {currentQuestion === quiz.questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={answeredCount !== quiz.questions.length}>
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1))}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
