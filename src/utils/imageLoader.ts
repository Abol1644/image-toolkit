import type { ImageSource } from '../types'

export function closeSource(source: ImageSource): void {
  if (source instanceof ImageBitmap) {
    source.close()
  }
}

export async function loadImageSource(file: File): Promise<ImageSource> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file)
    } catch {
      return loadViaImageElement(file)
    }
  }
  return loadViaImageElement(file)
}

function loadViaImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('could not decode this image.'))
    }
    img.src = url
  })
}

export function sourceWidth(source: ImageSource): number {
  return source instanceof HTMLImageElement ? source.naturalWidth : source.width
}

export function sourceHeight(source: ImageSource): number {
  return source instanceof HTMLImageElement ? source.naturalHeight : source.height
}
