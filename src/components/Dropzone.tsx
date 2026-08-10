import { useRef, useState } from 'react'
import type { DragEvent } from 'react'

interface DropzoneProps {
  onFiles: (files: File[]) => void
  disabled: boolean
}

export default function Dropzone({ onFiles, disabled }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    if (disabled) {
      return
    }
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      onFiles(files)
    }
  }

  return (
    <div
      className={`dropzone ${dragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          inputRef.current?.click()
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          if (files.length > 0) {
            onFiles(files)
          }
          e.target.value = ''
        }}
      />
      <p className="dropzone-title">Click to upload or drag &amp; drop images</p>
      <p className="dropzone-sub">PNG · JPEG · WebP · GIF · BMP — processed locally, never uploaded</p>
    </div>
  )
}
