'use client';

import { TicketTimelineEvent } from '@/lib/api';
import { formatRelativeDate } from '@/lib/utils';
import {
  PlusCircle,
  RefreshCcw,
  UserPlus,
  Tag,
  AlertCircle,
  Clock
} from 'lucide-react';

interface TicketTimelineProps {
  events: TicketTimelineEvent[];
}

export function TicketTimeline({ events }: TicketTimelineProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <PlusCircle className="h-4 w-4 text-green-500" />;
      case 'status_change':
        return <RefreshCcw className="h-4 w-4 text-blue-500" />;
      case 'assignee_change':
        return <UserPlus className="h-4 w-4 text-purple-500" />;
      case 'category_change':
        return <Tag className="h-4 w-4 text-orange-500" />;
      case 'priority_change':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEventDescription = (event: TicketTimelineEvent) => {
    switch (event.type) {
      case 'created':
        return 'Ticket created';
      case 'status_change':
        return (
          <span>
            Changed status from <span className="font-semibold">{event.oldValue}</span> to <span className="font-semibold">{event.newValue}</span>
          </span>
        );
      case 'priority_change':
        return (
          <span>
            Changed priority from <span className="font-semibold">{event.oldValue}</span> to <span className="font-semibold">{event.newValue}</span>
          </span>
        );
      case 'assignee_change':
        return (
          <span>
            {event.newValue ? 'Assigned to someone' : 'Unassigned the ticket'}
          </span>
        );
      case 'category_change':
        return 'Changed category';
      default:
        return 'Performed an action';
    }
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-muted-foreground">
        No activity yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {events.map((event, index) => (
        <div key={event.id} className="relative flex gap-4">
          {index !== events.length - 1 && (
            <div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-border" />
          )}
          <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-sm">
            {getEventIcon(event.type)}
          </div>
          <div className="flex flex-col pt-1">
            <p className="text-sm font-medium leading-none">
              {event.userName}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {getEventDescription(event)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatRelativeDate(event.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
