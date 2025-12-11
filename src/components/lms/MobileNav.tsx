import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Menu,
  X,
  LayoutDashboard,
  BookOpen,
  FileText,
  ClipboardCheck,
  BarChart3,
  LogOut,
  GraduationCap,
  PlusCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const MobileNav = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const teacherLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/courses', icon: BookOpen, label: 'My Courses' },
    { to: '/courses/create', icon: PlusCircle, label: 'Create Course' },
    { to: '/materials', icon: FileText, label: 'Materials' },
    { to: '/quizzes', icon: ClipboardCheck, label: 'Quizzes' },
    { to: '/statistics', icon: BarChart3, label: 'Statistics' },
  ];

  const studentLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/browse', icon: BookOpen, label: 'Browse Courses' },
    { to: '/my-courses', icon: GraduationCap, label: 'My Courses' },
    { to: '/progress', icon: BarChart3, label: 'My Progress' },
  ];

  const links = user?.role === 'teacher' ? teacherLinks : studentLinks;

  return (
    <header className="lg:hidden sticky top-0 z-50 bg-sidebar border-b border-sidebar-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg lms-gradient-bg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">LearnHub</span>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full p-4">
              <div className="flex items-center gap-3 px-4 py-6 mb-6">
                <div className="w-10 h-10 rounded-xl lms-gradient-bg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">LearnHub</span>
              </div>

              <nav className="flex-1 space-y-1">
                {links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'sidebar-item',
                      location.pathname === link.to && 'sidebar-item-active'
                    )}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="pt-4 border-t border-sidebar-border">
                <div className="px-4 py-3 mb-2">
                  <p className="font-medium text-sm">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
