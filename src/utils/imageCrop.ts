import type { CropPreset, CropRect } from '../types'

export const CROP_ASPECTS: Record<CropPreset, number | null> = {
  free: null,
  '1:1': 1,
  '4:3': 4 / 3,
  '16:9': 16 / 9,
}

export type CropHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

export function clampRect(rect: CropRect, boundsWidth: number, boundsHeight: number): CropRect {
  const width = Math.max(1, Math.min(rect.width, boundsWidth))
  const height = Math.max(1, Math.min(rect.height, boundsHeight))
  return {
    x: Math.min(Math.max(0, rect.x), Math.max(0, boundsWidth - width)),
    y: Math.min(Math.max(0, rect.y), Math.max(0, boundsHeight - height)),
    width,
    height,
  }
}

export function centerCropRect(srcWidth: number, srcHeight: number, aspect: number | null): CropRect {
  if (!aspect || aspect <= 0) {
    return { x: 0, y: 0, width: srcWidth, height: srcHeight }
  }
  let width = srcWidth
  let height = srcHeight
  const srcAspect = srcWidth / srcHeight
  if (srcAspect > aspect) {
    width = srcHeight * aspect
  } else {
    height = srcWidth / aspect
  }
  width = Math.floor(width)
  height = Math.floor(height)
  return {
    x: Math.round((srcWidth - width) / 2),
    y: Math.round((srcHeight - height) / 2),
    width,
    height,
  }
}

export function moveRect(
  rect: CropRect,
  dx: number,
  dy: number,
  boundsWidth: number,
  boundsHeight: number,
): CropRect {
  return clampRect({ x: rect.x + dx, y: rect.y + dy, width: rect.width, height: rect.height }, boundsWidth, boundsHeight)
}

const MIN_CROP = 16

function fitRectToBounds(
  rect: CropRect,
  aspect: number | null,
  boundsWidth: number,
  boundsHeight: number,
): CropRect {
  let { x, y, width, height } = rect
  width = Math.max(MIN_CROP, Math.min(width, boundsWidth))
  height = Math.max(MIN_CROP, Math.min(height, boundsHeight))
  if (aspect && aspect > 0) {
    if (height > width / aspect) {
      height = Math.max(MIN_CROP, width / aspect)
      if (height > boundsHeight) {
        height = boundsHeight
        width = Math.max(MIN_CROP, height * aspect)
      }
    } else {
      width = Math.max(MIN_CROP, height * aspect)
      if (width > boundsWidth) {
        width = boundsWidth
        height = Math.max(MIN_CROP, width / aspect)
      }
    }
    width = Math.min(width, boundsWidth)
    height = Math.min(height, boundsHeight)
  }
  x = Math.min(Math.max(0, x), Math.max(0, boundsWidth - width))
  y = Math.min(Math.max(0, y), Math.max(0, boundsHeight - height))
  return { x, y, width, height }
}

export function resizeRect(
  rect: CropRect,
  handle: CropHandle,
  dx: number,
  dy: number,
  aspect: number | null,
  boundsWidth: number,
  boundsHeight: number,
): CropRect {
  const isN = handle.includes('n')
  const isS = handle.includes('s')
  const isW = handle.includes('w')
  const isE = handle.includes('e')

  if (aspect && aspect > 0 && isN !== isS && isW !== isE) {
    const rawW = rect.width + (isW ? -dx : dx)
    const rawH = rect.height + (isS ? dy : -dy)
    let width = rawW
    let height = rawH
    if (Math.abs(rawW - rect.width) >= Math.abs(rawH - rect.height)) {
      height = width / aspect
    } else {
      width = height * aspect
    }
    width = Math.max(MIN_CROP, width)
    height = Math.max(MIN_CROP, height)
    const x = isW ? rect.x + rect.width - width : rect.x
    const y = isN ? rect.y + rect.height - height : rect.y
    return fitRectToBounds({ x, y, width, height }, aspect, boundsWidth, boundsHeight)
  }

  if (isN !== isS && isW !== isE) {
    const width = Math.max(MIN_CROP, rect.width + (isW ? -dx : dx))
    const height = Math.max(MIN_CROP, rect.height + (isS ? dy : -dy))
    const x = isW ? rect.x + rect.width - width : rect.x
    const y = isN ? rect.y + rect.height - height : rect.y
    return fitRectToBounds({ x, y, width, height }, aspect, boundsWidth, boundsHeight)
  }

  if (isW || isE) {
    let width = Math.max(MIN_CROP, rect.width + (isW ? -dx : dx))
    if (aspect && aspect > 0) {
      const height = Math.max(MIN_CROP, width / aspect)
      width = height * aspect
      const x = isW ? rect.x + rect.width - width : rect.x
      const y = rect.y + (rect.height - height) / 2
      return fitRectToBounds({ x, y, width, height }, aspect, boundsWidth, boundsHeight)
    }
    const x = isW ? rect.x + rect.width - width : rect.x
    return fitRectToBounds({ x, y: rect.y, width, height: rect.height }, null, boundsWidth, boundsHeight)
  }

  if (isN || isS) {
    let height = Math.max(MIN_CROP, rect.height + (isS ? dy : -dy))
    if (aspect && aspect > 0) {
      const width = Math.max(MIN_CROP, height * aspect)
      height = width / aspect
      const x = rect.x + (rect.width - width) / 2
      const y = isN ? rect.y + rect.height - height : rect.y
      return fitRectToBounds({ x, y, width, height }, aspect, boundsWidth, boundsHeight)
    }
    const y = isN ? rect.y + rect.height - height : rect.y
    return fitRectToBounds({ x: rect.x, y, width: rect.width, height }, null, boundsWidth, boundsHeight)
  }

  return rect
}
