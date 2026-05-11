"use client"

import { useRef, useState } from "react"
import { ImageIcon, Loader2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function upload(file: File) {
    setLoading(true)
    setError(null)

    try {
      const form = new FormData()
      form.append("file", file)

      const res = await fetch("/api/storage/upload", {
        method: "POST",
        body: form,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message ?? `Upload failed (${res.status})`)
      }

      const data = await res.json()
      onChange(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) upload(file)
    // reset input so the same file can be re-selected after removal
    e.target.value = ""
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    if (disabled || loading) return
    const file = e.dataTransfer.files?.[0]
    if (file) upload(file)
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    if (!disabled && !loading) setDragging(true)
  }

  function handleDragLeave() {
    setDragging(false)
  }

  function handleRemove() {
    onChange("")
    setError(null)
  }

  // Preview state
  if (value) {
    return (
      <div className="relative w-full overflow-hidden rounded-lg border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt="Uploaded image"
          className="h-48 w-full object-cover"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-2 top-2 bg-background/80 hover:bg-background"
          onClick={handleRemove}
          disabled={disabled}
          aria-label="Remove image"
        >
          <X />
        </Button>
      </div>
    )
  }

  // Upload zone
  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={disabled || loading ? -1 : 0}
        aria-label="Upload image"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !loading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            if (!disabled && !loading) inputRef.current?.click()
          }
        }}
        className={cn(
          "flex h-48 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed transition-colors",
          dragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50",
          (disabled || loading) && "cursor-not-allowed opacity-60",
        )}
      >
        {loading ? (
          <>
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Uploading…</p>
          </>
        ) : (
          <>
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              {dragging ? (
                <ImageIcon className="size-6 text-primary" />
              ) : (
                <Upload className="size-6 text-muted-foreground" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                {dragging ? "Drop to upload" : "Click or drag image here"}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF, WebP
              </p>
            </div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled || loading}
        onChange={handleFileChange}
      />

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
