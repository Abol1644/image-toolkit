import type { CropRect, EditorSettings, ImageSource, Rotation } from '../types'
import { sourceHeight, sourceWidth } from './imageLoader'

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.round(height))
  return canvas
}

export function get2dContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas 2D is not supported in this browser.')
  }
  return ctx
}

export function rotationTransform(rotation: Rotation, flipH: boolean, flipV: boolean): string {
  return `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`
}

export function rotatedSize(width: number, height: number, rotation: Rotation): { width: number; height: number } {
  if (rotation === 90 || rotation === 270) {
    return { width: height, height: width }
  }
  return { width, height }
}

export function rotateFlip(source: ImageSource, rotation: Rotation, flipH: boolean, flipV: boolean): HTMLCanvasElement {
  const w = sourceWidth(source)
  const h = sourceHeight(source)
  const size = rotatedSize(w, h, rotation)
  const canvas = createCanvas(size.width, size.height)
  const ctx = get2dContext(canvas)
  ctx.translate(size.width / 2, size.height / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
  ctx.drawImage(source, -w / 2, -h / 2, w, h)
  return canvas
}

export function cropCanvas(source: CanvasImageSource, rect: CropRect): HTMLCanvasElement {
  const canvas = createCanvas(rect.width, rect.height)
  const ctx = get2dContext(canvas)
  ctx.drawImage(source, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height)
  return canvas
}

export function resizeCanvas(source: CanvasImageSource, width: number, height: number): HTMLCanvasElement {
  const canvas = createCanvas(width, height)
  const ctx = get2dContext(canvas)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, width, height)
  return canvas
}

export function resizedSize(
  currentWidth: number,
  currentHeight: number,
  settings: EditorSettings,
): { width: number; height: number } {
  if (settings.resizeMode === 'percent') {
    const factor = Math.max(1, Math.min(500, settings.percent)) / 100
    return {
      width: Math.max(1, Math.round(currentWidth * factor)),
      height: Math.max(1, Math.round(currentHeight * factor)),
    }
  }
  const width = Math.max(1, Math.round(settings.targetWidth))
  let height = Math.max(1, Math.round(settings.targetHeight))
  if (settings.lockAspect && currentWidth > 0) {
    height = Math.max(1, Math.round(width * (currentHeight / currentWidth)))
  }
  return { width, height }
}
