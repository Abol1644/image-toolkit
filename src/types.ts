export type ExportFormat = 'png' | 'jpeg' | 'webp' | 'pdf'

export type ImageFormat = Exclude<ExportFormat, 'pdf'>

export type CropPreset = 'free' | '1:1' | '4:3' | '16:9'

export type CropMode = 'none' | 'precise' | 'center'

export type ResizeMode = 'dimensions' | 'percent'

export type Rotation = 0 | 90 | 180 | 270

export type ImageSource = ImageBitmap | HTMLCanvasElement | HTMLImageElement

export interface CropRect {
  x: number
  y: number
  width: number
  height: number
}

export interface EditorSettings {
  resizeMode: ResizeMode
  targetWidth: number
  targetHeight: number
  lockAspect: boolean
  percent: number
  rotation: Rotation
  flipH: boolean
  flipV: boolean
  cropMode: CropMode
  cropPreset: CropPreset
  cropRect: CropRect | null
  format: ExportFormat
  quality: number
}

export interface ImageFileRecord {
  id: string
  name: string
  file: File
  url: string
  width: number
  height: number
  source: ImageSource
}

export interface ProcessedItem {
  canvas: HTMLCanvasElement
  name: string
  width: number
  height: number
}
