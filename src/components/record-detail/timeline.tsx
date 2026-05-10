import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils/format";

interface TimelineEvent {
  id: string;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  timestamp: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function Timeline({ events, className }: TimelineProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-card text-xs">
              {event.icon ?? "●"}
            </div>
            {index < events.length - 1 && (
              <div className="w-px flex-1 bg-border" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{event.title}</p>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(event.timestamp)}
              </span>
            </div>
            {event.description && (
              <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
