"use client"

import * as React from "react"
import { X, Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export interface UserOption {
  id: string
  displayName: string | null
  email: string | null
  photoUrl: string | null
  fcmToken: string
}

interface UserAutocompleteProps {
  selected: UserOption[]
  onChange: (users: UserOption[]) => void
  disabled?: boolean
}

function getInitials(name: string | null, email: string | null): string {
  if (name) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }
  if (email) return email[0].toUpperCase()
  return "?"
}

export function UserAutocomplete({
  selected,
  onChange,
  disabled,
}: UserAutocompleteProps) {
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<UserOption[]>([])
  const [loading, setLoading] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  const containerRef = React.useRef<HTMLDivElement>(null)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Outside click closes dropdown
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Debounced search
  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!query.trim()) {
      setResults([])
      setOpen(false)
      setLoading(false)
      return
    }

    setLoading(true)

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/users/search?q=${encodeURIComponent(query.trim())}`
        )
        if (!res.ok) throw new Error("Search failed")
        const data: UserOption[] = await res.json()
        const selectedIds = new Set(selected.map((u) => u.id))
        setResults(data.filter((u) => !selectedIds.has(u.id)))
        setOpen(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, selected])

  function addUser(user: UserOption) {
    onChange([...selected, user])
    setResults((prev) => prev.filter((u) => u.id !== user.id))
    setQuery("")
    setOpen(false)
  }

  function removeUser(userId: string) {
    onChange(selected.filter((u) => u.id !== userId))
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((user) => (
            <Badge
              key={user.id}
              variant="secondary"
              className="gap-1.5 pr-1 pl-1.5"
            >
              <Avatar size="sm" className="size-4">
                {user.photoUrl && (
                  <AvatarImage src={user.photoUrl} alt={user.displayName ?? ""} />
                )}
                <AvatarFallback className="text-[9px]">
                  {getInitials(user.displayName, user.email)}
                </AvatarFallback>
              </Avatar>
              <span className="max-w-[120px] truncate">
                {user.displayName ?? user.email ?? user.id}
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeUser(user.id)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 disabled:pointer-events-none"
                aria-label={`Remove ${user.displayName ?? user.email}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search users…"
          value={query}
          disabled={disabled}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setOpen(true)
          }}
          className="pl-9 pr-9"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-md",
            "max-h-64 overflow-y-auto"
          )}
        >
          {results.map((user) => (
            <button
              key={user.id}
              type="button"
              onMouseDown={(e) => {
                // Prevent blur from closing before click registers
                e.preventDefault()
                addUser(user)
              }}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
            >
              <Avatar size="sm">
                {user.photoUrl && (
                  <AvatarImage src={user.photoUrl} alt={user.displayName ?? ""} />
                )}
                <AvatarFallback>
                  {getInitials(user.displayName, user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {user.displayName ?? "(no name)"}
                </p>
                {user.email && (
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
