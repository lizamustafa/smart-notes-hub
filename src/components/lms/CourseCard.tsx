import { Course } from '@/types/lms';
import { Clock, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CourseCardProps {
  course: Course;
  onEnroll?: () => void;
  onView?: () => void;
  isEnrolled?: boolean;
  showEnrollButton?: boolean;
  progress?: number;
}

export const CourseCard = ({
  course,
  onEnroll,
  onView,
  isEnrolled = false,
  showEnrollButton = true,
  progress,
}: CourseCardProps) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Programming: 'bg-primary/10 text-primary',
      Design: 'bg-pink-100 text-pink-700',
      Business: 'bg-accent/10 text-accent',
      Marketing: 'bg-warning/10 text-warning',
    };
    return colors[category] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="course-card group">
      <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <Badge className={getCategoryColor(course.category)}>{course.category}</Badge>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {course.duration}
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            {course.enrolledCount}
          </div>
        </div>

        {progress !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {showEnrollButton && !isEnrolled && (
            <Button onClick={onEnroll} className="flex-1">
              Enroll Now
            </Button>
          )}
          {(isEnrolled || !showEnrollButton) && (
            <Button onClick={onView} variant={isEnrolled ? 'default' : 'outline'} className="flex-1">
              {isEnrolled ? 'Continue Learning' : 'View Details'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
