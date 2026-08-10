import { useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { CropRect, ImageFileRecord, Rotation } from '../types'
import { moveRect, resizeRect } from '../utils/imageCrop'
import type { CropHandle } from '../utils/imageCrop'
import { rotationTransform } from '../utils/imageTransforms'

function fitWithin(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const scale = Math.min(maxWidth / width, maxHeight / height, 1)
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

const HANDLES: CropHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']

const CURSORS: Record<CropHandle, string> = {
  nw: 'nwse-resize',
  n: 'ns-resize',
  ne: 'nesw-resize',
  e: 'ew-resize',
  se: 'nwse-resize',
  s: 'ns-resize',
  sw: 'nesw-resize',
  w: 'ew-resize',
}

interface CropAreaProps {
  image: ImageFileRecord
  rotation: Rotation
  flipH: boolean
  flipV: boolean
  rect: CropRect
  aspect: number | null
  interactive: boolean
  hideOverlay: boolean
  maxWidth: number
  maxHeight: number
  onRectChange: (rect: CropRect) => void
}

export default function CropArea({
  image,
  rotation,
  flipH,
  flipV,
  rect,
  aspect,
  interactive,
  hideOverlay,
  maxWidth,
  maxHeight,
  onRectChange,
}: CropAreaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{
    mode: 'move' | CropHandle
    startX: number
    startY: number
    startRect: CropRect
    scale: number
  } | null>(null)

  const swap = rotation === 90 || rotation === 270
  const naturalW = image.width
  const naturalH = image.height
  const postW = swap ? naturalH : naturalW
  const postH = swap ? naturalW : naturalH
  const fit = fitWithin(postW, postH, maxWidth, maxHeight)
  const scale = fit.width / postW

  const beginDrag = (e: ReactPointerEvent<HTMLElement>, mode: 'move' | CropHandle) => {
    if (!interactive) {
      return
    }
    e.preventDefault()
    e.stopPropagation()
    const container = containerRef.current
    if (!container) {
      return
    }
    const box = container.getBoundingClientRect()
    dragRef.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      startRect: rect,
      scale: postW / box.width,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handleMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) {
      return
    }
    const dx = (e.clientX - drag.startX) / drag.scale
    const dy = (e.clientY - drag.startY) / drag.scale
    const next =
      drag.mode === 'move'
        ? moveRect(drag.startRect, dx, dy, postW, postH)
        : resizeRect(drag.startRect, drag.mode, dx, dy, aspect, postW, postH)
    onRectChange(next)
  }

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current) {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
      dragRef.current = null
    }
  }

  const resetToFull = () => {
    if (interactive) {
      onRectChange({ x: 0, y: 0, width: postW, height: postH })
    }
  }

  return (
    <div
      ref={containerRef}
      className="crop-area"
      style={{ width: fit.width, height: fit.height }}
      onPointerMove={handleMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <img
        className="crop-area-img"
        src={image.url}
        alt=""
        draggable={false}
        style={{
          width: naturalW * scale,
          height: naturalH * scale,
          transform: `translate(-50%, -50%) ${rotationTransform(rotation, flipH, flipV)}`,
        }}
      />
      {!hideOverlay && (
        <div
          className="crop-overlay"
          style={{
            left: rect.x * scale,
            top: rect.y * scale,
            width: rect.width * scale,
            height: rect.height * scale,
          }}
          onPointerDown={(e) => beginDrag(e, 'move')}
          onDoubleClick={resetToFull}
        >
          <span className="crop-size-label">
            {Math.round(rect.width)} × {Math.round(rect.height)}
          </span>
          {interactive &&
            HANDLES.map((handle) => (
              <button
                key={handle}
                type="button"
                className={`crop-handle crop-handle-${handle}`}
                style={{ cursor: CURSORS[handle] }}
                aria-label={`Resize crop from ${handle}`}
                onPointerDown={(e) => beginDrag(e, handle)}
              />
            ))}
        </div>
      )}
    </div>
  )
}
