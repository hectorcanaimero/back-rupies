"use client"

import { Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface SchedulePickerProps {
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  scheduledAt: string
  onScheduledAtChange: (value: string) => void
  disabled?: boolean
}

function getMinDatetime(): string {
  const d = new Date(Date.now() + 5 * 60 * 1000)
  // datetime-local expects "YYYY-MM-DDTHH:mm"
  return d.toISOString().slice(0, 16)
}

export function SchedulePicker({
  enabled,
  onEnabledChange,
  scheduledAt,
  onScheduledAtChange,
  disabled,
}: SchedulePickerProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Switch
          id="schedule-toggle"
          checked={enabled}
          onCheckedChange={onEnabledChange}
          disabled={disabled}
        />
        <Label
          htmlFor="schedule-toggle"
          className="flex cursor-pointer items-center gap-2"
        >
          <Clock className="size-4 text-muted-foreground" />
          Agendar envio
        </Label>
      </div>

      {enabled && (
        <div className="space-y-1.5">
          <Input
            type="datetime-local"
            value={scheduledAt}
            min={getMinDatetime()}
            onChange={(e) => onScheduledAtChange(e.target.value)}
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            A notificação será enviada automaticamente na data e hora selecionada
          </p>
        </div>
      )}
    </div>
  )
}
