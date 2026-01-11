import { LucideIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  variant?: 'tickets' | 'categories' | 'users' | 'default';
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, icon: Icon, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative mb-6">
        {/* Animated Background Pulse */}
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl animate-pulse scale-150" />

        {/* Animated Icon Container */}
        <div className="relative bg-background border-2 border-primary/20 p-6 rounded-3xl shadow-xl animate-bounce-slow">
          {Icon ? (
            <Icon className="h-12 w-12 text-primary" strokeWidth={1.5} />
          ) : (
            <div className="h-12 w-12 text-primary flex items-center justify-center text-3xl font-bold">
              ?
            </div>
          )}
        </div>
      </div>

      <h3 className="text-xl font-bold tracking-tight mb-2 text-foreground/90">{title}</h3>
      <p className="text-muted-foreground max-w-[280px] mb-8 text-sm leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="rounded-full px-8 h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="mr-2 h-4 w-4 shrink-0" />
          {actionLabel}
        </Button>
      )}

      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(-5%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite;
        }
      `}</style>
    </div>
  );
}
