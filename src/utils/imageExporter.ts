import type { EditorSettings, ImageFormat, ImageSource } from '../types'
import { CROP_ASPECTS, centerCropRect, clampRect } from './imageCrop'
import { sourceHeight, sourceWidth } from './imageLoader'
import {
  cropCanvas,
  createCanvas,
  get2dContext,
  resizeCanvas,
  resizedSize,
  rotatedSize,
  rotateFlip,
} from './imageTransforms'

export const MIME_TYPES: Record<ImageFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
}

export const EXTENSIONS: Record<ImageFormat, string> = {
  png: 'png',
  jpeg: 'jpg',
  webp: 'webp',
}

export function isFormatSupported(format: ImageFormat): boolean {
  const canvas = createCanvas(8, 8)
  const ctx = get2dContext(canvas)
  ctx.fillRect(0, 0, 8, 8)
  try {
    return canvas.toDataURL(MIME_TYPES[format]).startsWith(`data:${MIME_TYPES[format]}`)
  } catch {
    return false
  }
}

export function encodeCanvas(canvas: HTMLCanvasElement, format: ImageFormat, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('could not encode the image.'))
        }
      },
      MIME_TYPES[format],
      quality,
    )
  })
}

export function canvasToDataUrl(canvas: HTMLCanvasElement, format: ImageFormat, quality?: number): string {
  if (quality === undefined || format === 'png') {
    return canvas.toDataURL(MIME_TYPES[format])
  }
  return canvas.toDataURL(MIME_TYPES[format], quality)
}

export function hasAlpha(canvas: HTMLCanvasElement): boolean {
  const ctx = get2dContext(canvas)
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
  for (let i = 3; i < data.data.length; i += 4) {
    if (data.data[i] < 255) {
      return true
    }
  }
  return false
}

export function computeOutputSize(source: ImageSource, settings: EditorSettings): { width: number; height: number } {
  const size = rotatedSize(sourceWidth(source), sourceHeight(source), settings.rotation)
  let width = size.width
  let height = size.height
  if (settings.cropMode === 'precise' && settings.cropRect) {
    width = settings.cropRect.width
    height = settings.cropRect.height
  } else if (settings.cropMode === 'center') {
    const rect = centerCropRect(width, height, CROP_ASPECTS[settings.cropPreset])
    width = rect.width
    height = rect.height
  }
  return resizedSize(width, height, settings)
}

export function processImage(source: ImageSource, settings: EditorSettings): HTMLCanvasElement {
  const rotated = rotateFlip(source, settings.rotation, settings.flipH, settings.flipV)
  let canvas = rotated
  if (settings.cropMode === 'precise' && settings.cropRect) {
    canvas = cropCanvas(rotated, clampRect(settings.cropRect, rotated.width, rotated.height))
  } else if (settings.cropMode === 'center') {
    canvas = cropCanvas(rotated, centerCropRect(rotated.width, rotated.height, CROP_ASPECTS[settings.cropPreset]))
  }
  const size = resizedSize(canvas.width, canvas.height, settings)
  if (size.width !== canvas.width || size.height !== canvas.height) {
    canvas = resizeCanvas(canvas, size.width, size.height)
  }
  return canvas
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
